-- Migration: Add weekNumber to CoachingNutritionPlan for weekly progression
-- This allows nutrition plans to be generated per week (not just once for entire program)

-- Add weekNumber column with default value of 1
ALTER TABLE "coaching_nutrition_plans"
ADD COLUMN IF NOT EXISTS "week_number" INTEGER NOT NULL DEFAULT 1;

-- Update existing records to Week 1 (if any exist without weekNumber)
UPDATE "coaching_nutrition_plans"
SET "week_number" = 1
WHERE "week_number" IS NULL;

-- Add index for efficient querying by client and week
CREATE INDEX IF NOT EXISTS "idx_nutrition_client_week"
ON "coaching_nutrition_plans"("client_id", "week_number");

-- Add comment explaining the column
COMMENT ON COLUMN "coaching_nutrition_plans"."week_number" IS 'Week number (1-4) for weekly nutrition progression aligned with training intensity';
