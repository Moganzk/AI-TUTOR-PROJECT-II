-- Insert test users for development
-- This script should be run in your Supabase SQL editor

-- Insert Admin user
INSERT INTO users (
    id,
    name,
    email,
    password,
    role,
    status,
    created_at,
    updated_at,
    avatar_url
) VALUES (
    '3dba0721-b5ea-46a3-aaaf-cc19f210d72e',
    'Admin Alice',
    'alicemwapo24@gmail.com',
    'jayden1.',
    'admin',
    'active',
    '2025-07-26T22:39:42.896598+00:00',
    now(),
    '/api/placeholder/40/40'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = now();

-- Insert Staff user
INSERT INTO users (
    id,
    name,
    email,
    password,
    role,
    status,
    created_at,
    updated_at,
    avatar_url
) VALUES (
    'user-staff-001',
    'Staff Morgan',
    'morganstyles50@gmail.com',
    'jayden1.',
    'staff',
    'active',
    '2025-07-26T22:40:00.000000+00:00',
    now(),
    '/api/placeholder/40/40'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = now();

-- Insert Student user
INSERT INTO users (
    id,
    name,
    email,
    password,
    role,
    status,
    created_at,
    updated_at,
    avatar_url
) VALUES (
    'user-student-001',
    'Student Sam',
    'sammokogoti77@gmail.com',
    'jayden1.',
    'student',
    'active',
    '2025-07-26T22:41:00.000000+00:00',
    now(),
    '/api/placeholder/40/40'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = now();
