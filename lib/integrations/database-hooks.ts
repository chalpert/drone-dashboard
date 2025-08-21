// Database Integration Hooks for Real-time Updates

import { prisma } from '@/lib/prisma'
import { createSlackIntegration, DroneProgressEvent } from './slack'
import { triggerWebhook } from './webhook-utils'


export interface DatabaseChangeEvent {
  type: 'item_status_changed' | 'drone_progress_updated' | 'system_completed'
  droneSerial: string
  itemId?: string
  systemId?: string
  assemblyId?: string
  oldStatus?: string
  newStatus?: string
  timestamp: string
}

export class DatabaseIntegrationHooks {
  private slackIntegration = createSlackIntegration()

  async handleItemStatusChange(event: DatabaseChangeEvent): Promise<void> {
    if (event.type !== 'item_status_changed' || !event.itemId) return

    try {
      // Get full drone data to calculate new completion percentages
      const drone = await this.getDroneWithProgress(event.droneSerial)
      if (!drone) return

      // Find the specific item that changed
      const changedItem = this.findItemInDrone(drone, event.itemId)
      if (!changedItem) return

      // Create progress event
      const progressEvent: DroneProgressEvent = {
        droneSerial: event.droneSerial,
        model: drone.model,
        overallCompletion: drone.overallCompletion,
        systemName: changedItem.systemName,
        assemblyName: changedItem.assemblyName,
        itemName: changedItem.itemName,
        timestamp: event.timestamp
      }

      // Trigger notifications based on the status change
      if (event.newStatus === 'completed') {
        // Item completed
        await this.slackIntegration?.notifyItemCompletion(progressEvent)
        
        // Check if this completed a system
        if (changedItem.systemCompletion === 100) {
          await this.slackIntegration?.notifySystemCompletion(progressEvent)
        }
        
        // Check if this completed the entire drone
        if (drone.overallCompletion >= 100) {
          await this.slackIntegration?.notifyDroneCompletion(progressEvent)
        }
      }

      // Always check for milestone notifications
      await this.slackIntegration?.notifyMilestone(progressEvent)

      // Trigger generic webhooks
      await triggerWebhook('item_status_changed', {
        droneSerial: event.droneSerial,
        itemName: changedItem.itemName,
        systemName: changedItem.systemName,
        assemblyName: changedItem.assemblyName,
        oldStatus: event.oldStatus,
        newStatus: event.newStatus,
        overallCompletion: drone.overallCompletion,
        timestamp: event.timestamp
      })

      // Broadcast WebSocket update
      await this.broadcastWebSocketUpdate(drone, event)

    } catch (error) {
      console.error('Database integration hook error:', error)
    }
  }

  private async getDroneWithProgress(droneSerial: string) {
    return await prisma.drone.findUnique({
      where: { serial: droneSerial },
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
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private findItemInDrone(drone: any, itemId: string) {
    for (const system of drone.systems) {
      for (const assembly of system.assemblies) {
        for (const item of assembly.items) {
          if (item.id === itemId) {
            return {
              itemName: item.itemDefinition.name,
              systemName: system.systemDefinition.name,
              assemblyName: assembly.assemblyDefinition.name,
              systemCompletion: system.completionPercentage
            }
          }
        }
      }
    }
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async broadcastWebSocketUpdate(drone: any, event: DatabaseChangeEvent) {
    // This would integrate with the WebSocket server to broadcast real-time updates
    // For now, we'll create a simple HTTP call to trigger the WebSocket broadcast
    
    try {
      const response = await fetch('http://localhost:3003/trigger-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'drone_progress_update',
          droneSerial: event.droneSerial,
          overallCompletion: drone.overallCompletion,
          timestamp: event.timestamp
        }),
      })

      if (!response.ok) {
        console.warn('Failed to trigger WebSocket update:', response.statusText)
      }
    } catch (error) {
      console.warn('WebSocket update trigger failed:', error)
    }
  }
}

// Singleton instance
export const databaseHooks = new DatabaseIntegrationHooks()

// Helper function to trigger hooks from API routes
export async function triggerItemStatusChange(
  droneSerial: string,
  itemId: string,
  oldStatus: string,
  newStatus: string
) {
  const event: DatabaseChangeEvent = {
    type: 'item_status_changed',
    droneSerial,
    itemId,
    oldStatus,
    newStatus,
    timestamp: new Date().toISOString()
  }

  await databaseHooks.handleItemStatusChange(event)
}
