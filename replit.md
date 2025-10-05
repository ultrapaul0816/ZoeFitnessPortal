# Overview
This project is a 6-week postnatal fitness web application, "Your Postpartum Strength Recovery Program," designed for mothers 6 weeks to 6 years postpartum. It offers a comprehensive core rehabilitation program with educational content, structured workout plans, YouTube video integration, progress tracking, and administrative functionalities. The application features a cohesive pink brand color scheme, mobile-responsive design, and a premium visual aesthetic focusing on consistent navigation and UI alignment. The business vision is to provide a supportive and effective platform for postpartum recovery, tapping into the market for specialized women's health and fitness.

# User Preferences
Preferred communication style: Simple, everyday language.

# System Architecture
## Frontend Architecture
The frontend is built with React and TypeScript, using Vite for development and bundling. UI components leverage shadcn/ui (based on Radix UI) and are styled with TailwindCSS. State management for server data uses TanStack Query, while client-side routing is handled by wouter. Form management is implemented with React Hook Form and Zod for validation. The UI/UX prioritizes a premium visual appeal with a consistent pink brand theme, gradient effects, rounded corners, and mobile-responsive layouts. Key features include an advanced tab navigation system with game-like progression, a comprehensive FAQ section, and enhanced program headers and equipment displays. All exercise video hyperlinks consistently use a blue color (`text-blue-600`).

## Backend Architecture
The backend is an Express.js and TypeScript RESTful API. It uses a modular route structure, centralized error handling, and request logging. Authentication is session-based, with role-based access control for users and administrators. The system manages WhatsApp Community support with duration-based access and promotional content visibility. User creation requires program assignment.

## Data Storage Solutions
PostgreSQL serves as the primary database, accessed via Drizzle ORM for type-safe operations. The data model includes users, fitness programs, workouts, member enrollments, community posts, notifications, and terms/conditions. User profiles store extensive personalization fields, including fitness level, delivery type, number of children, breastfeeding status, medical clearance, available equipment, workout frequency, preferred workout time, personal fitness goals, and physical limitations. Database migrations are managed with Drizzle Kit.

## Authentication and Authorization
Authentication uses a session-based approach, validating user credentials against the database. Role-based access control differentiates between regular users and administrators. The login flow includes mandatory disclaimer acceptance: users cannot log in until they accept the health disclaimer, which is then permanently saved to their profile. The disclaimer appears automatically during login for any user who hasn't yet accepted it.

## Technical Implementations
The application features a comprehensive 6-week program structure with detailed exercises, coach notes, and safety tips. YouTube videos are integrated for exercises, with clickable buttons and playlist functionality. Content is organized into collapsible sections with distinct gradient color themes for each week. Responsive design ensures optimal viewing on both mobile and desktop. Key features include:
- **What's Next Tab**: Includes "Red Flag Movements to Avoid," "Return to Impact Readiness Test," and a downloadable PDF "Progress Tracker."
- **Nutrition Section**: Features modernized badge designs, enhanced readability, and color-coordinated card styling.
- **Profile Personalization**: Extensive fields for postpartum-specific fitness customization.
- **Program Access Control**: The `hasProgramAccess` function checks both the `programPurchases` table (for direct purchases) and the `memberPrograms` table (for admin enrollments), ensuring enrolled users can access program content.

### Deployment Architecture
- **Development Mode**: Uses Vite dev server with HMR.
- **Production Mode**: Express.js serves pre-built static assets from the `dist/public` directory.
- **Asset Management**: Vite bundles all frontend assets.
- **Static File Serving**: Configured Express middleware handles asset requests.

# External Dependencies
- **Database**: PostgreSQL (managed by Neon Database via `@neondatabase/serverless` driver)
- **Deployment Platform**: Replit
- **Typography**: Google Fonts
- **Video Integration**: YouTube API (for embedding and linking workout videos)
- **PDF Generation**: jsPDF (for progress tracker download)