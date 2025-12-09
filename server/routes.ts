import type { Express } from "express";
import { createServer, type Server } from "http";
import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
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
  insertUserCheckinSchema,
  insertDailyCheckinSchema,
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
import OpenAI from "openai";
import { getSpotifyClient, isSpotifyConnected, workoutPlaylists, getPlaylistDetails, getPlaybackState, controlPlayback } from "./spotify";

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

      // Always update last login timestamp and increment login count
      updates.lastLoginAt = new Date();
      updates.loginCount = (user.loginCount || 0) + 1;

      if (Object.keys(updates).length > 0) {
        updatedUser = (await storage.updateUser(user.id, updates)) || user;
      }

      // Log activity for admin dashboard
      try {
        await storage.createActivityLog(user.id, 'login', {
          method: 'password',
          email: user.email,
        });
      } catch (activityError) {
        console.error('Failed to log activity:', activityError);
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
      console.log(`[LOGIN] Session ID: ${req.sessionID}`);

      // Explicitly save session before sending response to avoid race condition
      req.session.save((err) => {
        if (err) {
          console.error(`[LOGIN] Session save error:`, err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        
        console.log(`[LOGIN] Session saved successfully for: ${updatedUser.email}, sessionId: ${req.sessionID}`);
        
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
            loginCount: updatedUser.loginCount,
            lastCheckinPromptAt: updatedUser.lastCheckinPromptAt,
          },
        });
      });
    } catch (error: any) {
      console.error(`[LOGIN] Error:`, error?.message || error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Check current session and return user if logged in
  app.get("/api/auth/session", async (req, res) => {
    try {
      console.log(`[SESSION] Check - sessionId: ${req.sessionID}, userId: ${req.session?.userId}, cookie: ${req.headers.cookie?.substring(0, 50)}...`);
      
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

  // Request password reset OTP
  app.post("/api/auth/forgot-password", passwordResetLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists - just say code sent
        return res.json({ message: "If an account exists, a code has been sent to your email" });
      }

      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Code expires in 10 minutes
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      
      // Store the code
      await storage.createPasswordResetCode(email, code, expiresAt);
      
      // Send email
      const { createPasswordResetEmail } = await import('./email/templates');
      const template = createPasswordResetEmail({
        firstName: user.firstName,
        code,
      });
      
      await emailService.send({
        to: { email: user.email, name: `${user.firstName} ${user.lastName}` },
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log(`[PASSWORD-RESET] OTP sent to: ${email}`);
      res.json({ message: "If an account exists, a code has been sent to your email" });
    } catch (error: any) {
      console.error(`[PASSWORD-RESET] Error:`, error?.message || error);
      res.status(500).json({ message: "Failed to send reset code" });
    }
  });

  // Verify OTP and optionally log in
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, code, loginNow } = req.body;
      
      if (!email || !code) {
        return res.status(400).json({ message: "Email and code are required" });
      }

      const resetCode = await storage.getValidPasswordResetCode(email, code);
      if (!resetCode) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }

      // Mark code as verified
      await storage.markPasswordResetCodeAsVerified(resetCode.id);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // If user wants to log in immediately
      if (loginNow) {
        // Update terms and disclaimer if not already accepted
        const updates: any = {};
        if (!user.termsAccepted) {
          updates.termsAccepted = true;
          updates.termsAcceptedAt = new Date();
        }
        if (!user.disclaimerAccepted) {
          updates.disclaimerAccepted = true;
          updates.disclaimerAcceptedAt = new Date();
        }
        updates.lastLoginAt = new Date();

        let updatedUser = user;
        if (Object.keys(updates).length > 0) {
          updatedUser = (await storage.updateUser(user.id, updates)) || user;
        }

        // Create session
        req.session.userId = updatedUser.id;

        // Delete the used code
        await storage.deletePasswordResetCodes(email);

        // Log activity for admin dashboard
        try {
          await storage.createActivityLog(updatedUser.id, 'login', {
            method: 'otp',
            email: updatedUser.email,
          });
        } catch (activityError) {
          console.error('Failed to log OTP login activity:', activityError);
        }

        console.log(`[PASSWORD-RESET] OTP login success for: ${email}`);
        
        // Explicitly save session before sending response to avoid race condition
        return req.session.save((err) => {
          if (err) {
            console.error(`[OTP-LOGIN] Session save error:`, err);
            return res.status(500).json({ message: "Failed to create session" });
          }
          
          res.json({
            verified: true,
            loggedIn: true,
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
        });
      }

      // Just verify without login (user wants to reset password)
      console.log(`[PASSWORD-RESET] OTP verified for password reset: ${email}`);
      res.json({ 
        verified: true, 
        loggedIn: false,
        message: "Code verified. You can now reset your password." 
      });
    } catch (error: any) {
      console.error(`[PASSWORD-RESET] Verify error:`, error?.message || error);
      res.status(500).json({ message: "Failed to verify code" });
    }
  });

  // Reset password (after OTP verification)
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;
      
      if (!email || !code || !newPassword) {
        return res.status(400).json({ message: "Email, code, and new password are required" });
      }

      // Validate password strength
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const resetCode = await storage.getValidPasswordResetCode(email, code);
      
      // Also allow using a verified code (already marked as verified in verify-otp step)
      if (!resetCode) {
        return res.status(400).json({ message: "Invalid or expired code. Please request a new code." });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Hash and update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password and terms/disclaimer
      const updates: any = {
        password: hashedPassword,
        lastLoginAt: new Date(),
      };
      if (!user.termsAccepted) {
        updates.termsAccepted = true;
        updates.termsAcceptedAt = new Date();
      }
      if (!user.disclaimerAccepted) {
        updates.disclaimerAccepted = true;
        updates.disclaimerAcceptedAt = new Date();
      }

      const updatedUser = await storage.updateUser(user.id, updates);
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update password" });
      }

      // Delete used codes
      await storage.deletePasswordResetCodes(email);

      // Create session to log them in
      req.session.userId = updatedUser.id;

      console.log(`[PASSWORD-RESET] Password reset and login success for: ${email}`);
      
      // Explicitly save session before sending response to avoid race condition
      req.session.save((err) => {
        if (err) {
          console.error(`[PASSWORD-RESET] Session save error:`, err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        
        res.json({
          success: true,
          message: "Password reset successfully",
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
      });
    } catch (error: any) {
      console.error(`[PASSWORD-RESET] Reset error:`, error?.message || error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // User Check-ins
  app.post("/api/checkins", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const checkinData = insertUserCheckinSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });

      const checkin = await storage.createUserCheckin(checkinData);

      // Update lastCheckinPromptAt for the user
      await storage.updateUser(req.session.userId, {
        lastCheckinPromptAt: new Date(),
      });

      res.status(201).json(checkin);
    } catch (error: any) {
      console.error(`[CHECKIN] Error creating check-in:`, error?.message || error);
      res.status(400).json({ message: error?.message || "Failed to create check-in" });
    }
  });

  app.get("/api/checkins", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const checkins = await storage.getUserCheckins(req.session.userId);
      res.json(checkins);
    } catch (error: any) {
      console.error(`[CHECKIN] Error fetching check-ins:`, error?.message || error);
      res.status(500).json({ message: "Failed to fetch check-ins" });
    }
  });

  app.get("/api/checkins/today", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const todayCheckin = await storage.getTodayCheckin(req.session.userId);
      res.json(todayCheckin);
    } catch (error: any) {
      console.error(`[CHECKIN] Error fetching today's check-in:`, error?.message || error);
      res.status(500).json({ message: "Failed to fetch today's check-in" });
    }
  });

  app.patch("/api/checkins/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;
      const checkin = await storage.updateUserCheckin(id, req.session.userId, req.body);
      
      if (!checkin) {
        return res.status(404).json({ message: "Check-in not found" });
      }

      if (!req.body.isPartial) {
        await storage.updateUser(req.session.userId, {
          lastCheckinPromptAt: new Date(),
        });
      }

      res.json(checkin);
    } catch (error: any) {
      console.error(`[CHECKIN] Error updating check-in:`, error?.message || error);
      res.status(400).json({ message: error?.message || "Failed to update check-in" });
    }
  });

  // Mark check-in prompt as dismissed (updates lastCheckinPromptAt without creating a check-in)
  app.post("/api/checkins/dismiss", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await storage.updateUser(req.session.userId, {
        lastCheckinPromptAt: new Date(),
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error(`[CHECKIN] Error dismissing check-in:`, error?.message || error);
      res.status(500).json({ message: "Failed to dismiss check-in" });
    }
  });

  // Daily Performance Check-ins (habits & wellness tracking)
  // Using userId in URL to avoid third-party cookie issues in iframes
  app.post("/api/daily-checkins/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if there's already a check-in for today
      const existingCheckin = await storage.getTodayDailyCheckin(userId);
      if (existingCheckin) {
        // Update existing check-in
        const updated = await storage.updateDailyCheckin(
          existingCheckin.id,
          userId,
          req.body
        );
        return res.json(updated);
      }

      // Create new check-in
      const checkinData = insertDailyCheckinSchema.parse({
        ...req.body,
        userId: userId,
        date: new Date(),
      });

      const checkin = await storage.createDailyCheckin(checkinData);
      
      // Log activity for admin visibility
      await storage.createActivityLog(userId, 'daily_checkin', {
        workoutCompleted: req.body.workoutCompleted,
        breathingPractice: req.body.breathingPractice,
        waterGlasses: req.body.waterGlasses,
        cardioMinutes: req.body.cardioMinutes,
        checkinTime: new Date().toISOString(),
      });
      
      res.status(201).json(checkin);
    } catch (error: any) {
      console.error(`[DAILY-CHECKIN] Error creating check-in:`, error?.message || error);
      res.status(400).json({ message: error?.message || "Failed to create daily check-in" });
    }
  });

  app.get("/api/daily-checkins/:userId/today", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const todayCheckin = await storage.getTodayDailyCheckin(userId);
      res.json(todayCheckin || null);
    } catch (error: any) {
      console.error(`[DAILY-CHECKIN] Error fetching today's check-in:`, error?.message || error);
      res.status(500).json({ message: "Failed to fetch today's check-in" });
    }
  });

  app.get("/api/daily-checkins/:userId/week", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get the start of the current week (Monday)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Sunday
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - diff);
      weekStart.setHours(0, 0, 0, 0);

      const weekCheckins = await storage.getWeeklyDailyCheckins(userId, weekStart);
      res.json(weekCheckins);
    } catch (error: any) {
      console.error(`[DAILY-CHECKIN] Error fetching week's check-ins:`, error?.message || error);
      res.status(500).json({ message: "Failed to fetch weekly check-ins" });
    }
  });

  app.get("/api/daily-checkins/:userId/stats", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const days = parseInt(req.query.days as string) || 30;
      const stats = await storage.getDailyCheckinStats(userId, days);
      res.json(stats);
    } catch (error: any) {
      console.error(`[DAILY-CHECKIN] Error fetching stats:`, error?.message || error);
      res.status(500).json({ message: "Failed to fetch check-in stats" });
    }
  });

  app.patch("/api/daily-checkins/:userId/:id", async (req, res) => {
    try {
      const { userId, id } = req.params;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const checkin = await storage.updateDailyCheckin(id, userId, req.body);

      if (!checkin) {
        return res.status(404).json({ message: "Check-in not found" });
      }

      res.json(checkin);
    } catch (error: any) {
      console.error(`[DAILY-CHECKIN] Error updating check-in:`, error?.message || error);
      res.status(400).json({ message: error?.message || "Failed to update daily check-in" });
    }
  });

  // Weekly summary with WhatsApp share data
  app.get("/api/daily-checkins/:userId/weekly-summary", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get the start of the current week (Monday)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - diff);
      weekStart.setHours(0, 0, 0, 0);

      const weekCheckins = await storage.getWeeklyDailyCheckins(userId, weekStart);
      const stats = await storage.getDailyCheckinStats(userId, 7);
      
      // Get user info for personalized message
      const user = await storage.getUser(userId);

      // Calculate week number in program (if enrolled)
      const memberPrograms = await storage.getMemberPrograms(userId);
      const activeProgram = memberPrograms.find(mp => mp.isActive);
      let programWeek = 1;
      if (activeProgram) {
        const daysSinceStart = Math.floor(
          (Date.now() - new Date(activeProgram.purchaseDate || Date.now()).getTime()) / (1000 * 60 * 60 * 24)
        );
        programWeek = Math.min(Math.floor(daysSinceStart / 7) + 1, 6);
      }

      // Generate WhatsApp share message
      const shareMessage = `*Week ${programWeek} Progress!* 💪\n\n` +
        `✅ Workouts: ${stats.workoutDays}/7 days\n` +
        `🧘 Breathing: ${stats.breathingDays}/7 days\n` +
        `💧 Avg Water: ${stats.avgWaterGlasses} glasses/day\n` +
        `🏃 Avg Cardio: ${stats.avgCardioMinutes} min/day\n` +
        `🔥 Current Streak: ${stats.currentStreak} days\n\n` +
        `#PostpartumStrength #HealYourCore`;

      res.json({
        weekStart: weekStart.toISOString(),
        checkins: weekCheckins,
        stats,
        programWeek,
        shareMessage,
        whatsappUrl: `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
      });
    } catch (error: any) {
      console.error(`[DAILY-CHECKIN] Error fetching weekly summary:`, error?.message || error);
      res.status(500).json({ message: "Failed to fetch weekly summary" });
    }
  });

  // ===========================================
  // WORKOUT SESSIONS (Progressive Tracking)
  // ===========================================

  // Get workout progress (current week, completions, all weeks progress)
  // Using userId in URL to avoid third-party cookie issues in iframes
  app.get("/api/workout-sessions/:userId/progress", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const progress = await storage.getWorkoutSessionProgress(userId);
      res.json(progress);
    } catch (error: any) {
      console.error(`[WORKOUT-SESSIONS] Error fetching progress:`, error?.message || error);
      res.status(500).json({ message: "Failed to fetch workout progress" });
    }
  });

  // Log a workout session
  app.post("/api/workout-sessions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { week, sessionType, sessionNumber, rating, notes } = req.body;

      // Validate input
      if (!week || !sessionType || !sessionNumber) {
        return res.status(400).json({ message: "Week, session type, and session number are required" });
      }

      if (!['workout', 'cardio'].includes(sessionType)) {
        return res.status(400).json({ message: "Session type must be 'workout' or 'cardio'" });
      }

      if (sessionType === 'workout' && (sessionNumber < 1 || sessionNumber > 4)) {
        return res.status(400).json({ message: "Workout session number must be between 1 and 4" });
      }

      if (sessionType === 'cardio' && (sessionNumber < 1 || sessionNumber > 2)) {
        return res.status(400).json({ message: "Cardio session number must be between 1 and 2" });
      }

      const session = await storage.createWorkoutSession({
        userId: userId,
        week,
        sessionType,
        sessionNumber,
        rating: rating || null,
        notes: notes || null,
      });

      res.json(session);
    } catch (error: any) {
      console.error(`[WORKOUT-SESSIONS] Error logging session:`, error?.message || error);
      res.status(500).json({ message: "Failed to log workout session" });
    }
  });

  // Get sessions for a specific week
  app.get("/api/workout-sessions/week/:week", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const week = parseInt(req.params.week);
      if (isNaN(week) || week < 1 || week > 6) {
        return res.status(400).json({ message: "Week must be between 1 and 6" });
      }

      const sessions = await storage.getWeeklyWorkoutSessions(req.session.userId, week);
      res.json(sessions);
    } catch (error: any) {
      console.error(`[WORKOUT-SESSIONS] Error fetching week sessions:`, error?.message || error);
      res.status(500).json({ message: "Failed to fetch week sessions" });
    }
  });

  // Skip a week (mark as skipped and advance)
  app.post("/api/workout-sessions/skip-week", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { week } = req.body;
      if (!week || week < 1 || week > 6) {
        return res.status(400).json({ message: "Week must be between 1 and 6" });
      }

      // Get current progress for the week being skipped
      const progress = await storage.getWorkoutSessionProgress(req.session.userId);
      const weekProgress = progress.weeklyProgress.find(w => w.week === week);
      const workoutsCompleted = weekProgress?.workoutsCompleted || 0;

      // Create skipped week record
      const skippedWeek = await storage.createSkippedWeek(
        req.session.userId,
        week,
        workoutsCompleted
      );

      // Return updated progress
      const updatedProgress = await storage.getWorkoutSessionProgress(req.session.userId);
      res.json({ skippedWeek, progress: updatedProgress });
    } catch (error: any) {
      console.error(`[WORKOUT-SESSIONS] Error skipping week:`, error?.message || error);
      res.status(500).json({ message: "Failed to skip week" });
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

      if (!userId) {
        console.error("[accept-disclaimer] Missing userId in request body");
        return res.status(400).json({ message: "User ID is required" });
      }

      console.log(`[accept-disclaimer] Processing for userId: ${userId}`);

      const updatedUser = await storage.updateUser(userId, {
        disclaimerAccepted: true,
        disclaimerAcceptedAt: new Date(),
      });

      if (!updatedUser) {
        console.error(`[accept-disclaimer] User not found: ${userId}`);
        return res.status(404).json({ message: "User not found" });
      }

      console.log(`[accept-disclaimer] Successfully updated for userId: ${userId}`);
      res.json({ success: true });
    } catch (error) {
      console.error("[accept-disclaimer] Error:", error);
      res.status(500).json({ message: "Failed to accept disclaimer", error: error instanceof Error ? error.message : "Unknown error" });
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

  // Get user's course enrollments (for logged-in user)
  app.get("/api/my-course-enrollments", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;

      const enrollments = await storage.db.execute(sql`
        SELECT 
          ce.id,
          ce.user_id,
          ce.course_id,
          ce.enrolled_at,
          ce.expires_at,
          ce.status,
          ce.progress_percentage,
          ce.completed_at,
          c.name as course_name,
          c.description as course_description,
          c.image_url as course_image_url,
          c.duration_weeks as course_weeks,
          c.level as course_difficulty,
          c.status as course_status
        FROM course_enrollments ce
        JOIN courses c ON ce.course_id = c.id
        WHERE ce.user_id = ${userId}
        AND c.status = 'published'
        ORDER BY ce.enrolled_at DESC
      `);

      res.json(enrollments.rows);
    } catch (error) {
      console.error("Error fetching user course enrollments:", error);
      res.status(500).json({ message: "Failed to fetch course enrollments" });
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

      // Log activity for admin dashboard
      try {
        // Get workout details for the activity log
        const workout = await storage.getWorkout(completionData.workoutId);
        await storage.createActivityLog(completionData.userId, 'workout_complete', {
          workoutId: completionData.workoutId,
          workoutName: workout?.name || 'Unknown Workout',
          day: workout?.day,
          challengeRating: completionData.challengeRating,
          mood: completionData.mood,
        });
      } catch (activityError) {
        console.error('Failed to log workout completion activity:', activityError);
      }

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

  // Get user's workout progress for Today's Workout feature
  app.get("/api/workout-progress/:userId", async (req, res) => {
    // Prevent HTTP caching to ensure fresh data after workout completion
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    try {
      const { userId } = req.params;
      
      // Get user's workout completions
      const completions = await storage.getWorkoutCompletions(userId);
      const completedWorkoutIds = completions.map(c => c.workoutId);
      const totalWorkoutsCompleted = completions.length;
      
      // Get last completion date
      const lastCompletion = completions.sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA;
      })[0];
      
      // Check if workout was completed today (timezone-safe comparison using date strings)
      const todayDateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD in UTC
      const lastCompletionDateStr = lastCompletion?.completedAt 
        ? new Date(lastCompletion.completedAt).toISOString().split('T')[0] 
        : null;
      const workoutCompletedToday = lastCompletionDateStr === todayDateStr;
      
      // Calculate current week based on completions
      // Each week has different workout counts: Week 1: 4, Weeks 2-6: 3 each
      const weeklyWorkouts = [4, 3, 3, 3, 3, 3]; // workouts per week
      const totalProgramWorkouts = weeklyWorkouts.reduce((a, b) => a + b, 0); // 22 total
      
      let completedCount = 0;
      let currentWeek = 1;
      let weeklyCompleted = 0;
      
      for (let week = 1; week <= 6; week++) {
        const weekWorkouts = weeklyWorkouts[week - 1];
        const weekCompletions = completedWorkoutIds.filter(id => id.startsWith(`week${week}-`)).length;
        
        if (weekCompletions >= weekWorkouts && week < 6) {
          completedCount += weekCompletions;
          currentWeek = week + 1;
          weeklyCompleted = 0;
        } else {
          currentWeek = week;
          weeklyCompleted = weekCompletions;
          break;
        }
      }
      
      // Calculate current day within the week
      const currentDay = Math.min(weeklyCompleted + 1, weeklyWorkouts[currentWeek - 1]);
      
      // Calculate overall progress percentage
      const overallProgress = (totalWorkoutsCompleted / totalProgramWorkouts) * 100;
      
      res.json({
        currentWeek,
        currentDay,
        totalWorkoutsCompleted,
        weeklyWorkoutsCompleted: weeklyCompleted,
        weeklyWorkoutsTotal: weeklyWorkouts[currentWeek - 1],
        overallProgress: Math.min(overallProgress, 100),
        lastCompletedAt: lastCompletion?.completedAt || null,
        completedWorkoutIds,
        workoutCompletedToday
      });
    } catch (error) {
      console.error("Failed to fetch workout progress:", error);
      res.status(500).json({ message: "Failed to fetch workout progress" });
    }
  });

  // Ask Zoe AI Chat endpoint with comprehensive context
  app.post("/api/ask-zoe", async (req, res) => {
    try {
      const { message, context, userId } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      const openai = new OpenAI({
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      });

      // Fetch user profile if userId provided
      let userProfile = null;
      let workoutHistory: any[] = [];
      
      if (userId) {
        try {
          userProfile = await storage.getUser(userId);
          workoutHistory = await storage.getWorkoutCompletions(userId);
        } catch (e) {
          console.log("Could not fetch user data for Zoe context");
        }
      }

      // Build user context section
      const userContextSection = userProfile ? `
USER PROFILE:
- Name: ${userProfile.firstName || 'Mama'}
- Postpartum weeks: ${userProfile.postpartumWeeks || 'Unknown'}
- Country: ${userProfile.country || 'Unknown'}
- Bio: ${userProfile.bio || 'Not provided'}
` : '';

      // Build workout history section
      const historySection = workoutHistory.length > 0 ? `
WORKOUT HISTORY (${workoutHistory.length} total completions):
${workoutHistory.slice(-10).map(w => `- ${w.workoutId}: completed ${w.completedAt ? new Date(w.completedAt).toLocaleDateString() : 'unknown date'}${w.rating ? ` (rated ${w.rating}/5)` : ''}`).join('\n')}
` : 'WORKOUT HISTORY: No workouts completed yet (just starting!)';

      // Full 6-week program content for comprehensive context
      const programContent = `
COMPLETE 6-WEEK PROGRAM CONTENT:

WEEK 1 - RECONNECT & RESET (Foundation Building)
Schedule: 4x per week (Days 1, 3, 5, 7)
Equipment: Mini band, Small Pilates ball, Mat
Coach Note: This is your foundation. Focus on breath, posture, and gentle reconnection with your core and pelvic floor.
Part 1: 360° Breathing - 25 breaths morning + evening
Part 2 Exercises:
1. KNEELING MINI BAND PULL APARTS (12 reps) - Video: https://www.youtube.com/watch?v=jiz7-6nJvjY
2. QUADRUPED BALL COMPRESSIONS (10 reps) - Video: https://www.youtube.com/watch?v=1QukYQSq0oQ
3. SUPINE HEEL SLIDES (10 reps) - Video: https://www.youtube.com/watch?v=AIEdkm2q-4k
4. GLUTE BRIDGES WITH MINI BALL (15 reps) - Video: https://www.youtube.com/watch?v=1vqv8CqCjY0
5. BUTTERFLY STRETCH — DYNAMIC FLUTTER (1 min) - Video: https://www.youtube.com/watch?v=j5ZGvn1EUTo

WEEK 2 - STABILITY & BREATHWORK (Building Rhythm)
Schedule: 3x per week (Days 1, 3, 5)
Equipment: Mat, Your breath, Patience
Coach Note: Now that you've laid the foundation, we begin layering in simple movements with control.
Part 1: 3 Part Core & Breath Reset Flow - 10 breaths each - Video: https://www.youtube.com/watch?v=SrEKb2TMLzA
Part 2 Exercises:
1. SUPINE ALT LEG MARCHES (10 reps) - Video: https://www.youtube.com/watch?v=T8HHp4KXpJI
2. SUPINE CROSS LATERAL KNEE PRESSES (10 reps) - Video: https://www.youtube.com/watch?v=AyVuVB0oneo
3. DEADBUG LEG MARCH ARM EXTENSIONS (10 reps) - Video: https://www.youtube.com/watch?v=iKrou6hSgmg
4. ELBOW KNEE SIDE PLANK LIFTS (10 reps) - Video: https://www.youtube.com/watch?v=zaOToxvSk6g
5. WISHBONE STRETCH (30 secs each side) - Video: https://www.youtube.com/watch?v=Pd2le_I4bFE

WEEK 3 - CONTROL & AWARENESS (Strengthening Base)
Schedule: 3x per week (Days 2, 4, 6)
Equipment: Resistance band (light), Mat, Optional yoga block
Coach Note: Let's strengthen your base. You'll challenge your balance, posture, and deep core awareness.
Part 1: SUPINE DIAPHRAGMATIC BREATHING (25 breaths) - Video: https://youtu.be/lBhO64vd8aE
       SIDE LYING DIAPHRAGMATIC BREATHING (10 breaths each side) - Video: https://www.youtube.com/watch?v=tCzxxPxxtjw
Part 2 Exercises:
1. BAND LAT-PULL W/ 5 KNEE LIFT (10 reps) - Video: https://www.youtube.com/watch?v=-NBcN5pZcH8
2. BAND LAT-PULL W/ KNEE ADDUCTION/ABDUCTION (10 reps) - Video: https://www.youtube.com/watch?v=Jij6Wc9CQns
3. BRIDGE W/ BAND LAT-PULL (10 reps) - Video: https://www.youtube.com/watch?v=dv1TVJySjBs
4. BAND LAT-PULL PILATES PULSES (20 reps) - Video: https://www.youtube.com/watch?v=Tz0Iy90Hx9M
5. WISHBONE STRETCH (30 secs each side) - Video: https://www.youtube.com/watch?v=Pd2le_I4bFE
6. HAPPY BABY POSE (1 min) - Video: https://www.youtube.com/watch?v=r6NsBwtPSrw

WEEK 4 - ALIGN & ACTIVATE (Building Challenge)
Schedule: 3x per week (Days 1, 3, 5)
Equipment: Small Pilates ball, Chair or stool, Resistance band, Mat
Coach Note: You're ready for more challenge. These exercises ask more of your body while maintaining connection.
Part 1: 90 90 BOX BREATHING (25 breaths) - Video: https://www.youtube.com/watch?v=ehaUhSSY1xY
Part 2 Exercises:
1. LEGS ELEVATED GLUTE BRIDGE WITH BALL SQUEEZE (10 reps) - Video: https://www.youtube.com/watch?v=MMH2DLbL0ug
2. SUPINE KNEE DROPS WITH PILATES BAND (10 reps each side) - Video: https://www.youtube.com/watch?v=EE8iKKo9LEk
3. ALL FOURS PILATES BALL KNEE PRESS AND LEG LIFT (10 reps each side) - Video: https://www.youtube.com/watch?v=rRWeQqIYzUM
4. BEAR CRAWL LIFTS WITH BALL SQUEEZE (20 reps) - Video: https://www.youtube.com/watch?v=Y0xmJ3IuOCU
5. WISHBONE STRETCH (30 secs each side) - Video: https://www.youtube.com/watch?v=Pd2le_I4bFE
6. BUTTERFLY STRETCH — DYNAMIC FLUTTER (1 min) - Video: https://www.youtube.com/watch?v=j5ZGvn1EUTo

WEEK 5 - FUNCTIONAL CORE FLOW (Real-Life Movement)
Schedule: 3x per week (Days 2, 4, 6)
Equipment: Mini bands, Mat, Yoga block or Pilates ball, Long resistance band, Stool or chair
Coach Note: This phase bridges your core work with real-life movement (lifting baby, carrying groceries). It's functional, safe, and empowering.
Part 1: Continue with your preferred breathing practice from previous weeks (25 breaths)
Part 2 Exercises:
1. KNEELING PALLOF RAISES (10 reps) - Video: https://www.youtube.com/watch?v=dBZyeMwNdxQ
2. SIDE LYING BAND CLAMSHELLS (10 reps) - Video: https://www.youtube.com/watch?v=8Cu-kVG4TZQ
3. SEATED LEAN BACKS WITH PILATES BALL SQUEEZE (10 reps) - Video: https://www.youtube.com/watch?v=OrH6nMjA0Ho
4. SINGLE LEG GLUTE BRIDGES (20 reps) - Video: https://www.youtube.com/watch?v=ly2GQ8Hlv6E
5. COPENHAGEN PLANK HOLD (20 secs each side) - Video: https://www.youtube.com/watch?v=n1YIgAvnNaA
6. BUTTERFLY STRETCH — DYNAMIC FLUTTER (1 min) - Video: https://www.youtube.com/watch?v=j5ZGvn1EUTo

WEEK 6 - FOUNDATIONAL STRENGTH (Graduation Program)
Schedule: 4x per week (Days 1, 3, 5, 7)
Equipment: Swiss ball, Small Pilates ball, Mat
Coach Note: This is your graduation program. You've built the foundation—now we challenge it with stability ball work.
Part 1: Continue with your preferred breathing practice (25 breaths)
Part 2 Exercises:
1. SWISS BALL HAMSTRING CURLS (20 reps) - Video: https://www.youtube.com/watch?v=dxpSn0HLB6M
2. SWISS BALL HIP LIFTS TO PIKE (10 reps) - Video: https://www.youtube.com/watch?v=GP5tON5kEDc
3. SWISS BALL DEADBUGS (20 reps) - Video: https://www.youtube.com/watch?v=PietQSYU2as
4. SUPINE SWISS BALL HOLD WITH LEG TWISTS (20 reps) - Video: https://www.youtube.com/watch?v=GcVoMJGAV3o
5. WISHBONE STRETCH (30 secs each side) - Video: https://www.youtube.com/watch?v=Pd2le_I4bFE
6. KNEELING HIP FLEXOR STRETCH (1 min each side) - Video: https://www.youtube.com/watch?v=GG3rtAKd6hY
`;

      const systemPrompt = `You are Zoe, a warm, supportive, and knowledgeable postpartum fitness coach. You specialize in helping new mothers recover their core strength safely and effectively through a 6-week core rehabilitation program called "Heal Your Core."

Your personality:
- Warm, encouraging, and empathetic
- Understanding of the challenges new mothers face (sleep deprivation, time constraints, body changes)
- Expert in postpartum recovery, diastasis recti, and pelvic floor health
- Never judgmental, always supportive
- Use casual, friendly language with occasional encouragement like "You've got this, mama!"

${userContextSection}

CURRENT PROGRESS:
- Week ${context?.currentWeek || 1} of the 6-week program
- Day ${context?.currentDay || 1} of this week
- Total workouts completed: ${context?.workoutsCompleted || 0}
- Current program: ${context?.currentProgram || "Foundation Building"}
- Today's exercises: ${context?.exercises || "Core reconnection exercises"}

${historySection}

${programContent}

KEY COACHING KNOWLEDGE:
- This is a CORE REHABILITATION program, NOT cardio - focus on core reconnection, breathing, pelvic floor, and glute activation
- Week 1 has 4 workouts/week for foundation building; Weeks 2-5 have 3 workouts/week; Week 6 returns to 4/week as graduation
- 360° breathing is foundational - encourage this daily practice
- Diastasis recti (ab separation) heals with gentle reconnection, not crunches or planks initially
- Glute bridges activate the posterior chain safely and support pelvic floor recovery
- Dead bugs teach core stability while protecting the spine
- Always encourage watching the video tutorials for proper form

RESPONSE GUIDELINES:
1. Keep responses concise (2-4 sentences) unless asked for detail
2. If they mention tiredness, stress, or overwhelm - validate their feelings and suggest gentler exercises or rest
3. When asked about specific exercises, reference the program content above and provide video links
4. If asked to swap workouts, suggest alternatives from the current week or gentler Week 1 options
5. Celebrate their progress and remind them that consistency matters more than perfection
6. For any medical concerns, always recommend consulting their healthcare provider
7. Mention the video URL when discussing exercise form
8. Use their name (${userProfile?.firstName || 'mama'}) occasionally to personalize responses`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const reply = response.choices[0]?.message?.content || "I'm here to help! What would you like to know about your workout today?";
      
      // Detect suggested actions based on conversation context
      const suggestedActions: Array<{ type: string; label: string; description: string }> = [];
      const lowerMessage = message.toLowerCase();
      const lowerReply = reply.toLowerCase();
      
      // If user mentions tiredness/fatigue and Zoe suggests gentler options
      if ((lowerMessage.includes('tired') || lowerMessage.includes('exhausted') || lowerMessage.includes('fatigue') || lowerMessage.includes('rough day')) 
          && (lowerReply.includes('week 1') || lowerReply.includes('gentler') || lowerReply.includes('lighter'))) {
        suggestedActions.push({
          type: 'swap_workout',
          label: 'Switch to Week 1',
          description: 'Do a gentler workout today'
        });
      }
      
      // If discussing food/nutrition/eating
      if (lowerMessage.includes('eat') || lowerMessage.includes('food') || lowerMessage.includes('meal') || lowerMessage.includes('nutrition') || lowerMessage.includes('hungry')) {
        suggestedActions.push({
          type: 'meal_suggestion',
          label: 'Get Meal Ideas',
          description: 'Ask Zoe for healthy meal suggestions'
        });
      }
      
      // If user wants to understand the full week/program
      if (lowerMessage.includes('week') || lowerMessage.includes('plan') || lowerMessage.includes('schedule') || lowerMessage.includes('upcoming')) {
        suggestedActions.push({
          type: 'view_program',
          label: 'View Full Program',
          description: 'See all 6 weeks of your program'
        });
      }
      
      // If discussing specific exercise form
      if (lowerMessage.includes('how do i') || lowerMessage.includes('form') || lowerMessage.includes('technique') || lowerMessage.includes('correctly')) {
        suggestedActions.push({
          type: 'watch_video',
          label: 'Watch Tutorial',
          description: 'See the video demonstration'
        });
      }
      
      res.json({ reply, suggestedActions });
    } catch (error) {
      console.error("Ask Zoe error:", error);
      res.status(500).json({ message: "Failed to get response from Zoe" });
    }
  });

  // Workout Program Content API (database-driven workout data)
  app.get("/api/workout-content", async (req, res) => {
    try {
      const programs = await storage.getFullWorkoutPrograms();
      res.json(programs);
    } catch (error) {
      console.error("Failed to fetch workout content:", error);
      res.status(500).json({ message: "Failed to fetch workout content" });
    }
  });

  app.get("/api/workout-content/:week", async (req, res) => {
    try {
      const week = parseInt(req.params.week, 10);
      if (isNaN(week) || week < 1 || week > 6) {
        return res.status(400).json({ message: "Invalid week number" });
      }
      
      const program = await storage.getWorkoutProgramContentByWeek(week);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      
      const exercises = await storage.getWorkoutContentExercises(program.id);
      res.json({ ...program, exercises });
    } catch (error) {
      console.error("Failed to fetch workout content for week:", error);
      res.status(500).json({ message: "Failed to fetch workout content" });
    }
  });

  // Educational Content API (database-driven educational topics)
  app.get("/api/educational-content", async (req, res) => {
    try {
      const topics = await storage.getEducationalTopics();
      res.json(topics);
    } catch (error) {
      console.error("Failed to fetch educational content:", error);
      res.status(500).json({ message: "Failed to fetch educational content" });
    }
  });

  app.get("/api/educational-content/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const topic = await storage.getEducationalTopicBySlug(slug);
      
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      res.json(topic);
    } catch (error) {
      console.error("Failed to fetch educational topic:", error);
      res.status(500).json({ message: "Failed to fetch educational topic" });
    }
  });

  // Admin endpoints for workout content management
  app.patch("/api/admin/workout-content/:id", adminOperationLimiter, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden - Admin access required" });
      }
      
      const { id } = req.params;
      const updates = req.body;
      const updated = await storage.updateWorkoutProgramContent(id, updates);
      
      if (!updated) {
        return res.status(404).json({ message: "Program content not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Failed to update workout content:", error);
      res.status(500).json({ message: "Failed to update workout content" });
    }
  });

  app.patch("/api/admin/workout-exercises/:id", adminOperationLimiter, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden - Admin access required" });
      }
      
      const { id } = req.params;
      const updates = req.body;
      const updated = await storage.updateWorkoutContentExercise(id, updates);
      
      if (!updated) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Failed to update exercise:", error);
      res.status(500).json({ message: "Failed to update exercise" });
    }
  });

  app.post("/api/admin/workout-exercises", adminOperationLimiter, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden - Admin access required" });
      }
      
      const exercise = await storage.createWorkoutContentExercise(req.body);
      res.json(exercise);
    } catch (error) {
      console.error("Failed to create exercise:", error);
      res.status(500).json({ message: "Failed to create exercise" });
    }
  });

  app.delete("/api/admin/workout-exercises/:id", adminOperationLimiter, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden - Admin access required" });
      }
      
      const { id } = req.params;
      const deleted = await storage.deleteWorkoutContentExercise(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete exercise:", error);
      res.status(500).json({ message: "Failed to delete exercise" });
    }
  });

  app.post("/api/admin/workout-exercises/reorder", adminOperationLimiter, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden - Admin access required" });
      }
      
      const { programContentId, sectionType, exerciseIds } = req.body;
      
      if (!programContentId || !sectionType || !Array.isArray(exerciseIds)) {
        return res.status(400).json({ message: "Invalid reorder request" });
      }
      
      await storage.reorderWorkoutContentExercises(programContentId, sectionType, exerciseIds);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to reorder exercises:", error);
      res.status(500).json({ message: "Failed to reorder exercises" });
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

  // Recent activity logs for admin dashboard
  app.get("/api/admin/activity-logs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const activities = await storage.getRecentActivityLogs(limit);
      res.json(activities);
    } catch (error) {
      console.error("Activity logs error:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  // Checkin analytics for admin dashboard - aggregated mood & energy insights
  app.get("/api/admin/checkin-analytics", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      
      // Get all daily checkins from all users
      const users = await storage.getAllUsers();
      
      // Aggregate mood data
      const moodCounts: Record<string, number> = {};
      const moodEmojis: Record<string, string> = {
        great: '😊', good: '🙂', okay: '😐', tired: '😴', struggling: '😔'
      };
      let totalEnergy = 0;
      let energyCount = 0;
      const energyByDay: { date: string; avgEnergy: number; checkins: number }[] = [];
      const dailyData: Record<string, { totalEnergy: number; count: number }> = {};
      
      // Gather all user stats
      for (const user of users) {
        const stats = await storage.getDailyCheckinStats(user.id, days);
        
        // Aggregate mood distribution
        for (const moodItem of stats.moodDistribution) {
          moodCounts[moodItem.mood] = (moodCounts[moodItem.mood] || 0) + moodItem.count;
        }
        
        // Aggregate energy
        if (stats.avgEnergyLevel > 0) {
          totalEnergy += stats.avgEnergyLevel;
          energyCount++;
        }
        
        // Get recent moods for daily trends
        for (const m of stats.recentMoods) {
          if (m.energyLevel) {
            const dateKey = m.date.split('T')[0];
            if (!dailyData[dateKey]) {
              dailyData[dateKey] = { totalEnergy: 0, count: 0 };
            }
            dailyData[dateKey].totalEnergy += m.energyLevel;
            dailyData[dateKey].count++;
          }
        }
      }
      
      // Convert daily data to array
      const energyTrend = Object.entries(dailyData)
        .map(([date, data]) => ({
          date,
          avgEnergy: Math.round((data.totalEnergy / data.count) * 10) / 10,
          checkins: data.count,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      // Convert mood counts to array
      const moodDistribution = Object.entries(moodCounts)
        .map(([mood, count]) => ({
          mood,
          count,
          emoji: moodEmojis[mood] || '🙂',
        }))
        .sort((a, b) => b.count - a.count);
      
      const avgEnergyLevel = energyCount > 0 ? Math.round((totalEnergy / energyCount) * 10) / 10 : 0;
      
      res.json({
        totalUsers: users.length,
        moodDistribution,
        avgEnergyLevel,
        energyTrend,
        days,
      });
    } catch (error) {
      console.error("Checkin analytics error:", error);
      res.status(500).json({ message: "Failed to fetch checkin analytics" });
    }
  });

  // Detailed member profile data for admin
  app.get("/api/admin/member-profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Fetch all profile data in parallel
      const [
        user,
        activityLogs,
        checkins,
        progressPhotos,
        emailHistory,
        workoutCompletions,
        memberPrograms,
        communityPosts
      ] = await Promise.all([
        storage.getUser(userId),
        storage.getActivityLogsForUser(userId),
        storage.getUserCheckins(userId),
        storage.getUserProgressPhotosAdmin(userId),
        storage.getUserEmailHistory(userId),
        storage.getWorkoutCompletions(userId),
        storage.getMemberPrograms(userId),
        storage.getCommunityPosts({ userId })
      ]);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        user,
        activityLogs,
        checkins,
        progressPhotos,
        emailHistory,
        workoutCompletions,
        memberPrograms,
        communityPosts
      });
    } catch (error) {
      console.error("Member profile error:", error);
      res.status(500).json({ message: "Failed to fetch member profile" });
    }
  });

  // Actionable dashboard data endpoints
  app.get("/api/admin/actionable/dormant-members", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const dormantMembers = await storage.getDormantMembers(days);
      res.json(dormantMembers);
    } catch (error) {
      console.error("Dormant members error:", error);
      res.status(500).json({ message: "Failed to fetch dormant members" });
    }
  });

  app.get("/api/admin/actionable/no-photos", async (req, res) => {
    try {
      const membersWithoutPhotos = await storage.getMembersWithoutProgressPhotos();
      res.json(membersWithoutPhotos);
    } catch (error) {
      console.error("Members without photos error:", error);
      res.status(500).json({ message: "Failed to fetch members without photos" });
    }
  });

  app.get("/api/admin/actionable/recent-completers", async (req, res) => {
    try {
      const hours = parseInt(req.query.hours as string) || 48;
      const recentCompleters = await storage.getRecentWorkoutCompleters(hours);
      res.json(recentCompleters);
    } catch (error) {
      console.error("Recent completers error:", error);
      res.status(500).json({ message: "Failed to fetch recent completers" });
    }
  });

  // Recent check-ins endpoint for admin dashboard
  app.get("/api/admin/actionable/recent-checkins", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const recentCheckins = await storage.getRecentCheckins(limit);
      res.json(recentCheckins);
    } catch (error) {
      console.error("Recent check-ins error:", error);
      res.status(500).json({ message: "Failed to fetch recent check-ins" });
    }
  });

  // Enhanced check-in analytics with day/week breakdown
  app.get("/api/admin/actionable/checkin-analytics", async (req, res) => {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - 7);

      // Get all check-ins for processing
      const allCheckins = await storage.getCheckinAnalytics();
      
      // Get today's check-ins
      const todayCheckins = await storage.getRecentCheckins(100);
      const todayData = todayCheckins.filter(c => c.createdAt && new Date(c.createdAt) >= todayStart);
      
      // Get this week's check-ins
      const weekData = todayCheckins.filter(c => c.createdAt && new Date(c.createdAt) >= weekStart);

      // Process mood distribution for today
      const todayMoodCounts: Record<string, number> = {};
      for (const c of todayData) {
        if (c.mood) {
          todayMoodCounts[c.mood] = (todayMoodCounts[c.mood] || 0) + 1;
        }
      }

      // Process mood distribution for this week
      const weekMoodCounts: Record<string, number> = {};
      for (const c of weekData) {
        if (c.mood) {
          weekMoodCounts[c.mood] = (weekMoodCounts[c.mood] || 0) + 1;
        }
      }

      // Process energy distribution for today
      const todayEnergyCounts: Record<number, number> = {};
      for (const c of todayData) {
        if (c.energyLevel !== null) {
          todayEnergyCounts[c.energyLevel] = (todayEnergyCounts[c.energyLevel] || 0) + 1;
        }
      }

      // Process energy distribution for this week
      const weekEnergyCounts: Record<number, number> = {};
      for (const c of weekData) {
        if (c.energyLevel !== null) {
          weekEnergyCounts[c.energyLevel] = (weekEnergyCounts[c.energyLevel] || 0) + 1;
        }
      }

      // Process goals for today
      const todayGoalCounts: Record<string, number> = {};
      for (const c of todayData) {
        if (c.goals) {
          for (const goal of c.goals) {
            todayGoalCounts[goal] = (todayGoalCounts[goal] || 0) + 1;
          }
        }
      }

      // Process goals for this week
      const weekGoalCounts: Record<string, number> = {};
      for (const c of weekData) {
        if (c.goals) {
          for (const goal of c.goals) {
            weekGoalCounts[goal] = (weekGoalCounts[goal] || 0) + 1;
          }
        }
      }

      res.json({
        overall: allCheckins,
        today: {
          total: todayData.length,
          moodDistribution: Object.entries(todayMoodCounts).map(([mood, count]) => ({ mood, count })),
          energyDistribution: Object.entries(todayEnergyCounts).map(([level, count]) => ({ energyLevel: parseInt(level), count })),
          popularGoals: Object.entries(todayGoalCounts).map(([goal, count]) => ({ goal, count })).sort((a, b) => b.count - a.count).slice(0, 5),
        },
        thisWeek: {
          total: weekData.length,
          moodDistribution: Object.entries(weekMoodCounts).map(([mood, count]) => ({ mood, count })),
          energyDistribution: Object.entries(weekEnergyCounts).map(([level, count]) => ({ energyLevel: parseInt(level), count })),
          popularGoals: Object.entries(weekGoalCounts).map(([goal, count]) => ({ goal, count })).sort((a, b) => b.count - a.count).slice(0, 5),
        },
      });
    } catch (error) {
      console.error("Check-in analytics error:", error);
      res.status(500).json({ message: "Failed to fetch check-in analytics" });
    }
  });

  // Email preview endpoint for dashboard actions - uses database templates
  app.post("/api/admin/actionable/preview-email", async (req, res) => {
    try {
      const { userId, emailType } = req.body;
      
      if (!userId || !emailType) {
        return res.status(400).json({ message: "User ID and email type are required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Map emailType to database template type
      const templateTypeMap: Record<string, string> = {
        're-engagement': 're-engagement',
        'photo-reminder': 'photo-reminder',
        'congratulations': 'workout-congratulations',
      };

      const templateType = templateTypeMap[emailType];
      if (!templateType) {
        return res.status(400).json({ message: "Invalid email type" });
      }

      // Fetch template from database
      const template = await storage.getEmailTemplateByType(templateType);
      if (!template) {
        return res.status(404).json({ message: `Email template not found for type: ${templateType}` });
      }

      // Generate variables for this user
      const baseUrl = process.env.REPLIT_DEV_DOMAIN || 'https://app.strongerwithzoe.com';
      const userVariables = generateUserVariables(user, {
        programName: 'Your Postpartum Strength Recovery Program',
        campaignId: 'quick-send',
        recipientId: String(user.id),
        baseUrl,
      });

      // Replace template variables with user data
      const subject = replaceTemplateVariables(template.subject, userVariables);
      const html = replaceTemplateVariables(template.htmlContent, userVariables);

      res.json({
        recipient: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
        emailType,
        subject,
        html,
      });
    } catch (error) {
      console.error("Email preview error:", error);
      res.status(500).json({ message: "Failed to generate email preview" });
    }
  });

  // Quick-send email endpoint for dashboard actions - uses database templates
  app.post("/api/admin/actionable/send-email", adminOperationLimiter, async (req, res) => {
    try {
      const { userId, emailType } = req.body;
      
      if (!userId || !emailType) {
        return res.status(400).json({ message: "User ID and email type are required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Map emailType to database template type
      const templateTypeMap: Record<string, string> = {
        're-engagement': 're-engagement',
        'photo-reminder': 'photo-reminder',
        'congratulations': 'workout-congratulations',
      };

      const templateType = templateTypeMap[emailType];
      if (!templateType) {
        return res.status(400).json({ message: "Invalid email type" });
      }

      // Fetch template from database
      const template = await storage.getEmailTemplateByType(templateType);
      if (!template) {
        return res.status(404).json({ message: `Email template not found for type: ${templateType}` });
      }

      // Generate variables for this user
      const baseUrl = process.env.REPLIT_DEV_DOMAIN || 'https://app.strongerwithzoe.com';
      const userVariables = generateUserVariables(user, {
        programName: 'Your Postpartum Strength Recovery Program',
        campaignId: 'quick-send',
        recipientId: String(user.id),
        baseUrl,
      });

      // Replace template variables with user data
      const subject = replaceTemplateVariables(template.subject, userVariables);
      const html = replaceTemplateVariables(template.htmlContent, userVariables);

      // Generate plain text version from html (basic strip)
      const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 500);

      // Send the email
      const result = await emailService.send({
        to: { email: user.email, name: `${user.firstName} ${user.lastName}` },
        subject,
        html,
        text: textContent,
      });

      if (!result.success) {
        return res.status(500).json({ 
          message: "Failed to send email",
          error: result.error 
        });
      }

      res.json({ 
        success: true,
        message: `${emailType} email sent successfully to ${user.firstName}`,
        messageId: result.messageId
      });
    } catch (error) {
      console.error("Quick send email error:", error);
      res.status(500).json({ message: "Failed to send email" });
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

      const createdRecipients = await storage.createCampaignRecipients(recipients);

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

  // ==================== SPOTIFY ROUTES ====================
  
  // Check if Spotify is connected
  app.get("/api/spotify/status", async (req, res) => {
    try {
      const connected = await isSpotifyConnected();
      res.json({ connected });
    } catch (error) {
      res.json({ connected: false });
    }
  });

  // Get workout playlists for all weeks
  app.get("/api/spotify/workout-playlists", async (req, res) => {
    try {
      res.json(workoutPlaylists);
    } catch (error) {
      console.error("Error fetching workout playlists:", error);
      res.status(500).json({ message: "Failed to fetch playlists" });
    }
  });

  // Get specific playlist details from Spotify
  app.get("/api/spotify/playlist/:playlistId", async (req, res) => {
    try {
      const { playlistId } = req.params;
      const details = await getPlaylistDetails(playlistId);
      if (details) {
        res.json(details);
      } else {
        res.status(404).json({ message: "Playlist not found" });
      }
    } catch (error) {
      console.error("Error fetching playlist details:", error);
      res.status(500).json({ message: "Failed to fetch playlist details" });
    }
  });

  // Get current playback state
  app.get("/api/spotify/playback", async (req, res) => {
    try {
      const state = await getPlaybackState();
      res.json(state || { isPlaying: false, track: null, device: null });
    } catch (error) {
      console.error("Error getting playback state:", error);
      res.status(500).json({ message: "Failed to get playback state" });
    }
  });

  // Control playback (play/pause/next/previous)
  app.post("/api/spotify/playback/:action", async (req, res) => {
    try {
      const { action } = req.params;
      const { contextUri } = req.body;
      
      if (!['play', 'pause', 'next', 'previous'].includes(action)) {
        return res.status(400).json({ message: "Invalid action" });
      }
      
      const result = await controlPlayback(action as any, contextUri);
      res.json(result);
    } catch (error) {
      console.error("Playback control error:", error);
      res.status(500).json({ message: "Failed to control playback" });
    }
  });

  // ==================== COURSE MANAGEMENT ROUTES ====================

  // Get all courses (admin)
  app.get("/api/admin/courses", requireAdmin, async (req, res) => {
    try {
      const result = await storage.db.execute(sql`
        SELECT * FROM courses ORDER BY order_index ASC, created_at DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Create course (admin)
  app.post("/api/admin/courses", requireAdmin, async (req, res) => {
    try {
      const { name, slug, description, shortDescription, level, durationWeeks, status, imageUrl, thumbnailUrl, price, isVisible, orderIndex } = req.body;
      const id = randomUUID();
      
      await storage.db.execute(sql`
        INSERT INTO courses (id, name, slug, description, short_description, level, duration_weeks, status, image_url, thumbnail_url, price, is_visible, order_index)
        VALUES (${id}, ${name}, ${slug}, ${description}, ${shortDescription || null}, ${level || 'beginner'}, ${durationWeeks || null}, ${status || 'draft'}, ${imageUrl || null}, ${thumbnailUrl || null}, ${price || 0}, ${isVisible || false}, ${orderIndex || 0})
      `);
      
      const result = await storage.db.execute(sql`SELECT * FROM courses WHERE id = ${id}`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  // Upload course image (admin)
  app.post("/api/admin/courses/:id/image", requireAdmin, upload.single('image'), handleMulterError, async (req, res) => {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Upload to Cloudinary with course-specific folder
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'course-images',
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 675, crop: 'fill', gravity: 'center' },
              { quality: 'auto:good' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error("[COURSE IMAGE UPLOAD ERROR]:", error.message);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(req.file!.buffer);
      });

      // Also create a thumbnail version
      const thumbnailPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'course-images/thumbnails',
            resource_type: 'image',
            transformation: [
              { width: 400, height: 225, crop: 'fill', gravity: 'center' },
              { quality: 'auto:good' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error("[COURSE THUMBNAIL UPLOAD ERROR]:", error.message);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(req.file!.buffer);
      });

      const [fullResult, thumbResult]: any = await Promise.all([uploadPromise, thumbnailPromise]);

      // Update course with image URLs
      await storage.db.execute(sql`
        UPDATE courses 
        SET image_url = ${fullResult.secure_url}, 
            thumbnail_url = ${thumbResult.secure_url},
            updated_at = NOW()
        WHERE id = ${id}
      `);

      const result = await storage.db.execute(sql`SELECT * FROM courses WHERE id = ${id}`);
      res.json({
        imageUrl: fullResult.secure_url,
        thumbnailUrl: thumbResult.secure_url,
        course: result.rows[0]
      });
    } catch (error) {
      console.error("[COURSE IMAGE UPLOAD ERROR]:", error);
      res.status(500).json({ message: "Failed to upload course image", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Update course (admin)
  app.patch("/api/admin/courses/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const setClauses: string[] = [];
      const values: any[] = [];
      
      if (updates.name !== undefined) setClauses.push(`name = '${updates.name}'`);
      if (updates.slug !== undefined) setClauses.push(`slug = '${updates.slug}'`);
      if (updates.description !== undefined) setClauses.push(`description = '${updates.description}'`);
      if (updates.shortDescription !== undefined) setClauses.push(`short_description = '${updates.shortDescription}'`);
      if (updates.level !== undefined) setClauses.push(`level = '${updates.level}'`);
      if (updates.durationWeeks !== undefined) setClauses.push(`duration_weeks = ${updates.durationWeeks || 'NULL'}`);
      if (updates.status !== undefined) setClauses.push(`status = '${updates.status}'`);
      if (updates.imageUrl !== undefined) setClauses.push(`image_url = '${updates.imageUrl}'`);
      if (updates.thumbnailUrl !== undefined) setClauses.push(`thumbnail_url = '${updates.thumbnailUrl}'`);
      if (updates.isVisible !== undefined) setClauses.push(`is_visible = ${updates.isVisible}`);
      if (updates.orderIndex !== undefined) setClauses.push(`order_index = ${updates.orderIndex}`);
      setClauses.push(`updated_at = NOW()`);
      
      if (setClauses.length > 0) {
        await storage.db.execute(sql.raw(`UPDATE courses SET ${setClauses.join(', ')} WHERE id = '${id}'`));
      }
      
      const result = await storage.db.execute(sql`SELECT * FROM courses WHERE id = ${id}`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  // Delete course (admin)
  app.delete("/api/admin/courses/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.db.execute(sql`DELETE FROM courses WHERE id = ${id}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Get course preview with full content structure (admin)
  app.get("/api/admin/courses/:id/preview", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get course details
      const courseResult = await storage.db.execute(sql`SELECT * FROM courses WHERE id = ${id}`);
      if (courseResult.rows.length === 0) {
        return res.status(404).json({ message: "Course not found" });
      }
      const course = courseResult.rows[0];

      // Get modules assigned to this course with their mappings
      const modulesResult = await storage.db.execute(sql`
        SELECT 
          m.*,
          cmm.order_index as mapping_order,
          cmm.is_required
        FROM course_modules m
        JOIN course_module_mappings cmm ON m.id = cmm.module_id
        WHERE cmm.course_id = ${id}
        ORDER BY cmm.order_index ASC
      `);

      // For each module, get sections and content
      const modulesWithContent = await Promise.all(
        modulesResult.rows.map(async (module: any) => {
          // Get sections for this module
          const sectionsResult = await storage.db.execute(sql`
            SELECT * FROM module_sections 
            WHERE module_id = ${module.id}
            ORDER BY order_index ASC
          `);

          // For each section, get content items
          const sectionsWithContent = await Promise.all(
            sectionsResult.rows.map(async (section: any) => {
              const contentResult = await storage.db.execute(sql`
                SELECT * FROM content_items
                WHERE section_id = ${section.id}
                ORDER BY order_index ASC
              `);
              
              // For exercise type content, enrich with exercise data from metadata
              // For workout type content, enrich with structured workout data
              const enrichedContent = await Promise.all(
                contentResult.rows.map(async (item: any) => {
                  if (item.content_type === 'exercise' && item.metadata) {
                    const metadata = typeof item.metadata === 'string' 
                      ? JSON.parse(item.metadata) 
                      : item.metadata;
                    if (metadata.exerciseId) {
                      const exerciseResult = await storage.db.execute(sql`
                        SELECT display_id, name, description, video_url, duration, category, difficulty
                        FROM exercises WHERE id = ${metadata.exerciseId}
                      `);
                      if (exerciseResult.rows.length > 0) {
                        const exercise = exerciseResult.rows[0];
                        return {
                          ...item,
                          exercise_name: exercise.name,
                          exercise_video_url: exercise.video_url,
                          exercise_duration: exercise.duration,
                          exercise_category: exercise.category,
                          exercise_display_id: exercise.display_id,
                          exercise_description: exercise.description,
                          exercise_difficulty: exercise.difficulty
                        };
                      }
                    }
                  }
                  
                  // Enrich workout content items
                  if (item.content_type === 'workout' && item.structured_workout_id) {
                    const workoutResult = await storage.db.execute(sql`
                      SELECT * FROM structured_workouts WHERE id = ${item.structured_workout_id}
                    `);
                    if (workoutResult.rows.length > 0) {
                      const workout = workoutResult.rows[0] as any;
                      
                      // Get workout exercises
                      const exercisesResult = await storage.db.execute(sql`
                        SELECT wel.*, e.name as exercise_name, e.video_url as exercise_video_url
                        FROM workout_exercise_links wel
                        JOIN exercises e ON e.id = wel.exercise_id
                        WHERE wel.workout_id = ${item.structured_workout_id}
                        ORDER BY wel.order_index
                      `);
                      
                      return {
                        ...item,
                        workout_name: workout.name,
                        workout_type: workout.workout_type,
                        workout_rounds: workout.rounds,
                        workout_rest_between_exercises: workout.rest_between_exercises,
                        workout_rest_between_rounds: workout.rest_between_rounds,
                        workout_total_duration: workout.total_duration,
                        workout_difficulty: workout.difficulty,
                        workout_exercises: exercisesResult.rows
                      };
                    }
                  }
                  
                  return item;
                })
              );
              
              return {
                ...section,
                contentItems: enrichedContent
              };
            })
          );

          return {
            ...module,
            sections: sectionsWithContent
          };
        })
      );

      // Calculate content statistics
      const stats = {
        totalModules: modulesWithContent.length,
        totalSections: modulesWithContent.reduce((sum, m: any) => sum + m.sections.length, 0),
        totalItems: modulesWithContent.reduce((sum, m: any) => 
          sum + m.sections.reduce((sSum: number, s: any) => sSum + s.contentItems.length, 0), 0),
        modulesWithContent: modulesWithContent.filter((m: any) => 
          m.sections.some((s: any) => s.contentItems.length > 0)).length,
        emptyModules: modulesWithContent.filter((m: any) => 
          !m.sections.some((s: any) => s.contentItems.length > 0)).map((m: any) => m.name),
        emptySections: modulesWithContent.flatMap((m: any) => 
          m.sections.filter((s: any) => s.contentItems.length === 0).map((s: any) => ({
            module: m.name,
            section: s.title
          })))
      };

      res.json({
        course,
        modules: modulesWithContent,
        stats
      });
    } catch (error) {
      console.error("Error fetching course preview:", error);
      res.status(500).json({ message: "Failed to fetch course preview" });
    }
  });

  // Get all modules (admin) with section and content counts
  app.get("/api/admin/modules", requireAdmin, async (req, res) => {
    try {
      const result = await storage.db.execute(sql`
        SELECT 
          m.*,
          COALESCE(s.section_count, 0) as section_count,
          COALESCE(c.content_count, 0) as content_count
        FROM course_modules m
        LEFT JOIN (
          SELECT module_id, COUNT(*) as section_count 
          FROM module_sections 
          GROUP BY module_id
        ) s ON m.id = s.module_id
        LEFT JOIN (
          SELECT ms.module_id, COUNT(*) as content_count 
          FROM content_items ci
          JOIN module_sections ms ON ci.section_id = ms.id
          GROUP BY ms.module_id
        ) c ON m.id = c.module_id
        ORDER BY m.created_at DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });

  // Create module (admin)
  app.post("/api/admin/modules", requireAdmin, async (req, res) => {
    try {
      const { name, slug, description, moduleType, iconName, colorTheme, isReusable } = req.body;
      const id = randomUUID();
      
      await storage.db.execute(sql`
        INSERT INTO course_modules (id, name, slug, description, module_type, icon_name, color_theme, is_reusable)
        VALUES (${id}, ${name}, ${slug}, ${description || null}, ${moduleType}, ${iconName || null}, ${colorTheme || 'pink'}, ${isReusable !== false})
      `);
      
      const result = await storage.db.execute(sql`SELECT * FROM course_modules WHERE id = ${id}`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error creating module:", error);
      res.status(500).json({ message: "Failed to create module" });
    }
  });

  // Update module (admin)
  app.patch("/api/admin/modules/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Get current module first
      const current = await storage.db.execute(sql`SELECT * FROM course_modules WHERE id = ${id}`);
      if (!current.rows[0]) {
        return res.status(404).json({ message: "Module not found" });
      }
      
      const currentModule = current.rows[0] as any;
      
      // Merge updates with current values
      const name = updates.name ?? currentModule.name;
      const slug = updates.slug ?? currentModule.slug;
      const description = updates.description ?? currentModule.description;
      const moduleType = updates.moduleType ?? currentModule.module_type;
      const iconName = updates.iconName ?? currentModule.icon_name;
      const colorTheme = updates.colorTheme ?? currentModule.color_theme;
      const isReusable = updates.isReusable ?? currentModule.is_reusable;
      const isVisible = updates.isVisible ?? currentModule.is_visible;
      
      await storage.db.execute(sql`
        UPDATE course_modules SET 
          name = ${name},
          slug = ${slug},
          description = ${description},
          module_type = ${moduleType},
          icon_name = ${iconName},
          color_theme = ${colorTheme},
          is_reusable = ${isReusable},
          is_visible = ${isVisible},
          updated_at = NOW()
        WHERE id = ${id}
      `);
      
      const result = await storage.db.execute(sql`SELECT * FROM course_modules WHERE id = ${id}`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating module:", error);
      res.status(500).json({ message: "Failed to update module" });
    }
  });

  // Delete module (admin)
  app.delete("/api/admin/modules/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.db.execute(sql`DELETE FROM course_modules WHERE id = ${id}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting module:", error);
      res.status(500).json({ message: "Failed to delete module" });
    }
  });

  // ==================== MODULE SECTIONS ROUTES ====================

  // Get sections for a module
  app.get("/api/admin/modules/:moduleId/sections", requireAdmin, async (req, res) => {
    try {
      const { moduleId } = req.params;
      const result = await storage.db.execute(sql`
        SELECT 
          s.*,
          COALESCE(c.content_count, 0) as content_count
        FROM module_sections s
        LEFT JOIN (
          SELECT section_id, COUNT(*) as content_count 
          FROM content_items 
          GROUP BY section_id
        ) c ON s.id = c.section_id
        WHERE s.module_id = ${moduleId} 
        ORDER BY s.order_index ASC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching sections:", error);
      res.status(500).json({ message: "Failed to fetch sections" });
    }
  });

  // Create section
  app.post("/api/admin/modules/:moduleId/sections", requireAdmin, async (req, res) => {
    try {
      const { moduleId } = req.params;
      const { name, slug, description, orderIndex } = req.body;
      const id = randomUUID();
      
      await storage.db.execute(sql`
        INSERT INTO module_sections (id, module_id, name, slug, description, order_index)
        VALUES (${id}, ${moduleId}, ${name}, ${slug}, ${description || null}, ${orderIndex || 0})
      `);
      
      const result = await storage.db.execute(sql`SELECT * FROM module_sections WHERE id = ${id}`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error creating section:", error);
      res.status(500).json({ message: "Failed to create section" });
    }
  });

  // Update section
  app.patch("/api/admin/sections/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const setClauses: string[] = [];
      
      if (updates.name !== undefined) setClauses.push(`name = '${updates.name}'`);
      if (updates.slug !== undefined) setClauses.push(`slug = '${updates.slug}'`);
      if (updates.description !== undefined) setClauses.push(`description = '${updates.description}'`);
      if (updates.orderIndex !== undefined) setClauses.push(`order_index = ${updates.orderIndex}`);
      setClauses.push(`updated_at = NOW()`);
      
      if (setClauses.length > 0) {
        await storage.db.execute(sql.raw(`UPDATE module_sections SET ${setClauses.join(', ')} WHERE id = '${id}'`));
      }
      
      const result = await storage.db.execute(sql`SELECT * FROM module_sections WHERE id = ${id}`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating section:", error);
      res.status(500).json({ message: "Failed to update section" });
    }
  });

  // Delete section
  app.delete("/api/admin/sections/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.db.execute(sql`DELETE FROM module_sections WHERE id = ${id}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting section:", error);
      res.status(500).json({ message: "Failed to delete section" });
    }
  });

  // ==================== CONTENT ITEMS ROUTES ====================

  // Get content items for a section
  app.get("/api/admin/sections/:sectionId/content", requireAdmin, async (req, res) => {
    try {
      const { sectionId } = req.params;
      const result = await storage.db.execute(sql`
        SELECT * FROM content_items WHERE section_id = ${sectionId} ORDER BY order_index ASC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching content items:", error);
      res.status(500).json({ message: "Failed to fetch content items" });
    }
  });

  // Create content item
  app.post("/api/admin/sections/:sectionId/content", requireAdmin, async (req, res) => {
    try {
      const { sectionId } = req.params;
      const { contentType, title, description, contentData, durationMinutes, orderIndex } = req.body;
      const id = randomUUID();
      
      await storage.db.execute(sql`
        INSERT INTO content_items (id, section_id, content_type, title, description, content_data, duration_minutes, order_index)
        VALUES (${id}, ${sectionId}, ${contentType}, ${title}, ${description || null}, ${JSON.stringify(contentData || {})}, ${durationMinutes || null}, ${orderIndex || 0})
      `);
      
      const result = await storage.db.execute(sql`SELECT * FROM content_items WHERE id = ${id}`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error creating content item:", error);
      res.status(500).json({ message: "Failed to create content item" });
    }
  });

  // Update content item
  app.patch("/api/admin/content/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const setClauses: string[] = [];
      
      if (updates.contentType !== undefined) setClauses.push(`content_type = '${updates.contentType}'`);
      if (updates.title !== undefined) setClauses.push(`title = '${updates.title}'`);
      if (updates.description !== undefined) setClauses.push(`description = '${updates.description}'`);
      if (updates.contentData !== undefined) setClauses.push(`content_data = '${JSON.stringify(updates.contentData)}'`);
      if (updates.durationMinutes !== undefined) setClauses.push(`duration_minutes = ${updates.durationMinutes || 'NULL'}`);
      if (updates.orderIndex !== undefined) setClauses.push(`order_index = ${updates.orderIndex}`);
      setClauses.push(`updated_at = NOW()`);
      
      if (setClauses.length > 0) {
        await storage.db.execute(sql.raw(`UPDATE content_items SET ${setClauses.join(', ')} WHERE id = '${id}'`));
      }
      
      const result = await storage.db.execute(sql`SELECT * FROM content_items WHERE id = ${id}`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating content item:", error);
      res.status(500).json({ message: "Failed to update content item" });
    }
  });

  // Delete content item
  app.delete("/api/admin/content/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.db.execute(sql`DELETE FROM content_items WHERE id = ${id}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting content item:", error);
      res.status(500).json({ message: "Failed to delete content item" });
    }
  });

  // Generate AI content description
  app.post("/api/admin/generate-content", requireAdmin, async (req, res) => {
    try {
      const { title, contentType, context } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      const openai = new OpenAI({
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      });

      const contentTypeDescriptions: Record<string, string> = {
        video: "an educational video",
        text: "a text article or informational content",
        pdf: "a downloadable PDF resource",
        exercise: "a postpartum recovery exercise",
        workout: "a structured workout routine",
      };

      const systemPrompt = `You are Zoe, a warm and supportive postpartum fitness coach helping create course content descriptions for mothers.

Your tone is:
- Warm, encouraging, and empathetic
- Uses casual, friendly language
- Occasionally says "mama" or "You've got this!"
- Never judgmental, always supportive
- Expert in postpartum recovery

Write a compelling, helpful description (2-4 sentences) for course content. The description should:
1. Explain what the user will learn or do
2. Highlight the benefits for postpartum recovery
3. Be encouraging and motivating
4. Be concise but informative

Do NOT use markdown formatting. Just plain text.`;

      const userPrompt = `Write a description for this ${contentTypeDescriptions[contentType] || "content item"}:

Title: "${title}"
${context ? `Additional context: ${context}` : ""}

Keep it to 2-4 sentences, warm and encouraging.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      const generatedDescription = response.choices[0]?.message?.content?.trim() || "";
      
      res.json({ description: generatedDescription });
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  // ==================== COURSE-MODULE MAPPING ROUTES ====================

  // Get modules assigned to a course
  app.get("/api/admin/courses/:courseId/modules", requireAdmin, async (req, res) => {
    try {
      const { courseId } = req.params;
      const result = await storage.db.execute(sql`
        SELECT cmm.*, cm.name, cm.slug, cm.description, cm.module_type, cm.icon_name, cm.color_theme
        FROM course_module_mappings cmm
        JOIN course_modules cm ON cmm.module_id = cm.id
        WHERE cmm.course_id = ${courseId}
        ORDER BY cmm.order_index ASC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching course modules:", error);
      res.status(500).json({ message: "Failed to fetch course modules" });
    }
  });

  // Assign module to course
  app.post("/api/admin/courses/:courseId/modules", requireAdmin, async (req, res) => {
    try {
      const { courseId } = req.params;
      const { moduleId, orderIndex } = req.body;
      const id = randomUUID();
      
      // Check if mapping already exists
      const existing = await storage.db.execute(sql`
        SELECT id FROM course_module_mappings 
        WHERE course_id = ${courseId} AND module_id = ${moduleId}
      `);
      
      if (existing.rows.length > 0) {
        return res.status(400).json({ message: "Module already assigned to this course" });
      }
      
      await storage.db.execute(sql`
        INSERT INTO course_module_mappings (id, course_id, module_id, order_index)
        VALUES (${id}, ${courseId}, ${moduleId}, ${orderIndex || 0})
      `);
      
      const result = await storage.db.execute(sql`
        SELECT cmm.*, cm.name, cm.slug, cm.description, cm.module_type, cm.icon_name, cm.color_theme
        FROM course_module_mappings cmm
        JOIN course_modules cm ON cmm.module_id = cm.id
        WHERE cmm.id = ${id}
      `);
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error assigning module to course:", error);
      res.status(500).json({ message: "Failed to assign module to course" });
    }
  });

  // Update module order in course
  app.patch("/api/admin/course-modules/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { orderIndex } = req.body;
      
      await storage.db.execute(sql`
        UPDATE course_module_mappings 
        SET order_index = ${orderIndex}, updated_at = NOW()
        WHERE id = ${id}
      `);
      
      const result = await storage.db.execute(sql`
        SELECT cmm.*, cm.name, cm.slug, cm.description, cm.module_type, cm.icon_name, cm.color_theme
        FROM course_module_mappings cmm
        JOIN course_modules cm ON cmm.module_id = cm.id
        WHERE cmm.id = ${id}
      `);
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating module order:", error);
      res.status(500).json({ message: "Failed to update module order" });
    }
  });

  // Remove module from course
  app.delete("/api/admin/course-modules/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.db.execute(sql`DELETE FROM course_module_mappings WHERE id = ${id}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing module from course:", error);
      res.status(500).json({ message: "Failed to remove module from course" });
    }
  });

  // Bulk update module order in course
  app.put("/api/admin/courses/:courseId/modules/reorder", requireAdmin, async (req, res) => {
    try {
      const { courseId } = req.params;
      const { moduleOrders } = req.body; // Array of { id, orderIndex }
      
      for (const item of moduleOrders) {
        await storage.db.execute(sql`
          UPDATE course_module_mappings 
          SET order_index = ${item.orderIndex}, updated_at = NOW()
          WHERE id = ${item.id} AND course_id = ${courseId}
        `);
      }
      
      const result = await storage.db.execute(sql`
        SELECT cmm.*, cm.name, cm.slug, cm.description, cm.module_type, cm.icon_name, cm.color_theme
        FROM course_module_mappings cmm
        JOIN course_modules cm ON cmm.module_id = cm.id
        WHERE cmm.course_id = ${courseId}
        ORDER BY cmm.order_index ASC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error reordering modules:", error);
      res.status(500).json({ message: "Failed to reorder modules" });
    }
  });

  // Get single course by ID (for editor)
  app.get("/api/admin/courses/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await storage.db.execute(sql`SELECT * FROM courses WHERE id = ${id}`);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // ==================== EXERCISE LIBRARY ROUTES ====================

  // Get all exercises
  app.get("/api/admin/exercises", requireAdmin, async (req, res) => {
    try {
      const { category, search, prefix } = req.query;
      let query = `SELECT * FROM exercises WHERE 1=1`;
      
      if (category && category !== 'all') {
        query += ` AND category = '${category}'`;
      }
      if (search) {
        query += ` AND (LOWER(name) LIKE LOWER('%${search}%') OR LOWER(description) LIKE LOWER('%${search}%'))`;
      }
      if (prefix) {
        query += ` AND id LIKE '${prefix}%'`;
      }
      query += ` ORDER BY order_index ASC, name ASC`;
      
      const result = await storage.db.execute(sql.raw(query));
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  // Get single exercise
  app.get("/api/admin/exercises/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await storage.db.execute(sql`SELECT * FROM exercises WHERE id = ${id}`);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching exercise:", error);
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  // Create exercise
  app.post("/api/admin/exercises", requireAdmin, async (req, res) => {
    try {
      const { name, slug, description, videoUrl, thumbnailUrl, defaultReps, defaultDurationSeconds, category, muscleGroups, difficulty, coachNotes } = req.body;
      const id = randomUUID();
      
      const muscleGroupsArray = muscleGroups || [];
      
      await storage.db.execute(sql`
        INSERT INTO exercises (id, name, slug, description, video_url, thumbnail_url, default_reps, default_duration_seconds, category, muscle_groups, difficulty, coach_notes)
        VALUES (${id}, ${name}, ${slug}, ${description || null}, ${videoUrl || null}, ${thumbnailUrl || null}, ${defaultReps || null}, ${defaultDurationSeconds || null}, ${category || 'core'}, ${muscleGroupsArray}, ${difficulty || 'beginner'}, ${coachNotes || null})
      `);
      
      const result = await storage.db.execute(sql`SELECT * FROM exercises WHERE id = ${id}`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error creating exercise:", error);
      res.status(500).json({ message: "Failed to create exercise" });
    }
  });

  // Update exercise
  app.patch("/api/admin/exercises/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const setClauses: string[] = [];
      
      if (updates.name !== undefined) setClauses.push(`name = '${updates.name}'`);
      if (updates.slug !== undefined) setClauses.push(`slug = '${updates.slug}'`);
      if (updates.description !== undefined) setClauses.push(`description = '${updates.description}'`);
      if (updates.videoUrl !== undefined) setClauses.push(`video_url = '${updates.videoUrl}'`);
      if (updates.thumbnailUrl !== undefined) setClauses.push(`thumbnail_url = '${updates.thumbnailUrl}'`);
      if (updates.defaultReps !== undefined) setClauses.push(`default_reps = '${updates.defaultReps}'`);
      if (updates.defaultDurationSeconds !== undefined) setClauses.push(`default_duration_seconds = ${updates.defaultDurationSeconds || 'NULL'}`);
      if (updates.category !== undefined) setClauses.push(`category = '${updates.category}'`);
      if (updates.muscleGroups !== undefined) setClauses.push(`muscle_groups = ARRAY[${updates.muscleGroups.map((g: string) => `'${g}'`).join(',')}]::text[]`);
      if (updates.difficulty !== undefined) setClauses.push(`difficulty = '${updates.difficulty}'`);
      if (updates.coachNotes !== undefined) setClauses.push(`coach_notes = '${updates.coachNotes}'`);
      if (updates.isActive !== undefined) setClauses.push(`is_active = ${updates.isActive}`);
      if (updates.orderIndex !== undefined) setClauses.push(`order_index = ${updates.orderIndex}`);
      
      if (setClauses.length > 0) {
        await storage.db.execute(sql.raw(`UPDATE exercises SET ${setClauses.join(', ')} WHERE id = '${id}'`));
      }
      
      const result = await storage.db.execute(sql`SELECT * FROM exercises WHERE id = ${id}`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating exercise:", error);
      res.status(500).json({ message: "Failed to update exercise" });
    }
  });

  // Delete exercise
  app.delete("/api/admin/exercises/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.db.execute(sql`DELETE FROM exercises WHERE id = ${id}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting exercise:", error);
      res.status(500).json({ message: "Failed to delete exercise" });
    }
  });

  // ================== STRUCTURED WORKOUTS API ==================
  
  // Get all structured workouts
  app.get("/api/admin/structured-workouts", requireAdmin, async (req, res) => {
    try {
      const result = await storage.db.execute(sql`
        SELECT sw.*, 
          (SELECT COUNT(*) FROM workout_exercise_links WHERE workout_id = sw.id) as exercise_count
        FROM structured_workouts sw 
        WHERE sw.is_visible = true
        ORDER BY sw.created_at DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching structured workouts:", error);
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  // Get single structured workout with exercises
  app.get("/api/admin/structured-workouts/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get workout
      const workoutResult = await storage.db.execute(sql`
        SELECT * FROM structured_workouts WHERE id = ${id}
      `);
      
      if (workoutResult.rows.length === 0) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      // Get exercises linked to this workout
      const exercisesResult = await storage.db.execute(sql`
        SELECT wel.*, e.name as exercise_name, e.video_url as exercise_video_url, 
               e.description as exercise_description, e.category as exercise_category
        FROM workout_exercise_links wel
        JOIN exercises e ON e.id = wel.exercise_id
        WHERE wel.workout_id = ${id}
        ORDER BY wel.order_index
      `);
      
      res.json({
        ...workoutResult.rows[0],
        exercises: exercisesResult.rows
      });
    } catch (error) {
      console.error("Error fetching structured workout:", error);
      res.status(500).json({ message: "Failed to fetch workout" });
    }
  });

  // Create structured workout
  app.post("/api/admin/structured-workouts", requireAdmin, async (req, res) => {
    try {
      const { 
        name, description, workoutType, totalDuration, rounds, 
        restBetweenRounds, restBetweenExercises, difficulty, 
        equipmentNeeded, coachNotes 
      } = req.body;
      
      const id = randomUUID();
      const equipmentArray = equipmentNeeded || [];
      
      await storage.db.execute(sql`
        INSERT INTO structured_workouts (
          id, name, description, workout_type, total_duration, rounds,
          rest_between_rounds, rest_between_exercises, difficulty,
          equipment_needed, coach_notes, is_visible
        ) VALUES (
          ${id}, ${name}, ${description || null}, ${workoutType || 'strength'}, 
          ${totalDuration || null}, ${rounds || 1}, ${restBetweenRounds || 60}, 
          ${restBetweenExercises || 30}, ${difficulty || 'beginner'},
          ${equipmentArray}, ${coachNotes || null}, true
        )
      `);
      
      const result = await storage.db.execute(sql`SELECT * FROM structured_workouts WHERE id = ${id}`);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error creating structured workout:", error);
      res.status(500).json({ message: "Failed to create workout" });
    }
  });

  // Update structured workout
  app.patch("/api/admin/structured-workouts/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const setClauses: string[] = [];
      if (updates.name !== undefined) setClauses.push(`name = '${updates.name}'`);
      if (updates.description !== undefined) setClauses.push(`description = '${updates.description}'`);
      if (updates.workoutType !== undefined) setClauses.push(`workout_type = '${updates.workoutType}'`);
      if (updates.totalDuration !== undefined) setClauses.push(`total_duration = '${updates.totalDuration}'`);
      if (updates.rounds !== undefined) setClauses.push(`rounds = ${updates.rounds}`);
      if (updates.restBetweenRounds !== undefined) setClauses.push(`rest_between_rounds = ${updates.restBetweenRounds}`);
      if (updates.restBetweenExercises !== undefined) setClauses.push(`rest_between_exercises = ${updates.restBetweenExercises}`);
      if (updates.difficulty !== undefined) setClauses.push(`difficulty = '${updates.difficulty}'`);
      if (updates.equipmentNeeded !== undefined) setClauses.push(`equipment_needed = ARRAY[${updates.equipmentNeeded.map((e: string) => `'${e}'`).join(',')}]::text[]`);
      if (updates.coachNotes !== undefined) setClauses.push(`coach_notes = '${updates.coachNotes}'`);
      setClauses.push(`updated_at = NOW()`);
      
      if (setClauses.length > 0) {
        await storage.db.execute(sql.raw(`UPDATE structured_workouts SET ${setClauses.join(', ')} WHERE id = '${id}'`));
      }
      
      const result = await storage.db.execute(sql`SELECT * FROM structured_workouts WHERE id = ${id}`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating structured workout:", error);
      res.status(500).json({ message: "Failed to update workout" });
    }
  });

  // Delete (archive) structured workout
  app.delete("/api/admin/structured-workouts/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.db.execute(sql`UPDATE structured_workouts SET is_visible = false WHERE id = ${id}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error archiving structured workout:", error);
      res.status(500).json({ message: "Failed to archive workout" });
    }
  });

  // ================== WORKOUT EXERCISE LINKS API ==================
  
  // Add exercise to workout
  app.post("/api/admin/structured-workouts/:workoutId/exercises", requireAdmin, async (req, res) => {
    try {
      const { workoutId } = req.params;
      const { exerciseId, orderIndex, reps, sets, duration, restAfter, sideSpecific, coachNotes, videoUrlOverride } = req.body;
      
      const id = randomUUID();
      
      await storage.db.execute(sql`
        INSERT INTO workout_exercise_links (
          id, workout_id, exercise_id, order_index, reps, sets, duration,
          rest_after, side_specific, coach_notes, video_url_override
        ) VALUES (
          ${id}, ${workoutId}, ${exerciseId}, ${orderIndex || 0}, ${reps || null},
          ${sets || 1}, ${duration || null}, ${restAfter || 30}, ${sideSpecific || false},
          ${coachNotes || null}, ${videoUrlOverride || null}
        )
      `);
      
      const result = await storage.db.execute(sql`
        SELECT wel.*, e.name as exercise_name, e.video_url as exercise_video_url
        FROM workout_exercise_links wel
        JOIN exercises e ON e.id = wel.exercise_id
        WHERE wel.id = ${id}
      `);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error adding exercise to workout:", error);
      res.status(500).json({ message: "Failed to add exercise" });
    }
  });

  // Update exercise in workout
  app.patch("/api/admin/workout-exercise-links/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const setClauses: string[] = [];
      if (updates.orderIndex !== undefined) setClauses.push(`order_index = ${updates.orderIndex}`);
      if (updates.reps !== undefined) setClauses.push(`reps = '${updates.reps}'`);
      if (updates.sets !== undefined) setClauses.push(`sets = ${updates.sets}`);
      if (updates.duration !== undefined) setClauses.push(`duration = '${updates.duration}'`);
      if (updates.restAfter !== undefined) setClauses.push(`rest_after = ${updates.restAfter}`);
      if (updates.sideSpecific !== undefined) setClauses.push(`side_specific = ${updates.sideSpecific}`);
      if (updates.coachNotes !== undefined) setClauses.push(`coach_notes = '${updates.coachNotes}'`);
      if (updates.videoUrlOverride !== undefined) setClauses.push(`video_url_override = '${updates.videoUrlOverride}'`);
      
      if (setClauses.length > 0) {
        await storage.db.execute(sql.raw(`UPDATE workout_exercise_links SET ${setClauses.join(', ')} WHERE id = '${id}'`));
      }
      
      const result = await storage.db.execute(sql`
        SELECT wel.*, e.name as exercise_name, e.video_url as exercise_video_url
        FROM workout_exercise_links wel
        JOIN exercises e ON e.id = wel.exercise_id
        WHERE wel.id = ${id}
      `);
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating workout exercise link:", error);
      res.status(500).json({ message: "Failed to update exercise" });
    }
  });

  // Remove exercise from workout
  app.delete("/api/admin/workout-exercise-links/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.db.execute(sql`DELETE FROM workout_exercise_links WHERE id = ${id}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing exercise from workout:", error);
      res.status(500).json({ message: "Failed to remove exercise" });
    }
  });

  // Reorder exercises in workout
  app.post("/api/admin/structured-workouts/:workoutId/reorder", requireAdmin, async (req, res) => {
    try {
      const { workoutId } = req.params;
      const { exerciseOrder } = req.body; // Array of { id, orderIndex }
      
      for (const item of exerciseOrder) {
        await storage.db.execute(sql`
          UPDATE workout_exercise_links SET order_index = ${item.orderIndex} 
          WHERE id = ${item.id} AND workout_id = ${workoutId}
        `);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error reordering exercises:", error);
      res.status(500).json({ message: "Failed to reorder exercises" });
    }
  });

  // ============================================
  // USER-FACING COURSE API ROUTES
  // ============================================

  // Get all courses user is enrolled in
  app.get("/api/courses/enrolled", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const result = await storage.db.execute(sql`
        SELECT 
          c.*,
          ce.enrolled_at,
          ce.status as enrollment_status,
          ce.progress_percentage,
          ce.completed_at
        FROM courses c
        JOIN course_enrollments ce ON c.id = ce.course_id
        WHERE ce.user_id = ${userId}
          AND c.status = 'published'
          AND c.is_visible = true
        ORDER BY ce.enrolled_at DESC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Get all available courses (for browsing)
  app.get("/api/courses/available", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session?.userId;

      const result = await storage.db.execute(sql`
        SELECT 
          c.*,
          CASE WHEN ce.id IS NOT NULL THEN true ELSE false END as is_enrolled
        FROM courses c
        LEFT JOIN course_enrollments ce ON c.id = ce.course_id AND ce.user_id = ${userId}
        WHERE c.status = 'published'
          AND c.is_visible = true
        ORDER BY c.order_index ASC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching available courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Get single course with full content (user view)
  app.get("/api/courses/:courseId", requireAuth, async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = (req as any).session?.userId;

      // Check if user is enrolled
      const enrollmentCheck = await storage.db.execute(sql`
        SELECT * FROM course_enrollments 
        WHERE course_id = ${courseId} AND user_id = ${userId}
      `);

      if (enrollmentCheck.rows.length === 0) {
        return res.status(403).json({ message: "Not enrolled in this course" });
      }

      // Get course details
      const courseResult = await storage.db.execute(sql`
        SELECT * FROM courses WHERE id = ${courseId} AND status = 'published'
      `);
      
      if (courseResult.rows.length === 0) {
        return res.status(404).json({ message: "Course not found" });
      }
      const course = courseResult.rows[0];

      // Get modules with sections and content
      const modulesResult = await storage.db.execute(sql`
        SELECT 
          m.*,
          cmm.order_index as mapping_order,
          cmm.is_required
        FROM course_modules m
        JOIN course_module_mappings cmm ON m.id = cmm.module_id
        WHERE cmm.course_id = ${courseId}
        ORDER BY cmm.order_index ASC
      `);

      const modulesWithContent = await Promise.all(
        modulesResult.rows.map(async (module: any) => {
          const sectionsResult = await storage.db.execute(sql`
            SELECT * FROM module_sections 
            WHERE module_id = ${module.id}
            ORDER BY order_index ASC
          `);

          const sectionsWithContent = await Promise.all(
            sectionsResult.rows.map(async (section: any) => {
              const contentResult = await storage.db.execute(sql`
                SELECT * FROM content_items
                WHERE section_id = ${section.id}
                ORDER BY order_index ASC
              `);
              
              // Enrich content items
              const enrichedContent = await Promise.all(
                contentResult.rows.map(async (item: any) => {
                  // Handle exercise type
                  if (item.content_type === 'exercise' && item.metadata) {
                    const metadata = typeof item.metadata === 'string' 
                      ? JSON.parse(item.metadata) 
                      : item.metadata;
                    if (metadata.exerciseId) {
                      const exerciseResult = await storage.db.execute(sql`
                        SELECT * FROM exercises WHERE id = ${metadata.exerciseId}
                      `);
                      if (exerciseResult.rows.length > 0) {
                        const exercise = exerciseResult.rows[0] as any;
                        return {
                          ...item,
                          exercise_name: exercise.name,
                          exercise_video_url: exercise.video_url,
                          exercise_duration: exercise.duration,
                          exercise_category: exercise.category,
                          exercise_description: exercise.description,
                        };
                      }
                    }
                  }
                  
                  // Handle workout type
                  if (item.content_type === 'workout' && item.structured_workout_id) {
                    const workoutResult = await storage.db.execute(sql`
                      SELECT * FROM structured_workouts WHERE id = ${item.structured_workout_id}
                    `);
                    if (workoutResult.rows.length > 0) {
                      const workout = workoutResult.rows[0] as any;
                      
                      const exercisesResult = await storage.db.execute(sql`
                        SELECT wel.*, e.name as exercise_name, e.video_url as exercise_video_url,
                               e.description as exercise_description, e.category as exercise_category
                        FROM workout_exercise_links wel
                        JOIN exercises e ON e.id = wel.exercise_id
                        WHERE wel.workout_id = ${item.structured_workout_id}
                        ORDER BY wel.order_index
                      `);
                      
                      return {
                        ...item,
                        workout_name: workout.name,
                        workout_description: workout.description,
                        workout_type: workout.workout_type,
                        workout_rounds: workout.rounds,
                        workout_rest_between_exercises: workout.rest_between_exercises,
                        workout_rest_between_rounds: workout.rest_between_rounds,
                        workout_total_duration: workout.total_duration,
                        workout_difficulty: workout.difficulty,
                        workout_coach_notes: workout.coach_notes,
                        workout_exercises: exercisesResult.rows
                      };
                    }
                  }
                  
                  return item;
                })
              );
              
              return { ...section, contentItems: enrichedContent };
            })
          );

          return { ...module, sections: sectionsWithContent };
        })
      );

      res.json({
        course,
        modules: modulesWithContent,
        enrollment: enrollmentCheck.rows[0]
      });
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Enroll user in a course
  app.post("/api/courses/:courseId/enroll", requireAuth, async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = (req as any).session?.userId;
      
      // Check if already enrolled
      const existingEnrollment = await storage.db.execute(sql`
        SELECT * FROM course_enrollments 
        WHERE course_id = ${courseId} AND user_id = ${userId}
      `);

      if (existingEnrollment.rows.length > 0) {
        return res.json(existingEnrollment.rows[0]);
      }

      // Create enrollment
      const enrollmentId = `enrollment-${Date.now()}`;
      await storage.db.execute(sql`
        INSERT INTO course_enrollments (id, course_id, user_id, status, progress_percentage, enrolled_at)
        VALUES (${enrollmentId}, ${courseId}, ${userId}, 'active', 0, NOW())
      `);

      const result = await storage.db.execute(sql`
        SELECT * FROM course_enrollments WHERE id = ${enrollmentId}
      `);

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      res.status(500).json({ message: "Failed to enroll in course" });
    }
  });

  // ==========================================
  // ADMIN COURSE ENROLLMENT MANAGEMENT
  // ==========================================

  // Get course enrollments for a specific user (admin)
  app.get("/api/admin/users/:userId/course-enrollments", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      
      const enrollments = await storage.db.execute(sql`
        SELECT ce.*, c.name as course_name, c.description as course_description, c.image_url as course_image_url
        FROM course_enrollments ce
        JOIN courses c ON ce.course_id = c.id
        WHERE ce.user_id = ${userId}
        ORDER BY ce.enrolled_at DESC
      `);

      res.json(enrollments.rows);
    } catch (error) {
      console.error("Error fetching user course enrollments:", error);
      res.status(500).json({ message: "Failed to fetch course enrollments" });
    }
  });

  // Enroll a user in a course (admin)
  app.post("/api/admin/users/:userId/course-enrollments", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { courseId, expiresAt } = req.body;

      if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
      }

      // Check if already enrolled
      const existingEnrollment = await storage.db.execute(sql`
        SELECT * FROM course_enrollments 
        WHERE course_id = ${courseId} AND user_id = ${userId}
      `);

      if (existingEnrollment.rows.length > 0) {
        return res.status(400).json({ message: "User is already enrolled in this course" });
      }

      // Create enrollment
      const enrollmentId = `enrollment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      if (expiresAt) {
        await storage.db.execute(sql`
          INSERT INTO course_enrollments (id, course_id, user_id, status, progress_percentage, enrolled_at, expires_at)
          VALUES (${enrollmentId}, ${courseId}, ${userId}, 'active', 0, NOW(), ${new Date(expiresAt)})
        `);
      } else {
        await storage.db.execute(sql`
          INSERT INTO course_enrollments (id, course_id, user_id, status, progress_percentage, enrolled_at)
          VALUES (${enrollmentId}, ${courseId}, ${userId}, 'active', 0, NOW())
        `);
      }

      const result = await storage.db.execute(sql`
        SELECT ce.*, c.name as course_name, c.description as course_description, c.image_url as course_image_url
        FROM course_enrollments ce
        JOIN courses c ON ce.course_id = c.id
        WHERE ce.id = ${enrollmentId}
      `);

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error enrolling user in course:", error);
      res.status(500).json({ message: "Failed to enroll user in course" });
    }
  });

  // Update/extend course enrollment validity (admin)
  app.patch("/api/admin/course-enrollments/:enrollmentId", requireAdmin, async (req, res) => {
    try {
      const { enrollmentId } = req.params;
      const { expiresAt, extendMonths, hasWhatsAppSupport } = req.body;

      // Get current enrollment
      const currentEnrollment = await storage.db.execute(sql`
        SELECT * FROM course_enrollments WHERE id = ${enrollmentId}
      `);

      if (currentEnrollment.rows.length === 0) {
        return res.status(404).json({ message: "Enrollment not found" });
      }

      const enrollment = currentEnrollment.rows[0];

      // Calculate new expiry date
      let newExpiresAt = enrollment.expires_at;
      
      if (extendMonths) {
        const baseDate = enrollment.expires_at ? new Date(enrollment.expires_at) : new Date();
        if (baseDate < new Date()) {
          // If expired, extend from today
          newExpiresAt = new Date();
        } else {
          newExpiresAt = new Date(baseDate);
        }
        newExpiresAt.setMonth(newExpiresAt.getMonth() + extendMonths);
      } else if (expiresAt) {
        newExpiresAt = new Date(expiresAt);
      }

      await storage.db.execute(sql`
        UPDATE course_enrollments 
        SET expires_at = ${newExpiresAt}
        WHERE id = ${enrollmentId}
      `);

      const result = await storage.db.execute(sql`
        SELECT ce.*, c.name as course_name, c.description as course_description, c.image_url as course_image_url
        FROM course_enrollments ce
        JOIN courses c ON ce.course_id = c.id
        WHERE ce.id = ${enrollmentId}
      `);

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating course enrollment:", error);
      res.status(500).json({ message: "Failed to update course enrollment" });
    }
  });

  // Remove a user from a course (admin)
  app.delete("/api/admin/course-enrollments/:enrollmentId", requireAdmin, async (req, res) => {
    try {
      const { enrollmentId } = req.params;

      await storage.db.execute(sql`
        DELETE FROM course_enrollments WHERE id = ${enrollmentId}
      `);

      res.json({ success: true });
    } catch (error) {
      console.error("Error removing course enrollment:", error);
      res.status(500).json({ message: "Failed to remove course enrollment" });
    }
  });

  // Bulk enroll multiple users in a course (admin)
  app.post("/api/admin/courses/:courseId/bulk-enroll", requireAdmin, async (req, res) => {
    try {
      const { courseId } = req.params;
      const { userIds, expiresAt } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "User IDs array is required" });
      }

      const results = { enrolled: 0, skipped: 0, errors: 0 };

      for (const userId of userIds) {
        try {
          // Check if already enrolled
          const existingEnrollment = await storage.db.execute(sql`
            SELECT * FROM course_enrollments 
            WHERE course_id = ${courseId} AND user_id = ${userId}
          `);

          if (existingEnrollment.rows.length > 0) {
            results.skipped++;
            continue;
          }

          // Create enrollment
          const enrollmentId = `enrollment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          if (expiresAt) {
            await storage.db.execute(sql`
              INSERT INTO course_enrollments (id, course_id, user_id, status, progress_percentage, enrolled_at, expires_at)
              VALUES (${enrollmentId}, ${courseId}, ${userId}, 'active', 0, NOW(), ${new Date(expiresAt)})
            `);
          } else {
            await storage.db.execute(sql`
              INSERT INTO course_enrollments (id, course_id, user_id, status, progress_percentage, enrolled_at)
              VALUES (${enrollmentId}, ${courseId}, ${userId}, 'active', 0, NOW())
            `);
          }
          
          results.enrolled++;
        } catch (error) {
          console.error(`Error enrolling user ${userId}:`, error);
          results.errors++;
        }
      }

      res.json(results);
    } catch (error) {
      console.error("Error bulk enrolling users:", error);
      res.status(500).json({ message: "Failed to bulk enroll users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
