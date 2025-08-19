import { BuildDrone, ComponentCategory, Component, BuildActivity, COMPONENT_DEFINITIONS } from './types'

// Helper function to calculate category completion percentage
function calculateCategoryCompletion(components: Component[]): number {
  const totalWeight = components.reduce((sum, comp) => sum + comp.weight, 0)
  const completedWeight = components.reduce((sum, comp) => {
    const statusWeight = comp.status === 'completed' ? 1 : comp.status === 'in-progress' ? 0.5 : 0
    return sum + (comp.weight * statusWeight)
  }, 0)
  return Math.round((completedWeight / totalWeight) * 100)
}

// Helper function to calculate overall drone completion (only completed components)
function calculateOverallCompletion(categories: ComponentCategory[]): number {
  let totalCompleted = 0
  
  categories.forEach(category => {
    category.components.forEach(component => {
      if (component.status === 'completed') {
        // Calculate the actual weighted total for this component
        totalCompleted += (category.weight * component.weight / 100)
      }
    })
  })
  
  return Math.round(totalCompleted)
}

// Helper to create components from definitions
function createComponents(categoryKey: keyof typeof COMPONENT_DEFINITIONS, statusOverrides: { [key: string]: 'pending' | 'in-progress' | 'completed' } = {}): Component[] {
  const definition = COMPONENT_DEFINITIONS[categoryKey]
  return definition.components.map((comp, index) => ({
    id: `${categoryKey}-${index}`,
    name: comp.name,
    status: statusOverrides[comp.name] || 'pending',
    weight: comp.weight
  }))
}

// Create drone S1 (G1-M) - Early build stage
const s1Components = {
  airframe: createComponents('airframe', {
    'Composite': 'completed',
    'Diamond Frame': 'completed',
    'Legs': 'in-progress',
    'Payload Rails': 'pending'
  }),
  propulsion: createComponents('propulsion', {
    'Lifters': 'in-progress'
  }),
  tractors: createComponents('tractors'),
  power: createComponents('power'),
  wiring: createComponents('wiring'),
  avionics: createComponents('avionics'),
  radio: createComponents('radio'),
  camera: createComponents('camera')
}

const s1Categories: ComponentCategory[] = [
  {
    id: 'airframe',
    name: 'Airframe',
    weight: COMPONENT_DEFINITIONS.airframe.weight,
    components: s1Components.airframe,
    completionPercentage: calculateCategoryCompletion(s1Components.airframe)
  },
  {
    id: 'propulsion',
    name: 'Propulsion',
    weight: COMPONENT_DEFINITIONS.propulsion.weight,
    components: s1Components.propulsion,
    completionPercentage: calculateCategoryCompletion(s1Components.propulsion)
  },
  {
    id: 'tractors',
    name: 'Tractors',
    weight: COMPONENT_DEFINITIONS.tractors.weight,
    components: s1Components.tractors,
    completionPercentage: calculateCategoryCompletion(s1Components.tractors)
  },
  {
    id: 'power',
    name: 'Power',
    weight: COMPONENT_DEFINITIONS.power.weight,
    components: s1Components.power,
    completionPercentage: calculateCategoryCompletion(s1Components.power)
  },
  {
    id: 'wiring',
    name: 'Wire Harnessing',
    weight: COMPONENT_DEFINITIONS.wiring.weight,
    components: s1Components.wiring,
    completionPercentage: calculateCategoryCompletion(s1Components.wiring)
  },
  {
    id: 'avionics',
    name: 'Avionics',
    weight: COMPONENT_DEFINITIONS.avionics.weight,
    components: s1Components.avionics,
    completionPercentage: calculateCategoryCompletion(s1Components.avionics)
  },
  {
    id: 'radio',
    name: 'Radio',
    weight: COMPONENT_DEFINITIONS.radio.weight,
    components: s1Components.radio,
    completionPercentage: calculateCategoryCompletion(s1Components.radio)
  },
  {
    id: 'camera',
    name: 'Camera',
    weight: COMPONENT_DEFINITIONS.camera.weight,
    components: s1Components.camera,
    completionPercentage: calculateCategoryCompletion(s1Components.camera)
  }
]

