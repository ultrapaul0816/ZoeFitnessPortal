import "dotenv/config";
import {
  type User,
  type InsertUser,
  type Program,
  type InsertProgram,
  type MemberProgram,
  type InsertMemberProgram,
  type Workout,
  type InsertWorkout,
  type WorkoutCompletion,
  type InsertWorkoutCompletion,
  type SavedWorkout,
  type InsertSavedWorkout,
  type CommunityPost,
  type InsertCommunityPost,
  type PostLike,
  type InsertPostLike,
  type PostComment,
  type InsertPostComment,
  type Notification,
  type InsertNotification,
  type Terms,
  type InsertTerms,
  type ProgramPurchase,
  type InsertProgramPurchase,
  type ProgressTracking,
  type InsertProgressTracking,
  type KnowledgeArticle,
  type InsertKnowledgeArticle,
  type Exercise,
  type InsertExercise,
  type WeeklyWorkout,
  type InsertWeeklyWorkout,
  type ReflectionNote,
  type InsertReflectionNote,
  type ProgressPhoto,
  type InsertProgressPhoto,
  type EmailCampaign,
  type InsertEmailCampaign,
  type EmailCampaignRecipient,
  type InsertEmailCampaignRecipient,
  type EmailTemplate,
  type InsertEmailTemplate,
  type EmailOpen,
  type InsertEmailOpen,
  type EmailAutomationRule,
  type PasswordResetCode,
  type UserCheckin,
  type InsertUserCheckin,
  type DailyCheckin,
  type InsertDailyCheckin,
} from "@shared/schema";
import {
  users,
  programs,
  memberPrograms,
  workouts,
  workoutCompletions,
  savedWorkouts,
  communityPosts,
  postLikes,
  postComments,
  notifications,
  terms,
  programPurchases,
  progressTracking,
  knowledgeArticles,
  exercises,
  weeklyWorkouts,
  reflectionNotes,
  progressPhotos,
  emailCampaigns,
  emailCampaignRecipients,
  emailTemplates,
  emailOpens,
  emailAutomationRules,
  passwordResetCodes,
  userCheckins,
  dailyCheckins,
  workoutProgramContent,
  workoutContentExercises,
  activityLogs,
  WorkoutProgramContent,
  WorkoutContentExercise,
  InsertWorkoutProgramContent,
  InsertWorkoutContentExercise,
  educationalTopics,
  EducationalTopic,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, desc, sql, count, asc, gte, lte, or, isNull, lt, notInArray, inArray } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Programs
  getPrograms(): Promise<Program[]>;
  getProgram(id: string): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;

  // Member Programs
  getMemberPrograms(
    userId: string
  ): Promise<(MemberProgram & { program: Program })[]>;
  createMemberProgram(
    memberProgram: InsertMemberProgram
  ): Promise<MemberProgram>;
  deleteMemberProgram(enrollmentId: string): Promise<void>;

  // Workouts
  getWorkoutsByProgram(programId: string): Promise<Workout[]>;
  getWorkout(id: string): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;

  // Workout Completions
  getWorkoutCompletions(userId: string): Promise<WorkoutCompletion[]>;
  createWorkoutCompletion(
    completion: InsertWorkoutCompletion
  ): Promise<WorkoutCompletion>;

  // Saved Workouts
  getSavedWorkouts(
    userId: string
  ): Promise<(SavedWorkout & { workout: Workout })[]>;
  createSavedWorkout(savedWorkout: InsertSavedWorkout): Promise<SavedWorkout>;
  deleteSavedWorkout(userId: string, workoutId: string): Promise<boolean>;

  // Community Posts
  getCommunityPosts(filters?: {
    category?: string;
    weekNumber?: number;
    userId?: string;
    sortBy?: 'newest' | 'mostLiked';
  }): Promise<
    (CommunityPost & {
      user: Pick<User, "id" | "firstName" | "lastName" | "profilePictureUrl" | "profilePictureThumbnailUrl">;
      likeCount: number;
      commentCount: number;
      isLikedByUser?: boolean;
      likes?: Array<{ userId: string; userName: string }>;
    })[]
  >;
  getPostById(
    postId: string,
    currentUserId?: string
  ): Promise<
    | (CommunityPost & {
        user: Pick<User, "id" | "firstName" | "lastName" | "profilePictureUrl" | "profilePictureThumbnailUrl">;
        likeCount: number;
        commentCount: number;
        isLikedByUser: boolean;
        likes: Array<{ userId: string; userName: string }>;
      })
    | undefined
  >;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  deletePost(postId: string, userId: string): Promise<boolean>;
  reportPost(postId: string): Promise<boolean>;
  markPostAsFeatured(postId: string, featured: boolean): Promise<boolean>;

  // Post Likes
  likePost(userId: string, postId: string): Promise<PostLike>;
  unlikePost(userId: string, postId: string): Promise<boolean>;
  getPostLikes(postId: string): Promise<
    Array<{ userId: string; userName: string; createdAt: Date }>
  >;

  // Post Comments
  createComment(comment: InsertPostComment): Promise<PostComment>;
  getPostComments(
    postId: string
  ): Promise<
    (PostComment & {
      user: Pick<User, "id" | "firstName" | "lastName" | "profilePictureUrl" | "profilePictureThumbnailUrl">;
    })[]
  >;
  deleteComment(commentId: string, userId: string): Promise<boolean>;

  // Notifications
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<boolean>;

  // Terms
  getActiveTerms(): Promise<Terms | undefined>;
  createTerms(terms: InsertTerms): Promise<Terms>;

  // Admin functions
  getAllUsers(): Promise<User[]>;
  getUserStats(): Promise<{
    totalMembers: number;
    activeMembers: number;
    expiringSoon: number;
    expiringUsers: Array<{
      userId: string;
      userName: string;
      programExpiring: boolean;
      whatsAppExpiring: boolean;
      programExpiryDate?: Date;
      whatsAppExpiryDate?: Date;
    }>;
  }>;

  // Analytics
  getAnalytics(): Promise<{
    demographics: {
      totalUsers: number;
      byCountry: { country: string; count: number }[];
      byPostpartumStage: { stage: string; count: number }[];
      instagramHandlesCollected: number;
    };
    engagement: {
      activeUsers: { today: number; last7Days: number; last30Days: number; last90Days: number };
      dormantUsers: { today: number; dormant7Days: number; dormant30Days: number; dormant90Days: number };
      averageLoginFrequency: number;
    };
    programPerformance: {
      totalWorkoutCompletions: number;
      averageWorkoutsPerUser: number;
      completionRates: { completed: number; inProgress: number; notStarted: number };
      progressDistribution: { range: string; count: number }[];
      averageMood: number;
      averageChallengeRating: number;
    };
    communityHealth: {
      totalPosts: number;
      totalLikes: number;
      totalComments: number;
      participationRate: number;
      topCategories: { category: string; count: number }[];
      topContributors: { userId: string; userName: string; postCount: number }[];
    };
    businessMetrics: {
      whatsAppAdoption: number;
      programCompletions: number;
      averageCompletionTime: number;
    };
  }>;

  // Program Purchases (for premium programs like Heal Your Core)
  createProgramPurchase(
    purchase: InsertProgramPurchase
  ): Promise<ProgramPurchase>;
  getUserPurchases(userId: string): Promise<ProgramPurchase[]>;
  hasProgramAccess(userId: string, programId: string): Promise<boolean>;

  // Progress Tracking
  createProgressEntry(entry: InsertProgressTracking): Promise<ProgressTracking>;
  getProgressEntries(
    userId: string,
    programId: string
  ): Promise<ProgressTracking[]>;
  updateProgressEntry(
    id: string,
    updates: Partial<ProgressTracking>
  ): Promise<ProgressTracking | undefined>;

  // Knowledge Articles
  createKnowledgeArticle(
    article: InsertKnowledgeArticle
  ): Promise<KnowledgeArticle>;
  getKnowledgeArticles(programId: string): Promise<KnowledgeArticle[]>;

  // Exercises
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  getExercises(): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;

  // Weekly Workouts
  createWeeklyWorkout(workout: InsertWeeklyWorkout): Promise<WeeklyWorkout>;

  // Reflection Notes
  createReflectionNote(note: InsertReflectionNote): Promise<ReflectionNote>;
  getReflectionNote(
    userId: string,
    programId: string
  ): Promise<ReflectionNote | undefined>;
  updateReflectionNote(
    userId: string,
    programId: string,
    noteText: string
  ): Promise<ReflectionNote>;

  // Progress Photos
  createProgressPhoto(photo: InsertProgressPhoto): Promise<ProgressPhoto>;
  getProgressPhotos(userId: string): Promise<ProgressPhoto[]>;
  deleteProgressPhoto(id: string): Promise<boolean>;

  // Email Templates
  getEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplate(id: string): Promise<EmailTemplate | undefined>;
  getEmailTemplateByType(type: string): Promise<EmailTemplate | undefined>;
  updateEmailTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate | undefined>;
  incrementTemplateSends(templateId: string): Promise<void>;
  
  // Email Campaigns
  createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign>;
  getEmailCampaigns(): Promise<EmailCampaign[]>;
  getEmailCampaign(id: string): Promise<EmailCampaign | undefined>;
  updateEmailCampaign(id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign | undefined>;
  deleteEmailCampaign(id: string): Promise<boolean>;
  getTargetedUsers(audienceFilter: import("@shared/schema").AudienceFilter): Promise<User[]>;
  createCampaignRecipients(recipients: InsertEmailCampaignRecipient[]): Promise<EmailCampaignRecipient[]>;
  getCampaignRecipients(campaignId: string): Promise<EmailCampaignRecipient[]>;
  updateRecipientStatus(recipientId: string, status: string, sentAt?: Date, errorMessage?: string, messageId?: string): Promise<void>;
  
  // Email Tracking
  recordEmailOpen(open: InsertEmailOpen): Promise<EmailOpen>;
  getEmailOpens(campaignId: string): Promise<EmailOpen[]>;

  // Email Automation Rules
  getEmailAutomationRules(): Promise<EmailAutomationRule[]>;
  getEmailAutomationRule(id: string): Promise<EmailAutomationRule | undefined>;
  getEmailAutomationRuleByTriggerType(triggerType: string): Promise<EmailAutomationRule | undefined>;
  updateEmailAutomationRule(id: string, updates: Partial<EmailAutomationRule>): Promise<EmailAutomationRule | undefined>;
  incrementAutomationRuleSent(id: string): Promise<void>;

  // Assets
  assetDisplayNames?: Map<string, string>;
  getWeeklyWorkouts(
    programId: string,
    week: number
  ): Promise<(WeeklyWorkout & { exercise: Exercise })[]>;
  getAllWeeklyWorkouts(
    programId: string
  ): Promise<(WeeklyWorkout & { exercise: Exercise })[]>;

  // Password Reset Codes
  createPasswordResetCode(email: string, code: string, expiresAt: Date): Promise<PasswordResetCode>;
  getValidPasswordResetCode(email: string, code: string): Promise<PasswordResetCode | undefined>;
  markPasswordResetCodeAsVerified(id: string): Promise<void>;
  deletePasswordResetCodes(email: string): Promise<void>;

  // User Check-ins
  createUserCheckin(checkin: InsertUserCheckin): Promise<UserCheckin>;
  updateUserCheckin(id: string, userId: string, data: Partial<InsertUserCheckin>): Promise<UserCheckin | undefined>;
  getUserCheckins(userId: string): Promise<UserCheckin[]>;
  getTodayCheckin(userId: string): Promise<UserCheckin | null>;
  getRecentCheckins(limit?: number): Promise<(UserCheckin & { user: Pick<User, 'id' | 'firstName' | 'lastName'> })[]>;
  getCheckinAnalytics(): Promise<{
    totalCheckins: number;
    checkinsByMood: { mood: string; count: number }[];
    checkinsByEnergy: { energyLevel: number; count: number }[];
    popularGoals: { goal: string; count: number }[];
    checkinFrequency: { period: string; count: number }[];
  }>;

  // Daily Performance Check-ins (habits & wellness tracking)
  createDailyCheckin(checkin: InsertDailyCheckin): Promise<DailyCheckin>;
  updateDailyCheckin(id: string, userId: string, updates: Partial<InsertDailyCheckin>): Promise<DailyCheckin | undefined>;
  getDailyCheckin(userId: string, date: Date): Promise<DailyCheckin | undefined>;
  getTodayDailyCheckin(userId: string): Promise<DailyCheckin | undefined>;
  getWeeklyDailyCheckins(userId: string, weekStartDate: Date): Promise<DailyCheckin[]>;
  getDailyCheckinStats(userId: string, days?: number): Promise<{
    totalCheckins: number;
    workoutDays: number;
    breathingDays: number;
    avgWaterGlasses: number;
    avgCardioMinutes: number;
    currentStreak: number;
  }>;

  // Workout Program Content (database-driven workout data)
  getWorkoutProgramContent(): Promise<WorkoutProgramContent[]>;
  getWorkoutProgramContentByWeek(week: number): Promise<WorkoutProgramContent | undefined>;
  getWorkoutContentExercises(programContentId: string): Promise<WorkoutContentExercise[]>;
  getFullWorkoutPrograms(): Promise<Array<WorkoutProgramContent & { exercises: WorkoutContentExercise[] }>>;
  updateWorkoutProgramContent(id: string, updates: Partial<InsertWorkoutProgramContent>): Promise<WorkoutProgramContent | undefined>;
  updateWorkoutContentExercise(id: string, updates: Partial<InsertWorkoutContentExercise>): Promise<WorkoutContentExercise | undefined>;
  createWorkoutContentExercise(exercise: InsertWorkoutContentExercise): Promise<WorkoutContentExercise>;
  deleteWorkoutContentExercise(id: string): Promise<boolean>;
  reorderWorkoutContentExercises(programContentId: string, sectionType: string, exerciseIds: string[]): Promise<void>;

  // Educational Topics
  getEducationalTopics(): Promise<EducationalTopic[]>;
  getEducationalTopicBySlug(slug: string): Promise<EducationalTopic | undefined>;

  // Activity Logs
  createActivityLog(userId: string, activityType: string, metadata?: Record<string, any>): Promise<void>;
  getRecentActivityLogs(limit?: number): Promise<Array<{
    id: string;
    userId: string;
    activityType: string;
    metadata: Record<string, any> | null;
    createdAt: Date | null;
    user: Pick<User, 'id' | 'firstName' | 'lastName' | 'profilePictureUrl'>;
  }>>;
  getActivityLogsForUser(userId: string, limit?: number): Promise<Array<{
    id: string;
    activityType: string;
    metadata: Record<string, any> | null;
    createdAt: Date | null;
  }>>;
  
  // User Profile Data for Admin
  getUserEmailHistory(userId: string): Promise<Array<{
    id: string;
    campaignName: string;
    templateType: string;
    sentAt: Date | null;
    openedAt: Date | null;
    status: string;
  }>>;
  getUserProgressPhotosAdmin(userId: string): Promise<Array<{
    id: string;
    photoUrl: string;
    photoType: string;
    week: number | null;
    createdAt: Date | null;
  }>>;

  // Actionable Dashboard Data
  getDormantMembers(daysInactive?: number): Promise<Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    lastLoginAt: Date | null;
    daysSinceLogin: number;
    lastReengagementEmailAt: Date | null;
  }>>;
  getMembersWithoutProgressPhotos(): Promise<Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    lastLoginAt: Date | null;
    workoutsCompleted: number;
  }>>;
  getRecentWorkoutCompleters(hours?: number): Promise<Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    workoutName: string;
    completedAt: Date | null;
  }>>;
  
  // Email Automation Cascade Logic
  checkReengagementEligibility(userId: string, triggerType: string): Promise<{
    isEligible: boolean;
    reason: string;
    lastEmailOfType: Date | null;
    previousLevelSentAt: Date | null;
  }>;
  checkWorkoutEmailCooldown(userId: string): Promise<{
    canSend: boolean;
    lastSentAt: Date | null;
    hoursRemaining: number;
  }>;
  hasReceivedAutomationEmail(userId: string, triggerType: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private programs: Map<string, Program>;
  private memberPrograms: Map<string, MemberProgram>;
  private workouts: Map<string, Workout>;
  private workoutCompletions: Map<string, WorkoutCompletion>;
  private savedWorkouts: Map<string, SavedWorkout>;
  private communityPosts: Map<string, CommunityPost>;
  private postLikes: Map<string, PostLike>;
  private postComments: Map<string, PostComment>;
  private notifications: Map<string, Notification>;
  private terms: Map<string, Terms>;
  private programPurchases: Map<string, ProgramPurchase>;
  private progressTracking: Map<string, ProgressTracking>;
  private knowledgeArticles: Map<string, KnowledgeArticle>;
  private exercises: Map<string, Exercise>;
  private weeklyWorkouts: Map<string, WeeklyWorkout>;
  private reflectionNotes: Map<string, ReflectionNote>;
  private progressPhotos: Map<string, ProgressPhoto>;
  public assetDisplayNames: Map<string, string>;

  constructor() {
    this.users = new Map();
    this.programs = new Map();
    this.memberPrograms = new Map();
    this.workouts = new Map();
    this.workoutCompletions = new Map();
    this.savedWorkouts = new Map();
    this.communityPosts = new Map();
    this.postLikes = new Map();
    this.postComments = new Map();
    this.notifications = new Map();
    this.terms = new Map();
    this.programPurchases = new Map();
    this.progressTracking = new Map();
    this.knowledgeArticles = new Map();
    this.exercises = new Map();
    this.weeklyWorkouts = new Map();
    this.reflectionNotes = new Map();
    this.progressPhotos = new Map();
    this.assetDisplayNames = new Map();

    this.initializeData();
  }

  private initializeData() {
    // Create admin user
    const adminId = randomUUID();
    // Default password: "Admin@123" - hashed with bcrypt
    const admin: User = {
      id: adminId,
      email: "admin@strongerwithzoe.in",
      password: "$2b$10$PWTQam4rNdS4nvS7WTpWjO3ag3YxzUZjDXosgV.1PKGRpTUoBifJK",
      firstName: "Zoe",
      lastName: "Modgill",
      phone: null,
      profilePictureUrl: null,
      profilePictureThumbnailUrl: null,
      isAdmin: true,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      disclaimerAccepted: true,
      disclaimerAcceptedAt: new Date(),
      validFrom: new Date(),
      validUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ),
      hasWhatsAppSupport: false,
      whatsAppSupportDuration: null,
      whatsAppSupportExpiryDate: null,
      country: null,
      bio: null,
      instagramHandle: null,
      postpartumWeeks: null,
      lastLoginAt: null,
      createdAt: new Date(),
    };
    this.users.set(adminId, admin);

    // Create test user
    const userId = randomUUID();
    // Default password: "Test@123" - hashed with bcrypt
    const user: User = {
      id: userId,
      email: "jane@example.com",
      password: "$2b$10$Sn579BPuOvBaDEQxi9WT3u8Z3bWxacipG8nHla1B/KwNWd2Zfi6We",
      firstName: "Jane",
      lastName: "Doe",
      phone: null,
      profilePictureUrl: null,
      profilePictureThumbnailUrl: null,
      isAdmin: false,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      disclaimerAccepted: false,
      disclaimerAcceptedAt: null,
      validFrom: new Date(),
      validUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ),
      hasWhatsAppSupport: false,
      whatsAppSupportDuration: null,
      whatsAppSupportExpiryDate: null,
      country: null,
      bio: null,
      instagramHandle: null,
      postpartumWeeks: null,
      lastLoginAt: null,
      createdAt: new Date(),
    };
    this.users.set(userId, user);

    // Create programs

    // Create Heal Your Core premium program
    const healYourCoreId = randomUUID();
    const healYourCore: Program = {
      id: healYourCoreId,
      name: "Your Postpartum Strength Recovery Program",
      description:
        "A gentle, expert-led program to rebuild your core and pelvic floor, designed for mamas, whether you are 6 weeks or 6 years postpartum.",
      level: "Postnatal",
      duration: "6 Weeks",
      equipment: "Minimal Equipment",
      imageUrl: "/assets/Screenshot 2025-09-24 at 10.19.38_1758689399488.png",
      price: 2500, // Premium pricing for specialized program
      workoutCount: 22, // 4 workouts week 1&6, 3 workouts weeks 2-5
      isActive: true,
      isVisible: true,
    };
    this.programs.set(healYourCoreId, healYourCore);

    // Give test user access to Heal Your Core
    const healYourCorePurchase: ProgramPurchase = {
      id: randomUUID(),
      userId,
      programId: healYourCoreId,
      purchaseDate: new Date(),
      amount: 4500,
      status: "active",
    };
    this.programPurchases.set(healYourCorePurchase.id, healYourCorePurchase);

    // Create terms
    const termsId = randomUUID();
    const activeTerms: Terms = {
      id: termsId,
      title: "Stronger With Zoe Membership Agreement",
      content: `
        <h3>Stronger With Zoe Membership Agreement</h3>
        <p>Welcome to the Stronger With Zoe community. By accessing our fitness programs, you agree to follow our guidelines and respect our community standards.</p>
        
        <h4>Program Usage</h4>
        <ul>
          <li>Programs are for personal use only</li>
          <li>Sharing login credentials is prohibited</li>
          <li>Always consult a physician before starting any fitness program</li>
          <li>Follow proper form and listen to your body</li>
        </ul>

        <h4>Community Guidelines</h4>
        <ul>
          <li>Be respectful and supportive to all members</li>
          <li>No spam, promotional content, or inappropriate material</li>
          <li>Share experiences and encouragement positively</li>
          <li>Report any concerning behavior to moderators</li>
        </ul>

        <p>Last updated: December 2024. These terms may be updated periodically.</p>
      `,
      version: "1.0.0",
      isActive: true,
      createdAt: new Date(),
    };
    this.terms.set(termsId, activeTerms);

    // Create Heal Your Core exercises
    const exercises = [
      {
        id: randomUUID(),
        name: "Deep Core Breathing",
        description:
          "Foundation breathing exercise to reconnect with your core",
        videoUrl: "https://www.youtube.com/embed/example-breathing",
        duration: "2 minutes",
        instructions:
          "Lie on your back with knees bent. Place one hand on chest, one on belly. Breathe deeply into your belly.",
        category: "Breathing",
        difficulty: "beginner",
      },
      {
        id: randomUUID(),
        name: "Pelvic Tilts",
        description: "Gentle movement to activate deep abdominal muscles",
        videoUrl: "https://www.youtube.com/embed/example-pelvic-tilts",
        duration: "10 reps",
        instructions:
          "Lie on back, knees bent. Gently tilt pelvis to flatten lower back against floor.",
        category: "Core",
        difficulty: "beginner",
      },
      {
        id: randomUUID(),
        name: "Modified Plank",
        description: "Adapted plank to rebuild core strength safely",
        videoUrl: "https://www.youtube.com/embed/example-modified-plank",
        duration: "15-30 seconds",
        instructions:
          "Start on knees and forearms. Hold straight line from knees to head.",
        category: "Core",
        difficulty: "beginner",
      },
      {
        id: randomUUID(),
        name: "Wall Push-ups",
        description: "Upper body strengthening with core engagement",
        videoUrl: "https://www.youtube.com/embed/example-wall-pushups",
        duration: "8-12 reps",
        instructions:
          "Stand arm's length from wall. Push against wall, engaging core throughout.",
        category: "Strength",
        difficulty: "beginner",
      },
      {
        id: randomUUID(),
        name: "Bird Dog",
        description: "Core stability exercise for balance and strength",
        videoUrl: "https://www.youtube.com/embed/example-bird-dog",
        duration: "5 reps each side",
        instructions:
          "On hands and knees, extend opposite arm and leg. Hold briefly, return to start.",
        category: "Core",
        difficulty: "intermediate",
      },
    ];

    exercises.forEach((exercise) => {
      this.exercises.set(exercise.id, exercise as Exercise);
    });

    // Create Knowledge Center articles for Heal Your Core
    const knowledgeArticles = [
      {
        id: randomUUID(),
        programId: healYourCoreId,
        title: "Understanding Your Core",
        content:
          "Your core is more than just your abs. It includes your diaphragm, pelvic floor, deep abdominal muscles, and back muscles working together to support your spine and pelvis. After pregnancy, these muscles need time and proper exercises to recover their function.",
        category: "Core-Understanding",
        videoUrl: "https://www.youtube.com/embed/example-core-anatomy",
        orderIndex: 1,
      },
      {
        id: randomUUID(),
        programId: healYourCoreId,
        title: "Diastasis Recti: What You Need to Know",
        content:
          "Diastasis recti is the separation of the rectus abdominis muscles that commonly occurs during pregnancy. Learn how to check for it, understand its impact, and discover safe exercises to help heal this condition naturally.",
        category: "Diastasis-Recti",
        videoUrl: "https://www.youtube.com/embed/example-diastasis-check",
        orderIndex: 2,
      },
      {
        id: randomUUID(),
        programId: healYourCoreId,
        title: "The Role of Nutrition in Recovery",
        content:
          "Proper nutrition supports your body's healing process and gives you energy for your workouts. Focus on whole foods, adequate protein, healthy fats, and staying hydrated to optimize your recovery journey.",
        category: "Nutrition",
        videoUrl: "https://www.youtube.com/embed/example-nutrition-tips",
        orderIndex: 3,
      },
      {
        id: randomUUID(),
        programId: healYourCoreId,
        title: "Breathing Techniques for Core Recovery",
        content:
          "Proper breathing is fundamental to core recovery. Learn the 360-degree breathing technique that helps activate your deep core muscles and supports your healing process.",
        category: "Breathing",
        videoUrl: "https://www.youtube.com/embed/example-breathing-techniques",
        orderIndex: 4,
      },
    ];

    knowledgeArticles.forEach((article) => {
      this.knowledgeArticles.set(article.id, article as KnowledgeArticle);
    });

    // Create weekly workouts for Heal Your Core (6 weeks)
    const healYourCoreExercises = exercises.filter(
      (ex) => ex.category === "Breathing" || ex.category === "Core"
    );

    // Week 1 & 6: 4 workouts per week
    [1, 6].forEach((week) => {
      [1, 2, 3, 4].forEach((day) => {
        healYourCoreExercises.forEach((exercise, index) => {
          const weeklyWorkout: WeeklyWorkout = {
            id: randomUUID(),
            programId: healYourCoreId,
            week,
            day,
            exerciseId: exercise.id,
            orderIndex: index,
            isOptional: false,
          };
          this.weeklyWorkouts.set(weeklyWorkout.id, weeklyWorkout);
        });
      });
    });

    // Weeks 2, 3, 4, 5: 3 workouts per week
    [2, 3, 4, 5].forEach((week) => {
      [1, 3, 5].forEach((day) => {
        // Monday, Wednesday, Friday
        healYourCoreExercises.forEach((exercise, index) => {
          const weeklyWorkout: WeeklyWorkout = {
            id: randomUUID(),
            programId: healYourCoreId,
            week,
            day,
            exerciseId: exercise.id,
            orderIndex: index,
            isOptional: false,
          };
          this.weeklyWorkouts.set(weeklyWorkout.id, weeklyWorkout);
        });
      });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      phone: insertUser.phone ?? null,
      profilePictureUrl: insertUser.profilePictureUrl ?? null,
      isAdmin: insertUser.isAdmin ?? false,
      termsAccepted: insertUser.termsAccepted ?? false,
      termsAcceptedAt: insertUser.termsAcceptedAt ?? null,
      disclaimerAccepted: insertUser.disclaimerAccepted ?? false,
      disclaimerAcceptedAt: insertUser.disclaimerAcceptedAt ?? null,
      validFrom: insertUser.validFrom ?? new Date(),
      validUntil:
        insertUser.validUntil ??
        new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      hasWhatsAppSupport: insertUser.hasWhatsAppSupport ?? false,
      whatsAppSupportDuration: insertUser.whatsAppSupportDuration ?? null,
      whatsAppSupportExpiryDate: insertUser.whatsAppSupportExpiryDate ?? null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(
    id: string,
    updates: Partial<User>
  ): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      ...updates,
      phone: updates.phone !== undefined ? updates.phone || null : user.phone,
      profilePictureUrl:
        updates.profilePictureUrl !== undefined
          ? updates.profilePictureUrl || null
          : user.profilePictureUrl,
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getPrograms(): Promise<Program[]> {
    return Array.from(this.programs.values());
  }

  async getProgram(id: string): Promise<Program | undefined> {
    return this.programs.get(id);
  }

  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const id = randomUUID();
    const program: Program = {
      ...insertProgram,
      id,
      isActive: insertProgram.isActive ?? true,
      isVisible: insertProgram.isVisible ?? true,
    };
    this.programs.set(id, program);
    return program;
  }

  async updateProgram(
    id: string,
    updates: Partial<Program>
  ): Promise<Program | undefined> {
    const program = this.programs.get(id);
    if (!program) return undefined;

    const updatedProgram = { ...program, ...updates };
    this.programs.set(id, updatedProgram);
    return updatedProgram;
  }

  async getMemberPrograms(
    userId: string
  ): Promise<(MemberProgram & { program: Program })[]> {
    const memberPrograms = Array.from(this.memberPrograms.values()).filter(
      (mp) => mp.userId === userId
    );

    return memberPrograms.map((mp) => ({
      ...mp,
      program: this.programs.get(mp.programId)!,
    }));
  }

  async createMemberProgram(
    insertMemberProgram: InsertMemberProgram
  ): Promise<MemberProgram> {
    const id = randomUUID();
    const memberProgram: MemberProgram = {
      ...insertMemberProgram,
      id,
      purchaseDate: new Date(),
      isActive: insertMemberProgram.isActive ?? true,
      progress: insertMemberProgram.progress ?? 0,
    };
    this.memberPrograms.set(id, memberProgram);
    return memberProgram;
  }

  async deleteMemberProgram(enrollmentId: string): Promise<void> {
    this.memberPrograms.delete(enrollmentId);
  }

  async getWorkoutsByProgram(programId: string): Promise<Workout[]> {
    return Array.from(this.workouts.values()).filter(
      (w) => w.programId === programId
    );
  }

  async getWorkout(id: string): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }

  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const id = randomUUID();
    const workout: Workout = { ...insertWorkout, id };
    this.workouts.set(id, workout);
    return workout;
  }

  async getWorkoutCompletions(userId: string): Promise<WorkoutCompletion[]> {
    return Array.from(this.workoutCompletions.values()).filter(
      (wc) => wc.userId === userId
    );
  }

  async createWorkoutCompletion(
    insertCompletion: InsertWorkoutCompletion
  ): Promise<WorkoutCompletion> {
    const id = randomUUID();
    const completion: WorkoutCompletion = {
      ...insertCompletion,
      id,
      completedAt: new Date(),
      challengeRating: insertCompletion.challengeRating || null,
      notes: insertCompletion.notes || null,
      photoUrl: insertCompletion.photoUrl || null,
      duration: insertCompletion.duration || null,
      mood: insertCompletion.mood || null,
    };
    this.workoutCompletions.set(id, completion);
    return completion;
  }

  async getSavedWorkouts(
    userId: string
  ): Promise<(SavedWorkout & { workout: Workout })[]> {
    const savedWorkouts = Array.from(this.savedWorkouts.values()).filter(
      (sw) => sw.userId === userId
    );

    return savedWorkouts.map((sw) => ({
      ...sw,
      workout: this.workouts.get(sw.workoutId)!,
    }));
  }

  async createSavedWorkout(
    insertSavedWorkout: InsertSavedWorkout
  ): Promise<SavedWorkout> {
    const id = randomUUID();
    const savedWorkout: SavedWorkout = {
      ...insertSavedWorkout,
      id,
      savedAt: new Date(),
    };
    this.savedWorkouts.set(id, savedWorkout);
    return savedWorkout;
  }

  async deleteSavedWorkout(
    userId: string,
    workoutId: string
  ): Promise<boolean> {
    const savedWorkout = Array.from(this.savedWorkouts.values()).find(
      (sw) => sw.userId === userId && sw.workoutId === workoutId
    );

    if (savedWorkout) {
      this.savedWorkouts.delete(savedWorkout.id);
      return true;
    }
    return false;
  }

  // Community Posts - stub implementations
  async getCommunityPosts(filters?: {
    category?: string;
    weekNumber?: number;
    userId?: string;
    sortBy?: 'newest' | 'mostLiked';
  }): Promise<
    (CommunityPost & {
      user: Pick<User, "id" | "firstName" | "lastName" | "profilePictureUrl" | "profilePictureThumbnailUrl">;
      likeCount: number;
      commentCount: number;
      isLikedByUser?: boolean;
      likes?: Array<{ userId: string; userName: string }>;
    })[]
  > {
    let posts = Array.from(this.communityPosts.values());

    // Apply filters
    if (filters?.category) {
      posts = posts.filter((post) => post.category === filters.category);
    }
    if (filters?.weekNumber !== undefined) {
      posts = posts.filter((post) => post.weekNumber === filters.weekNumber);
    }
    if (filters?.userId) {
      posts = posts.filter((post) => post.userId === filters.userId);
    }

    // Calculate counts and likes for each post
    const enrichedPosts = posts.map((post) => {
      const postLikes = Array.from(this.postLikes.values()).filter(
        (like) => like.postId === post.id
      );
      const postComments = Array.from(this.postComments.values()).filter(
        (comment) => comment.postId === post.id
      );
      const user = this.users.get(post.userId);

      return {
        ...post,
        user: {
          id: user?.id || "",
          firstName: user?.firstName || "Unknown",
          lastName: user?.lastName || "User",
          profilePictureUrl: user?.profilePictureUrl || null,
          profilePictureThumbnailUrl: user?.profilePictureThumbnailUrl || null,
        },
        likeCount: postLikes.length,
        commentCount: postComments.length,
        likes: postLikes.map((like) => {
          const likeUser = this.users.get(like.userId);
          return {
            userId: like.userId,
            userName: likeUser
              ? `${likeUser.firstName} ${likeUser.lastName}`
              : "Unknown User",
          };
        }),
      };
    });

    // Sort posts
    const sortBy = filters?.sortBy || 'newest';
    if (sortBy === 'mostLiked') {
      enrichedPosts.sort((a, b) => {
        // Featured posts at the top
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        // Then by like count
        return b.likeCount - a.likeCount;
      });
    } else {
      // Sort by newest (default)
      enrichedPosts.sort((a, b) => {
        // Featured posts at the top
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        // Then by date
        return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
      });
    }

    return enrichedPosts;
  }

  async getPostById(
    postId: string,
    currentUserId?: string
  ): Promise<
    | (CommunityPost & {
        user: Pick<User, "id" | "firstName" | "lastName" | "profilePictureUrl" | "profilePictureThumbnailUrl">;
        likeCount: number;
        commentCount: number;
        isLikedByUser: boolean;
        likes: Array<{ userId: string; userName: string }>;
      })
    | undefined
  > {
    const post = this.communityPosts.get(postId);
    if (!post) return undefined;

    const postLikes = Array.from(this.postLikes.values()).filter(
      (like) => like.postId === postId
    );
    const postComments = Array.from(this.postComments.values()).filter(
      (comment) => comment.postId === postId
    );
    const user = this.users.get(post.userId);
    const isLikedByUser = currentUserId
      ? postLikes.some((like) => like.userId === currentUserId)
      : false;

    return {
      ...post,
      user: {
        id: user?.id || "",
        firstName: user?.firstName || "Unknown",
        lastName: user?.lastName || "User",
        profilePictureUrl: user?.profilePictureUrl || null,
        profilePictureThumbnailUrl: user?.profilePictureThumbnailUrl || null,
      },
      likeCount: postLikes.length,
      commentCount: postComments.length,
      isLikedByUser,
      likes: postLikes.map((like) => {
        const likeUser = this.users.get(like.userId);
        return {
          userId: like.userId,
          userName: likeUser
            ? `${likeUser.firstName} ${likeUser.lastName}`
            : "Unknown User",
        };
      }),
    };
  }

  async createCommunityPost(
    insertPost: InsertCommunityPost
  ): Promise<CommunityPost> {
    const id = randomUUID();
    const post: CommunityPost = {
      ...insertPost,
      id,
      imageUrls: insertPost.imageUrls || null,
      cloudinaryPublicIds: insertPost.cloudinaryPublicIds || null,
      weekNumber: insertPost.weekNumber || null,
      category: insertPost.category || "general",
      featured: insertPost.featured || false,
      isReported: insertPost.isReported || false,
      isSensitiveContent: insertPost.isSensitiveContent || false,
      createdAt: new Date(),
    };
    this.communityPosts.set(id, post);
    return post;
  }

  async deletePost(postId: string, userId: string): Promise<boolean> {
    const post = this.communityPosts.get(postId);
    if (!post || post.userId !== userId) {
      return false;
    }
    this.communityPosts.delete(postId);
    return true;
  }

  async reportPost(postId: string): Promise<boolean> {
    const post = this.communityPosts.get(postId);
    if (!post) return false;
    post.isReported = true;
    this.communityPosts.set(postId, post);
    return true;
  }

  async markPostAsFeatured(postId: string, featured: boolean): Promise<boolean> {
    const post = this.communityPosts.get(postId);
    if (!post) return false;
    post.featured = featured;
    this.communityPosts.set(postId, post);
    return true;
  }

  // Post Likes
  async likePost(userId: string, postId: string): Promise<PostLike> {
    // Check if already liked
    const existingLike = Array.from(this.postLikes.values()).find(
      (like) => like.userId === userId && like.postId === postId
    );
    if (existingLike) {
      return existingLike;
    }

    const id = randomUUID();
    const like: PostLike = {
      id,
      userId,
      postId,
      createdAt: new Date(),
    };
    this.postLikes.set(id, like);
    return like;
  }

  async unlikePost(userId: string, postId: string): Promise<boolean> {
    const like = Array.from(this.postLikes.values()).find(
      (like) => like.userId === userId && like.postId === postId
    );
    if (!like) return false;
    this.postLikes.delete(like.id);
    return true;
  }

  async getPostLikes(postId: string): Promise<
    Array<{ userId: string; userName: string; createdAt: Date }>
  > {
    const likes = Array.from(this.postLikes.values()).filter(
      (like) => like.postId === postId
    );

    return likes.map((like) => {
      const user = this.users.get(like.userId);
      return {
        userId: like.userId,
        userName: user
          ? `${user.firstName} ${user.lastName}`
          : "Unknown User",
        createdAt: like.createdAt || new Date(),
      };
    });
  }

  // Post Comments
  async createComment(comment: InsertPostComment): Promise<PostComment> {
    const id = randomUUID();
    const newComment: PostComment = {
      ...comment,
      id,
      createdAt: new Date(),
    };
    this.postComments.set(id, newComment);
    return newComment;
  }

  async getPostComments(
    postId: string
  ): Promise<
    (PostComment & {
      user: Pick<User, "id" | "firstName" | "lastName" | "profilePictureUrl" | "profilePictureThumbnailUrl">;
    })[]
  > {
    const comments = Array.from(this.postComments.values())
      .filter((comment) => comment.postId === postId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));

    return comments.map((comment) => {
      const user = this.users.get(comment.userId);
      return {
        ...comment,
        user: {
          id: user?.id || "",
          firstName: user?.firstName || "Unknown",
          lastName: user?.lastName || "User",
          profilePictureUrl: user?.profilePictureUrl || null,
          profilePictureThumbnailUrl: user?.profilePictureThumbnailUrl || null,
        },
      };
    });
  }

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    const comment = this.postComments.get(commentId);
    if (!comment || comment.userId !== userId) {
      return false;
    }
    this.postComments.delete(commentId);
    return true;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createNotification(
    insertNotification: InsertNotification
  ): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insertNotification,
      id,
      isRead: insertNotification.isRead ?? false,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: string): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      return true;
    }
    return false;
  }

  async getActiveTerms(): Promise<Terms | undefined> {
    return Array.from(this.terms.values()).find((t) => t.isActive);
  }

  async createTerms(insertTerms: InsertTerms): Promise<Terms> {
    const id = randomUUID();
    const terms: Terms = {
      ...insertTerms,
      id,
      isActive: insertTerms.isActive ?? false,
      createdAt: new Date(),
    };
    this.terms.set(id, terms);
    return terms;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserStats(): Promise<{
    totalMembers: number;
    activeMembers: number;
    expiringSoon: number;
    expiringUsers: Array<{
      userId: string;
      userName: string;
      programExpiring: boolean;
      whatsAppExpiring: boolean;
      programExpiryDate?: Date;
      whatsAppExpiryDate?: Date;
    }>;
  }> {
    const users = Array.from(this.users.values());
    const memberPrograms = Array.from(this.memberPrograms.values());
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const totalMembers = users.filter((u) => !u.isAdmin).length;
    const activeMembers = users.filter(
      (u) => !u.isAdmin && u.termsAccepted
    ).length;

    const expiringUsers: Array<{
      userId: string;
      userName: string;
      programExpiring: boolean;
      whatsAppExpiring: boolean;
      programExpiryDate?: Date;
      whatsAppExpiryDate?: Date;
    }> = [];

    for (const user of users.filter(u => !u.isAdmin)) {
      const programExpiring = memberPrograms.some(mp => 
        mp.userId === user.id &&
        mp.expiryDate &&
        mp.expiryDate > now &&
        mp.expiryDate <= oneWeekFromNow
      );

      const whatsAppExpiring = 
        user.whatsAppSupportExpiryDate &&
        user.whatsAppSupportExpiryDate > now &&
        user.whatsAppSupportExpiryDate <= oneWeekFromNow;

      if (programExpiring || whatsAppExpiring) {
        const userProgram = memberPrograms.find(mp => 
          mp.userId === user.id &&
          mp.expiryDate &&
          mp.expiryDate > now &&
          mp.expiryDate <= oneWeekFromNow
        );

        expiringUsers.push({
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          programExpiring: !!programExpiring,
          whatsAppExpiring: !!whatsAppExpiring,
          programExpiryDate: userProgram?.expiryDate,
          whatsAppExpiryDate: user.whatsAppSupportExpiryDate || undefined,
        });
      }
    }

    return { 
      totalMembers, 
      activeMembers, 
      expiringSoon: expiringUsers.length,
      expiringUsers 
    };
  }

  async getAnalytics() {
    const users = Array.from(this.users.values()).filter(u => !u.isAdmin);
    const memberPrograms = Array.from(this.memberPrograms.values());
    const workoutCompletions = Array.from(this.workoutCompletions.values());
    const posts = Array.from(this.communityPosts.values());
    const likes = Array.from(this.postLikes.values());
    const comments = Array.from(this.postComments.values());
    const now = new Date();

    // Demographics
    const byCountry = users.reduce((acc, user) => {
      const country = user.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPostpartumStage = users.reduce((acc, user) => {
      if (!user.postpartumWeeks) {
        acc['Unknown'] = (acc['Unknown'] || 0) + 1;
      } else if (user.postpartumWeeks < 12) {
        acc['0-3 months'] = (acc['0-3 months'] || 0) + 1;
      } else if (user.postpartumWeeks < 26) {
        acc['3-6 months'] = (acc['3-6 months'] || 0) + 1;
      } else if (user.postpartumWeeks < 52) {
        acc['6-12 months'] = (acc['6-12 months'] || 0) + 1;
      } else if (user.postpartumWeeks < 104) {
        acc['1-2 years'] = (acc['1-2 years'] || 0) + 1;
      } else {
        acc['2+ years'] = (acc['2+ years'] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const instagramHandlesCollected = users.filter(u => u.instagramHandle).length;

    // Engagement
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const activeUsers = {
      today: users.filter(u => u.lastLoginAt && u.lastLoginAt >= todayStart).length,
      last7Days: users.filter(u => u.lastLoginAt && u.lastLoginAt >= sevenDaysAgo).length,
      last30Days: users.filter(u => u.lastLoginAt && u.lastLoginAt >= thirtyDaysAgo).length,
      last90Days: users.filter(u => u.lastLoginAt && u.lastLoginAt >= ninetyDaysAgo).length,
    };

    const dormantUsers = {
      today: users.filter(u => !u.lastLoginAt || u.lastLoginAt < todayStart).length,
      dormant7Days: users.filter(u => !u.lastLoginAt || u.lastLoginAt < sevenDaysAgo).length,
      dormant30Days: users.filter(u => !u.lastLoginAt || u.lastLoginAt < thirtyDaysAgo).length,
      dormant90Days: users.filter(u => !u.lastLoginAt || u.lastLoginAt < ninetyDaysAgo).length,
    };

    // Find earliest tracking date
    const usersWithLogins = users.filter(u => u.lastLoginAt);
    const trackingStartDate = usersWithLogins.length > 0
      ? new Date(Math.min(...usersWithLogins.map(u => u.lastLoginAt!.getTime())))
      : null;

    // Program Performance
    const totalWorkoutCompletions = workoutCompletions.length;
    const averageWorkoutsPerUser = users.length > 0 ? totalWorkoutCompletions / users.length : 0;

    const completionRates = {
      completed: memberPrograms.filter(mp => mp.completionPercentage === 100).length,
      inProgress: memberPrograms.filter(mp => mp.completionPercentage && mp.completionPercentage > 0 && mp.completionPercentage < 100).length,
      notStarted: memberPrograms.filter(mp => !mp.completionPercentage || mp.completionPercentage === 0).length,
    };

    const progressDistribution = [
      { range: '0%', count: memberPrograms.filter(mp => !mp.completionPercentage || mp.completionPercentage === 0).length },
      { range: '1-25%', count: memberPrograms.filter(mp => mp.completionPercentage && mp.completionPercentage > 0 && mp.completionPercentage <= 25).length },
      { range: '26-50%', count: memberPrograms.filter(mp => mp.completionPercentage && mp.completionPercentage > 25 && mp.completionPercentage <= 50).length },
      { range: '51-75%', count: memberPrograms.filter(mp => mp.completionPercentage && mp.completionPercentage > 50 && mp.completionPercentage <= 75).length },
      { range: '76-99%', count: memberPrograms.filter(mp => mp.completionPercentage && mp.completionPercentage > 75 && mp.completionPercentage < 100).length },
      { range: '100%', count: memberPrograms.filter(mp => mp.completionPercentage === 100).length },
    ];

    const moods = workoutCompletions.filter(wc => wc.mood).map(wc => {
      const moodMap: Record<string, number> = { 'great': 5, 'good': 4, 'okay': 3, 'tired': 2, 'challenging': 1 };
      return moodMap[wc.mood!] || 3;
    });
    const averageMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 0;

    const ratings = workoutCompletions.filter(wc => wc.challengeRating).map(wc => wc.challengeRating!);
    const averageChallengeRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    // Community Health
    const totalPosts = posts.length;
    const totalLikes = likes.length;
    const totalComments = comments.length;
    const usersWhoPosted = new Set(posts.map(p => p.userId));
    const participationRate = users.length > 0 ? (usersWhoPosted.size / users.length) * 100 : 0;

    const byCategory = posts.reduce((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(byCategory)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const postsByUser = posts.reduce((acc, post) => {
      acc[post.userId] = (acc[post.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topContributors = Object.entries(postsByUser)
      .map(([userId, postCount]) => {
        const user = users.find(u => u.id === userId);
        return {
          userId,
          userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          postCount,
        };
      })
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 10);

    // Business Metrics
    const whatsAppAdoption = users.filter(u => u.hasWhatsAppSupport).length;
    const programCompletions = memberPrograms.filter(mp => mp.completedAt).length;
    
    const completedPrograms = memberPrograms.filter(mp => mp.completedAt && mp.purchaseDate);
    const avgCompletionTimeMs = completedPrograms.length > 0
      ? completedPrograms.reduce((sum, mp) => {
          const timeToComplete = mp.completedAt!.getTime() - mp.purchaseDate!.getTime();
          return sum + timeToComplete;
        }, 0) / completedPrograms.length
      : 0;
    const averageCompletionTime = avgCompletionTimeMs / (1000 * 60 * 60 * 24); // Convert to days

    return {
      demographics: {
        totalUsers: users.length,
        byCountry: Object.entries(byCountry).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count),
        byPostpartumStage: Object.entries(byPostpartumStage).map(([stage, count]) => ({ stage, count })),
        instagramHandlesCollected,
      },
      engagement: {
        activeUsers,
        dormantUsers,
        averageLoginFrequency: 0, // Would need more granular tracking
        trackingStartDate,
      },
      programPerformance: {
        totalWorkoutCompletions,
        averageWorkoutsPerUser,
        completionRates,
        progressDistribution,
        averageMood,
        averageChallengeRating,
      },
      communityHealth: {
        totalPosts,
        totalLikes,
        totalComments,
        participationRate,
        topCategories,
        topContributors,
      },
      businessMetrics: {
        whatsAppAdoption,
        programCompletions,
        averageCompletionTime,
      },
    };
  }

  // Program Purchases methods
  async createProgramPurchase(
    insertPurchase: InsertProgramPurchase
  ): Promise<ProgramPurchase> {
    const id = randomUUID();
    const purchase: ProgramPurchase = {
      ...insertPurchase,
      id,
      status: insertPurchase.status ?? "active",
      purchaseDate: new Date(),
    };
    this.programPurchases.set(id, purchase);
    return purchase;
  }

  async getUserPurchases(userId: string): Promise<ProgramPurchase[]> {
    return Array.from(this.programPurchases.values()).filter(
      (purchase) => purchase.userId === userId
    );
  }

  async hasProgramAccess(userId: string, programId: string): Promise<boolean> {
    const purchase = Array.from(this.programPurchases.values()).find(
      (p) =>
        p.userId === userId &&
        p.programId === programId &&
        p.status === "active"
    );
    return !!purchase;
  }

  // Progress Tracking methods
  async createProgressEntry(
    insertEntry: InsertProgressTracking
  ): Promise<ProgressTracking> {
    const id = randomUUID();
    const entry: ProgressTracking = {
      ...insertEntry,
      id,
      notes: insertEntry.notes ?? null,
      drGapMeasurement: insertEntry.drGapMeasurement ?? null,
      coreConnectionScore: insertEntry.coreConnectionScore ?? null,
      pelvicFloorSymptoms: insertEntry.pelvicFloorSymptoms ?? null,
      postureBackDiscomfort: insertEntry.postureBackDiscomfort ?? null,
      energyLevel: insertEntry.energyLevel ?? null,
      recordedAt: new Date(),
    };
    this.progressTracking.set(id, entry);
    return entry;
  }

  async getProgressEntries(
    userId: string,
    programId: string
  ): Promise<ProgressTracking[]> {
    return Array.from(this.progressTracking.values())
      .filter(
        (entry) => entry.userId === userId && entry.programId === programId
      )
      .sort((a, b) => a.week - b.week);
  }

  async updateProgressEntry(
    id: string,
    updates: Partial<ProgressTracking>
  ): Promise<ProgressTracking | undefined> {
    const entry = this.progressTracking.get(id);
    if (!entry) return undefined;

    const updatedEntry = { ...entry, ...updates };
    this.progressTracking.set(id, updatedEntry);
    return updatedEntry;
  }

  // Knowledge Articles methods
  async createKnowledgeArticle(
    insertArticle: InsertKnowledgeArticle
  ): Promise<KnowledgeArticle> {
    const id = randomUUID();
    const article: KnowledgeArticle = {
      ...insertArticle,
      id,
      videoUrl: insertArticle.videoUrl ?? null,
      orderIndex: insertArticle.orderIndex ?? null,
      createdAt: new Date(),
    };
    this.knowledgeArticles.set(id, article);
    return article;
  }

  async getKnowledgeArticles(programId: string): Promise<KnowledgeArticle[]> {
    return Array.from(this.knowledgeArticles.values())
      .filter((article) => article.programId === programId)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }

  // Exercise methods
  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const exercise: Exercise = {
      ...insertExercise,
      id,
      duration: insertExercise.duration ?? null,
      instructions: insertExercise.instructions ?? null,
      difficulty: insertExercise.difficulty ?? null,
    };
    this.exercises.set(id, exercise);
    return exercise;
  }

  async getExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  // Weekly Workout methods
  async createWeeklyWorkout(
    insertWorkout: InsertWeeklyWorkout
  ): Promise<WeeklyWorkout> {
    const id = randomUUID();
    const workout: WeeklyWorkout = {
      ...insertWorkout,
      id,
      orderIndex: insertWorkout.orderIndex ?? null,
      isOptional: insertWorkout.isOptional ?? null,
    };
    this.weeklyWorkouts.set(id, workout);
    return workout;
  }

  async getWeeklyWorkouts(
    programId: string,
    week: number
  ): Promise<(WeeklyWorkout & { exercise: Exercise })[]> {
    const weeklyWorkouts = Array.from(this.weeklyWorkouts.values())
      .filter(
        (workout) => workout.programId === programId && workout.week === week
      )
      .sort(
        (a, b) => a.day - b.day || (a.orderIndex || 0) - (b.orderIndex || 0)
      );

    return weeklyWorkouts.map((workout) => ({
      ...workout,
      exercise: this.exercises.get(workout.exerciseId)!,
    }));
  }

  async getAllWeeklyWorkouts(
    programId: string
  ): Promise<(WeeklyWorkout & { exercise: Exercise })[]> {
    const weeklyWorkouts = Array.from(this.weeklyWorkouts.values())
      .filter((workout) => workout.programId === programId)
      .sort(
        (a, b) =>
          a.week - b.week ||
          a.day - b.day ||
          (a.orderIndex || 0) - (b.orderIndex || 0)
      );

    return weeklyWorkouts.map((workout) => ({
      ...workout,
      exercise: this.exercises.get(workout.exerciseId)!,
    }));
  }

  // Progress Photos
  async createProgressPhoto(photo: InsertProgressPhoto): Promise<ProgressPhoto> {
    const id = randomUUID();
    const newPhoto: ProgressPhoto = {
      ...photo,
      id,
      programId: photo.programId || null,
      notes: photo.notes || null,
      cloudinaryPublicId: photo.cloudinaryPublicId || null,
      fileSize: photo.fileSize || null,
      width: photo.width || null,
      height: photo.height || null,
      uploadedAt: new Date(),
    };
    this.progressPhotos.set(id, newPhoto);
    return newPhoto;
  }

  async getProgressPhotos(userId: string): Promise<ProgressPhoto[]> {
    return Array.from(this.progressPhotos.values())
      .filter((photo) => photo.userId === userId)
      .sort((a, b) => b.uploadedAt!.getTime() - a.uploadedAt!.getTime());
  }

  async deleteProgressPhoto(id: string): Promise<boolean> {
    return this.progressPhotos.delete(id);
  }

  // Reflection Notes
  async createReflectionNote(
    note: InsertReflectionNote
  ): Promise<ReflectionNote> {
    const id = randomUUID();
    const newNote: ReflectionNote = {
      ...note,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.reflectionNotes.set(id, newNote);
    return newNote;
  }

  async getReflectionNote(
    userId: string,
    programId: string
  ): Promise<ReflectionNote | undefined> {
    return Array.from(this.reflectionNotes.values()).find(
      (note) => note.userId === userId && note.programId === programId
    );
  }

  async updateReflectionNote(
    userId: string,
    programId: string,
    noteText: string
  ): Promise<ReflectionNote> {
    const existingNote = await this.getReflectionNote(userId, programId);

    if (existingNote) {
      existingNote.noteText = noteText;
      existingNote.updatedAt = new Date();
      this.reflectionNotes.set(existingNote.id, existingNote);
      return existingNote;
    } else {
      // Create new note if none exists
      return this.createReflectionNote({
        userId,
        programId,
        noteText,
      });
    }
  }

  // Email Templates (stub implementations for in-memory storage)
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return [];
  }

  async getEmailTemplate(id: string): Promise<EmailTemplate | undefined> {
    return undefined;
  }

  async getEmailTemplateByType(type: string): Promise<EmailTemplate | undefined> {
    return undefined;
  }

  async updateEmailTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate | undefined> {
    return undefined;
  }

  async incrementTemplateSends(templateId: string): Promise<void> {
    // No-op
  }

  // Email Campaigns (stub implementations for in-memory storage)
  async createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign> {
    throw new Error("Email campaigns not supported in MemStorage");
  }

  async getEmailCampaigns(): Promise<EmailCampaign[]> {
    return [];
  }

  async getEmailCampaign(id: string): Promise<EmailCampaign | undefined> {
    return undefined;
  }

  async updateEmailCampaign(id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign | undefined> {
    return undefined;
  }

  async deleteEmailCampaign(id: string): Promise<boolean> {
    return false;
  }

  async getTargetedUsers(audienceFilter: import("@shared/schema").AudienceFilter): Promise<User[]> {
    return [];
  }

  async createCampaignRecipients(recipients: InsertEmailCampaignRecipient[]): Promise<EmailCampaignRecipient[]> {
    return [];
  }

  async getCampaignRecipients(campaignId: string): Promise<EmailCampaignRecipient[]> {
    return [];
  }

  async updateRecipientStatus(recipientId: string, status: string, sentAt?: Date, errorMessage?: string, messageId?: string): Promise<void> {
    // No-op for MemStorage
  }

  async recordEmailOpen(open: InsertEmailOpen): Promise<EmailOpen> {
    throw new Error("Email tracking not supported in MemStorage");
  }

  async getEmailOpens(campaignId: string): Promise<EmailOpen[]> {
    return [];
  }

  async getEmailAutomationRules(): Promise<EmailAutomationRule[]> {
    return [];
  }

  async getEmailAutomationRule(id: string): Promise<EmailAutomationRule | undefined> {
    return undefined;
  }

  async getEmailAutomationRuleByTriggerType(triggerType: string): Promise<EmailAutomationRule | undefined> {
    return undefined;
  }

  async updateEmailAutomationRule(id: string, updates: Partial<EmailAutomationRule>): Promise<EmailAutomationRule | undefined> {
    return undefined;
  }

  async incrementAutomationRuleSent(id: string): Promise<void> {
    // No-op
  }

  // Password Reset Codes (MemStorage stubs)
  async createPasswordResetCode(email: string, code: string, expiresAt: Date): Promise<PasswordResetCode> {
    throw new Error("Password reset not supported in MemStorage");
  }

  async getValidPasswordResetCode(email: string, code: string): Promise<PasswordResetCode | undefined> {
    return undefined;
  }

  async markPasswordResetCodeAsVerified(id: string): Promise<void> {
    // No-op
  }

  async deletePasswordResetCodes(email: string): Promise<void> {
    // No-op
  }

  // User Check-ins (MemStorage stubs)
  async createUserCheckin(checkin: InsertUserCheckin): Promise<UserCheckin> {
    throw new Error("User check-ins not supported in MemStorage");
  }

  async updateUserCheckin(id: string, userId: string, data: Partial<InsertUserCheckin>): Promise<UserCheckin | undefined> {
    return undefined;
  }

  async getUserCheckins(userId: string): Promise<UserCheckin[]> {
    return [];
  }

  async getTodayCheckin(userId: string): Promise<UserCheckin | null> {
    return null;
  }

  async getRecentCheckins(limit?: number): Promise<(UserCheckin & { user: Pick<User, 'id' | 'firstName' | 'lastName'> })[]> {
    return [];
  }

  async getCheckinAnalytics(): Promise<{
    totalCheckins: number;
    checkinsByMood: { mood: string; count: number }[];
    checkinsByEnergy: { energyLevel: number; count: number }[];
    popularGoals: { goal: string; count: number }[];
    checkinFrequency: { period: string; count: number }[];
  }> {
    return {
      totalCheckins: 0,
      checkinsByMood: [],
      checkinsByEnergy: [],
      popularGoals: [],
      checkinFrequency: [],
    };
  }

  // Daily Performance Check-ins (MemStorage stubs)
  async createDailyCheckin(checkin: InsertDailyCheckin): Promise<DailyCheckin> {
    throw new Error("Daily check-ins not supported in MemStorage");
  }

  async updateDailyCheckin(id: string, userId: string, updates: Partial<InsertDailyCheckin>): Promise<DailyCheckin | undefined> {
    return undefined;
  }

  async getDailyCheckin(userId: string, date: Date): Promise<DailyCheckin | undefined> {
    return undefined;
  }

  async getTodayDailyCheckin(userId: string): Promise<DailyCheckin | undefined> {
    return undefined;
  }

  async getWeeklyDailyCheckins(userId: string, weekStartDate: Date): Promise<DailyCheckin[]> {
    return [];
  }

  async getDailyCheckinStats(userId: string, days?: number): Promise<{
    totalCheckins: number;
    workoutDays: number;
    breathingDays: number;
    avgWaterGlasses: number;
    avgCardioMinutes: number;
    currentStreak: number;
  }> {
    return {
      totalCheckins: 0,
      workoutDays: 0,
      breathingDays: 0,
      avgWaterGlasses: 0,
      avgCardioMinutes: 0,
      currentStreak: 0,
    };
  }

  // Workout Program Content (MemStorage stubs - not used in production)
  async getWorkoutProgramContent(): Promise<WorkoutProgramContent[]> {
    return [];
  }

  async getWorkoutProgramContentByWeek(week: number): Promise<WorkoutProgramContent | undefined> {
    return undefined;
  }

  async getWorkoutContentExercises(programContentId: string): Promise<WorkoutContentExercise[]> {
    return [];
  }

  async getFullWorkoutPrograms(): Promise<Array<WorkoutProgramContent & { exercises: WorkoutContentExercise[] }>> {
    return [];
  }

  async updateWorkoutProgramContent(id: string, updates: Partial<InsertWorkoutProgramContent>): Promise<WorkoutProgramContent | undefined> {
    return undefined;
  }

  async updateWorkoutContentExercise(id: string, updates: Partial<InsertWorkoutContentExercise>): Promise<WorkoutContentExercise | undefined> {
    return undefined;
  }

  async createWorkoutContentExercise(exercise: InsertWorkoutContentExercise): Promise<WorkoutContentExercise> {
    throw new Error("Workout content not supported in MemStorage");
  }

  async deleteWorkoutContentExercise(id: string): Promise<boolean> {
    return false;
  }

  async reorderWorkoutContentExercises(programContentId: string, sectionType: string, exerciseIds: string[]): Promise<void> {
    // No-op
  }

  // Educational Topics (stubs)
  async getEducationalTopics(): Promise<EducationalTopic[]> {
    return [];
  }

  async getEducationalTopicBySlug(slug: string): Promise<EducationalTopic | undefined> {
    return undefined;
  }

  // Activity Logs (stubs)
  async createActivityLog(userId: string, activityType: string, metadata?: Record<string, any>): Promise<void> {
    // No-op
  }

  async getRecentActivityLogs(limit?: number): Promise<Array<{
    id: string;
    userId: string;
    activityType: string;
    metadata: Record<string, any> | null;
    createdAt: Date | null;
    user: Pick<User, 'id' | 'firstName' | 'lastName' | 'profilePictureUrl'>;
  }>> {
    return [];
  }

  async getActivityLogsForUser(userId: string, limit?: number): Promise<Array<{
    id: string;
    activityType: string;
    metadata: Record<string, any> | null;
    createdAt: Date | null;
  }>> {
    return [];
  }

  async getUserEmailHistory(userId: string): Promise<Array<{
    id: string;
    campaignName: string;
    templateType: string;
    sentAt: Date | null;
    openedAt: Date | null;
    status: string;
  }>> {
    return [];
  }

  async getUserProgressPhotosAdmin(userId: string): Promise<Array<{
    id: string;
    photoUrl: string;
    photoType: string;
    week: number | null;
    createdAt: Date | null;
  }>> {
    return [];
  }

  // Actionable Dashboard Data (stubs)
  async getDormantMembers(daysInactive?: number): Promise<Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    lastLoginAt: Date | null;
    daysSinceLogin: number;
    lastReengagementEmailAt: Date | null;
  }>> {
    return [];
  }

  async getMembersWithoutProgressPhotos(): Promise<Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    lastLoginAt: Date | null;
    workoutsCompleted: number;
  }>> {
    return [];
  }

  async getRecentWorkoutCompleters(hours?: number): Promise<Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    workoutName: string;
    completedAt: Date | null;
  }>> {
    return [];
  }

  // Email Automation Cascade Logic (stubs)
  async checkReengagementEligibility(userId: string, triggerType: string): Promise<{
    isEligible: boolean;
    reason: string;
    lastEmailOfType: Date | null;
    previousLevelSentAt: Date | null;
  }> {
    return { isEligible: true, reason: 'Memory storage', lastEmailOfType: null, previousLevelSentAt: null };
  }

  async checkWorkoutEmailCooldown(userId: string): Promise<{
    canSend: boolean;
    lastSentAt: Date | null;
    hoursRemaining: number;
  }> {
    return { canSend: true, lastSentAt: null, hoursRemaining: 0 };
  }

  async hasReceivedAutomationEmail(userId: string, triggerType: string): Promise<boolean> {
    return false;
  }
}

// Database Storage Implementation using PostgreSQL
class DatabaseStorage implements IStorage {
  private db;
  private static instance: DatabaseStorage;
  public assetDisplayNames: Map<string, string> = new Map();

  // Performance caches for frequently accessed data
  private programsCache: Program[] | null = null;
  private programsCacheTime: number = 0;
  private memberProgramsCache: Map<
    string,
    (MemberProgram & { program: Program })[]
  > = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Use PROD_DATABASE_URL for production deployments, fallback to DATABASE_URL for development
    const isProduction = process.env.NODE_ENV === "production";
    const connectionString = isProduction 
      ? (process.env.PROD_DATABASE_URL || process.env.DATABASE_URL)
      : process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const sql = neon(connectionString);
    this.db = drizzle(sql);
  }

  static getInstance(): DatabaseStorage {
    if (!DatabaseStorage.instance) {
      DatabaseStorage.instance = new DatabaseStorage();
    }
    return DatabaseStorage.instance;
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(
    id: string,
    updates: Partial<User>
  ): Promise<User | undefined> {
    const result = await this.db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  // Admin functions
  async getAllUsers(): Promise<User[]> {
    return await this.db.select().from(users);
  }

  async getUserStats(): Promise<{
    totalMembers: number;
    activeMembers: number;
    expiringSoon: number;
    expiringUsers: Array<{
      userId: string;
      userName: string;
      programExpiring: boolean;
      whatsAppExpiring: boolean;
      programExpiryDate?: Date;
      whatsAppExpiryDate?: Date;
    }>;
  }> {
    const allUsers = await this.getAllUsers();
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get all member programs
    const allMemberPrograms = await this.db
      .select()
      .from(memberPrograms)
      .execute();

    const expiringUsers: Array<{
      userId: string;
      userName: string;
      programExpiring: boolean;
      whatsAppExpiring: boolean;
      programExpiryDate?: Date;
      whatsAppExpiryDate?: Date;
    }> = [];

    // Check each user for expiring programs or WhatsApp support
    for (const user of allUsers.filter(u => !u.isAdmin)) {
      const programExpiring = allMemberPrograms.some(mp => 
        mp.userId === user.id &&
        mp.expiryDate &&
        mp.expiryDate > now &&
        mp.expiryDate <= oneWeekFromNow
      );

      const whatsAppExpiring = 
        user.whatsAppSupportExpiryDate &&
        user.whatsAppSupportExpiryDate > now &&
        user.whatsAppSupportExpiryDate <= oneWeekFromNow;

      if (programExpiring || whatsAppExpiring) {
        const userProgram = allMemberPrograms.find(mp => 
          mp.userId === user.id &&
          mp.expiryDate &&
          mp.expiryDate > now &&
          mp.expiryDate <= oneWeekFromNow
        );

        expiringUsers.push({
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          programExpiring: !!programExpiring,
          whatsAppExpiring: !!whatsAppExpiring,
          programExpiryDate: userProgram?.expiryDate,
          whatsAppExpiryDate: user.whatsAppSupportExpiryDate || undefined,
        });
      }
    }

    return {
      totalMembers: allUsers.length,
      activeMembers: allUsers.filter(
        (u) => !u.isAdmin && u.termsAccepted
      ).length,
      expiringSoon: expiringUsers.length,
      expiringUsers,
    };
  }

  async getAnalytics() {
    const allUsers = await this.getAllUsers();
    const users = allUsers.filter(u => !u.isAdmin);
    
    const allMemberPrograms = await this.db.select().from(memberPrograms).execute();
    const allWorkoutCompletions = await this.db.select().from(workoutCompletions).execute();
    const allPosts = await this.db.select().from(communityPosts).execute();
    const allLikes = await this.db.select().from(postLikes).execute();
    const allComments = await this.db.select().from(postComments).execute();
    
    const now = new Date();

    // Demographics
    const byCountry = users.reduce((acc, user) => {
      const country = user.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPostpartumStage = users.reduce((acc, user) => {
      if (!user.postpartumWeeks) {
        acc['Unknown'] = (acc['Unknown'] || 0) + 1;
      } else if (user.postpartumWeeks < 12) {
        acc['0-3 months'] = (acc['0-3 months'] || 0) + 1;
      } else if (user.postpartumWeeks < 26) {
        acc['3-6 months'] = (acc['3-6 months'] || 0) + 1;
      } else if (user.postpartumWeeks < 52) {
        acc['6-12 months'] = (acc['6-12 months'] || 0) + 1;
      } else if (user.postpartumWeeks < 104) {
        acc['1-2 years'] = (acc['1-2 years'] || 0) + 1;
      } else {
        acc['2+ years'] = (acc['2+ years'] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const instagramHandlesCollected = users.filter(u => u.instagramHandle).length;

    // Engagement
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const activeUsers = {
      today: users.filter(u => u.lastLoginAt && u.lastLoginAt >= todayStart).length,
      last7Days: users.filter(u => u.lastLoginAt && u.lastLoginAt >= sevenDaysAgo).length,
      last30Days: users.filter(u => u.lastLoginAt && u.lastLoginAt >= thirtyDaysAgo).length,
      last90Days: users.filter(u => u.lastLoginAt && u.lastLoginAt >= ninetyDaysAgo).length,
    };

    const dormantUsers = {
      today: users.filter(u => !u.lastLoginAt || u.lastLoginAt < todayStart).length,
      dormant7Days: users.filter(u => !u.lastLoginAt || u.lastLoginAt < sevenDaysAgo).length,
      dormant30Days: users.filter(u => !u.lastLoginAt || u.lastLoginAt < thirtyDaysAgo).length,
      dormant90Days: users.filter(u => !u.lastLoginAt || u.lastLoginAt < ninetyDaysAgo).length,
    };

    // Find earliest tracking date
    const usersWithLogins = users.filter(u => u.lastLoginAt);
    const trackingStartDate = usersWithLogins.length > 0
      ? new Date(Math.min(...usersWithLogins.map(u => u.lastLoginAt!.getTime())))
      : null;

    // Program Performance
    const totalWorkoutCompletions = allWorkoutCompletions.length;
    const averageWorkoutsPerUser = users.length > 0 ? totalWorkoutCompletions / users.length : 0;

    const completionRates = {
      completed: allMemberPrograms.filter(mp => mp.completionPercentage === 100).length,
      inProgress: allMemberPrograms.filter(mp => mp.completionPercentage && mp.completionPercentage > 0 && mp.completionPercentage < 100).length,
      notStarted: allMemberPrograms.filter(mp => !mp.completionPercentage || mp.completionPercentage === 0).length,
    };

    const progressDistribution = [
      { range: '0%', count: allMemberPrograms.filter(mp => !mp.completionPercentage || mp.completionPercentage === 0).length },
      { range: '1-25%', count: allMemberPrograms.filter(mp => mp.completionPercentage && mp.completionPercentage > 0 && mp.completionPercentage <= 25).length },
      { range: '26-50%', count: allMemberPrograms.filter(mp => mp.completionPercentage && mp.completionPercentage > 25 && mp.completionPercentage <= 50).length },
      { range: '51-75%', count: allMemberPrograms.filter(mp => mp.completionPercentage && mp.completionPercentage > 50 && mp.completionPercentage <= 75).length },
      { range: '76-99%', count: allMemberPrograms.filter(mp => mp.completionPercentage && mp.completionPercentage > 75 && mp.completionPercentage < 100).length },
      { range: '100%', count: allMemberPrograms.filter(mp => mp.completionPercentage === 100).length },
    ];

    const moods = allWorkoutCompletions.filter(wc => wc.mood).map(wc => {
      const moodMap: Record<string, number> = { 'great': 5, 'good': 4, 'okay': 3, 'tired': 2, 'challenging': 1 };
      return moodMap[wc.mood!] || 3;
    });
    const averageMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 0;

    const ratings = allWorkoutCompletions.filter(wc => wc.challengeRating).map(wc => wc.challengeRating!);
    const averageChallengeRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    // Community Health
    const totalPosts = allPosts.length;
    const totalLikes = allLikes.length;
    const totalComments = allComments.length;
    const usersWhoPosted = new Set(allPosts.map(p => p.userId));
    const participationRate = users.length > 0 ? (usersWhoPosted.size / users.length) * 100 : 0;

    const byCategory = allPosts.reduce((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(byCategory)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const postsByUser = allPosts.reduce((acc, post) => {
      acc[post.userId] = (acc[post.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topContributors = Object.entries(postsByUser)
      .map(([userId, postCount]) => {
        const user = users.find(u => u.id === userId);
        return {
          userId,
          userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          postCount,
        };
      })
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 10);

    // Business Metrics
    const whatsAppAdoption = users.filter(u => u.hasWhatsAppSupport).length;
    const programCompletions = allMemberPrograms.filter(mp => mp.completedAt).length;
    
    const completedPrograms = allMemberPrograms.filter(mp => mp.completedAt && mp.purchaseDate);
    const avgCompletionTimeMs = completedPrograms.length > 0
      ? completedPrograms.reduce((sum, mp) => {
          const timeToComplete = mp.completedAt!.getTime() - mp.purchaseDate!.getTime();
          return sum + timeToComplete;
        }, 0) / completedPrograms.length
      : 0;
    const averageCompletionTime = avgCompletionTimeMs / (1000 * 60 * 60 * 24); // Convert to days

    return {
      demographics: {
        totalUsers: users.length,
        byCountry: Object.entries(byCountry).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count),
        byPostpartumStage: Object.entries(byPostpartumStage).map(([stage, count]) => ({ stage, count })),
        instagramHandlesCollected,
      },
      engagement: {
        activeUsers,
        dormantUsers,
        averageLoginFrequency: 0, // Would need more granular tracking
        trackingStartDate,
      },
      programPerformance: {
        totalWorkoutCompletions,
        averageWorkoutsPerUser,
        completionRates,
        progressDistribution,
        averageMood,
        averageChallengeRating,
      },
      communityHealth: {
        totalPosts,
        totalLikes,
        totalComments,
        participationRate,
        topCategories,
        topContributors,
      },
      businessMetrics: {
        whatsAppAdoption,
        programCompletions,
        averageCompletionTime,
      },
    };
  }

  // Programs
  async getPrograms(): Promise<Program[]> {
    const now = Date.now();

    // Return cached data if still valid
    if (
      this.programsCache &&
      now - this.programsCacheTime < this.cacheTimeout
    ) {
      return this.programsCache;
    }

    // Fetch fresh data and cache it
    const result = await this.db.select().from(programs);
    this.programsCache = result;
    this.programsCacheTime = now;

    return result;
  }

  async getProgram(id: string): Promise<Program | undefined> {
    const result = await this.db
      .select()
      .from(programs)
      .where(eq(programs.id, id))
      .limit(1);
    return result[0];
  }

  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const result = await this.db
      .insert(programs)
      .values(insertProgram)
      .returning();
    return result[0];
  }

  async updateProgram(
    id: string,
    updates: Partial<Program>
  ): Promise<Program | undefined> {
    const result = await this.db
      .update(programs)
      .set(updates)
      .where(eq(programs.id, id))
      .returning();
    return result[0];
  }

  // Member Programs
  async getMemberPrograms(
    userId: string
  ): Promise<(MemberProgram & { program: Program })[]> {
    // Check cache first
    const cached = this.memberProgramsCache.get(userId);
    if (cached) {
      return cached;
    }

    const result = await this.db
      .select()
      .from(memberPrograms)
      .innerJoin(programs, eq(memberPrograms.programId, programs.id))
      .where(eq(memberPrograms.userId, userId));

    const mapped = result.map((row) => ({
      ...row.member_programs,
      program: row.programs,
    }));

    // Cache the result for this user
    this.memberProgramsCache.set(userId, mapped);

    return mapped;
  }

  async createMemberProgram(
    memberProgram: InsertMemberProgram
  ): Promise<MemberProgram> {
    const result = await this.db
      .insert(memberPrograms)
      .values(memberProgram)
      .returning();
    // Clear cache for this user
    this.memberProgramsCache.delete(memberProgram.userId);
    return result[0];
  }

  async deleteMemberProgram(enrollmentId: string): Promise<void> {
    await this.db
      .delete(memberPrograms)
      .where(eq(memberPrograms.id, enrollmentId));
    // Clear the cache for all users since we don't know which user this enrollment belongs to
    this.memberProgramsCache.clear();
  }

  // Placeholder implementations for other methods - can be implemented as needed
  async getWorkoutsByProgram(programId: string): Promise<Workout[]> {
    return [];
  }
  async getWorkout(id: string): Promise<Workout | undefined> {
    return undefined;
  }
  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const result = await this.db.insert(workouts).values(workout).returning();
    return result[0];
  }
  async getWorkoutCompletions(userId: string): Promise<WorkoutCompletion[]> {
    return await this.db
      .select()
      .from(workoutCompletions)
      .where(eq(workoutCompletions.userId, userId));
  }
  async createWorkoutCompletion(
    completion: InsertWorkoutCompletion
  ): Promise<WorkoutCompletion> {
    const result = await this.db
      .insert(workoutCompletions)
      .values(completion)
      .returning();
    return result[0];
  }
  async getSavedWorkouts(
    userId: string
  ): Promise<(SavedWorkout & { workout: Workout })[]> {
    return [];
  }
  async createSavedWorkout(
    savedWorkout: InsertSavedWorkout
  ): Promise<SavedWorkout> {
    const result = await this.db
      .insert(savedWorkouts)
      .values(savedWorkout)
      .returning();
    return result[0];
  }
  async deleteSavedWorkout(
    userId: string,
    workoutId: string
  ): Promise<boolean> {
    return false;
  }

  // Community Posts - Full implementations with Drizzle ORM
  async getCommunityPosts(filters?: {
    category?: string;
    weekNumber?: number;
    userId?: string;
    sortBy?: 'newest' | 'mostLiked';
  }): Promise<
    (CommunityPost & {
      user: Pick<User, "id" | "firstName" | "lastName" | "profilePictureUrl">;
      likeCount: number;
      commentCount: number;
      isLikedByUser?: boolean;
      likes?: Array<{ userId: string; userName: string }>;
    })[]
  > {
    // Build the where conditions
    const conditions = [];
    if (filters?.category) {
      conditions.push(eq(communityPosts.category, filters.category));
    }
    if (filters?.weekNumber !== undefined) {
      conditions.push(eq(communityPosts.weekNumber, filters.weekNumber));
    }
    if (filters?.userId) {
      conditions.push(eq(communityPosts.userId, filters.userId));
    }

    // Get all posts with user info
    const postsQuery = this.db
      .select({
        post: communityPosts,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePictureUrl: users.profilePictureUrl,
          profilePictureThumbnailUrl: users.profilePictureThumbnailUrl,
        },
      })
      .from(communityPosts)
      .innerJoin(users, eq(communityPosts.userId, users.id));

    // Apply filters if any
    const postsWithUser = conditions.length > 0
      ? await postsQuery.where(and(...conditions))
      : await postsQuery;

    // For each post, get like and comment counts
    const enrichedPosts = await Promise.all(
      postsWithUser.map(async ({ post, user }) => {
        // Get like count
        const likeCountResult = await this.db
          .select({ count: count() })
          .from(postLikes)
          .where(eq(postLikes.postId, post.id));
        const likeCount = likeCountResult[0]?.count || 0;

        // Get comment count
        const commentCountResult = await this.db
          .select({ count: count() })
          .from(postComments)
          .where(eq(postComments.postId, post.id));
        const commentCount = commentCountResult[0]?.count || 0;

        // Get likes with user names
        const likesResult = await this.db
          .select({
            userId: postLikes.userId,
            firstName: users.firstName,
            lastName: users.lastName,
          })
          .from(postLikes)
          .innerJoin(users, eq(postLikes.userId, users.id))
          .where(eq(postLikes.postId, post.id));

        const likes = likesResult.map((like) => ({
          userId: like.userId,
          userName: `${like.firstName} ${like.lastName}`,
        }));

        return {
          ...post,
          user,
          likeCount: Number(likeCount),
          commentCount: Number(commentCount),
          likes,
        };
      })
    );

    // Sort the posts
    const sortBy = filters?.sortBy || 'newest';
    if (sortBy === 'mostLiked') {
      enrichedPosts.sort((a, b) => {
        // Featured posts at the top
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        // Then by like count
        return b.likeCount - a.likeCount;
      });
    } else {
      // Sort by newest (default)
      enrichedPosts.sort((a, b) => {
        // Featured posts at the top
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        // Then by date
        return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
      });
    }

    return enrichedPosts;
  }

  async getPostById(
    postId: string,
    currentUserId?: string
  ): Promise<
    | (CommunityPost & {
        user: Pick<User, "id" | "firstName" | "lastName" | "profilePictureUrl" | "profilePictureThumbnailUrl">;
        likeCount: number;
        commentCount: number;
        isLikedByUser: boolean;
        likes: Array<{ userId: string; userName: string }>;
      })
    | undefined
  > {
    // Get post with user info
    const postResult = await this.db
      .select({
        post: communityPosts,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePictureUrl: users.profilePictureUrl,
          profilePictureThumbnailUrl: users.profilePictureThumbnailUrl,
        },
      })
      .from(communityPosts)
      .innerJoin(users, eq(communityPosts.userId, users.id))
      .where(eq(communityPosts.id, postId))
      .limit(1);

    if (postResult.length === 0) return undefined;

    const { post, user } = postResult[0];

    // Get like count
    const likeCountResult = await this.db
      .select({ count: count() })
      .from(postLikes)
      .where(eq(postLikes.postId, postId));
    const likeCount = Number(likeCountResult[0]?.count || 0);

    // Get comment count
    const commentCountResult = await this.db
      .select({ count: count() })
      .from(postComments)
      .where(eq(postComments.postId, postId));
    const commentCount = Number(commentCountResult[0]?.count || 0);

    // Check if current user liked the post
    let isLikedByUser = false;
    if (currentUserId) {
      const userLike = await this.db
        .select()
        .from(postLikes)
        .where(
          and(
            eq(postLikes.postId, postId),
            eq(postLikes.userId, currentUserId)
          )
        )
        .limit(1);
      isLikedByUser = userLike.length > 0;
    }

    // Get likes with user names
    const likesResult = await this.db
      .select({
        userId: postLikes.userId,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(postLikes)
      .innerJoin(users, eq(postLikes.userId, users.id))
      .where(eq(postLikes.postId, postId));

    const likes = likesResult.map((like) => ({
      userId: like.userId,
      userName: `${like.firstName} ${like.lastName}`,
    }));

    return {
      ...post,
      user,
      likeCount,
      commentCount,
      isLikedByUser,
      likes,
    };
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const result = await this.db
      .insert(communityPosts)
      .values(post)
      .returning();
    return result[0];
  }

  async deletePost(postId: string, userId: string): Promise<boolean> {
    const result = await this.db
      .delete(communityPosts)
      .where(
        and(
          eq(communityPosts.id, postId),
          eq(communityPosts.userId, userId)
        )
      )
      .returning();
    return result.length > 0;
  }

  async reportPost(postId: string): Promise<boolean> {
    const result = await this.db
      .update(communityPosts)
      .set({ isReported: true })
      .where(eq(communityPosts.id, postId))
      .returning();
    return result.length > 0;
  }

  async markPostAsFeatured(postId: string, featured: boolean): Promise<boolean> {
    const result = await this.db
      .update(communityPosts)
      .set({ featured })
      .where(eq(communityPosts.id, postId))
      .returning();
    return result.length > 0;
  }

  // Post Likes
  async likePost(userId: string, postId: string): Promise<PostLike> {
    // Check if already liked
    const existing = await this.db
      .select()
      .from(postLikes)
      .where(
        and(
          eq(postLikes.userId, userId),
          eq(postLikes.postId, postId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new like
    const result = await this.db
      .insert(postLikes)
      .values({ userId, postId })
      .returning();
    return result[0];
  }

  async unlikePost(userId: string, postId: string): Promise<boolean> {
    const result = await this.db
      .delete(postLikes)
      .where(
        and(
          eq(postLikes.userId, userId),
          eq(postLikes.postId, postId)
        )
      )
      .returning();
    return result.length > 0;
  }

  async getPostLikes(postId: string): Promise<
    Array<{ userId: string; userName: string; createdAt: Date }>
  > {
    const result = await this.db
      .select({
        userId: postLikes.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: postLikes.createdAt,
      })
      .from(postLikes)
      .innerJoin(users, eq(postLikes.userId, users.id))
      .where(eq(postLikes.postId, postId));

    return result.map((like) => ({
      userId: like.userId,
      userName: `${like.firstName} ${like.lastName}`,
      createdAt: like.createdAt || new Date(),
    }));
  }

  // Post Comments
  async createComment(comment: InsertPostComment): Promise<PostComment> {
    const result = await this.db
      .insert(postComments)
      .values(comment)
      .returning();
    return result[0];
  }

  async getPostComments(
    postId: string
  ): Promise<
    (PostComment & {
      user: Pick<User, "id" | "firstName" | "lastName" | "profilePictureUrl" | "profilePictureThumbnailUrl">;
    })[]
  > {
    const result = await this.db
      .select({
        comment: postComments,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePictureUrl: users.profilePictureUrl,
          profilePictureThumbnailUrl: users.profilePictureThumbnailUrl,
        },
      })
      .from(postComments)
      .innerJoin(users, eq(postComments.userId, users.id))
      .where(eq(postComments.postId, postId))
      .orderBy(asc(postComments.createdAt));

    return result.map(({ comment, user }) => ({
      ...comment,
      user,
    }));
  }

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    const result = await this.db
      .delete(postComments)
      .where(
        and(
          eq(postComments.id, commentId),
          eq(postComments.userId, userId)
        )
      )
      .returning();
    return result.length > 0;
  }
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return [];
  }
  async createNotification(
    notification: InsertNotification
  ): Promise<Notification> {
    const result = await this.db
      .insert(notifications)
      .values(notification)
      .returning();
    return result[0];
  }
  async markNotificationRead(id: string): Promise<boolean> {
    return false;
  }
  async getActiveTerms(): Promise<Terms | undefined> {
    return undefined;
  }
  async createTerms(termsData: InsertTerms): Promise<Terms> {
    const result = await this.db.insert(terms).values(termsData).returning();
    return result[0];
  }
  async createProgramPurchase(
    purchase: InsertProgramPurchase
  ): Promise<ProgramPurchase> {
    const result = await this.db
      .insert(programPurchases)
      .values(purchase)
      .returning();

    // Also create member_programs entry so the program appears in user's library
    // Set expiry to 1 year from now (can be adjusted based on business logic)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    await this.db.insert(memberPrograms).values({
      userId: purchase.userId,
      programId: purchase.programId,
      purchaseDate: new Date(),
      expiryDate,
      isActive: true,
      progress: 0,
    });

    // Clear the member programs cache for this user
    this.memberProgramsCache.delete(purchase.userId);

    return result[0];
  }
  async getUserPurchases(userId: string): Promise<ProgramPurchase[]> {
    return [];
  }
  async hasProgramAccess(userId: string, programId: string): Promise<boolean> {
    // Check both programPurchases (for direct purchases) and memberPrograms (for admin enrollments)
    const purchases = await this.db
      .select()
      .from(programPurchases)
      .where(
        and(
          eq(programPurchases.userId, userId),
          eq(programPurchases.programId, programId),
          eq(programPurchases.status, "active")
        )
      );
    
    if (purchases.length > 0) {
      return true;
    }
    
    // Also check memberPrograms table for admin enrollments
    const enrollments = await this.db
      .select()
      .from(memberPrograms)
      .where(
        and(
          eq(memberPrograms.userId, userId),
          eq(memberPrograms.programId, programId),
          eq(memberPrograms.isActive, true)
        )
      );
    
    return enrollments.length > 0;
  }
  async createProgressEntry(
    entry: InsertProgressTracking
  ): Promise<ProgressTracking> {
    const result = await this.db
      .insert(progressTracking)
      .values(entry)
      .returning();
    return result[0];
  }
  async getProgressEntries(
    userId: string,
    programId: string
  ): Promise<ProgressTracking[]> {
    return [];
  }
  async updateProgressEntry(
    id: string,
    updates: Partial<ProgressTracking>
  ): Promise<ProgressTracking | undefined> {
    return undefined;
  }
  async createKnowledgeArticle(
    article: InsertKnowledgeArticle
  ): Promise<KnowledgeArticle> {
    const result = await this.db
      .insert(knowledgeArticles)
      .values(article)
      .returning();
    return result[0];
  }
  async getKnowledgeArticles(programId: string): Promise<KnowledgeArticle[]> {
    const result = await this.db
      .select()
      .from(knowledgeArticles)
      .where(eq(knowledgeArticles.programId, programId));
    return result;
  }
  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const result = await this.db.insert(exercises).values(exercise).returning();
    return result[0];
  }
  async getExercises(): Promise<Exercise[]> {
    const result = await this.db.select().from(exercises);
    return result;
  }
  async getExercise(id: string): Promise<Exercise | undefined> {
    const result = await this.db
      .select()
      .from(exercises)
      .where(eq(exercises.id, id))
      .limit(1);
    return result[0];
  }
  async createWeeklyWorkout(
    workout: InsertWeeklyWorkout
  ): Promise<WeeklyWorkout> {
    const result = await this.db
      .insert(weeklyWorkouts)
      .values(workout)
      .returning();
    return result[0];
  }
  async getWeeklyWorkouts(
    programId: string,
    week: number
  ): Promise<(WeeklyWorkout & { exercise: Exercise })[]> {
    const workoutsData = await this.db
      .select()
      .from(weeklyWorkouts)
      .where(
        and(
          eq(weeklyWorkouts.programId, programId),
          eq(weeklyWorkouts.week, week)
        )
      )
      .orderBy(asc(weeklyWorkouts.day), asc(weeklyWorkouts.orderIndex));

    const result: (WeeklyWorkout & { exercise: Exercise })[] = [];
    for (const workout of workoutsData) {
      const exercise = await this.getExercise(workout.exerciseId);
      if (exercise) {
        result.push({ ...workout, exercise });
      }
    }
    return result;
  }
  async getAllWeeklyWorkouts(
    programId: string
  ): Promise<(WeeklyWorkout & { exercise: Exercise })[]> {
    const workoutsData = await this.db
      .select()
      .from(weeklyWorkouts)
      .where(eq(weeklyWorkouts.programId, programId))
      .orderBy(asc(weeklyWorkouts.week), asc(weeklyWorkouts.day), asc(weeklyWorkouts.orderIndex));

    const result: (WeeklyWorkout & { exercise: Exercise })[] = [];
    for (const workout of workoutsData) {
      const exercise = await this.getExercise(workout.exerciseId);
      if (exercise) {
        result.push({ ...workout, exercise });
      }
    }
    return result;
  }

  // Reflection Notes
  async createReflectionNote(
    note: InsertReflectionNote
  ): Promise<ReflectionNote> {
    const result = await this.db
      .insert(reflectionNotes)
      .values(note)
      .returning();
    return result[0];
  }

  async getReflectionNote(
    userId: string,
    programId: string
  ): Promise<ReflectionNote | undefined> {
    const result = await this.db
      .select()
      .from(reflectionNotes)
      .where(
        and(
          eq(reflectionNotes.userId, userId),
          eq(reflectionNotes.programId, programId)
        )
      )
      .limit(1);
    return result[0];
  }

  async updateReflectionNote(
    userId: string,
    programId: string,
    noteText: string
  ): Promise<ReflectionNote> {
    const existing = await this.getReflectionNote(userId, programId);

    if (existing) {
      const result = await this.db
        .update(reflectionNotes)
        .set({
          noteText,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(reflectionNotes.userId, userId),
            eq(reflectionNotes.programId, programId)
          )
        )
        .returning();
      return result[0];
    } else {
      return this.createReflectionNote({
        userId,
        programId,
        noteText,
      });
    }
  }

  // Progress Photos
  async createProgressPhoto(photo: InsertProgressPhoto): Promise<ProgressPhoto> {
    const result = await this.db
      .insert(progressPhotos)
      .values(photo)
      .returning();
    return result[0];
  }

  async getProgressPhotos(userId: string): Promise<ProgressPhoto[]> {
    const result = await this.db
      .select()
      .from(progressPhotos)
      .where(eq(progressPhotos.userId, userId))
      .orderBy(desc(progressPhotos.uploadedAt));
    return result;
  }

  async deleteProgressPhoto(id: string): Promise<boolean> {
    const result = await this.db
      .delete(progressPhotos)
      .where(eq(progressPhotos.id, id))
      .returning();
    return result.length > 0;
  }

  // Email Campaigns
  async createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign> {
    const result = await this.db
      .insert(emailCampaigns)
      .values(campaign)
      .returning();
    return result[0];
  }

  async getEmailCampaigns(): Promise<EmailCampaign[]> {
    const result = await this.db
      .select()
      .from(emailCampaigns)
      .orderBy(desc(emailCampaigns.createdAt));
    return result;
  }

  async getEmailCampaign(id: string): Promise<EmailCampaign | undefined> {
    const result = await this.db
      .select()
      .from(emailCampaigns)
      .where(eq(emailCampaigns.id, id))
      .limit(1);
    return result[0];
  }

  async updateEmailCampaign(id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign | undefined> {
    const result = await this.db
      .update(emailCampaigns)
      .set(updates)
      .where(eq(emailCampaigns.id, id))
      .returning();
    return result[0];
  }

  async deleteEmailCampaign(id: string): Promise<boolean> {
    const result = await this.db
      .delete(emailCampaigns)
      .where(eq(emailCampaigns.id, id))
      .returning();
    return result.length > 0;
  }

  async getTargetedUsers(audienceFilter: import("@shared/schema").AudienceFilter): Promise<User[]> {
    // Build query based on audience filter criteria
    const conditions = [];

    if (audienceFilter.dormantDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - audienceFilter.dormantDays);
      conditions.push(sql`${users.lastLoginAt} < ${cutoffDate} OR ${users.lastLoginAt} IS NULL`);
    }

    if (audienceFilter.hasWhatsAppSupport !== undefined) {
      conditions.push(eq(users.hasWhatsAppSupport, audienceFilter.hasWhatsAppSupport));
    }

    if (audienceFilter.programCompletionStatus) {
      // Would need to join with memberPrograms table
      // For simplicity, we'll handle this client-side for now
    }

    if (audienceFilter.country) {
      conditions.push(eq(users.country, audienceFilter.country));
    }

    if (audienceFilter.pendingSignup) {
      // Users who haven't accepted terms OR disclaimer
      conditions.push(
        sql`(${users.termsAccepted} = false OR ${users.disclaimerAccepted} = false)`
      );
    }

    let query = this.db.select().from(users);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query;
    return result;
  }

  async createCampaignRecipients(recipients: InsertEmailCampaignRecipient[]): Promise<EmailCampaignRecipient[]> {
    if (recipients.length === 0) return [];
    
    const result = await this.db
      .insert(emailCampaignRecipients)
      .values(recipients)
      .returning();
    return result;
  }

  async getCampaignRecipients(campaignId: string): Promise<EmailCampaignRecipient[]> {
    const result = await this.db
      .select()
      .from(emailCampaignRecipients)
      .where(eq(emailCampaignRecipients.campaignId, campaignId))
      .orderBy(desc(emailCampaignRecipients.createdAt));
    return result;
  }

  async updateRecipientStatus(
    recipientId: string,
    status: string,
    sentAt?: Date,
    errorMessage?: string,
    messageId?: string
  ): Promise<void> {
    const updates: any = { status };
    if (sentAt) updates.sentAt = sentAt;
    if (errorMessage) updates.errorMessage = errorMessage;
    if (messageId) updates.messageId = messageId;

    await this.db
      .update(emailCampaignRecipients)
      .set(updates)
      .where(eq(emailCampaignRecipients.id, recipientId));
  }

  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    const result = await this.db
      .select()
      .from(emailTemplates)
      .orderBy(asc(emailTemplates.type));
    return result;
  }

  async getEmailTemplate(id: string): Promise<EmailTemplate | undefined> {
    const result = await this.db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.id, id))
      .limit(1);
    return result[0];
  }

  async getEmailTemplateByType(type: string): Promise<EmailTemplate | undefined> {
    const result = await this.db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.type, type))
      .limit(1);
    return result[0];
  }

  async updateEmailTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate | undefined> {
    const result = await this.db
      .update(emailTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(emailTemplates.id, id))
      .returning();
    return result[0];
  }

  async incrementTemplateSends(templateId: string): Promise<void> {
    await this.db
      .update(emailTemplates)
      .set({
        totalSends: sql`${emailTemplates.totalSends} + 1`,
        lastSentAt: new Date(),
      })
      .where(eq(emailTemplates.id, templateId));
  }

  // Email Tracking
  async recordEmailOpen(open: InsertEmailOpen): Promise<EmailOpen> {
    const result = await this.db
      .insert(emailOpens)
      .values(open)
      .returning();
    
    // Increment template opens count
    const recipient = await this.db
      .select()
      .from(emailCampaignRecipients)
      .where(eq(emailCampaignRecipients.id, open.recipientId))
      .limit(1);
    
    if (recipient[0]) {
      const campaign = await this.getEmailCampaign(open.campaignId);
      if (campaign && campaign.templateId) {
        await this.db
          .update(emailTemplates)
          .set({
            totalOpens: sql`${emailTemplates.totalOpens} + 1`,
          })
          .where(eq(emailTemplates.id, campaign.templateId));
      }
      
      // Increment campaign open count
      await this.db
        .update(emailCampaigns)
        .set({
          openCount: sql`${emailCampaigns.openCount} + 1`,
        })
        .where(eq(emailCampaigns.id, open.campaignId));
    }
    
    return result[0];
  }

  async getEmailOpens(campaignId: string): Promise<EmailOpen[]> {
    const result = await this.db
      .select()
      .from(emailOpens)
      .where(eq(emailOpens.campaignId, campaignId))
      .orderBy(desc(emailOpens.openedAt));
    return result;
  }

  // Email Automation Rules
  async getEmailAutomationRules(): Promise<EmailAutomationRule[]> {
    const result = await this.db
      .select()
      .from(emailAutomationRules)
      .orderBy(asc(emailAutomationRules.triggerType));
    return result;
  }

  async getEmailAutomationRule(id: string): Promise<EmailAutomationRule | undefined> {
    const result = await this.db
      .select()
      .from(emailAutomationRules)
      .where(eq(emailAutomationRules.id, id))
      .limit(1);
    return result[0];
  }

  async getEmailAutomationRuleByTriggerType(triggerType: string): Promise<EmailAutomationRule | undefined> {
    const result = await this.db
      .select()
      .from(emailAutomationRules)
      .where(eq(emailAutomationRules.triggerType, triggerType))
      .limit(1);
    return result[0];
  }

  async updateEmailAutomationRule(id: string, updates: Partial<EmailAutomationRule>): Promise<EmailAutomationRule | undefined> {
    const result = await this.db
      .update(emailAutomationRules)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(emailAutomationRules.id, id))
      .returning();
    return result[0];
  }

  async incrementAutomationRuleSent(id: string): Promise<void> {
    await this.db
      .update(emailAutomationRules)
      .set({
        totalSent: sql`${emailAutomationRules.totalSent} + 1`,
        lastTriggeredAt: new Date(),
      })
      .where(eq(emailAutomationRules.id, id));
  }

  // Password Reset Codes
  async createPasswordResetCode(email: string, code: string, expiresAt: Date): Promise<PasswordResetCode> {
    // First, delete any existing codes for this email
    await this.db
      .delete(passwordResetCodes)
      .where(eq(passwordResetCodes.email, email.toLowerCase()));
    
    // Create new code
    const result = await this.db
      .insert(passwordResetCodes)
      .values({
        email: email.toLowerCase(),
        code,
        expiresAt,
        isVerified: false,
      })
      .returning();
    return result[0];
  }

  async getValidPasswordResetCode(email: string, code: string): Promise<PasswordResetCode | undefined> {
    const result = await this.db
      .select()
      .from(passwordResetCodes)
      .where(
        and(
          eq(passwordResetCodes.email, email.toLowerCase()),
          eq(passwordResetCodes.code, code),
          eq(passwordResetCodes.isVerified, false),
          gte(passwordResetCodes.expiresAt, new Date())
        )
      )
      .limit(1);
    return result[0];
  }

  async markPasswordResetCodeAsVerified(id: string): Promise<void> {
    await this.db
      .update(passwordResetCodes)
      .set({ isVerified: true })
      .where(eq(passwordResetCodes.id, id));
  }

  async deletePasswordResetCodes(email: string): Promise<void> {
    await this.db
      .delete(passwordResetCodes)
      .where(eq(passwordResetCodes.email, email.toLowerCase()));
  }

  // User Check-ins
  async createUserCheckin(checkin: InsertUserCheckin): Promise<UserCheckin> {
    const result = await this.db
      .insert(userCheckins)
      .values(checkin)
      .returning();
    return result[0];
  }

  async updateUserCheckin(id: string, userId: string, data: Partial<InsertUserCheckin>): Promise<UserCheckin | undefined> {
    const result = await this.db
      .update(userCheckins)
      .set(data)
      .where(and(eq(userCheckins.id, id), eq(userCheckins.userId, userId)))
      .returning();
    return result[0];
  }

  async getUserCheckins(userId: string): Promise<UserCheckin[]> {
    return await this.db
      .select()
      .from(userCheckins)
      .where(eq(userCheckins.userId, userId))
      .orderBy(desc(userCheckins.createdAt));
  }

  async getTodayCheckin(userId: string): Promise<UserCheckin | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await this.db
      .select()
      .from(userCheckins)
      .where(
        and(
          eq(userCheckins.userId, userId),
          gte(userCheckins.createdAt, today),
          eq(userCheckins.isPartial, false)
        )
      )
      .orderBy(desc(userCheckins.createdAt))
      .limit(1);
    
    return result[0] || null;
  }

  async getRecentCheckins(limit: number = 10): Promise<(UserCheckin & { user: Pick<User, 'id' | 'firstName' | 'lastName'> })[]> {
    const result = await this.db
      .select({
        id: userCheckins.id,
        userId: userCheckins.userId,
        mood: userCheckins.mood,
        energyLevel: userCheckins.energyLevel,
        goals: userCheckins.goals,
        postpartumWeeksAtCheckin: userCheckins.postpartumWeeksAtCheckin,
        notes: userCheckins.notes,
        isPartial: userCheckins.isPartial,
        createdAt: userCheckins.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(userCheckins)
      .innerJoin(users, eq(userCheckins.userId, users.id))
      .orderBy(desc(userCheckins.createdAt))
      .limit(limit);
    return result;
  }

  async getCheckinAnalytics(): Promise<{
    totalCheckins: number;
    checkinsByMood: { mood: string; count: number }[];
    checkinsByEnergy: { energyLevel: number; count: number }[];
    popularGoals: { goal: string; count: number }[];
    checkinFrequency: { period: string; count: number }[];
  }> {
    // Get total check-ins
    const totalResult = await this.db
      .select({ count: count() })
      .from(userCheckins);
    const totalCheckins = totalResult[0]?.count || 0;

    // Get check-ins by mood
    const moodResult = await this.db
      .select({
        mood: userCheckins.mood,
        count: count(),
      })
      .from(userCheckins)
      .where(sql`${userCheckins.mood} IS NOT NULL`)
      .groupBy(userCheckins.mood);
    const checkinsByMood = moodResult.map(r => ({
      mood: r.mood || 'unknown',
      count: r.count,
    }));

    // Get check-ins by energy level
    const energyResult = await this.db
      .select({
        energyLevel: userCheckins.energyLevel,
        count: count(),
      })
      .from(userCheckins)
      .where(sql`${userCheckins.energyLevel} IS NOT NULL`)
      .groupBy(userCheckins.energyLevel);
    const checkinsByEnergy = energyResult.map(r => ({
      energyLevel: r.energyLevel || 0,
      count: r.count,
    }));

    // Get popular goals (flatten the array and count)
    const goalsResult = await this.db
      .select({
        goals: userCheckins.goals,
      })
      .from(userCheckins)
      .where(sql`${userCheckins.goals} IS NOT NULL`);
    
    const goalCounts: Record<string, number> = {};
    for (const row of goalsResult) {
      if (row.goals) {
        for (const goal of row.goals) {
          goalCounts[goal] = (goalCounts[goal] || 0) + 1;
        }
      }
    }
    const popularGoals = Object.entries(goalCounts)
      .map(([goal, count]) => ({ goal, count }))
      .sort((a, b) => b.count - a.count);

    // Get check-in frequency by time period
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);

    const todayCount = await this.db
      .select({ count: count() })
      .from(userCheckins)
      .where(gte(userCheckins.createdAt, todayStart));

    const weekCount = await this.db
      .select({ count: count() })
      .from(userCheckins)
      .where(gte(userCheckins.createdAt, weekStart));

    const monthCount = await this.db
      .select({ count: count() })
      .from(userCheckins)
      .where(gte(userCheckins.createdAt, monthStart));

    const checkinFrequency = [
      { period: 'Today', count: todayCount[0]?.count || 0 },
      { period: 'Last 7 Days', count: weekCount[0]?.count || 0 },
      { period: 'Last 30 Days', count: monthCount[0]?.count || 0 },
    ];

    return {
      totalCheckins,
      checkinsByMood,
      checkinsByEnergy,
      popularGoals,
      checkinFrequency,
    };
  }

  // Daily Performance Check-ins
  async createDailyCheckin(checkin: InsertDailyCheckin): Promise<DailyCheckin> {
    const result = await this.db
      .insert(dailyCheckins)
      .values(checkin)
      .returning();
    return result[0];
  }

  async updateDailyCheckin(id: string, userId: string, updates: Partial<InsertDailyCheckin>): Promise<DailyCheckin | undefined> {
    const result = await this.db
      .update(dailyCheckins)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(dailyCheckins.id, id), eq(dailyCheckins.userId, userId)))
      .returning();
    return result[0];
  }

  async getDailyCheckin(userId: string, date: Date): Promise<DailyCheckin | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const result = await this.db
      .select()
      .from(dailyCheckins)
      .where(
        and(
          eq(dailyCheckins.userId, userId),
          gte(dailyCheckins.date, startOfDay),
          lte(dailyCheckins.date, endOfDay)
        )
      )
      .limit(1);
    return result[0];
  }

  async getTodayDailyCheckin(userId: string): Promise<DailyCheckin | undefined> {
    return this.getDailyCheckin(userId, new Date());
  }

  async getWeeklyDailyCheckins(userId: string, weekStartDate: Date): Promise<DailyCheckin[]> {
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);
    
    return await this.db
      .select()
      .from(dailyCheckins)
      .where(
        and(
          eq(dailyCheckins.userId, userId),
          gte(dailyCheckins.date, weekStartDate),
          lt(dailyCheckins.date, weekEndDate)
        )
      )
      .orderBy(asc(dailyCheckins.date));
  }

  async getDailyCheckinStats(userId: string, days: number = 30): Promise<{
    totalCheckins: number;
    workoutDays: number;
    breathingDays: number;
    avgWaterGlasses: number;
    avgCardioMinutes: number;
    currentStreak: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const checkins = await this.db
      .select()
      .from(dailyCheckins)
      .where(
        and(
          eq(dailyCheckins.userId, userId),
          gte(dailyCheckins.date, startDate)
        )
      )
      .orderBy(desc(dailyCheckins.date));

    const totalCheckins = checkins.length;
    const workoutDays = checkins.filter(c => c.workoutCompleted).length;
    const breathingDays = checkins.filter(c => c.breathingPractice).length;
    
    const totalWater = checkins.reduce((sum, c) => sum + (c.waterGlasses || 0), 0);
    const avgWaterGlasses = totalCheckins > 0 ? Math.round((totalWater / totalCheckins) * 10) / 10 : 0;
    
    const totalCardio = checkins.reduce((sum, c) => sum + (c.cardioMinutes || 0), 0);
    const avgCardioMinutes = totalCheckins > 0 ? Math.round(totalCardio / totalCheckins) : 0;

    // Calculate current streak (consecutive days with at least one activity)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < days; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);
      
      const dayCheckin = checkins.find(c => {
        const cDate = new Date(c.date);
        cDate.setHours(0, 0, 0, 0);
        return cDate.getTime() === checkDate.getTime();
      });
      
      if (dayCheckin && (dayCheckin.workoutCompleted || dayCheckin.breathingPractice || 
          (dayCheckin.waterGlasses && dayCheckin.waterGlasses > 0) || 
          (dayCheckin.cardioMinutes && dayCheckin.cardioMinutes > 0))) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    return {
      totalCheckins,
      workoutDays,
      breathingDays,
      avgWaterGlasses,
      avgCardioMinutes,
      currentStreak,
    };
  }

  // Workout Program Content Methods
  async getWorkoutProgramContent(): Promise<WorkoutProgramContent[]> {
    return await this.db
      .select()
      .from(workoutProgramContent)
      .where(eq(workoutProgramContent.isActive, true))
      .orderBy(asc(workoutProgramContent.week));
  }

  async getWorkoutProgramContentByWeek(week: number): Promise<WorkoutProgramContent | undefined> {
    const results = await this.db
      .select()
      .from(workoutProgramContent)
      .where(eq(workoutProgramContent.week, week));
    return results[0];
  }

  async getWorkoutContentExercises(programContentId: string): Promise<WorkoutContentExercise[]> {
    return await this.db
      .select()
      .from(workoutContentExercises)
      .where(eq(workoutContentExercises.programContentId, programContentId))
      .orderBy(asc(workoutContentExercises.sectionType), asc(workoutContentExercises.orderNum));
  }

  async getFullWorkoutPrograms(): Promise<Array<WorkoutProgramContent & { exercises: WorkoutContentExercise[] }>> {
    const programs = await this.getWorkoutProgramContent();
    const result: Array<WorkoutProgramContent & { exercises: WorkoutContentExercise[] }> = [];
    
    for (const program of programs) {
      const exercises = await this.getWorkoutContentExercises(program.id);
      result.push({ ...program, exercises });
    }
    
    return result;
  }

  async updateWorkoutProgramContent(id: string, updates: Partial<InsertWorkoutProgramContent>): Promise<WorkoutProgramContent | undefined> {
    const results = await this.db
      .update(workoutProgramContent)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(workoutProgramContent.id, id))
      .returning();
    return results[0];
  }

  async updateWorkoutContentExercise(id: string, updates: Partial<InsertWorkoutContentExercise>): Promise<WorkoutContentExercise | undefined> {
    const results = await this.db
      .update(workoutContentExercises)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(workoutContentExercises.id, id))
      .returning();
    return results[0];
  }

  async createWorkoutContentExercise(exercise: InsertWorkoutContentExercise): Promise<WorkoutContentExercise> {
    const results = await this.db
      .insert(workoutContentExercises)
      .values(exercise)
      .returning();
    return results[0];
  }

  async deleteWorkoutContentExercise(id: string): Promise<boolean> {
    const results = await this.db
      .delete(workoutContentExercises)
      .where(eq(workoutContentExercises.id, id))
      .returning();
    return results.length > 0;
  }

  async reorderWorkoutContentExercises(programContentId: string, sectionType: string, exerciseIds: string[]): Promise<void> {
    for (let i = 0; i < exerciseIds.length; i++) {
      await this.db
        .update(workoutContentExercises)
        .set({ orderNum: i + 1, updatedAt: new Date() })
        .where(
          and(
            eq(workoutContentExercises.id, exerciseIds[i]),
            eq(workoutContentExercises.programContentId, programContentId),
            eq(workoutContentExercises.sectionType, sectionType)
          )
        );
    }
  }

  // Educational Topics
  async getEducationalTopics(): Promise<EducationalTopic[]> {
    return await this.db
      .select()
      .from(educationalTopics)
      .where(eq(educationalTopics.isActive, true))
      .orderBy(asc(educationalTopics.orderNum));
  }

  async getEducationalTopicBySlug(slug: string): Promise<EducationalTopic | undefined> {
    const results = await this.db
      .select()
      .from(educationalTopics)
      .where(eq(educationalTopics.slug, slug))
      .limit(1);
    return results[0];
  }

  // Activity Logs
  async createActivityLog(userId: string, activityType: string, metadata?: Record<string, any>): Promise<void> {
    await this.db
      .insert(activityLogs)
      .values({
        userId,
        activityType,
        metadata: metadata || null,
      });
  }

  async getRecentActivityLogs(limit: number = 50): Promise<Array<{
    id: string;
    userId: string;
    activityType: string;
    metadata: Record<string, any> | null;
    createdAt: Date | null;
    user: Pick<User, 'id' | 'firstName' | 'lastName' | 'profilePictureUrl'>;
  }>> {
    const results = await this.db
      .select({
        id: activityLogs.id,
        userId: activityLogs.userId,
        activityType: activityLogs.activityType,
        metadata: activityLogs.metadata,
        createdAt: activityLogs.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profilePictureUrl: users.profilePictureUrl,
        },
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);

    return results.map(r => ({
      id: r.id,
      userId: r.userId,
      activityType: r.activityType,
      metadata: r.metadata as Record<string, any> | null,
      createdAt: r.createdAt,
      user: r.user || { id: r.userId, firstName: 'Unknown', lastName: 'User', profilePictureUrl: null },
    }));
  }

  async getActivityLogsForUser(userId: string, limit: number = 100): Promise<Array<{
    id: string;
    activityType: string;
    metadata: Record<string, any> | null;
    createdAt: Date | null;
  }>> {
    const results = await this.db
      .select({
        id: activityLogs.id,
        activityType: activityLogs.activityType,
        metadata: activityLogs.metadata,
        createdAt: activityLogs.createdAt,
      })
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);

    return results.map(r => ({
      id: r.id,
      activityType: r.activityType,
      metadata: r.metadata as Record<string, any> | null,
      createdAt: r.createdAt,
    }));
  }

  async getUserEmailHistory(userId: string): Promise<Array<{
    id: string;
    campaignName: string;
    templateType: string;
    sentAt: Date | null;
    openedAt: Date | null;
    status: string;
  }>> {
    // Get email campaign recipients for this user
    const recipientResults = await this.db
      .select({
        id: emailCampaignRecipients.id,
        campaignId: emailCampaignRecipients.campaignId,
        sentAt: emailCampaignRecipients.sentAt,
        status: emailCampaignRecipients.status,
        campaignName: emailCampaigns.name,
        templateType: emailCampaigns.templateType,
      })
      .from(emailCampaignRecipients)
      .leftJoin(emailCampaigns, eq(emailCampaignRecipients.campaignId, emailCampaigns.id))
      .where(eq(emailCampaignRecipients.userId, userId))
      .orderBy(desc(emailCampaignRecipients.sentAt));

    // Get email opens for this user
    const openResults = await this.db
      .select({
        campaignId: emailOpens.campaignId,
        openedAt: emailOpens.openedAt,
      })
      .from(emailOpens)
      .where(eq(emailOpens.userId, userId));

    const openMap = new Map(openResults.map(o => [o.campaignId, o.openedAt]));

    return recipientResults.map(r => ({
      id: r.id,
      campaignName: r.campaignName || 'Unknown Campaign',
      templateType: r.templateType || 'unknown',
      sentAt: r.sentAt,
      openedAt: openMap.get(r.campaignId) || null,
      status: r.status,
    }));
  }

  async getUserProgressPhotosAdmin(userId: string): Promise<Array<{
    id: string;
    photoUrl: string;
    photoType: string;
    week: number | null;
    createdAt: Date | null;
  }>> {
    const results = await this.db
      .select({
        id: progressPhotos.id,
        fileUrl: progressPhotos.fileUrl,
        photoType: progressPhotos.photoType,
        uploadedAt: progressPhotos.uploadedAt,
      })
      .from(progressPhotos)
      .where(eq(progressPhotos.userId, userId))
      .orderBy(desc(progressPhotos.uploadedAt));

    return results.map(r => ({
      id: r.id,
      photoUrl: r.fileUrl,
      photoType: r.photoType,
      week: null,
      createdAt: r.uploadedAt,
    }));
  }

  // Actionable Dashboard Data
  async getDormantMembers(daysInactive: number = 7): Promise<Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    lastLoginAt: Date | null;
    daysSinceLogin: number;
    lastReengagementEmailAt: Date | null;
  }>> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    const results = await this.db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        lastLoginAt: users.lastLoginAt,
      })
      .from(users)
      .where(
        and(
          eq(users.isAdmin, false),
          or(
            isNull(users.lastLoginAt),
            lt(users.lastLoginAt, cutoffDate)
          )
        )
      )
      .orderBy(asc(users.lastLoginAt));

    // Get user IDs to query their last re-engagement email
    const userIds = results.map(r => r.id);
    
    // Find last re-engagement email sent to each user
    const reengagementEmails = await this.db
      .select({
        userId: emailCampaignRecipients.userId,
        sentAt: sql<Date>`MAX(${emailCampaignRecipients.sentAt})`.as('last_sent'),
      })
      .from(emailCampaignRecipients)
      .innerJoin(emailCampaigns, eq(emailCampaignRecipients.campaignId, emailCampaigns.id))
      .where(
        and(
          inArray(emailCampaignRecipients.userId, userIds.length > 0 ? userIds : ['']),
          eq(emailCampaigns.templateType, 're-engagement'),
          eq(emailCampaignRecipients.status, 'sent')
        )
      )
      .groupBy(emailCampaignRecipients.userId);

    // Create a map for quick lookup
    const emailMap = new Map<string, Date | null>();
    reengagementEmails.forEach(e => {
      emailMap.set(e.userId, e.sentAt);
    });

    return results.map(r => ({
      id: r.id,
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      lastLoginAt: r.lastLoginAt,
      daysSinceLogin: r.lastLoginAt 
        ? Math.floor((new Date().getTime() - new Date(r.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24))
        : 999,
      lastReengagementEmailAt: emailMap.get(r.id) || null,
    }));
  }

  async getMembersWithoutProgressPhotos(): Promise<Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    lastLoginAt: Date | null;
    workoutsCompleted: number;
  }>> {
    // Get users who have completed at least 1 workout but don't have progress photos
    const usersWithPhotos = this.db
      .select({ userId: progressPhotos.userId })
      .from(progressPhotos);

    const results = await this.db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        lastLoginAt: users.lastLoginAt,
      })
      .from(users)
      .where(
        and(
          eq(users.isAdmin, false),
          notInArray(users.id, usersWithPhotos)
        )
      )
      .orderBy(desc(users.lastLoginAt))
      .limit(50);

    // Get workout completion counts for these users
    const userIds = results.map(r => r.id);
    const completionCounts = await this.db
      .select({
        userId: workoutCompletions.userId,
        count: sql<number>`count(*)::int`,
      })
      .from(workoutCompletions)
      .where(inArray(workoutCompletions.userId, userIds))
      .groupBy(workoutCompletions.userId);

    const countMap = new Map(completionCounts.map(c => [c.userId, c.count]));

    return results
      .map(r => ({
        id: r.id,
        firstName: r.firstName,
        lastName: r.lastName,
        email: r.email,
        lastLoginAt: r.lastLoginAt,
        workoutsCompleted: countMap.get(r.id) || 0,
      }))
      .filter(r => r.workoutsCompleted > 0); // Only show users who have done at least 1 workout
  }

  async getRecentWorkoutCompleters(hours: number = 48): Promise<Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    workoutName: string;
    completedAt: Date | null;
  }>> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    const results = await this.db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        workoutId: workoutCompletions.workoutId,
        completedAt: workoutCompletions.completedAt,
      })
      .from(workoutCompletions)
      .innerJoin(users, eq(workoutCompletions.userId, users.id))
      .where(
        and(
          eq(users.isAdmin, false),
          gte(workoutCompletions.completedAt, cutoffDate)
        )
      )
      .orderBy(desc(workoutCompletions.completedAt))
      .limit(20);

    // Parse workout ID to readable name (e.g., "week1-day1" → "Week 1, Day 1")
    const parseWorkoutName = (workoutId: string): string => {
      const match = workoutId.match(/week(\d+)-day(\d+)/i);
      if (match) {
        return `Week ${match[1]}, Day ${match[2]}`;
      }
      return workoutId;
    };

    return results.map(r => ({
      id: r.id,
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      workoutName: parseWorkoutName(r.workoutId),
      completedAt: r.completedAt,
    }));
  }

  // Email Automation Cascade Logic
  async checkReengagementEligibility(userId: string, triggerType: string): Promise<{
    isEligible: boolean;
    reason: string;
    lastEmailOfType: Date | null;
    previousLevelSentAt: Date | null;
  }> {
    // Get the automation rule config
    const ruleResult = await this.db
      .select({ config: emailAutomationRules.config })
      .from(emailAutomationRules)
      .where(eq(emailAutomationRules.triggerType, triggerType))
      .limit(1);

    if (ruleResult.length === 0) {
      return { isEligible: false, reason: 'Rule not found', lastEmailOfType: null, previousLevelSentAt: null };
    }

    const config = ruleResult[0].config as { 
      requiresPreviousLevel?: string | null; 
      minDaysSincePrevious?: number;
      inactivityDays?: number;
    };

    // Check if user has already received this email type
    const existingEmail = await this.db
      .select({ sentAt: sql<Date>`MAX(${emailCampaignRecipients.sentAt})` })
      .from(emailCampaignRecipients)
      .innerJoin(emailCampaigns, eq(emailCampaignRecipients.campaignId, emailCampaigns.id))
      .innerJoin(emailAutomationRules, eq(emailCampaigns.automationRuleId, emailAutomationRules.id))
      .where(
        and(
          eq(emailCampaignRecipients.userId, userId),
          eq(emailAutomationRules.triggerType, triggerType),
          eq(emailCampaignRecipients.status, 'sent')
        )
      );

    const lastEmailOfType = existingEmail[0]?.sentAt || null;
    
    // If already received this type, not eligible
    if (lastEmailOfType) {
      return { 
        isEligible: false, 
        reason: `Already received ${triggerType} email`, 
        lastEmailOfType, 
        previousLevelSentAt: null 
      };
    }

    // If no previous level required, eligible
    if (!config.requiresPreviousLevel) {
      return { isEligible: true, reason: 'No previous level required', lastEmailOfType: null, previousLevelSentAt: null };
    }

    // Check if previous level was sent
    const previousEmail = await this.db
      .select({ sentAt: sql<Date>`MAX(${emailCampaignRecipients.sentAt})` })
      .from(emailCampaignRecipients)
      .innerJoin(emailCampaigns, eq(emailCampaignRecipients.campaignId, emailCampaigns.id))
      .innerJoin(emailAutomationRules, eq(emailCampaigns.automationRuleId, emailAutomationRules.id))
      .where(
        and(
          eq(emailCampaignRecipients.userId, userId),
          eq(emailAutomationRules.triggerType, config.requiresPreviousLevel),
          eq(emailCampaignRecipients.status, 'sent')
        )
      );

    const previousLevelSentAt = previousEmail[0]?.sentAt || null;

    if (!previousLevelSentAt) {
      return { 
        isEligible: false, 
        reason: `Previous level (${config.requiresPreviousLevel}) not sent yet`, 
        lastEmailOfType: null, 
        previousLevelSentAt: null 
      };
    }

    // Check if enough time has passed since previous level
    const daysSincePrevious = Math.floor(
      (new Date().getTime() - new Date(previousLevelSentAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    const minDaysRequired = config.minDaysSincePrevious || 0;

    if (daysSincePrevious < minDaysRequired) {
      return { 
        isEligible: false, 
        reason: `Need ${minDaysRequired - daysSincePrevious} more days since previous level`, 
        lastEmailOfType: null, 
        previousLevelSentAt 
      };
    }

    return { 
      isEligible: true, 
      reason: 'Cascade requirements met', 
      lastEmailOfType: null, 
      previousLevelSentAt 
    };
  }

  async checkWorkoutEmailCooldown(userId: string): Promise<{
    canSend: boolean;
    lastSentAt: Date | null;
    hoursRemaining: number;
  }> {
    // Check for workout-congratulations emails sent to this user in the last 24 hours
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - 24);

    const recentEmail = await this.db
      .select({ sentAt: emailCampaignRecipients.sentAt })
      .from(emailCampaignRecipients)
      .innerJoin(emailCampaigns, eq(emailCampaignRecipients.campaignId, emailCampaigns.id))
      .where(
        and(
          eq(emailCampaignRecipients.userId, userId),
          eq(emailCampaigns.templateType, 'workout-congratulations'),
          eq(emailCampaignRecipients.status, 'sent'),
          gte(emailCampaignRecipients.sentAt, cutoffTime)
        )
      )
      .orderBy(desc(emailCampaignRecipients.sentAt))
      .limit(1);

    if (recentEmail.length === 0) {
      return { canSend: true, lastSentAt: null, hoursRemaining: 0 };
    }

    const lastSentAt = recentEmail[0].sentAt;
    const hoursSinceLastEmail = lastSentAt 
      ? (new Date().getTime() - new Date(lastSentAt).getTime()) / (1000 * 60 * 60)
      : 24;
    const hoursRemaining = Math.max(0, 24 - hoursSinceLastEmail);

    return { 
      canSend: hoursRemaining <= 0, 
      lastSentAt, 
      hoursRemaining: Math.ceil(hoursRemaining) 
    };
  }

  async hasReceivedAutomationEmail(userId: string, triggerType: string): Promise<boolean> {
    const result = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(emailCampaignRecipients)
      .innerJoin(emailCampaigns, eq(emailCampaignRecipients.campaignId, emailCampaigns.id))
      .innerJoin(emailAutomationRules, eq(emailCampaigns.automationRuleId, emailAutomationRules.id))
      .where(
        and(
          eq(emailCampaignRecipients.userId, userId),
          eq(emailAutomationRules.triggerType, triggerType),
          eq(emailCampaignRecipients.status, 'sent')
        )
      );

    return (result[0]?.count || 0) > 0;
  }
}

// Use Database Storage for persistent data
export const storage = new DatabaseStorage();
