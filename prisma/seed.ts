import { PrismaClient } from '@prisma/client'
import { COMPONENT_DEFINITIONS } from '../lib/types'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // Clear existing data
  await prisma.buildActivity.deleteMany()
  await prisma.droneComponent.deleteMany()
  await prisma.droneCategory.deleteMany()
  await prisma.drone.deleteMany()
  await prisma.componentDefinition.deleteMany()
  await prisma.categoryDefinition.deleteMany()

  // Create category definitions
  const categoryDefinitions = []
  for (const [categoryKey, categoryData] of Object.entries(COMPONENT_DEFINITIONS)) {
    const categoryDef = await prisma.categoryDefinition.create({
      data: {
        name: categoryData.name,
        weight: categoryData.weight,
      }
    })
    categoryDefinitions.push({ name: categoryData.name, id: categoryDef.id, weight: categoryData.weight })

    // Create component definitions for this category
    for (const component of categoryData.components) {
      await prisma.componentDefinition.create({
        data: {
          name: component.name,
          categoryId: categoryDef.id,
          weight: component.weight,
        }
      })
    }
  }

  // Create sample drones with realistic data
  const sampleDrones = [
    {
      serial: 'S1',
      model: 'G1-M',
      status: 'in-progress',
      startDate: new Date('2024-01-15'),
      estimatedCompletion: new Date('2024-02-15'),
      componentStatuses: {
        'Airframe': { 'Composite': 'completed', 'Diamond Frame': 'completed', 'Legs': 'pending', 'Payload Rails': 'pending' },
        'Propulsion': { 'Lifters': 'pending' },
        'Tractors': { 'Tractor Install': 'pending', 'Tractor Assembly': 'pending', 'ESC Install': 'pending' },
        'Power': { 'Busbar': 'pending' },
        'Wire Harnessing': { 'Powertrain Harnessing': 'pending', 'Avionics Harnessing': 'pending' },
        'Avionics': { 'Flight Stack': 'pending', 'Distribution Board': 'pending', 'Interface Board': 'pending', 'GPS Magnetometer': 'pending', 'Downward LiDAR': 'pending', 'Mission Computer': 'pending', 'Skynode X': 'pending', 'Carrier Board': 'pending', 'Running Lights': 'pending', 'RS232 Plugin': 'pending' },
        'Radio': { 'Radio System': 'pending' },
        'Camera': { 'Camera System': 'pending' }
      }
    },
    {
      serial: 'S2',
      model: 'G1-C',
      status: 'in-progress',
      startDate: new Date('2024-01-20'),
      estimatedCompletion: new Date('2024-02-20'),
      componentStatuses: {
        'Airframe': { 'Composite': 'completed', 'Diamond Frame': 'completed', 'Legs': 'completed', 'Payload Rails': 'completed' },
        'Propulsion': { 'Lifters': 'completed' },
        'Tractors': { 'Tractor Install': 'completed', 'Tractor Assembly': 'completed', 'ESC Install': 'completed' },
        'Power': { 'Busbar': 'completed' },
        'Wire Harnessing': { 'Powertrain Harnessing': 'completed', 'Avionics Harnessing': 'in-progress' },
        'Avionics': { 'Flight Stack': 'completed', 'Distribution Board': 'completed', 'Interface Board': 'completed', 'GPS Magnetometer': 'in-progress', 'Downward LiDAR': 'pending', 'Mission Computer': 'pending', 'Skynode X': 'pending', 'Carrier Board': 'pending', 'Running Lights': 'pending', 'RS232 Plugin': 'pending' },
        'Radio': { 'Radio System': 'pending' },
        'Camera': { 'Camera System': 'pending' }
      }
    },
    {
      serial: 'S3',
      model: 'G1-M',
      status: 'pending',
      componentStatuses: {}
    }
  ]

  for (const droneData of sampleDrones) {
    // Create the drone
    const drone = await prisma.drone.create({
      data: {
        serial: droneData.serial,
        model: droneData.model,
        status: droneData.status,
        startDate: droneData.startDate,
        estimatedCompletion: droneData.estimatedCompletion,
        overallCompletion: 0, // Will be calculated
      }
    })

    let totalCompletedWeight = 0
    const categoryDataForCalculation = []

    // Create drone categories and components
    for (const categoryDef of categoryDefinitions) {
      const droneCategory = await prisma.droneCategory.create({
        data: {
          droneId: drone.id,
          categoryDefinitionId: categoryDef.id,
          completionPercentage: 0, // Will be calculated
        }
      })

      // Get all component definitions for this category
      const componentDefs = await prisma.componentDefinition.findMany({
        where: { categoryId: categoryDef.id }
      })

      let categoryCompletedWeight = 0
      let categoryTotalWeight = 0
      const completedComponents = []

      for (const componentDef of componentDefs) {
        const status = (droneData.componentStatuses as any)?.[categoryDef.name]?.[componentDef.name] || 'pending'
        
        await prisma.droneComponent.create({
          data: {
            droneCategoryId: droneCategory.id,
            componentDefinitionId: componentDef.id,
            status: status,
          }
        })

        categoryTotalWeight += componentDef.weight
        if (status === 'completed') {
          categoryCompletedWeight += componentDef.weight
          completedComponents.push({
            weight: componentDef.weight,
            categoryWeight: categoryDef.weight
          })
        }
      }

      // Update category completion percentage
      const categoryCompletion = categoryTotalWeight > 0 ? (categoryCompletedWeight / categoryTotalWeight) * 100 : 0
      await prisma.droneCategory.update({
        where: { id: droneCategory.id },
        data: { completionPercentage: categoryCompletion }
      })

      categoryDataForCalculation.push({ categoryDef, completedComponents })
    }

    // Calculate overall completion based on individual component weights
    for (const categoryData of categoryDataForCalculation) {
      for (const component of categoryData.completedComponents) {
        // Calculate the component's contribution to overall completion
        // (category weight * component weight within category) / 100
        const componentOverallWeight = (categoryData.categoryDef.weight * component.weight) / 100
        totalCompletedWeight += componentOverallWeight
      }
    }

    // Update drone overall completion
    await prisma.drone.update({
      where: { id: drone.id },
      data: { overallCompletion: totalCompletedWeight }
    })

    // Create some build activities for completed components
    for (const [categoryName, components] of Object.entries(droneData.componentStatuses || {})) {
      for (const [componentName, status] of Object.entries(components)) {
        if (status === 'completed') {
          await prisma.buildActivity.create({
            data: {
              droneId: drone.id,
              componentName: componentName,
              action: 'completed',
              status: status,
              timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random time in last 30 days
            }
          })
        }
      }
    }

    console.log(`Created drone ${droneData.serial} with ${totalCompletedWeight}% completion`)
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
