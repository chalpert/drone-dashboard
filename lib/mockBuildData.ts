import { BuildDrone, System, Assembly, Item, BuildActivity, SYSTEM_DEFINITIONS } from './types'

// Helper function to calculate assembly completion percentage
function calculateAssemblyCompletion(items: Item[]): number {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
  const completedWeight = items.reduce((sum, item) => {
    const statusWeight = item.status === 'completed' ? 1 : item.status === 'in-progress' ? 0.5 : 0
    return sum + (item.weight * statusWeight)
  }, 0)
  return Math.round((completedWeight / totalWeight) * 100)
}

// Helper function to calculate system completion percentage
function calculateSystemCompletion(assemblies: Assembly[]): number {
  const totalWeight = assemblies.reduce((sum, assembly) => sum + assembly.weight, 0)
  const completedWeight = assemblies.reduce((sum, assembly) => {
    return sum + (assembly.weight * assembly.completionPercentage / 100)
  }, 0)
  return Math.round((completedWeight / totalWeight) * 100)
}

// Helper function to calculate overall drone completion
function calculateOverallCompletion(systems: System[]): number {
  const totalWeight = systems.reduce((sum, system) => sum + system.weight, 0)
  const completedWeight = systems.reduce((sum, system) => {
    return sum + (system.weight * system.completionPercentage / 100)
  }, 0)
  return Math.round((completedWeight / totalWeight) * 100)
}

// Helper to create items from definitions
function createItems(assemblyKey: string, itemDefs: readonly { name: string; weight: number }[], statusOverrides: { [key: string]: 'pending' | 'in-progress' | 'completed' } = {}): Item[] {
  return itemDefs.map((itemDef, index) => ({
    id: `${assemblyKey}-item-${index}`,
    name: itemDef.name,
    status: statusOverrides[itemDef.name] || 'pending',
    weight: itemDef.weight
  }))
}

// Helper to create assemblies from system definitions
function createAssemblies(systemKey: keyof typeof SYSTEM_DEFINITIONS, itemStatusOverrides: { [assemblyName: string]: { [itemName: string]: 'pending' | 'in-progress' | 'completed' } } = {}): Assembly[] {
  const systemDef = SYSTEM_DEFINITIONS[systemKey]
  return Object.entries(systemDef.assemblies).map(([assemblyName, assemblyDef]) => {
    const items = createItems(
      `${systemKey}-${assemblyName.replace(/\s+/g, '-').toLowerCase()}`,
      assemblyDef.items,
      itemStatusOverrides[assemblyName] || {}
    )
    return {
      id: `${systemKey}-${assemblyName.replace(/\s+/g, '-').toLowerCase()}`,
      name: assemblyDef.name,
      weight: assemblyDef.weight,
      items,
      completionPercentage: calculateAssemblyCompletion(items)
    }
  })
}

// Helper to create systems from definitions
function createSystems(systemStatusOverrides: { [systemName: string]: { [assemblyName: string]: { [itemName: string]: 'pending' | 'in-progress' | 'completed' } } } = {}): System[] {
  return Object.entries(SYSTEM_DEFINITIONS).map(([systemKey, systemDef]) => {
    const assemblies = createAssemblies(systemKey as keyof typeof SYSTEM_DEFINITIONS, systemStatusOverrides[systemKey] || {})
    return {
      id: systemKey,
      name: systemDef.name,
      weight: systemDef.weight,
      assemblies,
      completionPercentage: calculateSystemCompletion(assemblies)
    }
  })
}

// Create drone S1 (G1-M) - Early build stage
const s1SystemStatuses = {
  'power electronics': {
    'Battery Assembly': { 'Battery': 'in-progress' as const },
    'Busbar Assembly': {},
    'Power Harnessing Assembly': {}
  },
  structure: {
    'Frame Assembly': {
      'Composite Fuselage': 'completed' as const,
      'End Fittings': 'completed' as const,
      'Leg Brackets': 'in-progress' as const
    },
    'Landing Legs Assembly': { 'Tubing': 'in-progress' as const }
  },
  accessories: {},
  avionics: {
    'Avionics Assembly': { 'Interface Board': 'in-progress' as const }
  },
  propulsion: {
    'Lifter Assembly': { 'Lifter Motor': 'in-progress' as const }
  }
}

