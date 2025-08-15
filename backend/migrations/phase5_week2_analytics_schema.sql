-- Phase 5 Week 2: Advanced Analytics Database Schema
-- File: backend/migrations/phase5_week2_analytics_schema.sql

-- User interaction tracking table
CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'page_view', 'click', 'form_submit', 'download', 'search', 
        'lesson_start', 'lesson_complete', 'assignment_start', 
        'assignment_submit', 'chat_message', 'ai_interaction'
    )),
    resource_type TEXT NOT NULL CHECK (resource_type IN (
        'course', 'lesson', 'assignment', 'quiz', 'discussion', 
        'ai_tutor', 'dashboard', 'profile', 'settings'
    )),
    resource_id UUID,
    session_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_seconds INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning progress tracking table
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    time_spent_minutes INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    performance_score DECIMAL(5,2) DEFAULT 0.00,
    streak_days INTEGER DEFAULT 0,
    achievements JSONB DEFAULT '[]',
    difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL CHECK (metric_type IN (
        'quiz_score', 'assignment_score', 'participation_rate', 
        'completion_rate', 'response_time', 'accuracy_rate',
        'improvement_rate', 'engagement_score'
    )),
    metric_value DECIMAL(10,2) NOT NULL,
    measurement_date DATE DEFAULT CURRENT_DATE,
    context JSONB DEFAULT '{}',
    course_id UUID REFERENCES courses(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning paths analytics table
CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recommended_sequence JSONB NOT NULL DEFAULT '[]',
    current_position INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    predicted_completion_date DATE,
    difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    ai_confidence_score DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics aggregations table for faster queries
CREATE TABLE IF NOT EXISTS analytics_aggregations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregation_type TEXT NOT NULL CHECK (aggregation_type IN (
        'daily_active_users', 'course_completion_rates', 'avg_session_duration',
        'popular_content', 'performance_trends', 'engagement_metrics'
    )),
    date_period DATE NOT NULL,
    aggregated_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study sessions tracking
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    total_duration_minutes INTEGER DEFAULT 0,
    activities_count INTEGER DEFAULT 0,
    courses_accessed JSONB DEFAULT '[]',
    performance_summary JSONB DEFAULT '{}',
    session_quality_score DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON user_interactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_action_type ON user_interactions(action_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_resource_type ON user_interactions(resource_type);

CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_course_id ON learning_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_last_activity ON learning_progress(last_activity DESC);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_date ON performance_metrics(measurement_date DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type);

CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_updated ON learning_paths(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_aggregations_type_date ON analytics_aggregations(aggregation_type, date_period DESC);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_start ON study_sessions(session_start DESC);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_learning_progress_updated_at 
    BEFORE UPDATE ON learning_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at 
    BEFORE UPDATE ON learning_paths 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample analytics data for testing
INSERT INTO analytics_aggregations (aggregation_type, date_period, aggregated_data) VALUES
('daily_active_users', CURRENT_DATE, '{"count": 5, "growth_rate": 25.5}'),
('course_completion_rates', CURRENT_DATE, '{"average_rate": 78.5, "courses": [{"id": "course1", "rate": 85.2}]}'),
('avg_session_duration', CURRENT_DATE, '{"duration_minutes": 45.3, "trend": "increasing"}');

-- Add some sample interaction data
DO $$ 
DECLARE 
    sample_user_id UUID;
BEGIN 
    SELECT id INTO sample_user_id FROM users LIMIT 1;
    
    IF sample_user_id IS NOT NULL THEN
        INSERT INTO user_interactions (user_id, action_type, resource_type, resource_id, duration_seconds, metadata) VALUES
        (sample_user_id, 'page_view', 'dashboard', NULL, 120, '{"page": "main_dashboard"}'),
        (sample_user_id, 'lesson_start', 'lesson', NULL, 300, '{"lesson_title": "Introduction to Python"}'),
        (sample_user_id, 'ai_interaction', 'ai_tutor', NULL, 180, '{"query": "Explain variables", "response_length": 250}');
    END IF;
END $$;
