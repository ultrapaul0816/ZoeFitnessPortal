# Overview
"Your Postpartum Strength Recovery Program" is a 6-week postnatal fitness web application designed for mothers 6 weeks to 6 years postpartum. It offers a core rehabilitation program, educational content, structured workouts, progress tracking, and administrative tools. The application aims to provide a supportive and effective platform for postpartum recovery, focusing on women's health and fitness with a premium, mobile-responsive user experience and a consistent pink brand theme.

# User Preferences
Preferred communication style: Simple, everyday language.

# System Architecture
## Frontend
The frontend is built with React and TypeScript, leveraging Vite, shadcn/ui (Radix UI), and TailwindCSS for a premium visual aesthetic featuring a pink brand theme, gradients, and rounded corners. State management is handled by TanStack Query, and routing by wouter. Forms utilize React Hook Form with Zod validation. Key UI/UX features include advanced tab navigation, an FAQ, enhanced program headers, and consistent blue styling for video links. Performance is optimized with lazy loading and client-side image compression. Mobile UX is enhanced with accessible notifications, scrollable dialogs, and floating action buttons.

## Backend
The backend is an Express.js and TypeScript RESTful API with a modular structure, centralized error handling, and request logging. It implements session-based authentication with role-based access control. The admin panel offers comprehensive user management, dashboard statistics (Total, Active, Expiring Soon members), detailed controls for program enrollment and WhatsApp access, and an Analytics Dashboard providing macro-level insights into demographics, engagement, program performance, community health, and business metrics. Email campaign analytics are also integrated, using recharts for visualizations. Dynamic control of promotional content visibility is based on user subscription status.

## Data Storage
PostgreSQL, accessed via Drizzle ORM, is the primary database, storing users, fitness programs, workouts, enrollments, community posts, notifications, and extensive user personalization data. Critical user profile data is persisted in the database, with a one-time migration logic for existing localStorage data.

## Authentication & Authorization
The system uses session-based authentication with `express-session` and PostgreSQL storage for persistent 30-day sessions with secure HTTP-only cookies. Passwords are bcrypt-hashed with strength validation. Role-based access control differentiates users and administrators. Mandatory acceptance of terms and health disclaimers is integrated into the login flow. Rate limiting is applied to login, password reset, and admin endpoints. Robust input validation is implemented for all critical fields and file uploads. User email fields are read-only.
Login can also be performed via a 6-digit OTP code sent to the user's email, with a "Sign In with Email Code" option alongside "Sign In with Password." OTPs expire in 10 minutes and automatically accept terms/disclaimers.

## Technical Implementations
The application features a 6-week program with detailed exercises, coach notes, and YouTube video integration, organized into collapsible, gradient-themed sections. It includes a "What's Next Tab" with a PDF progress tracker, a modernized Nutrition section, extensive profile personalization with real-time completeness tracking, and secure before/after photo uploads via Cloudinary. An Instagram-style Community Feed supports photo uploads, filtering, likes, comments, and sharing, with full CRUD operations.

**Today's Workout Feature**: Provides an immersive workout experience on the dashboard including program overview, YouTube thumbnail previews, prominent display of reps/duration, exercise-by-exercise tracking, a "Zoe's Personalized Check-in" for limited workout swaps, star rating for workout difficulty, a weekly progress bar, and a "Tomorrow Preview." A welcome screen guides first-time users.

**Progressive Workout Tracking**: The 6-week program follows a structured progression where users must complete 4 core workouts per week (same exercises repeated 4x) plus 2 cardio days and 1 rest day. The Today's Workout card displays "Week X • Workout Y of 4" with day type badges (Core Workout / Cardio Day / Rest Day). Each program week shows progress badges (X/4 Complete, Skipped, or Preview) with visual indicators. A skip warning modal appears when users try to access future weeks, offering to mark incomplete weeks as "skipped" while allowing preview access. Week completion triggers a celebration dialog with confetti animation and unlocks the next week automatically.

**Ask Zoe AI Coach**: An AI-powered chat interface using OpenAI via Replit AI Integrations (no API key needed). Zoe, with a warm and supportive personality, provides personalized coaching using comprehensive context including user profile, workout history, full 6-week program content, and current progress. It suggests alternatives, encourages proper form, and avoids medical advice.

**Database-Driven Workout Content**: Workout program content is stored in PostgreSQL, allowing admins to manage program details, exercises, reps, and video URLs via the admin panel. A hybrid fetch approach prioritizes database content over static data.

**Email Automation & Campaigns**: Includes email campaign management with a database-stored template library, dynamic variable replacement, email open tracking via pixel, audience targeting, test email functionality, and campaign scheduling. A comprehensive Email Analytics Dashboard provides performance metrics. Email automation supports 7 trigger-based rules for welcome, workout congratulations, program completion, incomplete signup reminders, and cascading re-engagement emails based on inactivity, with cooldowns and eligibility checks.

**Spotify Workout Music Integration**: Users can listen to curated workout playlists via a mini player widget in the "Today's Workout" view. This integration uses Replit's built-in Spotify Connector for OAuth and offers 6 weekly curated playlists. A playlist browser displays all options, and the widget shows real-time playback state.

