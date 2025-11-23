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
  imageUrl: text("image_url"),
  cloudinaryPublicId: text("cloudinary_public_id"),
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
  imageUrl: z.string().url().optional(),
  cloudinaryPublicId: z.string().optional(),
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
export type Terms = typeof terms.$inferSelect;
export type InsertTerms = z.infer<typeof insertTermsSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type AdminCreateUser = z.infer<typeof adminCreateUserSchema>;

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
