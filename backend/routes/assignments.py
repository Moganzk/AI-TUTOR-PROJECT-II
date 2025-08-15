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
