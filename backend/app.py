#!/usr/bin/env python3
"""
Organized AI Tutor Backend Application with Real-time Support
"""

from flask import Flask, jsonify, request, g
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
import logging
import os
from datetime import datetime
import asyncio
from threading import Thread

# Import configuration
from config import get_config

# Import services
from services.database import db_service
from services.ai_service import ai_service
from services.auth_service import auth_service
from services.realtime_service import RealtimeService

# Import routes
from routes.auth import auth_bp
from routes.users import users_bp
from routes.courses import courses_bp
from routes.assignments import assignments_bp
from routes.submissions import submissions_bp
from routes.notifications import notifications_bp
from routes.analytics import analytics_bp
from routes.ai_tutor import ai_tutor_bp
from routes.admin import admin_bp
from routes.staff import staff_bp
from routes.student import student_bp

# Import middleware
from middleware.auth import auth_middleware
from middleware.error_handler import error_handler
from middleware.rate_limiter import rate_limiter
from middleware.cors import cors_middleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('error.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Global realtime service
realtime_service = None

def create_app():
    """Create and configure Flask application with real-time support"""
    app = Flask(__name__)
    
    # Load configuration
    config = get_config()
    app.config.from_object(config)
    
    # Validate configuration
    try:
        config.validate_config()
        logger.info("Configuration validated successfully")
    except ValueError as e:
        logger.error(f"Configuration validation failed: {str(e)}")
        raise
    
    # Initialize extensions
    CORS(app, 
         origins=config.CORS_ORIGINS,
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
         supports_credentials=True)
    
    jwt = JWTManager(app)
    
    # Initialize SocketIO for real-time communication
    socketio = SocketIO(app, 
                       cors_allowed_origins=config.CORS_ORIGINS,
                       async_mode='threading',
                       logger=True,
                       engineio_logger=True)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(courses_bp, url_prefix='/api/courses')
    app.register_blueprint(assignments_bp, url_prefix='/api/assignments')
    app.register_blueprint(submissions_bp, url_prefix='/api/submissions')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(ai_tutor_bp, url_prefix='/api/tutor')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(staff_bp, url_prefix='/api/staff')
    app.register_blueprint(student_bp, url_prefix='/api/student')
    
    # Register middleware
    app.before_request(auth_middleware)
    app.register_error_handler(Exception, error_handler)
    
    # SocketIO event handlers
    @socketio.on('connect')
    def handle_connect():
        """Handle client connection"""
        try:
            token = request.args.get('token')
            if token:
                # Verify token and get user
                user = auth_service.verify_token(token)
                if user:
                    user_id = user['id']
                    join_room(f'user_{user_id}')
                    logger.info(f"User {user_id} connected to real-time service")
                    
                    # Send initial connection confirmation
                    emit('connected', {
                        'user_id': user_id,
                        'timestamp': datetime.utcnow().isoformat()
                    })
                else:
                    emit('error', {'message': 'Invalid token'})
                    return False
            else:
                emit('error', {'message': 'No token provided'})
                return False
        except Exception as e:
            logger.error(f"Connection error: {str(e)}")
            emit('error', {'message': 'Connection failed'})
            return False
    
    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle client disconnection"""
        logger.info("Client disconnected from real-time service")
    
    @socketio.on('join_course')
    def handle_join_course(data):
        """Join a course room for real-time updates"""
        try:
            course_id = data.get('course_id')
            if course_id:
                join_room(f'course_{course_id}')
                emit('joined_course', {'course_id': course_id})
                logger.info(f"User joined course room: {course_id}")
        except Exception as e:
            logger.error(f"Error joining course: {str(e)}")
    
    @socketio.on('leave_course')
    def handle_leave_course(data):
        """Leave a course room"""
        try:
            course_id = data.get('course_id')
            if course_id:
                leave_room(f'course_{course_id}')
                emit('left_course', {'course_id': course_id})
                logger.info(f"User left course room: {course_id}")
        except Exception as e:
            logger.error(f"Error leaving course: {str(e)}")
    
    @socketio.on('join_chat')
    def handle_join_chat(data):
        """Join a chat room"""
        try:
            chat_id = data.get('chat_id')
            if chat_id:
                join_room(f'chat_{chat_id}')
                emit('joined_chat', {'chat_id': chat_id})
                logger.info(f"User joined chat room: {chat_id}")
        except Exception as e:
            logger.error(f"Error joining chat: {str(e)}")
    
    @socketio.on('send_message')
    def handle_send_message(data):
        """Handle sending chat messages"""
        try:
            chat_id = data.get('chat_id')
            message = data.get('message')
            user_id = get_jwt_identity()
            
            if chat_id and message and user_id:
                # Save message to database
                message_data = {
                    'chat_id': chat_id,
                    'user_id': user_id,
                    'message': message,
                    'timestamp': datetime.utcnow().isoformat()
                }
                
                # Broadcast to all users in the chat room
                emit('new_message', message_data, room=f'chat_{chat_id}')
                logger.info(f"Message sent to chat {chat_id}")
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
    
    @socketio.on('subscribe_notifications')
    def handle_subscribe_notifications(data):
        """Subscribe to notifications for a user"""
        try:
            user_id = get_jwt_identity()
            if user_id:
                join_room(f'notifications_{user_id}')
                emit('subscribed_notifications', {'user_id': user_id})
                logger.info(f"User subscribed to notifications: {user_id}")
        except Exception as e:
            logger.error(f"Error subscribing to notifications: {str(e)}")
    
    # Real-time event emitters
    def emit_assignment_created(assignment_data):
        """Emit when a new assignment is created"""
        course_id = assignment_data.get('course_id')
        if course_id:
            socketio.emit('assignment_created', assignment_data, room=f'course_{course_id}')
    
    def emit_grade_updated(grade_data):
        """Emit when a grade is updated"""
        student_id = grade_data.get('student_id')
        if student_id:
            socketio.emit('grade_updated', grade_data, room=f'user_{student_id}')
    
    def emit_notification(notification_data):
        """Emit when a notification is created"""
        recipient_id = notification_data.get('recipient_id')
        if recipient_id:
            socketio.emit('new_notification', notification_data, room=f'notifications_{recipient_id}')
    
    def emit_submission_received(submission_data):
        """Emit when a submission is received"""
        course_id = submission_data.get('course_id')
        if course_id:
            socketio.emit('submission_received', submission_data, room=f'course_{course_id}')
    
    # Store emitters in app context
    app.emitters = {
        'assignment_created': emit_assignment_created,
        'grade_updated': emit_grade_updated,
        'notification': emit_notification,
        'submission_received': emit_submission_received
    }
    
    # Global error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': 'Endpoint not found',
            'message': 'The requested endpoint does not exist'
        }), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            'success': False,
            'error': 'Method not allowed',
            'message': 'The requested method is not allowed for this endpoint'
        }), 405
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {str(error)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        }), 500
    
    # Request logging
    @app.before_request
    def log_request_info():
        if request.endpoint != 'static':
            logger.info(f"{request.method} {request.path} from {request.remote_addr}")
    
    # Response logging
    @app.after_request
    def log_response_info(response):
        if request.endpoint != 'static':
            logger.info(f"Response {response.status_code} for {request.method} {request.path}")
        return response
    

    
    # Root endpoint
    @app.route('/', methods=['GET'])
    def root():
        return jsonify({
            'success': True,
            'message': 'AI Tutor Backend API with Real-time Support',
            'version': '2.0.0',
            'timestamp': datetime.utcnow().isoformat(),
            'features': {
                'realtime': True,
                'websockets': True,
                'supabase_realtime': True,
                'notifications': True,
                'live_updates': True
            },
            'endpoints': {
                'auth': '/api/auth/*',
                'ai_tutor': '/api/tutor/*',
                'system': '/api/health, /api/status, /api/profile',
                'admin': '/api/admin/*',
                'subjects': '/api/subjects/*',
                'courses': '/api/courses/*',
                'assignments': '/api/assignments/*',
                'submissions': '/api/submissions/*',
                'student': '/api/student/*',
                'staff': '/api/staff/*',
                'notifications': '/api/notifications/*',
                'analytics': '/api/analytics/*'
            },
            'realtime_endpoints': {
                'websocket': 'ws://localhost:5000/socket.io',
                'events': [
                    'assignment_created',
                    'grade_updated',
                    'notification_received',
                    'chat_message',
                    'submission_received',
                    'progress_updated'
                ]
            },
            'documentation': 'See README.md for API documentation'
        })
    
    # API root endpoint
    @app.route('/api', methods=['GET'])
    def api_root():
        return jsonify({
            'success': True,
            'message': 'AI Tutor API v2.0.0 with Real-time Support',
            'timestamp': datetime.utcnow().isoformat(),
            'realtime_enabled': True,
            'websocket_url': 'ws://localhost:5000/socket.io',
            'available_endpoints': {
                # ... (same as before but with realtime support)
            }
        })
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        try:
            # Check database
            db_health = db_service.health_check()
            
            # Check AI service
            ai_health = ai_service.health_check()
            
            return jsonify({
                'success': True,
                'timestamp': datetime.utcnow().isoformat(),
                'services': {
                    'database': db_health,
                    'ai_service': ai_health,
                    'realtime': {'status': 'healthy', 'connected_clients': len(socketio.server.eio.sockets) if hasattr(socketio.server, 'eio') else 0}
                }
            })
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    # Initialize services on startup
    with app.app_context():
        try:
            # Test database connection
            db_health = db_service.health_check()
            if db_health['status'] != 'healthy':
                logger.warning(f"Database connection issue: {db_health['message']}")
            else:
                logger.info("Database connection established")
            
            # Test AI service
            ai_health = ai_service.health_check()
            if ai_health['status'] != 'healthy':
                logger.warning(f"AI service issue: {ai_health['message']}")
            else:
                logger.info("AI service connection established")
            
            # Initialize realtime service
            global realtime_service
            realtime_service = RealtimeService()
            
            logger.info("All services initialized successfully")
            
        except Exception as e:
            logger.error(f"Service initialization failed: {str(e)}")
    
    return app, socketio

def main():
    """Main application entry point"""
    try:
        # Create Flask app
        app, socketio = create_app()
        config = get_config()
        
        logger.info("Starting AI Tutor Backend Server with Real-time Support...")
        logger.info(f"Environment: {'Development' if config.DEBUG else 'Production'}")
        logger.info(f"Host: {config.HOST}")
        logger.info(f"Port: {config.PORT}")
        logger.info(f"Debug Mode: {config.DEBUG}")
        logger.info(f"Real-time Support: Enabled")
        
        # Run the application with SocketIO
        socketio.run(
            app,
            host=config.HOST,
            port=config.PORT,
            debug=config.DEBUG,
            allow_unsafe_werkzeug=True
        )
        
    except KeyboardInterrupt:
        logger.info("Server shutdown requested by user")
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        raise

if __name__ == '__main__':
    main()
