# Dynamic Contract Management Dashboard

A modern contract management system built with Next.js and Shadcn UI, featuring real-time updates, persistent storage with Neon, and a responsive interface.

## Latest Updates

- Migrated from JSON file storage to Neon database
- Added global search functionality across all contract fields
- Improved form handling with React Server Actions and loading states
- Enhanced error handling in API routes
- Added type-safe database operations with proper row mapping
- Added database initialization and seeding scripts

## Features

- View and manage contracts with a dynamic data table
- Global search across all contract fields
- Filter and sort contract listings
- Edit contract details through modal forms with loading states
- Create new contracts with form validation
- Delete contracts with confirmation dialog and loading states
- Real-time updates using Pusher
- Light/Dark mode theme support
- Responsive design with Tailwind CSS
- Type-safe database operations with Neon

## Setup Instructions

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Git
- Neon database

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```env
# Required for real-time updates
PUSHER_APP_ID=your_app_id
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_secret
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster

# Database URLs (Using Neon Database)
DATABASE_URL="postgres://<user>:<password>@<host-pooler>/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgres://<user>:<password>@<host>/neondb?sslmode=require"

# Database Connection Parameters
PGHOST=<host-pooler>
PGHOST_UNPOOLED=<host>
PGUSER=<user>
PGDATABASE=neondb
PGPASSWORD=<password>

# Vercel Postgres Configuration
POSTGRES_URL="${DATABASE_URL}"
POSTGRES_URL_NON_POOLING="${DATABASE_URL_UNPOOLED}"
POSTGRES_USER="${PGUSER}"
POSTGRES_HOST="${PGHOST}"
POSTGRES_PASSWORD="${PGPASSWORD}"
POSTGRES_DATABASE="${PGDATABASE}"
POSTGRES_URL_NO_SSL="postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}"
POSTGRES_PRISMA_URL="${DATABASE_URL}?pgbouncer=true&connect_timeout=15"
```

### Database Configuration

This project uses [Neon](https://neon.tech) as the database provider, which offers:
- Serverless Postgres
- Connection pooling
- Automatic scaling
- Point-in-time recovery

The database connection is configured in two modes:
1. **Pooled** (`DATABASE_URL`): Uses PgBouncer for connection pooling, suitable for most operations
2. **Direct** (`DATABASE_URL_UNPOOLED`): Direct database connection, required for certain operations like migrations

### Installation

1. Install dependencies (Important: Use legacy peers flag):
```bash
npm install --legacy-peer-deps
```

2. Initialize and seed the database:
```bash
npm run db:init
npm run db:seed
```

3. Start development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Development Guide

### Project Overview

The application uses:
- Next.js 15 with App Router
- Neon for database
- Tailwind CSS for styling
- Shadcn UI components
- Pusher for real-time updates
- Zod for validation
- TanStack Table v8 for data management with global search
- React Server Actions for form handling

### File Structure
```
├── app/                # Next.js app router
│   ├── api/           # API endpoints
│   └── page.tsx       # Main page
├── components/        # UI components
│   ├── forms/        # Form components with loading states
│   ├── tables/       # Table components with global search
│   └── ui/           # Shadcn UI components
├── contexts/         # React contexts
├── hooks/            # Custom React hooks
├── lib/              # Utilities and database operations
├── scripts/          # Database scripts
├── types/            # TypeScript types and schemas
└── public/           # Static assets
```

### Key Components

- `components/tables/`: Contract table with global search and filters
- `components/forms/`: Contract form with server actions and loading states
- `contexts/ContractsContext`: Real-time state management
- `lib/db.ts`: Type-safe database operations
- `types/index.ts`: Shared TypeScript types and schemas
- `scripts/seed.ts`: Database seeding script

## Database Schema

The application uses a Postgres database with the following schema:

```sql
CREATE TABLE contracts (
  id VARCHAR(255) PRIMARY KEY,
  client_name VARCHAR(100) NOT NULL,
  contract_title VARCHAR(200) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(20) CHECK (status IN ('Draft', 'Pending', 'Active', 'Expired', 'Terminated')),
  value DECIMAL CHECK (value > 0 AND value <= 1000000000),
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
)
```

Indexes:
- `idx_contracts_status`: For efficient status filtering
- `idx_contracts_dates`: For date range queries

## API Routes

All API routes have been updated to use the database:

- `GET /api/contracts`: Fetch all contracts
- `POST /api/contracts`: Create a new contract
- `PUT /api/contracts`: Update an existing contract
- `DELETE /api/contracts`: Delete a contract

Each route includes proper error handling and type validation.
