# Diamond Notes Generator

## Overview

Diamond Notes Generator is a full-stack web application that creates structured educational notes for NCERT curriculum (Classes 1-12). The application allows users to either input chapter details or upload PDF files to generate comprehensive study notes in "Diamond Notes" format. The system supports both English and Hindi output languages and covers all major subjects across different academic streams.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI primitives with shadcn/ui components for consistent design
- **Styling**: Tailwind CSS with custom design system variables and neutral color scheme
- **State Management**: TanStack React Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form processing
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints with structured error handling and request logging
- **File Upload**: Multer middleware for PDF file processing with 50MB size limit
- **Data Validation**: Zod schemas for runtime type checking and validation

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon serverless PostgreSQL for cloud deployment
- **Schema**: Structured tables for users, notes requests, and generated content
- **Migrations**: Drizzle Kit for database schema management and migrations

### Authentication & Session Management
- **Strategy**: PostgreSQL-based session storage using connect-pg-simple
- **Security**: Session-based authentication with secure cookie configuration
- **User Management**: Username/password authentication with hashed password storage

### Development & Build Process
- **Development Server**: Vite development server with HMR and middleware integration
- **Build Process**: Vite for frontend bundling and esbuild for server-side compilation
- **Type Checking**: Strict TypeScript configuration with path mapping for clean imports
- **Code Quality**: ESM modules throughout with proper import/export structure

### File Structure
- **Monorepo Design**: Shared schema and types between client and server
- **Client**: React application in `/client` directory with component library
- **Server**: Express API in `/server` directory with modular route handling
- **Shared**: Common types and schemas in `/shared` directory for consistency

### Educational Content Processing
- **Subject Mapping**: Dynamic subject selection based on class and academic stream
- **Content Generation**: Structured Diamond Notes format with numbered headings and bullet points
- **Language Support**: Bilingual output (English/Hindi) with consistent formatting
- **PDF Processing**: File upload and content extraction for custom material processing

### External Integrations
- **Development Tools**: Replit integration for cloud development environment
- **Font Loading**: Google Fonts integration for typography (Inter, DM Sans, Fira Code)
- **Asset Management**: Static asset serving with proper content type handling

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18 with TypeScript support and React DOM
- **Build Tools**: Vite for frontend bundling, esbuild for server compilation
- **Database**: Drizzle ORM with PostgreSQL dialect and Neon serverless connection
- **Server Framework**: Express.js with TypeScript and ESM module support

### UI and Styling
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **Styling Framework**: Tailwind CSS with PostCSS processing and Autoprefixer
- **Design System**: shadcn/ui component collection with consistent theming
- **Icons**: Lucide React for scalable vector icons

### Development and Quality
- **Type Safety**: TypeScript with strict configuration and Zod runtime validation
- **Form Management**: React Hook Form with Hookform Resolvers for validation integration
- **State Management**: TanStack React Query for server state caching and synchronization
- **File Processing**: Multer for multipart form data and file upload handling

### Database and Storage
- **Database Connection**: Neon serverless PostgreSQL with connection pooling
- **ORM**: Drizzle ORM for type-safe database queries and schema management
- **Session Storage**: connect-pg-simple for PostgreSQL-based session persistence
- **Migration Tools**: Drizzle Kit for database schema versioning and deployment

### Utility Libraries
- **Date Processing**: date-fns for date manipulation and formatting
- **Class Management**: clsx and class-variance-authority for conditional styling
- **Carousel**: Embla Carousel React for image and content carousels
- **Command Interface**: cmdk for command palette and search functionality
- **Source Maps**: @jridgewell/trace-mapping for debugging support