const s1Systems = createSystems(s1SystemStatuses)

// Create drone S2 (G1-C) - Mid build stage
const s2SystemStatuses = {
  'power electronics': {
    'Battery Assembly': { 
      'Battery': 'completed' as const,
      '3P Printed Battery Enclosure Pieces': 'completed' as const
    },
    'Busbar Assembly': {
      'Laser Cut Busbars': 'completed' as const,
      '3D Printed Enclosures': 'completed' as const
    },
    'Power Harnessing Assembly': {}
  },
  structure: {
    'Frame Assembly': {
      'Composite Fuselage': 'completed' as const,
      'End Fittings': 'completed' as const, 
      'Leg Brackets': 'completed' as const,
      'Tubing': 'completed' as const,
      'Joints': 'completed' as const
    },
    'Landing Legs Assembly': {
      'Tubing': 'completed' as const,
      'Joint': 'completed' as const,
      'Inserts': 'in-progress' as const
    }
  },
  accessories: {
    'Hadron Camera Assembly': { 'Hadron Camera': 'in-progress' as const }
  },
  avionics: {
    'Avionics Assembly': { 
      'Interface Board': 'completed' as const,
      'Magnetometer': 'completed' as const
    },
    'Bottom Hatch Assembly': {
      'Orin NX': 'in-progress' as const,
      'Skynode X': 'completed' as const
    }
  },
  propulsion: {
    'Lifter Assembly': {
      'Lifter Motor': 'completed' as const,
      'Lifter Props': 'completed' as const,
      'Lifter Hub': 'in-progress' as const
    },
    'Tractor IPIVPM Assembly': {
      'Tractor Motor': 'in-progress' as const
    }
  }
}

const s2Systems = createSystems(s2SystemStatuses)

// Create drone S3 (G1-M) - Nearly complete
const s3SystemStatuses = {
  'power electronics': {
    'Battery Assembly': { 
      'Battery': 'completed' as const,
      '3P Printed Battery Enclosure Pieces': 'completed' as const,
      'Battery Encolsure Hardware': 'completed' as const
    },
    'Busbar Assembly': {
      'Laser Cut Busbars': 'completed' as const,
      '3D Printed Enclosures': 'completed' as const,
      'Hardware': 'completed' as const,
      'Busbar Wire Harness': 'completed' as const
    },
    'Power Harnessing Assembly': {
      'Power Electronics Harnesses': 'completed' as const
    }
  },
  structure: {
    'Frame Assembly': {
      'Composite Fuselage': 'completed' as const,
      'End Fittings': 'completed' as const, 
      'Leg Brackets': 'completed' as const,
      'Tubing': 'completed' as const,
      'Joints': 'completed' as const,
      'Hardware': 'completed' as const,
      'Battery Guide': 'completed' as const,
      'Tunnel Closeout': 'completed' as const,
      'Payload Rail': 'completed' as const
    },
    'Landing Legs Assembly': {
      'Tubing': 'completed' as const,
      'Joint': 'completed' as const,
      'Inserts': 'completed' as const,
      'Landing Foot': 'completed' as const
    },
    'Cover Assembly': {
      'Composite Cover': 'completed' as const,
      'Gasket/Seal': 'completed' as const
    }
  },
  accessories: {
    'Hadron Camera Assembly': { 
      'Hadron Camera': 'completed' as const,
      'G-Hadron Gimbal': 'completed' as const,
      'Damping Mount': 'in-progress' as const
    },
    'Payload Mechanism Assembly': {
      'Servo': 'completed' as const,
      'Laser Cut Plates': 'completed' as const
    }
  },
  avionics: {
    'Avionics Assembly': { 
      'Interface Board': 'completed' as const,
      'Magnetometer': 'completed' as const,
      'Ethernet Switch': 'completed' as const,
      'Avionics Harnessing': 'completed' as const
    },
    'Bottom Hatch Assembly': {
      'Orin NX': 'completed' as const,
      'Skynode X': 'completed' as const,
      'Flightstack PCB': 'completed' as const,
      'Distributor PCB': 'completed' as const,
      'Bottom Cover': 'completed' as const,
      'MicroSD': 'completed' as const,
      'Teensy': 'in-progress' as const
    },
    'Doodle Labs Radio Assembly': {
      'Doodle Labs Air Radio': 'completed' as const,
      'Antenna': 'completed' as const
    },
    'Downward Lidar Assembly': {
      'SF30/D Lidar': 'completed' as const,
      'Mounting Pieces': 'completed' as const
    },
    'Ellipse-D GPS Assembly': {
      'Ellipse-D GPS': 'completed' as const,
      'Antennas': 'in-progress' as const
    }
  },
  propulsion: {
    'Lifter Assembly': {
      'Lifter Motor': 'completed' as const,
      'Lifter Props': 'completed' as const,
      'Lifter Hub': 'completed' as const,
      'Motor Mount': 'completed' as const,
      'Hardware': 'completed' as const
    },
    'Tractor IPIVPM Assembly': {
      'Tractor Motor': 'completed' as const,
      'Servo': 'completed' as const,
      'Tractor Props': 'in-progress' as const
    }
  }
}

