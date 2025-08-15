from functools import wraps
from flask import jsonify
import logging

logger = logging.getLogger(__name__)

def error_handler(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"An error occurred: {e}")
            return jsonify({"error": "An internal error occurred"}), 500
    return decorated

def handle_errors(f):
    """Decorator to handle common errors"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValueError as e:
            logger.warning(f"Validation error: {str(e)}")
            return jsonify({'success': False, 'error': f'Validation error: {str(e)}'}), 400
        except PermissionError as e:
            logger.warning(f"Permission error: {str(e)}")
            return jsonify({'success': False, 'error': 'Insufficient permissions'}), 403
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return jsonify({'success': False, 'error': 'Internal server error'}), 500
    
    return decorated
