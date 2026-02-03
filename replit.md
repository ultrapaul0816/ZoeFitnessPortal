# Overview
"Your Postpartum Strength Recovery Program" is a web application providing a 6-week postnatal fitness program for mothers. It offers core rehabilitation, educational content, structured workouts, progress tracking, and community features. The platform is designed for a premium, mobile-responsive user experience with a consistent pink brand theme and is evolving into a multi-course learning system. Its primary purpose is to provide a supportive and effective platform for postpartum recovery, focusing on women's health and fitness.

# User Preferences
Preferred communication style: Simple, everyday language.

# System Architecture
## UI/UX
The frontend uses React, TypeScript, Vite, shadcn/ui, and TailwindCSS, featuring a premium aesthetic with a pink brand theme, gradients, and rounded corners. The design is mobile-first with responsive desktop optimization using Tailwind's `lg:` breakpoint (1024px+). Desktop layout features a two-column design (8-column main content + 4-column sidebar) with larger typography, bigger video thumbnails, and a sticky sidebar for quick access to Zoe's tips, community, and progress stats. A fixed bottom navigation bar provides quick access to core features on mobile. The application is also installable as a Progressive Web App (PWA) with offline support and update notifications.

## Frontend
State management is handled by TanStack Query, routing by wouter, and forms use React Hook Form with Zod validation. Performance is optimized with lazy loading and client-side image compression.

## Backend
The backend is an Express.js and TypeScript RESTful API with a modular structure, centralized error handling, and request logging. It implements session-based authentication with role-based access control. The admin panel offers comprehensive user management, program enrollment controls, an Analytics Dashboard, and email campaign analytics.

## Data Storage
PostgreSQL, accessed via Drizzle ORM, stores users, fitness programs, workouts, enrollments, community posts, notifications, and user personalization data.

## Authentication & Authorization
Session-based authentication uses `express-session` with PostgreSQL for 30-day persistent sessions via secure HTTP-only cookies. Passwords are bcrypt-hashed. Role-based access control differentiates users and administrators. Mandatory acceptance of terms and health disclaimers is integrated, alongside rate limiting and robust input validation. A 6-digit OTP email login option is also available.

## Core Features
The application provides a 6-week program with detailed exercises, coach notes, and YouTube video integration. It includes a "What's Next Tab" with a PDF progress tracker, a modernized Nutrition section, and extensive profile personalization. Secure before/after photo uploads are handled via Cloudinary. An Instagram-style Community Feed supports photo uploads, filtering, likes, comments, and sharing.

## Workout & Progress Tracking
The "Today's Workout Feature" offers an immersive experience with inline YouTube video playback, exercise-by-exercise tracking, "Zoe's Personalized Check-in" for limited workout swaps, and progress indicators. The 6-week program requires completion of 4 core workouts per week, plus 2 cardio days and 1 rest day, with progress shown through badges and visual indicators. Workout content is database-driven, allowing admin management.

## AI Coach
"Ask Zoe AI Coach" is an AI-powered chat interface using OpenAI, providing personalized coaching based on user profile, workout history, program content, and progress. The "ZoeEncouragement Component" displays context-aware motivational messages throughout the app.

## User Onboarding & Personalization
Users can select fitness goals during onboarding, which are used to personalize the experience and Zoe's coaching. A "First-Time User Tour" guides new users through the app's key features.

## Multi-Course Management System
The platform supports multiple courses with a flexible structure. Admin tools include an "Admin Course Builder" for managing courses, modules, sections, and content items. It supports five content types, AI-powered content generation, and content templates. A "Structured Workout Builder" allows detailed workout creation. The system includes a "Master Exercise Library" and a "Safe Archive Pattern" for data preservation. User-facing features include dashboard course cards, a "My Courses" page, and a "Course Viewer." Admins can manage user course enrollments with configurable durations. The original 6-week program has been migrated to this new system as "Heal Your Core."

## Wellness Tracking & Insights
A "Dual Check-in System" includes daily mood/energy check-ins and detailed workout completion tracking. The dashboard displays weekly summaries, check-in streaks, and mood insights. Admin features include "Community Mood & Energy" analytics.

## User Activity Tracking
The platform automatically tracks user activity for engagement analytics, including page views, feature usage, login frequency, and session activity. A dedicated "Activity & Engagement" card in the admin dashboard provides aggregated and individual user activity insights.

# External Dependencies
-   **Database**: PostgreSQL
-   **Deployment**: Replit
-   **Typography**: Google Fonts
-   **Video**: YouTube API
-   **PDF Generation**: jsPDF
-   **Image Storage**: Cloudinary
-   **Music**: Spotify Web API (via Replit Connector)
-   **AI**: OpenAI (via Replit AI Integrations)