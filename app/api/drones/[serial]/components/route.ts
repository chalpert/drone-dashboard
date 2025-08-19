import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { serial: string } }
) {
  const { serial } = params;
  try {
  const { componentId, status } = await request.json()

    if (!componentId || !status) {
      return NextResponse.json({ error: 'Component ID and status are required' }, { status: 400 })
    }

    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Find the drone
    const drone = await prisma.drone.findUnique({
      where: { serial },
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
        }
      }
    })

    if (!drone) {
      return NextResponse.json({ error: 'Drone not found' }, { status: 404 })
    }

    // Update component status
    const updatedComponent = await prisma.droneComponent.update({
      where: { id: componentId },
      data: { status },
      include: {
        componentDefinition: true,
        droneCategory: {
          include: {
            categoryDefinition: true
          }
        }
      }
    })

    // Create build activity log
    await prisma.buildActivity.create({
      data: {
        droneId: drone.id,
        componentName: updatedComponent.componentDefinition.name,
        action: status === 'completed' ? 'completed' : status === 'in-progress' ? 'started' : 'updated',
        status: status,
      }
    })

    // Recalculate category completion
    const category = await prisma.droneCategory.findUnique({
      where: { id: updatedComponent.droneCategoryId },
      include: {
        components: {
          include: {
            componentDefinition: true
          }
        }
      }
    })

    if (category) {
      let categoryCompletedWeight = 0
      let categoryTotalWeight = 0

      for (const component of category.components) {
        categoryTotalWeight += component.componentDefinition.weight
        if (component.status === 'completed') {
          categoryCompletedWeight += component.componentDefinition.weight
        }
      }

      const categoryCompletion = categoryTotalWeight > 0 ? (categoryCompletedWeight / categoryTotalWeight) * 100 : 0

      await prisma.droneCategory.update({
        where: { id: category.id },
        data: { completionPercentage: categoryCompletion }
      })

      // Recalculate drone overall completion based on individual component weights
      const allCategories = await prisma.droneCategory.findMany({
        where: { droneId: drone.id },
        include: {
          categoryDefinition: true,
          components: {
            include: {
              componentDefinition: true
            }
          }
        }
      })

      let totalCompletedWeight = 0
      
      // Sum up completed component weights across all categories
      for (const cat of allCategories) {
        for (const component of cat.components) {
          if (component.status === 'completed') {
            // Calculate the component's contribution to overall completion
            // (category weight * component weight within category) / 100
            const componentOverallWeight = (cat.categoryDefinition.weight * component.componentDefinition.weight) / 100
            totalCompletedWeight += componentOverallWeight
          }
        }
      }

      // Update drone overall completion and status
      let droneStatus = drone.status
      if (totalCompletedWeight === 100) {
        droneStatus = 'completed'
      } else if (totalCompletedWeight > 0) {
        droneStatus = 'in-progress'
      }

      await prisma.drone.update({
        where: { id: drone.id },
        data: { 
          overallCompletion: Math.round(totalCompletedWeight * 10) / 10, // Round to 1 decimal place
          status: droneStatus
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating component:', error)
    return NextResponse.json({ error: 'Failed to update component' }, { status: 500 })
  }
}
