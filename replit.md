# Overview

Unify is a sophisticated digital business card and link-in-bio platform with NFC capabilities, digital wallet integration, and advanced analytics. The application allows users to create personalized digital profiles that can be shared through NFC technology, QR codes, or direct links. It combines the functionality of a virtual business card with comprehensive link management, custom theming, real-time analytics tracking, and webhook integrations for business automation.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with modern React and TypeScript, utilizing a component-based architecture with the following key decisions:

- **React with TypeScript**: Provides type safety and better developer experience
- **Wouter for Routing**: Lightweight client-side routing solution chosen over React Router for smaller bundle size
- **TanStack Query**: Manages server state, caching, and data synchronization with automatic background refetching
- **React Hook Form + Zod**: Form management with schema validation for type-safe form handling
- **Tailwind CSS + shadcn/ui**: Utility-first CSS framework with a comprehensive component library for consistent UI

## Backend Architecture
The server follows an Express.js-based REST API architecture with the following design patterns:

- **Express.js Server**: Lightweight and flexible web framework for Node.js
- **Modular Route Structure**: Routes are organized by domain (auth, profiles, links, analytics, webhooks)
- **Middleware-based Authentication**: Uses Replit's OIDC authentication system with session management
- **Database Abstraction Layer**: Storage interface pattern allows for easy database switching and testing

## Data Storage Solutions
The application uses PostgreSQL with Drizzle ORM for type-safe database operations:

- **PostgreSQL with Neon**: Serverless PostgreSQL database for scalability and performance
- **Drizzle ORM**: Type-safe database queries and schema management
- **Schema-first Design**: Database schema defined in TypeScript with automatic type generation
- **Migration Support**: Database schema versioning and migration capabilities

## Authentication and Authorization
Authentication is handled through Replit's OIDC provider with session-based security:

- **OIDC Authentication**: Secure authentication flow with Google login integration
- **Session Management**: PostgreSQL-backed session storage with configurable TTL
- **User Profile Integration**: Automatic user creation and profile synchronization
- **Route Protection**: Middleware-based authentication checks for protected endpoints

## Real-time Analytics and Event Tracking
The system implements comprehensive analytics tracking:

- **Event-driven Architecture**: All user interactions are tracked as events (profile views, link clicks, NFC scans)
- **Aggregated Analytics**: Daily rollups and historical data for performance insights
- **UTM Parameter Support**: Marketing campaign tracking and attribution
- **Real-time Metrics**: Live dashboard updates for immediate feedback

## Customization and Theming
Advanced customization capabilities for brand alignment:

- **Dynamic Theme System**: Runtime theme switching with CSS custom properties
- **Component Styling Options**: Multiple preset styles for buttons, avatars, and layouts
- **Color Customization**: Primary/secondary color schemes with accessibility considerations
- **Layout Flexibility**: Multiple text alignment and spacing options

# External Dependencies

## Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle Kit**: Database migration and schema management tools

## Authentication Services
- **Replit OIDC**: OAuth 2.0/OpenID Connect authentication provider
- **Google OAuth**: Social login integration through Replit's auth system

## UI and Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide Icons**: Comprehensive icon library with consistent design
- **React Icons**: Additional icon sets including brand icons

## Development and Build Tools
- **Vite**: Fast development server and build tool with HMR support
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds

## Utility Libraries
- **Zod**: Runtime type validation and schema definition
- **Date-fns**: Date manipulation and formatting utilities
- **QRCode**: QR code generation for easy profile sharing
- **Class Variance Authority**: Type-safe CSS class composition

## Analytics and Monitoring
- **Custom Analytics Engine**: Self-hosted analytics with privacy-first approach
- **Webhook System**: Real-time event notifications with retry logic and HMAC signing
- **Performance Tracking**: Built-in performance monitoring and optimization