#!/usr/bin/env python3
"""
Backend Organization Script for AI Tutor Project
This script helps organize the backend structure and implement real-time functionality
"""

import os
import shutil
from pathlib import Path

def organize_backend():
    """Organize the backend structure"""
    
    # Create new organized directory structure
    directories = [
        'backend/organized',
        'backend/organized/models',
        'backend/organized/services',
        'backend/organized/routes',
        'backend/organized/utils',
        'backend/organized/config',
        'backend/organized/middleware',
        'backend/organized/tests',
        'backend/organized/migrations',
        'backend/organized/static',
        'backend/organized/templates'
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
    
    # Move and organize files
    file_mapping = {
        # Models
        'backend/database.py': 'backend/organized/models/database.py',
        'backend/user_management.py': 'backend/organized/models/user.py',
        'backend/LMS/users.py': 'backend/organized/models/lms_user.py',
        'backend/LMS/course.py': 'backend/organized/models/course.py',
        'backend/LMS/assignments.py': 'backend/organized/models/assignment.py',
        
        # Services
        'backend/services/database.py': 'backend/organized/services/database.py',
        'backend/services/ai_service.py': 'backend/organized/services/ai_service.py',
        'backend/services/analytics_service.py': 'backend/organized/services/analytics_service.py',
        'backend/services/auth_service.py': 'backend/organized/services/auth_service.py',
        
        # Routes
        'backend/routes/auth.py': 'backend/organized/routes/auth.py',
        'backend/routes/courses.py': 'backend/organized/routes/courses.py',
        'backend/routes/assignments.py': 'backend/organized/routes/assignments.py',
        
        # Config
        'backend/config.py': 'backend/organized/config/config.py',
        
        # Middleware
        'backend/middleware.py': 'backend/organized/middleware/middleware.py',
        
        # Utils
        'backend/utils.py': 'backend/organized/utils/utils.py',
        
        # Tests
        'backend/tests/test_api.py': 'backend/organized/tests/test_api.py',
        
        # Static files
        'backend/static/css': 'backend/organized/static/css',
        'backend/static/js': 'backend/organized/static/js',
        
        # Templates
        'backend/templates/monitor.html': 'backend/organized/templates/monitor.html'
    }
    
    # Move files to new structure
    for old_path, new_path in file_mapping.items():
        if os.path.exists(old_path):
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(new_path), exist_ok=True)
            # Move file
            shutil.move(old_path, new_path)
    
    print("Backend organization completed successfully!")

if __name__ == "__main__":
    organize_backend()
