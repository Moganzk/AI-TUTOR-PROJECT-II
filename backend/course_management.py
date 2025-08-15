"""
Course Management Module
Handles course-related endpoints using the CourseDatabaseManager
"""

from flask import request, jsonify
import logging
from middleware import authenticate_token, require_role
from Database_modules.course_db import course_db

logger = logging.getLogger(__name__)

def register_course_routes(app):
    """Register all course management routes"""
    
    @app.route('/api/courses', methods=['GET'])
    @authenticate_token
    def get_courses():
        """Get paginated list of courses with filtering - REAL DATABASE QUERIES"""
        try:
            # Get query parameters
            limit = min(int(request.args.get('limit', 50)), 100)  # Max 100 per page
            offset = int(request.args.get('offset', 0))
            search = request.args.get('search', '').strip()
            instructor_filter = request.args.get('instructor', '').strip()
            status_filter = request.args.get('status', '').strip()
            
            # Clear empty filters
            search = search if search else None
            instructor_filter = instructor_filter if instructor_filter and instructor_filter != 'all' else None
            status_filter = status_filter if status_filter and status_filter != 'all' else None
            
            # Use real database queries through course_db
            courses, total_count = course_db.get_all_courses(
                limit=limit,
                offset=offset,
                search=search,
                instructor_filter=instructor_filter,
                status_filter=status_filter
            )
            
            return jsonify({
                'success': True,
                'courses': courses,
                'pagination': {
                    'total': total_count,
                    'limit': limit,
                    'offset': offset,
                    'has_more': total_count > offset + limit
                }
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting courses: {e}")
            return jsonify({'error': 'Failed to fetch courses'}), 500

    @app.route('/api/courses', methods=['POST'])
    @authenticate_token
    @require_role(['admin', 'staff'])
    def create_new_course():
        """Create a new course"""
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({'error': 'No data provided'}), 400
            
            # Validate required fields
            required_fields = ['title']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({'error': f'Missing required field: {field}'}), 400
            
            # Set instructor_id if not provided (use current user)
            if not data.get('instructor_id'):
                data['instructor_id'] = request.user['id']
            
            course, error = course_db.create_course(data)
            
            if error:
                return jsonify({'error': error}), 400
            
            return jsonify({
                'success': True,
                'message': 'Course created successfully',
                'course': course
            }), 201
            
        except Exception as e:
            logger.error(f"Error creating course: {e}")
            return jsonify({'error': 'Failed to create course'}), 500

    @app.route('/api/courses/<course_id>', methods=['GET'])
    @authenticate_token
    def get_course(course_id):
        """Get single course by ID"""
        try:
            course = course_db.get_course_by_id(course_id)
            
            if not course:
                return jsonify({'error': 'Course not found'}), 404
            
            # Add enrollment info for current user if student
            if request.user.get('role') == 'student':
                course['is_enrolled'] = course_db.is_student_enrolled(course_id, request.user['id'])
            
            return jsonify({
                'success': True,
                'course': course
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting course {course_id}: {e}")
            return jsonify({'error': 'Failed to fetch course'}), 500

    @app.route('/api/courses/<course_id>', methods=['PUT'])
    @authenticate_token
    @require_role(['admin', 'staff'])
    def update_course_endpoint(course_id):
        """Update course information"""
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({'error': 'No data provided'}), 400
            
            course, error = course_db.update_course(course_id, data)
            
            if error:
                return jsonify({'error': error}), 400
            
            return jsonify({
                'success': True,
                'message': 'Course updated successfully',
                'course': course
            }), 200
            
        except Exception as e:
            logger.error(f"Error updating course {course_id}: {e}")
            return jsonify({'error': 'Failed to update course'}), 500

    @app.route('/api/courses/<course_id>', methods=['DELETE'])
    @authenticate_token
    @require_role(['admin', 'staff'])
    def delete_course_endpoint(course_id):
        """Delete course (soft delete by default)"""
        try:
            # Check if hard delete is requested
            soft_delete = request.args.get('soft', 'true').lower() == 'true'
            
            success, error = course_db.delete_course(course_id, soft_delete=soft_delete)
            
            if error:
                return jsonify({'error': error}), 400
            
            action = 'archived' if soft_delete else 'deleted'
            
            return jsonify({
                'success': True,
                'message': f'Course {action} successfully'
            }), 200
            
        except Exception as e:
            logger.error(f"Error deleting course {course_id}: {e}")
            return jsonify({'error': 'Failed to delete course'}), 500

    @app.route('/api/courses/<course_id>/enroll', methods=['POST'])
    @authenticate_token
    def enroll_in_course(course_id):
        """Enroll current user in course"""
        try:
            user_id = request.user['id']
            user_role = request.user.get('role', 'student')
            
            # Only students can enroll themselves
            if user_role != 'student':
                return jsonify({'error': 'Only students can enroll in courses'}), 403
            
            success, error = course_db.enroll_student(course_id, user_id)
            
            if error:
                return jsonify({'error': error}), 400
            
            return jsonify({
                'success': True,
                'message': 'Enrolled in course successfully'
            }), 200
            
        except Exception as e:
            logger.error(f"Error enrolling in course {course_id}: {e}")
            return jsonify({'error': 'Failed to enroll in course'}), 500

    @app.route('/api/courses/<course_id>/unenroll', methods=['POST'])
    @authenticate_token
    def unenroll_from_course(course_id):
        """Unenroll current user from course"""
        try:
            user_id = request.user['id']
            user_role = request.user.get('role', 'student')
            
            # Only students can unenroll themselves
            if user_role != 'student':
                return jsonify({'error': 'Only students can unenroll from courses'}), 403
            
            success, error = course_db.unenroll_student(course_id, user_id)
            
            if error:
                return jsonify({'error': error}), 400
            
            return jsonify({
                'success': True,
                'message': 'Unenrolled from course successfully'
            }), 200
            
        except Exception as e:
            logger.error(f"Error unenrolling from course {course_id}: {e}")
            return jsonify({'error': 'Failed to unenroll from course'}), 500

    @app.route('/api/courses/<course_id>/enroll/<student_id>', methods=['POST'])
    @authenticate_token
    @require_role(['admin', 'staff'])
    def enroll_student_in_course(course_id, student_id):
        """Enroll specific student in course (admin/staff only)"""
        try:
            success, error = course_db.enroll_student(course_id, student_id)
            
            if error:
                return jsonify({'error': error}), 400
            
            return jsonify({
                'success': True,
                'message': 'Student enrolled successfully'
            }), 200
            
        except Exception as e:
            logger.error(f"Error enrolling student {student_id} in course {course_id}: {e}")
            return jsonify({'error': 'Failed to enroll student'}), 500

    @app.route('/api/courses/<course_id>/unenroll/<student_id>', methods=['POST'])
    @authenticate_token
    @require_role(['admin', 'staff'])
    def unenroll_student_from_course(course_id, student_id):
        """Unenroll specific student from course (admin/staff only)"""
        try:
            success, error = course_db.unenroll_student(course_id, student_id)
            
            if error:
                return jsonify({'error': error}), 400
            
            return jsonify({
                'success': True,
                'message': 'Student unenrolled successfully'
            }), 200
            
        except Exception as e:
            logger.error(f"Error unenrolling student {student_id} from course {course_id}: {e}")
            return jsonify({'error': 'Failed to unenroll student'}), 500

    @app.route('/api/courses/<course_id>/enrollments', methods=['GET'])
    @authenticate_token
    @require_role(['admin', 'staff'])
    def get_course_enrollments_endpoint(course_id):
        """Get all enrollments for a course"""
        try:
            enrollments = course_db.get_course_enrollments(course_id)
            enrollment_count = course_db.get_enrollment_count(course_id)
            
            return jsonify({
                'success': True,
                'enrollments': enrollments,
                'total_count': enrollment_count
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting enrollments for course {course_id}: {e}")
            return jsonify({'error': 'Failed to fetch enrollments'}), 500

    @app.route('/api/students/<student_id>/enrollments', methods=['GET'])
    @authenticate_token
    def get_student_enrollments_endpoint(student_id):
        """Get all courses a student is enrolled in"""
        try:
            # Students can only view their own enrollments
            if request.user['role'] == 'student' and request.user['id'] != student_id:
                return jsonify({'error': 'Access denied'}), 403
            
            enrollments = course_db.get_student_enrollments(student_id)
            
            return jsonify({
                'success': True,
                'enrollments': enrollments
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting enrollments for student {student_id}: {e}")
            return jsonify({'error': 'Failed to fetch enrollments'}), 500

    @app.route('/api/courses/<course_id>/check-enrollment/<student_id>', methods=['GET'])
    @authenticate_token
    def check_enrollment_status(course_id, student_id):
        """Check if student is enrolled in course"""
        try:
            # Students can only check their own enrollment
            if request.user['role'] == 'student' and request.user['id'] != student_id:
                return jsonify({'error': 'Access denied'}), 403
            
            is_enrolled = course_db.is_student_enrolled(course_id, student_id)
            
            return jsonify({
                'success': True,
                'is_enrolled': is_enrolled
            }), 200
            
        except Exception as e:
            logger.error(f"Error checking enrollment status: {e}")
            return jsonify({'error': 'Failed to check enrollment status'}), 500

    @app.route('/api/my-courses', methods=['GET'])
    @authenticate_token
    def get_my_courses():
        """Get courses for current user (enrolled if student, teaching if staff)"""
        try:
            user_id = request.user['id']
            user_role = request.user.get('role', 'student')
            
            if user_role == 'student':
                # Get enrolled courses
                enrollments = course_db.get_student_enrollments(user_id)
                courses = [enrollment.get('courses', {}) for enrollment in enrollments if enrollment.get('courses')]
            else:
                # Get courses taught by instructor
                courses, _ = course_db.get_all_courses(instructor_filter=user_id)
            
            return jsonify({
                'success': True,
                'courses': courses
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting user courses: {e}")
            return jsonify({'error': 'Failed to fetch courses'}), 500

    @app.route('/api/courses/stats', methods=['GET'])
    @authenticate_token
    @require_role(['admin', 'staff'])
    def get_course_stats():
        """Get course statistics"""
        try:
            # Get all courses
            all_courses, total_count = course_db.get_all_courses(limit=1000)
            
            # Calculate stats
            active_courses = len([c for c in all_courses if c.get('is_active')])
            inactive_courses = total_count - active_courses
            
            total_enrollments = sum(course_db.get_enrollment_count(c['id']) for c in all_courses)
            avg_enrollment = total_enrollments / total_count if total_count > 0 else 0
            
            return jsonify({
                'success': True,
                'stats': {
                    'total_courses': total_count,
                    'active_courses': active_courses,
                    'inactive_courses': inactive_courses,
                    'total_enrollments': total_enrollments,
                    'avg_enrollment_per_course': round(avg_enrollment, 1)
                }
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting course stats: {e}")
            return jsonify({'error': 'Failed to fetch course statistics'}), 500
