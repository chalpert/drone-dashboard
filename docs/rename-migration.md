# Legacy Page Migration Mapping

## Migration Overview

This document maps the transformation from the tactical dashboard to a clean drone tracker.

### Migration Timeline
- **Phase 1**: Backup & branch creation ✅
- **Phase 2**: Create new structure (Week 1)
- **Phase 3**: Migrate content (Week 2)
- **Phase 4**: Remove legacy (Week 3)

## Detailed Migration Map

| Old Path | Status | New Path | Content Migration | Components to Reuse | Components to Delete |
|----------|--------|----------|-------------------|-------------------|---------------------|
| `/command-center` | 🔄 Transform | `/` | Agent allocation → Drone KPIs<br/>Activity logs → Recent activity<br/>Mission charts → Fleet status | `Card`, `CardContent`, Progress charts | Military terminology, tactical animations |
| `/agent-network` | 🔄 Repurpose | `/fleet` | Agent list → Drone list<br/>Agent details → Drone details<br/>Search/filter → Keep same | `Input`, `Button`, Search, Filter components | Agent codenames, tactical status indicators |
| `/intelligence` | 🔀 Split | `/missions` + `/logs` | Analytics → Mission analytics<br/>Data gathering → Flight logs | `Card`, Tables, Filter components | Encrypted chat, tactical wireframes |
| `/operations` | 🔀 Merge | `/missions` | Live operations → Active missions<br/>Mission planning → Mission management | Progress tracking, Status updates | Military ops terminology |
| `/systems` | ✂️ Simplify | `/settings` | Configuration → User preferences<br/>System status → Remove | Theme toggle, Settings forms | System monitoring, tactical status |

## Content Transformation Details

### Command Center → Dashboard
**Keep & Transform:**
- KPI cards (rename "AGENT ALLOCATION" → "Fleet Status")
- Activity feed (remove military terminology)
- Progress charts (generalize to missions/drones)

**Remove:**
- Encrypted chat simulation
- Wireframe sphere animations  
- Military status indicators
- Tactical grid overlays

### Agent Network → Fleet
**Keep & Transform:**
- List/grid view of items
- Search and filtering functionality
- Detail modals/pages
- Status management

**Transform Mapping:**
```typescript
// Old agent data structure
interface Agent {
  id: string // "G-078W" 
  name: string // "VENGEFUL SPIRIT"
  status: "active" | "standby" | "compromised"
  location: string // "Berlin"
  missions: number
  risk: "low" | "medium" | "high" | "critical"
}

// New drone data structure  
interface Drone {
  id: string // "drone-01"
  name: string // "Surveyor DJI-01" 
  status: "active" | "maintenance" | "offline"
  location?: { lat: number, lng: number }
  battery: number
  flightTime: number
  model: string
}
```

### Intelligence → Missions + Logs
**Split Content:**
- Mission planning → `/missions`
- Data analysis → `/missions` (analytics)
- Historical data → `/logs`
- Reporting → `/logs` (export functionality)

### Operations → Missions  
**Merge Content:**
- Live mission tracking
- Mission status updates
- Resource allocation
- Timeline management

### Systems → Settings
**Simplify to:**
- User preferences
- Theme selection
- Notification settings
- Data export options

## Implementation Steps

### Step 1: Create Branch & Backup
```bash
cd drone-dashboard
git checkout -b refactor/migrate-to-drone-tracker
git add . && git commit -m "Backup: Pre-migration state"
```

### Step 2: Create New Directory Structure
```bash
mkdir -p app/\(site\)/{fleet,missions,logs,settings}
mkdir -p app/\(site\)/fleet/\[id\]
mkdir -p app/\(site\)/missions/\[id\]
```

### Step 3: Move and Transform Files
```bash
# Transform agent-network to fleet
git mv app/agent-network app/\(site\)/fleet/temp
# Move page.tsx and update content
# Rename agent references to drone

# Create new dashboard from command-center
cp app/command-center/page.tsx app/\(site\)/page.tsx
# Strip military theming and rename components
```

### Step 4: Update Navigation
**Replace tactical navigation:**
```typescript
// OLD
const navigation = [
  { id: "overview", icon: Monitor, label: "COMMAND CENTER" },
  { id: "agents", icon: Users, label: "AGENT NETWORK" },
  { id: "operations", icon: Target, label: "OPERATIONS" },
  { id: "intelligence", icon: Shield, label: "INTELLIGENCE" },
  { id: "systems", icon: Settings, label: "SYSTEMS" },
]

// NEW  
const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Fleet', href: '/fleet', icon: DroneIcon },
  { name: 'Missions', href: '/missions', icon: TargetIcon },
  { name: 'Logs', href: '/logs', icon: ClipboardIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
]
```

### Step 5: Component Transformation

**Strip Military Theme:**
```typescript
// Remove tactical styling
- className="text-orange-500 font-bold text-lg tracking-wider"
+ className="text-blue-600 font-semibold text-lg"

// Remove military terminology
- "TACTICAL OPS"
+ "Drone Tracker"
- "CLASSIFIED"
+ Remove
- "AGENT"
+ "DRONE"
```

**Clean Color Palette:**
```typescript
// Replace tactical colors
- bg-orange-500, text-orange-500
+ bg-blue-600, text-blue-600
- bg-neutral-900, bg-neutral-800  
+ bg-gray-50, bg-white (light mode)
+ bg-gray-900, bg-gray-800 (dark mode)
```

## Redirect Configuration

Add to `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/command-center',
        destination: '/',
        permanent: false, // 302 during transition
      },
      {
        source: '/agent-network',
        destination: '/fleet',
        permanent: false,
      },
      {
        source: '/intelligence',
        destination: '/logs',
        permanent: false,
      },
      {
        source: '/operations', 
        destination: '/missions',
        permanent: false,
      },
      {
        source: '/systems',
        destination: '/settings',
        permanent: false,
      },
    ]
  },
}
```

## Testing Migration

### Verification Checklist
- [ ] All old routes redirect properly
- [ ] New pages render without errors
- [ ] Navigation works between all sections
- [ ] Mobile responsive design maintained
- [ ] Dark/light theme toggle works
- [ ] TypeScript compilation succeeds
- [ ] No broken imports or missing components

### Commands to Run
```bash
npm run build      # Check for build errors
npm run lint       # Check for linting issues  
npm run type-check # Verify TypeScript
npm run dev        # Test in development
```

## Rollback Plan

If issues arise:
```bash
git checkout main
git branch -D refactor/migrate-to-drone-tracker
# Start over with lessons learned
```

## Success Criteria

✅ **Complete when:**
- All 5 legacy pages transformed or removed
- Navigation uses clean drone terminology
- Military theming completely removed  
- All routes functional with proper redirects
- Mobile responsive design preserved
- Build succeeds without errors
- Documentation updated
