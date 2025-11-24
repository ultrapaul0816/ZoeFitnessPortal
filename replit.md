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
Session-based authentication with express-session and PostgreSQL storage (connect-pg-simple), providing persistent 30-day sessions with secure HTTP-only cookies. Bcrypt-hashed passwords (cost factor 10) with strength validation. Includes a transitional migration guard for legacy passwords. Role-based access control differentiates users and administrators. Mandatory acceptance of terms and health disclaimers is integrated into the login flow. Rate limiting protects login, password reset, and admin endpoints. Robust input validation is implemented for phone numbers, emails, dates, names, file uploads (mime type, size, single file), and WhatsApp duration. User email fields are read-only to prevent client-side modifications. One-time migration of localStorage profile data to database on first session login. Dashboard verifies session on mount and redirects to login if session is invalid or expired.

## Technical Implementations
The application provides a 6-week program with detailed exercises, coach notes, and YouTube video integration. Content is organized into collapsible, gradient-themed sections. Features include a "What's Next Tab" with a PDF progress tracker, a modernized Nutrition section, extensive profile personalization, and real-time profile completeness tracking with a progress banner. Program access is managed via both purchase and admin enrollment records. A "Progress Tracker" tab allows secure before/after photo uploads via Cloudinary. An Instagram-style Community Feed supports photo uploads, categories, week-based filtering, likes, comments, and Instagram sharing, with full CRUD operations and Cloudinary integration.

Email campaign management includes a template library with 4 reusable templates (Welcome, Re-engagement, Midpoint Motivation, Completion Celebration), dynamic variable replacement, email open tracking via pixel tracking, audience targeting with filters, test email functionality, and a comprehensive Email Analytics Dashboard with performance metrics, template statistics, and campaign history visualization.

# External Dependencies
- **Database**: PostgreSQL (managed by Neon Database)
- **Deployment**: Replit
- **Typography**: Google Fonts
- **Video**: YouTube API
- **PDF Generation**: jsPDF
- **Image Storage**: Cloudinary