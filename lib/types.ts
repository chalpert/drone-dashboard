// Component status types
export type ComponentStatus = 'pending' | 'in-progress' | 'completed'

// Individual component interface
export interface Component {
  id: string
  name: string
  status: ComponentStatus
  weight: number // Percentage within its category
}

// Category interface with components
export interface ComponentCategory {
  id: string
  name: string
  weight: number // Percentage of overall drone completion
  components: Component[]
  completionPercentage: number // Calculated from component statuses
}

// Main drone interface for build tracking
export interface BuildDrone {
  serial: string // S1, S2, S3, etc.
  model: 'G1-M' | 'G1-C'
  status: 'planning' | 'in-build' | 'testing' | 'completed'
  categories: ComponentCategory[]
  overallCompletion: number // Calculated from category completions
  startDate?: string
  estimatedCompletion?: string
}

// Build activity log entry
export interface BuildActivity {
  id: string
  droneSerial: string
  timestamp: string
  component: string
  category: string
  action: 'started' | 'completed' | 'updated'
  notes?: string
}

// Component definitions with weights
export const COMPONENT_DEFINITIONS = {
  airframe: {
    name: 'Airframe',
    weight: 20,
    components: [
      { name: 'Composite', weight: 25 }, // 5% of overall (20% * 25%)
      { name: 'Diamond Frame', weight: 25 }, // 5% of overall
      { name: 'Legs', weight: 25 }, // 5% of overall
      { name: 'Payload Rails', weight: 25 }, // 5% of overall
    ]
  },
  propulsion: {
    name: 'Propulsion',
    weight: 35, // Total for propulsion category
    components: [
      { name: 'Lifters', weight: 42.86 }, // 15% of overall (35% * 42.86%)
      { name: 'Tractors', weight: 28.57 }, // 10% of overall
      { name: 'Tractor Install', weight: 14.29 }, // 5% of overall
      { name: 'ESC Install', weight: 14.29 }, // 5% of overall
    ]
  },
  power: {
    name: 'Power',
    weight: 30, // Total for power category
    components: [
      { name: 'Busbar', weight: 33.33 }, // 10% of overall (30% * 33.33%)
      { name: 'Wire Harnessing', weight: 33.33 }, // 10% of overall
      { name: 'Powertrain Harnessing', weight: 16.67 }, // 5% of overall
      { name: 'Avionics Harnessing', weight: 16.67 }, // 5% of overall
    ]
  },
  avionics: {
    name: 'Avionics',
    weight: 25,
    components: [
      { name: 'Flight Stack', weight: 10 }, // 2.5% of overall (25% * 10%)
      { name: 'Distribution Board', weight: 10 }, // 2.5% of overall
      { name: 'Interface Board', weight: 10 }, // 2.5% of overall
      { name: 'GPS Magnetometer', weight: 10 }, // 2.5% of overall
      { name: 'Downward LiDAR', weight: 10 }, // 2.5% of overall
      { name: 'Mission Computer', weight: 10 }, // 2.5% of overall
      { name: 'Skynode X', weight: 10 }, // 2.5% of overall
      { name: 'Carrier Board', weight: 10 }, // 2.5% of overall
      { name: 'Running Lights', weight: 10 }, // 2.5% of overall
      { name: 'RS232 Plugin', weight: 10 }, // 2.5% of overall
    ]
  },
  radio: {
    name: 'Radio',
    weight: 5,
    components: [
      { name: 'Radio System', weight: 100 }, // 5% of overall
    ]
  },
  camera: {
    name: 'Camera',
    weight: 5,
    components: [
      { name: 'Camera System', weight: 100 }, // 5% of overall
    ]
  }
} as const
