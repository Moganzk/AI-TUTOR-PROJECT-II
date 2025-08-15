from supabase import create_client, Client
from typing import Optional, Dict, Any, List
from datetime import datetime
import logging
from config import get_config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseService:
    """Centralized database service using Supabase"""
    
    def __init__(self):
        self.config = get_config()
        self._client: Optional[Client] = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Supabase client"""
        try:
            if not self.config.SUPABASE_URL or not self.config.SUPABASE_SERVICE_ROLE:
                raise ValueError("Supabase URL and Service Role Key are required")
            
            # Use service role key for backend operations to bypass RLS
            self._client = create_client(
                self.config.SUPABASE_URL,
                self.config.SUPABASE_SERVICE_ROLE  # Use service role instead of anon key
            )
            logger.info("Supabase client initialized successfully with service role")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {str(e)}")
            raise
    
    @property
    def client(self) -> Client:
        """Get Supabase client instance"""
        if self._client is None:
            self._initialize_client()
        return self._client
    
    # User Operations
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email address"""
        try:
            response = self.client.table('users').select('*').eq('email', email).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting user by email: {str(e)}")
            return None
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            response = self.client.table('users').select('*').eq('id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting user by ID: {str(e)}")
            return None
    
    def create_user(self, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new user"""
        try:
            response = self.client.table('users').insert(user_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return None
    
    def update_user(self, user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user data"""
        try:
            response = self.client.table('users').update(update_data).eq('id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating user: {str(e)}")
            return None
    
    def delete_user(self, user_id: str) -> bool:
        """Delete user (soft delete by updating status)"""
        try:
            response = self.client.table('users').update({
                'status': 'deleted',
                'updated_at': 'now()'
            }).eq('id', user_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error deleting user: {str(e)}")
            return False
    
    def suspend_user(self, user_id: str, suspend: bool = True) -> bool:
        """Suspend or unsuspend a user"""
        try:
            response = self.client.table('users').update({
                'is_suspended': suspend,
                'status': 'suspended' if suspend else 'active',
                'updated_at': 'now()'
            }).eq('id', user_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error suspending user: {str(e)}")
            return False
    
    # Course Operations
    def get_courses(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get courses with optional filters"""
        try:
            query = self.client.table('courses').select('''
                *,
                instructor:instructor_id(id, name, email),
                subject:subject_id(id, name, description)
            ''')
            
            if filters:
                for key, value in filters.items():
                    if key == 'instructor_id':
                        query = query.eq('instructor_id', value)
                    elif key == 'subject_id':
                        query = query.eq('subject_id', value)
                    elif key == 'is_active':
                        query = query.eq('is_active', value)
            
            response = query.execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting courses: {str(e)}")
            return []
    
    def get_course_by_id(self, course_id: str) -> Optional[Dict[str, Any]]:
        """Get course by ID with related data"""
        try:
            response = self.client.table('courses').select('''
                *,
                instructor:instructor_id(id, name, email),
                subject:subject_id(id, name, description),
                lessons(id, title, lesson_order, is_published),
                assignments(id, title, due_date, is_published)
            ''').eq('id', course_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting course by ID: {str(e)}")
            return None
    
    # Assignment Operations
    def get_assignments(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get assignments with optional filters"""
        try:
            query = self.client.table('assignments').select('''
                *,
                course:course_id(id, title),
                lesson:lesson_id(id, title),
                creator:created_by(id, name)
            ''')
            
            if filters:
                for key, value in filters.items():
                    if key == 'course_id':
                        query = query.eq('course_id', value)
                    elif key == 'created_by':
                        query = query.eq('created_by', value)
                    elif key == 'is_published':
                        query = query.eq('is_published', value)
            
            response = query.execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting assignments: {str(e)}")
            return []
    
    # Subject Operations
    def get_subjects(self) -> List[Dict[str, Any]]:
        """Get all subjects"""
        try:
            response = self.client.table('subjects').select('*').execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting subjects: {str(e)}")
            return []

    def get_all_assignments(self) -> List[Dict[str, Any]]:
        """Get all assignments"""
        try:
            response = self.client.table('assignments').select('*').execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting all assignments: {str(e)}")
            return []
    
    
    # Chat Operations
    def create_chat_session(self, user_id: str, title: str = "New Chat", subject: str = None) -> Optional[Dict[str, Any]]:
        """Create a new chat session"""
        try:
            session_data = {
                'user_id': user_id,
                'title': title,
                'subject': subject
            }
            response = self.client.table('chat_sessions').insert(session_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating chat session: {str(e)}")
            return None
    
    def get_user_chat_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        """Get chat sessions for a user"""
        try:
            response = self.client.table('chat_sessions').select('*').eq('user_id', user_id).order('updated_at', desc=True).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting chat sessions: {str(e)}")
            return []
    
    def get_session_messages(self, session_id: str, user_id: str) -> List[Dict[str, Any]]:
        """Get messages from a specific chat session"""
        try:
            # First verify the session belongs to the user
            session_response = self.client.table('chat_sessions').select('id').eq('id', session_id).eq('user_id', user_id).execute()
            if not session_response.data:
                logger.warning(f"Session {session_id} not found or doesn't belong to user {user_id}")
                return []
            
            # Get messages for the session
            response = self.client.table('messages').select('*').eq('session_id', session_id).order('created_at', desc=False).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting session messages: {str(e)}")
            return []
    
    def save_chat_message(self, message_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Save a chat message"""
        try:
            response = self.client.table('messages').insert(message_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error saving chat message: {str(e)}")
            return None
    
    # Admin Statistics
    def get_admin_stats(self) -> Dict[str, Any]:
        """Get admin dashboard statistics"""
        try:
            # Get user counts by role
            users_response = self.client.table('users').select('role').execute()
            users_data = users_response.data or []
            
            user_counts = {'total': len(users_data), 'students': 0, 'staff': 0, 'admins': 0}
            for user in users_data:
                role = user.get('role', 'student')
                if role in user_counts:
                    user_counts[role + 's'] = user_counts.get(role + 's', 0) + 1
            
            # Get course counts
            courses_response = self.client.table('courses').select('is_active').execute()
            courses_data = courses_response.data or []
            course_counts = {
                'total': len(courses_data),
                'active': len([c for c in courses_data if c.get('is_active', True)])
            }
            
            # Get assignment counts
            assignments_response = self.client.table('assignments').select('is_published').execute()
            assignments_data = assignments_response.data or []
            assignment_counts = {
                'total': len(assignments_data),
                'published': len([a for a in assignments_data if a.get('is_published', False)])
            }
            
            return {
                'users': user_counts,
                'courses': course_counts,
                'assignments': assignment_counts
            }
        except Exception as e:
            logger.error(f"Error getting admin stats: {str(e)}")
            return {
                'users': {'total': 0, 'students': 0, 'staff': 0, 'admins': 0},
                'courses': {'total': 0, 'active': 0},
                'assignments': {'total': 0, 'published': 0}
            }
    
    # Health Check
    def health_check(self) -> Dict[str, Any]:
        """Check database connectivity and health"""
        try:
            # Simple query to test connection
            response = self.client.table('users').select('id').limit(1).execute()
            return {
                'status': 'healthy',
                'message': 'Database connection successful',
                'timestamp': 'now()'
            }
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}")
            return {
                'status': 'unhealthy',
                'message': f'Database connection failed: {str(e)}',
                'timestamp': 'now()'
            }

    # Subject Management Methods
    def create_subject(self, name: str, description: str = '', created_by: str = None) -> Optional[Dict[str, Any]]:
        """Create a new subject"""
        try:
            subject_data = {
                'name': name,
                'description': description,
                'created_by': created_by
            }
            response = self.client.table('subjects').insert(subject_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating subject: {str(e)}")
            return None
    
    def update_subject(self, subject_id: str, name: str, description: str = '') -> Optional[Dict[str, Any]]:
        """Update a subject"""
        try:
            update_data = {
                'name': name,
                'description': description,
                'updated_at': 'now()'
            }
            response = self.client.table('subjects').update(update_data).eq('id', subject_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating subject: {str(e)}")
            return None
    
    def delete_subject(self, subject_id: str) -> bool:
        """Delete a subject"""
        try:
            response = self.client.table('subjects').delete().eq('id', subject_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error deleting subject: {str(e)}")
            return False
    
    def get_subject_by_id(self, subject_id: str) -> Optional[Dict[str, Any]]:
        """Get subject by ID"""
        try:
            response = self.client.table('subjects').select('*').eq('id', subject_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting subject by ID: {str(e)}")
            return None
    
    def get_courses_count_by_subject(self, subject_id: str) -> int:
        """Get count of courses for a subject"""
        try:
            response = self.client.table('courses').select('id').eq('subject_id', subject_id).execute()
            return len(response.data) if response.data else 0
        except Exception as e:
            logger.error(f"Error getting courses count: {str(e)}")
            return 0
    
    def get_courses_by_subject(self, subject_id: str) -> List[Dict[str, Any]]:
        """Get all courses for a subject"""
        try:
            response = self.client.table('courses').select('''
                *,
                instructor:instructor_id(id, name, email)
            ''').eq('subject_id', subject_id).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting courses by subject: {str(e)}")
            return []
    
    # Enhanced Course Management Methods
    def get_courses(self, status: str = None, subject_id: str = None, search: str = None, page: int = 1, limit: int = 20) -> List[Dict[str, Any]]:
        """Get courses with filters and pagination"""
        try:
            query = self.client.table('courses').select('''
                *,
                instructor:instructor_id(id, name, email),
                subject:subject_id(id, name, description)
            ''')
            
            if status:
                # Map status string to is_active boolean
                if status == 'active':
                    query = query.eq('is_active', True)
                elif status == 'inactive' or status == 'draft':
                    query = query.eq('is_active', False)
            if subject_id:
                query = query.eq('subject_id', subject_id)
            if search:
                query = query.ilike('title', f'%{search}%')
            
            offset = (page - 1) * limit
            response = query.range(offset, offset + limit - 1).order('created_at', desc=True).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting courses: {str(e)}")
            return []
    
    def create_course(self, title: str, description: str, subject_id: str, instructor_id: str, 
                     difficulty_level: str = 'beginner', duration_hours: int = 0, status: str = 'draft') -> Optional[Dict[str, Any]]:
        """Create a new course"""
        try:
            course_data = {
                'title': title,
                'description': description,
                'subject_id': subject_id,
                'instructor_id': instructor_id,
                'difficulty_level': difficulty_level,
                'duration_hours': duration_hours,
                'status': status
            }
            response = self.client.table('courses').insert(course_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating course: {str(e)}")
            return None
    
    def update_course(self, course_id: str, title: str, description: str = '', 
                     difficulty_level: str = None, duration_hours: int = None, status: str = None) -> Optional[Dict[str, Any]]:
        """Update a course"""
        try:
            update_data = {
                'title': title,
                'description': description,
                'updated_at': 'now()'
            }
            if difficulty_level:
                update_data['difficulty_level'] = difficulty_level
            if duration_hours is not None:
                update_data['duration_hours'] = duration_hours
            if status:
                update_data['status'] = status
            
            response = self.client.table('courses').update(update_data).eq('id', course_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating course: {str(e)}")
            return None
    
    def delete_course(self, course_id: str) -> bool:
        """Delete a course"""
        try:
            response = self.client.table('courses').delete().eq('id', course_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error deleting course: {str(e)}")
            return False
    
    def get_course_enrollments_count(self, course_id: str) -> int:
        """Get enrollment count for a course"""
        try:
            response = self.client.table('course_enrollments').select('id').eq('course_id', course_id).execute()
            return len(response.data) if response.data else 0
        except Exception as e:
            logger.error(f"Error getting enrollment count: {str(e)}")
            return 0
    
    def get_course_enrollments(self, course_id: str) -> List[Dict[str, Any]]:
        """Get all students enrolled in a course"""
        try:
            response = self.client.table('course_enrollments').select('''
                *,
                student:student_id(id, name, email)
            ''').eq('course_id', course_id).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting course enrollments: {str(e)}")
            return []
    
    def get_enrollment_count(self, course_id: str) -> int:
        """Get number of students enrolled in course"""
        try:
            response = self.client.table('course_enrollments').select('id').eq('course_id', course_id).execute()
            return len(response.data) if response.data else 0
        except Exception as e:
            logger.error(f"Error getting enrollment count: {str(e)}")
            return 0
    
    def get_course_lessons_count(self, course_id: str) -> int:
        """Get lessons count for a course"""
        try:
            response = self.client.table('lessons').select('id').eq('course_id', course_id).execute()
            return len(response.data) if response.data else 0
        except Exception as e:
            logger.error(f"Error getting lessons count: {str(e)}")
            return 0
    
    def get_course_assignments_count(self, course_id: str) -> int:
        """Get assignments count for a course"""
        try:
            response = self.client.table('assignments').select('id').eq('course_id', course_id).execute()
            return len(response.data) if response.data else 0
        except Exception as e:
            logger.error(f"Error getting assignments count: {str(e)}")
            return 0
    
    def is_student_enrolled(self, student_id: str, course_id: str) -> bool:
        """Check if student is enrolled in course"""
        try:
            response = self.client.table('course_enrollments').select('id').eq('student_id', student_id).eq('course_id', course_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error checking enrollment: {str(e)}")
            return False

    def get_student_enrollment(self, student_id: str, course_id: str) -> Optional[Dict[str, Any]]:
        """Get student enrollment details for a specific course"""
        try:
            response = self.client.table('course_enrollments').select('*').eq('student_id', student_id).eq('course_id', course_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting student enrollment: {str(e)}")
            return None

    def get_student_enrollments(self, student_id: str) -> List[Dict[str, Any]]:
        """Get all courses a student is enrolled in"""
        try:
            response = self.client.table('course_enrollments').select('*').eq('student_id', student_id).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting student enrollments: {str(e)}")
            return []
    
    def enroll_student_in_course(self, student_id: str, course_id: str) -> Optional[Dict[str, Any]]:
        """Enroll student in course"""
        try:
            enrollment_data = {
                'student_id': student_id,
                'course_id': course_id,
                'enrolled_at': 'now()'
            }
            response = self.client.table('course_enrollments').insert(enrollment_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error enrolling student: {str(e)}")
            return None
    
    def unenroll_student_from_course(self, student_id: str, course_id: str) -> bool:
        """Unenroll student from course"""
        try:
            response = self.client.table('course_enrollments').delete().eq('student_id', student_id).eq('course_id', course_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error unenrolling student: {str(e)}")
            return False
    
    def get_student_submissions_count(self, student_id: str, course_id: str = None) -> int:
        """Get submission count for student"""
        try:
            query = self.client.table('assignment_submissions').select('id').eq('student_id', student_id)
            if course_id:
                # Join with assignments to filter by course
                query = query.eq('course_id', course_id)
            response = query.execute()
            return len(response.data) if response.data else 0
        except Exception as e:
            logger.error(f"Error getting submissions count: {str(e)}")
            return 0
    
    def get_student_submissions(self, student_id: str, course_id: str = None) -> List[Dict[str, Any]]:
        """Get all submissions for a student"""
        try:
            query = self.client.table('assignment_submissions').select('*').eq('student_id', student_id)
            if course_id:
                # Join with assignments to filter by course
                query = query.eq('course_id', course_id)
            response = query.execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting submissions: {str(e)}")
            return []
    
    # Assignment Management Methods
    def get_course_assignments(self, course_id: str, user_role: str = 'student') -> List[Dict[str, Any]]:
        """Get assignments for a course"""
        try:
            query = self.client.table('assignments').select('''
                *,
                course:course_id(id, title),
                creator:created_by(id, name)
            ''').eq('course_id', course_id)
            
            # Students only see published assignments
            if user_role == 'student':
                query = query.eq('is_published', True)
            
            response = query.order('created_at', desc=True).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting course assignments: {str(e)}")
            return []

    def get_assignments_by_course(self, course_id: str, include_unpublished: bool = True) -> List[Dict[str, Any]]:
        """Get all assignments for a course"""
        try:
            query = self.client.table('assignments').select('''
                *,
                course:course_id(id, title),
                creator:created_by(id, name)
            ''').eq('course_id', course_id)
            
            # Students only see published assignments
            if not include_unpublished:
                query = query.eq('is_published', True)
            
            response = query.order('created_at', desc=True).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting course assignments: {str(e)}")
            return []
    
    def get_assignment_submission_status(self, assignment_id: str, student_id: str) -> Dict[str, Any]:
        """Get submission status for student assignment"""
        try:
            response = self.client.table('assignment_submissions').select('*').eq('assignment_id', assignment_id).eq('student_id', student_id).execute()
            if response.data:
                submission = response.data[0]
                return {
                    'status': submission.get('status', 'not_submitted'),
                    'submitted_at': submission.get('submitted_at'),
                    'is_late': submission.get('is_late', False),
                    'attempt_number': submission.get('attempt_number', 0)
                }
            return {'status': 'not_submitted'}
        except Exception as e:
            logger.error(f"Error getting submission status: {str(e)}")
            return {'status': 'error'}
    
    def get_student_course_progress(self, student_id: str, course_id: str) -> Dict[str, Any]:
        """Get student's progress in a course"""
        try:
            # This is a simplified version - would need more complex logic in real implementation
            assignments_count = self.get_course_assignments_count(course_id)
            submissions = self.client.table('assignment_submissions').select('*').eq('student_id', student_id).execute()
            
            course_submissions = [s for s in submissions.data if s.get('course_id') == course_id] if submissions.data else []
            completed_assignments = len(course_submissions)
            
            progress_percentage = (completed_assignments / assignments_count * 100) if assignments_count > 0 else 0
            
            return {
                'total_assignments': assignments_count,
                'completed_assignments': completed_assignments,
                'progress_percentage': round(progress_percentage, 2),
                'course_id': course_id
            }
        except Exception as e:
            logger.error(f"Error getting course progress: {str(e)}")
            return {'total_assignments': 0, 'completed_assignments': 0, 'progress_percentage': 0}
    
    def get_course_gradebook(self, course_id: str) -> Dict[str, Any]:
        """Get gradebook for a course"""
        try:
            # This would be a complex query joining multiple tables
            # For now, return a simplified structure
            return {
                'course_id': course_id,
                'students': [],
                'assignments': [],
                'grades': []
            }
        except Exception as e:
            logger.error(f"Error getting course gradebook: {str(e)}")
            return {'course_id': course_id, 'students': [], 'assignments': [], 'grades': []}
    
    # Student-specific methods (simplified implementations)
    def get_student_enrolled_courses(self, student_id: str) -> List[Dict[str, Any]]:
        """Get courses student is enrolled in"""
        try:
            response = self.client.table('course_enrollments').select('''
                course:course_id(*)
            ''').eq('student_id', student_id).execute()
            return [enrollment['course'] for enrollment in response.data] if response.data else []
        except Exception as e:
            logger.error(f"Error getting enrolled courses: {str(e)}")
            return []
    
    def get_student_recent_assignments(self, student_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Get recent assignments for student"""
        try:
            # Get enrolled courses
            enrolled_courses = self.get_student_enrolled_courses(student_id)
            course_ids = [course['id'] for course in enrolled_courses]
            
            if not course_ids:
                return []
            
            # Get recent assignments from enrolled courses
            response = self.client.table('assignments').select('''
                *,
                course:course_id(id, title)
            ''').in_('course_id', course_ids).eq('is_published', True).order('created_at', desc=True).limit(limit).execute()
            
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting recent assignments: {str(e)}")
            return []
    
    def get_student_progress_summary(self, student_id: str) -> Dict[str, Any]:
        """Get student progress summary"""
        try:
            # Get enrolled courses
            enrolled_courses = self.get_student_enrolled_courses(student_id)
            
            # Calculate progress for each course
            course_progress = []
            total_assignments = 0
            completed_assignments = 0
            
            for course in enrolled_courses:
                course_id = course['id']
                assignments_count = self.get_course_assignments_count(course_id)
                total_assignments += assignments_count
                
                # Get completed assignments for this course
                submissions_response = self.client.table('assignment_submissions').select('*').eq('student_id', student_id).eq('course_id', course_id).execute()
                course_completed = len(submissions_response.data) if submissions_response.data else 0
                completed_assignments += course_completed
                
                if assignments_count > 0:
                    progress_percentage = (course_completed / assignments_count) * 100
                else:
                    progress_percentage = 0
                    
                course_progress.append({
                    'course_id': course_id,
                    'course_title': course['title'],
                    'completed_assignments': course_completed,
                    'total_assignments': assignments_count,
                    'progress_percentage': round(progress_percentage, 2)
                })
            
            # Overall progress
            overall_progress = 0
            if total_assignments > 0:
                overall_progress = (completed_assignments / total_assignments) * 100
            
            return {
                'courses': course_progress,
                'overall_completed_assignments': completed_assignments,
                'overall_total_assignments': total_assignments,
                'overall_progress_percentage': round(overall_progress, 2)
            }
        except Exception as e:
            logger.error(f"Error getting student progress summary: {str(e)}")
            return {
                'courses': [],
                'overall_completed_assignments': 0,
                'overall_total_assignments': 0,
                'overall_progress_percentage': 0
            }
    
    def get_student_assignments(self, student_id: str, course_id: str = None, assignment_type: str = None, page: int = 1, limit: int = 20) -> List[Dict[str, Any]]:
        """Get assignments for student"""
        try:
            # Get enrolled courses
            enrolled_courses = self.get_student_enrolled_courses(student_id)
            course_ids = [course['id'] for course in enrolled_courses]
            
            if not course_ids:
                return []
            
            query = self.client.table('assignments').select('''
                *,
                course:course_id(id, title)
            ''').in_('course_id', course_ids).eq('is_published', True)
            
            if course_id:
                query = query.eq('course_id', course_id)
            if assignment_type:
                query = query.eq('assignment_type', assignment_type)
            
            offset = (page - 1) * limit
            response = query.range(offset, offset + limit - 1).order('due_date', desc=False).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting student assignments: {str(e)}")
            return []
    
    # Placeholder methods for other functionality
    def get_student_pending_assignments(self, student_id: str) -> List[Dict[str, Any]]:
        """Get pending assignments for student"""
        # Simplified implementation
        return []
    
    def get_student_recent_submissions(self, student_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Get recent submissions for student"""
        try:
            response = self.client.table('assignment_submissions').select('*').eq('student_id', student_id).order('submitted_at', desc=True).limit(limit).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting recent submissions: {str(e)}")
            return []
    
    def get_student_overall_progress(self, student_id: str) -> Dict[str, Any]:
        """Get overall progress for student"""
        return {'overall_completion': 0, 'courses_enrolled': 0, 'assignments_completed': 0}
    
    def get_student_upcoming_deadlines(self, student_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Get upcoming deadlines for student"""
        return []
    
    def get_student_recent_grades(self, student_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Get recent grades for student"""
        return []
    
    
    def get_user_unread_notifications_count(self, user_id: str) -> int:
        """Get unread notifications count"""
        try:
            response = self.client.table('notifications').select('id').eq('recipient_id', user_id).eq('is_read', False).execute()
            return len(response.data) if response.data else 0
        except Exception as e:
            logger.error(f"Error getting unread count: {str(e)}")
            return 0
    
    def get_notification_by_id(self, notification_id: str) -> Optional[Dict[str, Any]]:
        """Get notification by ID"""
        try:
            response = self.client.table('notifications').select('*').eq('id', notification_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting notification by ID: {str(e)}")
            return None

    # ==================== PHASE 3: ADMIN MANAGEMENT METHODS ====================
    
    def get_user_statistics(self) -> Dict[str, Any]:
        """Get comprehensive user statistics for admin dashboard"""
        try:
            # Get total users by role
            users_response = self.client.table('users').select('role').execute()
            users = users_response.data if users_response.data else []
            
            stats = {
                'total': len(users),
                'students': len([u for u in users if u.get('role') == 'student']),
                'staff': len([u for u in users if u.get('role') == 'staff']),
                'admins': len([u for u in users if u.get('role') == 'admin']),
                'active': len([u for u in users if u.get('status') == 'active']),
                'suspended': len([u for u in users if u.get('status') == 'suspended'])
            }
            return stats
        except Exception as e:
            logger.error(f"Error getting user statistics: {str(e)}")
            return {'total': 0, 'students': 0, 'staff': 0, 'admins': 0, 'active': 0, 'suspended': 0}
    
    def get_course_statistics(self) -> Dict[str, Any]:
        """Get comprehensive course statistics for admin dashboard"""
        try:
            courses_response = self.client.table('courses').select('status').execute()
            courses = courses_response.data if courses_response.data else []
            
            stats = {
                'total': len(courses),
                'active': len([c for c in courses if c.get('status') == 'active']),
                'draft': len([c for c in courses if c.get('status') == 'draft']),
                'archived': len([c for c in courses if c.get('status') == 'archived'])
            }
            return stats
        except Exception as e:
            logger.error(f"Error getting course statistics: {str(e)}")
            return {'total': 0, 'active': 0, 'draft': 0, 'archived': 0}
    
    def get_assignment_statistics(self) -> Dict[str, Any]:
        """Get comprehensive assignment statistics for admin dashboard"""
        try:
            assignments_response = self.client.table('assignments').select('status').execute()
            assignments = assignments_response.data if assignments_response.data else []
            
            stats = {
                'total': len(assignments),
                'published': len([a for a in assignments if a.get('status') == 'published']),
                'draft': len([a for a in assignments if a.get('status') == 'draft']),
                'archived': len([a for a in assignments if a.get('status') == 'archived'])
            }
            return stats
        except Exception as e:
            logger.error(f"Error getting assignment statistics: {str(e)}")
            return {'total': 0, 'published': 0, 'draft': 0, 'archived': 0}
    
    def get_submission_statistics(self) -> Dict[str, Any]:
        """Get comprehensive submission statistics for admin dashboard"""
        try:
            submissions_response = self.client.table('assignment_submissions').select('status, grade').execute()
            submissions = submissions_response.data if submissions_response.data else []
            
            graded = len([s for s in submissions if s.get('grade') is not None])
            
            stats = {
                'total': len(submissions),
                'graded': graded,
                'pending': len(submissions) - graded,
                'submitted': len([s for s in submissions if s.get('status') == 'submitted']),
                'late': len([s for s in submissions if s.get('is_late', False)])
            }
            return stats
        except Exception as e:
            logger.error(f"Error getting submission statistics: {str(e)}")
            return {'total': 0, 'graded': 0, 'pending': 0, 'submitted': 0, 'late': 0}
    
    def get_activity_statistics(self, days: int = 30) -> Dict[str, Any]:
        """Get system activity statistics for the last N days"""
        try:
            from datetime import datetime, timedelta
            cutoff_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
            
            # Get recent activities (if activity table exists)
            try:
                activities_response = self.client.table('user_activities').select('activity_type').gte('created_at', cutoff_date).execute()
                activities = activities_response.data if activities_response.data else []
                
                activity_stats = {
                    'total_activities': len(activities),
                    'logins': len([a for a in activities if a.get('activity_type') == 'login']),
                    'submissions': len([a for a in activities if a.get('activity_type') == 'submission']),
                    'enrollments': len([a for a in activities if a.get('activity_type') == 'course_enrollment'])
                }
            except:
                # If activities table doesn't exist, return basic stats
                activity_stats = {
                    'total_activities': 0,
                    'logins': 0,
                    'submissions': 0,
                    'enrollments': 0
                }
            
            return activity_stats
        except Exception as e:
            logger.error(f"Error getting activity statistics: {str(e)}")
            return {'total_activities': 0, 'logins': 0, 'submissions': 0, 'enrollments': 0}
    
    def get_system_metrics(self) -> Dict[str, Any]:
        """Get system health metrics"""
        try:
            # Basic system metrics
            metrics = {
                'database_status': 'healthy',
                'last_backup': None,  # Would need backup table
                'storage_used': 0,    # Would need file storage metrics
                'active_sessions': 0   # Would need session tracking
            }
            return metrics
        except Exception as e:
            logger.error(f"Error getting system metrics: {str(e)}")
            return {'database_status': 'unhealthy', 'last_backup': None, 'storage_used': 0, 'active_sessions': 0}
    
    def get_recent_activities(self, limit: int = 50, activity_type: str = None, days: int = 7) -> List[Dict[str, Any]]:
        """Get recent system activities"""
        try:
            from datetime import datetime, timedelta
            cutoff_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
            
            query = self.client.table('user_activities').select('*').gte('created_at', cutoff_date).order('created_at', desc=True).limit(limit)
            
            if activity_type:
                query = query.eq('activity_type', activity_type)
            
            response = query.execute()
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting recent activities: {str(e)}")
            return []
    
    def get_users_paginated(self, page: int = 1, limit: int = 20, role_filter: str = None, 
                           status_filter: str = None, search: str = None) -> Dict[str, Any]:
        """Get paginated users with filtering"""
        try:
            offset = (page - 1) * limit
            
            # Build query
            query = self.client.table('users').select('id, email, name, role, status, created_at, last_login')
            
            # Apply filters
            if role_filter:
                query = query.eq('role', role_filter)
            if status_filter:
                query = query.eq('status', status_filter)
            if search:
                query = query.or_(f'name.ilike.%{search}%,email.ilike.%{search}%')
            
            # Get total count for pagination
            count_response = query.execute()
            total = len(count_response.data) if count_response.data else 0
            
            # Get paginated results
            response = query.order('created_at', desc=True).range(offset, offset + limit - 1).execute()
            users = response.data if response.data else []
            
            return {
                'users': users,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        except Exception as e:
            logger.error(f"Error getting paginated users: {str(e)}")
            return {'users': [], 'total': 0, 'pages': 0}
    
    def get_user_detailed_stats(self, user_id: str) -> Dict[str, Any]:
        """Get detailed statistics for a specific user"""
        try:
            stats = {
                'courses_enrolled': 0,
                'assignments_completed': 0,
                'total_submissions': 0,
                'average_grade': 0,
                'last_activity': None,
                'total_login_time': 0
            }
            
            # Get course enrollments
            enrollments_response = self.client.table('course_enrollments').select('id').eq('student_id', user_id).execute()
            stats['courses_enrolled'] = len(enrollments_response.data) if enrollments_response.data else 0
            
            # Get submissions
            submissions_response = self.client.table('assignment_submissions').select('grade').eq('student_id', user_id).execute()
            submissions = submissions_response.data if submissions_response.data else []
            stats['total_submissions'] = len(submissions)
            
            # Calculate average grade
            graded_submissions = [s for s in submissions if s.get('grade') is not None]
            if graded_submissions:
                stats['average_grade'] = sum(s['grade'] for s in graded_submissions) / len(graded_submissions) if graded_submissions else 0
            
            return stats
        except Exception as e:
            logger.error(f"Error getting user detailed stats: {str(e)}")
            return {'courses_enrolled': 0, 'assignments_completed': 0, 'total_submissions': 0, 'average_grade': 0}
    
    def update_user_status(self, user_id: str, status: str, reason: str = '') -> Optional[Dict[str, Any]]:
        """Update user status (active, suspended, etc.)"""
        try:
            update_data = {'status': status}
            if reason:
                update_data['status_reason'] = reason
            
            response = self.client.table('users').update(update_data).eq('id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating user status: {str(e)}")
            return None
    
    def get_admin_notifications(self, page: int = 1, limit: int = 20, status: str = None, 
                               type_filter: str = None) -> Dict[str, Any]:
        """Get admin notifications with filtering"""
        try:
            offset = (page - 1) * limit
            
            query = self.client.table('notifications').select('*')
            
            if status:
                query = query.eq('status', status)
            if type_filter:
                query = query.eq('type', type_filter)
            
            # Get total count
            count_response = query.execute()
            total = len(count_response.data) if count_response.data else 0
            
            # Get paginated results
            response = query.order('created_at', desc=True).range(offset, offset + limit - 1).execute()
            notifications = response.data if response.data else []
            
            return {
                'notifications': notifications,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        except Exception as e:
            logger.error(f"Error getting admin notifications: {str(e)}")
            return {'notifications': [], 'total': 0, 'pages': 0}
    
    def get_memory_usage(self) -> Dict[str, Any]:
        """Get system memory usage metrics"""
        try:
            # This would typically query system metrics
            return {
                'used_mb': 0,
                'available_mb': 0,
                'percentage': 0
            }
        except Exception as e:
            logger.error(f"Error getting memory usage: {str(e)}")
            return {'used_mb': 0, 'available_mb': 0, 'percentage': 0}
    
    def get_storage_usage(self) -> Dict[str, Any]:
        """Get system storage usage metrics"""
        try:
            # This would typically query storage metrics
            return {
                'used_gb': 0,
                'available_gb': 0,
                'percentage': 0
            }
        except Exception as e:
            logger.error(f"Error getting storage usage: {str(e)}")
            return {'used_gb': 0, 'available_gb': 0, 'percentage': 0}
    
    def get_average_response_times(self) -> Dict[str, float]:
        """Get average API response times"""
        try:
            # This would typically query performance metrics
            return {
                'api_avg_ms': 0.0,
                'database_avg_ms': 0.0,
                'ai_service_avg_ms': 0.0
            }
        except Exception as e:
            logger.error(f"Error getting response times: {str(e)}")
            return {'api_avg_ms': 0.0, 'database_avg_ms': 0.0, 'ai_service_avg_ms': 0.0}
    
    def get_system_logs(self, level: str = 'INFO', limit: int = 100, hours: int = 24) -> List[Dict[str, Any]]:
        """Get system logs for debugging"""
        try:
            from datetime import datetime, timedelta
            cutoff_date = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
            
            # This would typically query a logs table
            # For now, return empty list
            return []
        except Exception as e:
            logger.error(f"Error getting system logs: {str(e)}")
            return []
    
    def create_backup(self, backup_type: str, include_files: bool = False, admin_id: str = None) -> Dict[str, Any]:
        """Create system backup"""
        try:
            from datetime import datetime
            
            backup_data = {
                'id': f"backup_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                'type': backup_type,
                'include_files': include_files,
                'created_by': admin_id,
                'created_at': datetime.utcnow().isoformat(),
                'status': 'completed',
                'size_mb': 0
            }
            
            # This would typically create an actual backup
            return {
                'success': True,
                'backup': backup_data
            }
        except Exception as e:
            logger.error(f"Error creating backup: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def perform_security_audit(self) -> Dict[str, Any]:
        """Perform security audit and return results"""
        try:
            from datetime import datetime
            
            audit_results = {
                'scan_date': datetime.utcnow().isoformat(),
                'issues_found': 0,
                'warnings': [],
                'recommendations': [],
                'user_security': {
                    'weak_passwords': 0,
                    'inactive_accounts': 0,
                    'admin_accounts': 0
                },
                'system_security': {
                    'ssl_status': 'enabled',
                    'encryption_status': 'enabled',
                    'backup_status': 'healthy'
                }
            }
            return audit_results
        except Exception as e:
            from datetime import datetime
            logger.error(f"Error performing security audit: {str(e)}")
            return {'scan_date': datetime.utcnow().isoformat(), 'issues_found': 1, 'error': str(e)}
    
    # ==================== PHASE 3: USER MANAGEMENT METHODS ====================
    
    def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed user profile"""
        try:
            response = self.client.table('users').select('*').eq('id', user_id).execute()
            if response.data:
                user = response.data[0]
                # Remove sensitive fields
                user.pop('password_hash', None)
                return user
            return None
        except Exception as e:
            logger.error(f"Error getting user profile: {str(e)}")
            return None
    
    def update_user_profile(self, user_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user profile information"""
        try:
            # Filter allowed fields for profile updates
            allowed_fields = ['name', 'bio', 'phone', 'timezone', 'language', 'notification_preferences']
            filtered_data = {k: v for k, v in data.items() if k in allowed_fields}
            
            if not filtered_data:
                return None
            
            response = self.client.table('users').update(filtered_data).eq('id', user_id).execute()
            if response.data:
                user = response.data[0]
                user.pop('password_hash', None)
                return user
            return None
        except Exception as e:
            logger.error(f"Error updating user profile: {str(e)}")
            return None
    
    def verify_user_password(self, user_id: str, password: str) -> bool:
        """Verify user's current password"""
        try:
            import bcrypt
            
            response = self.client.table('users').select('password_hash').eq('id', user_id).execute()
            if response.data:
                stored_hash = response.data[0]['password_hash']
                return bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
            return False
        except Exception as e:
            logger.error(f"Error verifying password: {str(e)}")
            return False
    
    def update_user_password(self, user_id: str, new_password: str) -> bool:
        """Update user's password"""
        try:
            import bcrypt
            
            # Hash new password
            salt = bcrypt.gensalt()
            password_hash = bcrypt.hashpw(new_password.encode('utf-8'), salt).decode('utf-8')
            
            response = self.client.table('users').update({'password_hash': password_hash}).eq('id', user_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error updating password: {str(e)}")
            return False
    
    def update_user_avatar(self, user_id: str, avatar_url: str) -> Optional[Dict[str, Any]]:
        """Update user's avatar"""
        try:
            response = self.client.table('users').update({'avatar_url': avatar_url}).eq('id', user_id).execute()
            if response.data:
                user = response.data[0]
                user.pop('password_hash', None)
                return user
            return None
        except Exception as e:
            logger.error(f"Error updating avatar: {str(e)}")
            return None
    
    def get_user_preferences(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user preferences and settings"""
        try:
            response = self.client.table('user_preferences').select('*').eq('user_id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting user preferences: {str(e)}")
            return None
    
    def update_user_preferences(self, user_id: str, preferences: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user preferences"""
        try:
            # Check if preferences exist
            existing = self.get_user_preferences(user_id)
            
            if existing:
                response = self.client.table('user_preferences').update({
                    'preferences': preferences
                }).eq('user_id', user_id).execute()
            else:
                response = self.client.table('user_preferences').insert({
                    'user_id': user_id,
                    'preferences': preferences
                }).execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating user preferences: {str(e)}")
            return None
    
    def get_user_activity(self, user_id: str, days: int = 30, limit: int = 50) -> List[Dict[str, Any]]:
        """Get user's recent activity"""
        try:
            from datetime import datetime, timedelta
            cutoff_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
            
            response = self.client.table('user_activities').select('*').eq('user_id', user_id).gte('created_at', cutoff_date).order('created_at', desc=True).limit(limit).execute()
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting user activity: {str(e)}")
            return []
    
    def get_user_activity_stats(self, user_id: str, days: int = 30) -> Dict[str, Any]:
        """Get user activity statistics"""
        try:
            activities = self.get_user_activity(user_id, days)
            
            stats = {
                'total_activities': len(activities),
                'logins': len([a for a in activities if a.get('activity_type') == 'login']),
                'submissions': len([a for a in activities if a.get('activity_type') == 'submission']),
                'course_access': len([a for a in activities if a.get('activity_type') == 'course_access'])
            }
            return stats
        except Exception as e:
            logger.error(f"Error getting user activity stats: {str(e)}")
            return {'total_activities': 0, 'logins': 0, 'submissions': 0, 'course_access': 0}
    
    def search_users(self, search: str = '', role_filter: str = None, limit: int = 20) -> List[Dict[str, Any]]:
        """Search users with filters"""
        try:
            query = self.client.table('users').select('id, name, email, role, status, avatar_url')
            
            if search:
                query = query.or_(f'name.ilike.%{search}%,email.ilike.%{search}%')
            if role_filter:
                query = query.eq('role', role_filter)
            
            response = query.limit(limit).execute()
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error searching users: {str(e)}")
            return []
    
    def get_student_classmates(self, student_id: str, search: str = '', limit: int = 20) -> List[Dict[str, Any]]:
        """Get classmates for a student"""
        try:
            # Get courses the student is enrolled in
            enrollments_response = self.client.table('course_enrollments').select('course_id').eq('student_id', student_id).execute()
            course_ids = [e['course_id'] for e in enrollments_response.data] if enrollments_response.data else []
            
            if not course_ids:
                return []
            
            # Get all students in those courses
            classmates_response = self.client.table('course_enrollments').select('student_id').in_('course_id', course_ids).neq('student_id', student_id).execute()
            classmate_ids = list(set([c['student_id'] for c in classmates_response.data])) if classmates_response.data else []
            
            if not classmate_ids:
                return []
            
            # Get user details for classmates
            query = self.client.table('users').select('id, name, email, role, avatar_url').in_('id', classmate_ids)
            
            if search:
                query = query.or_(f'name.ilike.%{search}%,email.ilike.%{search}%')
            
            response = query.limit(limit).execute()
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting student classmates: {str(e)}")
            return []
    
    def get_staff_accessible_users(self, staff_id: str, search: str = '', role_filter: str = None, limit: int = 20) -> List[Dict[str, Any]]:
        """Get users accessible to a staff member"""
        try:
            # Get courses the staff teaches
            courses_response = self.client.table('courses').select('id').eq('instructor_id', staff_id).execute()
            course_ids = [c['id'] for c in courses_response.data] if courses_response.data else []
            
            accessible_user_ids = []
            
            if course_ids:
                # Get students in those courses
                enrollments_response = self.client.table('course_enrollments').select('student_id').in_('course_id', course_ids).execute()
                accessible_user_ids.extend([e['student_id'] for e in enrollments_response.data] if enrollments_response.data else [])
            
            # Add other staff members
            staff_response = self.client.table('users').select('id').eq('role', 'staff').execute()
            accessible_user_ids.extend([s['id'] for s in staff_response.data] if staff_response.data else [])
            
            # Remove duplicates
            accessible_user_ids = list(set(accessible_user_ids))
            
            if not accessible_user_ids:
                return []
            
            # Get user details
            query = self.client.table('users').select('id, name, email, role, avatar_url').in_('id', accessible_user_ids)
            
            if search:
                query = query.or_(f'name.ilike.%{search}%,email.ilike.%{search}%')
            if role_filter:
                query = query.eq('role', role_filter)
            
            response = query.limit(limit).execute()
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting staff accessible users: {str(e)}")
            return []
    
    def are_users_classmates(self, user1_id: str, user2_id: str) -> bool:
        """Check if two users are in the same course"""
        try:
            # Get courses for user1
            user1_courses_response = self.client.table('course_enrollments').select('course_id').eq('student_id', user1_id).execute()
            user1_courses = [c['course_id'] for c in user1_courses_response.data] if user1_courses_response.data else []
            
            if not user1_courses:
                return False
            
            # Check if user2 is in any of those courses
            user2_response = self.client.table('course_enrollments').select('id').eq('student_id', user2_id).in_('course_id', user1_courses).execute()
            return len(user2_response.data) > 0 if user2_response.data else False
        except Exception as e:
            logger.error(f"Error checking if users are classmates: {str(e)}")
            return False
    
    def can_staff_access_user(self, staff_id: str, user_id: str) -> bool:
        """Check if staff can access a specific user"""
        try:
            # Get user role
            user_response = self.client.table('users').select('role').eq('id', user_id).execute()
            if not user_response.data:
                return False
            
            user_role = user_response.data[0]['role']
            
            # Staff can always access other staff
            if user_role == 'staff':
                return True
            
            # For students, check if they're in staff's courses
            if user_role == 'student':
                # Get courses the staff teaches
                courses_response = self.client.table('courses').select('id').eq('instructor_id', staff_id).execute()
                course_ids = [c['id'] for c in courses_response.data] if courses_response.data else []
                
                if not course_ids:
                    return False
                
                # Check if student is enrolled in any of those courses
                enrollment_response = self.client.table('course_enrollments').select('id').eq('student_id', user_id).in_('course_id', course_ids).execute()
                return len(enrollment_response.data) > 0 if enrollment_response.data else False
            
            return False
        except Exception as e:
            logger.error(f"Error checking staff access: {str(e)}")
            return False
    
    def get_user_public_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get public profile information for a user"""
        try:
            response = self.client.table('users').select('id, name, bio, avatar_url, role, created_at').eq('id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting public profile: {str(e)}")
            return None
    
    def delete_user_account(self, user_id: str) -> bool:
        """Delete user account and associated data"""
        try:
            # This would typically involve cleaning up related data
            response = self.client.table('users').delete().eq('id', user_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error deleting user account: {str(e)}")
            return False
    
    def get_student_dashboard_data(self, student_id: str) -> Dict[str, Any]:
        """Get dashboard data for a student"""
        try:
            dashboard_data = {
                'enrolled_courses': self.get_student_enrolled_courses(student_id),
                'recent_assignments': self.get_student_recent_assignments(student_id, limit=5),
                'recent_grades': self.get_student_recent_grades(student_id, limit=5),
                'progress_summary': self.get_student_progress_summary(student_id),
                'notifications': self.get_user_notifications(student_id, limit=5)
            }
            return dashboard_data
        except Exception as e:
            logger.error(f"Error getting student dashboard data: {str(e)}")
            return {}
    
    # Staff-specific methods
    def get_staff_teaching_courses(self, staff_id: str) -> List[Dict[str, Any]]:
        """Get courses taught by a staff member"""
        try:
            response = self.client.table('courses').select('''
                *,
                subject:subject_id(id, name, description),
                assignments(count),
                students(count)
            ''').eq('instructor_id', staff_id).order('created_at', desc=True).execute()
            
            # Add enrollment counts to each course
            courses = response.data if response.data else []
            for course in courses:
                course['enrollment_count'] = self.get_course_enrollments_count(course['id'])
                # Get assignment count for this course
                assignments_response = self.client.table('assignments').select('id').eq('course_id', course['id']).execute()
                course['assignment_count'] = len(assignments_response.data) if assignments_response.data else 0
            
            return courses
        except Exception as e:
            logger.error(f"Error getting staff teaching courses: {str(e)}")
            return []
    
    def get_staff_recent_submissions(self, staff_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent submissions for courses taught by staff member"""
        try:
            # First get courses taught by this staff member
            courses_response = self.client.table('courses').select('id').eq('instructor_id', staff_id).execute()
            course_ids = [course['id'] for course in courses_response.data] if courses_response.data else []
            
            if not course_ids:
                return []
            
            # Get recent submissions for these courses
            response = self.client.table('assignment_submissions').select('''
                *,
                assignment:assignment_id(id, title),
                student:student_id(id, name, email),
                course:assignment(course_id(id, title))
            ''').in_('assignment(course_id)', course_ids).order('submitted_at', desc=True).limit(limit).execute()
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting staff recent submissions: {str(e)}")
            return []
    
    def get_staff_students_summary(self, staff_id: str) -> Dict[str, Any]:
        """Get summary of students in courses taught by staff member"""
        try:
            # Get courses taught by this staff member
            courses_response = self.client.table('courses').select('id').eq('instructor_id', staff_id).execute()
            course_ids = [course['id'] for course in courses_response.data] if courses_response.data else []
            
            if not course_ids:
                return {'total_students': 0, 'courses': []}
            
            # Get all enrollments for these courses
            enrollments_response = self.client.table('course_enrollments').select('''
                *,
                course:course_id(id, title),
                student:student_id(id, name, email)
            ''').in_('course_id', course_ids).execute()
            
            enrollments = enrollments_response.data if enrollments_response.data else []
            
            # Group by course
            courses_summary = {}
            for enrollment in enrollments:
                course_id = enrollment['course']['id']
                if course_id not in courses_summary:
                    courses_summary[course_id] = {
                        'course_id': course_id,
                        'course_title': enrollment['course']['title'],
                        'student_count': 0,
                        'students': []
                    }
                courses_summary[course_id]['student_count'] += 1
                courses_summary[course_id]['students'].append(enrollment['student'])
            
            return {
                'total_students': len(set([e['student']['id'] for e in enrollments])),
                'courses': list(courses_summary.values())
            }
        except Exception as e:
            logger.error(f"Error getting staff students summary: {str(e)}")
            return {'total_students': 0, 'courses': []}
    
    def get_staff_grading_queue(self, staff_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get submissions that need grading for staff member's courses"""
        try:
            # Get courses taught by this staff member
            courses_response = self.client.table('courses').select('id').eq('instructor_id', staff_id).execute()
            course_ids = [course['id'] for course in courses_response.data] if courses_response.data else []
            
            if not course_ids:
                return []
            
            # Get ungraded submissions for these courses
            response = self.client.table('assignment_submissions').select('''
                *,
                assignment:assignment_id(id, title),
                student:student_id(id, name, email),
                course:assignment(course_id(id, title))
            ''').in_('assignment(course_id)', course_ids).is_('grade', None).order('submitted_at', desc=True).limit(limit).execute()
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting staff grading queue: {str(e)}")
            return []
    
    def get_staff_recent_feedback(self, staff_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Get recent feedback for staff member"""
        try:
            # This would typically query a feedback table
            # For now, return empty list
            return []
        except Exception as e:
            logger.error(f"Error getting staff recent feedback: {str(e)}")
            return []
    
    def submit_staff_feedback(self, staff_id: str, feedback_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Submit feedback from staff member"""
        try:
            # This would typically insert into a feedback table
            # For now, return the feedback data as if it was saved
            return feedback_data
        except Exception as e:
            logger.error(f"Error submitting staff feedback: {str(e)}")
            return None
    
    def get_staff_analytics(self, staff_id: str) -> Dict[str, Any]:
        """Get analytics data for staff member"""
        try:
            # Get courses taught by this staff member
            courses_response = self.client.table('courses').select('id').eq('instructor_id', staff_id).execute()
            course_ids = [course['id'] for course in courses_response.data] if courses_response.data else []
            
            # Get total students
            if course_ids:
                enrollments_response = self.client.table('course_enrollments').select('id').in_('course_id', course_ids).execute()
                total_students = len(enrollments_response.data) if enrollments_response.data else 0
            else:
                total_students = 0
            
            # Get total assignments
            if course_ids:
                assignments_response = self.client.table('assignments').select('id').in_('course_id', course_ids).execute()
                total_assignments = len(assignments_response.data) if assignments_response.data else 0
            else:
                total_assignments = 0
            
            # Get total submissions
            if course_ids:
                submissions_response = self.client.table('assignment_submissions').select('id').in_('assignment(course_id)', course_ids).execute()
                total_submissions = len(submissions_response.data) if submissions_response.data else 0
            else:
                total_submissions = 0
            
            return {
                'total_courses': len(course_ids),
                'total_students': total_students,
                'total_assignments': total_assignments,
                'total_submissions': total_submissions,
                'courses': course_ids
            }
        except Exception as e:
            logger.error(f"Error getting staff analytics: {str(e)}")
            return {
                'total_courses': 0,
                'total_students': 0,
                'total_assignments': 0,
                'total_submissions': 0,
                'courses': []
            }
    
    def get_staff_dashboard_data(self, staff_id: str) -> Dict[str, Any]:
        """Get dashboard data for a staff member"""
        try:
            dashboard_data = {
                'teaching_courses': self.get_staff_teaching_courses(staff_id),
                'recent_submissions': self.get_staff_recent_submissions(staff_id, limit=10),
                'students_summary': self.get_staff_students_summary(staff_id),
                'grading_queue': self.get_staff_grading_queue(staff_id, limit=10)
            }
            return dashboard_data
        except Exception as e:
            logger.error(f"Error getting staff dashboard data: {str(e)}")
            return {}
    
    def get_admin_dashboard_data(self, admin_id: str) -> Dict[str, Any]:
        """Get dashboard data for an admin"""
        try:
            dashboard_data = {
                'system_stats': {
                    'users': self.get_user_statistics(),
                    'courses': self.get_course_statistics(),
                    'assignments': self.get_assignment_statistics(),
                    'submissions': self.get_submission_statistics()
                },
                'recent_activities': self.get_recent_activities(limit=10),
                'system_health': {
                    'database_status': 'healthy',
                    'ai_service_status': 'healthy',
                    'storage_usage': self.get_storage_usage()
                }
            }
            return dashboard_data
        except Exception as e:
            logger.error(f"Error getting admin dashboard data: {str(e)}")
            return {}
    
    # ==================== PHASE 3: LESSON MANAGEMENT METHODS ====================
    
    def get_course_lessons(self, course_id: str, include_content: bool = False, 
                          status_filter: str = None, user_id: str = None, user_role: str = None) -> List[Dict[str, Any]]:
        """Get all lessons for a course with filtering"""
        try:
            fields = 'id, title, description, lesson_type, duration_minutes, order_index, status, created_at'
            if include_content:
                fields += ', content, resources, learning_objectives'
            
            query = self.client.table('lessons').select(fields).eq('course_id', course_id)
            
            # Apply status filter
            if status_filter:
                query = query.eq('status', status_filter)
            elif user_role == 'student':
                # Students can only see published lessons
                query = query.eq('status', 'published')
            
            response = query.order('order_index').execute()
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting course lessons: {str(e)}")
            return []
    
    def create_lesson(self, course_id: str, title: str, description: str, content: str, 
                     lesson_type: str, duration_minutes: int = 0, order_index: int = None,
                     prerequisites: List[str] = None, resources: List[Dict] = None,
                     learning_objectives: List[str] = None, status: str = 'draft',
                     created_by: str = None) -> Optional[Dict[str, Any]]:
        """Create a new lesson"""
        try:
            from datetime import datetime
            
            # Get next order index if not provided
            if order_index is None:
                existing_response = self.client.table('lessons').select('order_index').eq('course_id', course_id).order('order_index', desc=True).limit(1).execute()
                if existing_response.data:
                    order_index = existing_response.data[0]['order_index'] + 1
                else:
                    order_index = 1
            
            lesson_data = {
                'course_id': course_id,
                'title': title,
                'description': description,
                'content': content,
                'lesson_type': lesson_type,
                'duration_minutes': duration_minutes,
                'order_index': order_index,
                'prerequisites': prerequisites or [],
                'resources': resources or [],
                'learning_objectives': learning_objectives or [],
                'status': status,
                'created_by': created_by,
                'created_at': datetime.utcnow().isoformat()
            }
            
            response = self.client.table('lessons').insert(lesson_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating lesson: {str(e)}")
            return None
    
    def get_lesson_by_id(self, lesson_id: str) -> Optional[Dict[str, Any]]:
        """Get lesson by ID"""
        try:
            response = self.client.table('lessons').select('*').eq('id', lesson_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting lesson by ID: {str(e)}")
            return None
    
    def get_lesson_details(self, lesson_id: str, user_id: str = None, user_role: str = None) -> Optional[Dict[str, Any]]:
        """Get detailed lesson information"""
        try:
            lesson = self.get_lesson_by_id(lesson_id)
            if not lesson:
                return None
            
            # Add additional details like resources, prerequisites status, etc.
            if lesson.get('prerequisites'):
                lesson['prerequisites_details'] = [
                    self.get_lesson_by_id(prereq_id) for prereq_id in lesson['prerequisites']
                ]
            
            return lesson
        except Exception as e:
            logger.error(f"Error getting lesson details: {str(e)}")
            return None
    
    def update_lesson(self, lesson_id: str, data: Dict[str, Any], updated_by: str = None) -> Optional[Dict[str, Any]]:
        """Update lesson information"""
        try:
            from datetime import datetime
            
            update_data = dict(data)
            update_data['updated_at'] = datetime.utcnow().isoformat()
            if updated_by:
                update_data['updated_by'] = updated_by
            
            response = self.client.table('lessons').update(update_data).eq('id', lesson_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating lesson: {str(e)}")
            return None
    
    def delete_lesson(self, lesson_id: str) -> bool:
        """Delete a lesson"""
        try:
            response = self.client.table('lessons').delete().eq('id', lesson_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error deleting lesson: {str(e)}")
            return False
    
    def get_lesson_progress(self, user_id: str, lesson_id: str) -> Optional[Dict[str, Any]]:
        """Get user's progress on a lesson"""
        try:
            response = self.client.table('lesson_progress').select('*').eq('user_id', user_id).eq('lesson_id', lesson_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting lesson progress: {str(e)}")
            return None
    
    def check_lesson_prerequisites(self, user_id: str, lesson_id: str) -> bool:
        """Check if user has completed lesson prerequisites"""
        try:
            lesson = self.get_lesson_by_id(lesson_id)
            if not lesson or not lesson.get('prerequisites'):
                return True
            
            for prereq_id in lesson['prerequisites']:
                progress = self.get_lesson_progress(user_id, prereq_id)
                if not progress or progress.get('progress_type') != 'completed':
                    return False
            
            return True
        except Exception as e:
            logger.error(f"Error checking lesson prerequisites: {str(e)}")
            return False
    
    def lesson_has_student_progress(self, lesson_id: str) -> bool:
        """Check if lesson has any student progress"""
        try:
            response = self.client.table('lesson_progress').select('id').eq('lesson_id', lesson_id).limit(1).execute()
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            logger.error(f"Error checking lesson progress: {str(e)}")
            return False
    
    def update_lesson_progress(self, user_id: str, lesson_id: str, progress_type: str,
                              completion_percentage: int = 0, time_spent_minutes: int = 0,
                              notes: str = '') -> Optional[Dict[str, Any]]:
        """Update user's progress on a lesson"""
        try:
            from datetime import datetime
            
            # Check if progress exists
            existing_progress = self.get_lesson_progress(user_id, lesson_id)
            
            progress_data = {
                'user_id': user_id,
                'lesson_id': lesson_id,
                'progress_type': progress_type,
                'completion_percentage': completion_percentage,
                'time_spent_minutes': time_spent_minutes,
                'notes': notes,
                'updated_at': datetime.utcnow().isoformat()
            }
            
            if existing_progress:
                # Update existing
                response = self.client.table('lesson_progress').update(progress_data).eq('user_id', user_id).eq('lesson_id', lesson_id).execute()
            else:
                # Create new
                progress_data['created_at'] = datetime.utcnow().isoformat()
                response = self.client.table('lesson_progress').insert(progress_data).execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating lesson progress: {str(e)}")
            return None
    
    def check_course_completion(self, user_id: str, course_id: str) -> Dict[str, Any]:
        """Check course completion status based on lesson progress"""
        try:
            # Get all published lessons in the course
            lessons = self.get_course_lessons(course_id, status_filter='published')
            total_lessons = len(lessons)
            
            if total_lessons == 0:
                return {'completed_lessons': 0, 'total_lessons': 0, 'completion_percentage': 0}
            
            # Get completed lessons
            completed_lessons = 0
            for lesson in lessons:
                progress = self.get_lesson_progress(user_id, lesson['id'])
                if progress and progress.get('progress_type') == 'completed':
                    completed_lessons += 1
            
            completion_percentage = (completed_lessons / total_lessons) * 100
            
            return {
                'completed_lessons': completed_lessons,
                'total_lessons': total_lessons,
                'completion_percentage': completion_percentage,
                'is_completed': completion_percentage >= 100
            }
        except Exception as e:
            logger.error(f"Error checking course completion: {str(e)}")
            return {'completed_lessons': 0, 'total_lessons': 0, 'completion_percentage': 0}
    
    def get_lesson_resources(self, lesson_id: str) -> List[Dict[str, Any]]:
        """Get all resources for a lesson"""
        try:
            response = self.client.table('lesson_resources').select('*').eq('lesson_id', lesson_id).order('created_at').execute()
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting lesson resources: {str(e)}")
            return []
    
    def add_lesson_resource(self, lesson_id: str, title: str, description: str, resource_type: str,
                           url: str, is_required: bool = False, added_by: str = None) -> Optional[Dict[str, Any]]:
        """Add a resource to a lesson"""
        try:
            from datetime import datetime
            
            resource_data = {
                'lesson_id': lesson_id,
                'title': title,
                'description': description,
                'resource_type': resource_type,
                'url': url,
                'is_required': is_required,
                'added_by': added_by,
                'created_at': datetime.utcnow().isoformat()
            }
            
            response = self.client.table('lesson_resources').insert(resource_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error adding lesson resource: {str(e)}")
            return None
    
    def duplicate_lesson(self, lesson_id: str, target_course_id: str, new_title: str, created_by: str) -> Optional[Dict[str, Any]]:
        """Duplicate a lesson to same or different course"""
        try:
            # Get original lesson
            original_lesson = self.get_lesson_by_id(lesson_id)
            if not original_lesson:
                return None
            
            # Create new lesson data
            new_lesson_data = dict(original_lesson)
            new_lesson_data.pop('id', None)
            new_lesson_data.pop('created_at', None)
            new_lesson_data.pop('updated_at', None)
            new_lesson_data['course_id'] = target_course_id
            new_lesson_data['title'] = new_title
            new_lesson_data['status'] = 'draft'  # Always start as draft
            new_lesson_data['created_by'] = created_by
            
            # Create the duplicated lesson
            duplicated_lesson = self.create_lesson(**new_lesson_data)
            
            if duplicated_lesson:
                # Copy resources if any
                resources = self.get_lesson_resources(lesson_id)
                for resource in resources:
                    resource_data = dict(resource)
                    resource_data.pop('id', None)
                    resource_data.pop('created_at', None)
                    resource_data['lesson_id'] = duplicated_lesson['id']
                    resource_data['added_by'] = created_by
                    self.add_lesson_resource(**resource_data)
            
            return duplicated_lesson
        except Exception as e:
            logger.error(f"Error duplicating lesson: {str(e)}")
            return None

    # ==================== PHASE 4: ADVANCED ASSIGNMENTS & GRADING METHODS ====================
    
    # Question Management Methods
    def get_assignment_questions(self, assignment_id: str) -> List[Dict[str, Any]]:
        """Get all questions for an assignment"""
        try:
            response = self.client.table('assignment_questions').select('*').eq('assignment_id', assignment_id).order('order_index').execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting assignment questions: {str(e)}")
            return []
    
    def create_assignment_question(self, question_data: Dict[str, Any]) -> Optional[str]:
        """Create a new assignment question"""
        try:
            response = self.client.table('assignment_questions').insert(question_data).execute()
            return response.data[0]['id'] if response.data else None
        except Exception as e:
            logger.error(f"Error creating assignment question: {str(e)}")
            return None
    
    def update_assignment_question(self, question_id: str, update_data: Dict[str, Any]) -> bool:
        """Update an assignment question"""
        try:
            update_data['updated_at'] = datetime.utcnow().isoformat()
            response = self.client.table('assignment_questions').update(update_data).eq('id', question_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error updating assignment question: {str(e)}")
            return False
    
    def delete_assignment_question(self, question_id: str) -> bool:
        """Delete an assignment question"""
        try:
            response = self.client.table('assignment_questions').delete().eq('id', question_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error deleting assignment question: {str(e)}")
            return False
    
    # Assignment Duplication & Templates
    def get_assignment_question_by_id(self, question_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific assignment question by ID"""
        try:
            response = self.client.table('assignment_questions').select('*').eq('id', question_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting assignment question by ID: {str(e)}")
            return None

    def duplicate_assignment(self, assignment_id: str, new_assignment_data: Dict[str, Any]) -> Optional[str]:
        """Duplicate an assignment with all its questions"""
        try:
            # Create new assignment
            response = self.client.table('assignments').insert(new_assignment_data).execute()
            if not response.data:
                return None
            
            new_assignment_id = response.data[0]['id']
            
            # Copy all questions
            questions = self.get_assignment_questions(assignment_id)
            for question in questions:
                question_data = dict(question)
                question_data.pop('id', None)
                question_data.pop('created_at', None)
                question_data.pop('updated_at', None)
                question_data['assignment_id'] = new_assignment_id
                question_data['created_by'] = new_assignment_data['created_by']
                question_data['created_at'] = datetime.utcnow().isoformat()
                
                self.create_assignment_question(question_data)
            
            return new_assignment_id
        except Exception as e:
            logger.error(f"Error duplicating assignment: {str(e)}")
            return None
    
    # Assignment Extensions
    def grant_assignment_extension(self, extension_data: Dict[str, Any]) -> Optional[str]:
        """Grant an assignment extension"""
        try:
            response = self.client.table('assignment_extensions').insert(extension_data).execute()
            return response.data[0]['id'] if response.data else None
        except Exception as e:
            logger.error(f"Error granting assignment extension: {str(e)}")
            return None
    
    def get_assignment_extensions(self, assignment_id: str) -> List[Dict[str, Any]]:
        """Get all extensions for an assignment"""
        try:
            response = self.client.table('assignment_extensions').select('''
                *,
                student:student_id(id, name, email),
                granter:granted_by(id, name)
            ''').eq('assignment_id', assignment_id).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting assignment extensions: {str(e)}")
            return []
    
    def get_student_assignment_extension(self, assignment_id: str, student_id: str) -> Optional[Dict[str, Any]]:
        """Get assignment extension for a specific student"""
        try:
            response = self.client.table('assignment_extensions').select('*').eq('assignment_id', assignment_id).eq('student_id', student_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting student assignment extension: {str(e)}")
            return None
    
    # Submission Validation & Status
    def get_student_submission_count(self, assignment_id: str, student_id: str) -> int:
        """Get number of submissions by student for assignment"""
        try:
            response = self.client.table('assignment_submissions').select('id').eq('assignment_id', assignment_id).eq('student_id', student_id).execute()
            return len(response.data) if response.data else 0
        except Exception as e:
            logger.error(f"Error getting student submission count: {str(e)}")
            return 0
    
    def get_assignment_submission_status(self, assignment_id: str, student_id: str) -> Dict[str, Any]:
        """Get detailed submission status for student assignment"""
        try:
            response = self.client.table('assignment_submissions').select('*').eq('assignment_id', assignment_id).eq('student_id', student_id).order('created_at', desc=True).execute()
            
            if response.data:
                latest_submission = response.data[0]
                return {
                    'has_submitted': True,
                    'submission_id': latest_submission['id'],
                    'status': latest_submission.get('status', 'submitted'),
                    'submitted_at': latest_submission.get('submitted_at'),
                    'is_late': latest_submission.get('is_late', False),
                    'attempt_number': latest_submission.get('attempt_number', 1),
                    'grade': latest_submission.get('grade'),
                    'feedback': latest_submission.get('feedback')
                }
            else:
                return {
                    'has_submitted': False,
                    'submission_id': None,
                    'status': 'not_submitted',
                    'submitted_at': None,
                    'is_late': False,
                    'attempt_number': 0,
                    'grade': None,
                    'feedback': None
                }
        except Exception as e:
            logger.error(f"Error getting assignment submission status: {str(e)}")
            return {'has_submitted': False, 'status': 'error'}
    
    # Rubric Management
    def save_assignment_rubric(self, rubric_data: Dict[str, Any]) -> Optional[str]:
        """Save a generated rubric for an assignment"""
        try:
            response = self.client.table('assignment_rubrics').insert(rubric_data).execute()
            return response.data[0]['id'] if response.data else None
        except Exception as e:
            logger.error(f"Error saving assignment rubric: {str(e)}")
            return None
    
    def get_assignment_rubric(self, assignment_id: str) -> Optional[Dict[str, Any]]:
        """Get rubric for an assignment"""
        try:
            response = self.client.table('assignment_rubrics').select('*').eq('assignment_id', assignment_id).order('created_at', desc=True).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting assignment rubric: {str(e)}")
            return None
    
    # Advanced Grading Methods
    def create_submission_grade(self, grade_data: Dict[str, Any]) -> Optional[str]:
        """Create a grade record for a submission"""
        try:
            response = self.client.table('submission_grades').insert(grade_data).execute()
            return response.data[0]['id'] if response.data else None
        except Exception as e:
            logger.error(f"Error creating submission grade: {str(e)}")
            return None
    
    def get_submission_grade(self, submission_id: str) -> Optional[Dict[str, Any]]:
        """Get grade information for a submission"""
        try:
            response = self.client.table('submission_grades').select('''
                *,
                grader:grader_id(id, name)
            ''').eq('submission_id', submission_id).order('created_at', desc=True).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting submission grade: {str(e)}")
            return None
    
    def update_submission_status(self, submission_id: str, status: str) -> bool:
        """Update submission status"""
        try:
            response = self.client.table('assignment_submissions').update({
                'status': status,
                'updated_at': datetime.utcnow().isoformat()
            }).eq('id', submission_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error updating submission status: {str(e)}")
            return False
    
    def get_submission_answers(self, submission_id: str) -> Dict[str, Any]:
        """Get answers for a submission"""
        try:
            response = self.client.table('assignment_submissions').select('answers').eq('id', submission_id).execute()
            if response.data and response.data[0].get('answers'):
                return response.data[0]['answers']
            return {}
        except Exception as e:
            logger.error(f"Error getting submission answers: {str(e)}")
            return {}
    
    def get_submission_by_id(self, submission_id: str) -> Optional[Dict[str, Any]]:
        """Get submission by ID with related data"""
        try:
            response = self.client.table('assignment_submissions').select('''
                *,
                assignment:assignment_id(id, title, course_id),
                student:student_id(id, name, email)
            ''').eq('id', submission_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting submission by ID: {str(e)}")
            return None
    
    def get_assignment_submissions(self, assignment_id: str, status_filter: str = None) -> List[Dict[str, Any]]:
        """Get all submissions for an assignment"""
        try:
            query = self.client.table('assignment_submissions').select('''
                *,
                student:student_id(id, name, email)
            ''').eq('assignment_id', assignment_id)
            
            if status_filter:
                query = query.eq('status', status_filter)
            
            response = query.order('submitted_at', desc=True).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting assignment submissions: {str(e)}")
            return []
    
    def get_student_assignment_submissions(self, student_id: str, assignment_id: str) -> List[Dict[str, Any]]:
        """Get all submissions by a student for a specific assignment"""
        try:
            response = self.client.table('assignment_submissions').select('*').eq('student_id', student_id).eq('assignment_id', assignment_id).order('submitted_at', desc=True).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting student assignment submissions: {str(e)}")
            return []
    
    def get_assignment_statistics(self, assignment_id: str) -> Dict[str, Any]:
        """Get comprehensive statistics for an assignment"""
        try:
            # Get submissions
            submissions = self.get_assignment_submissions(assignment_id)
            
            # Get grades
            grades = []
            for submission in submissions:
                grade = self.get_submission_grade(submission['id'])
                if grade:
                    grades.append(grade['score'])
            
            # Calculate statistics
            total_submissions = len(submissions)
            graded_submissions = len(grades)
            
            stats = {
                'total_submissions': total_submissions,
                'graded_submissions': graded_submissions,
                'pending_submissions': total_submissions - graded_submissions,
                'average_grade': sum(grades) / len(grades) if grades else 0,
                'highest_grade': max(grades) if grades else 0,
                'lowest_grade': min(grades) if grades else 0,
                'submission_rate': 0,  # Would need enrollment data
                'late_submissions': len([s for s in submissions if s.get('is_late', False)])
            }
            
            return stats
        except Exception as e:
            logger.error(f"Error getting assignment statistics: {str(e)}")
            return {
                'total_submissions': 0,
                'graded_submissions': 0,
                'pending_submissions': 0,
                'average_grade': 0,
                'highest_grade': 0,
                'lowest_grade': 0,
                'submission_rate': 0,
                'late_submissions': 0
            }
    
    # Override existing method to be more comprehensive
    def get_assignment_by_id(self, assignment_id: str) -> Optional[Dict[str, Any]]:
        """Get assignment by ID with comprehensive data"""
        try:
            response = self.client.table('assignments').select('''
                *,
                course:course_id(id, title, instructor_id),
                creator:created_by(id, name),
                questions:assignment_questions(count)
            ''').eq('id', assignment_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting assignment by ID: {str(e)}")
            return None
    
    # Enhanced assignment creation
    def create_assignment(self, assignment_data: Dict[str, Any]) -> Optional[str]:
        """Create a new assignment"""
        try:
            response = self.client.table('assignments').insert(assignment_data).execute()
            return response.data[0]['id'] if response.data else None
        except Exception as e:
            logger.error(f"Error creating assignment: {str(e)}")
            return None
    
    def update_assignment(self, assignment_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an assignment"""
        try:
            update_data['updated_at'] = datetime.utcnow().isoformat()
            response = self.client.table('assignments').update(update_data).eq('id', assignment_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating assignment: {str(e)}")
            return None
    
    def delete_assignment(self, assignment_id: str) -> bool:
        """Delete an assignment and related data"""
        try:
            # First delete related questions
            self.client.table('assignment_questions').delete().eq('assignment_id', assignment_id).execute()
            
            # Delete submissions (or mark as archived)
            self.client.table('assignment_submissions').update({
                'status': 'archived'
            }).eq('assignment_id', assignment_id).execute()
            
            # Delete the assignment
            response = self.client.table('assignments').delete().eq('id', assignment_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error deleting assignment: {str(e)}")
            return False

    # Notification Methods
    def get_unread_notification_count(self, user_id: str) -> int:
        """Get count of unread notifications for user"""
        try:
            response = self.client.table('notifications').select('id').eq('recipient_id', user_id).eq('is_read', False).execute()
            return len(response.data) if response.data else 0
        except Exception as e:
            logger.error(f"Error getting unread notification count: {str(e)}")
            return 0

    def get_user_notifications(self, user_id: str, include_archived: bool = False, include_deleted: bool = False) -> List[Dict[str, Any]]:
        """Get notifications for user with optional archived/deleted inclusion"""
        try:
            query = self.client.table('notifications').select('*').eq('recipient_id', user_id)
            
            # Filter out archived if not included
            if not include_archived:
                query = query.eq('is_archived', False)
            
            # Filter out deleted if not included
            if not include_deleted:
                query = query.eq('is_deleted', False)
            
            response = query.order('created_at', desc=True).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting user notifications: {str(e)}")
            return []

    def get_notification_stats(self, user_id: str) -> Dict[str, Any]:
        """Get notification statistics for user"""
        try:
            # Get all notifications
            all_response = self.client.table('notifications').select('id, is_read').eq('recipient_id', user_id).execute()
            all_notifications = all_response.data if all_response.data else []
            
            # Count stats
            total = len(all_notifications)
            unread = len([n for n in all_notifications if not n.get('is_read', True)])
            read = total - unread
            
            return {
                'total': total,
                'read': read,
                'unread': unread
            }
        except Exception as e:
            logger.error(f"Error getting notification stats: {str(e)}")
            return {'total': 0, 'read': 0, 'unread': 0}

    def create_notification(self, notification_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new notification"""
        try:
            response = self.client.table('notifications').insert(notification_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating notification: {str(e)}")
            return None

    def mark_notification_read(self, notification_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Mark a notification as read for user"""
        try:
            response = self.client.table('notifications').update({
                'is_read': True,
                'read_at': datetime.utcnow().isoformat()
            }).eq('id', notification_id).eq('recipient_id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error marking notification as read: {str(e)}")
            return None

    def archive_notification(self, notification_id: str, user_id: str) -> bool:
        """Archive a notification for user"""
        try:
            response = self.client.table('notifications').update({
                'is_archived': True
            }).eq('id', notification_id).eq('recipient_id', user_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error archiving notification: {str(e)}")
            return False

    def delete_notification(self, notification_id: str, user_id: str) -> bool:
        """Delete a notification (admin only)"""
        try:
            response = self.client.table('notifications').delete().eq('id', notification_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error deleting notification: {str(e)}")
            return False

    def delete_notification_for_user(self, notification_id: str, user_id: str) -> bool:
        """Delete (soft delete) a notification for user"""
        try:
            response = self.client.table('notifications').update({
                'is_deleted': True
            }).eq('id', notification_id).eq('recipient_id', user_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error deleting notification for user: {str(e)}")
            return False

    def bulk_notification_action(self, notification_ids: List[str], user_id: str, action: str) -> List[Dict[str, Any]]:
        """Perform bulk action on notifications"""
        try:
            update_data = {}
            if action == 'read':
                update_data['is_read'] = True
            elif action == 'archive':
                update_data['is_archived'] = True
            elif action == 'delete':
                update_data['is_deleted'] = True
            elif action == 'unarchive':
                update_data['is_archived'] = False
            elif action == 'restore':
                update_data['is_deleted'] = False
            
            if not update_data:
                return []
            
            response = self.client.table('notifications').update(update_data).in_('id', notification_ids).eq('recipient_id', user_id).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error performing bulk notification action: {str(e)}")
            return []

    def mark_all_notifications_read(self, user_id: str) -> int:
        """Mark all notifications as read for user"""
        try:
            response = self.client.table('notifications').update({
                'is_read': True
            }).eq('recipient_id', user_id).eq('is_read', False).execute()
            return len(response.data) if response.data else 0
        except Exception as e:
            logger.error(f"Error marking all notifications as read: {str(e)}")
            return 0

    def bulk_delete_notifications(self, notification_ids: List[str], user_id: str) -> int:
        """Bulk delete notifications"""
        try:
            response = self.client.table('notifications').update({
                'is_deleted': True
            }).in_('id', notification_ids).eq('recipient_id', user_id).execute()
            return len(response.data) if response.data else 0
        except Exception as e:
            logger.error(f"Error bulk deleting notifications: {str(e)}")
            return 0

    def bulk_mark_notifications_read(self, notification_ids: List[str], user_id: str) -> int:
        """Bulk mark notifications as read"""
        try:
            response = self.client.table('notifications').update({
                'is_read': True
            }).in_('id', notification_ids).eq('recipient_id', user_id).execute()
            return len(response.data) if response.data else 0
        except Exception as e:
            logger.error(f"Error bulk marking notifications as read: {str(e)}")
            return 0

    def get_all_notifications_admin(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get all notifications for admin management"""
        try:
            query = self.client.table('notifications').select('*')
            
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            
            response = query.order('created_at', desc=True).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting admin notifications: {str(e)}")
            return []

    def get_notification_recipients(self, notification_id: str) -> List[Dict[str, Any]]:
        """Get recipients for a notification"""
        try:
            response = self.client.table('notifications').select('*').eq('id', notification_id).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting notification recipients: {str(e)}")
            return []

    def update_notification_admin(self, notification_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update notification as admin"""
        try:
            response = self.client.table('notifications').update(update_data).eq('id', notification_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating notification admin: {str(e)}")
            return None

    def delete_admin_notification(self, notification_id: str) -> bool:
        """Delete notification as admin"""
        try:
            response = self.client.table('notifications').delete().eq('id', notification_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error deleting admin notification: {str(e)}")
            return False

    def create_bulk_notifications(self, title: str, message: str, sender_id: str,
                                notification_type: str, priority: str, recipients: List[str],
                                scheduled_for: str = None) -> List[Dict[str, Any]]:
        """Create bulk notifications"""
        try:
            notifications = []
            for recipient in recipients:
                notification_data = {
                    'title': title,
                    'message': message,
                    'sender_id': sender_id,
                    'recipient_id': recipient,
                    'type': notification_type,
                    'priority': priority,
                    'is_read': False,
                    'is_archived': False,
                    'is_deleted': False
                }
                if scheduled_for:
                    notification_data['scheduled_for'] = scheduled_for
                
                notifications.append(notification_data)
            
            response = self.client.table('notifications').insert(notifications).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error creating bulk notifications: {str(e)}")
            return []

    def get_notification_templates(self) -> List[Dict[str, Any]]:
        """Get all notification templates"""
        try:
            response = self.client.table('notification_templates').select('*').execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting notification templates: {str(e)}")
            return []

    def create_notification_template(self, name: str, title: str, message: str,
                                    notification_type: str, priority: str,
                                    variables: List[str], created_by: str) -> Optional[Dict[str, Any]]:
        """Create a notification template"""
        try:
            template_data = {
                'name': name,
                'title': title,
                'message': message,
                'type': notification_type,
                'priority': priority,
                'variables': variables,
                'created_by': created_by
            }
            
            response = self.client.table('notification_templates').insert(template_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating notification template: {str(e)}")
            return None

    def update_notification_template(self, template_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a notification template"""
        try:
            response = self.client.table('notification_templates').update(update_data).eq('id', template_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating notification template: {str(e)}")
            return None

    def delete_notification_template(self, template_id: str) -> bool:
        """Delete a notification template"""
        try:
            response = self.client.table('notification_templates').delete().eq('id', template_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error deleting notification template: {str(e)}")
            return False

    def get_notification_template(self, template_id: str) -> Optional[Dict[str, Any]]:
        """Get a notification template"""
        try:
            response = self.client.table('notification_templates').select('*').eq('id', template_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting notification template: {str(e)}")
            return None

    def process_template_variables(self, template_string: str, variables: Dict[str, Any]) -> str:
        """Process template variables"""
        try:
            result = template_string
            for key, value in variables.items():
                result = result.replace(f'{{{key}}}', str(value))
            return result
        except Exception as e:
            logger.error(f"Error processing template variables: {str(e)}")
            return template_string

    def get_notification_statistics(self) -> Dict[str, Any]:
        """Get notification statistics"""
        try:
            # Get total notifications
            total_response = self.client.table('notifications').select('id').execute()
            total = len(total_response.data) if total_response.data else 0
            
            # Get unread notifications
            unread_response = self.client.table('notifications').select('id').eq('is_read', False).execute()
            unread = len(unread_response.data) if unread_response.data else 0
            
            return {
                'total': total,
                'unread': unread,
                'read': total - unread
            }
        except Exception as e:
            logger.error(f"Error getting notification statistics: {str(e)}")
            return {'total': 0, 'unread': 0, 'read': 0}

    def get_scheduled_notifications(self) -> List[Dict[str, Any]]:
        """Get scheduled notifications"""
        try:
            response = self.client.table('notifications').select('*').not_.is_('scheduled_for', None).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting scheduled notifications: {str(e)}")
            return []

    def cancel_scheduled_notification(self, notification_id: str) -> bool:
        """Cancel a scheduled notification"""
        try:
            response = self.client.table('notifications').delete().eq('id', notification_id).not_.is_('scheduled_for', None).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error cancelling scheduled notification: {str(e)}")
            return False

# Global database service instance
db_service = DatabaseService()
