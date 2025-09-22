# Overview

This project is a 6-week postnatal fitness web application, "Your Postpartum Strength Recovery Program," designed for mothers 6 weeks to 6 years postpartum. It offers a comprehensive core rehabilitation program with educational content, structured workout plans, YouTube video integration, progress tracking, and administrative functionalities. The application features a cohesive pink brand color scheme, mobile-responsive design, and a premium visual aesthetic focusing on consistent navigation and UI alignment. The business vision is to provide a supportive and effective platform for postpartum recovery, tapping into the market for specialized women's health and fitness.

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