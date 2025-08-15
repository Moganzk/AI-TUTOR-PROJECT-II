#!/usr/bin/env python3
"""
Simple test script to check if the backend can start without errors
"""

import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testing backend imports...")
    
    # Test config import
    from config import get_config
    print("✓ Config import successful")
    
    # Test database service import
    from services.database import db_service
    print("✓ Database service import successful")
    
    # Test route imports
    from routes.auth import auth_bp
    print("✓ Auth routes import successful")
    
    from routes.assignments import assignments_bp
    print("✓ Assignments routes import successful")
    
    # Test app creation
    from app import create_app
    print("✓ App creation function import successful")
    
    print("\n✅ All imports successful! Backend structure is intact.")
    print("📋 Next steps:")
    print("1. Set up environment variables in .env file")
    print("2. Configure Supabase database connection")
    print("3. Test actual app startup")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Some modules are missing or have issues.")
    
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    print("There may be syntax or configuration issues.")
