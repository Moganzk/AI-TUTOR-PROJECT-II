"""
Student Module
Handles student-related endpoints using the DatabaseService
"""

from flask import request, jsonify
from services.database import db_service
from middleware import authenticate_token, require_role
import logging

logger = logging.getLogger(__name__)

def register_student_routes(app):
    """Register all student management routes"""
    
    @app.route('/api/student/dashboard', methods=['GET'])
    @authenticate_token
    @require_role(['student'])
    def get_student_dashboard():
        """Get student dashboard data"""
        try:
            user = request.user
            student_id = user['id']
            
            # Get dashboard data using database service
            dashboard_data = db_service.get_student_dashboard_data(student_id)
            
            return jsonify({
                'success': True,
                'data': dashboard_data
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting student dashboard: {e}")
            return jsonify({'error': 'Failed to fetch dashboard data'}), 500
    
    @app.route('/api/student/courses', methods=['GET'])
    @authenticate_token
    @require_role(['student'])
    def get_student_courses():
        """Get courses for current student"""
        try:
            user = request.user
            student_id = user['id']
            
            # Get enrolled courses using database service
            enrolled_courses = db_service.get_student_enrolled_courses(student_id)
            
            return jsonify({
                'success': True,
                'courses': enrolled_courses
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting student courses: {e}")
            return jsonify({'error': 'Failed to fetch courses'}), 500
    
    @app.route('/api/student/progress', methods=['GET'])
    @authenticate_token
    @require_role(['student'])
    def get_student_progress():
        """Get student progress data"""
        try:
            user = request.user
            student_id = user['id']
            
            # Get progress data using database service
            progress_data = db_service.get_student_overall_progress(student_id)
            
            return jsonify({
                'success': True,
                'progress': progress_data
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting student progress: {e}")
            return jsonify({'error': 'Failed to fetch progress data'}), 500
    
    @app.route('/api/student/assignments', methods=['GET'])
    @authenticate_token
    @require_role(['student'])
    def get_student_assignments():
        """Get assignments for current student"""
        try:
            user = request.user
            student_id = user['id']
            
            # Get assignments using database service
            assignments = db_service.get_student_assignments(student_id)
            
            return jsonify({
                'success': True,
                'assignments': assignments
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting student assignments: {e}")
            return jsonify({'error': 'Failed to fetch assignments'}), 500
    
    @app.route('/api/student/grades', methods=['GET'])
    @authenticate_token
    @require_role(['student'])
    def get_student_grades():
        """Get grades for current student"""
        try:
            user = request.user
            student_id = user['id']
            
            # Get recent grades using database service
            recent_grades = db_service.get_student_recent_grades(student_id)
            
            return jsonify({
                'success': True,
                'grades': recent_grades
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting student grades: {e}")
            return jsonify({'error': 'Failed to fetch grades'}), 500
    
    @app.route('/api/student/context', methods=['GET'])
    @authenticate_token
    @require_role(['student'])
    def get_student_context():
        """Get student context data"""
        try:
            user = request.user
            student_id = user['id']
            
            # Get context data using database service
            context_data = {
                'upcoming_deadlines': db_service.get_student_upcoming_deadlines(student_id),
                'pending_assignments': db_service.get_student_pending_assignments(student_id),
                'recent_submissions': db_service.get_student_recent_submissions(student_id)
            }
            
            return jsonify({
                'success': True,
                'context': context_data
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting student context: {e}")
            return jsonify({'error': 'Failed to fetch context data'}), 500