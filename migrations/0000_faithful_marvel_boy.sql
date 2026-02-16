CREATE TABLE "activity_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"activity_type" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "archived_admin_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_type" text NOT NULL,
	"original_id" varchar NOT NULL,
	"item_data" jsonb NOT NULL,
	"archived_at" timestamp DEFAULT now(),
	"archived_by" varchar
);
--> statement-breakpoint
CREATE TABLE "auth_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "auth_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "coaching_checkins" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"mood" text,
	"energy_level" integer,
	"sleep_hours" integer,
	"water_glasses" integer DEFAULT 0,
	"workout_completed" boolean DEFAULT false,
	"workout_notes" text,
	"meals_logged" jsonb,
	"weight" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coaching_clients" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"coaching_type" text DEFAULT 'pregnancy_coaching',
	"status" text DEFAULT 'enrolled',
	"form_data" jsonb,
	"health_notes" text,
	"ai_summary" text,
	"purchase_date" timestamp,
	"form_submission_date" timestamp,
	"start_date" timestamp,
	"end_date" timestamp,
	"plan_duration_weeks" integer DEFAULT 4,
	"payment_amount" integer,
	"payment_status" text DEFAULT 'pending',
	"payment_id" text,
	"credentials_sent_at" timestamp,
	"thank_you_sent_at" timestamp,
	"is_pregnant" boolean DEFAULT false,
	"trimester" integer,
	"due_date" timestamp,
	"pregnancy_notes" text,
	"notes" text,
	"coach_remarks" jsonb,
	"weekly_plan_outlines" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coaching_form_responses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar NOT NULL,
	"form_type" text NOT NULL,
	"responses" jsonb NOT NULL,
	"submitted_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coaching_nutrition_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar NOT NULL,
	"meal_type" text NOT NULL,
	"options" jsonb NOT NULL,
	"tips" text,
	"supplements" jsonb,
	"is_approved" boolean DEFAULT false,
	"is_ai_generated" boolean DEFAULT false,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coaching_tips" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"is_ai_generated" boolean DEFAULT false,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coaching_workout_completions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"plan_id" varchar NOT NULL,
	"week_number" integer NOT NULL,
	"day_number" integer NOT NULL,
	"section_index" integer NOT NULL,
	"exercise_index" integer NOT NULL,
	"exercise_name" text NOT NULL,
	"completed" boolean DEFAULT false,
	"skipped" boolean DEFAULT false,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coaching_workout_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar NOT NULL,
	"week_number" integer NOT NULL,
	"day_number" integer NOT NULL,
	"day_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"exercises" jsonb,
	"coach_notes" text,
	"is_approved" boolean DEFAULT false,
	"is_ai_generated" boolean DEFAULT false,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "communications_log" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel" text NOT NULL,
	"direction" text DEFAULT 'outgoing' NOT NULL,
	"provider" text NOT NULL,
	"recipient_email" text,
	"recipient_phone" text,
	"recipient_name" text,
	"user_id" varchar,
	"subject" text,
	"content_preview" text,
	"message_type" text,
	"status" text DEFAULT 'sent' NOT NULL,
	"message_id" text,
	"error_message" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"image_urls" text[],
	"cloudinary_public_ids" text[],
	"week_number" integer,
	"category" text DEFAULT 'general' NOT NULL,
	"featured" boolean DEFAULT false,
	"is_reported" boolean DEFAULT false,
	"is_sensitive_content" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" varchar NOT NULL,
	"title" text NOT NULL,
	"content_type" text NOT NULL,
	"content" text,
	"video_url" text,
	"video_thumbnail_url" text,
	"pdf_url" text,
	"structured_workout_id" varchar,
	"duration" text,
	"order_index" integer DEFAULT 0,
	"is_visible" boolean DEFAULT true,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_enrollments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"course_id" varchar NOT NULL,
	"enrolled_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"status" text DEFAULT 'active',
	"completed_at" timestamp,
	"progress_percentage" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "course_module_mappings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar NOT NULL,
	"module_id" varchar NOT NULL,
	"order_index" integer DEFAULT 0,
	"is_required" boolean DEFAULT false,
	"is_visible" boolean DEFAULT true,
	"custom_name" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_modules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"module_type" text NOT NULL,
	"icon_name" text,
	"color_theme" text DEFAULT 'pink',
	"is_reusable" boolean DEFAULT true,
	"is_visible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "course_modules_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"short_description" text,
	"image_url" text,
	"thumbnail_url" text,
	"level" text DEFAULT 'beginner',
	"duration_weeks" integer,
	"price" integer DEFAULT 0,
	"status" text DEFAULT 'draft',
	"is_visible" boolean DEFAULT false,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "daily_checkins" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"workout_completed" boolean DEFAULT false,
	"breathing_practice" boolean DEFAULT false,
	"water_glasses" integer DEFAULT 0,
	"cardio_minutes" integer DEFAULT 0,
	"gratitude" text,
	"struggles" text,
	"mood" text,
	"energy_level" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "direct_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_id" varchar NOT NULL,
	"receiver_id" varchar NOT NULL,
	"client_id" varchar NOT NULL,
	"content" text NOT NULL,
	"message_type" text DEFAULT 'text',
	"metadata" jsonb,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "educational_topics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"order_num" integer NOT NULL,
	"title" text NOT NULL,
	"video_url" text,
	"video_label" text,
	"image_key" text,
	"content_blocks" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "educational_topics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "email_automation_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trigger_type" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"template_id" varchar NOT NULL,
	"subject" text NOT NULL,
	"html_content" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"config" jsonb NOT NULL,
	"total_sent" integer DEFAULT 0,
	"last_triggered_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "email_automation_rules_trigger_type_unique" UNIQUE("trigger_type")
);
--> statement-breakpoint
CREATE TABLE "email_campaign_recipients" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"email" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"error_message" text,
	"message_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_campaigns" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" varchar NOT NULL,
	"automation_rule_id" varchar,
	"name" text NOT NULL,
	"template_type" text NOT NULL,
	"subject" text NOT NULL,
	"html_content" text NOT NULL,
	"audience_filter" jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"scheduled_for" timestamp,
	"sent_at" timestamp,
	"recipient_count" integer DEFAULT 0,
	"sent_count" integer DEFAULT 0,
	"failed_count" integer DEFAULT 0,
	"open_count" integer DEFAULT 0,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_opens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"recipient_id" varchar NOT NULL,
	"opened_at" timestamp DEFAULT now(),
	"ip_address" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"subject" text NOT NULL,
	"html_content" text NOT NULL,
	"variables" text[] NOT NULL,
	"last_sent_at" timestamp,
	"total_sends" integer DEFAULT 0,
	"total_opens" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "email_templates_type_unique" UNIQUE("type")
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"display_id" text,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"video_url" text NOT NULL,
	"duration" text,
	"instructions" text,
	"category" text NOT NULL,
	"difficulty" text DEFAULT 'beginner',
	"order_index" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "knowledge_articles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" varchar NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" text NOT NULL,
	"video_url" text,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "magic_links" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"is_used" boolean DEFAULT false,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "magic_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "member_programs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"program_id" varchar NOT NULL,
	"purchase_date" timestamp DEFAULT now(),
	"expiry_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true,
	"progress" integer DEFAULT 0,
	"completion_percentage" integer DEFAULT 0,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "module_sections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"order_index" integer DEFAULT 0,
	"is_visible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "password_reset_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"code" text NOT NULL,
	"is_verified" boolean DEFAULT false,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"source" text DEFAULT 'shopify' NOT NULL,
	"transaction_id" text,
	"order_id" text,
	"product_name" text,
	"product_id" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'INR',
	"status" text DEFAULT 'completed',
	"payment_method" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "post_comments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"post_id" varchar NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "post_likes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"post_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "program_purchases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"program_id" varchar NOT NULL,
	"purchase_date" timestamp DEFAULT now(),
	"amount" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"level" text NOT NULL,
	"duration" text NOT NULL,
	"equipment" text NOT NULL,
	"image_url" text NOT NULL,
	"price" integer NOT NULL,
	"workout_count" integer NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "progress_photos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"program_id" varchar,
	"photo_type" text NOT NULL,
	"file_url" text NOT NULL,
	"cloudinary_public_id" text,
	"file_size" integer,
	"width" integer,
	"height" integer,
	"notes" text,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "progress_tracking" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"program_id" varchar NOT NULL,
	"week" integer NOT NULL,
	"dr_gap_measurement" text,
	"core_connection_score" integer,
	"pelvic_floor_symptoms" text,
	"posture_back_discomfort" integer,
	"energy_level" integer,
	"notes" text,
	"recorded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reflection_notes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"program_id" varchar NOT NULL,
	"note_text" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "renewal_email_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"email_type" text NOT NULL,
	"sent_at" timestamp DEFAULT now(),
	"sent_by" varchar,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "saved_workouts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"workout_id" varchar NOT NULL,
	"saved_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shopify_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shopify_order_id" text NOT NULL,
	"order_number" text,
	"customer_email" text,
	"customer_first_name" text,
	"customer_last_name" text,
	"customer_phone" text,
	"product_title" text,
	"variant_title" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'INR',
	"payment_status" text DEFAULT 'paid',
	"financial_status" text,
	"fulfillment_status" text,
	"processing_status" text DEFAULT 'pending',
	"processing_result" text,
	"user_id" varchar,
	"course_enrolled" text,
	"whatsapp_enabled" boolean DEFAULT false,
	"email_sent" boolean DEFAULT false,
	"raw_payload" jsonb,
	"billing_address" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "skipped_weeks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"week" integer NOT NULL,
	"skipped_at" timestamp DEFAULT now(),
	"workouts_completed_before_skip" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "structured_workouts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"workout_type" text DEFAULT 'strength' NOT NULL,
	"total_duration" text,
	"rounds" integer DEFAULT 1,
	"rest_between_rounds" integer DEFAULT 60,
	"rest_between_exercises" integer DEFAULT 30,
	"difficulty" text DEFAULT 'beginner',
	"equipment_needed" text[],
	"coach_notes" text,
	"is_visible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "terms" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"version" text NOT NULL,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_checkins" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"mood" text,
	"energy_level" integer,
	"goals" text[],
	"postpartum_weeks_at_checkin" integer,
	"notes" text,
	"is_partial" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_content_completion" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"content_item_id" varchar NOT NULL,
	"completed_at" timestamp DEFAULT now(),
	"time_spent" integer
);
--> statement-breakpoint
CREATE TABLE "user_module_progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"module_id" varchar NOT NULL,
	"course_id" varchar NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"progress_percentage" integer DEFAULT 0,
	"last_accessed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text,
	"profile_picture_url" text,
	"profile_picture_thumbnail_url" text,
	"is_admin" boolean DEFAULT false,
	"terms_accepted" boolean DEFAULT false,
	"terms_accepted_at" timestamp,
	"disclaimer_accepted" boolean DEFAULT false,
	"disclaimer_accepted_at" timestamp,
	"valid_from" timestamp DEFAULT now(),
	"valid_until" timestamp DEFAULT now() + interval '1 year',
	"has_whatsapp_support" boolean DEFAULT false,
	"whatsapp_support_duration" integer,
	"whatsapp_support_expiry_date" timestamp,
	"whatsapp_reminders_sent" text[],
	"country" text,
	"bio" text,
	"instagram_handle" text,
	"postpartum_weeks" integer,
	"delivery_date" timestamp,
	"goals" text[],
	"last_login_at" timestamp,
	"login_count" integer DEFAULT 0,
	"last_checkin_prompt_at" timestamp,
	"has_completed_onboarding" boolean DEFAULT false,
	"has_seen_first_workout_welcome" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "weekly_workout_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"week" integer NOT NULL,
	"session_type" text NOT NULL,
	"session_number" integer NOT NULL,
	"completed_at" timestamp DEFAULT now(),
	"rating" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "weekly_workouts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" varchar NOT NULL,
	"week" integer NOT NULL,
	"day" integer NOT NULL,
	"exercise_id" varchar NOT NULL,
	"order_index" integer DEFAULT 0,
	"is_optional" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "whatsapp_membership_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"user_name" text NOT NULL,
	"user_email" text NOT NULL,
	"action_type" text NOT NULL,
	"previous_expiry_date" timestamp,
	"new_expiry_date" timestamp,
	"extension_months" integer,
	"notes" text,
	"performed_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "whatsapp_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"request_type" text NOT NULL,
	"payment_id" text,
	"amount" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp,
	"completed_by" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workout_completions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"workout_id" varchar NOT NULL,
	"completed_at" timestamp DEFAULT now(),
	"challenge_rating" integer,
	"notes" text,
	"photo_url" text,
	"duration" integer,
	"mood" text
);
--> statement-breakpoint
CREATE TABLE "workout_content_exercises" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_content_id" varchar NOT NULL,
	"section_type" text NOT NULL,
	"order_num" integer NOT NULL,
	"name" text NOT NULL,
	"reps" text NOT NULL,
	"url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workout_exercise_links" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_id" varchar NOT NULL,
	"exercise_id" varchar NOT NULL,
	"order_index" integer DEFAULT 0,
	"reps" text,
	"sets" integer DEFAULT 1,
	"duration" text,
	"rest_after" integer DEFAULT 30,
	"side_specific" boolean DEFAULT false,
	"coach_notes" text,
	"video_url_override" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workout_program_content" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week" integer NOT NULL,
	"program_number" integer NOT NULL,
	"title" text NOT NULL,
	"subtitle" text NOT NULL,
	"schedule" text NOT NULL,
	"schedule_detail" text NOT NULL,
	"equipment" jsonb NOT NULL,
	"coach_note" text NOT NULL,
	"coach_note_color_class" text NOT NULL,
	"part1_title" text NOT NULL,
	"part2_playlist_url" text,
	"color_scheme" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "workout_program_content_week_unique" UNIQUE("week")
);
--> statement-breakpoint
CREATE TABLE "workout_section_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_key" text NOT NULL,
	"play_all_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "workout_section_settings_section_key_unique" UNIQUE("section_key")
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"duration" text NOT NULL,
	"day" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_programs" ADD CONSTRAINT "member_programs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_programs" ADD CONSTRAINT "member_programs_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_completions" ADD CONSTRAINT "workout_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_completions" ADD CONSTRAINT "workout_completions_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auth_tokens_token_idx" ON "auth_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "coaching_checkins_client_id_idx" ON "coaching_checkins" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "coaching_checkins_user_id_idx" ON "coaching_checkins" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "coaching_clients_user_id_idx" ON "coaching_clients" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "coaching_clients_status_idx" ON "coaching_clients" USING btree ("status");--> statement-breakpoint
CREATE INDEX "community_posts_user_id_idx" ON "community_posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "daily_checkins_user_id_idx" ON "daily_checkins" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "direct_messages_client_id_idx" ON "direct_messages" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "direct_messages_sender_id_idx" ON "direct_messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "member_programs_user_id_idx" ON "member_programs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "member_programs_program_id_idx" ON "member_programs" USING btree ("program_id");--> statement-breakpoint
CREATE INDEX "post_comments_post_id_idx" ON "post_comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_likes_post_id_idx" ON "post_likes" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "user_checkins_user_id_idx" ON "user_checkins" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workout_completions_user_id_idx" ON "workout_completions" USING btree ("user_id");