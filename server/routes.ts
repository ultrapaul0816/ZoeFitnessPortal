import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  loginSchema,
  insertWorkoutCompletionSchema,
  updateUserProfileSchema,
  adminCreateUserSchema,
  insertProgressPhotoSchema,
  insertCommunityPostSchema,
  insertPostCommentSchema,
  passwordSchema,
  insertEmailCampaignSchema,
} from "@shared/schema";
import { z } from "zod";
import path from "path";
import fs from "fs";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import { emailService } from "./email/service";
import { replaceTemplateVariables, generateUserVariables, generateSampleVariables } from "./email/template-variables";

// Rate limiting configurations
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Increased from 5 to 15 login attempts per windowMs to reduce lockouts
  message: "Too many login attempts from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit password reset attempts
  message: "Too many password reset attempts, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});

const adminOperationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Allow more for admin operations but still prevent abuse
  message: "Too many admin operations, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});

const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Generous limit for general API use
  message: "Too many requests, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});

// Helper function to generate a strong password that meets all requirements
function generateStrongPassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  // Ensure at least one of each required character type
  const password = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
  ];
  
  // Fill the rest with random characters from all sets
  const allChars = lowercase + uppercase + numbers + special;
  for (let i = password.length; i < length; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }
  
  // Shuffle the password to avoid predictable patterns
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }
  
  return password.join('');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
});

// Configure multer for memory storage (streaming upload) with enhanced validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 4, // Allow up to 4 files for community posts
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files with specific mime types
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      // Additional check for file extension
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];
      const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
      
      if (allowedExtensions.includes(fileExtension)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file extension. Allowed: JPG, JPEG, PNG, WEBP, HEIC, HEIF'));
      }
    } else {
      cb(new Error('Invalid file type. Only image files (JPG, PNG, WEBP, HEIC) are allowed'));
    }
  },
});

// Session validation middleware
function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  next();
}

