#!/usr/bin/env python3
"""
Run Phase 5 Week 2 Analytics Database Migration
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.database import DatabaseService

def run_analytics_migration():
    """Run the analytics database migration"""
    try:
        db = DatabaseService()
        
        # Read the migration file
        with open('migrations/phase5_week2_analytics_schema.sql', 'r') as f:
            sql = f.read()
        
        print("🚀 Starting Phase 5 Week 2 Analytics Migration...")
        
        # Since Supabase doesn't support multi-statement execution directly,
        # we'll execute each statement separately
        statements = sql.split(';')
        success_count = 0
        error_count = 0
        
        for i, stmt in enumerate(statements):
            stmt = stmt.strip()
            if stmt and not stmt.startswith('--'):
                try:
                    print(f"Executing statement {i+1}...")
                    
                    # Handle CREATE TABLE statements
                    if stmt.upper().startswith('CREATE TABLE'):
                        # Extract table name for better logging
                        table_name = stmt.split('(')[0].split()[-1]
                        print(f"  Creating table: {table_name}")
                    
                    # Execute using raw SQL
                    result = db.client.rpc('query', {'query': stmt}).execute()
                    success_count += 1
                    
                except Exception as e:
                    error_msg = str(e)
                    # Some errors are expected (like table already exists)
                    if 'already exists' in error_msg or 'duplicate' in error_msg.lower():
                        print(f"  ⚠️  Statement {i+1}: {error_msg} (Expected)")
                    else:
                        print(f"  ❌ Statement {i+1}: {error_msg}")
                        error_count += 1
        
        print(f"\n✅ Migration completed!")
        print(f"   Successful statements: {success_count}")
        print(f"   Errors encountered: {error_count}")
        
        # Test the new tables
        print("\n🔍 Testing new analytics tables...")
        test_tables = [
            'user_interactions',
            'learning_progress', 
            'performance_metrics',
            'learning_paths',
            'analytics_aggregations',
            'study_sessions'
        ]
        
        for table in test_tables:
            try:
                result = db.client.table(table).select('count').execute()
                print(f"  ✅ Table '{table}' is accessible")
            except Exception as e:
                print(f"  ❌ Table '{table}' error: {e}")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_analytics_migration()
