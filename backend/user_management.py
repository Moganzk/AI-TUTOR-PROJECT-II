"""
User Management Module
Handles user authentication, registration, and management endpoints
Uses database_modules/users.py for all database operations
"""

from flask import request, jsonify
from config import Config
from database import db
from Database_modules.users import user_db
from middleware import authenticate_token, require_role
import logging
import jwt
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)

def register_user_routes(app):
    """Register all user management routes"""
    
    @app.route('/api/auth/register', methods=['POST'])
    def register():
        """Register a new user"""
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No JSON data provided'}), 400
            
            full_name = data.get('full_name', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', '').strip()
            role = data.get('role', 'student')
            
            # Validation
            if not full_name or not email or not password:
                return jsonify({'error': 'Full name, email, and password are required'}), 400
            if '@' not in email:
                return jsonify({'error': 'Invalid email format'}), 400
            if len(password) < 6:
                return jsonify({'error': 'Password must be at least 6 characters'}), 400
            if role not in ['admin', 'student', 'staff']:
                role = 'student'  # Default to student
            
            # Create user using database module
            user_data = {
                'name': full_name,
                'email': email,
                'password': password,  # In production, this should be hashed
                'role': role,
                'status': 'active'
            }
            
            user, error = user_db.create_user(user_data)
            
            if error:
                return jsonify({'error': error}), 409 if 'already exists' in error else 500
            
            if user:
                return jsonify({
                    'success': True,
                    'message': 'User registered successfully',
                    'user': user
                }), 201
            
            return jsonify({'error': 'Failed to create user'}), 500
            
        except Exception as e:
            logger.error(f"Error in registration: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/auth/login', methods=['POST'])
    def login():
        """Authenticate user and return JWT token"""
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No JSON data provided'}), 400
            
            email = data.get('email', '').strip()
            password = data.get('password', '').strip()
            
            if not email or not password:
                return jsonify({'error': 'Email and password are required'}), 400
            
            # Verify user credentials using database module
            user, error = user_db.verify_user_credentials(email, password)
            
            if error:
                return jsonify({'error': error}), 401
            
            if not user:
                return jsonify({'error': 'Invalid email or password'}), 401
            
            # Generate JWT token
            payload = {
                'user_id': user['id'],
                'email': user['email'],
                'role': user['role'],
                'name': user.get('name', ''),
                'exp': datetime.now(timezone.utc) + timedelta(hours=24),
                'iat': datetime.now(timezone.utc)
            }
            
            token = jwt.encode(payload, Config.JWT_SECRET, algorithm='HS256')
            
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'access_token': token,
                'user': user
            }), 200
            
        except Exception as e:
            logger.error(f"Error in login: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/auth/validate', methods=['POST'])
    @authenticate_token
    def validate_token():
        """Validate JWT token and return user info"""
        try:
            # If we reach here, token is valid (middleware already verified it)
            user = request.user
            return jsonify({
                'success': True,
                'valid': True,
                'user': user,
                'message': 'Token is valid'
            }), 200
            
        except Exception as e:
            logger.error(f"Error in token validation: {e}")
            return jsonify({
                'success': False,
                'valid': False,
                'error': 'Token validation failed'
            }), 401

    @app.route('/api/admin/users', methods=['GET'])
    @authenticate_token
    @require_role(['admin'])
    def get_admin_users():
        """Get paginated list of users for admin management"""
        try:
            # Get query parameters
            page = request.args.get('page', 1, type=int)
            limit = min(request.args.get('limit', 50, type=int), 100)  # Max 100 per page
            search = request.args.get('search', '').strip()
            role_filter = request.args.get('role', 'all')
            status_filter = request.args.get('status', 'all')
            
            # Calculate offset
            offset = (page - 1) * limit
            
            # Get users from database module
            users, total_count = user_db.get_all_users(
                limit=limit,
                offset=offset,
                search=search if search else None,
                role_filter=role_filter,
                status_filter=status_filter
            )
            
            return jsonify({
                'success': True,
                'users': users,
                'total': total_count,
                'page': page,
                'limit': limit,
                'has_more': (offset + len(users)) < total_count
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting admin users: {e}")
            # Return fallback data even on error
            return jsonify({
                'success': True,
                'users': [],
                'total': 0,
                'page': 1,
                'limit': limit,
                'has_more': False,
                'error': 'Failed to load users'
            }), 200

    @app.route('/api/admin/users', methods=['POST'])
    @authenticate_token
    @require_role(['admin'])
    def create_admin_user():
        """Create a new user (admin only)"""
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No JSON data provided'}), 400
            
            # Prepare user data (accept both 'name' and 'full_name')
            user_data = {
                'name': data.get('full_name', '').strip() or data.get('name', '').strip(),
                'email': data.get('email', '').strip(),
                'role': data.get('role', 'student'),
                'phone': data.get('phone', ''),
                'address': data.get('address', ''),
                'status': data.get('status', 'active')
            }
            
            # Create user using database module
            created_user, error = user_db.create_user(user_data)
            
            if error:
                return jsonify({
                    'success': False,
                    'error': error
                }), 400
            
            if created_user:
                response_data = {
                    'success': True,
                    'message': 'User created successfully',
                    'user': created_user
                }
                
                return jsonify(response_data), 201
            
            return jsonify({
                'success': False,
                'error': 'Failed to create user'
            }), 500
            
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/admin/users/<user_id>', methods=['PUT'])
    @authenticate_token
    @require_role(['admin'])
    def update_admin_user(user_id):
        """Update user information (admin only) - minimal working version"""
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No JSON data provided'}), 400
            
            # Update user using database module
            updated_user, error = user_db.update_user(user_id, data)
            
            if error:
                return jsonify({
                    'success': False,
                    'error': error
                }), 400
            
            if updated_user:
                return jsonify({
                    'success': True,
                    'message': 'User updated successfully',
                    'user': updated_user
                }), 200
            
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
            
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/admin/users/<user_id>', methods=['DELETE'])
    @authenticate_token
    @require_role(['admin'])
    def delete_admin_user(user_id):
        """Delete user (admin only) - minimal working version"""
        try:
            # Use soft delete by default
            soft_delete = request.args.get('soft', 'true').lower() == 'true'
            
            success, error = user_db.delete_user(user_id, soft_delete=soft_delete)
            
            if error:
                return jsonify({
                    'success': False,
                    'error': error
                }), 400
            
            if success:
                return jsonify({
                    'success': True,
                    'message': 'User deleted successfully'
                }), 200
            
            return jsonify({
                'success': False,
                'error': 'Failed to delete user'
            }), 500
            
        except Exception as e:
            logger.error(f"Error deleting user: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/admin/users/<user_id>/suspend', methods=['PUT'])
    @authenticate_token
    @require_role(['admin'])
    def suspend_admin_user(user_id):
        """Suspend/unsuspend user (admin only)"""
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No JSON data provided'}), 400
            
            is_suspended = data.get('suspended', False)
            
            # Toggle user suspension using database module
            updated_user, error = user_db.toggle_user_status(user_id, is_suspended)
            
            if error:
                return jsonify({
                    'success': False,
                    'error': error
                }), 400
            
            if updated_user:
                action = 'suspended' if is_suspended else 'activated'
                return jsonify({
                    'success': True,
                    'message': f'User {action} successfully',
                    'user': updated_user
                }), 200
            
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
            
        except Exception as e:
            logger.error(f"Error suspending user: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    # Temporary test endpoint for debugging
    @app.route('/api/test/create-user', methods=['POST'])
    def test_create_user():
        """Temporary test endpoint to create users without auth"""
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No JSON data provided'}), 400
            
            # Create test user
            user_data = {
                'name': data.get('name', 'Test User'),
                'email': data.get('email', 'test@example.com'),
                'password': data.get('password', 'test123'),
                'role': data.get('role', 'student'),
                'status': 'active'
            }
            
            created_user, error = user_db.create_user(user_data)
            
            if error:
                return jsonify({
                    'success': False,
                    'error': error
                }), 400
            
            return jsonify({
                'success': True,
                'message': 'Test user created successfully',
                'user': created_user
            }), 201
            
        except Exception as e:
            logger.error(f"Error creating test user: {e}")
            return jsonify({'error': f'Internal server error: {str(e)}'}), 500
