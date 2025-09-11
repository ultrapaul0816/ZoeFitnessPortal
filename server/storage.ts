import { type User, type InsertUser, type Program, type InsertProgram, type MemberProgram, type InsertMemberProgram, type Workout, type InsertWorkout, type WorkoutCompletion, type InsertWorkoutCompletion, type SavedWorkout, type InsertSavedWorkout, type CommunityPost, type InsertCommunityPost, type Notification, type InsertNotification, type Terms, type InsertTerms, type ProgramPurchase, type InsertProgramPurchase, type ProgressTracking, type InsertProgressTracking, type KnowledgeArticle, type InsertKnowledgeArticle, type Exercise, type InsertExercise, type WeeklyWorkout, type InsertWeeklyWorkout } from "@shared/schema";
import { randomUUID } from "crypto";

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
  getMemberPrograms(userId: string): Promise<(MemberProgram & { program: Program })[]>;
  createMemberProgram(memberProgram: InsertMemberProgram): Promise<MemberProgram>;
  
  // Workouts
  getWorkoutsByProgram(programId: string): Promise<Workout[]>;
  getWorkout(id: string): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  
  // Workout Completions
  getWorkoutCompletions(userId: string): Promise<WorkoutCompletion[]>;
  createWorkoutCompletion(completion: InsertWorkoutCompletion): Promise<WorkoutCompletion>;
  
  // Saved Workouts
  getSavedWorkouts(userId: string): Promise<(SavedWorkout & { workout: Workout })[]>;
  createSavedWorkout(savedWorkout: InsertSavedWorkout): Promise<SavedWorkout>;
  deleteSavedWorkout(userId: string, workoutId: string): Promise<boolean>;
  
  // Community
  getCommunityPosts(channel?: string): Promise<(CommunityPost & { user: Pick<User, 'firstName' | 'lastName'> })[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  
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
  }>;
  
  // Program Purchases (for premium programs like Heal Your Core)
  createProgramPurchase(purchase: InsertProgramPurchase): Promise<ProgramPurchase>;
  getUserPurchases(userId: string): Promise<ProgramPurchase[]>;
  hasProgramAccess(userId: string, programId: string): Promise<boolean>;
  
  // Progress Tracking
  createProgressEntry(entry: InsertProgressTracking): Promise<ProgressTracking>;
  getProgressEntries(userId: string, programId: string): Promise<ProgressTracking[]>;
  updateProgressEntry(id: string, updates: Partial<ProgressTracking>): Promise<ProgressTracking | undefined>;
  
  // Knowledge Articles
  createKnowledgeArticle(article: InsertKnowledgeArticle): Promise<KnowledgeArticle>;
  getKnowledgeArticles(programId: string): Promise<KnowledgeArticle[]>;
  
  // Exercises
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  getExercises(): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
  
  // Weekly Workouts
  createWeeklyWorkout(workout: InsertWeeklyWorkout): Promise<WeeklyWorkout>;
  
  // Assets
  assetDisplayNames?: Map<string, string>;
  getWeeklyWorkouts(programId: string, week: number): Promise<(WeeklyWorkout & { exercise: Exercise })[]>;
  getAllWeeklyWorkouts(programId: string): Promise<(WeeklyWorkout & { exercise: Exercise })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private programs: Map<string, Program>;
  private memberPrograms: Map<string, MemberProgram>;
  private workouts: Map<string, Workout>;
  private workoutCompletions: Map<string, WorkoutCompletion>;
  private savedWorkouts: Map<string, SavedWorkout>;
  private communityPosts: Map<string, CommunityPost>;
  private notifications: Map<string, Notification>;
  private terms: Map<string, Terms>;
  private programPurchases: Map<string, ProgramPurchase>;
  private progressTracking: Map<string, ProgressTracking>;
  private knowledgeArticles: Map<string, KnowledgeArticle>;
  private exercises: Map<string, Exercise>;
  private weeklyWorkouts: Map<string, WeeklyWorkout>;
  public assetDisplayNames: Map<string, string>;

  constructor() {
    this.users = new Map();
    this.programs = new Map();
    this.memberPrograms = new Map();
    this.workouts = new Map();
    this.workoutCompletions = new Map();
    this.savedWorkouts = new Map();
    this.communityPosts = new Map();
    this.notifications = new Map();
    this.terms = new Map();
    this.programPurchases = new Map();
    this.progressTracking = new Map();
    this.knowledgeArticles = new Map();
    this.exercises = new Map();
    this.weeklyWorkouts = new Map();
    this.assetDisplayNames = new Map();
    
    this.initializeData();
  }

  private initializeData() {
    // Create admin user
    const adminId = randomUUID();
    const admin: User = {
      id: adminId,
      email: "admin@strongerwithzoe.in",
      password: "admin123",
      firstName: "Zoe",
      lastName: "Modgill",
      isAdmin: true,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      createdAt: new Date(),
    };
    this.users.set(adminId, admin);

    // Create test user
    const userId = randomUUID();
    const user: User = {
      id: userId,
      email: "jane@example.com",
      password: "password123",
      firstName: "Jane",
      lastName: "Doe",
      isAdmin: false,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      createdAt: new Date(),
    };
    this.users.set(userId, user);

    // Create programs

    // Create Heal Your Core premium program
    const healYourCoreId = randomUUID();
    const healYourCore: Program = {
      id: healYourCoreId,
      name: "Heal Your Core",
      description: "6-week postnatal fitness course designed to help you recover and strengthen your core after childbirth",
      level: "Postnatal",
      duration: "6 Weeks",
      equipment: "Minimal Equipment",
      imageUrl: "/assets/program-cover.png",
      price: 4500, // Premium pricing for specialized program
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
        description: "Foundation breathing exercise to reconnect with your core",
        videoUrl: "https://www.youtube.com/embed/example-breathing",
        duration: "2 minutes",
        instructions: "Lie on your back with knees bent. Place one hand on chest, one on belly. Breathe deeply into your belly.",
        category: "breathing",
        difficulty: "beginner",
      },
      {
        id: randomUUID(), 
        name: "Pelvic Tilts",
        description: "Gentle movement to activate deep abdominal muscles",
        videoUrl: "https://www.youtube.com/embed/example-pelvic-tilts",
        duration: "10 reps",
        instructions: "Lie on back, knees bent. Gently tilt pelvis to flatten lower back against floor.",
        category: "core",
        difficulty: "beginner",
      },
      {
        id: randomUUID(),
        name: "Modified Plank",
        description: "Adapted plank to rebuild core strength safely",
        videoUrl: "https://www.youtube.com/embed/example-modified-plank", 
        duration: "15-30 seconds",
        instructions: "Start on knees and forearms. Hold straight line from knees to head.",
        category: "core",
        difficulty: "beginner",
      },
      {
        id: randomUUID(),
        name: "Wall Push-ups",
        description: "Upper body strengthening with core engagement",
        videoUrl: "https://www.youtube.com/embed/example-wall-pushups",
        duration: "8-12 reps", 
        instructions: "Stand arm's length from wall. Push against wall, engaging core throughout.",
        category: "strength",
        difficulty: "beginner",
      },
      {
        id: randomUUID(),
        name: "Bird Dog",
        description: "Core stability exercise for balance and strength",
        videoUrl: "https://www.youtube.com/embed/example-bird-dog",
        duration: "5 reps each side",
        instructions: "On hands and knees, extend opposite arm and leg. Hold briefly, return to start.",
        category: "core",
        difficulty: "intermediate",
      },
    ];

    exercises.forEach(exercise => {
      this.exercises.set(exercise.id, exercise as Exercise);
    });

    // Create Knowledge Center articles for Heal Your Core
    const knowledgeArticles = [
      {
        id: randomUUID(),
        programId: healYourCoreId,
        title: "Understanding Your Core",
        content: "Your core is more than just your abs. It includes your diaphragm, pelvic floor, deep abdominal muscles, and back muscles working together to support your spine and pelvis. After pregnancy, these muscles need time and proper exercises to recover their function.",
        category: "core-understanding",
        videoUrl: "https://www.youtube.com/embed/example-core-anatomy",
        orderIndex: 1,
      },
      {
        id: randomUUID(),
        programId: healYourCoreId, 
        title: "Diastasis Recti: What You Need to Know",
        content: "Diastasis recti is the separation of the rectus abdominis muscles that commonly occurs during pregnancy. Learn how to check for it, understand its impact, and discover safe exercises to help heal this condition naturally.",
        category: "diastasis-recti",
        videoUrl: "https://www.youtube.com/embed/example-diastasis-check",
        orderIndex: 2,
      },
      {
        id: randomUUID(),
        programId: healYourCoreId,
        title: "The Role of Nutrition in Recovery",
        content: "Proper nutrition supports your body's healing process and gives you energy for your workouts. Focus on whole foods, adequate protein, healthy fats, and staying hydrated to optimize your recovery journey.",
        category: "nutrition",
        videoUrl: "https://www.youtube.com/embed/example-nutrition-tips",
        orderIndex: 3,
      },
      {
        id: randomUUID(),
        programId: healYourCoreId,
        title: "Breathing Techniques for Core Recovery",
        content: "Proper breathing is fundamental to core recovery. Learn the 360-degree breathing technique that helps activate your deep core muscles and supports your healing process.",
        category: "breathing",
        videoUrl: "https://www.youtube.com/embed/example-breathing-techniques",
        orderIndex: 4,
      },
    ];

    knowledgeArticles.forEach(article => {
      this.knowledgeArticles.set(article.id, article as KnowledgeArticle);
    });

    // Create weekly workouts for Heal Your Core (6 weeks)
    const healYourCoreExercises = exercises.filter(ex => ex.category === 'breathing' || ex.category === 'core');
    
    // Week 1 & 6: 4 workouts per week
    [1, 6].forEach(week => {
      [1, 2, 3, 4].forEach(day => {
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
    [2, 3, 4, 5].forEach(week => {
      [1, 3, 5].forEach(day => { // Monday, Wednesday, Friday
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
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      isAdmin: insertUser.isAdmin ?? false,
      termsAccepted: insertUser.termsAccepted ?? false,
      termsAcceptedAt: insertUser.termsAcceptedAt ?? null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
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
    const program: Program = { ...insertProgram, id };
    this.programs.set(id, program);
    return program;
  }

  async updateProgram(id: string, updates: Partial<Program>): Promise<Program | undefined> {
    const program = this.programs.get(id);
    if (!program) return undefined;
    
    const updatedProgram = { ...program, ...updates };
    this.programs.set(id, updatedProgram);
    return updatedProgram;
  }

  async getMemberPrograms(userId: string): Promise<(MemberProgram & { program: Program })[]> {
    const memberPrograms = Array.from(this.memberPrograms.values())
      .filter(mp => mp.userId === userId);
    
    return memberPrograms.map(mp => ({
      ...mp,
      program: this.programs.get(mp.programId)!
    }));
  }

  async createMemberProgram(insertMemberProgram: InsertMemberProgram): Promise<MemberProgram> {
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

  async getWorkoutsByProgram(programId: string): Promise<Workout[]> {
    return Array.from(this.workouts.values())
      .filter(w => w.programId === programId);
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
    return Array.from(this.workoutCompletions.values())
      .filter(wc => wc.userId === userId);
  }

  async createWorkoutCompletion(insertCompletion: InsertWorkoutCompletion): Promise<WorkoutCompletion> {
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

  async getSavedWorkouts(userId: string): Promise<(SavedWorkout & { workout: Workout })[]> {
    const savedWorkouts = Array.from(this.savedWorkouts.values())
      .filter(sw => sw.userId === userId);
    
    return savedWorkouts.map(sw => ({
      ...sw,
      workout: this.workouts.get(sw.workoutId)!
    }));
  }

  async createSavedWorkout(insertSavedWorkout: InsertSavedWorkout): Promise<SavedWorkout> {
    const id = randomUUID();
    const savedWorkout: SavedWorkout = {
      ...insertSavedWorkout,
      id,
      savedAt: new Date(),
    };
    this.savedWorkouts.set(id, savedWorkout);
    return savedWorkout;
  }

  async deleteSavedWorkout(userId: string, workoutId: string): Promise<boolean> {
    const savedWorkout = Array.from(this.savedWorkouts.values())
      .find(sw => sw.userId === userId && sw.workoutId === workoutId);
    
    if (savedWorkout) {
      this.savedWorkouts.delete(savedWorkout.id);
      return true;
    }
    return false;
  }

  async getCommunityPosts(channel?: string): Promise<(CommunityPost & { user: Pick<User, 'firstName' | 'lastName'> })[]> {
    const posts = Array.from(this.communityPosts.values())
      .filter(post => !channel || post.channel === channel)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    
    return posts.map(post => ({
      ...post,
      user: {
        firstName: this.users.get(post.userId)?.firstName || 'Unknown',
        lastName: this.users.get(post.userId)?.lastName || 'User'
      }
    }));
  }

  async createCommunityPost(insertPost: InsertCommunityPost): Promise<CommunityPost> {
    const id = randomUUID();
    const post: CommunityPost = {
      ...insertPost,
      id,
      channel: insertPost.channel || "general",
      createdAt: new Date(),
      isModerated: false,
    };
    this.communityPosts.set(id, post);
    return post;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
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
    return Array.from(this.terms.values()).find(t => t.isActive);
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

  async getUserStats(): Promise<{ totalMembers: number; activeMembers: number; expiringSoon: number; }> {
    const users = Array.from(this.users.values());
    const memberPrograms = Array.from(this.memberPrograms.values());
    
    const totalMembers = users.filter(u => !u.isAdmin).length;
    const activeMembers = memberPrograms.filter(mp => mp.isActive).length;
    const expiringSoon = memberPrograms.filter(mp => {
      const daysUntilExpiry = (mp.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    }).length;

    return { totalMembers, activeMembers, expiringSoon };
  }

  // Program Purchases methods
  async createProgramPurchase(insertPurchase: InsertProgramPurchase): Promise<ProgramPurchase> {
    const id = randomUUID();
    const purchase: ProgramPurchase = {
      ...insertPurchase,
      id,
      purchaseDate: new Date(),
    };
    this.programPurchases.set(id, purchase);
    return purchase;
  }

  async getUserPurchases(userId: string): Promise<ProgramPurchase[]> {
    return Array.from(this.programPurchases.values())
      .filter(purchase => purchase.userId === userId);
  }

  async hasProgramAccess(userId: string, programId: string): Promise<boolean> {
    const purchase = Array.from(this.programPurchases.values())
      .find(p => p.userId === userId && p.programId === programId && p.status === "active");
    return !!purchase;
  }

  // Progress Tracking methods
  async createProgressEntry(insertEntry: InsertProgressTracking): Promise<ProgressTracking> {
    const id = randomUUID();
    const entry: ProgressTracking = {
      ...insertEntry,
      id,
      recordedAt: new Date(),
    };
    this.progressTracking.set(id, entry);
    return entry;
  }

  async getProgressEntries(userId: string, programId: string): Promise<ProgressTracking[]> {
    return Array.from(this.progressTracking.values())
      .filter(entry => entry.userId === userId && entry.programId === programId)
      .sort((a, b) => a.week - b.week);
  }

  async updateProgressEntry(id: string, updates: Partial<ProgressTracking>): Promise<ProgressTracking | undefined> {
    const entry = this.progressTracking.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, ...updates };
    this.progressTracking.set(id, updatedEntry);
    return updatedEntry;
  }

  // Knowledge Articles methods
  async createKnowledgeArticle(insertArticle: InsertKnowledgeArticle): Promise<KnowledgeArticle> {
    const id = randomUUID();
    const article: KnowledgeArticle = {
      ...insertArticle,
      id,
      createdAt: new Date(),
    };
    this.knowledgeArticles.set(id, article);
    return article;
  }

  async getKnowledgeArticles(programId: string): Promise<KnowledgeArticle[]> {
    return Array.from(this.knowledgeArticles.values())
      .filter(article => article.programId === programId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  // Exercise methods
  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const exercise: Exercise = { ...insertExercise, id };
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
  async createWeeklyWorkout(insertWorkout: InsertWeeklyWorkout): Promise<WeeklyWorkout> {
    const id = randomUUID();
    const workout: WeeklyWorkout = { ...insertWorkout, id };
    this.weeklyWorkouts.set(id, workout);
    return workout;
  }

  async getWeeklyWorkouts(programId: string, week: number): Promise<(WeeklyWorkout & { exercise: Exercise })[]> {
    const weeklyWorkouts = Array.from(this.weeklyWorkouts.values())
      .filter(workout => workout.programId === programId && workout.week === week)
      .sort((a, b) => a.day - b.day || a.orderIndex - b.orderIndex);
    
    return weeklyWorkouts.map(workout => ({
      ...workout,
      exercise: this.exercises.get(workout.exerciseId)!
    }));
  }

  async getAllWeeklyWorkouts(programId: string): Promise<(WeeklyWorkout & { exercise: Exercise })[]> {
    const weeklyWorkouts = Array.from(this.weeklyWorkouts.values())
      .filter(workout => workout.programId === programId)
      .sort((a, b) => a.week - b.week || a.day - b.day || a.orderIndex - b.orderIndex);
    
    return weeklyWorkouts.map(workout => ({
      ...workout,
      exercise: this.exercises.get(workout.exerciseId)!
    }));
  }
}

export const storage = new MemStorage();