// Create drone S2 (G1-C) - Mid build stage
const s2Components = {
  airframe: createComponents('airframe', {
    'Composite': 'completed',
    'Diamond Frame': 'completed',
    'Legs': 'completed',
    'Payload Rails': 'completed'
  }),
  propulsion: createComponents('propulsion', {
    'Lifters': 'completed'
  }),
  tractors: createComponents('tractors', {
    'Tractor Install': 'in-progress',
    'Tractor Assembly': 'completed',
    'ESC Install': 'pending'
  }),
  power: createComponents('power', {
    'Busbar': 'completed'
  }),
  wiring: createComponents('wiring', {
    'Powertrain Harnessing': 'in-progress',
    'Avionics Harnessing': 'pending'
  }),
  avionics: createComponents('avionics'),
  radio: createComponents('radio'),
  camera: createComponents('camera')
}

const s2Categories: ComponentCategory[] = [
  {
    id: 'airframe',
    name: 'Airframe',
    weight: COMPONENT_DEFINITIONS.airframe.weight,
    components: s2Components.airframe,
    completionPercentage: calculateCategoryCompletion(s2Components.airframe)
  },
  {
    id: 'propulsion',
    name: 'Propulsion',
    weight: COMPONENT_DEFINITIONS.propulsion.weight,
    components: s2Components.propulsion,
    completionPercentage: calculateCategoryCompletion(s2Components.propulsion)
  },
  {
    id: 'tractors',
    name: 'Tractors',
    weight: COMPONENT_DEFINITIONS.tractors.weight,
    components: s2Components.tractors,
    completionPercentage: calculateCategoryCompletion(s2Components.tractors)
  },
  {
    id: 'power',
    name: 'Power',
    weight: COMPONENT_DEFINITIONS.power.weight,
    components: s2Components.power,
    completionPercentage: calculateCategoryCompletion(s2Components.power)
  },
  {
    id: 'wiring',
    name: 'Wire Harnessing',
    weight: COMPONENT_DEFINITIONS.wiring.weight,
    components: s2Components.wiring,
    completionPercentage: calculateCategoryCompletion(s2Components.wiring)
  },
  {
    id: 'avionics',
    name: 'Avionics',
    weight: COMPONENT_DEFINITIONS.avionics.weight,
    components: s2Components.avionics,
    completionPercentage: calculateCategoryCompletion(s2Components.avionics)
  },
  {
    id: 'radio',
    name: 'Radio',
    weight: COMPONENT_DEFINITIONS.radio.weight,
    components: s2Components.radio,
    completionPercentage: calculateCategoryCompletion(s2Components.radio)
  },
  {
    id: 'camera',
    name: 'Camera',
    weight: COMPONENT_DEFINITIONS.camera.weight,
    components: s2Components.camera,
    completionPercentage: calculateCategoryCompletion(s2Components.camera)
  }
]

// Create drone S3 (G1-M) - Nearly complete
const s3Components = {
  airframe: createComponents('airframe', {
    'Composite': 'completed',
    'Diamond Frame': 'completed',
    'Legs': 'completed',
    'Payload Rails': 'completed'
  }),
  propulsion: createComponents('propulsion', {
    'Lifters': 'completed'
  }),
  tractors: createComponents('tractors', {
    'Tractor Install': 'completed',
    'Tractor Assembly': 'completed',
    'ESC Install': 'completed'
  }),
  power: createComponents('power', {
    'Busbar': 'completed'
  }),
  wiring: createComponents('wiring', {
    'Powertrain Harnessing': 'completed',
    'Avionics Harnessing': 'completed'
  }),
  avionics: createComponents('avionics', {
    'Flight Stack': 'completed',
    'Distribution Board': 'completed',
    'Interface Board': 'completed',
    'GPS Magnetometer': 'completed',
    'Downward LiDAR': 'completed',
    'Mission Computer': 'in-progress',
    'Skynode X': 'pending',
    'Carrier Board': 'pending',
    'Running Lights': 'pending',
    'RS232 Plugin': 'pending'
  }),
  radio: createComponents('radio', {
    'Radio System': 'completed'
  }),
  camera: createComponents('camera', {
    'Camera System': 'in-progress'
  })
}

