import { sql, relations } from "drizzle-orm";
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
  channel: text("channel").notNull().default("general"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  isModerated: boolean("is_moderated").default(false),
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
  isModerated: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertTermsSchema = createInsertSchema(terms).omit({
  id: true,
  createdAt: true,
});

// Update user profile schema
export const updateUserProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Please enter a valid email address").optional(),
  phone: z.string().optional(),
  profilePictureUrl: z.string().url("Please enter a valid URL").optional(),
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
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Terms = typeof terms.$inferSelect;
export type InsertTerms = z.infer<typeof insertTermsSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  memberPrograms: many(memberPrograms),
  workoutCompletions: many(workoutCompletions),
  savedWorkouts: many(savedWorkouts),
  communityPosts: many(communityPosts),
  notifications: many(notifications),
  programPurchases: many(programPurchases),
  progressTracking: many(progressTracking),
}));

export const programsRelations = relations(programs, ({ many }) => ({
  memberPrograms: many(memberPrograms),
  workouts: many(workouts),
  programPurchases: many(programPurchases),
  progressTracking: many(progressTracking),
  knowledgeArticles: many(knowledgeArticles),
  weeklyWorkouts: many(weeklyWorkouts),
}));

export const memberProgramsRelations = relations(memberPrograms, ({ one }) => ({
  user: one(users, {
    fields: [memberPrograms.userId],
    references: [users.id],
  }),
  program: one(programs, {
    fields: [memberPrograms.programId],
    references: [programs.id],
  }),
}));

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  program: one(programs, {
    fields: [workouts.programId],
    references: [programs.id],
  }),
  completions: many(workoutCompletions),
  savedWorkouts: many(savedWorkouts),
}));

export const workoutCompletionsRelations = relations(workoutCompletions, ({ one }) => ({
  user: one(users, {
    fields: [workoutCompletions.userId],
    references: [users.id],
  }),
  workout: one(workouts, {
    fields: [workoutCompletions.workoutId],
    references: [workouts.id],
  }),
}));

export const savedWorkoutsRelations = relations(savedWorkouts, ({ one }) => ({
  user: one(users, {
    fields: [savedWorkouts.userId],
    references: [users.id],
  }),
  workout: one(workouts, {
    fields: [savedWorkouts.workoutId],
    references: [workouts.id],
  }),
}));

export const communityPostsRelations = relations(communityPosts, ({ one }) => ({
  user: one(users, {
    fields: [communityPosts.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const programPurchasesRelations = relations(programPurchases, ({ one }) => ({
  user: one(users, {
    fields: [programPurchases.userId],
    references: [users.id],
  }),
  program: one(programs, {
    fields: [programPurchases.programId],
    references: [programs.id],
  }),
}));

export const progressTrackingRelations = relations(progressTracking, ({ one }) => ({
  user: one(users, {
    fields: [progressTracking.userId],
    references: [users.id],
  }),
  program: one(programs, {
    fields: [progressTracking.programId],
    references: [programs.id],
  }),
}));

export const knowledgeArticlesRelations = relations(knowledgeArticles, ({ one }) => ({
  program: one(programs, {
    fields: [knowledgeArticles.programId],
    references: [programs.id],
  }),
}));

export const weeklyWorkoutsRelations = relations(weeklyWorkouts, ({ one }) => ({
  program: one(programs, {
    fields: [weeklyWorkouts.programId],
    references: [programs.id],
  }),
  exercise: one(exercises, {
    fields: [weeklyWorkouts.exerciseId],
    references: [exercises.id],
  }),
}));
