-- Migration: Add Wellness Blueprint fields to coaching_clients
-- Run this in Replit shell: psql $DATABASE_URL -f add-wellness-blueprint-fields.sql

ALTER TABLE coaching_clients
ADD COLUMN IF NOT EXISTS wellness_blueprint JSONB,
ADD COLUMN IF NOT EXISTS blueprint_generated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS blueprint_approved BOOLEAN DEFAULT FALSE;
