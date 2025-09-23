# Overview

This project is a 6-week postnatal fitness web application, "Your Postpartum Strength Recovery Program," designed for mothers 6 weeks to 6 years postpartum. It offers a comprehensive core rehabilitation program with educational content, structured workout plans, YouTube video integration, progress tracking, and administrative functionalities. The application features a cohesive pink brand color scheme, mobile-responsive design, and a premium visual aesthetic focusing on consistent navigation and UI alignment. The business vision is to provide a supportive and effective platform for postpartum recovery, tapping into the market for specialized women's health and fitness.

# Recent Updates (September 2025)

## What's Next Tab Completion
- **Topic 2 "Red Flag Movements to Avoid"**: Added comprehensive content with professional table format detailing 6 critical movements to avoid during recovery, including crunches, planks, twisting exercises, and impact activities with clear explanations for each restriction.
- **Topic 3 "Return to Impact Readiness Test"**: Implemented complete assessment protocol with 7-test evaluation table covering core breath activation, single leg stand, glute bridges, sit-to-stand, forward hops, jogging, and jumping jacks with specific pass criteria for safe return to high-impact activities.
- **Topic 4 "Progress Tracker"**: Created downloadable PDF functionality featuring a comprehensive 6-week tracking table with 7 measurement categories (DR gap, core connection, pelvic floor symptoms, posture/back discomfort, energy level, workout completion, and notes/wins) optimized for printing and manual completion.

## Visual Design Enhancements  
- **Nutrition Card Consistency**: Updated all 8 nutrition strategy cards in Topic 2 to have border colors that match their respective header colors (pink, blue, green, brown, light pink) for improved visual cohesion and category differentiation.
- **PDF Generation**: Implemented reliable jsPDF-based progress tracker with proper A4 landscape formatting, professional table styling, and optimized column widths to prevent content cutoff.

## WhatsApp Community Integration
- **Promotional Strategy**: Implemented comprehensive promotional campaign with dismissible banners appearing during tab navigation and promotional cards in Welcome section
- **Mobile UI Optimization**: Enhanced mobile responsiveness with improved spacing, text sizing, and touch-friendly buttons for better user experience on mobile devices  
- **Support Integration**: Added WhatsApp Community support option in the Support section under hamburger menu, providing users with an additional support channel alongside email support

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with React and TypeScript, using Vite for development and bundling. UI components leverage shadcn/ui (based on Radix UI) and are styled with TailwindCSS. State management for server data uses TanStack Query, while client-side routing is handled by wouter. Form management is implemented with React Hook Form and Zod for validation. The UI/UX prioritizes a premium visual appeal with a consistent pink brand theme, gradient effects, rounded corners, and mobile-responsive layouts. Key features include an advanced tab navigation system with game-like progression, a comprehensive FAQ section, and enhanced program headers and equipment displays.

## Backend Architecture
The backend is an Express.js and TypeScript RESTful API. It uses a modular route structure, centralized error handling, and request logging. Authentication is session-based, with role-based access control for users and administrators.

## Data Storage Solutions
PostgreSQL serves as the primary database, accessed via Drizzle ORM for type-safe operations. The data model includes users, fitness programs, workouts, member enrollments, community posts, notifications, and terms/conditions. Database migrations are managed with Drizzle Kit.

## Authentication and Authorization
Authentication uses a session-based approach, validating user credentials against the database. Role-based access control differentiates between regular users and administrators. New users must accept terms and conditions upon registration.

## Technical Implementations
The application features a comprehensive 6-week program structure with detailed exercises, coach notes, and safety tips. YouTube videos are integrated for exercises, with clickable buttons and playlist functionality. Content is organized into collapsible sections with distinct gradient color themes for each week, enhancing visual differentiation and user experience. Responsive design is a core principle, with separate mobile and desktop layouts for optimal viewing.

# External Dependencies

- **Database**: PostgreSQL (managed by Neon Database via `@neondatabase/serverless` driver)
- **Deployment Platform**: Replit
- **Typography**: Google Fonts
- **Video Integration**: YouTube API (for embedding and linking workout videos)