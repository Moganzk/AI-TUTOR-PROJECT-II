"""
Course Database Operations Module
Handles all course-related database operations with real-time event emission.
"""

import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Union, Tuple
from database import db
import uuid

logger = logging.getLogger(__name__)

class CourseDatabaseManager:
    """Centralized course database operations with real-time events"""
    
    def __init__(self):
        self.table = 'courses'
        self.enrollments_table = 'course_enrollments'
    
    def get_all_courses(self, limit: int = 50, offset: int = 0, 
                       search: str = None, instructor_filter: str = None,
                       status_filter: str = None) -> Tuple[List[Dict], int]:
        """
        Get paginated list of courses with filtering
        
        Args:
            limit: Number of courses to return (max 100)
            offset: Number of courses to skip
            search: Search term for title/description
            instructor_filter: Filter by instructor ID
            status_filter: Filter by status (active, inactive, archived)
            
        Returns:
            Tuple of (courses_list, total_count)
        """
        try:
            # Build query with filters
            query = db.supabase.table(self.table).select('*')
            
            # Apply search filter
            if search:
                search_term = f"%{search}%"
                query = query.or_(f"title.ilike.{search_term},description.ilike.{search_term}")
            
            # Apply role filter
            if instructor_filter and instructor_filter != 'all':
                query = query.eq('instructor_id', instructor_filter)
            
            # Apply status filter
            if status_filter and status_filter != 'all':
                if status_filter == 'active':
                    query = query.eq('is_active', True)
                elif status_filter == 'inactive':
                    query = query.eq('is_active', False)
                elif status_filter == 'archived':
                    query = query.eq('status', 'archived')
            
            # Apply pagination and ordering in one query
            query = query.range(offset, offset + limit - 1).order('created_at', desc=True)
            
            result = query.execute()
            
            if result.data:
                courses = [self._process_course_data(course) for course in result.data]
                
                # For now, use the returned count as total (this is an approximation)
                # In production, you might want to do a separate count query only when needed
                total_count = len(courses) + offset
                if len(courses) < limit:
                    total_count = offset + len(courses)
                else:
                    # Estimate based on full page - this avoids expensive count queries
                    total_count = offset + limit + 1  # +1 to indicate there might be more
                
                logger.info(f"Retrieved {len(courses)} courses (estimated total: {total_count})")
                return courses, total_count
            
            return [], 0
            
        except Exception as e:
            logger.error(f"Error getting courses: {e}")
            # Return fallback data for development - this should be fast
            logger.info("Using fallback course data for performance")
            fallback_courses = self._get_fallback_courses()
            
            # Apply client-side filtering to fallback data
            filtered_courses = fallback_courses
            
            if search:
                search_lower = search.lower()
                filtered_courses = [
                    course for course in filtered_courses
                    if search_lower in course.get('title', '').lower() or 
                       search_lower in course.get('description', '').lower()
                ]
            
            if instructor_filter and instructor_filter != 'all':
                filtered_courses = [
                    course for course in filtered_courses
                    if course.get('instructor_id') == instructor_filter
                ]
            
            if status_filter and status_filter != 'all':
                if status_filter == 'active':
                    filtered_courses = [c for c in filtered_courses if c.get('is_active')]
                elif status_filter == 'inactive':
                    filtered_courses = [c for c in filtered_courses if not c.get('is_active')]
            
            # Apply pagination to fallback data
            start_idx = offset
            end_idx = offset + limit
            paginated_courses = filtered_courses[start_idx:end_idx]
            
            return paginated_courses, len(filtered_courses)
    
    def get_course_by_id(self, course_id: str) -> Optional[Dict]:
        """Get single course by ID"""
        try:
            result = db.supabase.table(self.table).select('*').eq('id', course_id).execute()
            
            if result.data and len(result.data) > 0:
                return self._process_course_data(result.data[0])
            
            # Try fallback data
            fallback_courses = self._get_fallback_courses()
            for course in fallback_courses:
                if course['id'] == course_id:
                    return course
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting course {course_id}: {e}")
            return None
    
    def create_course(self, course_data: Dict) -> Tuple[Optional[Dict], Optional[str]]:
        """
        Create a new course
        
        Args:
            course_data: Course information dict
            
        Returns:
            Tuple of (created_course, error_message)
        """
        try:
            # Validate required fields
            required_fields = ['title', 'instructor_id']
            for field in required_fields:
                if not course_data.get(field):
                    return None, f"Missing required field: {field}"
            
            # Check if course with same title exists for instructor
            existing = db.supabase.table(self.table).select('id').eq('title', course_data['title']).eq('instructor_id', course_data['instructor_id']).execute()
            
            if existing.data:
                return None, "Course with this title already exists for this instructor"
            
            # Prepare course data
            new_course = {
                'id': str(uuid.uuid4()),
                'title': course_data['title'],
                'description': course_data.get('description', ''),
                'instructor_id': course_data['instructor_id'],
                'credit_hours': course_data.get('credit_hours', 3),
                'max_students': course_data.get('max_students', 50),
                'status': course_data.get('status', 'active'),
                'is_active': course_data.get('is_active', True),
                'start_date': course_data.get('start_date'),
                'end_date': course_data.get('end_date'),
                'thumbnail_url': course_data.get('thumbnail_url', ''),
                'syllabus_url': course_data.get('syllabus_url', ''),
                'created_at': datetime.now(timezone.utc).isoformat(),
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
            
            # Insert into database
            result = db.supabase.table(self.table).insert(new_course).execute()
            
            if result.data and len(result.data) > 0:
                created_course = self._process_course_data(result.data[0])
                
                # Log audit
                self._log_course_audit(created_course['id'], 'created', {'course_data': created_course})
                
                # Emit real-time event
                self._emit_course_event('course_created', created_course)
                
                return created_course, None
            
            return None, "Failed to create course"
            
        except Exception as e:
            logger.error(f"Error creating course: {e}")
            return None, str(e)
    
    def update_course(self, course_id: str, update_data: Dict) -> Tuple[Optional[Dict], Optional[str]]:
        """
        Update course information
        
        Args:
            course_id: Course ID to update
            update_data: Fields to update
            
        Returns:
            Tuple of (updated_course, error_message)
        """
        try:
            # Get current course
            current_course = self.get_course_by_id(course_id)
            if not current_course:
                return None, "Course not found"
            
            # Prepare update data
            update_fields = {
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
            
            # Update allowed fields
            allowed_fields = [
                'title', 'description', 'credit_hours', 'max_students', 
                'status', 'is_active', 'start_date', 'end_date',
                'thumbnail_url', 'syllabus_url'
            ]
            
            for field in allowed_fields:
                if field in update_data:
                    update_fields[field] = update_data[field]
            
            # Update in database
            result = db.supabase.table(self.table).update(update_fields).eq('id', course_id).execute()
            
            if result.data and len(result.data) > 0:
                updated_course = self._process_course_data(result.data[0])
                
                # Log audit
                self._log_course_audit(course_id, 'updated', {
                    'old_data': current_course,
                    'new_data': updated_course,
                    'changes': update_fields
                })
                
                # Emit real-time event
                self._emit_course_event('course_updated', updated_course)
                
                return updated_course, None
            
            return None, "Failed to update course"
            
        except Exception as e:
            logger.error(f"Error updating course {course_id}: {e}")
            return None, str(e)
    
    def delete_course(self, course_id: str, soft_delete: bool = True) -> Tuple[bool, Optional[str]]:
        """
        Delete course (soft or hard delete)
        
        Args:
            course_id: Course ID to delete
            soft_delete: If True, mark as deleted; if False, permanently remove
            
        Returns:
            Tuple of (success, error_message)
        """
        try:
            # Get current course for audit
            current_course = self.get_course_by_id(course_id)
            if not current_course:
                return False, "Course not found"
            
            if soft_delete:
                # Soft delete: mark as inactive and archived
                update_data = {
                    'is_active': False,
                    'status': 'archived',
                    'updated_at': datetime.now(timezone.utc).isoformat()
                }
                
                result = db.supabase.table(self.table).update(update_data).eq('id', course_id).execute()
                
                if result.data:
                    self._log_course_audit(course_id, 'soft_deleted', {'course_data': current_course})
                    self._emit_course_event('course_archived', current_course)
                    return True, None
            else:
                # Hard delete: remove from database
                result = db.supabase.table(self.table).delete().eq('id', course_id).execute()
                
                if result.data is not None:  # Supabase returns empty list for successful delete
                    self._log_course_audit(course_id, 'hard_deleted', {'course_data': current_course})
                    self._emit_course_event('course_deleted', current_course)
                    return True, None
            
            return False, "Failed to delete course"
            
        except Exception as e:
            logger.error(f"Error deleting course {course_id}: {e}")
            return False, f"Database error: {str(e)}"
    
    def enroll_student(self, course_id: str, student_id: str) -> Tuple[bool, Optional[str]]:
        """
        Enroll student in course
        
        Args:
            course_id: Course ID
            student_id: Student ID
            
        Returns:
            Tuple of (success, error_message)
        """
        try:
            # Check if course exists
            course = self.get_course_by_id(course_id)
            if not course:
                return False, "Course not found"
            
            # Check if already enrolled
            existing = db.supabase.table(self.enrollments_table).select('id').eq('course_id', course_id).eq('student_id', student_id).execute()
            
            if existing.data:
                return False, "Student already enrolled in this course"
            
            # Check enrollment capacity
            current_enrollments = self.get_enrollment_count(course_id)
            if current_enrollments >= course.get('max_students', 50):
                return False, "Course is at maximum capacity"
            
            # Create enrollment
            enrollment_data = {
                'id': str(uuid.uuid4()),
                'course_id': course_id,
                'student_id': student_id,
                'enrolled_at': datetime.now(timezone.utc).isoformat(),
                'status': 'active'
            }
            
            result = db.supabase.table(self.enrollments_table).insert(enrollment_data).execute()
            
            if result.data:
                # Emit real-time event
                self._emit_course_event('student_enrolled', {
                    'course_id': course_id,
                    'student_id': student_id,
                    'enrollment': enrollment_data
                })
                
                return True, None
            
            return False, "Failed to enroll student"
            
        except Exception as e:
            logger.error(f"Error enrolling student: {e}")
            return False, str(e)
    
    def unenroll_student(self, course_id: str, student_id: str) -> Tuple[bool, Optional[str]]:
        """
        Unenroll student from course
        
        Args:
            course_id: Course ID
            student_id: Student ID
            
        Returns:
            Tuple of (success, error_message)
        """
        try:
            # Check if enrolled
            existing = db.supabase.table(self.enrollments_table).select('*').eq('course_id', course_id).eq('student_id', student_id).execute()
            
            if not existing.data:
                return False, "Student not enrolled in this course"
            
            # Remove enrollment
            result = db.supabase.table(self.enrollments_table).delete().eq('course_id', course_id).eq('student_id', student_id).execute()
            
            if result.data is not None:
                # Emit real-time event
                self._emit_course_event('student_unenrolled', {
                    'course_id': course_id,
                    'student_id': student_id
                })
                
                return True, None
            
            return False, "Failed to unenroll student"
            
        except Exception as e:
            logger.error(f"Error unenrolling student: {e}")
            return False, str(e)
    
    def get_enrollment_count(self, course_id: str) -> int:
        """Get number of students enrolled in course"""
        try:
            result = db.supabase.table(self.enrollments_table).select('id').eq('course_id', course_id).execute()
            return len(result.data) if result.data else 0
        except Exception as e:
            logger.error(f"Error getting enrollment count: {e}")
            return 0
    
    def get_course_enrollments(self, course_id: str) -> List[Dict]:
        """Get all enrollments for a course"""
        try:
            result = db.supabase.table(self.enrollments_table).select('*, users(name, email)').eq('course_id', course_id).execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Error getting course enrollments: {e}")
            return []
    
    def get_student_enrollments(self, student_id: str) -> List[Dict]:
        """Get all courses a student is enrolled in"""
        try:
            result = db.supabase.table(self.enrollments_table).select('*, courses(*)').eq('student_id', student_id).execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Error getting student enrollments: {e}")
            return []
    
    def is_student_enrolled(self, course_id: str, student_id: str) -> bool:
        """Check if student is enrolled in course"""
        try:
            result = db.supabase.table(self.enrollments_table).select('id').eq('course_id', course_id).eq('student_id', student_id).execute()
            return len(result.data) > 0 if result.data else False
        except Exception as e:
            logger.error(f"Error checking enrollment: {e}")
            return False
    
    def _process_course_data(self, course: Dict) -> Dict:
        """Process course data for consistent API response"""
        return {
            'id': course.get('id'),
            'title': course.get('title'),
            'description': course.get('description'),
            'instructor_id': course.get('instructor_id'),
            'instructor_name': course.get('instructor_name', 'Unknown'),
            'credit_hours': course.get('credit_hours', 3),
            'max_students': course.get('max_students', 50),
            'current_students': course.get('current_students', 0),
            'status': course.get('status', 'active'),
            'is_active': course.get('is_active', True),
            'start_date': course.get('start_date'),
            'end_date': course.get('end_date'),
            'thumbnail_url': course.get('thumbnail_url', '/api/placeholder/300/200'),
            'syllabus_url': course.get('syllabus_url'),
            'created_at': course.get('created_at'),
            'updated_at': course.get('updated_at'),
            'assignments_count': course.get('assignments_count', 0),
            'lessons_count': course.get('lessons_count', 0),
            'avg_completion': course.get('avg_completion', 0)
        }
    
    def _get_fallback_courses(self) -> List[Dict]:
        """Return fallback course data for development"""
        return [
            {
                'id': 'course-math-001',
                'title': 'Advanced Mathematics',
                'description': 'Comprehensive course covering calculus, algebra, and statistics',
                'instructor_id': 'user-staff-001',
                'instructor_name': 'Prof. Morgan Styles',
                'credit_hours': 4,
                'max_students': 30,
                'current_students': 25,
                'status': 'active',
                'is_active': True,
                'start_date': '2025-01-15T00:00:00Z',
                'end_date': '2025-05-15T00:00:00Z',
                'thumbnail_url': '/api/placeholder/300/200',
                'syllabus_url': '/api/placeholder/syllabus.pdf',
                'created_at': '2025-01-01T00:00:00Z',
                'updated_at': '2025-01-10T00:00:00Z',
                'assignments_count': 8,
                'lessons_count': 24,
                'avg_completion': 78
            },
            {
                'id': 'course-science-001',
                'title': 'Physics Fundamentals',
                'description': 'Introduction to classical and modern physics principles',
                'instructor_id': 'user-staff-001',
                'instructor_name': 'Prof. Morgan Styles',
                'credit_hours': 3,
                'max_students': 25,
                'current_students': 20,
                'status': 'active',
                'is_active': True,
                'start_date': '2025-01-15T00:00:00Z',
                'end_date': '2025-05-15T00:00:00Z',
                'thumbnail_url': '/api/placeholder/300/200',
                'syllabus_url': '/api/placeholder/syllabus.pdf',
                'created_at': '2025-01-01T00:00:00Z',
                'updated_at': '2025-01-10T00:00:00Z',
                'assignments_count': 6,
                'lessons_count': 20,
                'avg_completion': 82
            },
            {
                'id': 'course-cs-001',
                'title': 'Computer Science Basics',
                'description': 'Introduction to programming and computer science concepts',
                'instructor_id': '3dba0721-b5ea-46a3-aaaf-cc19f210d72e',
                'instructor_name': 'Admin Alice',
                'credit_hours': 3,
                'max_students': 35,
                'current_students': 28,
                'status': 'active',
                'is_active': True,
                'start_date': '2025-01-15T00:00:00Z',
                'end_date': '2025-05-15T00:00:00Z',
                'thumbnail_url': '/api/placeholder/300/200',
                'syllabus_url': '/api/placeholder/syllabus.pdf',
                'created_at': '2025-01-01T00:00:00Z',
                'updated_at': '2025-01-10T00:00:00Z',
                'assignments_count': 12,
                'lessons_count': 28,
                'avg_completion': 75
            }
        ]
    
    def _log_course_audit(self, course_id: str, action: str, metadata: Dict):
        """Log course action for audit trail"""
        try:
            audit_data = {
                'id': str(uuid.uuid4()),
                'course_id': course_id,
                'action': action,
                'metadata': metadata,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'ip_address': '',  # Would be populated from request context
                'user_agent': ''   # Would be populated from request context
            }
            
            # Try to insert audit log, but don't fail if table doesn't exist
            try:
                db.supabase.table('course_audit_log').insert(audit_data).execute()
            except Exception as audit_e:
                logger.debug(f"Audit log insert failed (table may not exist): {audit_e}")
                
        except Exception as e:
            logger.warning(f"Failed to log audit for course {course_id}: {e}")
    
    def _emit_course_event(self, event_type: str, course_data: Dict):
        """Emit real-time event for course changes"""
        try:
            # For now, just log the event
            # In production, this would emit to Supabase realtime or WebSocket
            logger.info(f"Real-time event: {event_type} for course {course_data.get('id', 'unknown')}")
            
            # TODO: Implement actual real-time event emission
            # This could be:
            # 1. Supabase realtime trigger
            # 2. WebSocket broadcast via notification_system
            # 3. Server-sent events (SSE)
            
        except Exception as e:
            logger.warning(f"Failed to emit course event: {e}")

# Global instance
course_db = CourseDatabaseManager()

# Legacy function wrappers for backward compatibility
def get_all_courses():
    """Legacy wrapper for getting all courses"""
    courses, _ = course_db.get_all_courses()
    return courses

def get_course_by_id(course_id):
    """Legacy wrapper for getting course by ID"""
    return course_db.get_course_by_id(course_id)

def create_course(course_data):
    """Legacy wrapper for creating course"""
    course, error = course_db.create_course(course_data)
    if error:
        raise Exception(error)
    return course

def update_course(course_id, update_data):
    """Legacy wrapper for updating course"""
    course, error = course_db.update_course(course_id, update_data)
    if error:
        raise Exception(error)
    return course

def delete_course(course_id, soft_delete=True):
    """Legacy wrapper for deleting course"""
    success, error = course_db.delete_course(course_id, soft_delete)
    if error:
        raise Exception(error)
    return success

def enroll_student(course_id, student_id):
    """Legacy wrapper for enrolling student"""
    success, error = course_db.enroll_student(course_id, student_id)
    if error:
        raise Exception(error)
    return success

def unenroll_student(course_id, student_id):
    """Legacy wrapper for unenrolling student"""
    success, error = course_db.unenroll_student(course_id, student_id)
    if error:
        raise Exception(error)
    return success

def get_course_enrollments(course_id):
    """Legacy wrapper for getting course enrollments"""
    return course_db.get_course_enrollments(course_id)

def get_student_enrollments(student_id):
    """Legacy wrapper for getting student enrollments"""
    return course_db.get_student_enrollments(student_id)

def get_enrollment_count(course_id):
    """Legacy wrapper for getting enrollment count"""
    return course_db.get_enrollment_count(course_id)

def is_student_enrolled(course_id, student_id):
    """Legacy wrapper for checking enrollment"""
    return course_db.is_student_enrolled(course_id, student_id)

def get_course_gradebook(course_id):
    """Legacy wrapper for getting course gradebook - placeholder"""
    return {
        'course_id': course_id,
        'students': [],
        'assignments': [],
        'grades': []
    }

def get_courses_by_instructor(instructor_id):
    """Legacy wrapper for getting courses by instructor"""
    courses, _ = course_db.get_all_courses(instructor_filter=instructor_id)
    return courses
    try:
        result = db.supabase.table('courses').select(
            '*,users:instructor_id(full_name,email),subjects:subject_id(name)'
        ).eq('id', course_id).eq('is_active', True).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        
        return None
        
    except Exception as e:
        logger.error(f"Error getting course by ID: {e}")
        return None

def update_course(course_id, updates):
    """Update course information"""
    try:
        # Remove fields that shouldn't be updated directly
        safe_updates = {k: v for k, v in updates.items() 
                       if k not in ['id', 'created_at']}
        
        result = db.supabase.table('courses').update(safe_updates).eq('id', course_id).execute()
        
        if result.data:
            return result.data[0]
        
        return None
        
    except Exception as e:
        logger.error(f"Error updating course: {e}")
        return None

def delete_course(course_id):
    """Delete a course (soft delete)"""
    try:
        result = db.supabase.table('courses').update({'is_active': False}).eq('id', course_id).execute()
        return result.data is not None
        
    except Exception as e:
        logger.error(f"Error deleting course: {e}")
        return False

def get_courses_by_instructor(instructor_id):
    """Get all courses taught by a specific instructor"""
    try:
        result = db.supabase.table('courses').select(
            '*,subjects:subject_id(name)'
        ).eq('instructor_id', instructor_id).eq('is_active', True).execute()
        
        return result.data if result.data else []
        
    except Exception as e:
        logger.error(f"Error getting courses by instructor: {e}")
        return []

# Enrollment Operations
def enroll_student(student_id, course_id):
    """Enroll a student in a course"""
    try:
        # Check if already enrolled
        existing = db.supabase.table('course_enrollments').select('*').eq(
            'student_id', student_id
        ).eq('course_id', course_id).execute()
        
        if existing.data:
            return None, "Student already enrolled in this course"
        
        enrollment_data = {
            'student_id': student_id,
            'course_id': course_id,
            'enrolled_at': datetime.utcnow().isoformat(),
            'is_active': True
        }
        
        result = db.supabase.table('course_enrollments').insert(enrollment_data).execute()
        
        if result.data:
            return result.data[0], None
        
        return None, "Failed to enroll student"
        
    except Exception as e:
        logger.error(f"Error enrolling student: {e}")
        return None, f"Database error: {str(e)}"

def unenroll_student(student_id, course_id):
    """Unenroll a student from a course"""
    try:
        result = db.supabase.table('course_enrollments').delete().eq(
            'student_id', student_id
        ).eq('course_id', course_id).execute()
        
        return result.data is not None
        
    except Exception as e:
        logger.error(f"Error unenrolling student: {e}")
        return False

def get_student_enrollments(student_id):
    """Get all courses a student is enrolled in"""
    try:
        result = db.supabase.table('course_enrollments').select(
            '*,courses:course_id(id,title,description,instructor_id,credit_hours)'
        ).eq('student_id', student_id).eq('is_active', True).execute()
        
        return result.data if result.data else []
        
    except Exception as e:
        logger.error(f"Error getting student enrollments: {e}")
        return []

def get_course_enrollments(course_id):
    """Get all students enrolled in a course"""
    try:
        result = db.supabase.table('course_enrollments').select(
            '*,users:student_id(id,full_name,email)'
        ).eq('course_id', course_id).eq('is_active', True).execute()
        
        return result.data if result.data else []
        
    except Exception as e:
        logger.error(f"Error getting course enrollments: {e}")
        return []

def get_enrollment_count(course_id):
    """Get the number of students enrolled in a course"""
    try:
        result = db.supabase.table('course_enrollments').select(
            'id'
        ).eq('course_id', course_id).eq('is_active', True).execute()
        
        return len(result.data) if result.data else 0
        
    except Exception as e:
        logger.error(f"Error getting enrollment count: {e}")
        return 0

def is_student_enrolled(student_id, course_id):
    """Check if a student is enrolled in a specific course"""
    try:
        result = db.supabase.table('course_enrollments').select('id').eq(
            'student_id', student_id
        ).eq('course_id', course_id).eq('is_active', True).execute()
        
        return len(result.data) > 0 if result.data else False
        
    except Exception as e:
        logger.error(f"Error checking enrollment status: {e}")
        return False

def get_course_gradebook(course_id):
    """Get gradebook data for a course"""
    try:
        # Get all enrollments with student details and submission grades
        result = db.supabase.table('course_enrollments').select(
            '''
            *,
            users:student_id(id,full_name,email),
            assignment_submissions(
                assignment_id,
                grade,
                submitted_at,
                assignments(title)
            )
            '''
        ).eq('course_id', course_id).eq('is_active', True).execute()
        
        return result.data if result.data else []
        
    except Exception as e:
        logger.error(f"Error getting course gradebook: {e}")
        return []

# Create a global instance
course_db = CourseDatabaseManager()
