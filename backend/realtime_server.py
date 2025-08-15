"""
Real-time Server for AI Tutor Platform
Implements WebSocket connections and Supabase Realtime subscriptions
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, Any

from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from supabase import create_client, Client

from config import get_config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

config = get_config()
supabase_client: Client = create_client(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE)

def handle_supabase_event(payload):
    """Callback function to handle Supabase Realtime events."""
    logger.info(f"Received Supabase event: {payload}")
    event = payload.get('eventType')
    table = payload.get('table')
    record = payload.get('new', {})

    room = f"{table}_{record.get('id')}" if record.get('id') else table
    socketio.emit(event, record, room=room)

@socketio.on('connect')
def handle_connect():
    """Handles a client connecting to the WebSocket server."""
    logger.info(f"Client connected: {request.sid}")
    emit('connection_response', {'message': 'Successfully connected to the server.'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handles a client disconnecting from the WebSocket server."""
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('join_room')
def handle_join_room(data):
    """Handles a client joining a room."""
    room = data.get('room')
    if room:
        join_room(room)
        logger.info(f"Client {request.sid} joined room: {room}")
        emit('room_joined', {'room': room})

@socketio.on('leave_room')
def handle_leave_room(data):
    """Handles a client leaving a room."""
    room = data.get('room')
    if room:
        leave_room(room)
        logger.info(f"Client {request.sid} left room: {room}")
        emit('room_left', {'room': room})

def start_supabase_listeners():
    """Starts the Supabase Realtime listeners."""
    try:
        logger.info("Starting Supabase Realtime listeners...")
        supabase_client.table("*").on("*", handle_supabase_event).subscribe()
        logger.info("Subscribed to all Supabase events.")
    except Exception as e:
        logger.error(f"Error starting Supabase listeners: {e}")

if __name__ == '__main__':
    start_supabase_listeners()
    socketio.run(app, host='0.0.0.0', port=5000)