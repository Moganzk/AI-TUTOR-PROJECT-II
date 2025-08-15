-- Add status columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'active';

