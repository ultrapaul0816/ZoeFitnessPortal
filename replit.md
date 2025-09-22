# Overview

This is a fitness application called "Your Postpartum Strength Recovery Program" - a comprehensive 6-week postnatal fitness web application specifically designed for mothers 6 weeks to 6 years postpartum. The application features a complete core rehabilitation program with educational content, structured workout plans, YouTube video integration, progress tracking, and admin panel functionality. The platform uses a cohesive pink brand color scheme (#EC4899) with mobile-responsive design and premium visual appeal, focusing on consistent navigation across all pages and proper UI alignment.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes (September 2025)

## Major Program Implementation
- **Comprehensive 6-Week Program Structure**: Implemented complete postnatal fitness program with detailed exercise tables, coach notes, safety tips, and progressive unlock system
- **YouTube Video Integration**: All exercise videos properly linked with clickable buttons and playlist functionality for seamless workout experience
- **Program Organization**: Successfully moved 6-week program content from "What's Next" tab to dedicated "Programs" tab for better user experience
- **Program 1 (Week 1) Complete**: Detailed program structure with:
  - RECONNECT & RESET phase with breathing exercises and core rehabilitation
  - 5 structured exercises with YouTube video links and proper repetition guidance
  - Equipment requirements (mini band, small Pilates ball, mat)
  - Coach's notes and safety precautions
  - Program introduction video integration
  - Pink gradient color scheme for visual identity
- **Program 2 (Week 2) Complete**: Advanced Strength & Conditioning Program with:
  - STABILITY & BREATHWORK phase with controlled movement focus
  - Core & Breath Reset Flow + 5 main exercises with YouTube video links
  - Equipment requirements (mat, breath work, patience)
  - Coach's notes and safety precautions
  - Blue/cyan gradient color scheme for visual differentiation
- **Program 3 (Week 3) Complete**: Control & Awareness Program with:
  - CONTROL & AWARENESS phase with balance and posture focus
  - Breathing exercises (supine + side lying diaphragmatic) + 6 main exercises with YouTube video links
  - Equipment requirements (resistance band light, mat, optional yoga block)
  - Coach's notes and safety precautions  
  - Green/emerald gradient color scheme for visual differentiation
- **Program 4 (Week 4) Complete**: Align & Activate Program with:
  - ALIGN & ACTIVATE phase with coordination and activation focus
  - 90 90 Box Breathing + 6 main exercises with YouTube video links
  - Equipment requirements (small Pilates ball, chair or stool, resistance band, mat)
  - Coach's notes and safety precautions
  - Purple/violet gradient color scheme for visual differentiation
- **Program 5 (Week 5) Complete**: Functional Core Flow Program with:
  - FUNCTIONAL CORE FLOW phase with real-life movement focus
  - Breathing exercises (supine diaphragmatic + side lying thoracic rotations) + 6 main exercises with YouTube video links
  - Equipment requirements (mini bands, mat, yoga block or Pilates ball, long resistance band, stool or chair)
  - Coach's notes and safety precautions
  - Teal/indigo gradient color scheme for visual differentiation
- **Program 6 (Week 6) Complete**: Foundational Strength Program with:
  - FOUNDATIONAL STRENGTH phase with capacity, endurance and resilience focus
  - 90 90 Box Breathing + 6 main exercises with YouTube video links
  - Equipment requirements (Swiss ball, small Pilates ball, mat)
  - Coach's notes and safety precautions
  - Orange/amber gradient color scheme for visual differentiation
- **Program Structure Format**: Established collapsible program series pattern for future expansion

## Program Series Format Template
Each program follows this standardized structure for consistency:

### Program Header Structure:
- **Mobile Layout**: Badge → Title/Description → Info Box + Dropdown Arrow
- **Desktop Layout**: Badge + Title/Description + Info Box + Dropdown Arrow (horizontal)
- **Color Schemes**: Each program uses distinct gradient colors (Program 1: pink, Program 2: blue/cyan)
- **Collapsible State**: Managed by `expandedPrograms[program-id]` with smooth transitions

### Program Content Structure:
- **Week Badge**: Gradient colored with week number
- **Program Title**: Phase name with workout schedule details  
- **Equipment Section**: Color-coded badges for required equipment
- **Coach's Notes**: Highlighted section with program-specific guidance
- **Exercise Sections**: 
  - Part 1: Breathing/warm-up exercises with rep counts
  - Part 2: Main workout with "PLAY ALL" playlist button and individual exercise links
- **How To Use**: Instructions for video links and playlist functionality
- **Safety Precautions**: Important safety guidelines and warnings

### Technical Implementation Pattern:
- **Responsive Design**: Separate mobile (`block lg:hidden`) and desktop (`hidden lg:flex`) layouts
- **State Management**: `useState` for collapse/expand functionality per program
- **Video Integration**: YouTube links with `target="_blank" rel="noopener noreferrer"`
- **Equipment Badges**: Consistent color coding across all programs
- **Gradient Themes**: Each program maintains visual differentiation through color schemes

## UI/UX Improvements
- **Consistent Navigation**: Clickable logo across all pages (Dashboard, My Library, Heal Your Core) with proper hover effects
- **Advanced Tab Navigation System**:
  - **Meaningful Icons**: Each tab features descriptive icons (BookOpen for Welcome, Activity for Cardio, Brain for Core, Heart for Heal, Dumbbell for Programs, Apple for Nutrition, ChartBar for What's Next, HelpCircle for FAQs)
  - **Animated Journey Progress Bar**: Dynamic progress indicator showing user's current position in their learning journey
  - **Color-Changing Progress**: Progress bar changes colors based on current tab (pink for Welcome, blue for Cardio, purple for Core, green for Heal, orange for Programs, teal for Nutrition, indigo for What's Next, red for FAQs)
  - **Shimmer Animation**: Subtle shimmer effect moves across the progress bar for premium visual appeal
  - **Smooth Transitions**: Progress bar animates smoothly between tabs with cubic-bezier easing
  - **Clean Interface**: Streamlined design without distracting notification-style badges
  - **8-Tab Navigation**: Complete learning journey from Welcome through FAQs with proper progression flow
  - **Responsive Design**: Mobile and desktop optimized layouts with proper z-indexing and positioning
- **Comprehensive FAQ Section**: 
  - **12 Numbered Questions**: Complete FAQ system with sequentially numbered questions for easy reference
  - **Collapsible Accordion Interface**: Clean, organized presentation using shadcn/ui Accordion components
  - **Professional Styling**: Consistent pink border theme with proper spacing and typography
  - **Practical Content**: Addresses C-sections, diastasis recti, emotional aspects, timeline expectations, and safety concerns
  - **Expert Answers**: Honest, supportive responses focusing on individual healing journeys
- **Enhanced Program Header Design**: 
  - **Title/Description Separation**: Main program title and description are now properly separated with distinct styling (bold title + light subtitle)
  - **Gradient Headers**: Pink gradient backgrounds with decorative elements and premium visual appeal
  - **Mobile Header Optimization**: Responsive title and description layout with proper text hierarchy
- **Mobile-Responsive Week Section Design**: 
  - **Dual Layout System**: Separate mobile (`block lg:hidden`) and desktop (`hidden lg:flex`) layouts for optimal experience
  - **Mobile Week Layout Pattern**:
    - Week badge at top with enhanced styling (`bg-gradient-to-r from-pink-400 to-rose-400`)
    - Program title with proper hierarchy (`text-base font-bold mb-2`)
    - Schedule info clearly formatted (`text-pink-600 font-semibold`)
    - Equipment section with organized badges and proper spacing
  - **Desktop Week Layout Pattern**: Side-by-side structure with badge, content, and equipment aligned horizontally
- **Equipment Badge System**: Consistent color-coded badges (blue for bands, green for Pilates ball, purple for mat) with proper wrapping
- **Enhanced Equipment Section**: 
  - **Real Equipment Images**: Replaced emoji icons with actual equipment images imported using @assets syntax for professional display
  - **Square Containers**: Equipment items displayed in perfect square containers using aspect-square for uniform layout
  - **Larger Images**: Increased from 128x128px to 208x208px (w-52 h-52) for maximum prominence and clarity
  - **Spacious Design**: Enhanced padding (p-10) and larger containers for more prominent equipment display
  - **Premium Visual Effects**: Enhanced shadows, hover scaling, rounded corners, and color-coded gradient backgrounds for each equipment type
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