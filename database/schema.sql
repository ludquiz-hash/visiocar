-- VisioCar Database Schema
-- PostgreSQL schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTH (managed by Supabase Auth)
-- ============================================
-- Supabase Auth handles users table automatically
-- We add custom user data via profiles table

-- ============================================
-- PROFILES (extended user data)
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    active_garage_id UUID,
    active_garage_role TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- GARAGES
-- ============================================
CREATE TABLE garages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    company_name TEXT,
    company_address JSONB,
    company_phone TEXT,
    company_email TEXT,
    logo_url TEXT,
    show_logo_on_pdf BOOLEAN DEFAULT true,
    pdf_footer_note TEXT,
    country TEXT DEFAULT 'BE',
    owner_id UUID REFERENCES profiles(id),
    is_active BOOLEAN DEFAULT true,
    is_subscribed BOOLEAN DEFAULT false,
    plan_type TEXT DEFAULT 'starter' CHECK (plan_type IN ('starter', 'business')),
    subscription_status TEXT DEFAULT 'trialing',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_end TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '5 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE garages ENABLE ROW LEVEL SECURITY;

-- Garage policies
CREATE POLICY "Garages viewable by members"
    ON garages FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT garage_id FROM garage_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
        OR owner_id = auth.uid()
    );

CREATE POLICY "Garages updatable by owner or admin"
    ON garages FOR UPDATE
    TO authenticated
    USING (
        owner_id = auth.uid()
        OR id IN (
            SELECT garage_id FROM garage_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND is_active = true
        )
    );

-- ============================================
-- GARAGE MEMBERS (Team management)
-- ============================================
CREATE TABLE garage_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    user_email TEXT NOT NULL,
    user_name TEXT,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'staff')),
    is_active BOOLEAN DEFAULT true,
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(garage_id, user_email)
);

-- Enable RLS
ALTER TABLE garage_members ENABLE ROW LEVEL SECURITY;

-- Garage members policies
CREATE POLICY "Members viewable by garage members"
    ON garage_members FOR SELECT
    TO authenticated
    USING (
        garage_id IN (
            SELECT garage_id FROM garage_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
        OR user_id = auth.uid()
    );

CREATE POLICY "Members manageable by owner or admin"
    ON garage_members FOR ALL
    TO authenticated
    USING (
        garage_id IN (
            SELECT garage_id FROM garage_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND is_active = true
        )
    );

-- ============================================
-- CLAIMS (Dossiers sinistres)
-- ============================================
CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
    reference TEXT NOT NULL UNIQUE,
    
    -- Client data
    client_data JSONB DEFAULT '{}',
    
    -- Vehicle data
    vehicle_data JSONB DEFAULT '{}',
    
    -- Insurance details
    insurance_details JSONB DEFAULT '{}',
    
    -- AI Analysis
    ai_report JSONB DEFAULT '{}',
    
    -- Manual adjustments
    manual_adjustments JSONB DEFAULT '{}',
    
    -- Photos
    images JSONB DEFAULT '[]',
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'analyzing', 'review', 'completed', 'archived')),
    
    -- PDF
    pdf_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Created by
    created_by UUID REFERENCES profiles(id)
);

-- Enable RLS
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Claims policies
CREATE POLICY "Claims viewable by garage members"
    ON claims FOR SELECT
    TO authenticated
    USING (
        garage_id IN (
            SELECT garage_id FROM garage_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Claims manageable by garage members"
    ON claims FOR ALL
    TO authenticated
    USING (
        garage_id IN (
            SELECT garage_id FROM garage_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Index for performance
CREATE INDEX idx_claims_garage_id ON claims(garage_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_created_at ON claims(created_at DESC);

-- ============================================
-- CLAIM HISTORY
-- ============================================
CREATE TABLE claim_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    description TEXT,
    user_name TEXT,
    user_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE claim_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "History viewable by claim members"
    ON claim_history FOR SELECT
    TO authenticated
    USING (
        claim_id IN (
            SELECT c.id FROM claims c
            JOIN garage_members gm ON c.garage_id = gm.garage_id
            WHERE gm.user_id = auth.uid() AND gm.is_active = true
        )
    );

CREATE INDEX idx_claim_history_claim_id ON claim_history(claim_id);

-- ============================================
-- USAGE COUNTERS (for billing limits)
-- ============================================
CREATE TABLE usage_counters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    claims_created INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(garage_id, year, month)
);

-- Enable RLS
ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usage counters viewable by garage members"
    ON usage_counters FOR SELECT
    TO authenticated
    USING (
        garage_id IN (
            SELECT garage_id FROM garage_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Usage counters updatable by garage members"
    ON usage_counters FOR ALL
    TO authenticated
    USING (
        garage_id IN (
            SELECT garage_id FROM garage_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Create storage bucket for claim photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('claim-photos', 'claim-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for claim photos
CREATE POLICY "Allow public read access"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'claim-photos');

CREATE POLICY "Allow authenticated uploads"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'claim-photos');

CREATE POLICY "Allow authenticated delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'claim-photos');

-- Create storage bucket for garage logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('garage-logos', 'garage-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read logos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'garage-logos');

CREATE POLICY "Allow authenticated logo uploads"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'garage-logos');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to auto-generate claim reference
CREATE OR REPLACE FUNCTION generate_claim_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reference IS NULL THEN
        NEW.reference := 'CLM-' || TO_CHAR(NOW(), 'YYYY') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_claim_reference
    BEFORE INSERT ON claims
    FOR EACH ROW EXECUTE FUNCTION generate_claim_reference();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_garages_updated_at BEFORE UPDATE ON garages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON claims
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garage_members_updated_at BEFORE UPDATE ON garage_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_counters_updated_at BEFORE UPDATE ON usage_counters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
