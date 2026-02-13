-- Migration 003: Add source_url and post_url for showcase links
-- Each showcase can have: live URL, source code URL, and blog post URL

ALTER TABLE marketplace_showcases ADD COLUMN IF NOT EXISTS source_url TEXT NOT NULL DEFAULT '';
ALTER TABLE marketplace_showcases ADD COLUMN IF NOT EXISTS post_url TEXT NOT NULL DEFAULT '';
