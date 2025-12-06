# Overview
"Your Postpartum Strength Recovery Program" is a 6-week postnatal fitness web application for mothers 6 weeks to 6 years postpartum. It offers a core rehabilitation program, educational content, structured workouts, progress tracking, and administrative tools. The application aims to provide a supportive and effective platform for postpartum recovery, focusing on women's health and fitness with a premium, mobile-responsive user experience and a consistent pink brand theme. The platform is evolving into a multi-course learning system.

# User Preferences
Preferred communication style: Simple, everyday language.

# System Architecture
## UI/UX
The frontend uses React, TypeScript, Vite, shadcn/ui, and TailwindCSS, featuring a premium aesthetic with a pink brand theme, gradients, and rounded corners. It emphasizes mobile responsiveness with accessible notifications, scrollable dialogs, and floating action buttons. Key UI elements include advanced tab navigation, an FAQ, and consistent blue styling for video links.

## Frontend
State management is handled by TanStack Query, routing by wouter, and forms use React Hook Form with Zod validation. Performance is optimized with lazy loading and client-side image compression.

## Backend
The backend is an Express.js and TypeScript RESTful API with a modular structure, centralized error handling, and request logging. It implements session-based authentication with role-based access control. The admin panel offers comprehensive user management, program enrollment controls, and an Analytics Dashboard providing macro-level insights and email campaign analytics using recharts. Promotional content visibility is dynamically controlled by user subscription.

## Data Storage
PostgreSQL, accessed via Drizzle ORM, is the primary database, storing users, fitness programs, workouts, enrollments, community posts, notifications, and extensive user personalization data. Critical user profile data is persisted, with a one-time migration logic for existing localStorage data.

## Authentication & Authorization
Session-based authentication uses `express-session` with PostgreSQL for 30-day persistent sessions via secure HTTP-only cookies. Passwords are bcrypt-hashed. Role-based access control differentiates users and administrators. Mandatory acceptance of terms and health disclaimers is integrated into the login flow. Rate limiting is applied to sensitive endpoints, and robust input validation is implemented. User email fields are read-only. A 6-digit OTP email login option (expiring in 10 minutes) is also available, automatically accepting terms/disclaimers.

## Core Features
The application provides a 6-week program with detailed exercises, coach notes, and YouTube video integration, organized into collapsible, gradient-themed sections. It includes a "What's Next Tab" with a PDF progress tracker, a modernized Nutrition section, and extensive profile personalization with real-time completeness tracking. Secure before/after photo uploads are handled via Cloudinary. An Instagram-style Community Feed supports photo uploads, filtering, likes, comments, and sharing with full CRUD operations.

## Workout & Progress Tracking
**Today's Workout Feature**: Offers an immersive workout experience with program overview, YouTube previews, prominent display of reps/duration, exercise-by-exercise tracking, "Zoe's Personalized Check-in" for limited workout swaps, workout difficulty star rating, a weekly progress bar, and a "Tomorrow Preview." First-time users are greeted with a welcome screen.
**Progressive Workout Tracking**: The 6-week program requires completion of 4 core workouts per week, plus 2 cardio days and 1 rest day. Progress is shown with badges and visual indicators. A skip warning modal allows marking incomplete weeks as "skipped" while permitting preview access. Week completion triggers a celebration and unlocks the next week.
**Database-Driven Workout Content**: Workout program content is stored in PostgreSQL, allowing admins to manage details, exercises, reps, and video URLs via the admin panel. A hybrid fetch approach prioritizes database content.

## AI Coach
**Ask Zoe AI Coach**: An AI-powered chat interface using OpenAI (via Replit AI Integrations) provides personalized coaching. Zoe offers support based on user profile, workout history, full program content, and current progress, suggesting alternatives and encouraging proper form while avoiding medical advice.

## Zoe's Personalized Voice
**ZoeEncouragement Component**: A reusable component that displays Coach Zoe's personalized encouragement, tips, and motivation throughout the app. It provides context-aware messages based on the current page (dashboard, workouts, courses, community), the user's name, and their progress. Messages include daily tips, workout motivation, and celebratory acknowledgments.

## User Goals & Personalization
**Fitness Goals Collection**: Users can select their fitness goals during onboarding and profile setup. Goals include:
- Rebuild Core Strength
- Boost Energy
- Reduce Back Pain  
- Feel Confident Again
- Improve Flexibility

Goals are stored in the user's database profile and will be used to personalize the experience, workout recommendations, and Zoe's coaching messages.

