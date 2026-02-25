-- RLS Policies for VisioCar Authentication
-- Run this in Supabase SQL Editor

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Policy: Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Policy: Users can insert their own profile (on signup)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- ============================================
-- GARAGES TABLE POLICIES
-- ============================================

ALTER TABLE garages ENABLE ROW LEVEL SECURITY;

-- Policy: Garage members can view their garage
DROP POLICY IF EXISTS "Garage members can view" ON garages;
CREATE POLICY "Garage members can view"
    ON garages FOR SELECT
    TO authenticated
    USING (
        owner_id = auth.uid() OR
        id IN (
            SELECT garage_id FROM garage_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- ============================================
-- GARAGE_MEMBERS TABLE POLICIES
-- ============================================

ALTER TABLE garage_members ENABLE ROW LEVEL SECURITY;

-- Policy: Members can view their garage members
DROP POLICY IF EXISTS "Members can view" ON garage_members;
CREATE POLICY "Members can view"
    ON garage_members FOR SELECT
    TO authenticated
    USING (
        garage_id IN (
            SELECT garage_id FROM garage_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- ============================================
-- CLAIMS TABLE POLICIES
-- ============================================

ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Policy: Garage members can view claims
DROP POLICY IF EXISTS "Members can view claims" ON claims;
CREATE POLICY "Members can view claims"
    ON claims FOR SELECT
    TO authenticated
    USING (
        garage_id IN (
            SELECT garage_id FROM garage_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Policy: Garage members can create claims
DROP POLICY IF EXISTS "Members can create claims" ON claims;
CREATE POLICY "Members can create claims"
    ON claims FOR INSERT
    TO authenticated
    WITH CHECK (
        garage_id IN (
            SELECT garage_id FROM garage_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- ============================================
-- ENABLE EMAIL/PASSWORD PROVIDER
-- ============================================
-- Go to Supabase Dashboard → Authentication → Providers → Email
-- Enable "Email" provider
-- Set "Confirm email" to OFF (or ON if you want email verification)

-- ============================================
-- ENABLE GOOGLE OAUTH (Optional)
-- ============================================
-- Go to Supabase Dashboard → Authentication → Providers → Google
-- Enable Google provider
-- Add your Google Client ID and Secret
-- Add redirect URL: https://YOUR_PROJECT.supabase.co/auth/v1/callback