# Claude AI Assistant Instructions

This document provides context and instructions for AI assistants working on the Drone Dashboard project.

## Project Overview

The Drone Dashboard is a comprehensive fleet management system built with Next.js 15, TypeScript, and Tailwind CSS. It provides real-time monitoring, build activity tracking, and complete management capabilities for drone manufacturing and assembly processes.

## Key Project Information

### Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma with SQLite (development)
- **UI Components**: Radix UI + Custom Components
- **Real-time**: WebSocket integration
- **Icons**: Lucide React

### Important Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database
- `npx prisma studio` - Open Prisma database studio

### Project Structure
```
drone-dashboard/
├── app/                    # Next.js 15 App Router
│   ├── (site)/            # Site layout group
│   │   ├── page.tsx       # Dashboard page
│   │   ├── fleet/         # Fleet management
│   │   ├── build-activity/ # Build activity tracking
│   │   ├── admin/         # Admin panel
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
├── lib/                  # Utilities and configurations
├── prisma/               # Database schema and migrations
└── docs/                # Project documentation
```

### Data Model Hierarchy
```
Drone
└── Systems (e.g., Propulsion, Navigation, Payload)
    └── Assemblies (e.g., Motor Assembly, GPS Module)
        └── Items (e.g., Motor, Propeller, GPS Chip)
```

## Bug Tracking System

### Bug Management
- All bugs are tracked in `BUGS.md` in the project root
- Bug IDs follow format: `BUG-YYYYMMDD-###` (e.g., `BUG-20250821-001`)
- Priority levels: P0 (Critical), P1 (High), P2 (Medium), P3 (Low)
- GitHub issue templates located in `.github/ISSUE_TEMPLATE/`

### Bug Workflow
1. Identify and document in BUGS.md
2. Create GitHub issue using bug_report.yml template
3. Link GitHub issue to BUGS.md entry
4. Implement fix and update BUGS.md with resolution details
5. Move to resolved section when completed

## Development Guidelines

### Code Quality
- Always run `npm run lint` and `npm run type-check` before committing
- Follow existing code patterns and conventions
- Use TypeScript strict mode - ensure all types are properly defined
- Maintain responsive design principles (mobile-first)

### Known Issues
- **Theme Persistence (BUG-20250821-001)**: Theme switching doesn't persist across page navigation due to hardcoded styling in root layout

### File Conventions
- Components use PascalCase (e.g., `SearchFilter.tsx`)
- API routes follow Next.js conventions (`/api/[resource]/route.ts`)
- Database models defined in `prisma/schema.prisma`
- Type definitions in `lib/types.ts`

## Important Patterns

### Real-time Features
- WebSocket provider in `components/real-time-provider.tsx`
- Real-time status indicators throughout the app
- Live data updates for build progress and fleet status

### Export Functionality
- CSV/JSON export utilities in `lib/export-utils.ts`
- Export functions available in Fleet and Build Activity pages
- Timestamped filename generation

### Search and Filtering
- Advanced search component in `components/search-filter.tsx`
- Multi-field filtering across all major data types
- Status-based filtering with preset options

## Documentation References
- `README.md` - Complete project setup and features
- `CHANGELOG.md` - Version history and feature updates
- `BUGS.md` - Bug tracking and resolution log
- `ROADMAP.md` - Future development plans
- `docs/` - Technical documentation and implementation guides

## Deployment
- Optimized for Vercel deployment
- Environment variables configured in `.env.local`
- Database migrations handled through Prisma

## Testing
- Manual testing required for UI components
- Cross-browser compatibility testing essential
- Mobile responsiveness verification needed
- WebSocket connection testing for real-time features

---

**Last Updated**: 2025-08-21
**Document Version**: 1.0