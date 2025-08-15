#!/usr/bin/env python3
"""
Simple Authentication Middleware
Provides token_required and role_required decorators for API endpoint protection
"""

from functools import wraps
from flask import request, jsonify, g
import jwt
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# JWT Configuration
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

def token_required(f):
    """
    Decorator that validates JWT token and sets current_user
    Usage: @token_required
    """
    @wraps(f)
    def decorator(*args, **kwargs):
        token = None
        
        # Check for token in Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                # Expected format: "Bearer <token>"
                token = auth_header.split(" ")[1] if auth_header.startswith('Bearer ') else auth_header
            except IndexError:
                return jsonify({
                    'error': 'Invalid Authorization header format',
                    'message': 'Use: Authorization: Bearer <token>'
                }), 401
        
        # Check for token in request args (fallback)
        if not token:
            token = request.args.get('token')
        
        if not token:
            return jsonify({
                'error': 'Missing authentication token',
                'message': 'Please provide a valid authentication token'
            }), 401
        
        try:
            # Decode the JWT token
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            
            # Extract user info from payload
            current_user = {
                'user_id': payload.get('user_id'),
                'email': payload.get('email'),
                'role': payload.get('role', 'student'),
                'first_name': payload.get('first_name', ''),
                'last_name': payload.get('last_name', ''),
                'exp': payload.get('exp')
            }
            
            # Check if token is expired
            if current_user['exp'] and current_user['exp'] < datetime.now().timestamp():
                return jsonify({
                    'error': 'Token expired',
                    'message': 'Please log in again'
                }), 401
            
            # Set current user in Flask's g object
            g.current_user = current_user
            
            logger.debug(f"Authenticated user: {current_user['email']} ({current_user['role']})")
            
        except jwt.ExpiredSignatureError:
            return jsonify({
                'error': 'Token expired',
                'message': 'Please log in again'
            }), 401
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {str(e)}")
            return jsonify({
                'error': 'Invalid token',
                'message': 'Please provide a valid authentication token'
            }), 401
        except Exception as e:
            logger.error(f"Token validation error: {str(e)}")
            return jsonify({
                'error': 'Authentication failed',
                'message': 'Unable to validate token'
            }), 401
        
        # Call the original function with current_user as the first argument
        return f(current_user, *args, **kwargs)
    
    return decorator

def role_required(*allowed_roles):
    """
    Decorator that checks if user has required role(s)
    Usage: @role_required('admin') or @role_required('admin', 'staff')
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            # Check if user is authenticated (should be used after @token_required)
            current_user = getattr(g, 'current_user', None)
            
            if not current_user:
                return jsonify({
                    'error': 'Authentication required',
                    'message': 'Please log in to access this resource'
                }), 401
            
            user_role = current_user.get('role', 'student')
            
            # Check if user's role is in allowed roles
            if user_role not in allowed_roles:
                return jsonify({
                    'error': 'Insufficient permissions',
                    'message': f'This action requires {" or ".join(allowed_roles)} role',
                    'user_role': user_role,
                    'required_roles': list(allowed_roles)
                }), 403
            
            logger.debug(f"Role authorization passed: {user_role} in {allowed_roles}")
            
            return f(*args, **kwargs)
        
        return wrapper
    return decorator

def generate_token(user_data, expires_in_hours=24):
    """
    Generate JWT token for user
    
    Args:
        user_data (dict): User information
        expires_in_hours (int): Token expiration time in hours
    
    Returns:
        str: JWT token
    """
    try:
        payload = {
            'user_id': user_data.get('user_id'),
            'email': user_data.get('email'),
            'role': user_data.get('role', 'student'),
            'first_name': user_data.get('first_name', ''),
            'last_name': user_data.get('last_name', ''),
            'iat': datetime.now().timestamp(),
            'exp': datetime.now().timestamp() + (expires_in_hours * 3600)
        }
        
        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        
        logger.info(f"Generated token for user: {user_data.get('email')}")
        
        return token
        
    except Exception as e:
        logger.error(f"Token generation error: {str(e)}")
        raise

def verify_token(token):
    """
    Verify JWT token and return user data
    
    Args:
        token (str): JWT token
    
    Returns:
        dict: User data if valid, None if invalid
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        
        return {
            'user_id': payload.get('user_id'),
            'email': payload.get('email'),
            'role': payload.get('role', 'student'),
            'first_name': payload.get('first_name', ''),
            'last_name': payload.get('last_name', ''),
            'exp': payload.get('exp')
        }
        
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        return None

# Optional: Admin-only decorator for convenience
def admin_required(f):
    """
    Decorator that requires admin role
    Usage: @admin_required
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        return role_required('admin')(token_required(f))(*args, **kwargs)
    
    return wrapper

# Optional: Staff-only decorator for convenience  
def staff_required(f):
    """
    Decorator that requires staff or admin role
    Usage: @staff_required
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        return role_required('staff', 'admin')(token_required(f))(*args, **kwargs)
    
    return wrapper
