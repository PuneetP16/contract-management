# Dynamic Contract Management Dashboard

A modern contract management system built with Next.js and Shadcn UI, featuring real-time updates and a responsive interface.

## Features

- View and manage contracts with a dynamic data table
- Search, filter, and sort contract listings
- Edit contract details through modal forms
- Create new contracts with form validation
- Real-time updates using Pusher
- Light/Dark mode theme support
- Responsive design with Tailwind CSS

## Setup Instructions

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Git

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your Pusher credentials:

```env
# Required for real-time updates
PUSHER_APP_ID=your_app_id
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_secret
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
```

### Installation

1. Install dependencies (Important: Use legacy peers flag):
```bash
npm install --legacy-peer-deps
```

2. Start development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

Note: Sample contract data is included in the repository, so no seeding is required.

## Development Guide

### Project Overview

The application uses:
- Next.js 15 with App Router
- Tailwind CSS for styling
- Shadcn UI components
- Pusher for real-time updates
- Zod for validation
- TanStack Table for data management

### File Structure
```
├── app/                # Next.js app router
│   ├── api/           # API endpoints
│   └── page.tsx       # Main page
├── components/        # UI components
├── data/             # JSON data storage
├── hooks/            # Custom React hooks
├── lib/              # Utilities
├── providers/        # Context providers
├── reducer/          # State management
└── types/            # TypeScript types
```

### Key Components

- `components/tables/`: Contract table implementation
- `components/forms/`: Contract form components
- `hooks/useContractsManager`: Contract state management
- `app/api/contracts/`: Contract CRUD operations

## Local Development

1. Make code changes
2. Run linting:
```bash
npm run lint
```

3. Test your changes locally
4. Commit with descriptive message

## Deployment

### Vercel Deployment

1. Push to GitHub repository
2. Import project to Vercel
3. Configure environment variables
4. Deploy

### Manual Deployment

Build and start:
```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues

1. **Installation Issues**
   - Always use `npm install --legacy-peer-deps` as many packages are not yet compatible with NextJS 15
   - Always use flag --legacy-peer-deps for installation of external packages
   - Clear node_modules and package-lock.json if needed
   - Node.js version should be 18.x or higher

2. **Real-time Updates**
   - Verify Pusher credentials in .env.local
   - Check WebSocket connection
   - Ensure all Pusher environment variables are set

3. **Build Errors**
   - Clear .next directory
   - Reinstall dependencies with legacy peers flag
   - Check for Node.js version compatibility
