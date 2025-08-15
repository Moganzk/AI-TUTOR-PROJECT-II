"""
Database modules package initializer
"""

# Import the main database connection from the parent directory
import sys
import os

# Add the parent directory to the path to import the main database module
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

try:
    # Import from the main database.py file in the parent directory
    import database
    db = database.db
except ImportError as e:
    # Fallback for when database.py is not available
    print(f"Warning: Could not import main database module: {e}")
    db = None
