// Slack Integration Helper Functions

export interface SlackNotificationConfig {
  webhookUrl: string
  channel?: string
  username?: string
  iconEmoji?: string
  enableMilestones: boolean
  enableItemCompletions: boolean
  enableSystemCompletions: boolean
  enableDroneCompletions: boolean
  milestoneThresholds: number[] // e.g., [25, 50, 75, 100]
}

export interface DroneProgressEvent {
  droneSerial: string
  model: string
  overallCompletion: number
  systemName?: string
  assemblyName?: string
  itemName?: string
  previousCompletion?: number
  timestamp: string
}

export class SlackIntegration {
  private config: SlackNotificationConfig

  constructor(config: SlackNotificationConfig) {
    this.config = config
  }

  async notifyMilestone(event: DroneProgressEvent): Promise<boolean> {
    if (!this.config.enableMilestones) return false

    // Check if this completion percentage crosses a milestone threshold
    const crossedMilestone = this.config.milestoneThresholds.find(threshold => {
      const previous = event.previousCompletion || 0
      return previous < threshold && event.overallCompletion >= threshold
    })

    if (!crossedMilestone) return false

    try {
      const response = await fetch('/api/webhooks/slack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          droneSerial: event.droneSerial,
          model: event.model,
          milestone: crossedMilestone,
          action: 'milestone_reached',
          timestamp: event.timestamp
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Slack milestone notification failed:', error)
      return false
    }
  }

  async notifyItemCompletion(event: DroneProgressEvent): Promise<boolean> {
    if (!this.config.enableItemCompletions || !event.itemName) return false

    try {
      const response = await fetch('/api/webhooks/slack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          droneSerial: event.droneSerial,
          model: event.model,
          milestone: event.overallCompletion,
          systemName: event.systemName,
          assemblyName: event.assemblyName,
          itemName: event.itemName,
          action: 'item_completed',
          timestamp: event.timestamp
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Slack item completion notification failed:', error)
      return false
    }
  }

  async notifySystemCompletion(event: DroneProgressEvent): Promise<boolean> {
    if (!this.config.enableSystemCompletions || !event.systemName) return false

    try {
      const response = await fetch('/api/webhooks/slack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          droneSerial: event.droneSerial,
          model: event.model,
          milestone: event.overallCompletion,
          systemName: event.systemName,
          action: 'system_completed',
          timestamp: event.timestamp
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Slack system completion notification failed:', error)
      return false
    }
  }

  async notifyDroneCompletion(event: DroneProgressEvent): Promise<boolean> {
    if (!this.config.enableDroneCompletions || event.overallCompletion < 100) return false

    try {
      const response = await fetch('/api/webhooks/slack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          droneSerial: event.droneSerial,
          model: event.model,
          milestone: 100,
          action: 'drone_completed',
          timestamp: event.timestamp
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Slack drone completion notification failed:', error)
      return false
    }
  }
}

// Default configuration factory
export function createSlackIntegration(): SlackIntegration | null {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) {
    console.warn('Slack webhook URL not configured')
    return null
  }

  const config: SlackNotificationConfig = {
    webhookUrl,
    channel: process.env.SLACK_CHANNEL,
    username: process.env.SLACK_USERNAME || 'Drone Assembly Bot',
    iconEmoji: process.env.SLACK_ICON_EMOJI || ':helicopter:',
    enableMilestones: process.env.SLACK_ENABLE_MILESTONES !== 'false',
    enableItemCompletions: process.env.SLACK_ENABLE_ITEMS === 'true',
    enableSystemCompletions: process.env.SLACK_ENABLE_SYSTEMS === 'true',
    enableDroneCompletions: process.env.SLACK_ENABLE_DRONES !== 'false',
    milestoneThresholds: process.env.SLACK_MILESTONE_THRESHOLDS 
      ? JSON.parse(process.env.SLACK_MILESTONE_THRESHOLDS)
      : [25, 50, 75, 100]
  }

  return new SlackIntegration(config)
}
