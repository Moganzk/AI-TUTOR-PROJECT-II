from flask import Blueprint

admin_bp = Blueprint('admin_bp', __name__)
from flask import Blueprint

ai_tutor_bp = Blueprint('ai_tutor_bp', __name__)
from flask import Blueprint

analytics_bp = Blueprint('analytics_bp', __name__)
from flask import Blueprint, request, jsonify
from services.database import db_service
from middleware.simple_auth import token_required, role_required

assignments_bp = Blueprint('assignments_bp', __name__)

@assignments_bp.route('/', methods=['GET'])
@token_required
@role_required('admin')
def get_assignments(current_user):
    assignments = db_service.get_all_assignments()
    return jsonify(assignments)

@assignments_bp.route('/<assignment_id>', methods=['GET'])
@token_required
def get_assignment(current_user, assignment_id):
    assignment = db_service.get_assignment_by_id(assignment_id)
    if assignment:
        return jsonify(assignment)
    else:
        return jsonify({'message': 'Assignment not found'}), 404

@assignments_bp.route('/', methods=['POST'])
@token_required
@role_required('admin', 'staff')
def create_assignment(current_user):
    data = request.get_json()
    if not data or not data.get('title') or not data.get('course_id'):
        return jsonify({'message': 'title and course_id are required'}), 400

    data['created_by'] = current_user['user_id']
    assignment_id = db_service.create_assignment(data)

    if assignment_id:
        assignment = db_service.get_assignment_by_id(assignment_id)
        return jsonify(assignment), 201
    else:
        return jsonify({'message': 'Could not create assignment'}), 500

@assignments_bp.route('/<assignment_id>', methods=['PUT'])
@token_required
@role_required('admin', 'staff')
def update_assignment(current_user, assignment_id):
    data = request.get_json()
    assignment = db_service.get_assignment_by_id(assignment_id)

    if not assignment:
        return jsonify({'message': 'Assignment not found'}), 404

    if current_user['role'] != 'admin' and current_user['user_id'] != assignment['creator']['id']:
        return jsonify({'message': 'Permission denied'}), 403

    updated_assignment = db_service.update_assignment(assignment_id, data)

    if updated_assignment:
        return jsonify(updated_assignment)
    else:
        return jsonify({'message': 'Could not update assignment'}), 500

@assignments_bp.route('/<assignment_id>', methods=['DELETE'])
@token_required
@role_required('admin', 'staff')
def delete_assignment(current_user, assignment_id):
    assignment = db_service.get_assignment_by_id(assignment_id)

    if not assignment:
        return jsonify({'message': 'Assignment not found'}), 404

    if current_user['role'] != 'admin' and current_user['user_id'] != assignment['creator']['id']:
        return jsonify({'message': 'Permission denied'}), 403

    success = db_service.delete_assignment(assignment_id)
    if success:
        return jsonify({'message': 'Assignment deleted'})
    else:
        return jsonify({'message': 'Could not delete assignment'}), 500
from flask import request, jsonify
from database import db
from middleware import authenticate_token, require_role
import logging

logger = logging.getLogger(__name__)

