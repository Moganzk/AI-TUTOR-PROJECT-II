#!/usr/bin/env python3
"""
Real-time Service for AI Tutor Platform
Handles WebSocket connections and Supabase Realtime subscriptions
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass
from enum import Enum
import threading

from supabase import create_client
from flask_socketio import SocketIO, emit, join_room, leave_room
from config import get_config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EventType(Enum):
    """Event types for real-time updates"""
    USER_JOINED = "user_joined"
    USER_LEFT = "user_left"
    ASSIGNMENT_CREATED = "assignment_created"
    ASSIGNMENT_UPDATED = "assignment_updated"
    GRADE_UPDATED = "grade_updated"
    NOTIFICATION_RECEIVED = "notification_received"
    CHAT_MESSAGE = "chat_message"
    COURSE_ENROLLMENT = "course_enrollment"
    SUBMISSION_RECEIVED = "submission_received"
    PROGRESS_UPDATED = "progress_updated"
    LESSON_UPDATED = "lesson_updated"
    COURSE_UPDATED = "course_updated"

@dataclass
class RealtimeEvent:
    """Structure for real-time events"""
    type: EventType
    data: Dict[str, Any]
    timestamp: datetime
    user_id: Optional[str] = None
    room: Optional[str] = None

class RealtimeService:
    """Centralized real-time service for handling WebSocket connections and Supabase Realtime"""
    
    def __init__(self, socketio: SocketIO):
        self.config = get_config()
        self.socketio = socketio
        self.connected_clients: Dict[str, Dict[str, Any]] = {}
        self.rooms: Dict[str, List[str]] = {}
        self.supabase_client = None
        self.subscriptions: Dict[str, Any] = {}
        self.callbacks: Dict[str, List[Callable]] = {}
        self._initialize_supabase()
        
    def _initialize_supabase(self):
        """Initialize Supabase client for realtime subscriptions"""
        try:
            self.supabase_client = create_client(
                self.config.SUPABASE_URL,
                self.config.SUPABASE_SERVICE_ROLE
            )
            logger.info("Supabase client initialized for realtime service")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {str(e)}")
            raise
    
    async def setup_realtime_subscriptions(self):
        """Set up Supabase Realtime subscriptions for live updates"""
        try:
            # Subscribe to users table changes
            await self._subscribe_to_table('users', self._handle_user_changes)
            
            # Subscribe to assignments table changes
            await self._subscribe_to_table('assignments', self._handle_assignment_changes)
            
            # Subscribe to submissions table changes
            await self._subscribe_to_table('assignment_submissions', self._handle_submission_changes)
            
            # Subscribe to grades table changes
            await self._subscribe_to_table('assignment_grades', self._handle_grade_changes)
            
            # Subscribe to notifications table changes
            await self._subscribe_to_table('notifications', self._handle_notification_changes)
            
            # Subscribe to course enrollments
            await self._subscribe_to_table('course_enrollments', self._handle_enrollment_changes)
            
            # Subscribe to chat messages
            await self._subscribe_to_table('messages', self._handle_chat_changes)
            
            # Subscribe to lessons
            await self._subscribe_to_table('lessons', self._handle_lesson_changes)
            
            # Subscribe to courses
            await self._subscribe_to_table('courses', self._handle_course_changes)
            
            logger.info("Realtime subscriptions set up successfully")
            
        except Exception as e:
            logger.error(f"Error setting up realtime subscriptions: {str(e)}")
    
    async def _subscribe_to_table(self, table_name: str, callback: Callable):
        """Subscribe to changes in a specific table"""
        try:
            subscription = self.supabase_client.realtime.subscribe(
                f"public:{table_name}",
                callback=callback
            )
            self.subscriptions[table_name] = subscription
            logger.info(f"Subscribed to {table_name} table changes")
        except Exception as e:
            logger.error(f"Error subscribing to {table_name}: {str(e)}")
    
    def _handle_user_changes(self, payload: Dict[str, Any]):
        """Handle changes to the users table"""
        try:
            event_type = payload.get('type')
            record = payload.get('record', {})
            old_record = payload.get('old_record', {})
            
            if event_type == 'INSERT':
                self._emit_event(EventType.USER_JOINED, {
                    'user': record,
                    'action': 'created'
                })
            elif event_type == 'UPDATE':
                self._emit_event(EventType.USER_JOINED, {
                    'user': record,
                    'old_user': old_record,
                    'action': 'updated'
                })
            elif event_type == 'DELETE':
                self._emit_event(EventType.USER_LEFT, {
                    'user': old_record,
                    'action': 'deleted'
                })
                
        except Exception as e:
            logger.error(f"Error handling user changes: {str(e)}")
    
    def _handle_assignment_changes(self, payload: Dict[str, Any]):
        """Handle changes to the assignments table"""
        try:
            event_type = payload.get('type')
            record = payload.get('record', {})
            
            if event_type == 'INSERT':
                self._emit_event(EventType.ASSIGNMENT_CREATED, {
                    'assignment': record,
                    'course_id': record.get('course_id')
                })
            elif event_type == 'UPDATE':
                self._emit_event(EventType.ASSIGNMENT_UPDATED, {
                    'assignment': record,
                    'course_id': record.get('course_id')
                })
                
        except Exception as e:
            logger.error(f"Error handling assignment changes: {str(e)}")
    
    def _handle_submission_changes(self, payload: Dict[str, Any]):
        """Handle changes to the assignment_submissions table"""
        try:
            event_type = payload.get('type')
            record = payload.get('record', {})
            
            if event_type == 'INSERT':
                self._emit_event(EventType.SUBMISSION_RECEIVED, {
                    'submission': record,
                    'assignment_id': record.get('assignment_id'),
                    'student_id': record.get('student_id')
                })
                
        except Exception as e:
            logger.error(f"Error handling submission changes: {str(e)}")
    
    def _handle_grade_changes(self, payload: Dict[str, Any]):
        """Handle changes to the assignment_grades table"""
        try:
            event_type = payload.get('type')
            record = payload.get('record', {})
            
            if event_type == 'INSERT' or event_type == 'UPDATE':
                self._emit_event(EventType.GRADE_UPDATED, {
                    'grade': record,
                    'submission_id': record.get('submission_id'),
                    'student_id': record.get('student_id')
                })
                
        except Exception as e:
            logger.error(f"Error handling grade changes: {str(e)}")
    
    def _handle_notification_changes(self, payload: Dict[str, Any]):
        """Handle changes to the notifications table"""
        try:
            event_type = payload.get('type')
            record = payload.get('record', {})
            
            if event_type == 'INSERT':
                self._emit_event(EventType.NOTIFICATION_RECEIVED, {
                    'notification': record,
                    'recipient_id': record.get('recipient_id')
                })
                
        except Exception as e:
            logger.error(f"Error handling notification changes: {str(e)}")
    
    def _handle_enrollment_changes(self, payload: Dict[str, Any]):
        """Handle changes to the course_enrollments table"""
        try:
            event_type = payload.get('type')
            record = payload.get('record', {})
            
            if event_type == 'INSERT':
                self._emit_event(EventType.COURSE_ENROLLMENT, {
                    'enrollment': record,
                    'course_id': record.get('course_id'),
                    'student_id': record.get('student_id')
                })
                
        except Exception as e:
            logger.error(f"Error handling enrollment changes: {str(e)}")
    
    def _handle_chat_changes(self, payload: Dict[str, Any]):
        """Handle changes to the messages table"""
        try:
            event_type = payload.get('type')
            record = payload.get('record', {})
            
            if event_type == 'INSERT':
                self._emit_event(EventType.CHAT_MESSAGE, {
                    'message': record,
                    'chat_id': record.get('chat_id'),
                    'user_id': record.get('user_id')
                })
                
        except Exception as e:
            logger.error(f"Error handling chat changes: {str(e)}")
    
    def _handle_lesson_changes(self, payload: Dict[str, Any]):
        """Handle changes to the lessons table"""
        try:
            event_type = payload.get('type')
            record = payload.get('record', {})
            
            self._emit_event(EventType.LESSON_UPDATED, {
                'lesson': record,
                'course_id': record.get('course_id'),
                'action': payload.get('type')
            })
                
        except Exception as e:
            logger.error(f"Error handling lesson changes: {str(e)}")
    
    def _handle_course_changes(self, payload: Dict[str, Any]):
        """Handle changes to the courses table"""
        try:
            event_type = payload.get('type')
            record = payload.get('record', {})
            
            self._emit_event(EventType.COURSE_UPDATED, {
                'course': record,
                'action': event_type
            })
                
        except Exception as e:
            logger.error(f"Error handling course changes: {str(e)}")
    
    def _emit_event(self, event_type: EventType, data: Dict[str, Any]):
        """Emit real-time event to appropriate rooms"""
        try:
            event_data = {
                'type': event_type.value,
                'data': data,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Determine which rooms to send the event to
            rooms = self._get_rooms_for_event(event_type, data)
            
            for room in rooms:
                self.socketio.emit(event_type.value, event_data, room=room)
                
            logger.info(f"Emitted event {event_type.value} to rooms: {rooms}")
            
        except Exception as e:
            logger.error(f"Error emitting event: {str(e)}")
    
    def _get_rooms_for_event(self, event_type: EventType, data: Dict[str, Any]) -> List[str]:
        """Determine which rooms should receive an event"""
        rooms = []
        
        if event_type == EventType.ASSIGNMENT_CREATED or event_type == EventType.ASSIGNMENT_UPDATED:
            course_id = data.get('course_id')
            if course_id:
                rooms.append(f'course_{course_id}')
                
        elif event_type == EventType.GRADE_UPDATED:
            student_id = data.get('student_id')
            if student_id:
                rooms.append(f'user_{student_id}')
                
        elif event_type == EventType.NOTIFICATION_RECEIVED:
            recipient_id = data.get('recipient_id')
            if recipient_id:
                rooms.append(f'notifications_{recipient_id}')
                
        elif event_type == EventType.CHAT_MESSAGE:
            chat_id = data.get('chat_id')
            if chat_id:
                rooms.append(f'chat_{chat_id}')
                
        elif event_type == EventType.SUBMISSION_RECEIVED:
            assignment_id = data.get('assignment_id')
            if assignment_id:
                # Get course ID from assignment
                assignment = db_service.get_assignment_by_id(assignment_id)
                if assignment and assignment.get('course_id'):
                    rooms.append(f'course_{assignment["course_id"]}')
                    
        elif event_type == EventType.COURSE_ENROLLMENT:
            course_id = data.get('course_id')
            student_id = data.get('student_id')
            if course_id:
                rooms.append(f'course_{course_id}')
            if student_id:
                rooms.append(f'user_{student_id}')
                
        elif event_type == EventType.LESSON_UPDATED:
            course_id = data.get('course_id')
            if course_id:
                rooms.append(f'course_{course_id}')
                
        elif event_type == EventType.COURSE_UPDATED:
            course = data.get('course')
            if course and course.get('id'):
                rooms.append(f'course_{course["id"]}')
                
        return rooms
    
    def register_callback(self, event_type: EventType, callback: Callable):
        """Register a callback for a specific event type"""
        if event_type.value not in self.callbacks:
            self.callbacks[event_type.value] = []
        self.callbacks[event_type.value].append(callback)
    
    def remove_callback(self, event_type: EventType, callback: Callable):
        """Remove a callback for a specific event type"""
        if event_type.value in self.callbacks:
            self.callbacks[event_type.value].remove(callback)
    
    def emit_to_user(self, user_id: str, event: str, data: Dict[str, Any]):
        """Emit an event to a specific user"""
        try:
            self.socketio.emit(event, data, room=f'user_{user_id}')
        except Exception as e:
            logger.error(f"Error emitting to user {user_id}: {str(e)}")
    
    def emit_to_course(self, course_id: str, event: str, data: Dict[str, Any]):
        """Emit an event to all users in a course"""
        try:
            self.socketio.emit(event, data, room=f'course_{course_id}')
        except Exception as e:
            logger.error(f"Error emitting to course {course_id}: {str(e)}")
    
    def emit_to_chat(self, chat_id: str, event: str, data: Dict[str, Any]):
        """Emit an event to all users in a chat"""
        try:
            self.socketio.emit(event, data, room=f'chat_{chat_id}')
        except Exception as e:
            logger.error(f"Error emitting to chat {chat_id}: {str(e)}")
    
    def emit_to_notifications(self, user_id: str, event: str, data: Dict[str, Any]):
        """Emit an event to a user's notification room"""
        try:
            self.socketio.emit(event, data, room=f'notifications_{user_id}')
        except Exception as e:
            logger.error(f"Error emitting to notifications for user {user_id}: {str(e)}")
    
    def broadcast(self, event: str, data: Dict[str, Any]):
        """Broadcast an event to all connected clients"""
        try:
            self.socketio.emit(event, data)
        except Exception as e:
            logger.error(f"Error broadcasting event: {str(e)}")
    
    def get_connected_users(self) -> List[Dict[str, Any]]:
        """Get list of currently connected users"""
        return list(self.connected_clients.values())
    
    def get_room_users(self, room: str) -> List[str]:
        """Get list of users in a specific room"""
        return self.rooms.get(room, [])
    
    def start_realtime_service(self):
        """Start the realtime service in a separate thread"""
        def run_realtime():
            asyncio.run(self.setup_realtime_subscriptions())
        
        thread = threading.Thread(target=run_realtime)
        thread.daemon = True
        thread.start()
        logger.info("Realtime service started")

# Global realtime service instance
realtime_service = None

def init_realtime_service(socketio: SocketIO):
    """Initialize the realtime service"""
    global realtime_service
    realtime_service = RealtimeService(socketio)
    return realtime_service
