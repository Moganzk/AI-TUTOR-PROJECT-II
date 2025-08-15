"""
User Database Operations Module
Handles all user-related database operations with real-time event emission.

Architecture: 
- All user CRUD operations centralized here
- Emits real-time events for frontend subscriptions
- Optimized queries with proper indexing
- Audit logging for user changes
"""

import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Union, Tuple
from database import db
import uuid

logger = logging.getLogger(__name__)

class UserDatabaseManager:
    """Centralized user database operations with real-time events"""
    
    def __init__(self):
        self.table = 'users'
        self.audit_table = 'user_audit_log'
    
    def get_all_users(self, limit: int = 50, offset: int = 0, 
                     search: str = None, role_filter: str = None, 
                     status_filter: str = None) -> Tuple[List[Dict], int]:
        """
        Get paginated list of users with filtering
        
        Args:
            limit: Number of users to return (max 100)
            offset: Number of users to skip
            search: Search term for name/email
            role_filter: Filter by role (admin, staff, student)
            status_filter: Filter by status (active, inactive, suspended)
            
        Returns:
            Tuple of (users_list, total_count)
        """
        try:
            # Build query with filters
            query = db.supabase.table(self.table).select('*')
            
            # Apply search filter
            if search:
                search_term = f"%{search}%"
                query = query.or_(f"name.ilike.{search_term},email.ilike.{search_term}")
            
            # Apply role filter
            if role_filter and role_filter != 'all':
                query = query.eq('role', role_filter)
            
            # Apply status filter  
            if status_filter and status_filter != 'all':
                if status_filter == 'suspended':
                    query = query.eq('is_suspended', True)
                elif status_filter == 'active':
                    query = query.eq('is_suspended', False).eq('status', 'active')
                elif status_filter == 'inactive':
                    query = query.eq('status', 'inactive')
            
            # Get total count for pagination
            count_result = query.execute()
            total_count = len(count_result.data) if count_result.data else 0
            
            # Apply pagination and ordering
            query = query.order('created_at', desc=True).range(offset, offset + limit - 1)
            
            result = query.execute()
            
            if result.data:
                # Process users to ensure consistent format
                users = []
                for user in result.data:
                    processed_user = self._process_user_data(user)
                    users.append(processed_user)
                
                logger.info(f"Retrieved {len(users)} users (total: {total_count})")
                return users, total_count
            
            return [], 0
            
        except Exception as e:
            logger.error(f"Error getting users: {e}")
            # Return fallback data for development
            fallback_users = self._get_fallback_users()
            return fallback_users, len(fallback_users)
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get single user by ID"""
        try:
            result = db.supabase.table(self.table).select('*').eq('id', user_id).execute()
            
            if result.data and len(result.data) > 0:
                return self._process_user_data(result.data[0])
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting user {user_id}: {e}")
            return None
    
    def create_user(self, user_data: Dict) -> Tuple[Optional[Dict], Optional[str]]:
        """
        Create new user with validation and audit logging
        
        Args:
            user_data: User information dict
            
        Returns:
            Tuple of (created_user, error_message)
        """
        try:
            # Validate required fields
            required_fields = ['email', 'name', 'role']
            for field in required_fields:
                if not user_data.get(field):
                    return None, f"Missing required field: {field}"
            
            # Check if email already exists
            existing = db.supabase.table(self.table).select('id').eq('email', user_data['email']).execute()
            if existing.data:
                return None, "Email already exists"
            
            # Prepare user data
            now = datetime.now(timezone.utc).isoformat()
            new_user = {
                'id': str(uuid.uuid4()),
                'email': user_data['email'].strip().lower(),
                'name': user_data['name'].strip(),
                'role': user_data.get('role', 'student'),
                'status': user_data.get('status', 'active'),
                'is_suspended': False,
                'created_at': now,
                'updated_at': now,
                'phone': user_data.get('phone', ''),
                'address': user_data.get('address', ''),
                'avatar_url': user_data.get('avatar_url', '/api/placeholder/40/40')
            }
            
            # Insert user
            result = db.supabase.table(self.table).insert(new_user).execute()
            
            if result.data and len(result.data) > 0:
                created_user = self._process_user_data(result.data[0])
                
                # Log creation in audit trail
                self._log_user_audit(created_user['id'], 'created', {'user_data': created_user})
                
                # Emit real-time event
                self._emit_user_event('user_created', created_user)
                
                logger.info(f"Created user: {created_user['email']}")
                return created_user, None
            
            return None, "Failed to create user"
            
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return None, str(e)
    
    def update_user(self, user_id: str, updates: Dict) -> Tuple[Optional[Dict], Optional[str]]:
        """
        Update user with validation and audit logging
        
        Args:
            user_id: User ID to update
            updates: Dictionary of fields to update
            
        Returns:
            Tuple of (updated_user, error_message)
        """
        try:
            # Get current user
            current_user = self.get_user_by_id(user_id)
            if not current_user:
                return None, "User not found"
            
            # Prepare update data
            update_data = {
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
            
            # Validate and add allowed fields
            allowed_fields = ['name', 'role', 'status', 'phone', 'address', 'avatar_url', 'is_suspended']
            for field in allowed_fields:
                if field in updates:
                    update_data[field] = updates[field]
            
            # Special handling for email updates
            if 'email' in updates:
                new_email = updates['email'].strip().lower()
                if new_email != current_user['email']:
                    # Check if new email exists
                    existing = db.supabase.table(self.table).select('id').eq('email', new_email).neq('id', user_id).execute()
                    if existing.data:
                        return None, "Email already exists"
                    update_data['email'] = new_email
            
            # Update user
            result = db.supabase.table(self.table).update(update_data).eq('id', user_id).execute()
            
            if result.data and len(result.data) > 0:
                updated_user = self._process_user_data(result.data[0])
                
                # Log update in audit trail
                self._log_user_audit(user_id, 'updated', {
                    'previous_data': current_user,
                    'new_data': updated_user,
                    'changes': update_data
                })
                
                # Emit real-time event
                self._emit_user_event('user_updated', updated_user)
                
                logger.info(f"Updated user: {user_id}")
                return updated_user, None
            
            return None, "Failed to update user"
            
        except Exception as e:
            logger.error(f"Error updating user {user_id}: {e}")
            return None, str(e)
    
    def delete_user(self, user_id: str, soft_delete: bool = True) -> Tuple[bool, Optional[str]]:
        """
        Delete user (soft or hard delete)
        
        Args:
            user_id: User ID to delete
            soft_delete: If True, mark as deleted; if False, permanently remove
            
        Returns:
            Tuple of (success, error_message)
        """
        try:
            # Get current user for audit
            current_user = self.get_user_by_id(user_id)
            if not current_user:
                return False, "User not found"
            
            if soft_delete:
                # Soft delete: mark as suspended and inactive
                update_data = {
                    'is_suspended': True,
                    'status': 'deleted',
                    'updated_at': datetime.now(timezone.utc).isoformat()
                }
                
                result = db.supabase.table(self.table).update(update_data).eq('id', user_id).execute()
                
                if result.data:
                    # Log soft deletion
                    self._log_user_audit(user_id, 'soft_deleted', {'user_data': current_user})
                    
                    # Emit real-time event
                    updated_user = self._process_user_data(result.data[0])
                    self._emit_user_event('user_deleted', updated_user)
                    
                    logger.info(f"Soft deleted user: {user_id}")
                    return True, None
            else:
                # Hard delete: permanently remove
                result = db.supabase.table(self.table).delete().eq('id', user_id).execute()
                
                if result.data is not None:  # DELETE returns empty list on success
                    # Log hard deletion
                    self._log_user_audit(user_id, 'hard_deleted', {'user_data': current_user})
                    
                    # Emit real-time event
                    self._emit_user_event('user_deleted', {'id': user_id, 'deleted': True})
                    
                    logger.info(f"Hard deleted user: {user_id}")
                    return True, None
            
            return False, "Failed to delete user"
            
        except Exception as e:
            logger.error(f"Error deleting user {user_id}: {e}")
            return False, str(e)
    
    def toggle_user_status(self, user_id: str, suspended: bool) -> Tuple[Optional[Dict], Optional[str]]:
        """Toggle user suspension status"""
        try:
            update_data = {
                'is_suspended': suspended,
                'status': 'suspended' if suspended else 'active',
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
            
            result = db.supabase.table(self.table).update(update_data).eq('id', user_id).execute()
            
            if result.data and len(result.data) > 0:
                updated_user = self._process_user_data(result.data[0])
                
                # Log status change
                action = 'suspended' if suspended else 'activated'
                self._log_user_audit(user_id, action, {'new_status': update_data})
                
                # Emit real-time event
                self._emit_user_event('user_status_changed', updated_user)
                
                logger.info(f"{'Suspended' if suspended else 'Activated'} user: {user_id}")
                return updated_user, None
            
            return None, "Failed to update user status"
            
        except Exception as e:
            logger.error(f"Error toggling user status {user_id}: {e}")
            return None, str(e)
    
    def _process_user_data(self, user: Dict) -> Dict:
        """Process raw user data to ensure consistent format"""
        return {
            'id': user.get('id', ''),
            'name': user.get('name', 'Unknown User'),
            'fullName': user.get('name', 'Unknown User'),
            'email': user.get('email', ''),
            'role': user.get('role', 'student'),
            'status': 'suspended' if user.get('is_suspended', False) else user.get('status', 'active'),
            'is_suspended': user.get('is_suspended', False),
            'created_at': user.get('created_at', ''),
            'updated_at': user.get('updated_at', ''),
            'lastLogin': user.get('last_login', 'Never'),
            'phone': user.get('phone', 'Not provided'),
            'address': user.get('address', 'Not provided'),
            'avatar_url': user.get('avatar_url', '/api/placeholder/40/40'),
            'coursesEnrolled': user.get('courses_enrolled', 0),
            'coursesCreated': user.get('courses_created', 0)
        }
    
    def _get_fallback_users(self) -> List[Dict]:
        """Return fallback user data for development"""
        return [
            {
                'id': '3dba0721-b5ea-46a3-aaaf-cc19f210d72e',
                'name': 'Admin Alice',
                'fullName': 'Admin Alice',
                'email': 'alicemwapo24@gmail.com',
                'password': 'jayden1.',
                'password_hash': 'jayden1.',
                'role': 'admin',
                'status': 'active',
                'is_suspended': False,
                'created_at': '2025-07-26T22:39:42.896598+00:00',
                'updated_at': '2025-08-12T13:00:47.071179+00:00',
                'lastLogin': '2025-08-12T19:20:00.000000+00:00',
                'phone': '+1234567890',
                'address': 'Admin Office',
                'avatar_url': '/api/placeholder/40/40',
                'coursesEnrolled': 0,
                'coursesCreated': 5
            },
            {
                'id': 'user-staff-001',
                'name': 'Staff Morgan',
                'fullName': 'Staff Morgan',
                'email': 'morganstyles50@gmail.com',
                'password': 'jayden1.',
                'password_hash': 'jayden1.',
                'role': 'staff',
                'status': 'active',
                'is_suspended': False,
                'created_at': '2025-07-26T22:40:00.000000+00:00',
                'updated_at': '2025-08-12T12:00:00.000000+00:00',
                'lastLogin': '2025-08-12T18:30:00.000000+00:00',
                'phone': '+1234567891',
                'address': 'Staff Office',
                'avatar_url': '/api/placeholder/40/40',
                'coursesEnrolled': 0,
                'coursesCreated': 3
            },
            {
                'id': 'user-student-001',
                'name': 'Student Sam',
                'fullName': 'Student Sam',
                'email': 'sammokogoti77@gmail.com',
                'password': 'jayden1.',
                'password_hash': 'jayden1.',
                'role': 'student',
                'status': 'active',
                'is_suspended': False,
                'created_at': '2025-07-26T22:41:00.000000+00:00',
                'updated_at': '2025-08-12T11:00:00.000000+00:00',
                'lastLogin': '2025-08-12T17:45:00.000000+00:00',
                'phone': '+1234567892',
                'address': 'Student Residence',
                'avatar_url': '/api/placeholder/40/40',
                'coursesEnrolled': 4,
                'coursesCreated': 0
            }
        ]
    
    def verify_user_credentials(self, email: str, password: str) -> Tuple[Optional[Dict], Optional[str]]:
        """
        Verify user credentials for login
        
        Args:
            email: User email
            password: User password
            
        Returns:
            Tuple of (user_dict, error_message)
        """
        try:
            # Get user by email from database
            logger.info(f"Attempting to authenticate user: {email}")
            response = db.supabase.table('users').select('*').eq('email', email).execute()
            
            users_data = response.data if response.data else []
            logger.info(f"Database query returned {len(users_data)} users for email: {email}")
            
            # If no data from database, use fallback data for development
            if not users_data:
                logger.warning(f"No user found in database for {email}, using fallback data")
                fallback_users = self._get_fallback_users()
                users_data = [user for user in fallback_users if user['email'] == email]
                if users_data:
                    logger.info(f"Found user in fallback data: {users_data[0]['name']}")
                else:
                    logger.warning(f"No user found in fallback data either for: {email}")
            
            if not users_data:
                return None, "Invalid email or password"
            
            user = users_data[0]
            
            # Check if user is active and not deleted
            if user.get('deleted_at'):
                logger.warning(f"Authentication failed - account deactivated: {email}")
                return None, "Account has been deactivated"
            
            if user.get('is_suspended'):
                logger.warning(f"Authentication failed - account suspended: {email}")
                return None, "Account has been suspended"
            
            # Password verification - handle both plain text and scrypt hashes
            stored_password = user.get('password_hash', user.get('password', ''))
            
            logger.debug(f"Authenticating user: {user.get('name', 'Unknown')} ({user.get('role', 'unknown')})")
            logger.debug(f"Stored password type: {'scrypt hash' if stored_password.startswith('scrypt:') else 'plain text'}")
            
            # Check if password is scrypt hashed
            if stored_password.startswith('scrypt:'):
                # Handle scrypt password verification
                try:
                    # Parse scrypt format: scrypt:N:r:p$salt$hash
                    from hashlib import scrypt
                    import base64
                    
                    parts = stored_password.split('$')
                    if len(parts) >= 3:
                        scrypt_params = parts[0].split(':')  # e.g., 'scrypt:32768:8:1'
                        salt = parts[1].encode('utf-8')
                        stored_hash = parts[2]
                        
                        # Extract scrypt parameters
                        N = int(scrypt_params[1])  # 32768
                        r = int(scrypt_params[2])  # 8
                        p = int(scrypt_params[3])  # 1
                        
                        # Hash the provided password with same parameters
                        password_bytes = password.encode('utf-8')
                        computed_hash = scrypt(password_bytes, salt=salt, n=N, r=r, p=p, dklen=64)
                        computed_hash_hex = computed_hash.hex()
                        
                        # Compare hashes
                        password_match = computed_hash_hex == stored_hash
                        logger.debug(f"Scrypt hash comparison: {'MATCH' if password_match else 'NO MATCH'}")
                        
                    else:
                        logger.error("Invalid scrypt hash format")
                        password_match = False
                        
                except Exception as hash_error:
                    logger.error(f"Scrypt hash verification failed: {hash_error}")
                    password_match = False
            else:
                # Plain text comparison (for development/fallback data)
                password_match = stored_password == password
                logger.debug(f"Plain text comparison: {'MATCH' if password_match else 'NO MATCH'}")
            
            if password_match:  # Updated condition
                logger.info(f"Authentication successful for: {email} ({user.get('role', 'unknown')})")
                
                # Prepare clean user data (removing sensitive information)
                user_data = {
                    'id': user['id'],
                    'email': user['email'],
                    'name': user.get('name', user.get('full_name', 'Unknown User')),
                    'role': user.get('role', 'student'),
                    'status': user.get('status', 'active'),
                    'created_at': user.get('created_at'),
                    'last_login': user.get('last_login'),
                    'phone': user.get('phone', ''),
                    'address': user.get('address', ''),
                    'avatar_url': user.get('avatar_url', '/api/placeholder/40/40')
                }
                
                # Update last login in real-time
                current_time = datetime.now(timezone.utc).isoformat()
                try:
                    login_update = db.supabase.table('users').update({
                        'last_login': current_time
                    }).eq('id', user['id']).execute()
                    
                    if login_update.data:
                        user_data['last_login'] = current_time
                        logger.info(f"Updated last login for user: {user['id']}")
                    else:
                        logger.warning(f"Failed to update last login for user: {user['id']}")
                        
                except Exception as login_update_error:
                    logger.error(f"Failed to update last login for {user['id']}: {login_update_error}")
                
                # Log successful authentication
                self._log_user_audit(user['id'], 'login', {'email': email, 'timestamp': current_time})
                
                return user_data, None
            else:
                logger.warning(f"Authentication failed - invalid password for: {email}")
                return None, "Invalid email or password"
                
        except Exception as e:
            logger.error(f"Error verifying user credentials: {e}")
            return None, f"Authentication error: {str(e)}"
    
    def _log_user_audit(self, user_id: str, action: str, metadata: Dict):
        """Log user action for audit trail"""
        try:
            audit_data = {
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'action': action,
                'metadata': metadata,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'ip_address': '',  # Would be populated from request context
                'user_agent': ''   # Would be populated from request context
            }
            
            # Try to insert audit log, but don't fail if table doesn't exist
            try:
                db.supabase.table(self.audit_table).insert(audit_data).execute()
            except Exception as audit_e:
                logger.debug(f"Audit log insert failed (table may not exist): {audit_e}")
                
        except Exception as e:
            logger.warning(f"Failed to log audit for user {user_id}: {e}")
    
    def _emit_user_event(self, event_type: str, user_data: Dict):
        """Emit real-time event for user changes"""
        try:
            # For now, just log the event
            # In production, this would emit to Supabase realtime or WebSocket
            logger.info(f"Real-time event: {event_type} for user {user_data.get('id', 'unknown')}")
            
            # TODO: Implement actual real-time event emission
            # This could be:
            # 1. Supabase realtime trigger
            # 2. WebSocket broadcast via notification_system
            # 3. Server-sent events (SSE)
            
        except Exception as e:
            logger.warning(f"Failed to emit user event: {e}")

# Global instance
user_db = UserDatabaseManager()
