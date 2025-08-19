# Routing & Page Structure

## URL Structure

### Public Routes
```
/ ................................. Dashboard (homepage)
/fleet ............................ Fleet overview (list)
/fleet/[id] ...................... Individual drone details  
/missions ......................... Missions overview (list)
/missions/[id] ................... Individual mission details
/logs ............................. Flight & maintenance logs
/settings ......................... User preferences & config
```

### API Routes (Future)
```
/api/drones ....................... GET, POST drone data
/api/drones/[id] ................. GET, PUT, DELETE specific drone
/api/missions .................... GET, POST mission data  
/api/missions/[id] ............... GET, PUT, DELETE specific mission
/api/logs ........................ GET logs with filtering
/api/auth ........................ Authentication endpoints (optional)
```

## File Structure Mapping

### Current → Target Migration
```
app/
├── command-center/ .............. → DELETE (merge into dashboard)
├── agent-network/ ............... → RENAME to fleet/
├── intelligence/ ................ → DELETE (split to missions + logs)  
├── operations/ .................. → DELETE (merge into missions)
├── systems/ .................... → DELETE (simplify to settings)
├── layout.tsx .................. → KEEP (refactor theme)
└── page.tsx .................... → REFACTOR (new dashboard)

NEW STRUCTURE:
app/
├── (site)/                      # Route group for main app
│   ├── layout.tsx              # Main app layout with nav
│   ├── page.tsx               # Dashboard homepage
│   ├── fleet/
│   │   ├── page.tsx          # Fleet list view  
│   │   └── [id]/
│   │       └── page.tsx      # Drone detail view
│   ├── missions/
│   │   ├── page.tsx          # Mission list view
│   │   └── [id]/  
│   │       └── page.tsx      # Mission detail view
│   ├── logs/
│   │   └── page.tsx          # Logs with filtering
│   └── settings/
│       └── page.tsx          # Settings & preferences
├── globals.css              # Global styles (keep & simplify)
└── layout.tsx              # Root layout (minimal)
```

## Page Components Structure

### Dashboard (`/`)
```typescript
// app/(site)/page.tsx
export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Drones" value={12} />
        <KPICard title="Active Missions" value={3} />
        <KPICard title="Maintenance Due" value={2} />
        <KPICard title="Alerts" value={1} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <FleetStatus />
      </div>
      
      <div>
        <RecentLogs />
      </div>
    </div>
  )
}
```

### Fleet List (`/fleet`)
```typescript  
// app/(site)/fleet/page.tsx
export default function FleetPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1>Fleet Management</h1>
        <Button>Add Drone</Button>
      </div>
      
      <div className="flex gap-4">
        <SearchInput />
        <StatusFilter />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drones.map(drone => (
          <DroneCard key={drone.id} drone={drone} />
        ))}
      </div>
    </div>
  )
}
```

### Fleet Detail (`/fleet/[id]`)
```typescript
// app/(site)/fleet/[id]/page.tsx  
export default function DroneDetailPage({ params }: { params: { id: string }}) {
  return (
    <div className="space-y-6">
      <DroneHeader drone={drone} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TelemetryPanel drone={drone} />
          <RecentFlights droneId={params.id} />
        </div>
        <div>
          <DroneStats drone={drone} />
          <MaintenanceSchedule droneId={params.id} />
        </div>
      </div>
    </div>
  )
}
```

## Navigation Structure

### Primary Navigation (Sidebar)
```typescript
const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Fleet', href: '/fleet', icon: DroneIcon },
  { name: 'Missions', href: '/missions', icon: TargetIcon },
  { name: 'Logs', href: '/logs', icon: ClipboardIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
]
```

### Breadcrumbs
```typescript
// Dynamic breadcrumbs based on route
/ → Dashboard
/fleet → Dashboard / Fleet  
/fleet/drone-01 → Dashboard / Fleet / Drone DJI-01
/missions/mission-alpha → Dashboard / Missions / Mission Alpha
```

## Route Parameters & Search

### URL Parameters
```
/fleet?status=active&sort=name      # Filter active drones, sort by name
/fleet/drone-01?tab=telemetry      # Show telemetry tab
/missions?date=2024-01-01          # Filter missions by date  
/logs?drone=drone-01&limit=100     # Filter logs for specific drone
```

### Route Guards (Future)
```typescript
// Middleware for protected routes (if authentication added)
export function middleware(request: NextRequest) {
  // Check auth for /settings, /fleet/*/edit, etc.
}
```

## Mobile Navigation

### Responsive Patterns
- **Desktop**: Persistent sidebar navigation
- **Tablet**: Collapsible sidebar  
- **Mobile**: Bottom tab bar or hamburger menu

### Touch Gestures
- Swipe between drone cards in fleet view
- Pull to refresh on data-heavy pages
- Long press for context menus

## SEO & Meta Tags

### Dynamic Titles
```typescript
// Each page defines its own metadata
export const metadata: Metadata = {
  title: 'Fleet Management - Drone Tracker',
  description: 'Manage and monitor your drone fleet',
}
```

## Error Pages

### Custom Error Handling
```
app/
├── not-found.tsx ............... 404 for missing drones/missions
├── error.tsx .................. General error boundary  
└── global-error.tsx ........... Root error handler
```
