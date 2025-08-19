# Drone Tracker Requirements & Migration Plan

## Project Vision
Transform the existing tactical dashboard into a **clean, modular drone tracking system** that prioritizes simplicity, extensibility, and user experience over complex military theming.

## Current State Analysis

### Existing Assets (Next.js 15.2.4)
- ✅ **Solid Foundation**: Modern Next.js with React 19, TypeScript, Tailwind CSS
- ✅ **UI Components**: Radix UI primitives (Button, Card, Input, Progress, Badge)
- ✅ **Styling System**: Well-structured CSS variables and dark/light theme support
- ✅ **Layout Structure**: Responsive sidebar navigation pattern

### Current Pages (To Be Transformed)
| Current Page | Theme | Content | Status | Target |
|--------------|-------|---------|--------|---------|
| `/command-center` | Military ops center | Agent allocation, activity logs, charts | 🔄 Transform | Dashboard |
| `/agent-network` | Agent management | List/detail views, search, filters | 🔄 Repurpose | Fleet Management |
| `/intelligence` | Data gathering | Analytics interface | 🔄 Split | Missions + Logs |
| `/operations` | Live missions | Mission management | 🔄 Merge | Missions |
| `/systems` | System control | Configuration | 🔄 Simplify | Settings |

## New System Architecture

### Core Modules
1. **Dashboard** (`/`) - Overview with KPIs and recent activity
2. **Fleet** (`/fleet`) - Drone management with list/detail views
3. **Missions** (`/missions`) - Mission planning and tracking
4. **Logs** (`/logs`) - Flight and maintenance logs
5. **Settings** (`/settings`) - User preferences and configuration

### Data Model (Simplified)
```typescript
// Core entities
interface Drone {
  id: string
  name: string
  model: string
  status: 'active' | 'maintenance' | 'offline'
  battery: number
  location?: { lat: number, lng: number }
  lastSeen: Date
}

interface Mission {
  id: string
  name: string
  droneId: string
  status: 'planned' | 'active' | 'completed' | 'failed'
  startTime: Date
  endTime?: Date
  location: { lat: number, lng: number }
}

interface FlightLog {
  id: string
  droneId: string
  missionId?: string
  timestamp: Date
  event: string
  details?: Record<string, any>
}
```

## Migration Strategy

### Phase 1: Foundation (Week 1)
- [ ] Create documentation structure
- [ ] Set up routing map and page structure
- [ ] Strip military theming
- [ ] Implement clean layout shell

### Phase 2: Core Pages (Week 2-3)
- [ ] Dashboard with KPI cards and activity feed
- [ ] Fleet management with CRUD operations
- [ ] Basic missions interface

### Phase 3: Enhanced Features (Week 4)
- [ ] Logs and reporting
- [ ] Settings and theme configurator
- [ ] Search and filtering

### Phase 4: Polish & Testing (Week 5)
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Documentation completion

## Design Principles

### Simplicity First
- Clean, minimal UI without tactical complexity
- Focus on essential drone tracking features
- Progressive disclosure of advanced features

### Modularity
- Each page/feature as independent module
- Shared components for consistency
- Easy to extend with new features

### User Experience
- Intuitive navigation
- Responsive design
- Fast load times and smooth interactions

### Developer Experience  
- Type-safe with TypeScript
- Well-documented components
- Easy local development setup

## Success Metrics
- [ ] All legacy military theming removed
- [ ] 5 core modules fully functional
- [ ] Type-safe throughout
- [ ] Responsive on mobile/desktop
- [ ] Sub-second page load times
- [ ] Comprehensive test coverage
