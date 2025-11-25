# Overview
"Your Postpartum Strength Recovery Program" is a 6-week postnatal fitness web application targeting mothers 6 weeks to 6 years postpartum. It offers a core rehabilitation program with educational content, structured workouts, YouTube video integration, progress tracking, and administrative tools. The application features a consistent pink brand theme, mobile-responsive design, and a premium visual aesthetic. Its purpose is to provide a supportive and effective platform for postpartum recovery, addressing a niche in women's health and fitness.

# User Preferences
Preferred communication style: Simple, everyday language.

# System Architecture
## Frontend
Built with React and TypeScript, using Vite, shadcn/ui (Radix UI), and TailwindCSS. State management uses TanStack Query, and routing is handled by wouter. Forms use React Hook Form with Zod validation. The UI/UX emphasizes a premium visual aesthetic with a pink brand theme, gradients, rounded corners, and mobile responsiveness. Key features include advanced tab navigation, an FAQ, enhanced program headers, and consistent blue styling for video links. Performance is optimized with lazy loading (React.lazy(), Suspense) for heavy pages and dynamic imports for libraries like jsPDF. Images are compressed client-side before upload to optimize performance. Mobile UX is enhanced with accessible toast notifications, scrollable dialogs, and floating action buttons.

## Backend
An Express.js and TypeScript RESTful API with a modular route structure, centralized error handling, and request logging. It uses session-based authentication with role-based access control. WhatsApp Community support access is duration-based. The admin panel includes a comprehensive user management system with separate view/edit dialogs, dashboard statistics (Total, Active, Expiring Soon members), detailed controls for program enrollment, WhatsApp access, and account management, and a comprehensive Analytics Dashboard. The Analytics Dashboard provides macro-level insights into demographics (country distribution, postpartum stages, Instagram handles collected), engagement metrics (active/dormant users by time period), program performance (completion rates, workout statistics, mood/challenge ratings), community health (posts, likes, comments, participation rates, top categories and contributors), and business metrics (WhatsApp adoption, program completions, average completion time). The Email Campaign Analytics provides campaign-specific insights including total campaigns sent, total email opens, average open rates, template performance statistics (sends, opens, open rates by template type), and recent campaign history with detailed metrics. All analytics visualizations use recharts with bar charts, pie charts, and responsive layouts. Account creation includes mandatory acceptance of terms and health disclaimers. Promotional content visibility for WhatsApp support is dynamically controlled based on user subscription status.

## Data Storage
PostgreSQL, accessed via Drizzle ORM, is the primary database. It stores users, fitness programs, workouts, enrollments, community posts, and notifications. User profiles store extensive personalization data. Critical user profile data (country, bio, Instagram handle, postpartum weeks, last login) is persisted in the database, taking precedence over localStorage, with a one-time migration logic for existing localStorage data. Program enrollments track `completionPercentage` and `completedAt`.

## Authentication & Authorization
Session-based authentication with express-session and PostgreSQL storage (connect-pg-simple), providing persistent 30-day sessions with secure HTTP-only cookies. Bcrypt-hashed passwords (cost factor 10) with strength validation. Includes a transitional migration guard for legacy passwords. Role-based access control differentiates users and administrators. Mandatory acceptance of terms and health disclaimers is integrated into the login flow. Rate limiting protects login (15 attempts/15min), password reset (3 attempts/15min), and admin endpoints. Robust input validation is implemented for phone numbers, emails, dates, names, file uploads (mime type, size, single file), and WhatsApp duration. User email fields are read-only to prevent client-side modifications. One-time migration of localStorage profile data to database on first session login. Dashboard verifies session on mount and redirects to login if session is invalid or expired.

**Login with OTP**: Users can log in via a 6-digit OTP code sent to their email. The login page now features two equally prominent buttons: "Sign In with Password" and "Sign In with Email Code" (OTP). After entering the 6-digit code, users are logged in directly. A "Reset password instead?" option is available for those who need to change their password. OTP codes expire in 10 minutes and are stored in the `password_reset_codes` table. The system auto-accepts terms/disclaimer when logging in via OTP to streamline the process.

**Activity Tracking**: The system tracks user activities (logins, workout completions) in the `activity_logs` database table. The admin dashboard's Overview tab includes a real-time Activity Feed showing recent member activities with timestamps, color-coded by activity type (blue for logins, green for workout completions, pink for workout starts). The feed auto-refreshes every 30 seconds. Each activity item has a quick-action dropdown menu for viewing member details and sending targeted emails directly.

**Actionable Dashboard**: The admin Overview tab features a "Needs Attention" section with three actionable cards:
- **Inactive Members** (orange): Shows members who haven't logged in for 7+ days with one-click re-engagement email sending
- **No Progress Photos** (purple): Shows active members without uploaded progress photos with one-click photo reminder email
- **Recent Completers** (green): Shows workout completions in the last 48 hours with one-click congratulations email

Each card displays up to 5 members with quick-send email buttons. The Activity Feed items also feature hover-activated dropdown menus with options to view member profiles and send various email types (congratulations, re-engagement, photo reminder).

