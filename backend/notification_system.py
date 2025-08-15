
from flask import request, jsonify
from functools import wraps
import logging
from config import Config
from database import db
from middleware import authenticate_token, require_role
import jwt

logger = logging.getLogger(__name__)

def register_notification_routes(app):
	# All notification endpoints moved from app.py

	@app.route('/api/notifications/unread-count', methods=['GET'])
	@authenticate_token
	def get_unread_notification_count():
		"""Get the count of unread notifications for the current user"""
		try:
			user_id = request.current_user['user_id']
			count = db.get_unread_notification_count(user_id)
			return jsonify({'success': True, 'unread_count': count}), 200
		except Exception as e:
			app.logger.error(f"Error getting unread notification count: {e}")
			return jsonify({'error': 'Failed to retrieve unread notification count'}), 500

	@app.route('/api/notifications', methods=['GET'])
	@authenticate_token
	def get_notifications():
		"""Get notifications for the current user with enhanced filtering"""
		try:
			user_id = request.current_user['user_id']

			# Get query parameters
			include_archived = request.args.get('include_archived', 'false').lower() == 'true'
			include_deleted = request.args.get('include_deleted', 'false').lower() == 'true'
			notification_type = request.args.get('type')
			priority = request.args.get('priority')
            
			# Get notifications with user actions
			try:
				notifications = db.get_user_notifications(
					user_id=user_id,
					include_archived=include_archived,
					include_deleted=include_deleted
				)
			except TypeError as te:
				app.logger.error(f"Notification retrieval signature mismatch: {te}")
				try:
					notifications = db.get_user_notifications(user_id)
				except Exception as inner_e:
					app.logger.error(f"Secondary notification retrieval failure: {inner_e}")
					notifications = []
			except Exception as gen_e:
				app.logger.error(f"General notification retrieval failure: {gen_e}")
				notifications = []

			# Filter by type and priority if specified
			if notification_type:
				notifications = [n for n in notifications if n.get('type') == notification_type]
			if priority:
				notifications = [n for n in notifications if n.get('priority') == priority]

			# Get notification statistics
			try:
				stats = db.get_notification_stats(user_id)
			except Exception as se:
				app.logger.error(f"Notification stats error: {se}")
				stats = {'total': len(notifications), 'unread': len([n for n in notifications if not n.get('is_read')])}

			return jsonify({
				'success': True,
				'notifications': notifications,
				'stats': stats,
				'total': len(notifications)
			})
		except Exception as e:
			logger.error(f"Unhandled error getting notifications: {e}")
			return jsonify({'success': False, 'notifications': [], 'error': 'Failed to load notifications'}), 500

	@app.route('/api/test-notification-types', methods=['GET'])
	def test_notification_types():
		"""Test what notification types are allowed by the database"""
		test_types = ['info', 'warning', 'success', 'error', 'general', 'system']
		current_user = request.current_user
		results = {}
		for test_type in test_types:
			try:
				test_data = {
					'title': f'Test {test_type}',
					'message': 'Testing notification type constraint',
					'sender_id': current_user['user_id'],
					'target': current_user['user_id'],
					'type': test_type,
					'priority': 'low'
				}
				result = db.create_notification(test_data)
				if result:
					results[test_type] = 'SUCCESS - Type is allowed by database'
					try:
						if isinstance(result, dict) and 'id' in result:
							db.delete_notification(result['id'], current_user['id'])
					except:
						pass
				else:
					results[test_type] = 'FAILED - Database returned None'
			except Exception as e:
				results[test_type] = f'ERROR - Database constraint violation: {str(e)}'
		return jsonify({
			'success': True,
			'database_constraint': 'Only allows: info, warning, success, error',
			'results': results,
			'message': 'Notification type constraint test completed'
		}), 200

	@app.route('/api/notifications', methods=['POST'])
	def create_notification():
		"""Create a new notification"""
		try:
			app.logger.info(f"Notification creation request from user {request.current_user['user_id']}")
			data = request.get_json()
			if not data:
				app.logger.error("No JSON data provided in notification request")
				return jsonify({'error': 'No JSON data provided'}), 400
			app.logger.info(f"Notification request data: {data}")
			current_user = request.current_user
			title = data.get('title', '').strip()
			message = data.get('message', '').strip()
			target = data.get('target', 'all')
			if not title:
				app.logger.error("Missing title in notification request")
				return jsonify({'error': 'Title is required'}), 400
			if not message:
				app.logger.error("Missing message in notification request")
				return jsonify({'error': 'Message is required'}), 400
			valid_targets = ['all', 'students', 'staff', 'admin']
			if isinstance(target, str) and target not in valid_targets:
				app.logger.error(f"Invalid target: {target}")
				return jsonify({'error': f'Invalid target. Must be one of: {', '.join(valid_targets)}'}), 400
			notification_type = data.get('type', 'info')
			valid_types = ['info', 'warning', 'success', 'error']
			if notification_type not in valid_types:
				app.logger.error(f"Invalid notification type: {notification_type}")
				return jsonify({'error': f'Invalid notification type. Must be one of: {', '.join(valid_types)}'}), 400
			notification_data = {
				'title': title,
				'message': message,
				'sender_id': current_user['user_id'],
				'target': target,
				'is_global': target == 'all',
				'status': 'active',
				'type': notification_type,
				'priority': data.get('priority', 'medium')
			}
			app.logger.info(f"Creating notification with data: {notification_data}")
			notification = db.create_notification(notification_data)
			if notification:
				notifications = notification if isinstance(notification, list) else [notification]
				try:
					notif_id = notifications[0].get('id', 'unknown') if notifications else 'unknown'
				except Exception:
					notif_id = 'unknown'
				app.logger.info(f"Notification created successfully: {notif_id}")
				return jsonify({
					'success': True,
					'notifications': notifications,
					'count': len(notifications),
					'message': 'Notification sent successfully'
				}), 201
			else:
				app.logger.error("Database returned None when creating notification")
				app.logger.error(f"Notification data was: {notification_data}")
				return jsonify({'error': 'Failed to create notification in database'}), 500
		except Exception as e:
			app.logger.error(f"Unexpected error creating notification: {str(e)}")
			app.logger.error(f"Notification data was: {notification_data if 'notification_data' in locals() else 'undefined'}")
			import traceback
			app.logger.error(f"Full traceback: {traceback.format_exc()}")
			return jsonify({'error': 'Internal server error while creating notification'}), 500

	@app.route('/api/notifications/<notification_id>/read', methods=['PUT'])
	def mark_notification_read(notification_id):
		"""Mark a notification as read"""
		try:
			user_id = request.current_user['user_id']
			result = db.mark_notification_read(notification_id, user_id)
			if result:
				return jsonify({
					'success': True,
					'message': 'Notification marked as read',
					'notification': result
				}), 200
			else:
				return jsonify({'error': 'Failed to mark notification as read'}), 500
		except Exception as e:
			logger.error(f"Error marking notification as read: {e}")
			return jsonify({'error': str(e)}), 500

	@app.route('/api/notifications/<notification_id>/archive', methods=['PUT'])
	def archive_notification(notification_id):
		"""Archive a notification for the current user"""
		try:
			user_id = request.current_user['user_id']
			result = db.archive_notification(notification_id, user_id)
			if result:
				return jsonify({
					'success': True,
					'message': 'Notification archived',
					'notification': result
				}), 200
			else:
				return jsonify({'error': 'Failed to archive notification'}), 500
		except Exception as e:
			logger.error(f"Error archiving notification: {e}")
			return jsonify({'error': str(e)}), 500

	@app.route('/api/notifications/<notification_id>', methods=['DELETE'])
	def delete_notification_user(notification_id):
		"""Delete (soft delete) a notification for the current user"""
		try:
			user_id = request.current_user['user_id']
			result = db.delete_notification_for_user(notification_id, user_id)
			if result:
				return jsonify({
					'success': True,
					'message': 'Notification deleted',
					'notification': result
				}), 200
			else:
				return jsonify({'error': 'Failed to delete notification'}), 500
		except Exception as e:
			logger.error(f"Error deleting notification: {e}")
			return jsonify({'error': str(e)}), 500

	@app.route('/api/notifications/bulk-action', methods=['POST'])
	def bulk_notification_action():
		"""Perform bulk actions on notifications (read, archive, delete, restore)"""
		try:
			user_id = request.current_user['user_id']
			data = request.get_json()
			notification_ids = data.get('notification_ids', [])
			action = data.get('action')
			if not notification_ids:
				return jsonify({'error': 'No notification IDs provided'}), 400
			if action not in ['read', 'archive', 'delete', 'unarchive', 'restore']:
				return jsonify({'error': 'Invalid action. Must be: read, archive, delete, unarchive, restore'}), 400
			result = db.bulk_notification_action(notification_ids, user_id, action)
			if result:
				return jsonify({
					'success': True,
					'message': f'Bulk {action} action completed',
					'affected_count': len(result),
					'notifications': result
				}), 200
			else:
				return jsonify({'error': f'Failed to perform bulk {action} action'}), 500
		except Exception as e:
			logger.error(f"Error performing bulk action: {e}")
			return jsonify({'error': str(e)}), 500

	@app.route('/api/notifications/stats', methods=['GET'])
	def get_notification_stats():
		"""Get notification statistics for the current user"""
		try:
			user_id = request.current_user['user_id']
			stats = db.get_notification_stats(user_id)
			return jsonify({
				'success': True,
				'stats': stats
			}), 200
		except Exception as e:
			logger.error(f"Error getting notification stats: {e}")
			return jsonify({'error': str(e)}), 500

	@app.route('/api/notifications/mark-all-read', methods=['PUT'])
	def mark_all_notifications_read():
		"""Mark all notifications as read for the current user"""
		try:
			user_id = request.current_user['user_id']
			result = db.mark_all_notifications_read(user_id)
			if result:
				return jsonify({
					'success': True,
					'message': 'All notifications marked as read'
				})
			else:
				return jsonify({'error': 'Failed to mark notifications as read'}), 500
		except Exception as e:
			return jsonify({'error': str(e)}), 500

	@app.route('/api/notifications/bulk-delete', methods=['DELETE'])
	def bulk_delete_notifications():
		"""Delete multiple notifications"""
		try:
			user_id = request.current_user['user_id']
			data = request.get_json()
			notification_ids = data.get('notification_ids', [])
			if not notification_ids:
				return jsonify({'error': 'No notification IDs provided'}), 400
			result = db.bulk_delete_notifications(notification_ids, user_id)
			if result:
				return jsonify({
					'success': True,
					'message': f'Successfully deleted {len(notification_ids)} notifications'
				})
			else:
				return jsonify({'error': 'Failed to delete notifications'}), 500
		except Exception as e:
			return jsonify({'error': str(e)}), 500

	@app.route('/api/notifications/bulk-mark-read', methods=['PUT'])
	def bulk_mark_notifications_read():
		"""Mark multiple notifications as read"""
		try:
			user_id = request.current_user['user_id']
			data = request.get_json()
			notification_ids = data.get('notification_ids', [])
			if not notification_ids:
				return jsonify({'error': 'No notification IDs provided'}), 400
			result = db.bulk_mark_notifications_read(notification_ids, user_id)
			if result:
				return jsonify({
					'success': True,
					'message': f'Successfully marked {len(notification_ids)} notifications as read'
				})
			else:
				return jsonify({'error': 'Failed to mark notifications as read'}), 500
		except Exception as e:
			return jsonify({'error': str(e)}), 500

	@app.route('/api/admin/notifications', methods=['GET'])
	def get_admin_notifications_management():
		"""Get all notifications for admin management with detailed recipient info"""
		try:
			filters = {}
			if request.args.get('type'):
				filters['type'] = request.args.get('type')
			if request.args.get('target'):
				filters['target'] = request.args.get('target')
			if request.args.get('status'):
				filters['status'] = request.args.get('status')
			if request.args.get('sender_id'):
				filters['sender_id'] = request.args.get('sender_id')
			notifications = db.get_all_notifications_admin(filters)
			for notification in notifications:
				recipients = db.get_notification_recipients(notification['id'])
				total_recipients = len(recipients)
				read_count = len([r for r in recipients if r.get('is_read')])
				archived_count = len([r for r in recipients if r.get('is_archived')])
				deleted_count = len([r for r in recipients if r.get('is_deleted')])
				notification['recipient_stats'] = {
					'total': total_recipients,
					'read': read_count,
					'unread': total_recipients - read_count,
					'archived': archived_count,
					'deleted': deleted_count,
					'active': total_recipients - deleted_count
				}
			return jsonify({
				'success': True,
				'notifications': notifications,
				'count': len(notifications)
			})
		except Exception as e:
			logger.error(f"Error getting admin notifications: {e}")
			return jsonify({'error': str(e)}), 500

	@app.route('/api/admin/notifications/<notification_id>/recipients', methods=['GET'])
	def get_notification_recipients_admin(notification_id):
		"""Get detailed recipient information for a specific notification"""
		try:
			recipients = db.get_notification_recipients(notification_id)
			return jsonify({
				'success': True,
				'notification_id': notification_id,
				'recipients': recipients,
				'count': len(recipients)
			})
		except Exception as e:
			logger.error(f"Error getting notification recipients: {e}")
			return jsonify({'error': str(e)}), 500

	@app.route('/api/admin/notifications/<notification_id>', methods=['PUT'])
	def update_notification_admin(notification_id):
		"""Update a notification (admin only)"""
		try:
			data = request.get_json()
			allowed_fields = ['title', 'message', 'type', 'priority', 'status']
			update_data = {key: value for key, value in data.items() if key in allowed_fields}
			if not update_data:
				return jsonify({'error': 'No valid fields to update'}), 400
			if 'type' in update_data:
				valid_types = ['info', 'warning', 'success', 'error']
				if update_data['type'] not in valid_types:
					return jsonify({'error': f'Invalid type. Must be one of: {', '.join(valid_types)}'}), 400
			result = db.update_notification_admin(notification_id, update_data)
			if result:
				return jsonify({
					'success': True,
					'message': 'Notification updated successfully',
					'notification': result
				}), 200
			else:
				return jsonify({'error': 'Failed to update notification'}), 500
		except Exception as e:
			logger.error(f"Error updating notification: {e}")
			return jsonify({'error': str(e)}), 500

	@app.route('/api/admin/notifications', methods=['POST'])
	def create_notification_admin():
		"""Admin endpoint to create a notification"""
		try:
			data = request.get_json()
			current_user = request.current_user
			title = data.get('title', '').strip()
			message = data.get('message', '').strip()
			target = data.get('target', 'all')
			if not title:
				return jsonify({'error': 'Title is required'}), 400
			if not message:
				return jsonify({'error': 'Message is required'}), 400
			valid_targets = ['all', 'students', 'staff', 'admin']
			if isinstance(target, str) and target not in valid_targets:
				return jsonify({'error': f'Invalid target. Must be one of: {', '.join(valid_targets)}'}), 400
			notification_type = data.get('type', 'info')
			valid_types = ['info', 'warning', 'success', 'error']
			if notification_type not in valid_types:
				return jsonify({'error': f'Invalid notification type. Must be one of: {', '.join(valid_types)}'}), 400
			notification_data = {
				'title': title,
				'message': message,
				'sender_id': current_user['user_id'],
				'target': target,
				'is_global': target == 'all',
				'status': 'active',
				'type': notification_type,
				'priority': data.get('priority', 'medium')
			}
			notification = db.create_notification(notification_data)
			if notification:
				notifications = notification if isinstance(notification, list) else [notification]
				return jsonify({
					'success': True,
					'notifications': notifications,
					'count': len(notifications),
					'message': 'Notification sent successfully'
				}), 201
			else:
				return jsonify({'error': 'Failed to create notification in database'}), 500
		except Exception as e:
			return jsonify({'error': str(e)}), 500

	@app.route('/api/admin/notifications/<notification_id>', methods=['DELETE'])
	def delete_admin_notification(notification_id):
		"""Delete a notification (admin only)"""
		try:
			result = db.delete_admin_notification(notification_id)
			if result:
				return jsonify({'success': True, 'message': 'Notification deleted successfully'})
			else:
				return jsonify({'error': 'Notification not found'}), 404
		except Exception as e:
			return jsonify({'error': str(e)}), 500

	@app.route('/api/admin/notifications/bulk-send', methods=['POST'])
	def admin_bulk_send_notifications():
		"""Send notifications to multiple users (admin only)"""
		try:
			data = request.get_json()
			if not data or not data.get('title') or not data.get('message'):
				return jsonify({'error': 'Title and message are required'}), 400
			user_id = request.current_user['user_id']
			recipients = data.get('recipients', [])
			if not recipients:
				return jsonify({'error': 'No recipients specified'}), 400
			notifications = db.create_bulk_notifications(
				title=data['title'],
				message=data['message'],
				sender_id=user_id,
				notification_type=data.get('type', 'general'),
				priority=data.get('priority', 'medium'),
				recipients=recipients,
				scheduled_for=data.get('scheduled_for')
			)
			if notifications:
				return jsonify({
					'success': True,
					'message': f'Successfully sent notifications to {len(recipients)} users',
					'notification_count': len(notifications)
				}), 201
			else:
				return jsonify({'error': 'Failed to send notifications'}), 500
		except Exception as e:
			return jsonify({'error': str(e)}), 500

	@app.route('/api/admin/notifications/templates', methods=['GET'])
	def get_notification_templates():
		"""Get all notification templates"""
		try:
			templates = db.get_notification_templates()
			return jsonify({
				'success': True,
				'templates': templates,
				'count': len(templates)
			})
		except Exception as e:
			return jsonify({'error': str(e)}), 500

	@app.route('/api/admin/notifications/templates', methods=['POST'])
	def create_notification_template():
		"""Create a new notification template"""
		try:
			data = request.get_json()
			if not data or not data.get('name') or not data.get('title') or not data.get('message'):
				return jsonify({'error': 'Name, title, and message are required'}), 400
			template = db.create_notification_template(
				name=data['name'],
				title=data['title'],
				message=data['message'],
				notification_type=data.get('type', 'general'),
				priority=data.get('priority', 'medium'),
				variables=data.get('variables', []),
				created_by=request.current_user['user_id']
			)
			if template:
				return jsonify({
					'success': True,
					'template': template,
					'message': 'Template created successfully'
				}), 201
			else:
				return jsonify({'error': 'Failed to create template'}), 500
		except Exception as e:
			return jsonify({'error': str(e)}), 500

	@app.route('/api/admin/notifications/templates/<template_id>', methods=['PUT'])
	def update_notification_template(template_id):
		"""Update a notification template"""
		try:
			data = request.get_json()
			template = db.update_notification_template(template_id, data)
			if template:
				return jsonify({
					'success': True,
					'template': template,
					'message': 'Template updated successfully'
				})
			else:
				return jsonify({'error': 'Template not found'}), 404
		except Exception as e:
			return jsonify({'error': str(e)}), 500

	@app.route('/api/admin/notifications/templates/<template_id>', methods=['DELETE'])
	def delete_notification_template(template_id):
		"""Delete a notification template"""
		try:
			result = db.delete_notification_template(template_id)
			if result:
				return jsonify({
					'success': True,
					'message': 'Template deleted successfully'
				})
			else:
				return jsonify({'error': 'Template not found'}), 404
		except Exception as e:
			return jsonify({'error': str(e)}), 500

	@app.route('/api/admin/notifications/templates/<template_id>/send', methods=['POST'])
	def send_notification_from_template(template_id):
		"""Send notification using a template"""
		try:
			data = request.get_json()
			current_user = request.current_user
			template = db.get_notification_template(template_id)
			if not template:
				return jsonify({'error': 'Template not found'}), 404
			variables = data.get('variables', {})
			title = db.process_template_variables(template['title'], variables)
			message = db.process_template_variables(template['message'], variables)
			target = data.get('target', 'all')
			recipients = data.get('recipients', [])
			if target == 'specific' and not recipients:
				return jsonify({'error': 'Recipients required for specific target'}), 400
			notification_data = {
				'title': title,
				'message': message,
				'sender_id': current_user['user_id'],
				'target': target,
				'is_global': target == 'all',
				'type': template['type'],
				'priority': template['priority'],
				'scheduled_for': data.get('scheduled_for')
			}
			if target == 'specific':
				notifications = db.create_bulk_notifications(
					title=title,
					message=message,
					sender_id=current_user['user_id'],
					notification_type=template['type'],
					priority=template['priority'],
					recipients=recipients,
					scheduled_for=data.get('scheduled_for')
				)
			else:
				notifications = [db.create_notification(notification_data)]
			if notifications:
				return jsonify({
					'success': True,
					'message': f'Notification sent successfully using template "{template["name"]}"',
					'notification_count': len(notifications)
				}), 201
			else:
				return jsonify({'error': 'Failed to send notification'}), 500
		except Exception as e:
			app.logger.error(f"Error sending notification from template: {e}")
			return jsonify({'error': 'Internal server error'}), 500

	@app.route('/api/admin/notifications/stats', methods=['GET'])
	@wraps(app)
	def get_admin_notification_stats():
		"""Get notification statistics for admin dashboard"""
		try:
			stats = db.get_notification_statistics()
			return jsonify({
				'success': True,
				'stats': stats
			})
		except Exception as e:
			return jsonify({'error': str(e)}), 500

	@app.route('/api/admin/notifications/scheduled', methods=['GET'])
	@wraps(app)
	def get_scheduled_notifications():
		"""Get all scheduled notifications"""
		try:
			notifications = db.get_scheduled_notifications()
			return jsonify({
				'success': True,
				'notifications': notifications,
				'count': len(notifications)
			})
		except Exception as e:
			app.logger.error(f"Error getting scheduled notifications: {e}")
			return jsonify({'error': 'Internal server error'}), 500

	@app.route('/api/admin/notifications/scheduled/<notification_id>/cancel', methods=['DELETE'])
	@wraps(app)
	def cancel_scheduled_notification(notification_id):
		"""Cancel a scheduled notification"""
		try:
			success = db.cancel_scheduled_notification(notification_id)
			if success:
				return jsonify({
					'success': True,
					'message': 'Scheduled notification cancelled successfully'
				})
			else:
				return jsonify({'error': 'Notification not found or already sent'}), 404
		except Exception as e:
			app.logger.error(f"Error cancelling scheduled notification: {e}")
			return jsonify({'error': 'Internal server error'}), 500
