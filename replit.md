# Overview

This project is a 6-week postnatal fitness web application, "Your Postpartum Strength Recovery Program," designed for mothers 6 weeks to 6 years postpartum. It offers a comprehensive core rehabilitation program with educational content, structured workout plans, YouTube video integration, progress tracking, and administrative functionalities. The application features a cohesive pink brand color scheme, mobile-responsive design, and a premium visual aesthetic focusing on consistent navigation and UI alignment. The business vision is to provide a supportive and effective platform for postpartum recovery, tapping into the market for specialized women's health and fitness.

# Recent Updates (September 2025)

## Latest Updates (September 24, 2025)

### Simplified Purchase Section UI (September 24, 2025) - COMPLETED
- **Clean Design Philosophy**: Redesigned with a "simple and cool" approach removing excessive visual effects for better usability
- **Minimal Card Layout**: Clean white cards with subtle borders and shadow effects for professional appearance
- **Organized Information Grid**: Program details displayed in a clean grid layout with pink accent icons for visual consistency
- **Clear Progress Tracking**: Simple progress bar with clean percentage display and readable text
- **Streamlined Equipment Display**: Equipment requirements shown in a subtle gray background with minimal styling
- **Simple Action Button**: Clean "Continue Program" button with pink branding and subtle hover effects
- **Improved Readability**: Enhanced typography hierarchy with better spacing and contrast
- **Mobile-Optimized**: Responsive design that works perfectly across all device sizes
- **Performance Focused**: Removed heavy animations and effects for faster loading and better accessibility
- **Technical Implementation**: Maintained all functionality while significantly reducing visual complexity

### Comprehensive Profile Personalization (September 24, 2025)
- **Fitness & Health Information Section**: Added extensive personalization fields for postpartum-specific fitness customization
- **Profile Fields Added**: 
  - Fitness Level (Beginner, Intermediate, Advanced)
  - Delivery Type (Vaginal, C-section, Both, Prefer not to say)
  - Number of Children (1-5+ children)
  - Breastfeeding Status (Yes exclusively, Partially, No, Prefer not to say)
  - Medical Clearance checkbox for healthcare provider approval
  - Available Equipment multi-select grid (12 equipment options including resistance bands, dumbbells, yoga mat, etc.)
  - Workout Frequency (1-2 days to daily options)
  - Preferred Workout Time (Morning, Afternoon, Evening, Flexible)
  - Personal Fitness Goals (text area for custom goals)
  - Physical Limitations/Concerns (text area for health considerations)
- **Data Persistence**: All fields properly save to localStorage and integrate with existing profile system
- **Personalization Foundation**: Comprehensive data collection enables future workout customization based on individual needs, equipment availability, and recovery considerations

### Program Cover Image Update
- **CARCS Program Branding**: Updated "Your Postpartum Strength Recovery Program" cover image with new professional branding featuring "POSTNATAL pregnancy WITH zoe" and "HEAL YOUR CORE - FIX, STRENGTHEN & REBUILD" messaging
- **Visual Consistency**: New cover image displays across home page, library section, and all program references
- **Database Sync**: Updated both in-memory storage and PostgreSQL database with new image path `/assets/Screenshot 2025-09-24 at 10.19.38_1758689399488.png`

### Deployment Infrastructure Fixes (September 23-24, 2025)
- **Critical Static Asset Issue**: Resolved persistent deployment problem where published Replit URL showed blank pages due to failed React asset loading
- **Root Cause Identified**: Static file serving configuration was using incorrect path resolution from `import.meta.dirname` when server runs from `dist/index.js`
- **Path Resolution Fix**: Corrected `serveStatic` function in `server/vite.ts` to use direct path `path.resolve(import.meta.dirname, "public")` instead of relative `../dist/public`
- **Production Validation**: Fixed both local production server testing and published deployment asset serving
- **Server Architecture**: Ensured proper separation between development (Vite HMR) and production (Express static serving) modes

## What's Next Tab Completion
- **Topic 2 "Red Flag Movements to Avoid"**: Added comprehensive content with professional table format detailing 6 critical movements to avoid during recovery, including crunches, planks, twisting exercises, and impact activities with clear explanations for each restriction.
- **Topic 3 "Return to Impact Readiness Test"**: Implemented complete assessment protocol with 7-test evaluation table covering core breath activation, single leg stand, glute bridges, sit-to-stand, forward hops, jogging, and jumping jacks with specific pass criteria for safe return to high-impact activities.
- **Topic 4 "Progress Tracker"**: Created downloadable PDF functionality featuring a comprehensive 6-week tracking table with 7 measurement categories (DR gap, core connection, pelvic floor symptoms, posture/back discomfort, energy level, workout completion, and notes/wins) optimized for printing and manual completion.

## Visual Design Enhancements  
- **Nutrition Card Consistency**: Updated all 8 nutrition strategy cards in Topic 2 to have border colors that match their respective header colors (pink, blue, green, brown, light pink) for improved visual cohesion and category differentiation.
- **PDF Generation**: Implemented reliable jsPDF-based progress tracker with proper A4 landscape formatting, professional table styling, and optimized column widths to prevent content cutoff.

## Nutrition Section Styling Overhaul (September 2025)
- **Badge Design Modernization**: Converted all nutrition badges in Topics 2 and 3 from filled backgrounds to clean thin-bordered design for a modern, professional appearance
- **Enhanced Readability**: Updated all badge text colors to darker shades for improved contrast and readability across all categories:
  - Pink badges: Changed to darker pink (#8b0040) 
  - Blue badges: Updated to darker blue (#5e73c4)
  - Green badges: Enhanced to darker green (#7fb030)
  - Brown badges: Improved to darker brown (#8b7355)
  - Light pink badges: Adjusted to darker light pink (#d1507a)
- **Text Shadow Removal**: Eliminated all text shadows from card titles and descriptions for crisp, clean typography
- **Color Coordination**: Updated card titles and descriptions to use darker readable colors that perfectly match their respective card themes
- **Pink Card Optimization**: Enhanced pink cards (COLLAGEN SUPPORT, HEALTHY FATS, PALM-SIZED PROTEIN) with bright pink badges (#f2038b) and white text for optimal contrast and readability

## WhatsApp Community Integration
- **Promotional Strategy**: Implemented comprehensive promotional campaign with dismissible banners appearing during tab navigation and promotional cards in Welcome section
- **Mobile UI Optimization**: Enhanced mobile responsiveness with improved spacing, text sizing, and touch-friendly buttons for better user experience on mobile devices  
- **Support Integration**: Added WhatsApp Community support option in the Support section under hamburger menu, providing users with an additional support channel alongside email support
- **Z-Index Layering Fix**: Resolved mobile UI conflict where promotional banners appeared above hamburger menu by adjusting z-index hierarchy (banners: z-30, menu: z-50) ensuring proper navigation accessibility

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

### Deployment Architecture
- **Development Mode**: Uses Vite dev server with HMR for fast development iterations
- **Production Mode**: Express.js serves pre-built static assets from `dist/public` directory
- **Asset Management**: Vite bundles all frontend assets with proper fingerprinting for cache optimization
- **Static File Serving**: Configured Express middleware correctly handles asset requests in production environment

# External Dependencies

- **Database**: PostgreSQL (managed by Neon Database via `@neondatabase/serverless` driver)
- **Deployment Platform**: Replit
- **Typography**: Google Fonts
- **Video Integration**: YouTube API (for embedding and linking workout videos)