"""
Staff Module
Handles staff-related endpoints using the DatabaseService
"""

from flask import request, jsonify
from services.database import db_service
from middleware import authenticate_token, require_role
import logging

logger = logging.getLogger(__name__)

def register_staff_routes(app):
    """Register all staff management routes"""
    
    @app.route('/api/staff/dashboard', methods=['GET'])
    @authenticate_token
    @require_role(['staff', 'admin'])
    def get_staff_dashboard():
        """Get staff dashboard data"""
        try:
            user = request.current_user
            staff_id = user['user_id']
            
            # Get dashboard data using database service
            dashboard_data = db_service.get_staff_dashboard_data(staff_id)
            
            return jsonify({
                'success': True,
                'data': dashboard_data
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting staff dashboard: {e}")
            return jsonify({'error': 'Failed to fetch dashboard data'}), 500
    
    @app.route('/api/staff/students', methods=['GET'])
    @authenticate_token
    @require_role(['staff', 'admin'])
    def get_staff_students():
        """Get students for current staff member"""
        try:
            user = request.current_user
            staff_id = user['user_id']
            
            # Get students using database service
            students = db_service.get_staff_accessible_users(staff_id)
            
            return jsonify({
                'success': True,
                'students': students
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting staff students: {e}")
            return jsonify({'error': 'Failed to fetch students'}), 500
    
    @app.route('/api/staff/students/<student_id>', methods=['GET'])
    @authenticate_token
    @require_role(['staff', 'admin'])
    def get_staff_student_detail(student_id):
        """Get details for a specific student"""
        try:
            user = request.current_user
            staff_id = user['user_id']
            
            # Check if staff can access this student
            if not db_service.can_staff_access_user(staff_id, student_id):
                return jsonify({'error': 'Access denied to this student'}), 403
            
            # Get student details using database service
            student = db_service.get_user_by_id(student_id)
            if not student:
                return jsonify({'error': 'Student not found'}), 404
            
            return jsonify({
                'success': True,
                'student': student
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting student details: {e}")
            return jsonify({'error': 'Failed to fetch student details'}), 500
    
    @app.route('/api/staff/courses', methods=['GET'])
    @authenticate_token
    @require_role(['staff', 'admin'])
    def get_staff_courses():
        """Get courses taught by current staff member"""
        try:
            user = request.current_user
            staff_id = user['user_id']
            
            # Get courses using database service
            courses = db_service.get_courses({'instructor_id': staff_id})
            
            return jsonify({
                'success': True,
                'courses': courses
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting staff courses: {e}")
            return jsonify({'error': 'Failed to fetch courses'}), 500
    
    @app.route('/api/staff/submissions', methods=['GET'])
    @authenticate_token
    @require_role(['staff', 'admin'])
    def get_staff_submissions():
        """Get submissions for courses taught by current staff member"""
        try:
            user = request.current_user
            staff_id = user['user_id']
            
            # Get submissions using database service
            submissions = db_service.get_staff_recent_submissions(staff_id)
            
            return jsonify({
                'success': True,
                'submissions': submissions
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting staff submissions: {e}")
            return jsonify({'error': 'Failed to fetch submissions'}), 500
    
    @app.route('/api/staff/analytics', methods=['GET'])
    @authenticate_token
    @require_role(['staff', 'admin'])
    def get_staff_analytics():
        """Get analytics data for current staff member"""
        try:
            user = request.current_user
            staff_id = user['user_id']
            
            # Get analytics data using database service
            analytics = db_service.get_staff_analytics(staff_id)
            
            return jsonify({
                'success': True,
                'analytics': analytics
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting staff analytics: {e}")
            return jsonify({'error': 'Failed to fetch analytics data'}), 500
    
    @app.route('/api/staff/feedback', methods=['POST'])
    @authenticate_token
    @require_role(['staff', 'admin'])
    def submit_staff_feedback():
        """Submit feedback from staff member"""
        try:
            user = request.current_user
            staff_id = user['user_id']
            data = request.get_json()
            
            # Submit feedback using database service
            feedback = db_service.submit_staff_feedback(staff_id, data)
            
            return jsonify({
                'success': True,
                'message': 'Feedback submitted successfully',
                'feedback': feedback
            }), 201
            
        except Exception as e:
            logger.error(f"Error submitting staff feedback: {e}")
            return jsonify({'error': 'Failed to submit feedback'}), 500