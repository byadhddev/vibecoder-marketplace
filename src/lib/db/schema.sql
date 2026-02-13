-- ============================================================
-- VibeCoder Marketplace — Complete Schema (Fresh DB)
-- ============================================================
-- This file contains the FULL current schema. Use it to set up
-- a brand-new database from scratch in one go.
--
-- For incremental updates to an existing DB, run the individual
-- migration files in src/lib/db/migrations/ in order:
--   001_initial.sql
--   002_add_slug.sql
--   003_add_showcase_links.sql
--
-- IMPORTANT: Keep this file in sync whenever you add a migration.
-- ============================================================

-- Profiles: each registered user
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    avatar_url TEXT NOT NULL DEFAULT '',
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Showcases: each tile on a user's marketplace page
CREATE TABLE IF NOT EXISTS marketplace_showcases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    url TEXT NOT NULL,
    source_url TEXT NOT NULL DEFAULT '',
    post_url TEXT NOT NULL DEFAULT '',
    preview_image_url TEXT DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    col_span INT NOT NULL DEFAULT 2 CHECK (col_span IN (1, 2)),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
    sort_order INT NOT NULL DEFAULT 0,
    clicks_count INT NOT NULL DEFAULT 0,
    views_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(profile_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_showcases_profile_id ON marketplace_showcases(profile_id);
CREATE INDEX IF NOT EXISTS idx_showcases_status ON marketplace_showcases(status);

-- Click tracking
CREATE TABLE IF NOT EXISTS marketplace_showcase_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    showcase_id UUID NOT NULL REFERENCES marketplace_showcases(id) ON DELETE CASCADE,
    referrer TEXT DEFAULT '',
    user_agent TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clicks_showcase_id ON marketplace_showcase_clicks(showcase_id);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_showcases ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_showcase_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public can view published showcases" ON marketplace_showcases FOR SELECT USING (status = 'published');
CREATE POLICY "Service role full access on showcases" ON marketplace_showcases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on clicks" ON marketplace_showcase_clicks FOR ALL USING (true) WITH CHECK (true);
