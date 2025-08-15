"""
User Database Operations
Handles all user-related database interactions
"""

from database import db
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def create_user(email, password, full_name, role='student'):
    """Create a new user in the database"""
    try:
        # Check if user already exists
        existing_user = get_user_by_email(email)
        if existing_user:
            return None, "User already exists"
        
        # Hash password
        password_hash = generate_password_hash(password)
        
        # Create user data
        user_data = {
            'email': email,
            'password_hash': password_hash,
            'full_name': full_name,
            'role': role,
            'created_at': datetime.utcnow().isoformat(),
            'is_active': True
        }
        
        # Insert into database
        result = db.supabase.table('users').insert(user_data).execute()
        
        if result.data:
            user = result.data[0]
            # Remove password hash from response
            user.pop('password_hash', None)
            return user, None
        
        return None, "Failed to create user"
        
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        return None, f"Database error: {str(e)}"

def get_user_by_email(email):
    """Get user by email address"""
    try:
        result = db.supabase.table('users').select('*').eq('email', email).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        
        return None
        
    except Exception as e:
        logger.error(f"Error getting user by email: {e}")
        return None

def get_user_by_id(user_id):
    """Get user by ID"""
    try:
        result = db.supabase.table('users').select('*').eq('id', user_id).execute()
        
        if result.data and len(result.data) > 0:
            user = result.data[0]
            # Remove password hash from response
            user.pop('password_hash', None)
            return user
        
        return None
        
    except Exception as e:
        logger.error(f"Error getting user by ID: {e}")
        return None

def verify_user_password(email, password):
    """Verify user credentials with support for multiple password formats"""
    try:
        result = db.supabase.table('users').select('*').eq('email', email).execute()
        
        if result.data and len(result.data) > 0:
            user = result.data[0]
            stored_password = user.get('password_hash', '') or user.get('password', '')
            
            # Check password - handle multiple formats
            password_valid = False
            
            # Method 1: Check if it's a werkzeug hash
            if stored_password.startswith(('pbkdf2:', 'scrypt:', 'bcrypt:')):
                password_valid = check_password_hash(stored_password, password)
            # Method 2: Check plain text (for existing users)
            elif stored_password == password:
                password_valid = True
            # Method 3: Check if password might be in different field
            elif user.get('password') == password:
                password_valid = True
            
            if password_valid:
                # Remove password fields from response
                user.pop('password_hash', None)
                user.pop('password', None)
                return user
        
        return None
        
    except Exception as e:
        logger.error(f"Error verifying user password: {e}")
        return None

def get_all_users():
    """Get all users (admin only)"""
    try:
        result = db.supabase.table('users').select('id,email,full_name,role,created_at,is_active').execute()
        return result.data if result.data else []
        
    except Exception as e:
        logger.error(f"Error getting all users: {e}")
        return []

def update_user(user_id, updates):
    """Update user information"""
    try:
        # Remove sensitive fields that shouldn't be updated directly
        safe_updates = {k: v for k, v in updates.items() 
                       if k not in ['id', 'password_hash', 'created_at']}
        
        if 'password' in updates:
            safe_updates['password_hash'] = generate_password_hash(updates['password'])
            safe_updates.pop('password', None)
        
        result = db.supabase.table('users').update(safe_updates).eq('id', user_id).execute()
        
        if result.data:
            user = result.data[0]
            user.pop('password_hash', None)
            return user
        
        return None
        
    except Exception as e:
        logger.error(f"Error updating user: {e}")
        return None

def delete_user(user_id):
    """Delete a user (soft delete by setting is_active=False)"""
    try:
        result = db.supabase.table('users').update({'is_active': False}).eq('id', user_id).execute()
        return result.data is not None
        
    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        return False

def get_user_profile(user_id):
    """Get detailed user profile information"""
    try:
        result = db.supabase.table('users').select(
            'id,email,full_name,role,created_at,is_active,avatar,bio,phone,timezone'
        ).eq('id', user_id).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        
        return None
        
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        return None

def update_user_profile(user_id, profile_data):
    """Update user profile information"""
    try:
        # Only allow safe profile fields
        allowed_fields = ['full_name', 'bio', 'phone', 'timezone', 'avatar']
        safe_updates = {k: v for k, v in profile_data.items() if k in allowed_fields}
        
        if not safe_updates:
            return None
        
        result = db.supabase.table('users').update(safe_updates).eq('id', user_id).execute()
        
        if result.data:
            return result.data[0]
        
        return None
        
    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        return None

def change_user_password(user_id, old_password, new_password):
    """Change user password with verification"""
    try:
        # Get user with password hash
        result = db.supabase.table('users').select('*').eq('id', user_id).execute()
        
        if not result.data:
            return False, "User not found"
        
        user = result.data[0]
        
        # Verify old password
        if not check_password_hash(user.get('password_hash', ''), old_password):
            return False, "Current password is incorrect"
        
        # Update with new password
        new_hash = generate_password_hash(new_password)
        update_result = db.supabase.table('users').update({
            'password_hash': new_hash
        }).eq('id', user_id).execute()
        
        return update_result.data is not None, "Password updated successfully"
        
    except Exception as e:
        logger.error(f"Error changing user password: {e}")
        return False, f"Error updating password: {str(e)}"
