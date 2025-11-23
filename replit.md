# Overview
This project is a 6-week postnatal fitness web application, "Your Postpartum Strength Recovery Program," designed for mothers 6 weeks to 6 years postpartum. It offers a comprehensive core rehabilitation program with educational content, structured workout plans, YouTube video integration, progress tracking, and administrative functionalities. The application features a cohesive pink brand color scheme, mobile-responsive design, and a premium visual aesthetic focusing on consistent navigation and UI alignment. The business vision is to provide a supportive and effective platform for postpartum recovery, tapping into the market for specialized women's health and fitness.

# User Preferences
Preferred communication style: Simple, everyday language.

# System Architecture
## Frontend Architecture
The frontend is built with React and TypeScript, using Vite for development and bundling. UI components leverage shadcn/ui (based on Radix UI) and are styled with TailwindCSS. State management for server data uses TanStack Query, while client-side routing is handled by wouter. Form management is implemented with React Hook Form and Zod for validation. The UI/UX prioritizes a premium visual appeal with a consistent pink brand theme, gradient effects, rounded corners, and mobile-responsive layouts. Key features include an advanced tab navigation system with game-like progression, a comprehensive FAQ section, and enhanced program headers and equipment displays. All exercise video hyperlinks consistently use a blue color (`text-blue-600`).

## Backend Architecture
The backend is an Express.js and TypeScript RESTful API. It uses a modular route structure, centralized error handling, and request logging. Authentication is session-based, with role-based access control for users and administrators. The system manages WhatsApp Community support with duration-based access and promotional content visibility. User creation requires program assignment. The admin panel includes a comprehensive PUT endpoint (`/api/admin/users/:id`) that automatically calculates WhatsApp support expiry dates based on the selected duration.

### Admin Panel Architecture
The admin panel features a dual-mode dialog system with strict separation between viewing and editing, plus comprehensive dashboard statistics:

**Dashboard Overview (3-card layout):**
- **Total Members**: Count of all members with growth indicator
- **Active Members**: Count of members who have accepted terms (non-admin)
- **Expiring Soon**: Real-time tracking of both program access and WhatsApp support expiring within 7 days
  - Shows detailed breakdown of expiring users below stats
  - Each expiring user displays: name, program expiry date (if applicable), WhatsApp support expiry date (if applicable)
  - "Extend" button for quick access to member edit dialog

**View Dialog (Read-Only):**
- Basic info, access period, enrolled programs
- WhatsApp Community status with visual indicators (Active/Expired/No Support)
- Actual password displayed in monospace font for easy copying
- Only Edit and Close buttons available

**Edit Dialog (Organized Sections):**
1. **Basic Information**: Name, email, phone number
2. **Program Management**: 
   - View currently enrolled programs with remove option
   - Add new program enrollment
   - Extend program access by 12 months (moved near programs for logical placement)
3. **WhatsApp Community Support**:
   - If already has support: Shows status, "Extend by 3 Months" and "Remove Access" options (not easily changeable)
   - If no support: Option to grant with 3/6/12 month duration selection
   - Auto-calculates expiry dates
4. **Account Access Period**: Valid from/until dates (overall account access, separate from programs)
5. **Admin Privileges**: Toggle for admin access
6. **Password Management**: Reset password functionality
7. **Danger Zone**: Account deactivation with clear warning

This reorganized structure prevents accidental changes to WhatsApp support (requires explicit extend/remove actions), clarifies the purpose of each setting with section headers, and groups related functionality together logically.

## Data Storage Solutions
PostgreSQL serves as the primary database, accessed via Drizzle ORM for type-safe operations. The data model includes users, fitness programs, workouts, member enrollments, community posts, notifications, and terms/conditions. User profiles store extensive personalization fields, including fitness level, delivery type, number of children, breastfeeding status, medical clearance, available equipment, workout frequency, preferred workout time, personal fitness goals, and physical limitations. Database migrations are managed with Drizzle Kit.

## Authentication and Authorization
Authentication uses a session-based approach with robust password security. Passwords are hashed using bcrypt (cost factor 10) and validated for strength (minimum 8 characters, including uppercase, lowercase, and number). The system includes a transitional migration guard that automatically upgrades legacy plaintext passwords to hashed versions upon successful login, ensuring seamless user experience during security upgrades. Role-based access control differentiates between regular users and administrators. The login flow includes mandatory acceptance of both terms and conditions and health disclaimer: users cannot log in until they accept both, which are then permanently saved to their profile. Both terms and disclaimer appear automatically during login for any user who hasn't yet accepted them, with distinct visual styling (blue gradient for terms, pink gradient for disclaimer).

### Password Security Features
- **Bcrypt Hashing**: All passwords stored as bcrypt hashes with cost factor 10
- **Password Strength Validation**: Enforces minimum 8 characters with uppercase, lowercase, and number requirements
- **Strong Password Generation**: Auto-generated passwords (12 characters) guaranteed to meet all strength requirements
- **Legacy Migration**: Automatic upgrade of plaintext passwords to hashed versions on user login
- **Default Credentials**: Admin login: admin@strongerwithzoe.in / Admin@123, Test user: jane@example.com / Test@123

### Rate Limiting Protection
- **Login Endpoint**: Maximum 5 attempts per IP every 15 minutes (prevents brute force attacks)
- **Password Reset**: Maximum 3 attempts per IP every 15 minutes
- **Admin Operations**: Maximum 50 requests per IP every 15 minutes (user creation, updates)
- **General API**: Maximum 200 requests per IP every 15 minutes (catch-all protection)
- **Headers**: Rate limit information exposed via standard RateLimit headers