const s3Systems = createSystems(s3SystemStatuses)

// Mock drone data
export const mockBuildDrones: BuildDrone[] = [
  {
    serial: 'S1',
    model: 'G1-M',
    status: 'in-progress',
    systems: s1Systems,
    overallCompletion: calculateOverallCompletion(s1Systems),
    startDate: '2024-01-15',
    estimatedCompletion: '2024-03-01'
  },
  {
    serial: 'S2',
    model: 'G1-C',
    status: 'in-progress',
    systems: s2Systems,
    overallCompletion: calculateOverallCompletion(s2Systems),
    startDate: '2024-01-20',
    estimatedCompletion: '2024-02-28'
  },
  {
    serial: 'S3',
    model: 'G1-M',
    status: 'in-progress',
    systems: s3Systems,
    overallCompletion: calculateOverallCompletion(s3Systems),
    startDate: '2024-01-10',
    estimatedCompletion: '2024-02-15'
  }
]

// Mock build activity
export const mockBuildActivity: BuildActivity[] = [
  {
    id: 'activity-001',
    droneSerial: 'S1',
    timestamp: '2024-01-19 14:23:45',
    itemName: 'Tubing',
    assemblyName: 'Landing Legs Assembly',
    systemName: 'Structure',
    action: 'started',
    notes: 'Beginning assembly of landing gear tubing components'
  },
  {
    id: 'activity-002',
    droneSerial: 'S2',
    timestamp: '2024-01-19 13:15:22',
    itemName: 'Tractor Motor',
    assemblyName: 'Tractor IPIVPM Assembly',
    systemName: 'Propulsion',
    action: 'started',
    notes: 'Installing tractor motor assemblies'
  },
  {
    id: 'activity-003',
    droneSerial: 'S1',
    timestamp: '2024-01-19 11:45:33',
    itemName: 'End Fittings',
    assemblyName: 'Frame Assembly',
    systemName: 'Structure',
    action: 'completed',
    notes: 'Frame end fittings assembly complete, passed quality check'
  },
  {
    id: 'activity-004',
    droneSerial: 'S3',
    timestamp: '2024-01-19 10:30:15',
    itemName: 'Teensy',
    assemblyName: 'Bottom Hatch Assembly',
    systemName: 'Avionics',
    action: 'started',
    notes: 'Installing and configuring Teensy microcontroller'
  },
  {
    id: 'activity-005',
    droneSerial: 'S2',
    timestamp: '2024-01-19 09:20:08',
    itemName: 'Laser Cut Busbars',
    assemblyName: 'Busbar Assembly',
    systemName: 'Power Electronics',
    action: 'completed',
    notes: 'Power distribution busbar installation complete'
  }
]
