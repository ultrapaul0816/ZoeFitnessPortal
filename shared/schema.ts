import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  profilePictureUrl: text("profile_picture_url"),
  profilePictureThumbnailUrl: text("profile_picture_thumbnail_url"),
  isAdmin: boolean("is_admin").default(false),
  termsAccepted: boolean("terms_accepted").default(false),
  termsAcceptedAt: timestamp("terms_accepted_at"),
  disclaimerAccepted: boolean("disclaimer_accepted").default(false),
  disclaimerAcceptedAt: timestamp("disclaimer_accepted_at"),
  validFrom: timestamp("valid_from").default(sql`now()`),
  validUntil: timestamp("valid_until").default(sql`now() + interval '1 year'`),
  hasWhatsAppSupport: boolean("has_whatsapp_support").default(false),
  whatsAppSupportDuration: integer("whatsapp_support_duration"),
  whatsAppSupportExpiryDate: timestamp("whatsapp_support_expiry_date"),
  country: text("country"),
  bio: text("bio"),
  instagramHandle: text("instagram_handle"),
  postpartumWeeks: integer("postpartum_weeks"),
  deliveryDate: timestamp("delivery_date"),
  lastLoginAt: timestamp("last_login_at"),
  loginCount: integer("login_count").default(0),
  lastCheckinPromptAt: timestamp("last_checkin_prompt_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const programs = pgTable("programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  level: text("level").notNull(), // beginner, intermediate, advanced
  duration: text("duration").notNull(), // "21 days", "1 month", etc.
  equipment: text("equipment").notNull(),
  imageUrl: text("image_url").notNull(),
  price: integer("price").notNull(),
  workoutCount: integer("workout_count").notNull(),
  isActive: boolean("is_active").notNull().default(false), // draft/active state
  isVisible: boolean("is_visible").notNull().default(true), // visibility to members
});

export const memberPrograms = pgTable("member_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  programId: varchar("program_id").notNull(),
  purchaseDate: timestamp("purchase_date").default(sql`now()`),
  expiryDate: timestamp("expiry_date").notNull(),
  isActive: boolean("is_active").default(true),
  progress: integer("progress").default(0), // completed workouts
  completionPercentage: integer("completion_percentage").default(0), // 0-100
  completedAt: timestamp("completed_at"), // when program was 100% completed
});

export const workouts = pgTable("workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  programId: varchar("program_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  duration: text("duration").notNull(),
  day: integer("day").notNull(), // day number in program
});

export const workoutCompletions = pgTable("workout_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  workoutId: varchar("workout_id").notNull(),
  completedAt: timestamp("completed_at").default(sql`now()`),
  challengeRating: integer("challenge_rating"), // 1-5 scale
  notes: text("notes"),
  photoUrl: text("photo_url"),
  duration: integer("duration"), // actual workout duration in minutes
  mood: text("mood"), // how they felt after
});

export const savedWorkouts = pgTable("saved_workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  workoutId: varchar("workout_id").notNull(),
  savedAt: timestamp("saved_at").default(sql`now()`),
});

export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  imageUrls: text("image_urls").array(), // Support multiple images (2-4)
  cloudinaryPublicIds: text("cloudinary_public_ids").array(), // Corresponding cloudinary IDs
  weekNumber: integer("week_number"), // 1-6 for Heal Your Core
  category: text("category").notNull().default("general"), // wins, realtalk, transformations, workoutselfies, momlife, general
  featured: boolean("featured").default(false),
  isReported: boolean("is_reported").default(false),
  isSensitiveContent: boolean("is_sensitive_content").default(false), // for blurred progress photos
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const postLikes = pgTable("post_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  postId: varchar("post_id").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const postComments = pgTable("post_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  postId: varchar("post_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const passwordResetCodes = pgTable("password_reset_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  code: text("code").notNull(),
  isVerified: boolean("is_verified").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const terms = pgTable("terms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  version: text("version").notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Program purchases for premium programs like Heal Your Core
export const programPurchases = pgTable("program_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  programId: varchar("program_id").notNull(),
  purchaseDate: timestamp("purchase_date").default(sql`now()`),
  amount: integer("amount").notNull(), // price in cents
  status: text("status").notNull().default("active"), // active, cancelled, expired
});

// Progress tracking for Heal Your Core program
export const progressTracking = pgTable("progress_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  programId: varchar("program_id").notNull(),
  week: integer("week").notNull(), // 1-6 for Heal Your Core
  drGapMeasurement: text("dr_gap_measurement"), // e.g., "2 fingers"
  coreConnectionScore: integer("core_connection_score"), // 1-10 scale
  pelvicFloorSymptoms: text("pelvic_floor_symptoms"),
  postureBackDiscomfort: integer("posture_back_discomfort"), // 1-10 scale
  energyLevel: integer("energy_level"), // 1-10 scale
  notes: text("notes"),
  recordedAt: timestamp("recorded_at").default(sql`now()`),
});

// Knowledge center articles
export const knowledgeArticles = pgTable("knowledge_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  programId: varchar("program_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // breathing, nutrition, core-understanding, etc.
  videoUrl: text("video_url"),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Exercise library for programs
export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  videoUrl: text("video_url").notNull(),
  duration: text("duration"), // e.g., "30 seconds", "10 reps"
  instructions: text("instructions"),
  category: text("category").notNull(), // core, breathing, strength, etc.
  difficulty: text("difficulty").default("beginner"), // beginner, intermediate, advanced
});

