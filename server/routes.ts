import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertWorkoutCompletionSchema, updateUserProfileSchema, adminCreateUserSchema } from "@shared/schema";
import { z } from "zod";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve assets
  app.get("/assets/:filename(*)", (req, res) => {
    try {
      const requestedFilename = decodeURIComponent(req.params.filename);
      const attachedAssetsPath = path.resolve(process.cwd(), "attached_assets");
      const filePath = path.resolve(attachedAssetsPath, requestedFilename);
      
      // Security check to ensure we're still in the attached_assets directory
      if (!filePath.startsWith(attachedAssetsPath)) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Check if file exists
      if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
      } else {
        res.status(404).json({ error: "Asset not found" });
      }
    } catch (error) {
      console.error("Asset serving error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Simple session - in production would use proper session management
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          termsAccepted: user.termsAccepted,
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Accept terms
  app.post("/api/auth/accept-terms", async (req, res) => {
    try {
      const { userId } = req.body;
      
      const updatedUser = await storage.updateUser(userId, {
        termsAccepted: true,
        termsAcceptedAt: new Date(),
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to accept terms" });
    }
  });

  app.post("/api/auth/accept-disclaimer", async (req, res) => {
    try {
      const { userId } = req.body;
      
      // Debug logging to see what's happening
      console.log("Disclaimer acceptance request for userId:", userId);
      
      // Check if user exists first
      const existingUser = await storage.getUser(userId);
      console.log("Found user:", existingUser ? `${existingUser.email}` : "NOT FOUND");
      
      const updatedUser = await storage.updateUser(userId, {
        disclaimerAccepted: true,
        disclaimerAcceptedAt: new Date(),
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Disclaimer acceptance error:", error);
      res.status(500).json({ message: "Failed to accept disclaimer" });
    }
  });

  // Update user profile
  app.patch("/api/users/:id/profile", async (req, res) => {
    try {
      const { id } = req.params;
      const profileUpdates = updateUserProfileSchema.parse(req.body);
      
      const updatedUser = await storage.updateUser(id, profileUpdates);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid profile data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get active terms
  app.get("/api/terms", async (req, res) => {
    try {
      const terms = await storage.getActiveTerms();
      res.json(terms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch terms" });
    }
  });

  // Programs
  app.get("/api/programs", async (req, res) => {
    try {
      const programs = await storage.getPrograms();
      res.json(programs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch programs" });
    }
  });

  // Member programs
  app.get("/api/member-programs/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const memberPrograms = await storage.getMemberPrograms(userId);
      res.json(memberPrograms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch member programs" });
    }
  });

  // Workouts
  app.get("/api/workouts/:programId", async (req, res) => {
    try {
      const { programId } = req.params;
      const workouts = await storage.getWorkoutsByProgram(programId);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  // Complete workout
  app.post("/api/workouts/complete", async (req, res) => {
    try {
      const completionData = insertWorkoutCompletionSchema.parse(req.body);
      
      const completion = await storage.createWorkoutCompletion(completionData);

      res.json(completion);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete workout" });
    }
  });

  // Save workout
  app.post("/api/workouts/save", async (req, res) => {
    try {
      const { userId, workoutId } = req.body;
      
      const savedWorkout = await storage.createSavedWorkout({
        userId,
        workoutId,
      });

      res.json(savedWorkout);
    } catch (error) {
      res.status(500).json({ message: "Failed to save workout" });
    }
  });

  // Get saved workouts
  app.get("/api/saved-workouts/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const savedWorkouts = await storage.getSavedWorkouts(userId);
      res.json(savedWorkouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch saved workouts" });
    }
  });

  // Get workout completions
  app.get("/api/workout-completions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const completions = await storage.getWorkoutCompletions(userId);
      res.json(completions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout completions" });
    }
  });

  // Program access control
  app.get("/api/program-access/:userId/:programId", async (req, res) => {
    try {
      const { userId, programId } = req.params;
      const hasAccess = await storage.hasProgramAccess(userId, programId);
      res.json({ hasAccess });
    } catch (error) {
      res.status(500).json({ message: "Failed to check program access" });
    }
  });

  // Create program purchase
  app.post("/api/program-purchases", async (req, res) => {
    try {
      const { userId, programId, amount } = req.body;
      const purchase = await storage.createProgramPurchase({
        userId,
        programId,
        amount,
        status: "active",
      });
      res.json(purchase);
    } catch (error) {
      res.status(500).json({ message: "Failed to create program purchase" });
    }
  });

  // Knowledge Center articles
  app.get("/api/knowledge-articles/:programId", async (req, res) => {
    try {
      const { programId } = req.params;
      const articles = await storage.getKnowledgeArticles(programId);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch knowledge articles" });
    }
  });

  // Weekly workouts
  app.get("/api/weekly-workouts/:programId", async (req, res) => {
    try {
      const { programId } = req.params;
      const { week } = req.query;
      
      if (week) {
        const workouts = await storage.getWeeklyWorkouts(programId, parseInt(week as string));
        res.json(workouts);
      } else {
        const allWorkouts = await storage.getAllWeeklyWorkouts(programId);
        res.json(allWorkouts);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly workouts" });
    }
  });

  // Progress tracking
  app.post("/api/progress-tracking", async (req, res) => {
    try {
      const progressData = req.body;
      const entry = await storage.createProgressEntry(progressData);
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to save progress entry" });
    }
  });

  app.get("/api/progress-tracking/:userId/:programId", async (req, res) => {
    try {
      const { userId, programId } = req.params;
      const entries = await storage.getProgressEntries(userId, programId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress entries" });
    }
  });

  app.put("/api/progress-tracking/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const entry = await storage.updateProgressEntry(id, updates);
      
      if (!entry) {
        return res.status(404).json({ message: "Progress entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to update progress entry" });
    }
  });

  // Exercise library
  app.get("/api/exercises", async (req, res) => {
    try {
      const exercises = await storage.getExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.get("/api/exercises/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const exercise = await storage.getExercise(id);
      
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  // Community posts
  app.get("/api/community/posts", async (req, res) => {
    try {
      const { channel } = req.query;
      const posts = await storage.getCommunityPosts(channel as string);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });

  app.post("/api/community/posts", async (req, res) => {
    try {
      const { userId, channel, content } = req.body;
      
      const post = await storage.createCommunityPost({
        userId,
        channel: channel || "general",
        content,
      });

      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Notifications
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.markNotificationRead(id);
      
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get all assets
  app.get("/api/admin/assets", async (req, res) => {
    try {
      const assetsDir = path.join(process.cwd(), "attached_assets");
      const files = fs.readdirSync(assetsDir);
      const assets = files
        .filter(file => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file))
        .map(file => {
          // Check if there's a custom display name stored
          const customDisplayName = storage.assetDisplayNames.get(file);
          const defaultDisplayName = file === "Screenshot 2025-09-01 at 11.11.48 PM_1756748511780.png" ? "zoe-cover-1" : 
                      file === "Screenshot 2025-09-01 at 11.07.44 PM_1756748649756.png" ? "stronger-with-zoe-logo" :
                      file === "Screenshot 2025-09-01 at 11.19.02 PM_1756748945653.png" ? "zoe-welcome-photo" : file;
          
          return {
            filename: file,
            displayName: customDisplayName || defaultDisplayName,
            url: `/assets/${file}`,
            lastModified: fs.statSync(path.join(assetsDir, file)).mtime
          };
        });
      res.json(assets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  // Update program
  app.put("/api/admin/programs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updatedProgram = await storage.updateProgram(id, updates);
      if (!updatedProgram) {
        return res.status(404).json({ message: "Program not found" });
      }
      
      res.json(updatedProgram);
    } catch (error) {
      res.status(500).json({ message: "Failed to update program" });
    }
  });

  // Update asset display name
  app.put("/api/admin/assets/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const { displayName } = req.body;
      
      storage.assetDisplayNames.set(filename, displayName);
      
      res.json({ filename, displayName, message: "Asset display name updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update asset display name" });
    }
  });

  // Create new user (admin only)
  app.post("/api/admin/users", async (req, res) => {
    try {
      // Convert date strings to Date objects before validation
      const requestData = { ...req.body };
      if (requestData.validFrom && typeof requestData.validFrom === 'string') {
        requestData.validFrom = new Date(requestData.validFrom);
      }
      if (requestData.validUntil && typeof requestData.validUntil === 'string') {
        requestData.validUntil = new Date(requestData.validUntil);
      }
      
      const userData = adminCreateUserSchema.parse(requestData);
      
      // Generate 6-digit password
      const password = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Set default validity dates if not provided
      const now = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(now.getFullYear() + 1);
      
      const newUser = await storage.createUser({
        email: userData.email,
        password: password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isAdmin: userData.isAdmin || false,
        phone: null,
        profilePictureUrl: null,
        termsAccepted: false,
        termsAcceptedAt: null,
        validFrom: userData.validFrom || now,
        validUntil: userData.validUntil || oneYearFromNow,
      });

      // Return user data with password for email template
      res.json({
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          isAdmin: newUser.isAdmin,
          validFrom: newUser.validFrom,
          validUntil: newUser.validUntil,
        },
        password: password,
        message: "User created successfully"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("User creation error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Temporary admin endpoint to update user passwords (for testing only)
  app.patch("/api/admin/users/:id/password", async (req, res) => {
    try {
      const { id } = req.params;
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }
      
      const updatedUser = await storage.updateUser(id, { password });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password update error:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
