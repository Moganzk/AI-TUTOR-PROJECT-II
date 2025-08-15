from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash
from services.database import db_service
from services.auth_service import auth_service
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Email and password are required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Get user from database
        user = db_service.get_user_by_email(email)
        
        if not user:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Check password
        if not check_password_hash(user['password_hash'], password):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Check if user is active
        if not user.get('is_active', True):
            return jsonify({'message': 'Account is deactivated'}), 401
        
        # Create access token
        access_token = create_access_token(identity=user['user_id'])
        
        # Update last login
        db_service.update_user_last_login(user['user_id'])
        
        # Remove sensitive data
        user_data = {
            'user_id': user['user_id'],
            'email': user['email'],
            'first_name': user['first_name'],
            'last_name': user['last_name'],
            'role': user['role'],
            'profile_image': user.get('profile_image'),
            'is_active': user['is_active']
        }
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': user_data
        }), 200
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'message': 'Login failed'}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        required_fields = ['email', 'password', 'first_name', 'last_name', 'role']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        email = data['email'].lower().strip()
        
        # Check if user already exists
        existing_user = db_service.get_user_by_email(email)
        if existing_user:
            return jsonify({'message': 'User already exists'}), 409
        
        # Validate role
        valid_roles = ['student', 'staff', 'admin']
        if data['role'] not in valid_roles:
            return jsonify({'message': 'Invalid role'}), 400
        
        # Hash password
        password_hash = generate_password_hash(data['password'])
        
        # Prepare user data
        user_data = {
            'email': email,
            'password_hash': password_hash,
            'first_name': data['first_name'],
            'last_name': data['last_name'],
            'role': data['role'],
            'is_active': True
        }
        
        # Create user
        user_id = db_service.create_user(user_data)
        
        if user_id:
            # Get created user
            user = db_service.get_user_by_id(user_id)
            
            # Create access token
            access_token = create_access_token(identity=user_id)
            
            # Remove sensitive data
            user_response = {
                'user_id': user['user_id'],
                'email': user['email'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'role': user['role'],
                'is_active': user['is_active']
            }
            
            return jsonify({
                'message': 'Registration successful',
                'access_token': access_token,
                'user': user_response
            }), 201
        else:
            return jsonify({'message': 'Registration failed'}), 500
            
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({'message': 'Registration failed'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user profile"""
    try:
        user_id = get_jwt_identity()
        user = db_service.get_user_by_id(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        user_data = {
            'user_id': user['user_id'],
            'email': user['email'],
            'first_name': user['first_name'],
            'last_name': user['last_name'],
            'role': user['role'],
            'profile_image': user.get('profile_image'),
            'is_active': user['is_active'],
            'created_at': user.get('created_at'),
            'last_login': user.get('last_login')
        }
        
        return jsonify({'user': user_data}), 200
        
    except Exception as e:
        logger.error(f"Get current user error: {str(e)}")
        return jsonify({'message': 'Failed to get user profile'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required()
def refresh_token():
    """Refresh access token"""
    try:
        user_id = get_jwt_identity()
        user = db_service.get_user_by_id(user_id)
        
        if not user or not user.get('is_active', True):
            return jsonify({'message': 'Invalid user'}), 401
        
        new_token = create_access_token(identity=user_id)
        
        return jsonify({
            'message': 'Token refreshed',
            'access_token': new_token
        }), 200
        
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        return jsonify({'message': 'Token refresh failed'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """User logout endpoint"""
    try:
        # In a more complete implementation, you would add the token to a blacklist
        return jsonify({'message': 'Logout successful'}), 200
        
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return jsonify({'message': 'Logout failed'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not data.get('current_password') or not data.get('new_password'):
            return jsonify({'message': 'Current password and new password are required'}), 400
        
        user = db_service.get_user_by_id(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Verify current password
        if not check_password_hash(user['password_hash'], data['current_password']):
            return jsonify({'message': 'Invalid current password'}), 400
        
        # Hash new password
        new_password_hash = generate_password_hash(data['new_password'])
        
        # Update password
        success = db_service.update_user_password(user_id, new_password_hash)
        
        if success:
            return jsonify({'message': 'Password changed successfully'}), 200
        else:
            return jsonify({'message': 'Failed to change password'}), 500
            
    except Exception as e:
        logger.error(f"Change password error: {str(e)}")
        return jsonify({'message': 'Failed to change password'}), 500
