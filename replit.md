# Overview

This is a fitness application called "Stronger With Zoe" - a comprehensive workout and program management platform. The application allows users to access fitness programs, track workout progress, engage with a community, and manage their fitness journey. It includes admin functionality for managing users, programs, and content. The platform features user authentication, terms acceptance, program enrollment, workout tracking, community features, and notification systems.

# User Preferences

Preferred communication style: Simple, everyday language.

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