const s3Categories: ComponentCategory[] = [
  {
    id: 'airframe',
    name: 'Airframe',
    weight: COMPONENT_DEFINITIONS.airframe.weight,
    components: s3Components.airframe,
    completionPercentage: calculateCategoryCompletion(s3Components.airframe)
  },
  {
    id: 'propulsion',
    name: 'Propulsion',
    weight: COMPONENT_DEFINITIONS.propulsion.weight,
    components: s3Components.propulsion,
    completionPercentage: calculateCategoryCompletion(s3Components.propulsion)
  },
  {
    id: 'tractors',
    name: 'Tractors',
    weight: COMPONENT_DEFINITIONS.tractors.weight,
    components: s3Components.tractors,
    completionPercentage: calculateCategoryCompletion(s3Components.tractors)
  },
  {
    id: 'power',
    name: 'Power',
    weight: COMPONENT_DEFINITIONS.power.weight,
    components: s3Components.power,
    completionPercentage: calculateCategoryCompletion(s3Components.power)
  },
  {
    id: 'wiring',
    name: 'Wire Harnessing',
    weight: COMPONENT_DEFINITIONS.wiring.weight,
    components: s3Components.wiring,
    completionPercentage: calculateCategoryCompletion(s3Components.wiring)
  },
  {
    id: 'avionics',
    name: 'Avionics',
    weight: COMPONENT_DEFINITIONS.avionics.weight,
    components: s3Components.avionics,
    completionPercentage: calculateCategoryCompletion(s3Components.avionics)
  },
  {
    id: 'radio',
    name: 'Radio',
    weight: COMPONENT_DEFINITIONS.radio.weight,
    components: s3Components.radio,
    completionPercentage: calculateCategoryCompletion(s3Components.radio)
  },
  {
    id: 'camera',
    name: 'Camera',
    weight: COMPONENT_DEFINITIONS.camera.weight,
    components: s3Components.camera,
    completionPercentage: calculateCategoryCompletion(s3Components.camera)
  }
]

// Mock drone data
export const mockBuildDrones: BuildDrone[] = [
  {
    serial: 'S1',
    model: 'G1-M',
    status: 'in-progress',
    categories: s1Categories,
    overallCompletion: calculateOverallCompletion(s1Categories),
    startDate: '2024-01-15',
    estimatedCompletion: '2024-03-01'
  },
  {
    serial: 'S2',
    model: 'G1-C',
    status: 'in-progress',
    categories: s2Categories,
    overallCompletion: calculateOverallCompletion(s2Categories),
    startDate: '2024-01-20',
    estimatedCompletion: '2024-02-28'
  },
  {
    serial: 'S3',
    model: 'G1-M',
    status: 'in-progress',
    categories: s3Categories,
    overallCompletion: calculateOverallCompletion(s3Categories),
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
    component: 'Legs',
    category: 'Airframe',
    action: 'started',
    notes: 'Beginning assembly of landing gear components'
  },
  {
    id: 'activity-002',
    droneSerial: 'S2',
    timestamp: '2024-01-19 13:15:22',
    component: 'Tractor Install',
    category: 'Tractors',
    action: 'started',
    notes: 'Installing tractor motor assemblies'
  },
  {
    id: 'activity-003',
    droneSerial: 'S1',
    timestamp: '2024-01-19 11:45:33',
    component: 'Diamond Frame',
    category: 'Airframe',
    action: 'completed',
    notes: 'Frame assembly complete, passed quality check'
  },
  {
    id: 'activity-004',
    droneSerial: 'S3',
    timestamp: '2024-01-19 10:30:15',
    component: 'Mission Computer',
    category: 'Avionics',
    action: 'started',
    notes: 'Installing and configuring mission computer'
  },
  {
    id: 'activity-005',
    droneSerial: 'S2',
    timestamp: '2024-01-19 09:20:08',
    component: 'Busbar',
    category: 'Power',
    action: 'completed',
    notes: 'Power distribution busbar installation complete'
  }
]
