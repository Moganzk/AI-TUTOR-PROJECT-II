-- Add is_global column to notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT FALSE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target VARCHAR(50);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES users(id);

