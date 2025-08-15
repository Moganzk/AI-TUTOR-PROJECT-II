import logging
from datetime import datetime, timezone, timedelta
from flask import request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
import jwt
from middleware import require_auth, validate_json
import database as db
from database_modules.user_db import get_user_by_id, update_user_profile, change_user_password
from config import Config

logger = logging.getLogger(__name__)

def register_profile_routes(app):
    """Register all profile-related routes"""

    @app.route('/api/profile', methods=['GET'])
    @require_auth
    def get_user_profile_api():
        """Get current user's profile information (API compatible)"""
        try:
            user_id = request.user['id']
            user = get_user_by_id(user_id)
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            # Get additional profile data
            try:
                stats = db.get_user_stats(user_id)
                recent_activity = db.get_recent_activity(user_id, limit=5)
            except Exception as stats_error:
                app.logger.warning(f"Error getting user stats: {stats_error}")
                # Provide fallback stats based on role
                role = user.get('role', 'student')
                if role == 'admin':
                    stats = {
                        'totalUsers': 0,
                        'systemUptime': 99.9,
                        'coursesManaged': 0,
                        'monthlyGrowth': 0,
                        'ticketsResolved': 0
                    }
                elif role == 'staff':
                    stats = {
                        'coursesCreated': 0,
                        'totalStudents': 0,
                        'avgRating': 0,
                        'totalHours': 0
                    }
                else:
                    stats = {
                        'coursesCompleted': 0,
                        'totalPoints': 0,
                        'studyHours': 0,
                        'achievements': 0
                    }
                recent_activity = []
            
            # Split the 'name' field into firstName and lastName for compatibility
            full_name = user.get('name', '')
            name_parts = full_name.split(' ', 1) if full_name else ['', '']
            first_name = user.get('first_name', name_parts[0] if name_parts else '')
            last_name = user.get('last_name', name_parts[1] if len(name_parts) > 1 else '')
            
            # Format response with safe gets for potentially missing columns
            profile_data = {
                'id': user.get('id'),
                'email': user.get('email'),
                'firstName': first_name,
                'lastName': last_name,
                'role': user.get('role'),
                'phone': user.get('phone', ''),
                'address': user.get('address', ''),
                'bio': user.get('bio', ''),
                'avatar': user.get('avatar', user.get('avatar_url', '')),
                'birthDate': user.get('birth_date', ''),
                'website': user.get('website', ''),
                'github': user.get('github', ''),
                'linkedin': user.get('linkedin', ''),
                'twitter': user.get('twitter', ''),
                'specialization': user.get('specialization', ''),
                'yearsOfExperience': user.get('years_of_experience', ''),
                'education': user.get('education', ''),
                'createdAt': user.get('created_at'),
                'updatedAt': user.get('updated_at')
            }
            
            return jsonify({
                'success': True,
                'profile': profile_data,
                'stats': stats,
                'recentActivity': recent_activity
            })
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/profile', methods=['PUT'])
    @require_auth
    @validate_json(['firstName', 'lastName', 'email'])
    def update_user_profile_api():
        """Update current user's profile information (API compatible)"""
        try:
            user_id = request.user['id']
            data = request.get_json()
            
            # Validate email format
            email = data.get('email', '').strip()
            if not email or '@' not in email:
                return jsonify({'error': 'Valid email is required'}), 400
            
            # Check if email is already taken by another user
            existing_user = db.get_user_by_email(email)
            if existing_user and existing_user.get('id') != user_id:
                return jsonify({'error': 'Email is already in use'}), 409
            
            # Prepare update data - only update core fields that exist in schema
            first_name = data.get('firstName', '').strip()
            last_name = data.get('lastName', '').strip()
            full_name = f"{first_name} {last_name}".strip()
            
            # Build updates dict with only confirmed existing fields
            updates = {
                'email': email,
                'name': full_name,
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
            
            # Add optional fields only if they have values and exist in our schema
            if data.get('phone'):
                updates['phone'] = data.get('phone', '').strip()
            
            if data.get('bio'):
                updates['bio'] = data.get('bio', '').strip()
            
            if data.get('address'):
                updates['address'] = data.get('address', '').strip()
            
            if data.get('avatar'):
                updates['avatar'] = data.get('avatar', '').strip()
            
            if data.get('website'):
                updates['website'] = data.get('website', '').strip()
            
            if data.get('github'):
                updates['github'] = data.get('github', '').strip()
            
            if data.get('linkedin'):
                updates['linkedin'] = data.get('linkedin', '').strip()
            
            if data.get('twitter'):
                updates['twitter'] = data.get('twitter', '').strip()
            
            # Perform the update
            try:
                result = db.update_user(user_id, updates)
                if not result:
                    return jsonify({'error': 'Failed to update profile in database'}), 500
                    
            except Exception as e:
                logger.error(f"Database error updating user {user_id}: {e}")
                return jsonify({'error': f'Database error: {str(e)}'}), 500
            
            # Get updated user data
            updated_user = db.get_user_by_id(user_id)
            if not updated_user:
                return jsonify({'error': 'Failed to retrieve updated profile'}), 500
            
            # Format response with only confirmed data
            name_parts = updated_user.get('name', '').split(' ', 1)
            profile_data = {
                'id': updated_user.get('id'),
                'email': updated_user.get('email'),
                'firstName': name_parts[0] if name_parts else '',
                'lastName': name_parts[1] if len(name_parts) > 1 else '',
                'role': updated_user.get('role'),
                'phone': updated_user.get('phone', ''),
                'bio': updated_user.get('bio', ''),
                'address': updated_user.get('address', ''),
                'avatar': updated_user.get('avatar', ''),
                'website': updated_user.get('website', ''),
                'github': updated_user.get('github', ''),
                'linkedin': updated_user.get('linkedin', ''),
                'twitter': updated_user.get('twitter', ''),
                'updatedAt': updated_user.get('updated_at')
            }
            
            logger.info(f"Profile updated successfully for user {user_id}")
            
            return jsonify({
                'success': True,
                'message': 'Profile updated successfully',
                'profile': profile_data
            })
        
        except Exception as e:
            logger.error(f"Error in update_user_profile_api: {e}")
            return jsonify({'error': str(e)}), 500

    @app.route('/api/profile/password', methods=['PUT'])
    @require_auth
    def change_password():
        """Change current user's password securely.

        Request JSON body:
          - currentPassword: str (required)
          - newPassword: str (required, min 8 chars)

        Security considerations:
          - Never echoes passwords.
          - Uses werkzeug's generate_password_hash / check_password_hash (PBKDF2) consistent with login.
          - Returns generic errors except for explicit current password mismatch per requirements.
        """
        try:
            data = request.get_json() or {}
            current_password = data.get('currentPassword', '')
            new_password = data.get('newPassword', '')

            # Basic validation
            if not current_password or not new_password:
                return jsonify({'error': 'currentPassword and newPassword are required'}), 400
            if len(new_password) < 8:
                return jsonify({'error': 'New password must be at least 8 characters'}), 400

            # Optional: simple strength checks (at least one letter & one digit)
            has_alpha = any(c.isalpha() for c in new_password)
            has_digit  = any(c.isdigit() for c in new_password)
            if not (has_alpha and has_digit):
                return jsonify({'error': 'New password must include letters and numbers'}), 400

            user_id = request.user['id']
            user = db.get_user_by_id(user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404

            stored_hash = user.get('password')
            if not stored_hash:
                # If user has no local password yet, require setting via a different flow
                return jsonify({'error': 'Password change not available for this account'}), 400

            # Verify current password
            if not check_password_hash(stored_hash, current_password):
                return jsonify({'error': 'Current password is incorrect'}), 401

            # Prevent reusing the same password
            if check_password_hash(stored_hash, new_password):
                return jsonify({'error': 'New password must be different from current password'}), 400

            # Hash and update
            new_hash = generate_password_hash(new_password)
            update_result = db.update_user(user_id, {'password': new_hash, 'updated_at': datetime.now(timezone.utc).isoformat()})
            if not update_result:
                return jsonify({'error': 'Failed to update password'}), 500

            # Issue fresh JWT token after password change
            new_token = jwt.encode({
                'user_id': user['id'],
                'email': user['email'],
                'role': user['role'],
                'exp': datetime.utcnow() + timedelta(hours=Config.JWT_EXPIRATION_HOURS)
            }, Config.JWT_SECRET, algorithm='HS256')

            return jsonify({'success': True, 'message': 'Password updated successfully', 'token': new_token}), 200
        except Exception as e:
            logger.error(f"Error changing password for user {request.user.get('id') if hasattr(request, 'user') else 'unknown'}: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/profile/avatar', methods=['POST'])
    @require_auth
    def upload_avatar():
        """Upload user avatar (placeholder endpoint)"""
        try:
            user_id = request.user['id']
            data = request.get_json()
            
            avatar_url = data.get('avatar_url', '')
            if not avatar_url:
                return jsonify({'error': 'Avatar URL is required'}), 400
            
            # Update user avatar
            result = db.update_user(user_id, {
                'avatar': avatar_url,
                'updated_at': datetime.now(timezone.utc).isoformat()
            })
            
            if result:
                return jsonify({
                    'success': True,
                    'message': 'Avatar updated successfully',
                    'avatar_url': avatar_url
                })
            else:
                return jsonify({'error': 'Failed to update avatar'}), 500
                
        except Exception as e:
            logger.error(f"Error uploading avatar for user {request.user.get('id')}: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/profile/preferences', methods=['GET'])
    @require_auth
    def get_user_preferences():
        """Get user preferences"""
        try:
            user_id = request.user['id']
            
            # Get user preferences (these would be stored in a preferences table in production)
            # For now, return default preferences
            preferences = {
                'theme': 'light',
                'language': 'en',
                'notifications': {
                    'email': True,
                    'push': True,
                    'sms': False
                },
                'privacy': {
                    'profileVisible': True,
                    'showEmail': False,
                    'showPhone': False
                },
                'display': {
                    'timezone': 'UTC',
                    'dateFormat': 'MM/DD/YYYY',
                    'timeFormat': '12h'
                }
            }
            
            return jsonify({
                'success': True,
                'preferences': preferences
            })
            
        except Exception as e:
            logger.error(f"Error getting preferences for user {request.user.get('id')}: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/profile/preferences', methods=['PUT'])
    @require_auth
    def update_user_preferences():
        """Update user preferences"""
        try:
            user_id = request.user['id']
            data = request.get_json()
            
            # In production, you would validate and store these preferences
            # For now, just return success
            
            return jsonify({
                'success': True,
                'message': 'Preferences updated successfully',
                'preferences': data
            })
            
        except Exception as e:
            logger.error(f"Error updating preferences for user {request.user.get('id')}: {e}")
            return jsonify({'error': 'Internal server error'}), 500
