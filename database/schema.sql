-- Supabase Database Schema for RoomEase


-- 1. Create Room Seekers Table
CREATE TABLE IF NOT EXISTS room_seekers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    suburb TEXT NOT NULL,
    min_budget NUMERIC NOT NULL,
    max_budget NUMERIC NOT NULL,
    room_type TEXT NOT NULL,
    move_in_date DATE NOT NULL,
    smoking_allowed BOOLEAN DEFAULT FALSE,
    pets_allowed BOOLEAN DEFAULT FALSE,
    lifestyle_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


ALTER TABLE room_seekers DISABLE ROW LEVEL SECURITY;

-- 2. Create Property Listings Table
CREATE TABLE IF NOT EXISTS property_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_name TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    suburb TEXT NOT NULL,
    room_type TEXT NOT NULL,
    weekly_rent NUMERIC NOT NULL,
    availability_date DATE NOT NULL,
    amenities TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE property_listings DISABLE ROW LEVEL SECURITY;

-- 3. Create Users Table for authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
