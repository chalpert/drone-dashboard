import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { triggerItemStatusChange } from '@/lib/integrations/database-hooks'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ serial: string }> }
) {
  const { serial } = await params;
  try {
  const { itemId, status } = await request.json()

    if (!itemId || !status) {
      return NextResponse.json({ error: 'Item ID and status are required' }, { status: 400 })
    }

    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Find the drone
    const drone = await prisma.drone.findUnique({
      where: { serial },
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
        }
      }
    })

    if (!drone) {
      return NextResponse.json({ error: 'Drone not found' }, { status: 404 })
    }

    // Get current item status before updating
    const currentItem = await prisma.droneItem.findUnique({
      where: { id: itemId },
      select: { status: true }
    })

    const oldStatus = currentItem?.status || 'pending'

    // Update item status
    const updatedItem = await prisma.droneItem.update({
      where: { id: itemId },
      data: { status },
      include: {
        itemDefinition: true,
        droneAssembly: {
          include: {
            assemblyDefinition: true,
            droneSystem: {
              include: {
                systemDefinition: true
              }
            }
          }
        }
      }
    })

    // Create build activity log
    await prisma.buildActivity.create({
      data: {
        droneId: drone.id,
        itemName: updatedItem.itemDefinition.name,
        assemblyName: updatedItem.droneAssembly.assemblyDefinition.name,
        systemName: updatedItem.droneAssembly.droneSystem.systemDefinition.name,
        action: status === 'completed' ? 'completed' : status === 'in-progress' ? 'started' : 'updated',
        status: status,
      }
    })

    // Recalculate assembly completion
    const assembly = await prisma.droneAssembly.findUnique({
      where: { id: updatedItem.droneAssemblyId },
      include: {
        items: {
          include: {
            itemDefinition: true
          }
        },
        assemblyDefinition: true,
        droneSystem: {
          include: {
            systemDefinition: true
          }
        }
      }
    })

    if (assembly) {
      let assemblyCompletedWeight = 0
      let assemblyTotalWeight = 0

      for (const item of assembly.items) {
        assemblyTotalWeight += item.itemDefinition.weight
        if (item.status === 'completed') {
          assemblyCompletedWeight += item.itemDefinition.weight
        } else if (item.status === 'in-progress') {
          assemblyCompletedWeight += item.itemDefinition.weight * 0.5 // 50% credit for in-progress
        }
      }

      const assemblyCompletion = assemblyTotalWeight > 0 ? (assemblyCompletedWeight / assemblyTotalWeight) * 100 : 0

      await prisma.droneAssembly.update({
        where: { id: assembly.id },
        data: { completionPercentage: assemblyCompletion }
      })

      // Recalculate system completion
      const allAssemblies = await prisma.droneAssembly.findMany({
        where: { droneSystemId: assembly.droneSystemId },
        include: {
          assemblyDefinition: true
        }
      })

      let systemCompletedWeight = 0
      let systemTotalWeight = 0

      for (const asm of allAssemblies) {
        systemTotalWeight += asm.assemblyDefinition.weight
        systemCompletedWeight += (asm.assemblyDefinition.weight * asm.completionPercentage / 100)
      }

      const systemCompletion = systemTotalWeight > 0 ? (systemCompletedWeight / systemTotalWeight) * 100 : 0

      await prisma.droneSystem.update({
        where: { id: assembly.droneSystemId },
        data: { completionPercentage: systemCompletion }
      })

      // Recalculate drone overall completion
      const allSystems = await prisma.droneSystem.findMany({
        where: { droneId: drone.id },
        include: {
          systemDefinition: true
        }
      })

      let totalCompletedWeight = 0
      
      for (const system of allSystems) {
        totalCompletedWeight += (system.systemDefinition.weight * system.completionPercentage / 100)
      }

      // Update drone overall completion and status
      let droneStatus = drone.status
      if (totalCompletedWeight >= 99.9) { // Close to 100% due to rounding
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

    // Trigger integration hooks for real-time notifications
    if (oldStatus !== status) {
      try {
        await triggerItemStatusChange(serial, itemId, oldStatus, status)
      } catch (integrationError) {
        console.error('Integration hook error:', integrationError)
        // Don't fail the main request if integrations fail
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating component:', error)
    return NextResponse.json({ error: 'Failed to update component' }, { status: 500 })
  }
}