## Admin Preview Mode
**Admin Preview Page**: Administrators can preview the app as users would see it on mobile devices. The feature includes:
- Device frame simulation (iPhone 14 Pro, iPhone SE, Android)
- Portrait/landscape orientation toggle
- Quick navigation to key pages (dashboard, courses, community)
- Live preview of the actual app within a simulated mobile frame

## Communication & Engagement
**Email Automation & Campaigns**: Includes email campaign management with a database-stored template library, dynamic variable replacement, open tracking, audience targeting, test emails, and scheduling. An Email Analytics Dashboard provides performance metrics. Seven trigger-based email automation rules support welcome, workout congratulations, program completion, incomplete signup reminders, and cascading re-engagement based on inactivity.
**Spotify Workout Music Integration**: Users can access curated workout playlists via a mini player widget in the "Today's Workout" view, utilizing Replit's Spotify Connector for OAuth and offering 6 weekly curated playlists.

## Wellness Tracking & Insights
**Dual Check-in System**:
1.  **Daily Mood Check-in**: A 2-step flow (mood, then energy level) auto-shows daily on login.
2.  **Workout Completion Check-in**: Detailed performance logging with 7 tracking points (completion, breathing, water, cardio, gratitude, challenges), accessible via a floating action button.
**Weekly Summary & Mood Insights**: The dashboard displays check-in streaks, progress bars for water and cardio, consistency percentages, and a visual calendar. A collapsible "Mood & Energy" card shows top mood, average energy level with trends, and a 7-day mood history strip. A one-click WhatsApp sharing feature generates a pre-formatted weekly summary message.
**Admin Check-in Analytics**: The admin dashboard includes a "Community Mood & Energy" card showing aggregated mood distribution, average energy levels, and energy trend charts across all users.

## Multi-Course Management System
The platform supports multiple courses with a flexible structure.
**Admin Tools**:
-   **Admin Course Builder**: Enterprise-grade interface for managing courses with actions like Preview, Modules, Edit, Publish/Unpublish, Archive.
-   **Course Editor**: Interface for assigning and ordering modules, course image upload, and preview.
-   **Course Preview**: Full user-view preview with a Content Audit tab for completeness status.
-   **Module Library**: Reusable content modules (Educational, Workout, FAQ, Progress, Nutrition) with color themes and professional table/grid views.
-   **Module Section Editor**: Full CRUD interface for sections within modules, with reordering and inline content management.
-   **Content Item Editor**: Supports 5 content types (Videos, Text, PDF Downloads, Exercises, Structured Workouts) with specific data fields and colored gradient headers. Features AI-powered content generation using OpenAI to write descriptions in Zoe's encouraging voice.
-   **Content Templates**: Quick-start templates for common content types (Welcome Video, Workout Introduction, Educational Tip, Progress Checkpoint, Nutrition Guide, Cooldown & Stretch) that pre-fill forms with Zoe-styled content.
-   **Structured Workout Builder**: Complete workout builder supporting warmup/main workout/cooldown phases, multiple rounds, drag-and-drop exercise sequencing, and definable rounds/rests/duration.
-   **Master Exercise Library**: Centralized exercise management with unique IDs, name, description, video URL, default reps/duration, category, muscle groups, difficulty, and coach notes.
-   **Safe Archive Pattern**: Non-destructive "Archive" actions preserve data.
-   **API Routes**: Complete REST API for courses, modules, sections, content items, exercises, and course-module mappings with admin authentication.
-   **Flexible Course Structure**: Allows varying weekly structures, not limited to 6 weeks.
-   **Free Navigation**: Users can freely navigate content without locked progression, and educational modules are optional.

**User-Facing Course Experience**:
-   **My Courses Page**: Displays enrolled and browsable courses with progress tracking.
-   **Course Viewer**: Full course content display with expandable modules/sections and rich structured workout displays.
-   **Navigation**: "My Courses" link added to profile settings menu.

**Heal Your Core Course Migration**: The original 6-week program has been migrated to the new course system as "Heal Your Core" course, comprising 11 modules and 39 exercises.

# External Dependencies
-   **Database**: PostgreSQL (Neon Database for production)
-   **Deployment**: Replit
-   **Typography**: Google Fonts
-   **Video**: YouTube API
-   **PDF Generation**: jsPDF
-   **Image Storage**: Cloudinary
-   **Music**: Spotify Web API (via Replit Connector)
-   **AI**: OpenAI (via Replit AI Integrations)