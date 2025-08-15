#!/usr/bin/env python3
"""
Middleware Module
Provides authentication and authorization functions for the AI Tutor LMS
"""

from .simple_auth import (
    token_required, 
    role_required, 
    admin_required, 
    staff_required,
    generate_token,
    verify_token
)

# Import or create the missing authenticate_token and require_role functions
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

def authenticate_token(f):
    """
    Alternative name for token_required for backwards compatibility
    """
    @wraps(f)
    def decorator(*args, **kwargs):
        token = None
        
        # Check for token in Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
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
        
        # Call the original function
        return f(*args, **kwargs)
    
    return decorator

def require_role(*allowed_roles):
    """
    Alternative name for role_required for backwards compatibility
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            # Check if user is authenticated
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

# Export all functions for easy importing
__all__ = [
    'token_required',
    'role_required', 
    'admin_required',
    'staff_required',
    'authenticate_token',
    'require_role',
    'generate_token',
    'verify_token'
]
