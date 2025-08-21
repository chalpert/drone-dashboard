// Item status types
export type ItemStatus = 'pending' | 'in-progress' | 'completed'

// Individual item interface
export interface Item {
  id: string
  name: string
  status: ItemStatus
  weight: number // Percentage within its assembly
}

// Assembly interface with items
export interface Assembly {
  id: string
  name: string
  weight: number // Percentage within its system
  items: Item[]
  completionPercentage: number // Calculated from item statuses
}

// System interface with assemblies
export interface System {
  id: string
  name: string
  weight: number // Percentage of overall drone completion
  assemblies: Assembly[]
  completionPercentage: number // Calculated from assembly completions
}

// Main drone interface for build tracking
export interface BuildDrone {
  serial: string // S1, S2, S3, etc.
  model: 'G1-M' | 'G1-C'
  status: 'pending' | 'in-progress' | 'completed'
  systems: System[]
  overallCompletion: number // Calculated from system completions
  startDate?: string
  estimatedCompletion?: string
  buildActivities?: BuildActivity[] // Optional build activities
}

// Build activity log entry
export interface BuildActivity {
  id: string
  droneSerial: string
  timestamp: string
  itemName: string
  assemblyName: string
  systemName: string
  action: 'started' | 'completed' | 'updated'
  notes?: string
}