### Input Validation
- **Phone Numbers**: International format support with 10-15 digit validation, accepts spaces, dashes, parentheses; truly optional (accepts null/undefined/empty)
- **Email Addresses**: Proper email format validation with automatic lowercase conversion
- **Date Ranges**: Realistic date bounds (max 10 years ahead, 10 years back for account validity) to support legacy accounts
- **Names**: String length limits (1-100 characters) to prevent overflow
- **File Uploads**: Strict mime type and extension validation (JPEG, PNG, WEBP, HEIC), 10MB size limit, single file only; user-friendly 400 error responses
- **WhatsApp Duration**: Integer validation with maximum 36 months cap

### Email Change Policy
- **User-Facing Profile Forms**: Email field is displayed as read-only (disabled) to prevent user edits
- **Rationale**: Email changes require verification flow and updates across authentication, newsletter systems, and integrations
- **Admin-Only**: Email modifications should only be available through admin panel in future implementation
- **Visual Indicators**: Read-only email fields show gray background with helper text "Email changes require admin approval"
- **Files Affected**: `profile-settings.tsx`, `profile-modal.tsx`

### Promotional Content Visibility
WhatsApp Community promotional sections are conditionally displayed based on user subscription status:
- Users **without** WhatsApp support see promotional sections encouraging them to join (in program pages and hamburger menu)
- Users **with** active WhatsApp support do not see promotional content
- Logic checks `user.hasWhatsAppSupport` flag to control visibility

## Technical Implementations
The application features a comprehensive 6-week program structure with detailed exercises, coach notes, and safety tips. YouTube videos are integrated for exercises, with clickable buttons and playlist functionality. Content is organized into collapsible sections with distinct gradient color themes for each week. Responsive design ensures optimal viewing on both mobile and desktop. Key features include:
- **What's Next Tab**: Includes "Red Flag Movements to Avoid," "Return to Impact Readiness Test," and a downloadable PDF "Progress Tracker."
- **Nutrition Section**: Features modernized badge designs, enhanced readability, and color-coordinated card styling.
- **Profile Personalization**: Extensive fields for postpartum-specific fitness customization.
- **Program Access Control**: The `hasProgramAccess` function checks both the `programPurchases` table (for direct purchases) and the `memberPrograms` table (for admin enrollments), ensuring enrolled users can access program content.
- **Progress Photo Tracking**: Integrated as "Progress Tracker" tab in main navigation (after Heal tab) for before/after photo uploads and weekly progress tracking. Photos are stored securely via Cloudinary with database metadata. Users can upload via camera or gallery, with example photos and photography tips. Includes downloadable PDF progress tracker for weekly symptom and measurement logging. Comprehensive guidance explains when to take photos (start: before program, finish: after 6 weeks).
- **Community Feed**: Instagram-style social feed with photo uploads, categories (#Wins, #RealTalk, #Transformations, #WorkoutSelfies, #MomLife), week-based filtering, like/unlike, comments, Instagram share feature, and featured posts. Full CRUD operations with Cloudinary integration. Sample data includes 14 diverse posts across all categories (Weeks 1-6), 23 likes, and 13 supportive comments demonstrating authentic community engagement patterns.

### Deployment Architecture
- **Development Mode**: Uses Vite dev server with HMR.
- **Production Mode**: Express.js serves pre-built static assets from the `dist/public` directory.
- **Asset Management**: Vite bundles all frontend assets.
- **Static File Serving**: Configured Express middleware handles asset requests.

### Performance Optimizations
- **Code Splitting**: Heavy pages (Heal Your Core, Progress) use React.lazy() and Suspense for lazy loading, reducing initial bundle size
- **Dynamic Imports**: jsPDF library (70+ KB) is dynamically imported only when users download the progress tracker PDF
- **Optimized Logging**: Removed verbose server-side logging to reduce overhead during photo uploads
- **Route-Level Splitting**: Each major page loads independently, improving first paint and time-to-interactive
- **Client-Side Image Compression**: All photo uploads (community posts, progress photos) are automatically compressed before upload using canvas API. Images are resized to max 1920px dimension and compressed to ~800KB target size with 85% JPEG quality, significantly reducing upload times and bandwidth usage especially on mobile connections.

### Mobile UX Enhancements
- **Toast Notifications**: Enhanced close button with 44x44px touch target (Apple's recommended minimum), always visible instead of hover-only, larger icon (20px), subtle hover background, active state feedback, and 5-second auto-dismiss. Radix UI toast supports native swipe-to-dismiss gesture on mobile.
- **Scrollable Dialogs**: Create post dialog has max 90vh height with scrollable content area, ensuring form submission buttons are accessible on all screen sizes.
- **Floating Action Buttons**: Community feed uses mobile-optimized FAB (bottom-right) for quick post creation on touch devices.

# External Dependencies
- **Database**: PostgreSQL (managed by Neon Database via `@neondatabase/serverless` driver)
- **Deployment Platform**: Replit
- **Typography**: Google Fonts
- **Video Integration**: YouTube API (for embedding and linking workout videos)
- **PDF Generation**: jsPDF (for progress tracker download)
- **Image Storage**: Cloudinary (for secure progress photo storage and delivery)