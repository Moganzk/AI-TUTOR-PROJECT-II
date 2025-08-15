import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from functools import wraps
from flask import request, jsonify, current_app
import logging
from services.database import db_service

logger = logging.getLogger(__name__)

class AuthService:
    """Authentication and authorization service"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        try:
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
            return hashed.decode('utf-8')
        except Exception as e:
            logger.error(f"Error hashing password: {str(e)}")
            raise
    
    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        try:
            return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
        except Exception as e:
            logger.error(f"Error verifying password: {str(e)}")
            return False
    
    @staticmethod
    def generate_token(user_data: Dict[str, Any]) -> str:
        """Generate JWT token for user"""
        try:
            from config import get_config
            config = get_config()
            
            payload = {
                'user_id': user_data['id'],
                'email': user_data['email'],
                'role': user_data['role'],
                'name': user_data['name'],
                'exp': datetime.utcnow() + config.JWT_ACCESS_TOKEN_EXPIRES,
                'iat': datetime.utcnow()
            }
            
            token = jwt.encode(payload, config.JWT_SECRET_KEY, algorithm=config.JWT_ALGORITHM)
            return token
        except Exception as e:
            logger.error(f"Error generating token: {str(e)}")
            raise
    
    @staticmethod
    def decode_token(token: str) -> Optional[Dict[str, Any]]:
        """Decode and validate JWT token"""
        try:
            from config import get_config
            config = get_config()
            
            payload = jwt.decode(token, config.JWT_SECRET_KEY, algorithms=[config.JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("Token has expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error decoding token: {str(e)}")
            return None
    
    @staticmethod
    def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate user with email and password"""
        try:
            # Get user from database
            user = db_service.get_user_by_email(email)
            if not user:
                logger.warning(f"Login attempt with non-existent email: {email}")
                return None
            
            # Check if user is suspended or inactive
            if user.get('is_suspended', False) or user.get('status') != 'active':
                logger.warning(f"Login attempt by suspended/inactive user: {email}")
                return None
            
            # Verify password
            stored_password = user.get('password')
            if not stored_password:
                logger.error(f"User {email} has no password set")
                return None
            
            # For development, allow plain text passwords (will be hashed in production)
            if password == stored_password or AuthService.verify_password(password, stored_password):
                # Remove sensitive data before returning
                user_data = {k: v for k, v in user.items() if k != 'password'}
                return user_data
            else:
                logger.warning(f"Invalid password for user: {email}")
                return None
                
        except Exception as e:
            logger.error(f"Error authenticating user: {str(e)}")
            return None
    
    @staticmethod
    def register_user(user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Register a new user"""
        try:
            # Check if user already exists
            existing_user = db_service.get_user_by_email(user_data['email'])
            if existing_user:
                logger.warning(f"Registration attempt with existing email: {user_data['email']}")
                return None
            
            # Hash password
            if 'password' in user_data:
                user_data['password'] = AuthService.hash_password(user_data['password'])
            
            # Set default values
            user_data.setdefault('role', 'student')
            user_data.setdefault('status', 'active')
            user_data.setdefault('is_suspended', False)
            
            # Create user
            new_user = db_service.create_user(user_data)
            if new_user:
                # Remove sensitive data before returning
                user_response = {k: v for k, v in new_user.items() if k != 'password'}
                return user_response
            
            return None
        except Exception as e:
            logger.error(f"Error registering user: {str(e)}")
            return None
    
    @staticmethod
    def refresh_token(token: str) -> Optional[str]:
        """Refresh an existing token"""
        try:
            payload = AuthService.decode_token(token)
            if not payload:
                return None
            
            # Get fresh user data
            user = db_service.get_user_by_id(payload['user_id'])
            if not user or user.get('is_suspended', False) or user.get('status') != 'active':
                return None
            
            # Generate new token
            return AuthService.generate_token(user)
        except Exception as e:
            logger.error(f"Error refreshing token: {str(e)}")
            return None

# Authentication decorators
def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                token = auth_header.split(' ')[1]  # Remove 'Bearer ' prefix
            except IndexError:
                return jsonify({'success': False, 'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'success': False, 'error': 'Token is missing'}), 401
        
        try:
            payload = AuthService.decode_token(token)
            if not payload:
                return jsonify({'success': False, 'error': 'Token is invalid or expired'}), 401
            
            # Verify user still exists and is active
            user = db_service.get_user_by_id(payload['user_id'])
            if not user or user.get('is_suspended', False) or user.get('status') != 'active':
                return jsonify({'success': False, 'error': 'User account is inactive'}), 401
            
            # Add current user to request context
            request.current_user = payload
            
        except Exception as e:
            logger.error(f"Token validation error: {str(e)}")
            return jsonify({'success': False, 'error': 'Token validation failed'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(request, 'current_user'):
            return jsonify({'success': False, 'error': 'Authentication required'}), 401
        
        if request.current_user.get('role') != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    
    return decorated

def staff_required(f):
    """Decorator to require staff or admin role"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(request, 'current_user'):
            return jsonify({'success': False, 'error': 'Authentication required'}), 401
        
        user_role = request.current_user.get('role')
        if user_role not in ['admin', 'staff']:
            return jsonify({'success': False, 'error': 'Staff access required'}), 403
        
        return f(*args, **kwargs)
    
    return decorated

def role_required(*allowed_roles):
    """Decorator to require specific roles"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'current_user'):
                return jsonify({'success': False, 'error': 'Authentication required'}), 401
            
            user_role = request.current_user.get('role')
            if user_role not in allowed_roles:
                return jsonify({'success': False, 'error': f'Access denied. Required roles: {", ".join(allowed_roles)}'}), 403
            
            return f(*args, **kwargs)
        
        return decorated
    return decorator

# Global auth service instance
auth_service = AuthService()
