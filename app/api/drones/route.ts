import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const drones = await prisma.drone.findMany({
      include: {
        categories: {
          include: {
            categoryDefinition: true,
            components: {
              include: {
                componentDefinition: true
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
      categories: drone.categories.map(category => ({
        id: category.id,
        name: category.categoryDefinition.name,
        weight: category.categoryDefinition.weight,
        completionPercentage: category.completionPercentage,
        components: category.components.map(component => ({
          id: component.id,
          name: component.componentDefinition.name,
          status: component.status,
          weight: component.componentDefinition.weight
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

    // Get all category definitions
    const categoryDefinitions = await prisma.categoryDefinition.findMany({
      include: {
        components: true
      }
    })

    // Create drone categories and components
    for (const categoryDef of categoryDefinitions) {
      const droneCategory = await prisma.droneCategory.create({
        data: {
          droneId: drone.id,
          categoryDefinitionId: categoryDef.id,
          completionPercentage: 0,
        }
      })

      // Create components for this category
      for (const componentDef of categoryDef.components) {
        await prisma.droneComponent.create({
          data: {
            droneCategoryId: droneCategory.id,
            componentDefinitionId: componentDef.id,
            status: 'pending',
          }
        })
      }
    }

    return NextResponse.json({ success: true, droneId: drone.id }, { status: 201 })
  } catch (error) {
    console.error('Error creating drone:', error)
    return NextResponse.json({ error: 'Failed to create drone' }, { status: 500 })
  }
}
