-- Add approval fields for coach remarks and AI summary
ALTER TABLE coaching_clients
ADD COLUMN IF NOT EXISTS coach_remarks_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_summary_approved BOOLEAN DEFAULT FALSE;

-- Update existing records to mark AI summaries as approved if they exist
UPDATE coaching_clients
SET ai_summary_approved = TRUE
WHERE ai_summary IS NOT NULL AND ai_summary != '';

-- Update existing records to mark coach remarks as approved if they exist
UPDATE coaching_clients
SET coach_remarks_approved = TRUE
WHERE coach_remarks IS NOT NULL AND coach_remarks != '{}' AND coach_remarks != 'null';
