from functools import wraps
from flask import request, jsonify
from services.auth_service import AuthService

def auth_middleware(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']

        if not token:
            return jsonify({'message' : 'Token is missing!'}), 401

        try: 
            data = AuthService.decode_token(token)
            current_user = data['user_id']
        except:
            return jsonify({'message' : 'Token is invalid!'}), 401

        return f(current_user, *args, **kwargs)

    return decorated

def authenticate_token(f):
    """Middleware to authenticate JWT tokens"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                # Extract token from "Bearer <token>"
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({'success': False, 'error': 'Invalid authorization header format'}), 401
        
        if not token:
            return jsonify({'success': False, 'error': 'Authorization token is required'}), 401
        
        # Decode and validate token
        payload = AuthService.decode_token(token)
        if not payload:
            return jsonify({'success': False, 'error': 'Invalid or expired token'}), 401
        
        # Add user info to request context
        request.current_user = payload
        
        return f(*args, **kwargs)
    
    return decorated

def require_role(*allowed_roles):
    """Decorator to require specific user roles"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'current_user'):
                return jsonify({'success': False, 'error': 'Authentication required'}), 401
            
            user_role = request.current_user.get('role')
            if user_role not in allowed_roles:
                return jsonify({
                    'success': False, 
                    'error': f'Access denied. Required roles: {", ".join(allowed_roles)}'
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated
    return decorator