// System definitions with assemblies and items based on CSV data
export const SYSTEM_DEFINITIONS = {
  'power electronics': {
    name: 'Power Electronics',
    weight: 20, // 20% of total drone
    assemblies: {
      'Battery Assembly': {
        name: 'Battery Assembly',
        weight: 40, // 40% of power electronics system
        items: [
          { name: 'Battery', weight: 50 },
          { name: '3P Printed Battery Enclosure Pieces', weight: 25 },
          { name: 'Battery Encolsure Hardware', weight: 25 }
        ]
      },
      'Busbar Assembly': {
        name: 'Busbar Assembly',
        weight: 40, // 40% of power electronics system
        items: [
          { name: 'Laser Cut Busbars', weight: 40 },
          { name: '3D Printed Enclosures', weight: 20 },
          { name: 'Hardware', weight: 20 },
          { name: 'Busbar Wire Harness', weight: 20 }
        ]
      },
      'Power Harnessing Assembly': {
        name: 'Power Harnessing Assembly',
        weight: 20, // 20% of power electronics system
        items: [
          { name: 'Power Electronics Harnesses', weight: 100 }
        ]
      }
    }
  },
  structure: {
    name: 'Structure',
    weight: 25, // 25% of total drone
    assemblies: {
      'Cover Assembly': {
        name: 'Cover Assembly',
        weight: 10,
        items: [
          { name: 'Composite Cover', weight: 60 },
          { name: 'Gasket/Seal', weight: 20 },
          { name: 'Quarter Turn Hardware', weight: 20 }
        ]
      },
      'Final Assembly': {
        name: 'Final Assembly',
        weight: 10,
        items: [
          { name: 'Radio Mount', weight: 30 },
          { name: 'Hardware to Mount Subassemblies to Frame', weight: 70 }
        ]
      },
      'Frame Assembly': {
        name: 'Frame Assembly',
        weight: 35,
        items: [
          { name: 'Composite Fuselage', weight: 20 },
          { name: 'End Fittings', weight: 10 },
          { name: 'Leg Brackets', weight: 8 },
          { name: 'Tubing', weight: 15 },
          { name: 'Joints', weight: 10 },
          { name: 'Hardware', weight: 10 },
          { name: 'Battery Guide', weight: 5 },
          { name: 'Tunnel Closeout', weight: 5 },
          { name: 'Payload Rail', weight: 7 },
          { name: 'Latch Mounts', weight: 5 },
          { name: 'Tunnel Covers', weight: 5 }
        ]
      },
      'Landing Legs Assembly': {
        name: 'Landing Legs Assembly',
        weight: 15,
        items: [
          { name: 'Tubing', weight: 40 },
          { name: 'Joint', weight: 20 },
          { name: 'Inserts', weight: 20 },
          { name: 'Landing Foot', weight: 20 }
        ]
      },
      'Lifter Fairing Assembly': {
        name: 'Lifter Fairing Assembly',
        weight: 15,
        items: [
          { name: 'Lifter Fairing', weight: 50 },
          { name: 'Lifter ESC', weight: 25 },
          { name: 'Hardware', weight: 15 },
          { name: 'Gasket', weight: 10 }
        ]
      },
      'Tractor Fairing Assembly': {
        name: 'Tractor Fairing Assembly',
        weight: 15,
        items: [
          { name: 'Tractor Fairing', weight: 35 },
          { name: 'Navigation Lights', weight: 15 },
          { name: 'Tractor ESC', weight: 25 },
          { name: 'Gasket', weight: 10 },
          { name: 'ESC Mount', weight: 10 },
          { name: 'Hardware', weight: 5 }
        ]
      }
    }
  },
  accessories: {
    name: 'Accessories',
    weight: 10, // 10% of total drone
    assemblies: {
      'Hadron Camera Assembly': {
        name: 'Hadron Camera Assembly',
        weight: 60, // 60% of accessories system
        items: [
          { name: 'Hadron Camera', weight: 30 },
          { name: 'G-Hadron Gimbal', weight: 25 },
          { name: 'Damping Mount', weight: 15 },
          { name: 'Mounts', weight: 15 },
          { name: 'Hardware', weight: 10 },
          { name: 'Camera Harnesses', weight: 5 }
        ]
      },
      'Payload Mechanism Assembly': {
        name: 'Payload Mechanism Assembly',
        weight: 40, // 40% of accessories system
        items: [
          { name: 'Servo', weight: 40 },
          { name: 'Laser Cut Plates', weight: 25 },
          { name: '3D Printed Components', weight: 20 },
          { name: 'Hardware', weight: 15 }
        ]
      }
    }
  },
  avionics: {
    name: 'Avionics',
    weight: 25, // 25% of total drone
    assemblies: {
      'Avionics Assembly': {
        name: 'Avionics Assembly',
        weight: 15,
        items: [
          { name: 'Interface Board', weight: 25 },
          { name: 'Mounting Pieces', weight: 15 },
          { name: 'Magnetometer', weight: 20 },
          { name: 'Ethernet Switch', weight: 20 },
          { name: 'Avionics Harnessing', weight: 20 }
        ]
      },
      'Bottom Hatch Assembly': {
        name: 'Bottom Hatch Assembly',
        weight: 35,
        items: [
          { name: 'Orin NX', weight: 15 },
          { name: 'Orin NX Accessories', weight: 8 },
          { name: 'Skynode X', weight: 15 },
          { name: 'Ribs', weight: 5 },
          { name: 'Flightstack PCB', weight: 12 },
          { name: 'Distributor PCB', weight: 10 },
          { name: 'Bottom Cover', weight: 8 },
          { name: 'MicroSD', weight: 3 },
          { name: 'Teensy', weight: 5 },
          { name: 'Bottom Hatch Avionics Mount', weight: 7 },
          { name: 'Distributor, Skynode, Orin NX, and Flightstack Power Harnesses', weight: 12 }
        ]
      },
      'Doodle Labs Radio Assembly': {
        name: 'Doodle Labs Radio Assembly',
        weight: 20,
        items: [
          { name: 'Doodle Labs Air Radio', weight: 50 },
          { name: 'Antenna', weight: 25 },
          { name: 'Hardware', weight: 15 },
          { name: 'Radio Harnesses', weight: 10 }
        ]
      },
      'Downward Lidar Assembly': {
        name: 'Downward Lidar Assembly',
        weight: 15,
        items: [
          { name: 'SF30/D Lidar', weight: 60 },
          { name: 'Mounting Pieces', weight: 20 },
          { name: 'Hardware', weight: 15 },
          { name: 'Lidar Harness', weight: 5 }
        ]
      },
      'Ellipse-D GPS Assembly': {
        name: 'Ellipse-D GPS Assembly',
        weight: 15,
        items: [
          { name: 'Ellipse-D GPS', weight: 40 },
          { name: 'Antennas', weight: 30 },
          { name: 'GPS Harnesses', weight: 15 },
          { name: 'Mounting Pieces', weight: 10 },
          { name: 'Hardware', weight: 5 }
        ]
      }
    }
  },
  propulsion: {
    name: 'Propulsion',
    weight: 20, // 20% of total drone
    assemblies: {
      'Lifter Assembly': {
        name: 'Lifter Assembly',
        weight: 60, // 60% of propulsion system
        items: [
          { name: 'Lifter Props', weight: 20 },
          { name: 'Lifter Hub', weight: 15 },
          { name: 'Lifter Motor', weight: 30 },
          { name: 'Motor Mount', weight: 15 },
          { name: 'Hardware', weight: 15 },
          { name: 'Bullet Connectors', weight: 5 }
        ]
      },
      'Tractor IPIVPM Assembly': {
        name: 'Tractor IPIVPM Assembly',
        weight: 40, // 40% of propulsion system
        items: [
          { name: 'Tractor Motor', weight: 30 },
          { name: 'Servo', weight: 20 },
          { name: 'Tractor Props', weight: 20 },
          { name: 'IPIVPM Machined Parts', weight: 20 },
          { name: 'IPIVPM Hardware', weight: 10 }
        ]
      }
    }
  }
} as const
