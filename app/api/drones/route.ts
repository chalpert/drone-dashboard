import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const drones = await prisma.drone.findMany({
      include: {
        systems: {
          include: {
            systemDefinition: true,
            assemblies: {
              include: {
                assemblyDefinition: true,
                items: {
                  include: {
                    itemDefinition: true
                  }
                }
              }
            }
          }
        },
        buildActivities: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 10 // Get latest 10 activities per drone
        }
      },
      orderBy: {
        serial: 'asc'
      }
    })

    // Transform to match our frontend interface
    const transformedDrones = drones.map(drone => ({
      serial: drone.serial,
      model: drone.model,
      status: drone.status,
      overallCompletion: Math.round(drone.overallCompletion * 10) / 10, // Round to 1 decimal place
      startDate: drone.startDate?.toISOString(),
      estimatedCompletion: drone.estimatedCompletion?.toISOString(),
      buildActivities: drone.buildActivities.map(activity => ({
        id: activity.id,
        droneSerial: drone.serial,
        timestamp: activity.timestamp.toISOString(),
        itemName: activity.itemName,
        assemblyName: activity.assemblyName,
        systemName: activity.systemName,
        action: activity.action,
        notes: activity.status // Using status field for notes
      })),
      systems: drone.systems.map(system => ({
        id: system.id,
        name: system.systemDefinition.name,
        weight: system.systemDefinition.weight,
        completionPercentage: system.completionPercentage,
        assemblies: system.assemblies.map(assembly => ({
          id: assembly.id,
          name: assembly.assemblyDefinition.name,
          weight: assembly.assemblyDefinition.weight,
          completionPercentage: assembly.completionPercentage,
          items: assembly.items.map(item => ({
            id: item.id,
            name: item.itemDefinition.name,
            status: item.status,
            weight: item.itemDefinition.weight
          }))
        }))
      }))
    }))

    return NextResponse.json(transformedDrones)
  } catch (error) {
    console.error('Error fetching drones:', error)
    return NextResponse.json({ error: 'Failed to fetch drones' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { serial, model } = await request.json()

    if (!serial || !model) {
      return NextResponse.json({ error: 'Serial and model are required' }, { status: 400 })
    }

    // Check if drone already exists
    const existingDrone = await prisma.drone.findUnique({
      where: { serial }
    })

    if (existingDrone) {
      return NextResponse.json({ error: 'Drone with this serial already exists' }, { status: 400 })
    }

    // Create new drone
    const drone = await prisma.drone.create({
      data: {
        serial,
        model,
        status: 'pending',
        overallCompletion: 0,
      }
    })

    // Get all system definitions with their assemblies and items
    const systemDefinitions = await prisma.systemDefinition.findMany({
      include: {
        assemblies: {
          include: {
            items: true
          }
        }
      }
    })

    // Create drone systems, assemblies, and items
    for (const systemDef of systemDefinitions) {
      const droneSystem = await prisma.droneSystem.create({
        data: {
          droneId: drone.id,
          systemDefinitionId: systemDef.id,
          completionPercentage: 0,
        }
      })

      // Create assemblies for this system
      for (const assemblyDef of systemDef.assemblies) {
        const droneAssembly = await prisma.droneAssembly.create({
          data: {
            droneSystemId: droneSystem.id,
            assemblyDefinitionId: assemblyDef.id,
            completionPercentage: 0,
          }
        })

        // Create items for this assembly
        for (const itemDef of assemblyDef.items) {
          await prisma.droneItem.create({
            data: {
              droneAssemblyId: droneAssembly.id,
              itemDefinitionId: itemDef.id,
              status: 'pending',
            }
          })
        }
      }
    }

    return NextResponse.json({ success: true, droneId: drone.id }, { status: 201 })
  } catch (error) {
    console.error('Error creating drone:', error)
    return NextResponse.json({ error: 'Failed to create drone' }, { status: 500 })
  }
}
