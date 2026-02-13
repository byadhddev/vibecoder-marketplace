-- Migration 002: Add slug for clean project URLs (/m/username/slug)
-- Adds slug column with unique constraint per profile

ALTER TABLE marketplace_showcases ADD COLUMN IF NOT EXISTS slug TEXT NOT NULL DEFAULT '';
ALTER TABLE marketplace_showcases ADD CONSTRAINT marketplace_showcases_profile_slug_unique UNIQUE (profile_id, slug);