**Dual Check-in System**: Features two complementary wellness tracking systems:
1. **Daily Mood Check-in** (2-step flow): Auto-shows once per day on login, capturing mood ('great'/'good'/'okay'/'tired'/'struggling') and energy level (1-5 scale). Step 1 captures mood, Step 2 captures energy and auto-completes the check-in. Clean, focused UX with smooth transitions.
2. **Workout Completion Check-in**: Detailed performance logging with 7 tracking points (workout completion, breathing practice, water in liters with 2L pre-selected, cardio with 20 min default, gratitude with quick-select options, and challenges with community support messaging). Quick-select buttons for gratitude/challenges reduce friction while educational context explains mental health benefits. Accessible via floating action button.

**Weekly Summary & Mood Insights**: Dashboard displays check-in streaks with encouraging messages for new users, progress bars for water and cardio, consistency percentages, and a visual calendar. The collapsible "Mood & Energy" card (auto-collapses after 1 second) shows top mood, average energy level with trend indicators (rising/stable/dipping), and a 7-day mood history strip. A one-click WhatsApp sharing feature generates a pre-formatted weekly summary message.

**Admin Check-in Analytics**: The admin dashboard includes a "Community Mood & Energy" card showing aggregated mood distribution, average energy levels, and energy trend charts across all users. This helps administrators monitor community wellness patterns.

**Multi-Course Management System (Complete Admin Tools)**: The platform is transitioning from a single 6-week program to a multi-course learning platform. Key features include:
- **9 Database Tables**: courses, course_modules, course_module_mappings, module_sections, content_items, course_enrollments, user_module_progress, user_content_completion, **exercises**
- **Admin Course Builder** (`/admin/courses`): Enterprise-grade interface with visible action buttons (Modules, Edit, Publish/Unpublish, Archive) instead of dropdown menus. Shows course creation dates and timestamps. Courses use standardized `durationWeeks` (integer) instead of free text for consistency.
- **Course Editor** (`/admin/courses/:courseId`): Interface for assigning and ordering modules within a course. Features checkbox multi-select for adding modules, visual ordering with drag handles, and quick access to module sections.
- **Module Library** (`/admin/modules`): Reusable content modules (Educational, Workout, FAQ, Progress, Nutrition) with color themes that can be shared across multiple courses. Defaults to professional table view with columns for Name, Type, Sections (clickable), Items (clickable), Status, and Actions. Grid view also available via toggle.
- **Module Section Editor** (`/admin/modules/:moduleId`): Full CRUD interface for managing sections within modules. Features collapsible sections, drag handles for reordering (visual only), and inline content management.
- **Content Item Editor**: Supports 4 content types - Videos (YouTube URLs), Text/Articles, PDF Downloads, and Exercises (linked from library). Each content item has title, description, duration, and type-specific data fields. Features colored gradient headers (pink for Add, blue for Edit) for clear visual distinction.
- **Master Exercise Library** (`/admin/exercises`): Centralized exercise management to prevent duplicate entries. Exercises include 4-digit display IDs (EX-0001 format) for easy identification, name, description, video URL, default reps, duration, category (Core, Breathing, Cardio, Strength, Flexibility, Pelvic Floor, Warmup, Cooldown), muscle groups, difficulty level, and coach notes. Content items can link to exercises from the library with optional overrides for reps and video URL.
- **Safe Archive Pattern**: Replaced destructive "Delete" with "Archive" actions that preserve data using `isVisible: false`. Archive confirmation dialogs explain what happens and protect active user enrollments.
- **API Routes**: Complete REST API for courses, modules, sections, content items, exercises, and course-module mappings with admin authentication
- **Flexible Course Structure**: Different programs can have different weekly structures (not hardcoded 6-week format)
- **Free Navigation**: Users can freely navigate content (not locked progression), educational modules are optional reference material

**Heal Your Core Course Migration (Completed)**:
The existing 6-week program has been migrated to the new course system:
- **Course**: "Heal Your Core" with 6-week duration, beginner level, published status
- **11 Modules**: Start Here, Understanding Your Core (7 sections with videos), Week 1-6 workout modules, Nutrition & Hydration, What Comes Next, FAQ
- **39 Exercises** in the Exercise Library: 5 breathing exercises, 34 main workout exercises with video URLs
- **Understanding Your Core Module**: 7 educational sections with matching titles and videos from static data:
  1. Breathing & Core Activation
  2. How To Breathe Properly: 360° Breathing (video)
  3. Understanding Your Core & TVA Engagement (video)
  4. How To Engage Your Core With Breathing
  5. Core Compressions & How They Help You Heal (video)
  6. Understanding the Pelvic Floor (video)
  7. Warning Signs: Doming, Coning & When to Modify (video)
- **18 Sections** across workout modules: Each week has Overview, Breathing, and Main Workout sections
- **47+ Content Items**: Exercise links with video URLs, reps, and metadata linking to the Exercise Library
- All exercises are reusable across future courses via the Exercise Library

# External Dependencies
- **Database**: PostgreSQL (Neon Database for production, Replit-managed for development)
- **Deployment**: Replit
- **Typography**: Google Fonts
- **Video**: YouTube API
- **PDF Generation**: jsPDF
- **Image Storage**: Cloudinary
- **Music**: Spotify Web API (via Replit Connector)
- **AI**: OpenAI (via Replit AI Integrations)