## Technical Implementations
The application provides a 6-week program with detailed exercises, coach notes, and YouTube video integration. Content is organized into collapsible, gradient-themed sections. Features include a "What's Next Tab" with a PDF progress tracker, a modernized Nutrition section, extensive profile personalization, and real-time profile completeness tracking with a progress banner. Program access is managed via both purchase and admin enrollment records. A "Progress Tracker" tab allows secure before/after photo uploads via Cloudinary. An Instagram-style Community Feed supports photo uploads, categories, week-based filtering, likes, comments, and Instagram sharing, with full CRUD operations and Cloudinary integration.

**Today's Workout Feature**: A self-contained, immersive workout experience on the dashboard:
- **Program Overview**: Each workout starts with clear info - focus area, duration (e.g., "15-20 minutes"), exercise count, and "How it works" instructions explaining what to expect
- **YouTube Thumbnail Previews**: Each exercise shows a clickable video thumbnail that opens an embedded player dialog
- **Prominent Reps/Duration**: Exercise instructions displayed in large, bold pink text on their own line for clarity
- **Exercise-by-Exercise Tracking**: Checkbox for each exercise to track completion within the workout
- **Zoe's Personalized Check-in**: Instead of a generic "Swap" button, Zoe encourages consistency with messaging like "I don't usually let my mamas skip their scheduled workout!" while offering limited flexibility (2 swaps per week max)
- **Star Rating**: After completing all exercises, rate the workout difficulty (1-5 stars) before saving
- **Weekly Progress Bar**: Visual header showing X/Y workouts completed this week
- **Tomorrow Preview**: "Peek at Tomorrow's Workout" shows upcoming exercises
- **First-Time User Flow**: New users see a welcome screen explaining Week 1 before starting their first workout
- **Simplified Dashboard**: Program card de-emphasized to a single "View Full Program" button since enrollment is automatic
- The `/api/workout-progress/:userId` endpoint calculates user's current position

**Ask Zoe AI Coach**: An AI-powered chat interface where users can get personalized coaching:
- Powered by OpenAI via Replit AI Integrations (no API key needed, uses Replit credits)
- Zoe personality: warm, supportive, knowledgeable about postpartum recovery
- **Comprehensive context includes**:
  - User profile (name, postpartum weeks, country, bio)
  - Complete workout history with dates and ratings (last 10 completions)
  - Full 6-week program content (all exercises, reps, video URLs for every week)
  - Current progress (week, day, total completions)
- Context-aware: knows user's current week, day, workout progress, and exercises
- Quick prompts: "I'm feeling tired today", "Suggest a lighter workout", "How do I do this exercise correctly?", "What's the goal of this week?"
- Suggests gentler alternatives when users are tired/stressed
- Encourages proper form and watching exercise videos with direct video links
- Never gives medical advice, always encourages consulting healthcare providers
- Uses user's first name for personalized responses
- The `/api/ask-zoe` endpoint handles AI conversations with full workout context

**Database-Driven Workout Content**: Workout program content is now stored in PostgreSQL with two tables: `workout_program_content` (program metadata, coach notes, colors, equipment as JSONB) and `workout_content_exercises` (individual exercises with sectionType, orderNum, name, reps, URL). A hybrid fetch approach is used where the frontend tries the database API first (`/api/workout-content`) and falls back to static data (`client/src/data/workoutPrograms.ts`) if unavailable. Admin users can manage workout content through the "Workouts" tab in the admin panel, including editing program details, exercise names, reps, video URLs, and adding/deleting exercises.

Email campaign management includes a template library stored in the PostgreSQL database with reusable templates (Welcome, Re-engagement, Photo Reminder, Workout Congratulations, Completion Celebration, Complete Your Signup), dynamic variable replacement via `generateUserVariables()` and `replaceTemplateVariables()` utilities, email open tracking via pixel tracking, audience targeting with filters (including Pending Signup filter for incomplete registrations), test email functionality, campaign scheduling for future delivery, and a comprehensive Email Analytics Dashboard with performance metrics, template statistics, and campaign history visualization. **Database templates are the single source of truth** - both dashboard quick-send actions and email campaigns fetch templates from the `email_templates` table and use shared template variable processing.

Email automation includes 7 trigger-based rules:
- **Trigger-based (instant)**: Welcome Email (user signup), Workout Congratulations (workout completion, 24-hour cooldown per user), Completion Celebration (program completion), Incomplete Signup Reminder (3 days after account if terms not accepted)
- **Scheduled (cascading)**: Re-engagement emails at 7, 14, and 30 days of inactivity with cascade logic - 14-day requires 7-day sent at least 7 days prior, 30-day requires 14-day sent at least 16 days prior. Each re-engagement email only sends once per user.
Storage methods `checkReengagementEligibility()`, `checkWorkoutEmailCooldown()`, and `hasReceivedAutomationEmail()` enforce the cascade logic and cooldowns. Automation rules can be enabled/disabled and customized by admin.

# External Dependencies
- **Database**: PostgreSQL (managed by Neon Database)
  - Development: Uses DATABASE_URL (Replit-managed)
  - Production: Uses PROD_DATABASE_URL (external Neon database with real user data)
- **Deployment**: Replit (autoscale configuration)
- **Typography**: Google Fonts
- **Video**: YouTube API
- **PDF Generation**: jsPDF
- **Image Storage**: Cloudinary