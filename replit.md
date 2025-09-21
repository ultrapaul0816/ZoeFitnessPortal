# Overview

This is a fitness application called "Your Postpartum Strength Recovery Program" - a comprehensive 6-week postnatal fitness web application specifically designed for mothers 6 weeks to 6 years postpartum. The application features a complete core rehabilitation program with educational content, structured workout plans, YouTube video integration, progress tracking, and admin panel functionality. The platform uses a cohesive pink brand color scheme (#EC4899) with mobile-responsive design and premium visual appeal, focusing on consistent navigation across all pages and proper UI alignment.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes (September 2025)

## Major Program Implementation
- **Comprehensive 6-Week Program Structure**: Implemented complete postnatal fitness program with detailed exercise tables, coach notes, safety tips, and progressive unlock system
- **YouTube Video Integration**: All exercise videos properly linked with clickable buttons and playlist functionality for seamless workout experience
- **Program Organization**: Successfully moved 6-week program content from "What's Next" tab to dedicated "Programs" tab for better user experience
- **Week 1 Complete**: Detailed program structure with:
  - RECONNECT & RESET phase with breathing exercises and core rehabilitation
  - 5 structured exercises with YouTube video links and proper repetition guidance
  - Equipment requirements (mini band, small Pilates ball, mat)
  - Coach's notes and safety precautions
  - Program introduction video integration
- **Weeks 2-6 Structure**: Progressive unlock system with coming soon placeholders for future program phases

## UI/UX Improvements
- **Consistent Navigation**: Clickable logo across all pages (Dashboard, My Library, Heal Your Core) with proper hover effects
- **Mobile-Responsive Design**: Proper alignment and responsive padding structure for all screen sizes
- **Pink Brand Theme**: Cohesive #EC4899 color scheme with gradient effects and shadows
- **Professional Layout**: Premium visual appeal with rounded corners (rounded-2xl), gradient dividers, and contained hover effects

## Technical Fixes
- **JSX Structure**: Resolved syntax errors and duplicate content issues that were preventing application loading
- **Link Component Integration**: Fixed import errors and navigation functionality across all pages
- **API Integration**: My Library now uses real API endpoints (/api/member-programs/:userId) instead of static mock data
- **Code Organization**: Removed unused components and streamlined codebase structure

## Current Status
- **Application**: Successfully running on port 5000 with no critical errors
- **Database**: PostgreSQL integration working with proper user authentication and progress tracking
- **Navigation**: Seamless flow between all tabs and sections
- **Program Access**: Real-time program enrollment and progress tracking functionality

# System Architecture

## Frontend Architecture
The client-side is built with **React** and **TypeScript**, using **Vite** as the build tool and development server. The UI is constructed with **shadcn/ui** components based on **Radix UI** primitives, styled with **TailwindCSS** for consistent design. State management is handled through **TanStack Query** (React Query) for server state and API data fetching. Routing is implemented using **wouter** for lightweight client-side navigation. Form handling uses **React Hook Form** with **Zod** validation schemas.

## Backend Architecture  
The server is built with **Express.js** and **TypeScript**, following a RESTful API design pattern. The application uses a modular route structure with centralized error handling middleware. Session management is implemented for user authentication, with role-based access control distinguishing between regular users and administrators. The server includes request logging middleware for API monitoring and debugging.

## Data Storage Solutions
The application uses **PostgreSQL** as the primary database, accessed through **Drizzle ORM** for type-safe database operations. Database schemas are defined in a shared module to ensure consistency between client and server. The data model includes users, fitness programs, workouts, member enrollments, community posts, notifications, and terms/conditions. Database migrations are managed through Drizzle Kit.

## Authentication and Authorization
Authentication is implemented with a simple session-based approach where user credentials are validated against the database. The system includes role-based access control with admin and regular user roles. New users must accept terms and conditions before accessing the platform. User sessions are managed server-side with appropriate middleware for protecting routes.

## External Service Integrations
The application integrates with **Neon Database** as the managed PostgreSQL provider using the `@neondatabase/serverless` driver. The platform is configured for deployment on **Replit** with specific development tooling and error overlays. Google Fonts integration provides custom typography options for the user interface.