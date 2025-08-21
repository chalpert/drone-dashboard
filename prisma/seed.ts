import { PrismaClient } from '@prisma/client'
import { SYSTEM_DEFINITIONS } from '../lib/types'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding Systems-Assemblies-Items structure ...')

  // Clear existing data in correct order (foreign key dependencies)
  await prisma.buildActivity.deleteMany()
  await prisma.droneItem.deleteMany()
  await prisma.droneAssembly.deleteMany()
  await prisma.droneSystem.deleteMany()
  await prisma.drone.deleteMany()
  await prisma.itemDefinition.deleteMany()
  await prisma.assemblyDefinition.deleteMany()
  await prisma.systemDefinition.deleteMany()

  // Create system definitions
  const systemDefinitions = []
  const assemblyDefinitions = []
  const itemDefinitions = []

  for (const [systemKey, systemData] of Object.entries(SYSTEM_DEFINITIONS)) {
    console.log(`Creating system: ${systemData.name}`)
    
    const systemDef = await prisma.systemDefinition.create({
      data: {
        name: systemData.name,
        weight: systemData.weight,
      }
    })
    systemDefinitions.push({ key: systemKey, name: systemData.name, id: systemDef.id, weight: systemData.weight })

    // Create assembly definitions for this system
    for (const [assemblyName, assemblyData] of Object.entries(systemData.assemblies)) {
      console.log(`  Creating assembly: ${assemblyData.name}`)
      
      const assemblyDef = await prisma.assemblyDefinition.create({
        data: {
          name: assemblyData.name,
          systemId: systemDef.id,
          weight: assemblyData.weight,
        }
      })
      assemblyDefinitions.push({ 
        systemKey, 
        assemblyName, 
        name: assemblyData.name, 
        id: assemblyDef.id, 
        weight: assemblyData.weight,
        systemId: systemDef.id
      })

      // Create item definitions for this assembly
      for (const itemData of assemblyData.items) {
        const itemDef = await prisma.itemDefinition.create({
          data: {
            name: itemData.name,
            assemblyId: assemblyDef.id,
            weight: itemData.weight,
          }
        })
        itemDefinitions.push({
          systemKey,
          assemblyName,
          name: itemData.name,
          id: itemDef.id,
          weight: itemData.weight,
          assemblyId: assemblyDef.id
        })
      }
    }
  }

  console.log(`Created ${systemDefinitions.length} systems, ${assemblyDefinitions.length} assemblies, ${itemDefinitions.length} items`)

  // Create sample drones with realistic data using new structure
  const sampleDrones = [
    {
      serial: 'S1',
      model: 'G1-M',
      status: 'in-progress',
      startDate: new Date('2024-01-15'),
      estimatedCompletion: new Date('2024-02-15'),
      itemStatuses: {
        'power electronics': {
          'Battery Assembly': { 'Battery': 'in-progress' },
          'Busbar Assembly': {},
          'Power Harnessing Assembly': {}
        },
        structure: {
          'Frame Assembly': {
            'Composite Fuselage': 'completed',
            'End Fittings': 'completed',
            'Leg Brackets': 'in-progress'
          },
          'Landing Legs Assembly': { 'Tubing': 'in-progress' }
        },
        accessories: {},
        avionics: {
          'Avionics Assembly': { 'Interface Board': 'in-progress' }
        },
        propulsion: {
          'Lifter Assembly': { 'Lifter Motor': 'in-progress' }
        }
      }
    },
    {
      serial: 'S2',
      model: 'G1-C',
      status: 'in-progress',
      startDate: new Date('2024-01-20'),
      estimatedCompletion: new Date('2024-02-20'),
      itemStatuses: {
        'power electronics': {
          'Battery Assembly': { 
            'Battery': 'completed',
            '3P Printed Battery Enclosure Pieces': 'completed' 
          },
          'Busbar Assembly': {
            'Laser Cut Busbars': 'completed',
            '3D Printed Enclosures': 'completed'
          },
          'Power Harnessing Assembly': {}
        },
        structure: {
          'Frame Assembly': {
            'Composite Fuselage': 'completed',
            'End Fittings': 'completed', 
            'Leg Brackets': 'completed',
            'Tubing': 'completed',
            'Joints': 'completed'
          },
          'Landing Legs Assembly': {
            'Tubing': 'completed',
            'Joint': 'completed',
            'Inserts': 'in-progress'
          }
        },
        accessories: {
          'Hadron Camera Assembly': { 'Hadron Camera': 'in-progress' }
        },
        avionics: {
          'Avionics Assembly': { 
            'Interface Board': 'completed',
            'Magnetometer': 'completed'
          },
          'Bottom Hatch Assembly': {
            'Orin NX': 'in-progress',
            'Skynode X': 'completed'
          }
        },
        propulsion: {
          'Lifter Assembly': {
            'Lifter Motor': 'completed',
            'Lifter Props': 'completed',
            'Lifter Hub': 'in-progress'
          },
          'Tractor IPIVPM Assembly': {
            'Tractor Motor': 'in-progress'
          }
        }
      }
    },
    {
      serial: 'S3',
      model: 'G1-M',
      status: 'pending',
      startDate: new Date('2024-01-10'),
      estimatedCompletion: new Date('2024-02-15'),
      itemStatuses: {
        'power electronics': {
          'Battery Assembly': { 
            'Battery': 'completed',
            '3P Printed Battery Enclosure Pieces': 'completed',
            'Battery Encolsure Hardware': 'completed'
          },
          'Busbar Assembly': {
            'Laser Cut Busbars': 'completed',
            '3D Printed Enclosures': 'completed',
            'Hardware': 'completed',
            'Busbar Wire Harness': 'completed'
          },
          'Power Harnessing Assembly': {
            'Power Electronics Harnesses': 'completed'
          }
        },
        structure: {
          'Frame Assembly': {
            'Composite Fuselage': 'completed',
            'End Fittings': 'completed', 
            'Leg Brackets': 'completed',
            'Tubing': 'completed',
            'Joints': 'completed',
            'Hardware': 'completed',
            'Battery Guide': 'completed',
            'Tunnel Closeout': 'completed',
            'Payload Rail': 'completed'
          },
          'Landing Legs Assembly': {
            'Tubing': 'completed',
            'Joint': 'completed',
            'Inserts': 'completed',
            'Landing Foot': 'completed'
          },
          'Cover Assembly': {
            'Composite Cover': 'completed',
            'Gasket/Seal': 'completed'
          }
        },
        accessories: {
          'Hadron Camera Assembly': { 
            'Hadron Camera': 'completed',
            'G-Hadron Gimbal': 'completed',
            'Damping Mount': 'in-progress'
          },
          'Payload Mechanism Assembly': {
            'Servo': 'completed',
            'Laser Cut Plates': 'completed'
          }
        },
        avionics: {
          'Avionics Assembly': { 
            'Interface Board': 'completed',
            'Magnetometer': 'completed',
            'Ethernet Switch': 'completed',
            'Avionics Harnessing': 'completed'
          },
          'Bottom Hatch Assembly': {
            'Orin NX': 'completed',
            'Skynode X': 'completed',
            'Flightstack PCB': 'completed',
            'Distributor PCB': 'completed',
            'Bottom Cover': 'completed',
            'MicroSD': 'completed',
            'Teensy': 'in-progress'
          },
          'Doodle Labs Radio Assembly': {
            'Doodle Labs Air Radio': 'completed',
            'Antenna': 'completed'
          },
          'Downward Lidar Assembly': {
            'SF30/D Lidar': 'completed',
            'Mounting Pieces': 'completed'
          },
          'Ellipse-D GPS Assembly': {
            'Ellipse-D GPS': 'completed',
            'Antennas': 'in-progress'
          }
        },
        propulsion: {
          'Lifter Assembly': {
            'Lifter Motor': 'completed',
            'Lifter Props': 'completed',
            'Lifter Hub': 'completed',
            'Motor Mount': 'completed',
            'Hardware': 'completed'
          },
          'Tractor IPIVPM Assembly': {
            'Tractor Motor': 'completed',
            'Servo': 'completed',
            'Tractor Props': 'in-progress'
          }
        }
      }
    }
  ]

  for (const droneData of sampleDrones) {
    console.log(`Creating drone ${droneData.serial}...`)
    
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

    let totalSystemsCompletedWeight = 0

    // Create drone systems, assemblies, and items
    for (const systemDef of systemDefinitions) {
      const droneSystem = await prisma.droneSystem.create({
        data: {
          droneId: drone.id,
          systemDefinitionId: systemDef.id,
          completionPercentage: 0, // Will be calculated
        }
      })

      let systemCompletedWeight = 0
      let systemTotalWeight = 0

      // Get assemblies for this system
      const systemAssemblies = assemblyDefinitions.filter(a => a.systemKey === systemDef.key)
      
      for (const assemblyDef of systemAssemblies) {
        const droneAssembly = await prisma.droneAssembly.create({
          data: {
            droneSystemId: droneSystem.id,
            assemblyDefinitionId: assemblyDef.id,
            completionPercentage: 0, // Will be calculated
          }
        })

        let assemblyCompletedWeight = 0
        let assemblyTotalWeight = 0

        // Get items for this assembly
        const assemblyItems = itemDefinitions.filter(i => 
          i.systemKey === systemDef.key && i.assemblyName === assemblyDef.assemblyName
        )

        for (const itemDef of assemblyItems) {
          const status = (droneData.itemStatuses as any)?.[systemDef.key]?.[assemblyDef.assemblyName]?.[itemDef.name] || 'pending'
          
          await prisma.droneItem.create({
            data: {
              droneAssemblyId: droneAssembly.id,
              itemDefinitionId: itemDef.id,
              status: status,
            }
          })

          assemblyTotalWeight += itemDef.weight
          if (status === 'completed') {
            assemblyCompletedWeight += itemDef.weight
          } else if (status === 'in-progress') {
            assemblyCompletedWeight += itemDef.weight * 0.5 // 50% credit for in-progress
          }
        }

        // Update assembly completion percentage
        const assemblyCompletion = assemblyTotalWeight > 0 ? (assemblyCompletedWeight / assemblyTotalWeight) * 100 : 0
        await prisma.droneAssembly.update({
          where: { id: droneAssembly.id },
          data: { completionPercentage: assemblyCompletion }
        })

        // Add to system totals
        systemTotalWeight += assemblyDef.weight
        systemCompletedWeight += (assemblyDef.weight * assemblyCompletion / 100)
      }

      // Update system completion percentage
      const systemCompletion = systemTotalWeight > 0 ? (systemCompletedWeight / systemTotalWeight) * 100 : 0
      await prisma.droneSystem.update({
        where: { id: droneSystem.id },
        data: { completionPercentage: systemCompletion }
      })

      // Add to overall drone completion
      totalSystemsCompletedWeight += (systemDef.weight * systemCompletion / 100)
    }

    // Update drone overall completion
    await prisma.drone.update({
      where: { id: drone.id },
      data: { overallCompletion: Math.round(totalSystemsCompletedWeight) }
    })

    // Create build activities for completed and in-progress items
    for (const [systemKey, assemblies] of Object.entries(droneData.itemStatuses || {})) {
      const systemName = systemDefinitions.find(s => s.key === systemKey)?.name || systemKey
      
      for (const [assemblyName, items] of Object.entries(assemblies as any)) {
        for (const [itemName, status] of Object.entries(items as any)) {
          if (status === 'completed' || status === 'in-progress') {
            await prisma.buildActivity.create({
              data: {
                droneId: drone.id,
                itemName: itemName,
                assemblyName: assemblyName,
                systemName: systemName,
                action: status === 'completed' ? 'completed' : 'started',
                status: status as string,
                timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random time in last 30 days
              }
            })
          }
        }
      }
    }

    console.log(`Created drone ${droneData.serial} with ${Math.round(totalSystemsCompletedWeight)}% completion`)
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