async function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(401).json({ message: "Unauthorized. Admin access required." });
    }
    next();
  } catch (error) {
    console.error("Error checking admin status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Multer error handling middleware - converts errors to proper 400 responses
function handleMulterError(err: any, req: any, res: any, next: any) {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File size too large. Maximum size is 10MB' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'Too many files. Maximum 4 images allowed per post' 
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        message: 'Unexpected file field' 
      });
    }
    // Other Multer errors
    return res.status(400).json({ 
      message: err.message || 'File upload error' 
    });
  }
  
  // Custom validation errors from fileFilter
  if (err && err.message) {
    return res.status(400).json({ message: err.message });
  }
  
  // Pass other errors to next handler
  next(err);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply general rate limiting to all API routes
  app.use("/api", generalApiLimiter);
  
  // Serve attached assets (use different path to avoid conflict with built assets)
  app.get("/attached-assets/:filename(*)", (req, res) => {
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
  app.post("/api/auth/login", loginLimiter, async (req, res) => {
    try {
      const { email, password, termsAccepted, disclaimerAccepted } = loginSchema.parse(
        req.body
      );

      console.log(`[LOGIN] Attempt for email: ${email}`);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log(`[LOGIN] Failed - User not found: ${email}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Handle transitional authentication for legacy plaintext passwords
      let isPasswordValid = false;
      const isBcryptHash = user.password.startsWith('$2b$') || user.password.startsWith('$2a$') || user.password.startsWith('$2y$');
      
      console.log(`[LOGIN] User found: ${email}, isBcryptHash: ${isBcryptHash}, termsAccepted: ${user.termsAccepted}, disclaimerAccepted: ${user.disclaimerAccepted}`);
      
      if (isBcryptHash) {
        // Password is already hashed - use bcrypt comparison
        isPasswordValid = await bcrypt.compare(password, user.password);
      } else {
        // Legacy plaintext password - compare directly
        isPasswordValid = password === user.password;
        
        // If valid, immediately hash and update the password for security
        if (isPasswordValid) {
          console.log(`[LOGIN] Migrating plaintext password to bcrypt for: ${email}`);
          const hashedPassword = await bcrypt.hash(password, 10);
          await storage.updateUser(user.id, { password: hashedPassword });
        }
      }
      
      if (!isPasswordValid) {
        console.log(`[LOGIN] Failed - Invalid password for: ${email}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log(`[LOGIN] Password valid for: ${email}`);

      // Check if user needs to accept terms and disclaimer
      if (!user.termsAccepted && !termsAccepted) {
        console.log(`[LOGIN] Requires terms acceptance: ${email}`);
        return res.status(403).json({ 
          message: "Please accept the terms and conditions to continue" 
        });
      }

      if (!user.disclaimerAccepted && !disclaimerAccepted) {
        console.log(`[LOGIN] Requires disclaimer acceptance: ${email}`);
        return res.status(403).json({ 
          message: "Please accept the disclaimer to continue" 
        });
      }

      // Handle terms and disclaimer acceptance if provided
      let updatedUser = user;
      const updates: any = {};

      if (termsAccepted && !user.termsAccepted) {
        updates.termsAccepted = true;
        updates.termsAcceptedAt = new Date();
      }

      if (disclaimerAccepted && !user.disclaimerAccepted) {
        updates.disclaimerAccepted = true;
        updates.disclaimerAcceptedAt = new Date();
      }

      // Always update last login timestamp
      updates.lastLoginAt = new Date();

      if (Object.keys(updates).length > 0) {
        updatedUser = (await storage.updateUser(user.id, updates)) || user;
      }

      // One-time migration: If user has profile data in request, save it to database
      const { profileData } = req.body;
      if (profileData && typeof profileData === 'object') {
        const profileUpdates: any = {};
        if (profileData.country && !updatedUser.country) profileUpdates.country = profileData.country;
        if (profileData.bio && !updatedUser.bio) profileUpdates.bio = profileData.bio;
        if (profileData.socials && !updatedUser.instagramHandle) profileUpdates.instagramHandle = profileData.socials;
        if (profileData.postpartumTime && !updatedUser.postpartumWeeks) {
          // Convert postpartum time to weeks
          const postpartumText = profileData.postpartumTime.toLowerCase().trim();
          const match = postpartumText.match(/(\d+\.?\d*)/);
          if (match) {
            const value = parseFloat(match[1]);
            if (postpartumText.includes('week')) {
              profileUpdates.postpartumWeeks = Math.round(value);
            } else if (postpartumText.includes('month')) {
              profileUpdates.postpartumWeeks = Math.round(value * 4.33);
            } else if (postpartumText.includes('year')) {
              profileUpdates.postpartumWeeks = Math.round(value * 52);
            }
          }
        }
        if (Object.keys(profileUpdates).length > 0) {
          updatedUser = (await storage.updateUser(user.id, profileUpdates)) || updatedUser;
        }
      }

      // Create server-side session
      req.session.userId = updatedUser.id;

      console.log(`[LOGIN] Success for: ${updatedUser.email} (isAdmin: ${updatedUser.isAdmin})`);

      res.json({
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          isAdmin: updatedUser.isAdmin,
          termsAccepted: updatedUser.termsAccepted,
          disclaimerAccepted: updatedUser.disclaimerAccepted,
          hasWhatsAppSupport: updatedUser.hasWhatsAppSupport,
          whatsAppSupportDuration: updatedUser.whatsAppSupportDuration,
          whatsAppSupportExpiryDate: updatedUser.whatsAppSupportExpiryDate,
          phone: updatedUser.phone,
          country: updatedUser.country,
          bio: updatedUser.bio,
          instagramHandle: updatedUser.instagramHandle,
          postpartumWeeks: updatedUser.postpartumWeeks,
          lastLoginAt: updatedUser.lastLoginAt,
        },
      });
    } catch (error: any) {
      console.error(`[LOGIN] Error:`, error?.message || error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Check current session and return user if logged in
  app.get("/api/auth/session", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        // Session exists but user doesn't - clear invalid session
        req.session.destroy(() => {});
        return res.status(401).json({ message: "Invalid session" });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          termsAccepted: user.termsAccepted,
          disclaimerAccepted: user.disclaimerAccepted,
          hasWhatsAppSupport: user.hasWhatsAppSupport,
          whatsAppSupportDuration: user.whatsAppSupportDuration,
          whatsAppSupportExpiryDate: user.whatsAppSupportExpiryDate,
          phone: user.phone,
          country: user.country,
          bio: user.bio,
          instagramHandle: user.instagramHandle,
          postpartumWeeks: user.postpartumWeeks,
          lastLoginAt: user.lastLoginAt,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve session" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.json({ message: "Logged out successfully" });
    });
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

  // Check disclaimer status by email
  app.get("/api/users/disclaimer-status", async (req, res) => {
    try {
      const { email } = req.query;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ needsDisclaimer: true }); // New users need disclaimer
      }

      res.json({
        needsDisclaimer: !user.disclaimerAccepted,
        userExists: true,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check disclaimer status" });
    }
  });

  app.post("/api/auth/accept-disclaimer", async (req, res) => {
    try {
      const { userId } = req.body;

      const updatedUser = await storage.updateUser(userId, {
        disclaimerAccepted: true,
        disclaimerAcceptedAt: new Date(),
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ success: true });
    } catch (error) {
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
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Upload profile photo
  app.post("/api/users/:id/profile-photo", upload.single('photo'), async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No photo file provided" });
      }

      // Upload full-size photo to Cloudinary
      const fullSizeResult: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "profile_photos",
            resource_type: "image",
            transformation: [
              { width: 800, height: 800, crop: "limit" },
              { quality: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });

      // Upload thumbnail version to Cloudinary
      const thumbnailResult: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "profile_photos/thumbnails",
            resource_type: "image",
            transformation: [
              { width: 150, height: 150, crop: "fill", gravity: "face" },
              { quality: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });

      // Update user with both URLs
      const updatedUser = await storage.updateUser(id, {
        profilePictureUrl: fullSizeResult.secure_url,
        profilePictureThumbnailUrl: thumbnailResult.secure_url,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Profile photo upload error:", error);
      res.status(500).json({ message: "Failed to upload profile photo" });
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
      console.log(`[GET] Member programs for ${userId}: ${memberPrograms.length} programs`);
      res.json(memberPrograms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch member programs" });
    }
  });

  // Enroll user in program
  app.post("/api/member-programs", async (req, res) => {
    try {
      const { userId, programId, expiryDate } = req.body;
      
      // Check if user is already enrolled in this program
      const existingEnrollments = await storage.getMemberPrograms(userId);
      const alreadyEnrolled = existingEnrollments.some(
        (enrollment: any) => enrollment.programId === programId
      );
      
      if (alreadyEnrolled) {
        return res.status(400).json({ 
          message: "User is already enrolled in this program" 
        });
      }
      
      const memberProgram = await storage.createMemberProgram({
        userId,
        programId,
        expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year
        isActive: true,
        progress: 0,
      });
      res.json(memberProgram);
    } catch (error) {
      console.error("Failed to create member program:", error);
      res.status(500).json({ message: "Failed to enroll user in program" });
    }
  });

  // Remove user enrollment from program
  app.delete("/api/member-programs/:enrollmentId", async (req, res) => {
    try {
      const { enrollmentId } = req.params;
      console.log(`[DELETE] Removing enrollment: ${enrollmentId}`);
      await storage.deleteMemberProgram(enrollmentId);
      console.log(`[DELETE] Successfully removed enrollment: ${enrollmentId}`);
      res.json({ message: "Enrollment removed successfully" });
    } catch (error) {
      console.error("Failed to delete member program:", error);
      res.status(500).json({ message: "Failed to remove enrollment" });
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

  // Reflection Notes routes
  app.get("/api/reflection-notes/:userId/:programId", async (req, res) => {
    try {
      const { userId, programId } = req.params;
      const note = await storage.getReflectionNote(userId, programId);
      res.json(note || { noteText: "" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reflection note" });
    }
  });

  app.post("/api/reflection-notes", async (req, res) => {
    try {
      const { userId, programId, noteText } = req.body;

      if (!userId || !programId || !noteText) {
        return res
          .status(400)
          .json({ message: "userId, programId, and noteText are required" });
      }

      const note = await storage.updateReflectionNote(
        userId,
        programId,
        noteText
      );
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to save reflection note" });
    }
  });

  // Weekly workouts
  app.get("/api/weekly-workouts/:programId", async (req, res) => {
    try {
      const { programId } = req.params;
      const { week } = req.query;

      if (week) {
        const workouts = await storage.getWeeklyWorkouts(
          programId,
          parseInt(week as string)
        );
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

  // Community Feed Routes
  
  // Get community posts with filtering and sorting
  app.get("/api/community/posts", async (req, res) => {
    try {
      const { category, weekNumber, userId, sortBy } = req.query;
      
      const posts = await storage.getCommunityPosts({
        category: category as string | undefined,
        weekNumber: weekNumber ? parseInt(weekNumber as string) : undefined,
        userId: userId as string | undefined,
        sortBy: sortBy as 'newest' | 'mostLiked' | undefined,
      });
      
      res.json(posts);
    } catch (error) {
      console.error("Error fetching community posts:", error);
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });

  // Get single post by ID
  app.get("/api/community/posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.query;
      
      const post = await storage.getPostById(id, userId as string);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  // Create new community post with multiple image uploads (max 4)
  app.post(
    "/api/community/posts",
    upload.array("images", 4),
    handleMulterError,
    async (req, res) => {
      try {
        const { userId, content, category, weekNumber, isSensitiveContent } = req.body;
        
        // Validate required fields
        if (!userId || !content) {
          return res.status(400).json({ message: "User ID and content are required" });
        }

        let imageUrls: string[] | undefined;
        let cloudinaryPublicIds: string[] | undefined;

        // Upload images to Cloudinary if provided (support multiple)
        const files = req.files as Express.Multer.File[] | undefined;
        if (files && files.length > 0) {
          const uploadPromises = files.map((file) => {
            return new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                {
                  folder: "community_posts",
                  resource_type: "image",
                  transformation: [
                    { width: 1080, height: 1080, crop: "limit" },
                    { quality: "auto" },
                  ],
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              );
              uploadStream.end(file.buffer);
            });
          });

          const uploadResults = await Promise.all(uploadPromises);
          imageUrls = uploadResults.map((result: any) => result.secure_url);
          cloudinaryPublicIds = uploadResults.map((result: any) => result.public_id);
        }

        // Validate with schema
        const postData = insertCommunityPostSchema.parse({
          userId,
          content,
          category: category || 'general',
          weekNumber: weekNumber ? parseInt(weekNumber) : undefined,
          imageUrls,
          cloudinaryPublicIds,
          isSensitiveContent: isSensitiveContent === 'true',
        });

        const post = await storage.createCommunityPost(postData);
        res.status(201).json(post);
      } catch (error) {
        console.error("Error creating post:", error);
        if (error instanceof z.ZodError) {
          return res.status(400).json({ 
            message: "Validation error", 
            errors: error.errors 
          });
        }
        res.status(500).json({ message: "Failed to create post" });
      }
    }
  );

  // Delete post (user can delete their own posts)
  app.delete("/api/community/posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const success = await storage.deletePost(id, userId);
      
      if (!success) {
        return res.status(403).json({ message: "Unauthorized or post not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Report post
  app.post("/api/community/posts/:id/report", async (req, res) => {
    try {
      const { id } = req.params;
      
      const success = await storage.reportPost(id);
      
      if (!success) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error reporting post:", error);
      res.status(500).json({ message: "Failed to report post" });
    }
  });

  // Mark post as featured (admin only)
  app.patch("/api/community/posts/:id/featured", async (req, res) => {
    try {
      const { id } = req.params;
      const { featured } = req.body;
      
      const success = await storage.markPostAsFeatured(id, featured);
      
      if (!success) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating featured status:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  // Like a post
  app.post("/api/community/posts/:id/like", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const like = await storage.likePost(userId, id);
      res.status(201).json(like);
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  // Unlike a post
  app.delete("/api/community/posts/:id/like", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const success = await storage.unlikePost(userId, id);
      
      if (!success) {
        return res.status(404).json({ message: "Like not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  // Get post likes
  app.get("/api/community/posts/:id/likes", async (req, res) => {
    try {
      const { id } = req.params;
      
      const likes = await storage.getPostLikes(id);
      res.json(likes);
    } catch (error) {
      console.error("Error fetching likes:", error);
      res.status(500).json({ message: "Failed to fetch likes" });
    }
  });

  // Create comment on post
  app.post("/api/community/posts/:id/comments", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, content } = req.body;
      
      if (!userId || !content) {
        return res.status(400).json({ message: "User ID and content are required" });
      }

      const commentData = insertPostCommentSchema.parse({
        userId,
        postId: id,
        content,
      });

      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Get post comments
  app.get("/api/community/posts/:id/comments", async (req, res) => {
    try {
      const { id } = req.params;
      
      const comments = await storage.getPostComments(id);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Delete comment (user can delete their own comments)
  app.delete("/api/community/comments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const success = await storage.deleteComment(id, userId);
      
      if (!success) {
        return res.status(403).json({ message: "Unauthorized or comment not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
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

  // Get current user data
  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
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

  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Email test endpoint
  app.post("/api/admin/email/send-test", adminOperationLimiter, async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== "admin") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email address is required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email address" });
      }

      const result = await emailService.sendTestEmail(email);

      if (!result.success) {
        return res.status(500).json({ 
          message: "Failed to send test email",
          error: result.error 
        });
      }

      res.json({ 
        success: true,
        message: "Test email sent successfully",
        messageId: result.messageId
      });
    } catch (error) {
      console.error("Email test error:", error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });

  // Template test email endpoint
  app.post("/api/admin/email-campaigns/send-test", adminOperationLimiter, async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== "admin") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { templateType, email, subject } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email address is required" });
      }

      if (!templateType) {
        return res.status(400).json({ message: "Template type is required" });
      }

      const validTemplates = ['welcome', 're-engagement', 'program-reminder', 'completion-celebration'];
      if (!validTemplates.includes(templateType)) {
        return res.status(400).json({ message: "Invalid template type" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email address" });
      }

      const result = await emailService.sendTemplateTestEmail(
        templateType as 'welcome' | 're-engagement' | 'program-reminder' | 'completion-celebration',
        email,
        subject
      );

      if (!result.success) {
        return res.status(500).json({ 
          message: "Failed to send test email",
          error: result.error 
        });
      }

      res.json({ 
        success: true,
        message: "Test email sent successfully",
        messageId: result.messageId
      });
    } catch (error) {
      console.error("Template test email error:", error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });

  // Get all email campaigns
  app.get("/api/admin/email-campaigns", requireAdmin, async (req, res) => {
    try {
      const campaigns = await storage.getEmailCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  // Create email campaign
  app.post("/api/admin/email-campaigns", adminOperationLimiter, async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== "admin") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Validate request body with Zod schema (omit createdBy since server controls it)
      const validationResult = insertEmailCampaignSchema.omit({ createdBy: true }).safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid campaign data", 
          errors: validationResult.error.errors 
        });
      }

      // Use server-side user ID for audit trail (server controls createdBy)
      const campaignData = {
        ...validationResult.data,
        createdBy: req.user.id,
      };

      const campaign = await storage.createEmailCampaign(campaignData);

      res.json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  // Send email campaign
  app.post("/api/admin/email-campaigns/:id/send", adminOperationLimiter, async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== "admin") {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;
      const campaign = await storage.getEmailCampaign(id);

      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      if (campaign.status !== "draft") {
        return res.status(400).json({ message: "Campaign has already been sent or is not in draft status" });
      }

      // Update status to sending
      await storage.updateEmailCampaign(id, { status: "sending" });

      // Get targeted users based on audience filter
      const targetedUsers = await storage.getTargetedUsers(campaign.audienceFilter);

      if (targetedUsers.length === 0) {
        await storage.updateEmailCampaign(id, { status: "failed", recipientCount: 0 });
        return res.status(400).json({ message: "No users match the target audience" });
      }

      // Create recipient records
      const recipients = targetedUsers.map(user => ({
        campaignId: id,
        userId: user.id,
        email: user.email,
        status: "pending" as const,
      }));

      await storage.createCampaignRecipients(recipients);

      // Update campaign with recipient count
      await storage.updateEmailCampaign(id, {
        recipientCount: targetedUsers.length,
      });

      // Send emails asynchronously (fire and forget) with error handling
      setImmediate(async () => {
        try {
          let sentCount = 0;
          let failedCount = 0;

          for (const recipient of createdRecipients) {
            try {
              const user = targetedUsers.find(u => u.id === recipient.userId);
              if (!user) continue;

              let result;
              switch (campaign.templateType) {
                case "welcome":
                  result = await emailService.sendWelcomeEmail(user, "Heal Your Core");
                  break;
                case "re-engagement":
                  result = await emailService.sendReEngagementEmail(user, {
                    lastLoginDays: Math.floor((Date.now() - (user.lastLoginAt?.getTime() || Date.now())) / (1000 * 60 * 60 * 24)),
                    programProgress: undefined,
                  });
                  break;
                case "program-reminder":
                  result = await emailService.sendProgramReminderEmail(user, {
                    programName: "Heal Your Core",
                    weekNumber: 1,
                    workoutsCompleted: 0,
                    totalWorkouts: 3,
                  });
                  break;
                case "completion-celebration":
                  result = await emailService.sendCompletionCelebrationEmail(user, {
                    programName: "Your Postpartum Strength Recovery Program",
                    completionDate: new Date(),
                    weeksCompleted: 6,
                  });
                  break;
                default:
                  result = { success: false, error: "Unknown template type" };
              }

              if (result.success) {
                sentCount++;
                await storage.updateRecipientStatus(recipient.id!, "sent", new Date(), undefined, result.messageId);
              } else {
                failedCount++;
                await storage.updateRecipientStatus(recipient.id!, "failed", undefined, result.error);
              }
            } catch (error) {
              failedCount++;
              console.error(`Error sending email to ${recipient.email}:`, error);
              await storage.updateRecipientStatus(recipient.id!, "failed", undefined, error instanceof Error ? error.message : "Unknown error");
            }
          }

          // Update campaign final status
          await storage.updateEmailCampaign(id, {
            status: failedCount === targetedUsers.length ? "failed" : "sent",
            sentAt: new Date(),
            sentCount,
            failedCount,
          });
          
          console.log(`Campaign ${id} completed: ${sentCount} sent, ${failedCount} failed`);
        } catch (error) {
          // Catch any unexpected errors in the email sending process
          console.error(`Fatal error in campaign ${id} send process:`, error);
          await storage.updateEmailCampaign(id, {
            status: "failed",
            sentAt: new Date(),
            failedCount: targetedUsers.length,
          }).catch(err => console.error("Failed to update campaign status after error:", err));
        }
      });

      res.json({ 
        success: true,
        message: "Campaign is being sent",
        recipientCount: targetedUsers.length
      });
    } catch (error) {
      console.error("Error sending campaign:", error);
      await storage.updateEmailCampaign(req.params.id, { status: "failed" });
      res.status(500).json({ message: "Failed to send campaign" });
    }
  });

  // Email Template Management Routes

  // Get all email templates with stats
  app.get("/api/admin/email-templates", requireAdmin, async (req, res) => {
    try {
      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ message: "Failed to fetch email templates" });
    }
  });

  // Generate preview with sample data
  app.post("/api/admin/email-templates/:id/preview", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const template = await storage.getEmailTemplate(id);

      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      const baseUrl = process.env.REPLIT_DEV_DOMAIN || 'https://your-domain.repl.co';
      const sampleVariables = generateSampleVariables(baseUrl);

      const previewSubject = replaceTemplateVariables(template.subject, sampleVariables);
      const previewContent = replaceTemplateVariables(template.htmlContent, sampleVariables);

      res.json({
        subject: previewSubject,
        content: previewContent,
        variables: sampleVariables,
      });
    } catch (error) {
      console.error("Error generating preview:", error);
      res.status(500).json({ message: "Failed to generate preview" });
    }
  });

  // Send test email to specified address
  app.post("/api/admin/email-templates/:id/send-test", requireAdmin, adminOperationLimiter, async (req, res) => {
    try {
      const { id } = req.params;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email address is required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email address" });
      }

      const template = await storage.getEmailTemplate(id);

      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      const baseUrl = process.env.REPLIT_DEV_DOMAIN || 'https://your-domain.repl.co';
      const sampleVariables = generateSampleVariables(baseUrl);

      const subject = replaceTemplateVariables(template.subject, sampleVariables);
      const html = replaceTemplateVariables(template.htmlContent, sampleVariables);

      const result = await emailService.send({
        to: { email, name: 'Test Recipient' },
        subject,
        html,
        text: html.replace(/<[^>]*>/g, ''),
      });

      if (!result.success) {
        return res.status(500).json({
          message: "Failed to send test email",
          error: result.error,
        });
      }

      res.json({
        success: true,
        message: "Test email sent successfully",
        messageId: result.messageId,
      });
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });

  // Preview campaign (get recipients and email preview without sending)
  app.post("/api/admin/email-templates/:id/preview-campaign", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { audienceFilter } = req.body;

      if (!audienceFilter) {
        return res.status(400).json({ message: "Audience filter is required" });
      }

      const template = await storage.getEmailTemplate(id);

      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      const targetedUsers = await storage.getTargetedUsers(audienceFilter);

      if (targetedUsers.length === 0) {
        return res.status(400).json({ 
          message: "No users match the target audience",
          recipientCount: 0,
          recipients: [],
        });
      }

      // Generate preview with first user's data
      const baseUrl = process.env.REPLIT_DEV_DOMAIN || 'https://your-domain.repl.co';
      const firstUser = targetedUsers[0];
      const userVariables = generateUserVariables(firstUser, {
        programName: 'Your Postpartum Strength Recovery Program',
        campaignId: 'preview',
        recipientId: 'preview',
        baseUrl,
      });

      const previewSubject = replaceTemplateVariables(template.subject, userVariables);
      const previewHtml = replaceTemplateVariables(template.htmlContent, userVariables);

      // Return recipient list and preview
      const recipients = targetedUsers.map(user => ({
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
      }));

      res.json({
        recipientCount: targetedUsers.length,
        recipients,
        preview: {
          subject: previewSubject,
          html: previewHtml,
          sampleRecipient: {
            name: `${firstUser.firstName} ${firstUser.lastName}`,
            email: firstUser.email,
          },
        },
        template: {
          id: template.id,
          name: template.name,
          type: template.type,
        },
      });
    } catch (error) {
      console.error("Error previewing campaign:", error);
      res.status(500).json({ message: "Failed to preview campaign" });
    }
  });

  // Send campaign to targeted users
  app.post("/api/admin/email-templates/:id/send-campaign", requireAdmin, adminOperationLimiter, async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { audienceFilter, campaignName, scheduledFor } = req.body;

      if (!audienceFilter) {
        return res.status(400).json({ message: "Audience filter is required" });
      }

      if (!campaignName) {
        return res.status(400).json({ message: "Campaign name is required" });
      }

      const template = await storage.getEmailTemplate(id);

      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      const targetedUsers = await storage.getTargetedUsers(audienceFilter);

      if (targetedUsers.length === 0) {
        return res.status(400).json({ message: "No users match the target audience" });
      }

      // Handle scheduled campaigns
      const isScheduled = scheduledFor && new Date(scheduledFor) > new Date();
      const scheduledDate = scheduledFor ? new Date(scheduledFor) : undefined;

      const campaign = await storage.createEmailCampaign({
        templateId: template.id,
        name: campaignName,
        templateType: template.type as "welcome" | "re-engagement" | "program-reminder" | "completion-celebration",
        subject: template.subject,
        htmlContent: template.htmlContent,
        audienceFilter,
        status: isScheduled ? "scheduled" : "sending",
        scheduledFor: scheduledDate,
        createdBy: req.session.userId,
      });

      // Update campaign with recipient count
      await storage.updateEmailCampaign(campaign.id!, {
        recipientCount: targetedUsers.length,
      });

      // If scheduled for later, just save and return
      if (isScheduled) {
        const recipientsToCreate = targetedUsers.map(user => ({
          campaignId: campaign.id!,
          userId: user.id,
          email: user.email,
          status: "pending" as const,
        }));
        await storage.createCampaignRecipients(recipientsToCreate);
        
        return res.json({
          success: true,
          scheduled: true,
          message: `Campaign scheduled for ${scheduledDate?.toISOString()}`,
          campaignId: campaign.id,
          recipientCount: targetedUsers.length,
        });
      }

      const recipientsToCreate = targetedUsers.map(user => ({
        campaignId: campaign.id!,
        userId: user.id,
        email: user.email,
        status: "pending" as const,
      }));

      const createdRecipients = await storage.createCampaignRecipients(recipientsToCreate);

      const baseUrl = process.env.REPLIT_DEV_DOMAIN || 'https://your-domain.repl.co';

      setImmediate(async () => {
        try {
          let sentCount = 0;
          let failedCount = 0;

          for (const recipient of createdRecipients) {
            try {
              const user = targetedUsers.find(u => u.id === recipient.userId);
              if (!user) continue;

              const userVariables = generateUserVariables(user, {
                programName: 'Heal Your Core',
                campaignId: campaign.id,
                recipientId: recipient.id,
                baseUrl,
              });

              const subject = replaceTemplateVariables(template.subject, userVariables);
              const html = replaceTemplateVariables(template.htmlContent, userVariables);

              const result = await emailService.send({
                to: { email: user.email, name: `${user.firstName} ${user.lastName}` },
                subject,
                html,
                text: html.replace(/<[^>]*>/g, ''),
              });

              if (result.success) {
                sentCount++;
                await storage.updateRecipientStatus(recipient.id!, "sent", new Date(), undefined, result.messageId);
              } else {
                failedCount++;
                await storage.updateRecipientStatus(recipient.id!, "failed", undefined, result.error);
              }
            } catch (error) {
              failedCount++;
              console.error(`Error sending email to ${recipient.email}:`, error);
              await storage.updateRecipientStatus(recipient.id!, "failed", undefined, error instanceof Error ? error.message : "Unknown error");
            }
          }

          await storage.updateEmailCampaign(campaign.id!, {
            status: failedCount === targetedUsers.length ? "failed" : "sent",
            sentAt: new Date(),
            sentCount,
            failedCount,
          });

          await storage.incrementTemplateSends(template.id!);

          console.log(`Campaign ${campaign.id} completed: ${sentCount} sent, ${failedCount} failed`);
        } catch (error) {
          console.error(`Fatal error in campaign ${campaign.id} send process:`, error);
          await storage.updateEmailCampaign(campaign.id!, {
            status: "failed",
            sentAt: new Date(),
            failedCount: targetedUsers.length,
          }).catch(err => console.error("Failed to update campaign status after error:", err));
        }
      });

      res.json({
        success: true,
        message: "Campaign is being sent",
        campaignId: campaign.id,
        recipientCount: targetedUsers.length,
      });
    } catch (error) {
      console.error("Error sending campaign:", error);
      res.status(500).json({ message: "Failed to send campaign" });
    }
  });

  // Update template subject/content
  app.patch("/api/admin/email-templates/:id", requireAdmin, adminOperationLimiter, async (req, res) => {
    try {
      const { id} = req.params;
      const { subject, htmlContent } = req.body;

      if (!subject && !htmlContent) {
        return res.status(400).json({ message: "At least one field (subject or htmlContent) is required" });
      }

      const updates: Partial<{ subject: string; htmlContent: string }> = {};
      if (subject) updates.subject = subject;
      if (htmlContent) updates.htmlContent = htmlContent;

      const updatedTemplate = await storage.updateEmailTemplate(id, updates);

      if (!updatedTemplate) {
        return res.status(404).json({ message: "Template not found" });
      }

      res.json(updatedTemplate);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  // Tracking pixel endpoint
  app.get("/api/email-track/:campaignId/:recipientId", async (req, res) => {
    try {
      const { campaignId, recipientId } = req.params;

      await storage.recordEmailOpen({
        campaignId,
        recipientId,
        openedAt: new Date(),
      });

      const pixel = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
      );

      res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': pixel.length,
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
      });
      res.end(pixel);
    } catch (error) {
      console.error("Error recording email open:", error);
      const pixel = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
      );
      res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': pixel.length,
      });
      res.end(pixel);
    }
  });

  // Email Automation Rules Routes
  
  // Get all automation rules
  app.get("/api/admin/automation-rules", requireAdmin, async (req, res) => {
    try {
      const rules = await storage.getEmailAutomationRules();
      res.json(rules);
    } catch (error) {
      console.error("Error fetching automation rules:", error);
      res.status(500).json({ message: "Failed to fetch automation rules" });
    }
  });

  // Update automation rule (toggle enabled, or update subject/content)
  app.patch("/api/admin/automation-rules/:id", requireAdmin, adminOperationLimiter, async (req, res) => {
    try {
      const { id } = req.params;
      const { enabled, subject, htmlContent } = req.body;

      if (enabled === undefined && !subject && !htmlContent) {
        return res.status(400).json({ 
          message: "At least one field (enabled, subject, or htmlContent) is required" 
        });
      }

      const updates: Partial<{ enabled: boolean; subject: string; htmlContent: string; updatedAt: Date }> = {};
      if (enabled !== undefined) updates.enabled = enabled;
      if (subject) updates.subject = subject;
      if (htmlContent) updates.htmlContent = htmlContent;
      updates.updatedAt = new Date();

      const updatedRule = await storage.updateEmailAutomationRule(id, updates);

      if (!updatedRule) {
        return res.status(404).json({ message: "Automation rule not found" });
      }

      res.json(updatedRule);
    } catch (error) {
      console.error("Error updating automation rule:", error);
      res.status(500).json({ message: "Failed to update automation rule" });
    }
  });

  // Send test email for automation rule
  app.post("/api/admin/automation-rules/:id/test", requireAdmin, adminOperationLimiter, async (req, res) => {
    try {
      const { id } = req.params;
      const testEmail = "me@zoemodgill.in";

      const rule = await storage.getEmailAutomationRule(id);
      if (!rule) {
        return res.status(404).json({ message: "Automation rule not found" });
      }

      // Replace variables with test data
      const testData = {
        userName: "Jane Smith",
        firstName: "Jane",
        programName: "Your Postpartum Strength Recovery Program",
        weekNumber: "3",
      };

      let subject = rule.subject;
      let htmlContent = rule.htmlContent;

      Object.entries(testData).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, value);
        htmlContent = htmlContent.replace(regex, value);
      });

      // Send via email service
      await emailService.send({
        to: { email: testEmail, name: "Test User" },
        subject: `[TEST] ${subject}`,
        html: htmlContent,
      });

      res.json({ 
        message: `Test email sent to ${testEmail}`,
        sentTo: testEmail 
      });
    } catch (error) {
      console.error("Error sending test automation email:", error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });

  // Email Analytics Routes
  app.get("/api/admin/analytics/email-campaigns", requireAdmin, async (req, res) => {
    try {
      const campaigns = await storage.getEmailCampaigns();
      const templates = await storage.getEmailTemplates();

      const totalCampaigns = campaigns.length;
      const totalSent = campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
      const totalOpens = campaigns.reduce((sum, c) => sum + (c.openCount || 0), 0);
      const averageOpenRate = totalSent > 0 ? Math.round((totalOpens / totalSent) * 100) : 0;

      const templateStats = templates.map(template => {
        const templateCampaigns = campaigns.filter(c => c.templateType === template.type);
        const sent = templateCampaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
        const opens = templateCampaigns.reduce((sum, c) => sum + (c.openCount || 0), 0);
        const openRate = sent > 0 ? Math.round((opens / sent) * 100) : 0;

        return {
          templateId: template.id,
          templateType: template.type,
          templateName: template.name,
          totalSent: sent,
          totalOpens: opens,
          openRate,
          campaigns: templateCampaigns.length,
        };
      });

      const recentCampaigns = campaigns
        .slice(0, 10)
        .map(campaign => ({
          id: campaign.id,
          name: campaign.name,
          templateType: campaign.templateType,
          status: campaign.status,
          sentAt: campaign.sentAt,
          recipientCount: campaign.recipientCount,
          sentCount: campaign.sentCount || 0,
          openCount: campaign.openCount || 0,
          openRate: (campaign.sentCount || 0) > 0
            ? Math.round(((campaign.openCount || 0) / (campaign.sentCount || 0)) * 100)
            : 0,
        }));

      res.json({
        overview: {
          totalCampaigns,
          totalSent,
          totalOpens,
          averageOpenRate,
        },
        templateStats,
        recentCampaigns,
      });
    } catch (error) {
      console.error("Error fetching email analytics:", error);
      res.status(500).json({ message: "Failed to fetch email analytics" });
    }
  });

  // Get all assets
  app.get("/api/admin/assets", async (req, res) => {
    try {
      const assetsDir = path.join(process.cwd(), "attached_assets");
      const files = fs.readdirSync(assetsDir);
      const assets = files
        .filter((file) => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file))
        .map((file) => {
          // Check if there's a custom display name stored
          const customDisplayName = storage.assetDisplayNames.get(file);
          const defaultDisplayName =
            file === "Screenshot 2025-09-01 at 11.11.48 PM_1756748511780.png"
              ? "zoe-cover-1"
              : file ===
                "Screenshot 2025-09-01 at 11.07.44 PM_1756748649756.png"
              ? "stronger-with-zoe-logo"
              : file ===
                "Screenshot 2025-09-01 at 11.19.02 PM_1756748945653.png"
              ? "zoe-welcome-photo"
              : file;

          return {
            filename: file,
            displayName: customDisplayName || defaultDisplayName,
            url: `/assets/${file}`,
            lastModified: fs.statSync(path.join(assetsDir, file)).mtime,
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

      res.json({
        filename,
        displayName,
        message: "Asset display name updated successfully",
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update asset display name" });
    }
  });

  // Create new user (admin only)
  app.post("/api/admin/users", adminOperationLimiter, async (req, res) => {
    try {
      // Convert date strings to Date objects before validation
      const requestData = { ...req.body };
      if (requestData.validFrom && typeof requestData.validFrom === "string") {
        requestData.validFrom = new Date(requestData.validFrom);
      }
      if (
        requestData.validUntil &&
        typeof requestData.validUntil === "string"
      ) {
        requestData.validUntil = new Date(requestData.validUntil);
      }

      const userData = adminCreateUserSchema.parse(requestData);

      // Generate a strong password if none provided
      const plainPassword = req.body.password || generateStrongPassword(12);

      // Validate password strength if manually provided
      if (req.body.password) {
        try {
          passwordSchema.parse(plainPassword);
        } catch (error) {
          if (error instanceof z.ZodError) {
            return res.status(400).json({
              message: "Password does not meet security requirements",
              errors: error.errors,
            });
          }
        }
      }
      
      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // Set default validity dates if not provided
      const now = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(now.getFullYear() + 1);

      // Calculate WhatsApp support expiry date if applicable
      let whatsAppSupportExpiryDate: Date | null = null;
      if (userData.hasWhatsAppSupport && userData.whatsAppSupportDuration) {
        whatsAppSupportExpiryDate = new Date();
        whatsAppSupportExpiryDate.setMonth(whatsAppSupportExpiryDate.getMonth() + userData.whatsAppSupportDuration);
      }

      const newUser = await storage.createUser({
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isAdmin: userData.isAdmin || false,
        phone: userData.phone || null,
        profilePictureUrl: null,
        termsAccepted: false,
        termsAcceptedAt: null,
        validFrom: userData.validFrom || now,
        validUntil: userData.validUntil || oneYearFromNow,
        hasWhatsAppSupport: userData.hasWhatsAppSupport || false,
        whatsAppSupportDuration: userData.whatsAppSupportDuration || null,
        whatsAppSupportExpiryDate: whatsAppSupportExpiryDate,
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
        password: plainPassword, // Return plaintext password for admin to share with user
        message: "User created successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
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

  // Extend user validity
  app.post("/api/admin/users/:id/extend-validity", async (req, res) => {
    try {
      const { id } = req.params;
      const { months } = req.body;

      if (!months || typeof months !== 'number') {
        return res.status(400).json({ message: "Months must be a number" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentValidUntil = user.validUntil ? new Date(user.validUntil) : new Date();
      const newValidUntil = new Date(currentValidUntil);
      newValidUntil.setMonth(newValidUntil.getMonth() + months);

      const updatedUser = await storage.updateUser(id, { validUntil: newValidUntil });

      res.json({ 
        message: "Validity extended successfully",
        validUntil: updatedUser?.validUntil
      });
    } catch (error) {
      console.error("Extend validity error:", error);
      res.status(500).json({ message: "Failed to extend validity" });
    }
  });

  // Update user (admin)
  app.put("/api/admin/users/:id", adminOperationLimiter, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Convert all date fields to Date objects, remove null/undefined
      const dateFields = ['validFrom', 'validUntil', 'whatsAppSupportExpiryDate'];
      dateFields.forEach(field => {
        if (updateData[field] !== undefined && updateData[field] !== null) {
          if (typeof updateData[field] === "string") {
            updateData[field] = new Date(updateData[field]);
          } else if (typeof updateData[field] === "object" && updateData[field] !== null) {
            // If it's an object, try to extract date value or convert to Date
            if (updateData[field].$date) {
              updateData[field] = new Date(updateData[field].$date);
            } else {
              // Assume it's already a Date-like object, create new Date
              updateData[field] = new Date(updateData[field]);
            }
          }
          // Validate that we have a valid Date object
          if (isNaN(updateData[field].getTime())) {
            updateData[field] = null;
          }
        } else {
          // Remove undefined/null to prevent issues
          delete updateData[field];
        }
      });

      // Calculate WhatsApp support expiry date if duration is provided (and not already set)
      if (updateData.hasWhatsAppSupport && updateData.whatsAppSupportDuration && !updateData.whatsAppSupportExpiryDate) {
        const now = new Date();
        const expiryDate = new Date(now);
        expiryDate.setMonth(expiryDate.getMonth() + updateData.whatsAppSupportDuration);
        updateData.whatsAppSupportExpiryDate = expiryDate;
      } else if (!updateData.hasWhatsAppSupport) {
        // Clear WhatsApp support fields if disabled
        updateData.whatsAppSupportDuration = null;
        updateData.whatsAppSupportExpiryDate = null;
      }

      const updatedUser = await storage.updateUser(id, updateData);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        message: "User updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Deactivate user
  app.post("/api/admin/users/:id/deactivate", async (req, res) => {
    try {
      const { id } = req.params;

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Set validUntil to current date to immediately deactivate
      const updatedUser = await storage.updateUser(id, { 
        validUntil: new Date()
      });

      res.json({ 
        message: "User deactivated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Deactivate user error:", error);
      res.status(500).json({ message: "Failed to deactivate user" });
    }
  });

  // Reset user password
  app.post("/api/admin/users/:id/reset-password", passwordResetLimiter, async (req, res) => {
    try {
      const { id } = req.params;
      const { password: manualPassword } = req.body;

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Use manual password if provided, otherwise generate random password
      const plainPassword = manualPassword || generateStrongPassword(12);

      // Validate password strength if manually provided
      if (manualPassword) {
        try {
          passwordSchema.parse(plainPassword);
        } catch (error) {
          if (error instanceof z.ZodError) {
            return res.status(400).json({
              message: "Password does not meet security requirements",
              errors: error.errors,
            });
          }
        }
      }

      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      await storage.updateUser(id, { password: hashedPassword });

      res.json({ 
        message: "Password reset successfully",
        password: plainPassword // Return plaintext password for admin to share with user
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Progress Photos
  // Upload progress photo
  app.post("/api/progress-photos/:userId", upload.single('photo'), handleMulterError, async (req, res) => {
    try {
      const { userId } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: "No photo file provided" });
      }

      const { photoType, programId, notes } = req.body;

      const validatedData = insertProgressPhotoSchema.parse({
        userId,
        programId: programId || null,
        photoType,
        fileUrl: '',
        notes: notes || null,
      });
      
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'progress-photos',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) {
              console.error("[PHOTO UPLOAD ERROR]:", error.message);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(req.file!.buffer);
      });

      const cloudinaryResult: any = await uploadPromise;

      const progressPhoto = await storage.createProgressPhoto({
        ...validatedData,
        fileUrl: cloudinaryResult.secure_url,
        cloudinaryPublicId: cloudinaryResult.public_id,
        fileSize: cloudinaryResult.bytes,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
      });

      res.json(progressPhoto);
    } catch (error) {
      console.error("[PHOTO UPLOAD ERROR]:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to upload photo", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Get user's progress photos
  app.get("/api/progress-photos/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      const photos = await storage.getProgressPhotos(userId);
      res.json(photos);
    } catch (error) {
      console.error("Get photos error:", error);
      res.status(500).json({ message: "Failed to retrieve photos" });
    }
  });

  // Delete progress photo
  app.delete("/api/progress-photos/:userId/:id", async (req, res) => {
    try {
      const { userId, id } = req.params;

      // Get the photo to delete from Cloudinary
      const photos = await storage.getProgressPhotos(userId);
      const photo = photos.find((p) => p.id === id);

      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }

      // Delete from Cloudinary if public ID exists
      if (photo.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(photo.cloudinaryPublicId);
      }

      // Delete from database
      const deleted = await storage.deleteProgressPhoto(id);

      if (deleted) {
        res.json({ message: "Photo deleted successfully" });
      } else {
        res.status(404).json({ message: "Photo not found" });
      }
    } catch (error) {
      console.error("Delete photo error:", error);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