// Weekly workout plans
export const weeklyWorkouts = pgTable("weekly_workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  programId: varchar("program_id").notNull(),
  week: integer("week").notNull(),
  day: integer("day").notNull(), // 1-7 for days of week
  exerciseId: varchar("exercise_id").notNull(),
  orderIndex: integer("order_index").default(0),
  isOptional: boolean("is_optional").default(false), // for optional cardio days
});

export const reflectionNotes = pgTable("reflection_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  programId: varchar("program_id").notNull(),
  noteText: text("note_text").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Progress photos for before/after tracking
export const progressPhotos = pgTable("progress_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  programId: varchar("program_id"),
  photoType: text("photo_type").notNull(), // 'start' or 'finish'
  fileUrl: text("file_url").notNull(),
  cloudinaryPublicId: text("cloudinary_public_id"),
  fileSize: integer("file_size"),
  width: integer("width"),
  height: integer("height"),
  notes: text("notes"),
  uploadedAt: timestamp("uploaded_at").default(sql`now()`),
});

// Email templates for member outreach
export const emailTemplates = pgTable("email_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull().unique(), // 'welcome', 're-engagement', 'program-reminder', 'completion-celebration'
  name: text("name").notNull(), // Display name for the template
  description: text("description").notNull(), // Short description of when to use this template
  subject: text("subject").notNull(), // Default email subject line (editable)
  htmlContent: text("html_content").notNull(), // HTML template with {{variables}}
  variables: text("variables").array().notNull(), // List of available variables: ['userName', 'firstName', 'programName', 'weekNumber']
  lastSentAt: timestamp("last_sent_at"), // When this template was last used
  totalSends: integer("total_sends").default(0), // Total times this template has been sent
  totalOpens: integer("total_opens").default(0), // Total email opens tracked
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Email campaigns for member outreach
export const emailCampaigns = pgTable("email_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull(), // Reference to email template
  automationRuleId: varchar("automation_rule_id"), // Reference to automation rule if this was auto-triggered (null for manual campaigns)
  name: text("name").notNull(), // Internal name for the campaign
  templateType: text("template_type").notNull(), // 'welcome', 're-engagement', 'program-reminder', 'completion-celebration'
  subject: text("subject").notNull(), // Email subject line (can be customized from template default)
  htmlContent: text("html_content").notNull(), // HTML content (can be customized from template default)
  audienceFilter: jsonb("audience_filter").notNull(), // JSON object with targeting criteria
  status: text("status").notNull().default("draft"), // 'draft', 'scheduled', 'sending', 'sent', 'failed'
  scheduledFor: timestamp("scheduled_for"), // When to send (null = send immediately)
  sentAt: timestamp("sent_at"), // When actually sent
  recipientCount: integer("recipient_count").default(0), // Total recipients targeted
  sentCount: integer("sent_count").default(0), // Successfully sent
  failedCount: integer("failed_count").default(0), // Failed to send
  openCount: integer("open_count").default(0), // Unique opens tracked
  createdBy: varchar("created_by").notNull(), // Admin user ID
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Tracking individual recipients of email campaigns
export const emailCampaignRecipients = pgTable("email_campaign_recipients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull(),
  userId: varchar("user_id").notNull(),
  email: text("email").notNull(), // Stored for record keeping
  status: text("status").notNull().default("pending"), // 'pending', 'sent', 'failed'
  sentAt: timestamp("sent_at"),
  errorMessage: text("error_message"), // If failed, store error
  messageId: text("message_id"), // From email provider (Resend)
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Tracking email opens via pixel tracking
export const emailOpens = pgTable("email_opens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull(),
  userId: varchar("user_id").notNull(),
  recipientId: varchar("recipient_id").notNull(), // Reference to emailCampaignRecipients
  openedAt: timestamp("opened_at").default(sql`now()`),
  ipAddress: text("ip_address"), // For analytics
  userAgent: text("user_agent"), // For analytics
});

// Email automation rules for trigger-based campaigns
export const emailAutomationRules = pgTable("email_automation_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  triggerType: text("trigger_type").notNull().unique(), // 'user_signup', 'program_completion', 'workout_completion', 'user_inactivity_7d', 'user_inactivity_14d', 'user_inactivity_30d', 'incomplete_signup_3d'
  name: text("name").notNull(), // Display name: "Welcome Email", "Completion Email", etc.
  description: text("description").notNull(), // Description of what this automation does
  templateId: varchar("template_id").notNull(), // Which email template to use
  subject: text("subject").notNull(), // Customizable subject line (initialized from template)
  htmlContent: text("html_content").notNull(), // Customizable HTML content (initialized from template)
  enabled: boolean("enabled").notNull().default(false), // Can be toggled on/off by admin
  config: jsonb("config").notNull(), // JSON config: { inactivityDays: 30, delayMinutes: 0 }
  totalSent: integer("total_sent").default(0), // How many automated emails sent via this rule
  lastTriggeredAt: timestamp("last_triggered_at"), // When this automation last fired
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// User check-ins for mood tracking and engagement
export const userCheckins = pgTable("user_checkins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  mood: text("mood"), // 'great', 'good', 'okay', 'tired', 'struggling'
  energyLevel: integer("energy_level"), // 1-5 scale
  goals: text("goals").array(), // ['core-strength', 'energy', 'pain-relief', 'confidence']
  postpartumWeeksAtCheckin: integer("postpartum_weeks_at_checkin"), // snapshot at check-in time (calculated from delivery date)
  notes: text("notes"),
  isPartial: boolean("is_partial").default(false), // true if user didn't complete all steps
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Daily performance check-ins for tracking habits and wellness
export const dailyCheckins = pgTable("daily_checkins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  date: timestamp("date").notNull(), // The date this check-in is for
  workoutCompleted: boolean("workout_completed").default(false),
  breathingPractice: boolean("breathing_practice").default(false),
  waterGlasses: integer("water_glasses").default(0), // Number of glasses (target: 8)
  cardioMinutes: integer("cardio_minutes").default(0), // Minutes of cardio/walking
  gratitude: text("gratitude"), // What are you grateful for today?
  struggles: text("struggles"), // What challenges are you facing?
  mood: text("mood"), // 'great', 'good', 'okay', 'tired', 'struggling'
  energyLevel: integer("energy_level"), // 1-5 scale
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Weekly workout sessions - tracks 4 workouts + 2 cardio per week for progressive tracking
export const weeklyWorkoutSessions = pgTable("weekly_workout_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  week: integer("week").notNull(), // 1-6 for the 6-week program
  sessionType: text("session_type").notNull(), // 'workout' or 'cardio'
  sessionNumber: integer("session_number").notNull(), // 1-4 for workouts, 1-2 for cardio
  completedAt: timestamp("completed_at").default(sql`now()`),
  rating: integer("rating"), // 1-5 difficulty rating
  notes: text("notes"),
});

// Skipped weeks - tracks when user skips ahead without completing a week
export const skippedWeeks = pgTable("skipped_weeks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  week: integer("week").notNull(), // Which week was skipped
  skippedAt: timestamp("skipped_at").default(sql`now()`),
  workoutsCompletedBeforeSkip: integer("workouts_completed_before_skip").default(0), // How many of 4 were done
});

// Workout program content - stores detailed program data for each week (database-driven content)
export const workoutProgramContent = pgTable("workout_program_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  week: integer("week").notNull().unique(), // 1-6 for the 6-week program
  programNumber: integer("program_number").notNull(),
  title: text("title").notNull(), // e.g., "PROGRAM 1 - RECONNECT & RESET"
  subtitle: text("subtitle").notNull(), // e.g., "Foundation Building"
  schedule: text("schedule").notNull(), // e.g., "4x per week"
  scheduleDetail: text("schedule_detail").notNull(), // e.g., "Complete on Days 1, 3, 5, and 7 of each week"
  equipment: jsonb("equipment").notNull(), // Array of {name, colorClass}
  coachNote: text("coach_note").notNull(),
  coachNoteColorClass: text("coach_note_color_class").notNull(),
  part1Title: text("part1_title").notNull(), // e.g., "Part 1: 360° Breathing"
  part2PlaylistUrl: text("part2_playlist_url"), // YouTube playlist URL for part 2
  colorScheme: jsonb("color_scheme").notNull(), // {sectionClass, borderColor, bgColor, textColor, accentColor, hoverBg, buttonColor}
  isActive: boolean("is_active").default(true), // Can disable a week if needed
  updatedAt: timestamp("updated_at").default(sql`now()`),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Workout content exercises - individual exercises for each program week
export const workoutContentExercises = pgTable("workout_content_exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  programContentId: varchar("program_content_id").notNull(), // Reference to workoutProgramContent
  sectionType: text("section_type").notNull(), // 'part1' (breathing) or 'part2' (main workout)
  orderNum: integer("order_num").notNull(), // For sorting within section (1-based for display)
  name: text("name").notNull(), // Exercise name
  reps: text("reps").notNull(), // e.g., "12 reps", "25 breaths", "1 min"
  url: text("url"), // YouTube video URL (optional for some breathing exercises)
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// ============================================================================
// COURSE MANAGEMENT SYSTEM
// Supports multiple courses with reusable modules
// ============================================================================

// Courses - top level products users enroll in (e.g., "Heal Your Core Complete Program")
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // URL-friendly identifier
  description: text("description").notNull(),
  shortDescription: text("short_description"), // For cards/previews
  imageUrl: text("image_url"),
  thumbnailUrl: text("thumbnail_url"),
  level: text("level").default("beginner"), // beginner, intermediate, advanced
  durationWeeks: integer("duration_weeks"), // Duration in weeks (e.g., 6 for "6 weeks")
  price: integer("price").default(0), // Price in cents
  status: text("status").default("draft"), // draft, published, archived
  isVisible: boolean("is_visible").default(false),
  orderIndex: integer("order_index").default(0), // For display ordering
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Course Modules - reusable building blocks (Start Here, Core Education, Nutrition, etc.)
export const courseModules = pgTable("course_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  moduleType: text("module_type").notNull(), // educational, workout, faq, progress, nutrition
  iconName: text("icon_name"), // Lucide icon name for display
  colorTheme: text("color_theme").default("pink"), // pink, blue, green, purple, etc.
  isReusable: boolean("is_reusable").default(true), // Can be used in multiple courses
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Course-Module Mappings - links modules to courses with ordering
export const courseModuleMappings = pgTable("course_module_mappings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull(),
  moduleId: varchar("module_id").notNull(),
  orderIndex: integer("order_index").default(0), // Order of module in course
  isRequired: boolean("is_required").default(false), // Must complete to finish course
  isVisible: boolean("is_visible").default(true),
  customName: text("custom_name"), // Override module name for this course
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Module Sections - chapters/sections within a module
export const moduleSections = pgTable("module_sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").default(0),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Content Items - individual content pieces within sections
export const contentItems = pgTable("content_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectionId: varchar("section_id").notNull(),
  title: text("title").notNull(),
  contentType: text("content_type").notNull(), // video, text, pdf, exercise, poll
  content: text("content"), // Rich text content or JSON for structured data
  videoUrl: text("video_url"), // YouTube or Vimeo URL
  videoThumbnailUrl: text("video_thumbnail_url"),
  pdfUrl: text("pdf_url"), // PDF download URL
  duration: text("duration"), // e.g., "5 min", "10 reps"
  orderIndex: integer("order_index").default(0),
  isVisible: boolean("is_visible").default(true),
  metadata: jsonb("metadata"), // Flexible JSON for content-type specific data
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Course Enrollments - user enrollments in courses
export const courseEnrollments = pgTable("course_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  courseId: varchar("course_id").notNull(),
  enrolledAt: timestamp("enrolled_at").default(sql`now()`),
  expiresAt: timestamp("expires_at"),
  status: text("status").default("active"), // active, completed, expired, cancelled
  completedAt: timestamp("completed_at"),
  progressPercentage: integer("progress_percentage").default(0),
});

// User Module Progress - tracks progress per module
export const userModuleProgress = pgTable("user_module_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  moduleId: varchar("module_id").notNull(),
  courseId: varchar("course_id").notNull(), // Which course context
  startedAt: timestamp("started_at").default(sql`now()`),
  completedAt: timestamp("completed_at"),
  progressPercentage: integer("progress_percentage").default(0),
  lastAccessedAt: timestamp("last_accessed_at").default(sql`now()`),
});

// User Content Completion - tracks which content items user has completed
export const userContentCompletion = pgTable("user_content_completion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  contentItemId: varchar("content_item_id").notNull(),
  completedAt: timestamp("completed_at").default(sql`now()`),
  timeSpent: integer("time_spent"), // Seconds spent on content
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProgramPurchaseSchema = createInsertSchema(programPurchases).omit({
  id: true,
  purchaseDate: true,
});

export const insertProgressTrackingSchema = createInsertSchema(progressTracking).omit({
  id: true,
  recordedAt: true,
});

export const insertKnowledgeArticleSchema = createInsertSchema(knowledgeArticles).omit({
  id: true,
  createdAt: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

export const insertWeeklyWorkoutSchema = createInsertSchema(weeklyWorkouts).omit({
  id: true,
});

export const insertReflectionNoteSchema = createInsertSchema(reflectionNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProgressPhotoSchema = createInsertSchema(progressPhotos).omit({
  id: true,
  uploadedAt: true,
}).extend({
  photoType: z.enum(['start', 'finish']),
});

export const insertProgramSchema = createInsertSchema(programs).omit({
  id: true,
});

export const insertMemberProgramSchema = createInsertSchema(memberPrograms).omit({
  id: true,
  purchaseDate: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
});

export const insertWorkoutCompletionSchema = createInsertSchema(workoutCompletions).omit({
  id: true,
  completedAt: true,
}).extend({
  challengeRating: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
  photoUrl: z.string().optional(),
  duration: z.number().positive().optional(),
  mood: z.string().optional(),
});

export const insertSavedWorkoutSchema = createInsertSchema(savedWorkouts).omit({
  id: true,
  savedAt: true,
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  createdAt: true,
}).extend({
  category: z.enum(['wins', 'realtalk', 'transformations', 'workoutselfies', 'momlife', 'general']).default('general'),
  weekNumber: z.number().min(1).max(6).optional(),
  imageUrls: z.array(z.string().url()).min(1).max(4).optional(), // 1-4 images
  cloudinaryPublicIds: z.array(z.string()).optional(),
  isSensitiveContent: z.boolean().default(false),
});

export const insertPostLikeSchema = createInsertSchema(postLikes).omit({
  id: true,
  createdAt: true,
});

export const insertPostCommentSchema = createInsertSchema(postComments).omit({
  id: true,
  createdAt: true,
}).extend({
  content: z.string().min(1).max(500),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertTermsSchema = createInsertSchema(terms).omit({
  id: true,
  createdAt: true,
});

// Strict schema for email campaign audience filters
export const audienceFilterSchema = z.object({
  dormantDays: z.number().int().positive().optional(),
  hasWhatsAppSupport: z.boolean().optional(),
  country: z.string().min(1).max(100).optional(),
  programCompletionStatus: z.enum(['completed', 'in-progress', 'not-started']).optional(),
  pendingSignup: z.boolean().optional(), // Users who haven't accepted terms/disclaimer
}).strict(); // Reject any unknown keys

export type AudienceFilter = z.infer<typeof audienceFilterSchema>;

// Email template insert schema
export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastSentAt: true,
  totalSends: true,
  totalOpens: true,
}).extend({
  type: z.enum(['welcome', 're-engagement', 'program-reminder', 'completion-celebration', 'complete-signup', 'workout-congratulations']),
});

// Manually define insert schema to ensure strict audienceFilter validation
export const insertEmailCampaignSchema = z.object({
  templateId: z.string(),
  name: z.string().min(1).max(255),
  templateType: z.enum(['welcome', 're-engagement', 'program-reminder', 'completion-celebration', 'complete-signup', 'workout-congratulations']),
  subject: z.string().min(1).max(500),
  htmlContent: z.string().min(1), // HTML content for the email
  audienceFilter: audienceFilterSchema, // Strict validation - only allowed keys
  status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'failed']).default('draft'),
  scheduledFor: z.date().optional(),
  createdBy: z.string(),
});

export const insertEmailCampaignRecipientSchema = createInsertSchema(emailCampaignRecipients).omit({
  id: true,
  createdAt: true,
  sentAt: true,
}).extend({
  status: z.enum(['pending', 'sent', 'failed']).default('pending'),
});

export const insertEmailOpenSchema = createInsertSchema(emailOpens).omit({
  id: true,
  openedAt: true,
});

export const insertEmailAutomationRuleSchema = createInsertSchema(emailAutomationRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalSent: true,
  lastTriggeredAt: true,
}).extend({
  triggerType: z.enum(['user_signup', 'program_completion', 'workout_completion', 'user_inactivity_7d', 'user_inactivity_14d', 'user_inactivity_30d', 'incomplete_signup_3d']),
  enabled: z.boolean().default(false),
});

export const insertUserCheckinSchema = createInsertSchema(userCheckins).omit({
  id: true,
  createdAt: true,
}).extend({
  mood: z.enum(['great', 'good', 'okay', 'tired', 'struggling']).optional().nullable(),
  energyLevel: z.number().min(1).max(5).optional().nullable(),
  goals: z.array(z.string()).optional().nullable(),
  postpartumWeeksAtCheckin: z.number().int().positive().max(520).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  isPartial: z.boolean().optional(),
});

// Daily check-in schema for performance tracking
export const insertDailyCheckinSchema = createInsertSchema(dailyCheckins).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  waterGlasses: z.number().min(0).max(20).default(0),
  cardioMinutes: z.number().min(0).max(300).default(0),
  gratitude: z.string().max(500).optional().nullable(),
  struggles: z.string().max(500).optional().nullable(),
  mood: z.enum(['great', 'good', 'okay', 'tired', 'struggling']).optional().nullable(),
  energyLevel: z.number().int().min(1).max(5).optional().nullable(),
});

// Weekly workout session schemas for progressive tracking
export const insertWeeklyWorkoutSessionSchema = createInsertSchema(weeklyWorkoutSessions).omit({
  id: true,
  completedAt: true,
}).extend({
  sessionType: z.enum(['workout', 'cardio']),
  sessionNumber: z.number().int().min(1).max(4),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const insertSkippedWeekSchema = createInsertSchema(skippedWeeks).omit({
  id: true,
  skippedAt: true,
});

// Workout program content schemas
export const insertWorkoutProgramContentSchema = createInsertSchema(workoutProgramContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkoutContentExerciseSchema = createInsertSchema(workoutContentExercises).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Course management insert schemas
export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
});

export const insertCourseModuleSchema = createInsertSchema(courseModules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  moduleType: z.enum(['educational', 'workout', 'faq', 'progress', 'nutrition']),
  colorTheme: z.enum(['pink', 'blue', 'green', 'purple', 'orange', 'teal']).default('pink'),
});

export const insertCourseModuleMappingSchema = createInsertSchema(courseModuleMappings).omit({
  id: true,
  createdAt: true,
});

export const insertModuleSectionSchema = createInsertSchema(moduleSections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentItemSchema = createInsertSchema(contentItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  contentType: z.enum(['video', 'text', 'pdf', 'exercise', 'poll']),
});

export const insertCourseEnrollmentSchema = createInsertSchema(courseEnrollments).omit({
  id: true,
  enrolledAt: true,
  completedAt: true,
}).extend({
  status: z.enum(['active', 'completed', 'expired', 'cancelled']).default('active'),
});

export const insertUserModuleProgressSchema = createInsertSchema(userModuleProgress).omit({
  id: true,
  startedAt: true,
  completedAt: true,
  lastAccessedAt: true,
});

export const insertUserContentCompletionSchema = createInsertSchema(userContentCompletion).omit({
  id: true,
  completedAt: true,
});

// Educational content - Understanding Your Core topics
export const educationalTopics = pgTable("educational_topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(), // e.g., "breathing-activation", "360-breathing"
  orderNum: integer("order_num").notNull(), // 1-7 for display order
  title: text("title").notNull(), // e.g., "Breathing & Core Activation"
  videoUrl: text("video_url"), // YouTube URL (optional)
  videoLabel: text("video_label"), // e.g., "360 Degree Breathing"
  imageKey: text("image_key"), // Key to reference local image assets
  contentBlocks: jsonb("content_blocks").notNull(), // Array of content blocks with type, text, items, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Activity logs for admin dashboard
export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  activityType: text("activity_type").notNull(), // 'login', 'workout_start', 'workout_complete', 'signup', 'profile_update'
  metadata: jsonb("metadata"), // Additional context like workout name, week number, etc.
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertEducationalTopicSchema = createInsertSchema(educationalTopics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

// Reusable validation schemas

// Phone number validation (flexible for international formats, truly optional)
export const phoneSchema = z
  .string()
  .transform((val) => val?.trim() || "") // Normalize empty values
  .refine(
    (val) => {
      // Allow empty/blank values (truly optional)
      if (!val || val.length === 0) return true;
      
      // If provided, must match pattern
      return /^[\d\s\-\+\(\)]+$/.test(val);
    },
    { message: "Phone number can only contain digits, spaces, and symbols: + - ( )" }
  )
  .refine(
    (val) => {
      // Allow empty values
      if (!val || val.length === 0) return true;
      
      // If provided, check length
      return val.length >= 10 && val.length <= 20;
    },
    { message: "Phone number must be 10-20 characters" }
  )
  .refine(
    (val) => {
      // Allow empty values
      if (!val || val.length === 0) return true;
      
      // Count only digits
      const digits = val.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15;
    },
    { message: "Phone number must contain 10-15 digits" }
  );

// Date validation helpers
export const futureDateSchema = (message = "Date must be in the future") =>
  z.date().refine((date) => date > new Date(), { message });

export const pastDateSchema = (message = "Date must be in the past") =>
  z.date().refine((date) => date < new Date(), { message });

export const dateRangeSchema = (
  maxYearsAhead = 5,
  maxYearsBehind = 10 // More reasonable default for legacy accounts
) =>
  z.date().refine(
    (date) => {
      const now = new Date();
      const maxFuture = new Date();
      maxFuture.setFullYear(now.getFullYear() + maxYearsAhead);
      const maxPast = new Date();
      maxPast.setFullYear(now.getFullYear() - maxYearsBehind);
      return date <= maxFuture && date >= maxPast;
    },
    {
      message: `Date must be within ${maxYearsBehind} years ago and ${maxYearsAhead} years ahead`,
    }
  );

// Update user profile schema
export const updateUserProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100, "First name is too long").optional(),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name is too long").optional(),
  email: z.string().email("Please enter a valid email address").optional(),
  phone: phoneSchema.optional(),
  profilePictureUrl: z.string().url("Please enter a valid URL").optional(),
  country: z.string().max(100, "Country name is too long").optional(),
  bio: z.string().max(500, "Bio is too long").optional(),
  instagramHandle: z.string().max(50, "Instagram handle is too long").optional(),
  postpartumWeeks: z.union([z.number().int().positive().max(520, "Please enter a valid number of weeks"), z.null()]).optional(), // Max ~10 years, allow null for clearing
});

// Admin create user schema
export const adminCreateUserSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  firstName: z.string().min(1, "First name is required").max(100, "First name is too long"),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name is too long"),
  phone: phoneSchema.optional(),
  programId: z.string().min(1, "Please select a program"), // Required program enrollment
  isAdmin: z.boolean().default(false),
  validFrom: dateRangeSchema(10, 10).optional(), // Allow legacy accounts (10 years back)
  validUntil: dateRangeSchema(10, 10).optional(),
  hasWhatsAppSupport: z.boolean().default(false),
  whatsAppSupportDuration: z.number().int().positive().max(36, "Duration cannot exceed 36 months").optional(),
}).refine((data) => {
  if (data.validFrom && data.validUntil) {
    return data.validFrom < data.validUntil;
  }
  return true;
}, {
  message: "Valid from date must be before valid until date",
  path: ["validUntil"],
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ProgramPurchase = typeof programPurchases.$inferSelect;
export type InsertProgramPurchase = z.infer<typeof insertProgramPurchaseSchema>;
export type ProgressTracking = typeof progressTracking.$inferSelect;
export type InsertProgressTracking = z.infer<typeof insertProgressTrackingSchema>;
export type KnowledgeArticle = typeof knowledgeArticles.$inferSelect;
export type InsertKnowledgeArticle = z.infer<typeof insertKnowledgeArticleSchema>;
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type WeeklyWorkout = typeof weeklyWorkouts.$inferSelect;
export type InsertWeeklyWorkout = z.infer<typeof insertWeeklyWorkoutSchema>;
export type ReflectionNote = typeof reflectionNotes.$inferSelect;
export type InsertReflectionNote = z.infer<typeof insertReflectionNoteSchema>;
export type ProgressPhoto = typeof progressPhotos.$inferSelect;
export type InsertProgressPhoto = z.infer<typeof insertProgressPhotoSchema>;
export type Program = typeof programs.$inferSelect;
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type MemberProgram = typeof memberPrograms.$inferSelect;
export type InsertMemberProgram = z.infer<typeof insertMemberProgramSchema>;
export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type WorkoutCompletion = typeof workoutCompletions.$inferSelect;
export type InsertWorkoutCompletion = z.infer<typeof insertWorkoutCompletionSchema>;
export type SavedWorkout = typeof savedWorkouts.$inferSelect;
export type InsertSavedWorkout = z.infer<typeof insertSavedWorkoutSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type PasswordResetCode = typeof passwordResetCodes.$inferSelect;

export const insertPasswordResetCodeSchema = createInsertSchema(passwordResetCodes).omit({
  id: true,
  createdAt: true,
});
export type InsertPasswordResetCode = z.infer<typeof insertPasswordResetCodeSchema>;
export type Terms = typeof terms.$inferSelect;
export type InsertTerms = z.infer<typeof insertTermsSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;
export type EmailCampaignRecipient = typeof emailCampaignRecipients.$inferSelect;
export type InsertEmailCampaignRecipient = z.infer<typeof insertEmailCampaignRecipientSchema>;
export type EmailOpen = typeof emailOpens.$inferSelect;
export type InsertEmailOpen = z.infer<typeof insertEmailOpenSchema>;
export type EmailAutomationRule = typeof emailAutomationRules.$inferSelect;
export type InsertEmailAutomationRule = z.infer<typeof insertEmailAutomationRuleSchema>;
export type UserCheckin = typeof userCheckins.$inferSelect;
export type InsertUserCheckin = z.infer<typeof insertUserCheckinSchema>;
export type DailyCheckin = typeof dailyCheckins.$inferSelect;
export type InsertDailyCheckin = z.infer<typeof insertDailyCheckinSchema>;
export type WeeklyWorkoutSession = typeof weeklyWorkoutSessions.$inferSelect;
export type InsertWeeklyWorkoutSession = z.infer<typeof insertWeeklyWorkoutSessionSchema>;
export type SkippedWeek = typeof skippedWeeks.$inferSelect;
export type InsertSkippedWeek = z.infer<typeof insertSkippedWeekSchema>;
export type WorkoutProgramContent = typeof workoutProgramContent.$inferSelect;
export type InsertWorkoutProgramContent = z.infer<typeof insertWorkoutProgramContentSchema>;
export type WorkoutContentExercise = typeof workoutContentExercises.$inferSelect;
export type InsertWorkoutContentExercise = z.infer<typeof insertWorkoutContentExerciseSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type AdminCreateUser = z.infer<typeof adminCreateUserSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type EducationalTopic = typeof educationalTopics.$inferSelect;
export type InsertEducationalTopic = z.infer<typeof insertEducationalTopicSchema>;

// Course management types
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type CourseModule = typeof courseModules.$inferSelect;
export type InsertCourseModule = z.infer<typeof insertCourseModuleSchema>;
export type CourseModuleMapping = typeof courseModuleMappings.$inferSelect;
export type InsertCourseModuleMapping = z.infer<typeof insertCourseModuleMappingSchema>;
export type ModuleSection = typeof moduleSections.$inferSelect;
export type InsertModuleSection = z.infer<typeof insertModuleSectionSchema>;
export type ContentItem = typeof contentItems.$inferSelect;
export type InsertContentItem = z.infer<typeof insertContentItemSchema>;
export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type InsertCourseEnrollment = z.infer<typeof insertCourseEnrollmentSchema>;
export type UserModuleProgress = typeof userModuleProgress.$inferSelect;
export type InsertUserModuleProgress = z.infer<typeof insertUserModuleProgressSchema>;
export type UserContentCompletion = typeof userContentCompletion.$inferSelect;
export type InsertUserContentCompletion = z.infer<typeof insertUserContentCompletionSchema>;

// Password validation schema with strength requirements
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"), // Less strict for login
  termsAccepted: z.boolean().optional(),
  disclaimerAccepted: z.boolean().optional(),
});

export type LoginData = z.infer<typeof loginSchema>;

// Extended login schema that requires terms and disclaimer acceptance for new users
export const loginWithDisclaimerSchema = loginSchema.extend({
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions to continue"
  }),
  disclaimerAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the disclaimer to continue"
  })
});
