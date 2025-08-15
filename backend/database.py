"""
Database utilities for the AI Tutor Backend
"""
import os
from dotenv import load_dotenv
import logging
from datetime import datetime, timezone

# Load environment variables from the correct .env file
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Database manager for Supabase operations"""

    def __init__(self):
        self.supabase_url = os.getenv('REACT_APP_SUPABASE_URL')
        self.supabase_key = os.getenv('REACT_APP_SERVICE_ROLE')
        self.use_mock = False
        if not self.supabase_url or not self.supabase_key:
            # Degraded mode: allow startup without external Supabase (development fallback)
            logger.warning("Supabase configuration missing – running in in-memory mock mode (development only)")
            self.use_mock = True
            self._mock_users = []
            self._mock_chat_sessions = []

        self._supabase = None

    @property
    def supabase(self):
        """Lazy-load the Supabase client without realtime and with error handling"""
        if self.use_mock:
            # Provide a very small shim with table() returning object whose execute() yields .data
            class _MockResult:
                def __init__(self, data): self.data = data
            class _MockTable:
                def __init__(self, parent, name): self.parent=parent; self.name=name; self._filters=[]; self._insert=None; self._update=None
                def select(self, *_a, **_k): return self
                def eq(self, col, val): self._filters.append((col,val)); return self
                def insert(self, data): self._insert = data; return self
                def update(self, data): self._update = data; return self
                def execute(self):
                    if self.name == 'users':
                        # inserts
                        if self._insert is not None:
                            item = dict(self._insert)
                            if 'id' not in item:
                                import uuid; item['id']=str(uuid.uuid4())
                            self.parent._mock_users.append(item)
                            return _MockResult([item])
                        # selects
                        data = self.parent._mock_users
                        for col,val in self._filters:
                            data = [u for u in data if u.get(col)==val]
                        return _MockResult(data)
                    return _MockResult([])
            class _MockClient:
                def __init__(self, parent): self.parent=parent
                def table(self, name): return _MockTable(self.parent, name)
            if self._supabase is None:
                self._supabase = _MockClient(self)
            return self._supabase
        # Real client path
        if self._supabase is None:
            try:
                from supabase import create_client
                self._supabase = create_client(self.supabase_url, self.supabase_key)
                logger.info("Supabase client created")
            except Exception as e:
                logger.error(f"Failed to create Supabase client: {e}")
                raise
        return self._supabase

    def get_user_by_id(self, user_id: str):
        """Get user by ID"""
        try:
            response = self.supabase.table('users').select('*').eq('id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting user by ID: {e}")
            return None

    def get_user_by_email(self, email: str):
        """Get user by email"""
        if self.use_mock:
            return next((u for u in self._mock_users if u.get('email')==email), None)
        try:
            response = self.supabase.table('users').select('*').eq('email', email).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            return None

    def create_user(self, user_data):
        """Create a new user"""
        try:
            # Remove potentially problematic fields if they don't exist in the schema
            safe_user_data = {
                'name': user_data.get('name'),
                'email': user_data.get('email'),
                'role': user_data.get('role', 'student'),
                'password': user_data.get('password')
            }

            # Only add these fields if they were provided
            if 'phone' in user_data:
                safe_user_data['phone'] = user_data['phone']
            if 'address' in user_data:
                safe_user_data['address'] = user_data['address']

            # Insert the user with only the essential fields
            # Prefer native supabase insert if available
            try:
                resp = self.supabase.table('users').insert(safe_user_data).execute()
                # Supabase returns list of inserted rows
                if hasattr(resp, 'data') and resp.data:
                    return resp.data[0]
            except Exception as inner_e:
                logger.error(f"Supabase insert path failed, falling back: {inner_e}")

            # Fallback to raw SQL if execute_query exists (legacy path)
            if hasattr(self, 'execute_query'):
                try:
                    insert_query = (
                        "INSERT INTO users (name, email, role, password) "
                        "VALUES (%s, %s, %s, %s) RETURNING id, name, email, role, created_at"
                    )
                    values = (
                        safe_user_data['name'],
                        safe_user_data['email'],
                        safe_user_data['role'],
                        safe_user_data['password']
                    )
                    result = self.execute_query(insert_query, values, fetch_one=True)  # type: ignore
                    if result:
                        return result
                except Exception as raw_e:
                    logger.error(f"Raw SQL fallback failed: {raw_e}")

            return None

        except Exception as e:
            print(f"Error creating user: {e}")
            return None

    def update_user(self, user_id: str, updates: dict):
        """Update user information"""
        try:
            response = self.supabase.table('users').update(updates).eq('id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            return None

    def create_subject(self, subject_data: dict):
        """Create a new subject"""
        try:
            response = self.supabase.table('subjects').insert(subject_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating subject: {e}")
            return None

    def get_subjects(self):
        """Get all subjects"""
        try:
            response = self.supabase.table('subjects').select('*').execute()
            return response.data
        except Exception as e:
            logger.error(f"Error getting subjects: {e}")
            return []

    def get_subject_by_id(self, subject_id: str):
        """Get a subject by ID"""
        try:
            response = self.supabase.table('subjects').select('*').eq('id', subject_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting subject by ID: {e}")
            return None

    def update_subject(self, subject_id: str, updates: dict):
        """Update a subject"""
        try:
            response = self.supabase.table('subjects').update(updates).eq('id', subject_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating subject: {e}")
            return None

    def delete_subject(self, subject_id: str):
        """Delete a subject"""
        try:
            response = self.supabase.table('subjects').delete().eq('id', subject_id).execute()
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            logger.error(f"Error deleting subject: {e}")
            return False

    def get_courses_by_subject(self, subject_id: str):
        """Get courses that use a specific subject"""
        try:
            response = self.supabase.table('courses').select('*').eq('subject_id', subject_id).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error getting courses by subject: {e}")
            return []

    def create_course(self, course_data: dict):
        """Create a new course with duplicate check"""
        try:
            # Check for duplicate course title for the same instructor
            title = course_data.get('title', '').strip().lower()
            instructor_id = str(course_data.get('instructor_id'))
            existing = self.supabase.table('courses').select('*').eq('title', course_data['title']).eq('instructor_id', instructor_id).execute()
            if existing.data and len(existing.data) > 0:
                logger.error(f"Duplicate course title '{course_data['title']}' for instructor {instructor_id}")
                return None
            response = self.supabase.table('courses').insert(course_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating course: {e}")
            return None

    def get_courses(self):
        """Get all courses"""
        try:
            response = self.supabase.table('courses').select('*').execute()
            return response.data
        except Exception as e:
            logger.error(f"Error getting courses: {e}")
            return []

    def get_course_by_id(self, course_id: str):
        """Get course by ID"""
        try:
            response = self.supabase.table('courses').select('*').eq('id', course_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting course by ID: {e}")
            return None

    def get_course_enrollments(self, course_id: str):
        """Get all students enrolled in a course"""
        try:
            response = self.supabase.table('course_enrollments').select('''
                student_id,
                enrolled_at,
                users(id, name, email)
            ''').eq('course_id', course_id).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error getting course enrollments: {e}")
            return []

    def update_course(self, course_id: str, updates: dict):
        """Update a course with validation and duplicate check"""
        try:
            # Check if course exists
            existing_course = self.get_course_by_id(course_id)
            if not existing_course:
                logger.error(f"Course {course_id} not found")
                return None
            
            # If title is being updated, check for duplicates (same instructor)
            if 'title' in updates and updates['title']:
                title = updates['title'].strip().lower()
                instructor_id = str(existing_course.get('instructor_id'))
                
                # Check for duplicate course titles for the same instructor
                existing_courses = self.supabase.table('courses').select('*').eq('instructor_id', instructor_id).execute()
                for course in existing_courses.data:
                    if (course.get('title', '').strip().lower() == title and 
                        str(course.get('id')) != course_id):
                        logger.error(f"Duplicate course title '{updates['title']}' for instructor {instructor_id}")
                        return None
            
            # Add updated_at timestamp
            updates['updated_at'] = 'now()'
            
            # Update the course
            response = self.supabase.table('courses').update(updates).eq('id', course_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating course: {e}")
            return None

    def delete_course(self, course_id: str):
        """Delete a course and all related data (cascade delete)"""
        try:
            # Check if course exists
            existing_course = self.get_course_by_id(course_id)
            if not existing_course:
                logger.error(f"Course {course_id} not found")
                return False
            
            # Due to foreign key constraints with CASCADE DELETE, 
            # deleting the course will automatically delete:
            # - course_enrollments
            # - lessons (if they reference course_id)
            # - assignments (if they reference course_id)
            
            # Delete the course
            response = self.supabase.table('courses').delete().eq('id', course_id).execute()
            
            if response.data:
                logger.info(f"Course {course_id} deleted successfully")
                return True
            else:
                logger.error(f"Failed to delete course {course_id}")
                return False
        except Exception as e:
            logger.error(f"Error deleting course: {e}")
            return False

    def get_course_lessons(self, course_id: str):
        """Get all lessons for a course"""
        try:
            # Column in schema is lesson_order (not order_index)
            response = self.supabase.table('lessons').select('*').eq('course_id', course_id).order('lesson_order', desc=False).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error getting course lessons: {e}")
            return []

    def create_lesson(self, lesson_data: dict):
        """Create a lesson (expects keys: course_id, title, lesson_order, optional: content, video_url, duration_minutes, is_published)"""
        try:
            payload = {
                'course_id': lesson_data['course_id'],
                'title': lesson_data['title'],
                'lesson_order': lesson_data['lesson_order'],
                'content': lesson_data.get('content'),
                'video_url': lesson_data.get('video_url'),
                'duration_minutes': lesson_data.get('duration_minutes'),
                'is_published': lesson_data.get('is_published', False)
            }
            response = self.supabase.table('lessons').insert(payload).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error creating lesson: {e}")
            return None

    def create_chat_session(self, user_id: str, title: str = "New Chat"):
        """Create a new chat session"""
        try:
            response = self.supabase.table('chat_sessions').insert({
                'user_id': user_id,
                'title': title
            }).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating chat session: {e}")
            return None

    def get_chat_sessions(self, user_id: str):
        """Get all chat sessions for a user"""
        try:
            response = self.supabase.table('chat_sessions').select('*').eq('user_id', user_id).order('updated_at', desc=True).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error getting chat sessions: {e}")
            return []

    def get_chat_session(self, session_id: str, user_id: str):
        """Get a specific chat session"""
        try:
            response = self.supabase.table('chat_sessions').select('*').eq('id', session_id).eq('user_id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting chat session: {e}")
            return None

    def add_message(self, session_id: str, user_id: str, content: str, role: str):
        """Add a message to a chat session"""
        try:
            response = self.supabase.table('messages').insert({
                'session_id': session_id,
                'user_id': user_id,
                'content': content,
                'role': role
            }).execute()

            # Update the session's updated_at timestamp
            self.supabase.table('chat_sessions').update({
                'updated_at': 'now()'
            }).eq('id', session_id).execute()

            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error adding message: {e}")
            return None

    def get_session_messages(self, session_id: str, user_id: str):
        """Get all messages for a chat session"""
        try:
            # First verify the session belongs to the user
            session = self.get_chat_session(session_id, user_id)
            if not session:
                return []

            response = self.supabase.table('messages').select('*').eq('session_id', session_id).order('created_at', desc=False).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error getting session messages: {e}")
            return []

    def update_session_title(self, session_id: str, user_id: str, title: str):
        """Update a chat session title"""
        try:
            response = self.supabase.table('chat_sessions').update({
                'title': title,
                'updated_at': 'now()'
            }).eq('id', session_id).eq('user_id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating session title: {e}")
            return None

    def delete_chat_session(self, session_id: str, user_id: str):
        """Delete a chat session and all its messages"""
        try:
            # Delete messages first
            self.supabase.table('messages').delete().eq('session_id', session_id).execute()

            # Delete the session
            response = self.supabase.table('chat_sessions').delete().eq('id', session_id).eq('user_id', user_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting chat session: {e}")
            return False

    # ===========================
    # ASSIGNMENT SYSTEM METHODS
    # ===========================

    def create_assignment(self, course_id, title, description=None, instructions=None, assignment_type='homework',
                          due_date=None, points_possible=100, is_published=True, created_by=None, **kwargs):
        """Create a new assignment"""
        try:
            assignment_data = {
                'course_id': course_id,
                'title': title,
                'description': description,
                'instructions': instructions,
                'assignment_type': assignment_type,
                'max_points': points_possible,
                'due_date': due_date,
                'is_published': is_published,
                'created_by': created_by
            }
            
            # Add any additional fields from kwargs but don't override max_points
            filtered_kwargs = {k: v for k, v in kwargs.items() if k != 'max_points'}
            assignment_data.update(filtered_kwargs)
            
            # Handle datetime serialization
            if assignment_data.get('due_date') and hasattr(assignment_data['due_date'], 'isoformat'):
                assignment_data['due_date'] = assignment_data['due_date'].isoformat()

            print(f"Final assignment_data for insert: {assignment_data}")
            result = self.supabase.table('assignments').insert(assignment_data).execute()
            print(f"Supabase result: {result}")
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating assignment: {e}")
            return None

    def get_assignments_by_course(self, course_id, include_unpublished=False):
        """Get all assignments for a course"""
        try:
            query = self.supabase.table('assignments').select('*').eq('course_id', course_id)

            if not include_unpublished:
                query = query.eq('is_published', True)

            result = query.order('due_date', desc=False).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error getting assignments: {e}")
            return []

    def get_assignment_by_id(self, assignment_id):
        """Get a specific assignment by ID"""
        try:
            result = self.supabase.table('assignments').select('*').eq('id', assignment_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting assignment: {e}")
            return None

    def update_assignment(self, assignment_id, **updates):
        """Update an assignment"""
        try:
            result = self.supabase.table('assignments').update(updates).eq('id', assignment_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error updating assignment: {e}")
            return None

    def delete_assignment(self, assignment_id):
        """Delete an assignment"""
        try:
            result = self.supabase.table('assignments').delete().eq('id', assignment_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting assignment: {e}")
            return False

    def submit_assignment(self, assignment_id, student_id, content=None, file_urls=None, attempt_number=1):
        """Submit an assignment"""
        try:
            # Verify the assignment exists and is published
            assignment = self.get_assignment_by_id(assignment_id)
            if not assignment:
                return None

            # Check if this is a late submission
            is_late = False
            if assignment.get('due_date'):
                # Get the student's due date (might be extended)
                due_date = self.get_student_assignment_due_date(assignment_id, student_id)
                from datetime import datetime
                import pytz
                now = datetime.now(pytz.UTC)
                if due_date and now > due_date:
                    is_late = True

            submission_data = {
                'assignment_id': assignment_id,
                'student_id': student_id,
                'content': content,
                'file_urls': file_urls,
                'attempt_number': attempt_number,
                'is_late': is_late,
                'status': 'submitted'
            }

            result = self.supabase.table('assignment_submissions').insert(submission_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error submitting assignment: {e}")
            return None

    def get_student_submissions(self, student_id, course_id=None):
        """Get all submissions for a student"""
        try:
            query = self.supabase.table('assignment_submissions').select('*').eq('student_id', student_id)

            if course_id:
                # Filter by course through assignment relationship
                query = query.select('''
                    *,
                    assignments!inner(id, course_id, title, due_date)
                ''').eq('assignments.course_id', course_id)

            result = query.order('submitted_at', desc=True).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error getting student submissions: {e}")
            return []

    def get_assignment_submissions(self, assignment_id, status=None):
        """Get all submissions for an assignment"""
        try:
            query = self.supabase.table('assignment_submissions').select('''
                *,
                users!assignment_submissions_student_id_fkey(id, name, email)
            ''').eq('assignment_id', assignment_id)

            if status:
                query = query.eq('status', status)

            result = query.order('submitted_at', desc=True).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error getting assignment submissions: {e}")
            return []

    def get_submission_by_id(self, submission_id):
        """Get a specific submission by ID"""
        try:
            submission = self.supabase.table('assignment_submissions').select('''
                *,
                assignments(id, title, course_id, points_possible),
                users!assignment_submissions_student_id_fkey(id, name, email)
            ''').eq('id', submission_id).execute()

            return submission.data[0] if submission.data else None
        except Exception as e:
            logger.error(f"Error getting submission: {e}")
            return None

    def grade_submission(self, submission_id, grader_id, points_earned, feedback=None,
                         rubric_scores=None, is_excused=False):
        """Grade a submission"""
        try:
            # Check if a grade already exists
            existing_grade = self.get_submission_grade(submission_id)

            grade_data = {
                'submission_id': submission_id,
                'grader_id': grader_id,
                'points_earned': points_earned,
                'feedback': feedback,
                'rubric_scores': rubric_scores,
                'is_excused': is_excused
            }

            if existing_grade:
                # Update existing grade
                result = self.supabase.table('assignment_grades').update(grade_data).eq('submission_id', submission_id).execute()
            else:
                # Create new grade
                result = self.supabase.table('assignment_grades').insert(grade_data).execute()

            # Update submission status
            self.supabase.table('assignment_submissions').update({
                'status': 'graded',
                'updated_at': 'now()'
            }).eq('id', submission_id).execute()

            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error grading submission: {e}")
            return None

    def get_submission_grade(self, submission_id):
        """Get grade for a submission"""
        try:
            result = self.supabase.table('assignment_grades').select('*').eq('submission_id', submission_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting submission grade: {e}")
            return None

    def add_assignment_comment(self, submission_id, commenter_id, comment, comment_type='general',
                               line_number=None, is_private=False):
        """Add a comment to a submission"""
        try:
            comment_data = {
                'submission_id': submission_id,
                'commenter_id': commenter_id,
                'comment': comment,
                'comment_type': comment_type,
                'line_number': line_number,
                'is_private': is_private
            }

            result = self.supabase.table('assignment_comments').insert(comment_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error adding comment: {e}")
            return None

    def get_submission_comments(self, submission_id, include_private=False):
        """Get all comments for a submission"""
        try:
            query = self.supabase.table('assignment_comments').select('''
                *,
                users!assignment_comments_commenter_id_fkey(id, name, email)
            ''').eq('submission_id', submission_id)

            if not include_private:
                query = query.eq('is_private', False)

            result = query.order('created_at', desc=False).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error getting submission comments: {e}")
            return []

    def grant_assignment_extension(self, assignment_id, student_id, extended_due_date,
                                   granted_by, reason=None):
        """Grant an extension for an assignment"""
        try:
            # Check if assignment exists
            assignment = self.get_assignment_by_id(assignment_id)
            if not assignment:
                return None

            extension_data = {
                'assignment_id': assignment_id,
                'student_id': student_id,
                'extended_due_date': extended_due_date,
                'granted_by': granted_by,
                'reason': reason
            }

            result = self.supabase.table('assignment_extensions').upsert(extension_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error granting extension: {e}")
            return None

    def get_student_assignment_due_date(self, assignment_id, student_id):
        """Get the due date for a student (including extensions)"""
        try:
            # Check if there's an extension
            extension_result = self.supabase.table('assignment_extensions').select('extended_due_date').eq('assignment_id', assignment_id).eq('student_id', student_id).execute()

            if extension_result.data:
                return extension_result.data[0]['extended_due_date']

            # No extension, return original due date
            assignment = self.get_assignment_by_id(assignment_id)
            return assignment['due_date'] if assignment else None
        except Exception as e:
            logger.error(f"Error getting student due date: {e}")
            return None

    def get_course_gradebook(self, course_id):
        """Get gradebook data for a course"""
        try:
            # Get all assignments for the course
            assignments = self.get_assignments_by_course(course_id)

            # Get all enrolled students
            enrollments = self.get_course_enrollments(course_id)

            gradebook = {
                'course_id': course_id,
                'assignments': assignments,
                'students': []
            }

            # For each student, get their submissions and grades
            for enrollment in enrollments:
                student = enrollment['users']
                student_data = {
                    'student': student,
                    'grades': {}
                }

                # Get submissions for each assignment
                for assignment in assignments:
                    submissions = self.get_assignment_submissions(assignment['id'])
                    student_submission = next((s for s in submissions if s['student_id'] == student['id']), None)

                    if student_submission:
                        grade = self.get_submission_grade(student_submission['id'])
                        student_data['grades'][assignment['id']] = {
                            'submission': student_submission,
                            'grade': grade
                        }
                    else:
                        student_data['grades'][assignment['id']] = {
                            'submission': None,
                            'grade': None
                        }

                gradebook['students'].append(student_data)

            return gradebook
        except Exception as e:
            logger.error(f"Error getting gradebook: {e}")
            return None

    def get_all_users(self):
        """Get all users"""
        try:
            response = self.supabase.table('users').select('*').execute()
            return response.data
        except Exception as e:
            logger.error(f"Error getting all users: {e}")
            return []



    def suspend_user(self, user_id: str, is_suspended: bool = True):
        """Suspend or unsuspend a user"""
        try:
            response = self.supabase.table('users').update({
                'is_suspended': is_suspended,
                'updated_at': 'now()'
            }).eq('id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error suspending user: {e}")
            return None

    def create_user_admin(self, user_data: dict):
        """Create a new user (admin function with password hashing)"""
        try:
            safe_user_data = {
                'name': user_data.get('name'),
                'email': user_data.get('email'),
                'role': user_data.get('role', 'student'),
                'password': user_data.get('password')
            }
            if self.use_mock:
                import uuid
                safe_user_data['id'] = str(uuid.uuid4())
                self._mock_users.append(safe_user_data)
                return safe_user_data
            resp = self.supabase.table('users').insert(safe_user_data).execute()
            if hasattr(resp, 'data') and resp.data:
                return resp.data[0]
            logger.error("User creation failed - database insert returned no data")
            return None
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return None

        except Exception as e:
            logger.error(f"Error getting user stats: {e}")
            return {}

    def get_recent_activity(self, user_id: str, limit: int = 5):
        """Get recent user activity based on role"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                return []

            role = user.get('role', 'student')
            activities = []

            if role == 'student':
                # Get recent submissions
                try:
                    submissions = self.get_student_submissions(user_id)
                    recent_submissions = sorted(submissions, key=lambda x: x.get('submitted_at', ''), reverse=True)[:3]

                    for submission in recent_submissions:
                        assignment = self.get_assignment_by_id(submission.get('assignment_id'))
                        if assignment:
                            activities.append({
                                'id': f"submission_{submission.get('id')}",
                                'type': 'assignment_submitted',
                                'title': 'Assignment Submitted',
                                'description': f"Submitted '{assignment.get('title', 'Unknown Assignment')}'",
                                'date': submission.get('submitted_at', ''),
                                'icon': 'FileText'
                            })
                except Exception:
                    pass

                # Get recent enrollments
                try:
                    enrollments = self.get_student_enrollments(user_id)
                    recent_enrollments = sorted(enrollments, key=lambda x: x.get('enrolled_at', ''), reverse=True)[:2]

                    for enrollment in recent_enrollments:
                        course = enrollment.get('courses', {})
                        if course:
                            activities.append({
                                'id': f"enrollment_{enrollment.get('course_id')}",
                                'type': 'course_enrolled',
                                'title': 'Course Enrolled',
                                'description': f"Enrolled in '{course.get('name', 'Unknown Course')}'",
                                'date': enrollment.get('enrolled_at', ''),
                                'icon': 'BookOpen'
                            })
                except Exception:
                    pass

            elif role == 'staff':
                # Get recent courses created
                try:
                    all_courses = self.get_courses()
                    staff_courses = [c for c in all_courses if c.get('instructor_id') == user_id]
                    recent_courses = sorted(staff_courses, key=lambda x: x.get('created_at', ''), reverse=True)[:3]

                    for course in recent_courses:
                        activities.append({
                            'id': f"course_{course.get('id')}",
                            'type': 'course_created',
                            'title': 'Course Created',
                            'description': f"Created course '{course.get('title', 'Unknown Course')}'",
                            'date': course.get('created_at', ''),
                            'icon': 'BookOpen'
                        })
                except Exception:
                    pass

                # Get recent assignments created
                try:
                    all_assignments = self.get_all_assignments()
                    staff_assignments = [a for a in all_assignments if a.get('created_by') == user_id]
                    recent_assignments = sorted(staff_assignments, key=lambda x: x.get('created_at', ''), reverse=True)[:2]

                    for assignment in recent_assignments:
                        activities.append({
                            'id': f"assignment_{assignment.get('id')}",
                            'type': 'assignment_created',
                            'title': 'Assignment Created',
                            'description': f"Created assignment '{assignment.get('title', 'Unknown Assignment')}'",
                            'date': assignment.get('created_at', ''),
                            'icon': 'FileText'
                        })
                except Exception:
                    pass

            elif role == 'admin':
                # Get recent user registrations
                try:
                    recent_users = self.get_recent_users(limit=3)
                    for new_user in recent_users:
                        activities.append({
                            'id': f"user_{new_user.get('id')}",
                            'type': 'user_registered',
                            'title': 'New User Registered',
                            'description': f"{new_user.get('name', 'Unknown User')} joined as {new_user.get('role', 'user')}",
                            'date': new_user.get('created_at', ''),
                            'icon': 'User'
                        })
                except Exception:
                    pass

                # Get recent courses
                try:
                    recent_courses = self.get_recent_courses(limit=2)
                    for course in recent_courses:
                        activities.append({
                            'id': f"course_admin_{course.get('id')}",
                            'type': 'course_created',
                            'title': 'New Course Created',
                            'description': f"Course '{course.get('title', 'Unknown Course')}' was created",
                            'date': course.get('created_at', ''),
                            'icon': 'BookOpen'
                        })
                except Exception:
                    pass

            # Sort activities by date and limit
            activities.sort(key=lambda x: x.get('date', ''), reverse=True)
            activities = activities[:limit]

            # Add fallback activities if none found
            if not activities:
                from datetime import datetime, timedelta
                activities = [
                    {
                        'id': 'welcome',
                        'type': 'account_created',
                        'title': 'Welcome to AI Tutor!',
                        'description': 'Your account has been created successfully',
                        'date': user.get('created_at', datetime.now().isoformat()),
                        'icon': 'Award'
                    }
                ]

            return activities

        except Exception as e:
            logger.error(f"Error getting recent activity: {e}")
            return [
                {
                    'id': 'fallback',
                    'type': 'system',
                    'title': 'Welcome!',
                    'description': 'Start exploring the platform',
                    'date': '2025-01-15T10:00:00Z',
                    'icon': 'Star'
                }
            ]

    def get_user_achievements(self, user_id: str):
        """Get user achievements based on their activity and role"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                return []

            achievements = []
            role = user.get('role', 'student')

            # Welcome achievement for all users
            achievements.append({
                'id': 'welcome',
                'title': 'Welcome to AI Tutor!',
                'description': 'Successfully created your account and joined the platform',
                'icon': '🎓',
                'date': user.get('created_at', '2025-01-15'),
                'type': 'milestone',
                'rarity': 'common'
            })

            if role == 'student':
                # Student-specific achievements
                try:
                    enrollments = self.get_student_enrollments(user_id)
                    submissions = self.get_student_submissions(user_id)

                    # First enrollment
                    if enrollments:
                        achievements.append({
                            'id': 'first_enrollment',
                            'title': 'First Steps',
                            'description': 'Enrolled in your first course',
                            'icon': '📚',
                            'date': enrollments[0].get('enrolled_at', '2025-01-15'),
                            'type': 'milestone',
                            'rarity': 'common'
                        })

                    # Multiple enrollments
                    if len(enrollments) >= 3:
                        achievements.append({
                            'id': 'course_explorer',
                            'title': 'Course Explorer',
                            'description': 'Enrolled in 3 or more courses',
                            'icon': '🗺️',
                            'date': '2025-01-15',
                            'type': 'progress',
                            'rarity': 'uncommon'
                        })

                    # First submission
                    if submissions:
                        achievements.append({
                            'id': 'first_submission',
                            'title': 'Assignment Ace',
                            'description': 'Submitted your first assignment',
                            'icon': '📝',
                            'date': submissions[0].get('submitted_at', '2025-01-15'),
                            'type': 'milestone',
                            'rarity': 'common'
                        })

                    # Multiple submissions
                    if len(submissions) >= 5:
                        achievements.append({
                            'id': 'dedicated_learner',
                            'title': 'Dedicated Learner',
                            'description': 'Submitted 5 or more assignments',
                            'icon': '⭐',
                            'date': '2025-01-15',
                            'type': 'progress',
                            'rarity': 'uncommon'
                        })

                    # High performer
                    graded_submissions = [s for s in submissions if s.get('status') == 'graded']
                    if graded_submissions:
                        total_points = sum(s.get('points_earned', 0) for s in graded_submissions)
                        max_points = sum(s.get('points_possible', 100) for s in graded_submissions)
                        if max_points > 0 and (total_points / max_points) >= 0.9:
                            achievements.append({
                                'id': 'high_achiever',
                                'title': 'High Achiever',
                                'description': 'Maintained 90%+ average across assignments',
                                'icon': '🏆',
                                'date': '2025-01-15',
                                'type': 'performance',
                                'rarity': 'rare'
                            })

                except Exception:
                    pass

            elif role == 'staff':
                # Staff-specific achievements
                try:
                    all_courses = self.get_courses()
                    staff_courses = [c for c in all_courses if c.get('instructor_id') == user_id]
                    all_assignments = self.get_all_assignments()
                    staff_assignments = [a for a in all_assignments if a.get('created_by') == user_id]

                    # First course
                    if staff_courses:
                        achievements.append({
                            'id': 'first_course',
                            'title': 'Course Creator',
                            'description': 'Created your first course',
                            'icon': '👨‍🏫',
                            'date': staff_courses[0].get('created_at', '2025-01-15'),
                            'type': 'milestone',
                            'rarity': 'common'
                        })

                    # Multiple courses
                    if len(staff_courses) >= 3:
                        achievements.append({
                            'id': 'prolific_educator',
                            'title': 'Prolific Educator',
                            'description': 'Created 3 or more courses',
                            'icon': '🎯',
                            'date': '2025-01-15',
                            'type': 'progress',
                            'rarity': 'uncommon'
                        })

                    # First assignment
                    if staff_assignments:
                        achievements.append({
                            'id': 'assignment_creator',
                            'title': 'Assignment Master',
                            'description': 'Created your first assignment',
                            'icon': '📋',
                            'date': staff_assignments[0].get('created_at', '2025-01-15'),
                            'type': 'milestone',
                            'rarity': 'common'
                        })

                    # Student engagement
                    total_students = 0
                    for course in staff_courses:
                        enrollments = self.get_course_enrollments(course['id'])
                        total_students += len(enrollments)

                    if total_students >= 10:
                        achievements.append({
                            'id': 'popular_instructor',
                            'title': 'Popular Instructor',
                            'description': 'Teaching 10 or more students',
                            'icon': '👥',
                            'date': '2025-01-15',
                            'type': 'engagement',
                            'rarity': 'rare'
                        })

                except Exception:
                    pass

            elif role == 'admin':
                # Admin-specific achievements
                try:
                    all_users = self.get_all_users()
                    all_courses = self.get_courses()

                    achievements.append({
                        'id': 'system_admin',
                        'title': 'System Administrator',
                        'description': 'Managing the AI Tutor platform',
                        'icon': '⚙️',
                        'date': user.get('created_at', '2025-01-15'),
                        'type': 'role',
                        'rarity': 'legendary'
                    })

                    if len(all_users) >= 10:
                        achievements.append({
                            'id': 'community_builder',
                            'title': 'Community Builder',
                            'description': 'Platform has grown to 10+ users',
                            'icon': '🌟',
                            'date': '2025-01-15',
                            'type': 'milestone',
                            'rarity': 'rare'
                        })

                    if len(all_courses) >= 5:
                        achievements.append({
                            'id': 'course_curator',
                            'title': 'Course Curator',
                            'description': 'Platform offers 5+ courses',
                            'icon': '📖',
                            'date': '2025-01-15',
                            'type': 'milestone',
                            'rarity': 'uncommon'
                        })

                except Exception:
                    pass

            # Sort achievements by date (newest first)
            achievements.sort(key=lambda x: x.get('date', ''), reverse=True)

            return achievements

        except Exception as e:
            logger.error(f"Error getting user achievements: {e}")
            return [
                {
                    'id': 'welcome_fallback',
                    'title': 'Welcome to AI Tutor!',
                    'description': 'Successfully joined the platform',
                    'icon': '🎓',
                    'date': '2025-01-15',
                    'type': 'milestone',
                    'rarity': 'common'
                }
            ]

    def is_student_enrolled(self, course_id: str, student_id: str):
        """Check if student is enrolled in course"""
        try:
            response = self.supabase.table('course_enrollments').select('*').eq('course_id', course_id).eq('student_id', student_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error checking enrollment: {e}")
            return False

    def get_student_enrollments(self, student_id: str):
        """Get all courses a student is enrolled in"""
        try:
            response = self.supabase.table('course_enrollments').select('''
                course_id,
                enrolled_at,
                courses(id, name, description, instructor_id)
            ''').eq('student_id', student_id).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error getting student enrollments: {e}")
            return []

    def enroll_student(self, course_id: str, student_id: str):
        """Enroll a student in a course"""
        try:
            enrollment_data = {
                'course_id': course_id,
                'student_id': student_id,
                'enrolled_at': 'now()',
                'progress_percentage': 0
            }
            response = self.supabase.table('course_enrollments').insert(enrollment_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error enrolling student: {e}")
            return None

    def unenroll_student(self, course_id: str, student_id: str):
        """Unenroll a student from a course"""
        try:
            response = self.supabase.table('course_enrollments').delete().eq('course_id', course_id).eq('student_id', student_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error unenrolling student: {e}")
            return False

    def get_student_enrollment(self, student_id: str, course_id: str):
        """Check if a student is enrolled in a specific course"""
        try:
            response = self.supabase.table('course_enrollments').select('*').eq('student_id', student_id).eq('course_id', course_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error checking student enrollment: {e}")
            return None

    # get_all_assignments implemented later with pagination support

    # ============================================================================
    # NOTIFICATION METHODS
    # ============================================================================

    def create_notification(self, notification_data):
        """Create a new notification with proper defaults"""
        try:
            from datetime import datetime, timezone

            print(f"Creating notification with data: {notification_data}")

            # Handle created_at field - ensure it's always a string
            created_at = notification_data.get('created_at')
            if created_at is None:
                created_at = datetime.now(timezone.utc).isoformat()
            elif isinstance(created_at, datetime):
                created_at = created_at.isoformat()
            elif not isinstance(created_at, str):
                created_at = datetime.now(timezone.utc).isoformat()

            # Check if this is a bulk notification (target is a list of user IDs)
            target = notification_data.get('target', 'all')
            print(f"Target: {target}")

            if isinstance(target, list):
                # Bulk notification to multiple users
                notifications = []
                for user_id in target:
                    data = {
                        'user_id': user_id,
                        'title': notification_data['title'],
                        'message': notification_data['message'],
                        'sender_id': notification_data['sender_id'],
                        'type': notification_data.get('type', 'info'),
                        'is_read': False,
                        'is_global': False,
                        'created_at': created_at,
                        'target': 'user',
                        'priority': notification_data.get('priority', 'medium'),
                        'status': notification_data.get('status', 'active'),
                        'link': notification_data.get('link')
                    }

                    response = self.supabase.table('notifications').insert(data).execute()
                    if response.data:
                        notifications.append(response.data[0])

                return notifications
            else:
                # Single notification - handle different target types
                if target == 'all':
                    # Get all users for global notification
                    print("Getting all users for global notification")
                    users = self.get_all_users()
                    print(f"Found {len(users)} users")
                    notifications = []

                    if not users:
                        # If no users exist, create a system user first
                        print("No users found, creating system user")
                        import uuid
                        system_user_data = {
                            'id': str(uuid.uuid4()),
                            'email': 'system@ai-tutor.com',
                            'name': 'System',
                            'role': 'admin',
                            'status': 'active'
                        }

                        system_user = self.create_user(system_user_data)
                        if system_user:
                            print("System user created successfully")
                            users = [system_user]
                        else:
                            print("Failed to create system user")
                            # If we can't create a system user, return empty list
                            return []
                    else:
                        print(f"Creating notifications for {len(users)} users")
                        for user in users:
                            # Ensure user is a dictionary and has an 'id' field
                            if isinstance(user, dict) and 'id' in user:
                                data = {
                                    'user_id': user['id'],
                                    'title': notification_data['title'],
                                    'message': notification_data['message'],
                                    'sender_id': notification_data['sender_id'],
                                    'type': notification_data.get('type', 'info'),
                                    'is_read': False,
                                    'is_global': True,
                                    'created_at': created_at,
                                    'target': 'all',
                                    'priority': notification_data.get('priority', 'medium'),
                                    'status': notification_data.get('status', 'active')
                                }

                                print(f"Inserting notification data: {data}")
                                response = self.supabase.table('notifications').insert(data).execute()
                                if response.data:
                                    notifications.append(response.data[0])
                                    print(f"Notification created successfully for user {user['id']}")
                                else:
                                    print(f"Failed to create notification for user {user['id']}")
                            else:
                                print(f"Skipping invalid user data: {user}")

                    return notifications
                elif target in ['students', 'staff', 'admin']:
                    # Get users by role
                    users = self.get_all_users()
                    role_users = [user for user in users if user.get('role') == target]
                    notifications = []
                    for user in role_users:
                        data = {
                            'user_id': user['id'],
                            'title': notification_data['title'],
                            'message': notification_data['message'],
                            'sender_id': notification_data['sender_id'],
                            'type': notification_data.get('type', 'info'),
                            'is_read': False,
                            'is_global': False,
                            'created_at': created_at,
                            'target': target,
                            'priority': notification_data.get('priority', 'medium'),
                            'status': notification_data.get('status', 'active')
                        }

                        response = self.supabase.table('notifications').insert(data).execute()
                        if response.data:
                            notifications.append(response.data[0])

                    return notifications
                else:
                    # Single user notification
                    print(f"Creating single user notification for target: {target}")
                    data = {
                        'user_id': target,
                        'title': notification_data['title'],
                        'message': notification_data['message'],
                        'sender_id': notification_data['sender_id'],
                        'type': notification_data.get('type', 'info'),
                        'is_read': False,
                        'is_global': False,
                        'created_at': created_at,
                        'target': 'user',
                        'priority': notification_data.get('priority', 'medium'),
                        'status': notification_data.get('status', 'active')
                    }

                    print(f"Inserting single user notification data: {data}")
                    response = self.supabase.table('notifications').insert(data).execute()
                    print(f"Single user notification response: {response}")
                    result = response.data[0] if response.data else None
                    print(f"Single user notification result: {result}")
                    return result

        except Exception as e:
            logger.error(f"Error creating notification: {e}")
            return None

    def get_unread_notification_count(self, user_id):
        """Get the count of unread notifications for a user."""
        try:
            # Count notifications where is_read is false
            query = self.supabase.table('notifications').select('id', count='exact').eq('user_id', user_id).eq('is_read', False)
            response = query.execute()
            
            if response.count is not None:
                return response.count
            return 0
        except Exception as e:
            logger.error(f"Error getting unread notification count for user {user_id}: {e}")
            return 0

    def get_user_notifications(self, user_id, include_archived=False, include_deleted=False):
        """Get notifications for a specific user - compatibility version"""
        try:
            # Try enhanced approach first (only if tables exist)
            try:
                # Test if notification_user_actions table exists by doing a simple query
                test_response = self.supabase.table('notification_user_actions').select('id').limit(1).execute()
                
                # If we get here, the table exists, use enhanced approach
                query = self.supabase.table('notifications').select(
                    '''
                    id,
                    title,
                    message,
                    type,
                    priority,
                    sender_id,
                    target,
                    is_global,
                    is_system,
                    status,
                    created_at,
                    notification_user_actions(
                        is_read,
                        read_at,
                        is_archived,
                        archived_at,
                        is_deleted,
                        deleted_at,
                        updated_at
                    )
                    '''
                ).eq('notification_user_actions.user_id', user_id)
                
                if not include_deleted:
                    query = query.eq('notification_user_actions.is_deleted', False)
                if not include_archived:
                    query = query.eq('notification_user_actions.is_archived', False)
                    
                response = query.order('created_at', desc=True).execute()
                
                if response.data:
                    return response.data
                    
            except Exception as e:
                logger.info(f"Enhanced notification system not available, using basic approach: {e}")
                
                # Fallback to basic notifications without user actions
                query = self.supabase.table('notifications').select(
                    'id, title, message, type, priority, sender_id, target, is_global, is_system, status, created_at'
                )
                
                # Simple filtering - get all notifications or user-specific ones
                response = query.order('created_at', desc=True).execute()
                
                if response.data:
                    # Add default user action status for compatibility
                    for notification in response.data:
                        notification['is_read'] = False
                        notification['is_archived'] = False
                        notification['is_deleted'] = False
                        notification['notification_user_actions'] = [{
                            'is_read': False,
                            'read_at': None,
                            'is_archived': False,
                            'archived_at': None,
                            'is_deleted': False,
                            'deleted_at': None,
                            'updated_at': notification.get('created_at')
                        }]
                        
                    logger.info(f"Retrieved {len(response.data)} basic notifications for user {user_id}")
                    return response.data
                    
                return []
                
            except Exception as fallback_error:
                logger.error(f"Error in fallback notification retrieval: {fallback_error}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting user notifications: {e}")
            return []
            
        except Exception as e:
            logger.error(f"Error getting user notifications: {e}")
            return []

    def mark_notification_read(self, notification_id, user_id):
        """Mark a notification as read for a specific user - compatibility version"""
        try:
            # Try enhanced approach first
            try:
                # First try updating notification_user_actions
                response = self.supabase.table('notification_user_actions')\
                    .update({
                        'is_read': True,
                        'read_at': 'now()',
                        'updated_at': 'now()'
                    })\
                    .eq('notification_id', notification_id)\
                    .eq('user_id', user_id)\
                    .execute()
                    
                if response.data:
                    return response.data[0]
                    
                # If no record exists, create one
                response = self.supabase.table('notification_user_actions')\
                    .insert({
                        'notification_id': notification_id,
                        'user_id': user_id,
                        'is_read': True,
                        'read_at': 'now()'
                    })\
                    .execute()
                    
                return response.data[0] if response.data else None
                
            except Exception as e:
                logger.info(f"Enhanced read marking not available, using basic approach: {e}")
                
                # Fallback: Just return success for now (basic notifications don't have read state)
                return {
                    'notification_id': notification_id,
                    'user_id': user_id,
                    'is_read': True,
                    'message': 'Read status simulated (enhanced tables not available)'
                }
            
        except Exception as e:
            logger.error(f"Error marking notification as read: {e}")
            return None

    def archive_notification(self, notification_id, user_id):
        """Archive a notification for a specific user - compatibility version"""
        try:
            # Try enhanced approach first
            try:
                # Update or create notification_user_actions record
                response = self.supabase.table('notification_user_actions')\
                    .upsert({
                        'notification_id': notification_id,
                        'user_id': user_id,
                        'is_archived': True,
                        'archived_at': 'now()',
                        'updated_at': 'now()'
                    })\
                    .execute()
                    
                return response.data[0] if response.data else None
                
            except Exception as e:
                logger.info(f"Enhanced archiving not available, using basic approach: {e}")
                
                # Fallback: Just return success for now (basic notifications don't have archive state)
                return {
                    'notification_id': notification_id,
                    'user_id': user_id,
                    'is_archived': True,
                    'message': 'Archive status simulated (enhanced tables not available)'
                }
            
        except Exception as e:
            logger.error(f"Error archiving notification: {e}")
            return None

    def delete_notification_for_user(self, notification_id, user_id):
        """Mark notification as deleted for a specific user (soft delete) - compatibility version"""
        try:
            # Try enhanced approach first
            try:
                # Update or create notification_user_actions record
                response = self.supabase.table('notification_user_actions')\
                    .upsert({
                        'notification_id': notification_id,
                        'user_id': user_id,
                        'is_deleted': True,
                        'deleted_at': 'now()',
                        'updated_at': 'now()'
                    })\
                    .execute()
                    
                return response.data[0] if response.data else None
                
            except Exception as e:
                logger.info(f"Enhanced deletion not available, using basic approach: {e}")
                
                # Fallback: Just return success for now (basic notifications don't have delete state)
                return {
                    'notification_id': notification_id,
                    'user_id': user_id,
                    'is_deleted': True,
                    'message': 'Delete status simulated (enhanced tables not available)'
                }
            
        except Exception as e:
            logger.error(f"Error deleting notification for user: {e}")
            return None

    def get_notification_stats(self, user_id):
        """Get notification statistics for a user - compatibility version"""
        try:
            # Try enhanced approach first
            try:
                response = self.supabase.table('notification_user_actions')\
                    .select('is_read, is_archived, is_deleted')\
                    .eq('user_id', user_id)\
                    .execute()
                    
                if response.data:
                    total = len(response.data)
                    unread = len([n for n in response.data if not n['is_read']])
                    archived = len([n for n in response.data if n['is_archived']])
                    deleted = len([n for n in response.data if n['is_deleted']])
                    
                    return {
                        'total': total,
                        'unread': unread,
                        'read': total - unread,
                        'archived': archived,
                        'deleted': deleted,
                        'active': total - deleted
                    }
            except Exception as e:
                logger.info(f"Enhanced stats not available, using basic approach: {e}")
                
            # Fallback to basic notification count
            try:
                response = self.supabase.table('notifications').select('id').execute()
                total_notifications = len(response.data) if response.data else 0
                
                return {
                    'total': total_notifications,
                    'unread': total_notifications,  # Assume all unread until schema is applied
                    'read': 0,
                    'archived': 0,
                    'deleted': 0,
                    'active': total_notifications
                }
            except Exception as fallback_error:
                logger.error(f"Error in fallback stats: {fallback_error}")
                return {'total': 0, 'unread': 0, 'read': 0, 'archived': 0, 'deleted': 0, 'active': 0}
                
        except Exception as e:
            logger.error(f"Error getting notification stats: {e}")
            return {'total': 0, 'unread': 0, 'read': 0, 'archived': 0, 'deleted': 0, 'active': 0}

    def bulk_notification_action(self, notification_ids, user_id, action):
        """Perform bulk actions on notifications (mark read, archive, delete)"""
        try:
            update_data = {'updated_at': 'now()'}
            
            if action == 'read':
                update_data.update({'is_read': True, 'read_at': 'now()'})
            elif action == 'archive':
                update_data.update({'is_archived': True, 'archived_at': 'now()'})
            elif action == 'delete':
                update_data.update({'is_deleted': True, 'deleted_at': 'now()'})
            elif action == 'unarchive':
                update_data.update({'is_archived': False, 'archived_at': None})
            elif action == 'restore':
                update_data.update({'is_deleted': False, 'deleted_at': None})
            else:
                return None
                
            # Update all notification_user_actions records for these notifications
            updated_records = []
            for notification_id in notification_ids:
                response = self.supabase.table('notification_user_actions')\
                    .upsert({
                        'notification_id': notification_id,
                        'user_id': user_id,
                        **update_data
                    })\
                    .execute()
                    
                if response.data:
                    updated_records.extend(response.data)
                    
            return updated_records
            
        except Exception as e:
            logger.error(f"Error performing bulk notification action: {e}")
            return None

    # Admin notification management functions
    def get_all_notifications_admin(self, filters=None):
        """Get all notifications for admin management"""
        try:
            query = self.supabase.table('notifications').select(
                '''
                id,
                title,
                message,
                type,
                priority,
                sender_id,
                target,
                is_global,
                is_system,
                status,
                created_at,
                users!notifications_sender_id_fkey(name, email)
                '''
            )
            
            if filters:
                if filters.get('type'):
                    query = query.eq('type', filters['type'])
                if filters.get('target'):
                    query = query.eq('target', filters['target'])
                if filters.get('status'):
                    query = query.eq('status', filters['status'])
                if filters.get('sender_id'):
                    query = query.eq('sender_id', filters['sender_id'])
                    
            response = query.order('created_at', desc=True).execute()
            return response.data if response.data else []
            
        except Exception as e:
            logger.error(f"Error getting admin notifications: {e}")
            return []

    def get_notification_recipients(self, notification_id):
        """Get all recipients and their status for a specific notification"""
        try:
            response = self.supabase.table('notification_user_actions')\
                .select(
                    '''
                    user_id,
                    is_read,
                    read_at,
                    is_archived,
                    archived_at,
                    is_deleted,
                    deleted_at,
                    created_at,
                    users(name, email, role)
                    '''
                )\
                .eq('notification_id', notification_id)\
                .execute()
                
            return response.data if response.data else []
            
        except Exception as e:
            logger.error(f"Error getting notification recipients: {e}")
            return []

    def delete_notification_admin(self, notification_id):
        """Admin function to completely delete a notification"""
        try:
            # This will cascade delete notification_user_actions due to foreign key
            response = self.supabase.table('notifications')\
                .delete()\
                .eq('id', notification_id)\
                .execute()
                
            return response.data is not None
            
        except Exception as e:
            logger.error(f"Error deleting notification (admin): {e}")
            return False

    def update_notification_admin(self, notification_id, update_data):
        """Admin function to update a notification"""
        try:
            response = self.supabase.table('notifications')\
                .update(update_data)\
                .eq('id', notification_id)\
                .execute()
                
            return response.data[0] if response.data else None
            
        except Exception as e:
            logger.error(f"Error updating notification (admin): {e}")
            return None

    def get_user_notifications(self, user_id: str, page: int = 1, limit: int = 20, notification_type: str = None, is_read: bool = None, priority: str = None, include_archived: bool = False, include_deleted: bool = False, **_ignored):
        """Unified get notifications method.

        NOTE: A legacy compatibility version of get_user_notifications (defined earlier
        in this file) accepted include_archived/include_deleted flags. The notifications
        API endpoint still calls the method with those keyword arguments. A later
        reimplementation introduced pagination & filtering but changed the signature,
        causing TypeError: got an unexpected keyword argument 'include_archived'.

        To avoid refactoring all callers (and to stop 500 errors), we accept the legacy
        flags here and simply ignore them for now. Future enhancement could merge the
        archived/deleted semantics using notification_user_actions table once fully
        deployed.
        """
        try:
            offset = (page - 1) * limit
            # Get user info for role
            user = self.get_user_by_id(user_id)
            user_role = user.get('role', 'student') if user else 'student'

            # Build query for user-specific notifications
            user_query = (self.supabase.table('notifications')
                          .select('*')
                          .eq('user_id', user_id))
            
            # Build query for global notifications, excluding dismissed ones
            global_query = (self.supabase.table('notifications')
                            .select('*')
                            .eq('is_global', True)
                            .in_('target', ['all', user_role]))

            # Apply filters
            if notification_type:
                user_query = user_query.eq('type', notification_type)
                global_query = global_query.eq('type', notification_type)
            if is_read is not None:
                user_query = user_query.eq('is_read', is_read)
                global_query = global_query.eq('is_read', is_read)
            if priority:
                user_query = user_query.eq('priority', priority)
                global_query = global_query.eq('priority', priority)

            # Execute both queries
            user_resp = user_query.order('created_at', desc=True).range(offset, offset + limit - 1).execute()
            global_resp = global_query.order('created_at', desc=True).range(offset, offset + limit - 1).execute()

            # Get dismissed notification IDs for this user
            dismissed_resp = (self.supabase.table('notification_dismissals')
                            .select('notification_id')
                            .eq('user_id', user_id)
                            .execute())
            dismissed_ids = {d['notification_id'] for d in (dismissed_resp.data or [])}

            # Filter out dismissed global notifications
            global_notifications = [n for n in (global_resp.data or []) if n['id'] not in dismissed_ids]

            # Combine and sort by created_at
            notifications = (user_resp.data or []) + global_notifications
            notifications.sort(key=lambda n: n.get('created_at', ''), reverse=True)
            # (duplicated sort removed)
            # Paginate after combining
            notifications = notifications[:limit]
            return notifications
        except Exception as e:
            logger.error(f"Error getting user notifications: {e}")
            return []

    def get_user_notifications_count(self, user_id: str, notification_type: str = None,
                                     is_read: bool = None, priority: str = None):
        """Get total count of notifications for pagination"""
        try:
            query = (self.supabase.table('notifications')
                     .select('id', count='exact')
                     .eq('user_id', user_id))

            # Apply same filters as get_user_notifications
            if notification_type:
                query = query.eq('type', notification_type)
            if is_read is not None:
                query = query.eq('is_read', is_read)
            if priority:
                query = query.eq('priority', priority)

            response = query.execute()
            return response.count if response.count is not None else 0
        except Exception as e:
            logger.error(f"Error getting user notifications count: {e}")
            return 0

    def mark_notification_read(self, notification_id: str, user_id: str):
        """Mark a notification as read"""
        try:
            response = (self.supabase.table('notifications')
                        .update({'is_read': True})
                        .eq('id', notification_id)
                        .eq('user_id', user_id)
                        .execute())
            return response.data
        except Exception as e:
            logger.error(f"Error marking notification as read: {e}")
            return None

    def delete_notification(self, notification_id: str, user_id: str):
        """Delete or dismiss a notification"""
        try:
            # Check if this is a global notification
            notification_check = (self.supabase.table('notifications')
                                 .select('is_global, target')
                                 .eq('id', notification_id)
                                 .execute())
            
            if notification_check.data and len(notification_check.data) > 0:
                notification = notification_check.data[0]
                
                # For global notifications, create a dismissal record instead of deleting
                if notification.get('is_global'):
                    # Create or update user dismissal record
                    dismissal_data = {
                        'user_id': user_id,
                        'notification_id': notification_id,
                        'dismissed_at': datetime.now(timezone.utc).isoformat()
                    }
                    
                    # Check if dismissal already exists
                    existing_dismissal = (self.supabase.table('notification_dismissals')
                                        .select('id')
                                        .eq('user_id', user_id)
                                        .eq('notification_id', notification_id)
                                        .execute())
                    
                    if existing_dismissal.data:
                        # Update existing dismissal
                        response = (self.supabase.table('notification_dismissals')
                                  .update({'dismissed_at': dismissal_data['dismissed_at']})
                                  .eq('user_id', user_id)
                                  .eq('notification_id', notification_id)
                                  .execute())
                    else:
                        # Create new dismissal
                        response = (self.supabase.table('notification_dismissals')
                                  .insert(dismissal_data)
                                  .execute())
                    
                    return response.data
                else:
                    # For user-specific notifications, delete normally
                    response = (self.supabase.table('notifications')
                              .delete()
                              .eq('id', notification_id)
                              .eq('user_id', user_id)
                              .execute())
                    return response.data
            else:
                logger.error(f"Notification {notification_id} not found")
                return None
                
        except Exception as e:
            logger.error(f"Error deleting/dismissing notification: {e}")
            return None

    def get_unread_notification_count(self, user_id: str):
        """Get count of unread notifications for a user"""
        try:
            response = (self.supabase.table('notifications')
                        .select('id', count='exact')
                        .eq('user_id', user_id)
                        .eq('is_read', False)
                        .execute())
            return response.count if response.count is not None else 0
        except Exception as e:
            logger.error(f"Error getting unread notification count: {e}")
            return 0

    def mark_all_notifications_read(self, user_id: str):
        """Mark all notifications as read for a user"""
        try:
            response = (self.supabase.table('notifications')
                        .update({'is_read': True})
                        .eq('user_id', user_id)
                        .eq('is_read', False)
                        .execute())
            return response.data
        except Exception as e:
            logger.error(f"Error marking all notifications as read: {e}")
            return None

    def bulk_delete_notifications(self, notification_ids: list, user_id: str):
        """Delete multiple notifications for a user"""
        try:
            response = (self.supabase.table('notifications')
                        .delete()
                        .eq('user_id', user_id)
                        .in_('id', notification_ids)
                        .execute())
            return response.data
        except Exception as e:
            logger.error(f"Error bulk deleting notifications: {e}")
            return None

    def bulk_mark_notifications_read(self, notification_ids: list, user_id: str):
        """Mark multiple notifications as read for a user"""
        try:
            response = (self.supabase.table('notifications')
                        .update({'is_read': True})
                        .eq('user_id', user_id)
                        .in_('id', notification_ids)
                        .execute())
            return response.data
        except Exception as e:
            logger.error(f"Error bulk marking notifications as read: {e}")
            return None

    def get_notification_preferences(self, user_id: str):
        """Get notification preferences for a user"""
        try:
            response = (self.supabase.table('user_profiles')
                        .select('notification_settings')
                        .eq('user_id', user_id)
                        .execute())

            if response.data:
                return response.data[0].get('notification_settings', {
                    'email_notifications': True,
                    'push_notifications': True,
                    'assignment_notifications': True,
                    'course_notifications': True,
                    'system_notifications': True,
                    'marketing_notifications': False
                })
            else:
                # Return default preferences
                return {
                    'email_notifications': True,
                    'push_notifications': True,
                    'assignment_notifications': True,
                    'course_notifications': True,
                    'system_notifications': True,
                    'marketing_notifications': False
                }
        except Exception as e:
            logger.error(f"Error getting notification preferences: {e}")
            return {
                'email_notifications': True,
                'push_notifications': True,
                'assignment_notifications': True,
                'course_notifications': True,
                'system_notifications': True,
                'marketing_notifications': False
            }

    def update_notification_preferences(self, user_id: str, preferences: dict):
        """Update notification preferences for a user"""
        try:
            # Try to update existing profile
            response = (self.supabase.table('user_profiles')
                        .update({'notification_settings': preferences})
                        .eq('user_id', user_id)
                        .execute())

            if not response.data:
                # Create new profile if doesn't exist
                response = (self.supabase.table('user_profiles')
                            .insert({
                    'user_id': user_id,
                    'notification_settings': preferences
                })
                            .execute())

            return preferences
        except Exception as e:
            logger.error(f"Error updating notification preferences: {e}")
            return None

    def get_all_notifications(self):
        """Get all notifications for admin management"""
        try:
            # First try with joins
            try:
                response = (self.supabase.table('notifications')
                            .select('''
                               *,
                               users!notifications_user_id_fkey(name, email),
                               sender:users!notifications_sender_id_fkey(name, email)
                           ''')
                            .order('created_at', desc=True)
                            .limit(100)
                            .execute())

                # Process the data to add missing fields
                processed_data = []
                for notification in response.data:
                    processed_notification = {
                        **notification,
                        'channels': notification.get('channels', ['in-app']),
                        'recipients': notification.get('recipients', 'all'),
                        'recipientCount': 1,
                        'readCount': 0,
                        'status': notification.get('status', 'sent'),
                        'priority': notification.get('priority', 'medium')
                    }
                    processed_data.append(processed_notification)

                return processed_data

            except Exception as join_error:
                logger.warning(f"Join query failed, falling back to simple query: {join_error}")

                # Fallback to simple query without joins
                response = (self.supabase.table('notifications')
                            .select('*')
                            .order('created_at', desc=True)
                            .limit(100)
                            .execute())

                # Process the data to add missing fields and mock user info
                processed_data = []
                for notification in response.data:
                    processed_notification = {
                        **notification,
                        'channels': notification.get('channels', ['in-app']),
                        'recipients': notification.get('recipients', 'all'),
                        'recipientCount': 1,
                        'readCount': 0,
                        'status': notification.get('status', 'sent'),
                        'priority': notification.get('priority', 'medium'),
                        'sender_name': 'System',
                        'recipient_name': 'All Users'
                    }
                    processed_data.append(processed_notification)

                return processed_data

        except Exception as e:
            logger.error(f"Error getting all notifications: {e}")
            # Return sample data as fallback
            return [
                {
                    'id': 'sample_1',
                    'title': 'Welcome to AI Tutor',
                    'message': 'Welcome to the AI Tutor platform!',
                    'type': 'general',
                    'priority': 'medium',
                    'status': 'sent',
                    'channels': ['in-app'],
                    'recipients': 'all',
                    'recipientCount': 1,
                    'readCount': 0,
                    'created_at': '2025-01-15T10:00:00Z',
                    'sender_name': 'System',
                    'recipient_name': 'All Users'
                }
            ]

    def delete_admin_notification(self, notification_id: str):
        """Delete a notification (admin only)"""
        try:
            response = (self.supabase.table('notifications')
                        .delete()
                        .eq('id', notification_id)
                        .execute())
            return True
        except Exception as e:
            logger.error(f"Error deleting admin notification: {e}")
            return False

    def create_bulk_notifications(self, title: str, message: str, sender_id: str,
                                  notification_type: str = 'general', priority: str = 'medium',
                                  recipients: list = None, scheduled_for: str = None):
        """Create notifications for multiple specific users"""
        try:
            if not recipients:
                return []

            # Get user details for recipients
            all_users = self.get_all_users()
            recipient_users = [u for u in all_users if u.get('id') in recipients]

            if not recipient_users:
                logger.warning(f"No valid recipients found from: {recipients}")
                return []

            # Create notification records
            notifications_to_insert = []
            for user in recipient_users:
                notifications_to_insert.append({
                    'title': title,
                    'message': message,
                    'user_id': user['id'],
                    'sender_id': sender_id,
                    'type': notification_type,
                    'priority': priority,
                    'is_read': False,
                    'scheduled_for': scheduled_for
                })

            # Insert all notifications
            response = self.supabase.table('notifications').insert(notifications_to_insert).execute()
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error creating bulk notifications: {e}")
            return []

    # ============================================================================
    # NOTIFICATION TEMPLATE METHODS
    # ============================================================================

    def get_notification_templates(self):
        """Get all notification templates"""
        try:
            response = (self.supabase.table('notification_templates')
                        .select('''
                           *,
                           users!notification_templates_created_by_fkey(name, email)
                       ''')
                        .order('created_at', desc=True)
                        .execute())
            return response.data
        except Exception as e:
            logger.error(f"Error getting notification templates: {e}")
            return []

    def create_notification_template(self, name: str, title: str, message: str,
                                     notification_type: str = 'general', priority: str = 'medium',
                                     variables: list = None, created_by: str = None):
        """Create a new notification template"""
        try:
            template_data = {
                'name': name,
                'title': title,
                'message': message,
                'type': notification_type,
                'priority': priority,
                'variables': variables or [],
                'created_by': created_by
            }

            response = (self.supabase.table('notification_templates')
                        .insert(template_data)
                        .execute())
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating notification template: {e}")
            return None

    def get_notification_template(self, template_id: str):
        """Get a specific notification template"""
        try:
            response = (self.supabase.table('notification_templates')
                        .select('*')
                        .eq('id', template_id)
                        .execute())
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting notification template: {e}")
            return None

    def update_notification_template(self, template_id: str, updates: dict):
        """Update a notification template"""
        try:
            response = (self.supabase.table('notification_templates')
                        .update(updates)
                        .eq('id', template_id)
                        .execute())
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating notification template: {e}")
            return None

    def delete_notification_template(self, template_id: str):
        """Delete a notification template"""
        try:
            response = (self.supabase.table('notification_templates')
                        .delete()
                        .eq('id', template_id)
                        .execute())
            return True
        except Exception as e:
            logger.error(f"Error deleting notification template: {e}")
            return False

    def process_template_variables(self, template_text: str, variables: dict):
        """Process template variables in text"""
        try:
            processed_text = template_text
            for key, value in variables.items():
                placeholder = f"{{{key}}}"
                processed_text = processed_text.replace(placeholder, str(value))
            return processed_text
        except Exception as e:
            logger.error(f"Error processing template variables: {e}")
            return template_text

    def get_notification_statistics(self):
        """Get notification statistics for admin dashboard"""
        try:
            # Get total notifications
            total_response = (self.supabase.table('notifications')
                              .select('id', count='exact')
                              .execute())
            total_notifications = total_response.count or 0

            # Get unread notifications
            unread_response = (self.supabase.table('notifications')
                               .select('id', count='exact')
                               .eq('is_read', False)
                               .execute())
            unread_notifications = unread_response.count or 0

            # Get notifications by type
            type_stats = {}
            for notification_type in ['general', 'assignment', 'course', 'system', 'announcement']:
                type_response = (self.supabase.table('notifications')
                                 .select('id', count='exact')
                                 .eq('type', notification_type)
                                 .execute())
                type_stats[notification_type] = type_response.count or 0

            # Get recent activity (last 7 days)
            from datetime import datetime, timedelta
            week_ago = (datetime.now() - timedelta(days=7)).isoformat()
            recent_response = (self.supabase.table('notifications')
                               .select('id', count='exact')
                               .gte('created_at', week_ago)
                               .execute())
            recent_notifications = recent_response.count or 0

            return {
                'total_notifications': total_notifications,
                'unread_notifications': unread_notifications,
                'read_notifications': total_notifications - unread_notifications,
                'notifications_by_type': type_stats,
                'recent_notifications': recent_notifications,
                'read_percentage': (total_notifications - unread_notifications) / total_notifications * 100 if total_notifications > 0 else 0
            }
        except Exception as e:
            logger.error(f"Error getting notification statistics: {e}")
            return {
                'total_notifications': 0,
                'unread_notifications': 0,
                'read_notifications': 0,
                'notifications_by_type': {},
                'recent_notifications': 0,
                'read_percentage': 0
            }

    def get_scheduled_notifications(self):
        """Get all scheduled notifications"""
        try:
            from datetime import datetime
            now = datetime.now().isoformat()

            response = (self.supabase.table('notifications')
                        .select('''
                           *,
                           users!notifications_user_id_fkey(name, email),
                           sender:users!notifications_sender_id_fkey(name, email)
                       ''')
                        .gt('scheduled_for', now)
                        .order('scheduled_for', desc=False)
                        .execute())
            return response.data
        except Exception as e:
            logger.error(f"Error getting scheduled notifications: {e}")
            return []

    def cancel_scheduled_notification(self, notification_id: str):
        """Cancel a scheduled notification"""
        try:
            response = (self.supabase.table('notifications')
                        .update({'status': 'cancelled'})
                        .eq('id', notification_id)
                        .eq('status', 'scheduled')
                        .execute())
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error cancelling scheduled notification: {e}")
            return False

    # ============================================================================
    # ADMIN ACTIVITY METHODS
    # ============================================================================

    def get_recent_users(self, limit: int = 10):
        """Get recently registered users"""
        try:
            response = (self.supabase.table('users')
                        .select('*')
                        .order('created_at', desc=True)
                        .limit(limit)
                        .execute())
            return response.data
        except Exception as e:
            logger.error(f"Error getting recent users: {e}")
            return []

    def get_recent_chat_sessions(self, limit: int = 10):
        """Get recent chat sessions with user info"""
        try:
            response = (self.supabase.table('chat_sessions')
                        .select('''
                           *,
                           users(name)
                       ''')
                        .order('created_at', desc=True)
                        .limit(limit)
                        .execute())

            # Format the data to include user_name
            formatted_data = []
            for session in response.data:
                session_data = dict(session)
                if session.get('users'):
                    session_data['user_name'] = session['users']['name']
                formatted_data.append(session_data)

            return formatted_data
        except Exception as e:
            logger.error(f"Error getting recent chat sessions: {e}")
            return []

    def get_recent_courses(self, limit: int = 10):
        """Get recently created courses with instructor info"""
        try:
            response = (self.supabase.table('courses')
                        .select('''
                           *,
                           users!courses_instructor_id_fkey(name)
                       ''')
                        .order('created_at', desc=True)
                        .limit(limit)
                        .execute())

            # Format the data to include instructor_name
            formatted_data = []
            for course in response.data:
                course_data = dict(course)
                if course.get('users'):
                    course_data['instructor_name'] = course['users']['name']
                formatted_data.append(course_data)

            return formatted_data
        except Exception as e:
            logger.error(f"Error getting recent courses: {e}")
            return []

    def get_recent_assignments(self, limit: int = 10):
        """Get recently created assignments"""
        try:
            response = (self.supabase.table('assignments')
                        .select('''
                           *,
                           courses(title),
                           users!assignments_created_by_fkey(name)
                       ''')
                        .order('created_at', desc=True)
                        .limit(limit)
                        .execute())
            return response.data
        except Exception as e:
            logger.error(f"Error getting recent assignments: {e}")
            return []

    def get_recent_submissions(self, limit: int = 10):
        """Get recent assignment submissions"""
        try:
            response = (self.supabase.table('assignment_submissions')
                        .select('''
                           *,
                           assignments(title),
                           users!assignment_submissions_student_id_fkey(name)
                       ''')
                        .order('submitted_at', desc=True)
                        .limit(limit)
                        .execute())
            return response.data
        except Exception as e:
            logger.error(f"Error getting recent submissions: {e}")
            return []

    def inject_sample_courses(self):
        """Inject sample courses for testing"""
        try:
            # Get an instructor (use the first staff user, or create one)
            all_users = self.get_all_users()
            instructors = [user for user in all_users if user['role'] in ['staff', 'admin']]

            if not instructors:
                # Create a sample instructor
                import uuid
                instructor_data = {
                    'id': str(uuid.uuid4()),
                    'email': 'instructor@ai-tutor.com',
                    'name': 'Dr. Sarah Johnson',
                    'role': 'staff',
                    'status': 'active'
                }
                instructor = self.create_user(instructor_data)
                if instructor:
                    instructor_id = instructor['id']
                else:
                    logger.error("Failed to create sample instructor")
                    return False
            else:
                instructor_id = instructors[0]['id']

            # Sample courses data
            sample_courses = [
                {
                    'title': 'Introduction to Python Programming',
                    'description': 'Learn the fundamentals of Python programming including variables, data types, control structures, functions, and object-oriented programming concepts.',
                    'level': 'beginner',
                    'is_active': True,
                    'instructor_id': instructor_id,
                    'thumbnail_url': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
                    'duration_weeks': 8,
                    'estimated_hours': 40
                },
                {
                    'title': 'Web Development with HTML, CSS & JavaScript',
                    'description': 'Master the core technologies of web development. Build responsive websites using HTML5, CSS3, and modern JavaScript.',
                    'level': 'beginner',
                    'is_active': True,
                    'instructor_id': instructor_id,
                    'thumbnail_url': 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400',
                    'duration_weeks': 12,
                    'estimated_hours': 60
                },
                {
                    'title': 'Data Science Fundamentals',
                    'description': 'Explore data analysis, visualization, and machine learning using Python libraries like Pandas, NumPy, and Scikit-learn.',
                    'level': 'intermediate',
                    'is_active': True,
                    'instructor_id': instructor_id,
                    'thumbnail_url': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
                    'duration_weeks': 10,
                    'estimated_hours': 50
                },
                {
                    'title': 'Advanced JavaScript & React',
                    'description': 'Deep dive into modern JavaScript ES6+ features and build dynamic web applications using React framework.',
                    'level': 'advanced',
                    'is_active': True,
                    'instructor_id': instructor_id,
                    'thumbnail_url': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
                    'duration_weeks': 14,
                    'estimated_hours': 70
                },
                {
                    'title': 'Database Design & SQL',
                    'description': 'Learn database concepts, design principles, and master SQL for data manipulation and querying.',
                    'level': 'intermediate',
                    'is_active': True,
                    'instructor_id': instructor_id,
                    'thumbnail_url': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400',
                    'duration_weeks': 6,
                    'estimated_hours': 30
                },
                {
                    'title': 'Mobile App Development with Flutter',
                    'description': 'Build cross-platform mobile applications using Flutter and Dart programming language.',
                    'level': 'intermediate',
                    'is_active': True,
                    'instructor_id': instructor_id,
                    'thumbnail_url': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
                    'duration_weeks': 16,
                    'estimated_hours': 80
                }
            ]

            created_courses = []

            for course_data in sample_courses:
                course = self.create_course(course_data)

                if course:
                    created_courses.append(course)
                    logger.info(f"Created sample course: {course_data['title']}")
                else:
                    logger.error(f"Failed to create course: {course_data['title']}")

            logger.info(f"Successfully created {len(created_courses)} sample courses")
            return created_courses

        except Exception as e:
            logger.error(f"Error injecting sample courses: {e}")
            return False

    def inject_sample_assignments(self):
        """Inject 5 sample assignments of different types for testing"""
        try:
            # Get a course to assign to (use the first available course)
            courses = self.get_courses()
            if not courses:
                logger.error("No courses found. Please create courses first.")
                return False

            course_id = courses[0]['id']

            # Get an instructor (use the first staff user)
            all_users = self.get_all_users()
            instructors = [user for user in all_users if user['role'] in ['staff', 'admin']]
            if not instructors:
                logger.error("No instructors found. Please create staff users first.")
                return False

            instructor_id = instructors[0]['id']

            # Sample assignments data
            sample_assignments = [
                {
                    'title': 'Python Basics Essay',
                    'description': 'Write a comprehensive essay about Python programming fundamentals',
                    'instructions': 'Write a 1000-word essay covering variables, data types, control structures, and functions in Python. Include code examples and explain their purpose.',
                    'assignment_type': 'essay',
                    'max_points': 100,
                    'due_date': '2025-02-15T23:59:00Z',
                    'allow_late_submission': True,
                    'late_penalty_percent': 10,
                    'max_attempts': 2,
                    'time_limit_minutes': 120,
                    'is_published': True,
                    'requires_file_upload': True,
                    'allowed_file_types': ['pdf', 'doc', 'docx'],
                    'max_file_size_mb': 5,
                    'auto_grade': False
                },
                {
                    'title': 'Programming Quiz - Variables and Data Types',
                    'description': 'Multiple choice quiz on Python variables and data types',
                    'instructions': 'Answer all questions about Python variables, data types, and basic operations. You have 30 minutes to complete this quiz.',
                    'assignment_type': 'quiz',
                    'max_points': 50,
                    'due_date': '2025-02-10T23:59:00Z',
                    'allow_late_submission': False,
                    'late_penalty_percent': 0,
                    'max_attempts': 1,
                    'time_limit_minutes': 30,
                    'is_published': True,
                    'requires_file_upload': False,
                    'auto_grade': True
                },
                {
                    'title': 'Web Development Project - Personal Portfolio',
                    'description': 'Create a personal portfolio website using HTML, CSS, and JavaScript',
                    'instructions': 'Build a responsive personal portfolio website that includes: About section, Projects showcase, Contact form, and Navigation menu. Use modern CSS techniques and ensure mobile compatibility.',
                    'assignment_type': 'project',
                    'max_points': 150,
                    'due_date': '2025-03-01T23:59:00Z',
                    'allow_late_submission': True,
                    'late_penalty_percent': 5,
                    'max_attempts': 3,
                    'time_limit_minutes': None,
                    'is_published': True,
                    'requires_file_upload': True,
                    'allowed_file_types': ['zip', 'html', 'css', 'js'],
                    'max_file_size_mb': 20,
                    'auto_grade': False
                },
                {
                    'title': 'Weekly Homework - Functions and Loops',
                    'description': 'Practice problems on Python functions and loop structures',
                    'instructions': 'Complete the following programming exercises: 1) Write a function to calculate factorial, 2) Create a loop to find prime numbers, 3) Implement a function to reverse a string, 4) Write a program to count vowels in a sentence.',
                    'assignment_type': 'homework',
                    'max_points': 75,
                    'due_date': '2025-02-08T23:59:00Z',
                    'allow_late_submission': True,
                    'late_penalty_percent': 15,
                    'max_attempts': 2,
                    'time_limit_minutes': 90,
                    'is_published': True,
                    'requires_file_upload': True,
                    'allowed_file_types': ['py', 'txt', 'pdf'],
                    'max_file_size_mb': 2,
                    'auto_grade': False
                },
                {
                    'title': 'Data Structures Presentation',
                    'description': 'Create and deliver a presentation on advanced data structures',
                    'instructions': 'Prepare a 15-minute presentation on one of the following topics: Binary Trees, Hash Tables, Graphs, or Heaps. Include visual diagrams, code examples, and real-world applications. Submit your slides and present to the class.',
                    'assignment_type': 'presentation',
                    'max_points': 120,
                    'due_date': '2025-02-25T23:59:00Z',
                    'allow_late_submission': True,
                    'late_penalty_percent': 20,
                    'max_attempts': 1,
                    'time_limit_minutes': None,
                    'is_published': True,
                    'requires_file_upload': True,
                    'allowed_file_types': ['ppt', 'pptx', 'pdf'],
                    'max_file_size_mb': 15,
                    'auto_grade': False
                }
            ]

            created_assignments = []

            for assignment_data in sample_assignments:
                # Parse due_date
                from datetime import datetime
                due_date = None
                if assignment_data['due_date']:
                    due_date = datetime.fromisoformat(assignment_data['due_date'].replace('Z', '+00:00'))

                assignment = self.create_assignment(
                    course_id=course_id,
                    title=assignment_data['title'],
                    description=assignment_data['description'],
                    instructions=assignment_data['instructions'],
                    assignment_type=assignment_data['assignment_type'],
                    due_date=due_date,
                    points_possible=assignment_data['max_points'],
                    is_published=assignment_data['is_published'],
                    created_by=instructor_id,
                    allow_late_submission=assignment_data.get('allow_late_submission', True),
                    late_penalty_percent=assignment_data.get('late_penalty_percent', 0),
                    max_attempts=assignment_data.get('max_attempts', 1),
                    time_limit_minutes=assignment_data.get('time_limit_minutes'),
                    requires_file_upload=assignment_data.get('requires_file_upload', False),
                    allowed_file_types=assignment_data.get('allowed_file_types', []),
                    max_file_size_mb=assignment_data.get('max_file_size_mb', 10),
                    auto_grade=assignment_data.get('auto_grade', False)
                )

                if assignment:
                    created_assignments.append(assignment)
                    logger.info(f"Created sample assignment: {assignment_data['title']}")
                else:
                    logger.error(f"Failed to create assignment: {assignment_data['title']}")

            logger.info(f"Successfully created {len(created_assignments)} sample assignments")
            return created_assignments

        except Exception as e:
            logger.error(f"Error injecting sample assignments: {e}")
            return False

    # ============================================================================
    # ASSIGNMENT QUESTIONS METHODS
    # ============================================================================

    def create_assignment_question(self, assignment_id, question_text, question_type='text',
                                   options=None, correct_answer=None, points=1, order_index=1):
        """Create a question for an assignment"""
        try:
            question_data = {
                'assignment_id': assignment_id,
                'question_text': question_text,
                'question_type': question_type,  # text, multiple_choice, true_false, essay
                'options': options,  # JSON array for multiple choice
                'correct_answer': correct_answer,
                'points': points,
                'order_index': order_index
            }

            result = self.supabase.table('assignment_questions').insert(question_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating assignment question: {e}")
            return None

    def get_assignment_questions(self, assignment_id):
        """Get all questions for an assignment"""
        try:
            result = self.supabase.table('assignment_questions').select('*').eq('assignment_id', assignment_id).order('order_index').execute()
            return result.data
        except Exception as e:
            logger.error(f"Error getting assignment questions: {e}")
            return []

    def update_assignment_question(self, question_id, **updates):
        """Update an assignment question"""
        try:
            result = self.supabase.table('assignment_questions').update(updates).eq('id', question_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error updating assignment question: {e}")
            return None

    def delete_assignment_question(self, question_id):
        """Delete an assignment question"""
        try:
            result = self.supabase.table('assignment_questions').delete().eq('id', question_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting assignment question: {e}")
            return False


    def get_assignment_question_by_id(self, question_id):
        """Get a specific assignment question by ID"""
        try:
            result = self.supabase.table('assignment_questions').select('*').eq('id', question_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting assignment question: {e}")
            return None

    def submit_assignment_answers(self, submission_id, answers):
        """Submit answers for assignment questions"""
        try:
            # answers should be a list of {question_id, answer_text, selected_option}
            answer_records = []
            for answer in answers:
                answer_records.append({
                    'submission_id': submission_id,
                    'question_id': answer['question_id'],
                    'answer_text': answer.get('answer_text'),
                    'selected_option': answer.get('selected_option')
                })

            result = self.supabase.table('assignment_answers').insert(answer_records).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error submitting assignment answers: {e}")
            return None

    def get_submission_answers(self, submission_id):
        """Get answers for a submission"""
        try:
            result = self.supabase.table('assignment_answers').select('''
                *,
                assignment_questions(question_text, question_type, options, correct_answer, points)
            ''').eq('submission_id', submission_id).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error getting submission answers: {e}")
            return []

    def auto_grade_submission(self, submission_id):
        """Automatically grade a submission based on correct answers"""
        try:
            answers = self.get_submission_answers(submission_id)
            total_points = 0
            earned_points = 0

            for answer in answers:
                question = answer['assignment_questions']
                total_points += question['points']

                # Check if answer is correct
                if question['question_type'] == 'multiple_choice':
                    if answer['selected_option'] == question['correct_answer']:
                        earned_points += question['points']
                elif question['question_type'] == 'true_false':
                    if answer['selected_option'] == question['correct_answer']:
                        earned_points += question['points']
                # For text/essay questions, manual grading is required

            return {
                'total_points': total_points,
                'earned_points': earned_points,
                'percentage': (earned_points / total_points * 100) if total_points > 0 else 0
            }
        except Exception as e:
            logger.error(f"Error auto-grading submission: {e}")
            return None

    def update_user_status(self, user_id: str, status: str):
        """Update user status (active, suspended, inactive)"""
        try:
            response = self.supabase.table('users').update({
                'status': status,
                'updated_at': datetime.now().isoformat()
            }).eq('id', user_id).execute()
            
            if response.data:
                logger.info(f"User {user_id} status updated to {status}")
                return True
            else:
                logger.error(f"No user found with id {user_id}")
                return False
        except Exception as e:
            logger.error(f"Error updating user status: {e}")
            return False

    def delete_user(self, user_id: str):
        """Delete a user account"""
        try:
            # First, delete related records (enrollments, submissions, etc.)
            # The order matters due to foreign key constraints
            
            # Handle notifications - delete notifications sent by this user since sender_id 
            # doesn't have CASCADE delete. We delete rather than set to NULL to maintain data integrity
            self.supabase.table('notifications').delete().eq('sender_id', user_id).execute()
            
            # Delete user's received notifications (has CASCADE but being explicit)
            self.supabase.table('notifications').delete().eq('user_id', user_id).execute()
            
            # Delete AI interactions
            self.supabase.table('ai_interactions').delete().eq('user_id', user_id).execute()
            
            # Delete assignment-related data
            self.supabase.table('assignment_submissions').delete().eq('student_id', user_id).execute()
            self.supabase.table('assignment_comments').delete().eq('commenter_id', user_id).execute()
            self.supabase.table('assignment_extensions').delete().eq('student_id', user_id).execute()
            self.supabase.table('assignment_extensions').delete().eq('granted_by', user_id).execute()
            self.supabase.table('assignment_grades').delete().eq('graded_by', user_id).execute()
            
            # Delete assignments created by this user
            self.supabase.table('assignments').delete().eq('created_by', user_id).execute()
            
            # Delete course-related data
            self.supabase.table('course_enrollments').delete().eq('student_id', user_id).execute()
            self.supabase.table('courses').delete().eq('instructor_id', user_id).execute()
            
            # Delete learning progress data
            self.supabase.table('lesson_progress').delete().eq('student_id', user_id).execute()
            
            # Delete assignment submissions (replaces quiz_attempts)
            self.supabase.table('assignment_submissions').delete().eq('student_id', user_id).execute()
            
            # Delete study sessions
            self.supabase.table('study_sessions').delete().eq('user_id', user_id).execute()
            
            # Delete user achievements
            self.supabase.table('user_achievements').delete().eq('user_id', user_id).execute()
            
            # Delete user profiles
            self.supabase.table('user_profiles').delete().eq('user_id', user_id).execute()
            
            # Delete user progress
            self.supabase.table('user_progress').delete().eq('user_id', user_id).execute()
            
            # Delete chat sessions
            self.supabase.table('chat_sessions').delete().eq('user_id', user_id).execute()
            
            # Finally, delete the user
            response = self.supabase.table('users').delete().eq('id', user_id).execute()
            
            if response.data:
                logger.info(f"User {user_id} deleted successfully")
                return True
            else:
                logger.error(f"No user found with id {user_id}")
                return False
        except Exception as e:
            logger.error(f"Error deleting user: {e}")
            return False

    # ============================================================================
    # MESSAGING SYSTEM METHODS
    # ============================================================================

    def create_message(self, message_data: dict):
        """Create a new message"""
        try:
            response = self.supabase.table('messages').insert(message_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating message: {e}")
            return None

    def get_user_messages(self, user_id: str):
        """Get all messages for a user (sent and received)"""
        try:
            response = (self.supabase.table('messages')
                        .select('''
                            *,
                            sender:users!messages_sender_id_fkey(id, name, email, role),
                            recipient:users!messages_recipient_id_fkey(id, name, email, role)
                        ''')
                        .or_(f'sender_id.eq.{user_id},recipient_id.eq.{user_id}')
                        .order('created_at', desc=True)
                        .execute())
            return response.data
        except Exception as e:
            logger.error(f"Error getting user messages: {e}")
            return []

    def get_user_conversations(self, user_id: str):
        """Get all conversations for a user"""
        try:
            # Get all messages involving this user
            messages = self.get_user_messages(user_id)
            
            # Group by conversation partner
            conversations = {}
            for message in messages:
                other_user_id = message['sender_id'] if message['sender_id'] != user_id else message['recipient_id']
                other_user = message['sender'] if message['sender_id'] != user_id else message['recipient']
                
                if other_user_id not in conversations:
                    conversations[other_user_id] = {
                        'user_id': other_user_id,
                        'user_name': other_user.get('name', 'Unknown'),
                        'user_email': other_user.get('email', ''),
                        'user_role': other_user.get('role', ''),
                        'last_message': message,
                        'unread_count': 0,
                        'message_count': 0
                    }
                
                conversations[other_user_id]['message_count'] += 1
                if not message['is_read'] and message['recipient_id'] == user_id:
                    conversations[other_user_id]['unread_count'] += 1
                
                # Update last message if this one is more recent
                if not conversations[other_user_id]['last_message'] or message['created_at'] > conversations[other_user_id]['last_message']['created_at']:
                    conversations[other_user_id]['last_message'] = message
            
            # Convert to list and sort by last message time
            conversation_list = list(conversations.values())
            conversation_list.sort(key=lambda x: x['last_message']['created_at'], reverse=True)
            
            return conversation_list
        except Exception as e:
            logger.error(f"Error getting user conversations: {e}")
            return []

    def get_conversation_messages(self, user_id: str, other_user_id: str):
        """Get messages between two users"""
        try:
            response = (self.supabase.table('messages')
                        .select('''
                            *,
                            sender:users!messages_sender_id_fkey(id, name, email, role),
                            recipient:users!messages_recipient_id_fkey(id, name, email, role)
                        ''')
                        .or_(f'and(sender_id.eq.{user_id},recipient_id.eq.{other_user_id}),and(sender_id.eq.{other_user_id},recipient_id.eq.{user_id})')
                        .order('created_at', desc=False)
                        .execute())
            return response.data
        except Exception as e:
            logger.error(f"Error getting conversation messages: {e}")
            return []

    def mark_message_read(self, message_id: str, user_id: str):
        """Mark a message as read"""
        try:
            response = (self.supabase.table('messages')
                        .update({'is_read': True})
                        .eq('id', message_id)
                        .eq('recipient_id', user_id)
                        .execute())
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error marking message as read: {e}")
            return False

    def get_unread_message_count(self, user_id: str):
        """Get count of unread messages for a user"""
        try:
            response = (self.supabase.table('messages')
                        .select('id', count='exact')
                        .eq('recipient_id', user_id)
                        .eq('is_read', False)
                        .execute())
            return response.count or 0
        except Exception as e:
            logger.error(f"Error getting unread message count: {e}")
            return 0

    # ============================================================================
    # ADMIN & STAFF MONITORING METHODS
    # ============================================================================

    def get_recent_users(self, limit: int = 10):
        """Get recently created users"""
        try:
            response = (self.supabase.table('users')
                        .select('id, name, email, role, created_at, status')
                        .order('created_at', desc=True)
                        .limit(limit)
                        .execute())
            return response.data
        except Exception as e:
            logger.error(f"Error getting recent users: {e}")
            return []

    def get_recent_courses(self, limit: int = 10):
        """Get recently created courses"""
        try:
            response = (self.supabase.table('courses')
                        .select('id, title, subject, instructor_id, created_at, is_active')
                        .order('created_at', desc=True)
                        .limit(limit)
                        .execute())
            return response.data
        except Exception as e:
            logger.error(f"Error getting recent courses: {e}")
            return []

    def get_recent_assignments(self, limit: int = 10):
        """Get recently created assignments"""
        try:
            response = (self.supabase.table('assignments')
                        .select('id, title, assignment_type, course_id, created_at, is_published')
                        .order('created_at', desc=True)
                        .limit(limit)
                        .execute())
            return response.data
        except Exception as e:
            logger.error(f"Error getting recent assignments: {e}")
            return []

    def get_all_assignments(self, page: int | None = None, limit: int | None = None,
                             order_by: str = 'created_at', desc: bool = True):
        """Get all assignments in the system, optionally paginated."""
        try:
            query = (self.supabase.table('assignments')
                     .select('''
                         *,
                         courses!assignments_course_id_fkey(id, title, subject),
                         users!assignments_created_by_fkey(id, name, email)
                     '''))

            # Order
            try:
                query = query.order(order_by, desc=desc)
            except Exception:
                query = query.order('id', desc=True)

            # Pagination: prefer range when available
            if page is not None and limit is not None:
                start = (max(page, 1) - 1) * max(limit, 1)
                end = start + max(limit, 1) - 1
                try:
                    query = query.range(start, end)
                except Exception:
                    # Fallback to limit only
                    query = query.limit(limit)

            response = query.execute()
            return response.data
        except Exception as e:
            logger.error(f"Error getting all assignments: {e}")
            return []

    def get_assignment_submissions(self, assignment_id: str):
        """Get all submissions for a specific assignment"""
        try:
            response = (self.supabase.table('assignment_submissions')
                        .select('''
                            *,
                            users!assignment_submissions_student_id_fkey(id, name, email),
                            assignments!assignment_submissions_assignment_id_fkey(id, title, max_points)
                        ''')
                        .eq('assignment_id', assignment_id)
                        .order('submitted_at', desc=True)
                        .execute())
            return response.data
        except Exception as e:
            logger.error(f"Error getting assignment submissions: {e}")
            return []

    def get_recent_activity(self, user_id: str, limit: int = 10):
        """Get recent activity for a user"""
        try:
            # This would typically come from an activity log table
            # For now, we'll simulate activity based on user's recent actions
            activities = []
            
            # Get recent submissions
            submissions = (self.supabase.table('assignment_submissions')
                          .select('id, assignment_id, submitted_at, status')
                          .eq('student_id', user_id)
                          .order('submitted_at', desc=True)
                          .limit(limit // 2)
                          .execute())
            
            for submission in submissions.data:
                activities.append({
                    'id': f"submission_{submission['id']}",
                    'type': 'assignment_submission',
                    'description': f'Submitted assignment',
                    'timestamp': submission['submitted_at'],
                    'data': submission
                })
            
            # Get recent enrollments
            enrollments = (self.supabase.table('course_enrollments')
                          .select('id, course_id, enrolled_at')
                          .eq('student_id', user_id)
                          .order('enrolled_at', desc=True)
                          .limit(limit // 2)
                          .execute())
            
            for enrollment in enrollments.data:
                activities.append({
                    'id': f"enrollment_{enrollment['id']}",
                    'type': 'course_enrollment',
                    'description': f'Enrolled in course',
                    'timestamp': enrollment['enrolled_at'],
                    'data': enrollment
                })
            
            # Sort by timestamp and return limited results
            activities.sort(key=lambda x: x['timestamp'], reverse=True)
            return activities[:limit]
            
        except Exception as e:
            logger.error(f"Error getting recent activity: {e}")
            return []

    def get_student_activities(self, period: str = '7d'):
        """Get student activities for admin monitoring with real database data"""
        try:
            # Calculate date range based on period
            from datetime import datetime, timedelta
            
            if period == '1d':
                days = 1
            elif period == '7d':
                days = 7
            elif period == '30d':
                days = 30
            else:
                days = 7
            
            start_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
            
            activities = []
            
            # Get recent assignment submissions with proper joins
            submissions = (self.supabase.table('assignment_submissions')
                          .select('''
                              *,
                              users!assignment_submissions_student_id_fkey(name, email),
                              assignments!assignment_submissions_assignment_id_fkey(
                                  title,
                                  courses!assignments_course_id_fkey(
                                      title,
                                      subjects!courses_subject_id_fkey(name)
                                  )
                              ),
                              assignment_grades!assignment_grades_submission_id_fkey(percentage, points_earned, letter_grade)
                          ''')
                          .gte('submitted_at', start_date)
                          .order('submitted_at', desc=True)
                          .limit(50)
                          .execute())
            
            for submission in submissions.data or []:
                user = submission.get('users', {})
                assignment = submission.get('assignments', {})
                course = assignment.get('courses', {}) if assignment else {}
                subject = course.get('subjects', {}) if course else {}
                grade_info = submission.get('assignment_grades', {})
                
                activities.append({
                    'id': f"submission_{submission['id']}",
                    'activity_type': 'assignment_submission',
                    'student_id': submission.get('student_id'),
                    'student_name': user.get('name', 'Unknown'),
                    'student_email': user.get('email', ''),
                    'description': f"Submitted assignment: {assignment.get('title', 'Unknown')}",
                    'subject': subject.get('name', 'General'),
                    'timestamp': submission['submitted_at'],
                    'duration': None,  # Assignment submissions don't have duration
                    'grade': grade_info.get('percentage') if grade_info else None,
                    'status': submission.get('status', 'unknown'),
                    'details': {
                        'assignment_id': submission.get('assignment_id'),
                        'submission_id': submission['id'],
                        'is_late': submission.get('is_late', False),
                        'course_title': course.get('title', 'Unknown Course')
                    }
                })
            
            # Get recent course enrollments with subject info
            enrollments = (self.supabase.table('course_enrollments')
                          .select('''
                              *,
                              users!course_enrollments_student_id_fkey(name, email),
                              courses!course_enrollments_course_id_fkey(
                                  title,
                                  subjects!courses_subject_id_fkey(name)
                              )
                          ''')
                          .gte('enrolled_at', start_date)
                          .order('enrolled_at', desc=True)
                          .limit(30)
                          .execute())
            
            for enrollment in enrollments.data or []:
                user = enrollment.get('users', {})
                course = enrollment.get('courses', {})
                subject = course.get('subjects', {}) if course else {}
                
                activities.append({
                    'id': f"enrollment_{enrollment['id']}",
                    'activity_type': 'course_enrollment',
                    'student_id': enrollment.get('student_id'),
                    'student_name': user.get('name', 'Unknown'),
                    'student_email': user.get('email', ''),
                    'description': f"Enrolled in course: {course.get('title', 'Unknown')}",
                    'subject': subject.get('name', 'General'),
                    'timestamp': enrollment['enrolled_at'],
                    'duration': None,  # Enrollments don't have duration
                    'grade': None,     # Enrollments don't have grades
                    'status': 'enrolled',  # Schema doesn't have status field for enrollments
                    'details': {
                        'course_id': enrollment.get('course_id'),
                        'enrollment_id': enrollment['id']
                    }
                })
            
            # Get recent quiz attempts (using assignment_submissions for quiz type assignments)
            quiz_submissions = (self.supabase.table('assignment_submissions')
                           .select('''
                               *,
                               users!assignment_submissions_student_id_fkey(name, email),
                               assignments!assignment_submissions_assignment_id_fkey(title, assignment_type)
                           ''')
                           .gte('submitted_at', start_date)
                           .order('submitted_at', desc=True)
                           .limit(20)
                           .execute())
            
            for submission in quiz_submissions.data or []:
                user = submission.get('users', {})
                assignment = submission.get('assignments', {})
                
                # Only include quiz-type assignments for quiz activities
                if assignment.get('assignment_type') == 'quiz':
                    activities.append({
                        'id': f"quiz_{submission['id']}",
                        'student_id': submission['student_id'],
                        'student_name': user.get('name', 'Unknown'),
                        'student_email': user.get('email', ''),
                        'activity_type': 'quiz_completion',
                        'description': f"Completed quiz: {assignment.get('title', 'Unknown Quiz')}",
                        'subject': 'Programming',  # You can enhance this with course lookup
                        'timestamp': submission['submitted_at'],
                        'duration': submission.get('duration_minutes'),
                        'grade': submission.get('grade'),
                        'status': submission.get('status', 'submitted'),
                        'details': {
                            'assignment_id': submission.get('assignment_id'),
                            'submission_id': submission['id'],
                            'attempt_number': submission.get('attempt_number', 1)
                        }
                    })
            
            # Get recent lesson progress
            lesson_progress = (self.supabase.table('lesson_progress')
                             .select('''
                                 *,
                                 users!lesson_progress_student_id_fkey(name, email),
                                 lessons!lesson_progress_lesson_id_fkey(title, course_id)
                             ''')
                             .gte('completed_at', start_date)
                             .order('completed_at', desc=True)
                             .limit(30)
                             .execute())
            
            for progress in lesson_progress.data or []:
                user = progress.get('users', {})
                lesson = progress.get('lessons', {})
                
                activities.append({
                    'id': f"lesson_{progress['id']}",
                    'student_id': progress['student_id'],
                    'student_name': user.get('name', 'Unknown'),
                    'student_email': user.get('email', ''),
                    'activity_type': 'lesson_completion',
                    'description': f"Completed lesson: {lesson.get('title', 'Unknown Lesson')}",
                    'subject': 'Programming',  # You can enhance this with course lookup
                    'timestamp': progress['completed_at'],
                    'duration': progress.get('time_spent_minutes'),
                    'grade': None,  # Lessons don't typically have grades
                    'status': 'completed',
                    'details': {
                        'lesson_id': progress.get('lesson_id'),
                        'course_id': lesson.get('course_id'),
                        'time_spent': progress.get('time_spent_minutes'),
                        'notes': progress.get('notes')
                    }
                })
            
            # Sort all activities by timestamp
            activities.sort(key=lambda x: x['timestamp'], reverse=True)
            
            # Return limited results
            return activities[:100]
            
        except Exception as e:
            logger.error(f"Error getting student activities: {e}")
            # Return empty list instead of mock data on error
            return []

    def get_user_stats(self, user_id: str):
        """Get comprehensive user statistics"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                return {}
            
            if user['role'] == 'student':
                # Get student-specific stats
                enrollments = self.get_student_enrollments(user_id)
                total_courses = len(enrollments)
                
                total_assignments = 0
                completed_assignments = 0
                total_points = 0
                
                for enrollment in enrollments:
                    assignments = self.get_assignments_by_course(enrollment['course_id'])
                    total_assignments += len(assignments)
                    
                    submissions = self.get_student_submissions(user_id, enrollment['course_id'])
                    completed_assignments += len([s for s in submissions if s.get('status') == 'submitted'])
                    
                    for submission in submissions:
                        if submission.get('grade'):
                            total_points += submission['grade'].get('points_earned', 0)
                
                return {
                    'coursesCompleted': total_courses,
                    'totalPoints': total_points,
                    'studyHours': 0,  # Would need tracking system
                    'achievements': 0,  # Would need achievements system
                    'assignmentsCompleted': completed_assignments,
                    'totalAssignments': total_assignments,
                    'averageGrade': total_points / completed_assignments if completed_assignments > 0 else 0
                }
            
            elif user['role'] == 'staff':
                # Get staff-specific stats
                courses = self.get_courses()
                my_courses = [c for c in courses if c.get('instructor_id') == user_id]
                
                total_students = 0
                for course in my_courses:
                    enrollments = self.get_course_enrollments(course['id'])
                    total_students += len(enrollments)
                
                return {
                    'coursesCreated': len(my_courses),
                    'totalStudents': total_students,
                    'avgRating': 4.5,  # Would need rating system
                    'totalHours': 0  # Would need tracking system
                }
            
            else:
                # Admin stats
                all_users = self.get_all_users()
                all_courses = self.get_courses()
                
                return {
                    'totalUsers': len(all_users),
                    'totalCourses': len(all_courses),
                    'systemHealth': 'healthy'
                }
                
        except Exception as e:
            logger.error(f"Error getting user stats: {e}")
            return {}

# Create a global database instance
db = DatabaseManager()