def register_assignment_questions_routes(app):
    @app.route('/api/assignments/<assignment_id>/questions', methods=['GET'])
    @authenticate_token
    def get_assignment_questions(assignment_id):
        """Get all questions for an assignment"""
        try:
            current_user = request.user
            
            # Verify assignment exists
            assignment = db.get_assignment_by_id(assignment_id)
            if not assignment:
                return jsonify({'error': 'Assignment not found'}), 404
            
            # Check permissions - students can only see questions if assignment is published
            if current_user['role'] == 'student':
                if not assignment.get('is_published'):
                    return jsonify({'error': 'Assignment not available'}), 403
                
                # Check enrollment
                enrollment = db.get_student_enrollment(current_user['id'], assignment['course_id'])
                if not enrollment:
                    return jsonify({'error': 'Not enrolled in this course'}), 403
            elif current_user['role'] not in ['admin', 'staff']:
                return jsonify({'error': 'Insufficient permissions'}), 403
            
            # Get questions
            questions = db.get_assignment_questions(assignment_id)
            
            return jsonify({
                'success': True,
                'questions': questions
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting assignment questions: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/assignments/<assignment_id>/questions', methods=['POST'])
    @authenticate_token
    @require_role(['admin', 'staff'])
    def add_assignment_question(assignment_id):
        """Add a question to an assignment"""
        try:
            current_user = request.user
            data = request.get_json()
            
            # Verify assignment exists
            assignment = db.get_assignment_by_id(assignment_id)
            if not assignment:
                return jsonify({'error': 'Assignment not found'}), 404
            
            # Validate required fields
            question_text = data.get('question_text', '').strip()
            if not question_text:
                return jsonify({'error': 'Question text is required'}), 400
            
            question_type = data.get('question_type', 'text')
            if question_type not in ['text', 'essay', 'multiple_choice', 'true_false']:
                return jsonify({'error': 'Invalid question type'}), 400
            
            # Validate options for multiple choice
            options = data.get('options')
            correct_answer = data.get('correct_answer')
            if question_type == 'multiple_choice':
                if not options or len(options) < 2:
                    return jsonify({'error': 'Multiple choice questions need at least 2 options'}), 400
                if not correct_answer or correct_answer not in options:
                    return jsonify({'error': 'Correct answer must be one of the options'}), 400
            elif question_type == 'true_false':
                if correct_answer not in ['true', 'false']:
                    return jsonify({'error': 'Correct answer for true/false must be "true" or "false"'}), 400
            else:
                # For text/essay questions, clear options and correct_answer
                options = None
                correct_answer = None
            
            points = data.get('points', 1)
            try:
                points = int(points)
                if points <= 0:
                    return jsonify({'error': 'Points must be a positive integer'}), 400
            except (ValueError, TypeError):
                points = 1
            
            order_index = data.get('order_index', 1)
            try:
                order_index = int(order_index)
            except (ValueError, TypeError):
                order_index = 1
            
            # Create question
            question = db.create_assignment_question(
                assignment_id=assignment_id,
                question_text=question_text,
                question_type=question_type,
                options=options,
                correct_answer=correct_answer,
                points=points,
                order_index=order_index
            )
            
            if question:
                return jsonify({
                    'success': True,
                    'question': question,
                    'message': 'Question added successfully'
                }), 201
            else:
                return jsonify({'error': 'Failed to add question'}), 500
                
        except Exception as e:
            logger.error(f"Error adding assignment question: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/assignments/questions/<question_id>', methods=['PUT'])
    @authenticate_token
    @require_role(['admin', 'staff'])
    def update_assignment_question(question_id):
        """Update an assignment question"""
        try:
            current_user = request.user
            data = request.get_json()
            
            # Verify question exists
            existing_question = db.get_assignment_question_by_id(question_id)
            if not existing_question:
                return jsonify({'error': 'Question not found'}), 404
            
            # Validate question type if provided
            question_type = data.get('question_type')
            if question_type and question_type not in ['text', 'essay', 'multiple_choice', 'true_false']:
                return jsonify({'error': 'Invalid question type'}), 400
            
            # Validate options for multiple choice if type is being updated or is multiple_choice
            options = data.get('options')
            correct_answer = data.get('correct_answer')
            if question_type == 'multiple_choice' or (question_type is None and options):
                if options:
                    if len(options) < 2:
                        return jsonify({'error': 'Multiple choice questions need at least 2 options'}), 400
                    if correct_answer and correct_answer not in options:
                        return jsonify({'error': 'Correct answer must be one of the options'}), 400
            
            # Validate points if provided
            points = data.get('points')
            if points is not None:
                try:
                    points = int(points)
                    if points <= 0:
                        return jsonify({'error': 'Points must be a positive integer'}), 400
                except (ValueError, TypeError):
                    return jsonify({'error': 'Points must be a positive integer'}), 400
            
            # Update question
            question = db.update_assignment_question(question_id, **data)
            
            if question:
                return jsonify({
                    'success': True,
                    'question': question,
                    'message': 'Question updated successfully'
                }), 200
            else:
                return jsonify({'error': 'Question not found'}), 404
                
        except Exception as e:
            logger.error(f"Error updating assignment question: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/assignments/questions/<question_id>', methods=['DELETE'])
    @authenticate_token
    @require_role(['admin', 'staff'])
    def delete_assignment_question(question_id):
        """Delete an assignment question"""
        try:
            current_user = request.user
            
            # Delete question
            success = db.delete_assignment_question(question_id)
            
            if success:
                return jsonify({
                    'success': True,
                    'message': 'Question deleted successfully'
                }), 200
            else:
                return jsonify({'error': 'Question not found'}), 404
                
        except Exception as e:
            logger.error(f"Error deleting assignment question: {e}")
            return jsonify({'error': 'Internal server error'}), 500
from flask import Blueprint, request, jsonify
from services.auth_service import auth_service

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'email and password are required'}), 400
    
    user = auth_service.register_user(data)
    
    if user:
        return jsonify(user), 201
    else:
        return jsonify({'message': 'User already exists'}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'email and password are required'}), 400
    
    user = auth_service.authenticate_user(data['email'], data['password'])
    
    if user:
        token = auth_service.generate_token(user)
        return jsonify({'token': token})
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    data = request.get_json()
    if not data or not data.get('token'):
        return jsonify({'message': 'token is required'}), 400
    
    new_token = auth_service.refresh_token(data['token'])
    
    if new_token:
        return jsonify({'token': new_token})
    else:
        return jsonify({'message': 'Invalid token'}), 401
from flask import Blueprint, request, jsonify
from services.database import db_service
from middleware.simple_auth import token_required, role_required

courses_bp = Blueprint('courses_bp', __name__)

@courses_bp.route('/', methods=['GET'])
def get_courses():
    courses = db_service.get_courses()
    return jsonify(courses)

@courses_bp.route('/<course_id>', methods=['GET'])
def get_course(course_id):
    course = db_service.get_course_by_id(course_id)
    if course:
        return jsonify(course)
    else:
        return jsonify({'message': 'Course not found'}), 404

@courses_bp.route('/', methods=['POST'])
@token_required
@role_required('admin', 'staff')
def create_course(current_user):
    data = request.get_json()
    if not data or not data.get('title') or not data.get('subject_id'):
        return jsonify({'message': 'title and subject_id are required'}), 400

    data['instructor_id'] = current_user['user_id']
    course = db_service.create_course(**data)

    if course:
        return jsonify(course), 201
    else:
        return jsonify({'message': 'Could not create course'}), 500

@courses_bp.route('/<course_id>', methods=['PUT'])
@token_required
@role_required('admin', 'staff')
def update_course(current_user, course_id):
    data = request.get_json()
    course = db_service.get_course_by_id(course_id)

    if not course:
        return jsonify({'message': 'Course not found'}), 404

    if current_user['role'] != 'admin' and current_user['user_id'] != course['instructor']['id']:
        return jsonify({'message': 'Permission denied'}), 403

    updated_course = db_service.update_course(course_id, **data)

    if updated_course:
        return jsonify(updated_course)
    else:
        return jsonify({'message': 'Could not update course'}), 500

@courses_bp.route('/<course_id>', methods=['DELETE'])
@token_required
@role_required('admin')
def delete_course(current_user, course_id):
    success = db_service.delete_course(course_id)
    if success:
        return jsonify({'message': 'Course deleted'})
    else:
        return jsonify({'message': 'Course not found'}), 404

@courses_bp.route('/<course_id>/enroll', methods=['POST'])
@token_required
@role_required('student')
def enroll_in_course(current_user, course_id):
    student_id = current_user['user_id']
    enrollment = db_service.enroll_student_in_course(student_id, course_id)

    if enrollment:
        return jsonify(enrollment), 201
    else:
        return jsonify({'message': 'Could not enroll in course'}), 500

@courses_bp.route('/<course_id>/unenroll', methods=['POST'])
@token_required
@role_required('student')
def unenroll_from_course(current_user, course_id):
    student_id = current_user['user_id']
    success = db_service.unenroll_student_from_course(student_id, course_id)

    if success:
        return jsonify({'message': 'Unenrolled successfully'})
    else:
        return jsonify({'message': 'Could not unenroll from course'}), 500
from flask import Blueprint

notifications_bp = Blueprint('notifications_bp', __name__)
from flask import Blueprint

staff_bp = Blueprint('staff_bp', __name__)
from flask import Blueprint

student_bp = Blueprint('student_bp', __name__)
from flask import Blueprint

submissions_bp = Blueprint('submissions_bp', __name__)
from flask import Blueprint, request, jsonify
from services.database import db_service
from middleware.simple_auth import token_required, role_required

users_bp = Blueprint('users_bp', __name__)

@users_bp.route('/', methods=['GET'])
@token_required
@role_required('admin')
def get_users(current_user):
    users = db_service.get_users_paginated()['users']
    return jsonify(users)

@users_bp.route('/<user_id>', methods=['GET'])
@token_required
@role_required('admin', 'staff')
def get_user(current_user, user_id):
    user = db_service.get_user_by_id(user_id)
    if user:
        return jsonify(user)
    else:
        return jsonify({'message': 'User not found'}), 404

@users_bp.route('/<user_id>', methods=['PUT'])
@token_required
def update_user(current_user, user_id):
    if current_user['role'] != 'admin' and current_user['user_id'] != user_id:
        return jsonify({'message': 'Permission denied'}), 403

    data = request.get_json()
    updated_user = db_service.update_user(user_id, data)

    if updated_user:
        return jsonify(updated_user)
    else:
        return jsonify({'message': 'User not found'}), 404

@users_bp.route('/<user_id>', methods=['DELETE'])
@token_required
@role_required('admin')
def delete_user(current_user, user_id):
    success = db_service.delete_user(user_id)
    if success:
        return jsonify({'message': 'User deleted'})
    else:
        return jsonify({'message': 'User not found'}), 404
