-- Database fixes for AI Tutor Project notification system
-- Apply these fixes to resolve notification delivery issues

-- Fix 1: Create notification_user_actions table for comprehensive user notification management
-- This table tracks all user actions: read, archived, deleted status for each notification
CREATE TABLE IF NOT EXISTS notification_user_actions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id uuid REFERENCES notifications(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    is_archived boolean DEFAULT false,
    archived_at timestamp with time zone,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(notification_id, user_id)
);

-- Create legacy notification_dismissals table for backward compatibility
CREATE TABLE IF NOT EXISTS notification_dismissals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id uuid REFERENCES notifications(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    dismissed_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(notification_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_user_actions_user_id ON notification_user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_user_actions_notification_id ON notification_user_actions(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_user_actions_read ON notification_user_actions(is_read);
CREATE INDEX IF NOT EXISTS idx_notification_user_actions_archived ON notification_user_actions(is_archived);
CREATE INDEX IF NOT EXISTS idx_notification_user_actions_deleted ON notification_user_actions(is_deleted);
CREATE INDEX IF NOT EXISTS idx_notification_user_actions_updated ON notification_user_actions(updated_at);

CREATE INDEX IF NOT EXISTS idx_notification_dismissals_user_id ON notification_dismissals(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_dismissals_notification_id ON notification_dismissals(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_dismissals_dismissed_at ON notification_dismissals(dismissed_at);

-- Fix 2: Ensure notifications table has all required columns
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS sender_id uuid REFERENCES users(id),
ADD COLUMN IF NOT EXISTS target varchar(50) DEFAULT 'all',
ADD COLUMN IF NOT EXISTS priority varchar(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS is_system boolean DEFAULT false;

-- Fix 3: Create notification_recipients table for targeted notifications
CREATE TABLE IF NOT EXISTS notification_recipients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id uuid REFERENCES notifications(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    delivered boolean DEFAULT false,
    delivered_at timestamp with time zone,
    read boolean DEFAULT false,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(notification_id, user_id)
);

-- Add indexes for notification_recipients
CREATE INDEX IF NOT EXISTS idx_notification_recipients_user_id ON notification_recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_notification_id ON notification_recipients(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_delivered ON notification_recipients(delivered);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_read ON notification_recipients(read);

-- Update RLS policies for new tables
ALTER TABLE notification_user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_dismissals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_recipients ENABLE ROW LEVEL SECURITY;

-- Use DROP POLICY IF EXISTS to handle potential existing policies
DO $$
BEGIN
    -- Drop existing policies if they exist to prevent conflicts
    BEGIN
        DROP POLICY IF EXISTS "Users can manage their own notification actions" ON notification_user_actions;
        DROP POLICY IF EXISTS "Users can see their own notification recipients" ON notification_recipients;
        DROP POLICY IF EXISTS "Admins can manage all notification recipients" ON notification_recipients;
    EXCEPTION WHEN OTHERS THEN
        -- Ignore any errors if policies don't exist
        RAISE NOTICE 'Some policies might not have existed';
    END;

    -- Recreate policies
    -- Policy for users to manage their own notification actions
    CREATE POLICY "Users can manage their own notification actions" ON notification_user_actions
        FOR ALL USING (auth.uid() = user_id);

    -- Policy for users to see their own notification recipients
    CREATE POLICY "Users can see their own notification recipients" ON notification_recipients
        FOR SELECT USING (auth.uid() = user_id);

    -- Policy for admins to manage all notification recipients
    CREATE POLICY "Admins can manage all notification recipients" ON notification_recipients
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM users 
                WHERE users.id = auth.uid() 
                AND users.role IN ('admin', 'staff')
            )
        );
END $$;

-- Grant permissions
GRANT ALL ON notification_user_actions TO authenticated;
GRANT ALL ON notification_dismissals TO authenticated;
GRANT ALL ON notification_recipients TO authenticated;

-- Function to automatically create notification_user_actions entries when notifications are created
CREATE OR REPLACE FUNCTION create_notification_user_actions()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert notification_user_actions for all target users
    IF NEW.target = 'all' OR NEW.target IS NULL THEN
        INSERT INTO notification_user_actions (notification_id, user_id)
        SELECT NEW.id, users.id FROM users
        ON CONFLICT (notification_id, user_id) DO NOTHING;
    ELSIF NEW.target = 'students' THEN
        INSERT INTO notification_user_actions (notification_id, user_id)
        SELECT NEW.id, users.id FROM users WHERE users.role = 'student'
        ON CONFLICT (notification_id, user_id) DO NOTHING;
    ELSIF NEW.target = 'staff' THEN
        INSERT INTO notification_user_actions (notification_id, user_id)
        SELECT NEW.id, users.id FROM users WHERE users.role IN ('staff', 'admin')
        ON CONFLICT (notification_id, user_id) DO NOTHING;
    ELSIF NEW.target = 'admin' THEN
        INSERT INTO notification_user_actions (notification_id, user_id)
        SELECT NEW.id, users.id FROM users WHERE users.role = 'admin'
        ON CONFLICT (notification_id, user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically populate notification_user_actions
DROP TRIGGER IF EXISTS trigger_create_notification_user_actions ON notifications;
CREATE TRIGGER trigger_create_notification_user_actions
    AFTER INSERT ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION create_notification_user_actions();

-- Verification queries (run these to confirm fixes worked)
-- SELECT count(*) as notification_dismissals_count FROM notification_dismissals;
-- SELECT count(*) as notification_recipients_count FROM notification_recipients;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'notifications' ORDER BY column_name;