import { NextRequest, NextResponse } from 'next/server'

interface SlackWebhookPayload {
  text: string
  username?: string
  icon_emoji?: string
  channel?: string
  attachments?: Array<{
    color: string
    title: string
    text: string
    fields?: Array<{
      title: string
      value: string
      short: boolean
    }>
    footer?: string
    ts?: number
  }>
}

interface DroneNotificationData {
  droneSerial: string
  model: string
  milestone: number
  systemName?: string
  assemblyName?: string
  itemName?: string
  action: 'milestone_reached' | 'item_completed' | 'system_completed' | 'drone_completed'
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const data: DroneNotificationData = await request.json()
    
    // Get Slack webhook URL from environment
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL
    if (!slackWebhookUrl) {
      return NextResponse.json({ error: 'Slack webhook URL not configured' }, { status: 400 })
    }

    // Create Slack message based on action type
    const payload = createSlackMessage(data)
    
    // Send to Slack
    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Notification sent to Slack',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Slack webhook error:', error)
    return NextResponse.json({ 
      error: 'Failed to send Slack notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function createSlackMessage(data: DroneNotificationData): SlackWebhookPayload {
  const { droneSerial, model, milestone, action, timestamp } = data
  
  switch (action) {
    case 'milestone_reached':
      return {
        text: `🎯 Drone Assembly Milestone Reached!`,
        username: 'Drone Assembly Bot',
        icon_emoji: ':helicopter:',
        attachments: [{
          color: milestone >= 75 ? '#28a745' : milestone >= 50 ? '#ffc107' : '#17a2b8',
          title: `Unit ${droneSerial} (${model}) - ${milestone}% Complete`,
          text: `Assembly progress milestone achieved`,
          fields: [
            {
              title: 'Progress',
              value: `${milestone}%`,
              short: true
            },
            {
              title: 'Status',
              value: milestone === 100 ? 'Completed' : 'In Progress',
              short: true
            }
          ],
          footer: 'Drone Assembly Tracker',
          ts: Math.floor(new Date(timestamp).getTime() / 1000)
        }]
      }

    case 'item_completed':
      return {
        text: `✅ Component Completed`,
        username: 'Drone Assembly Bot',
        icon_emoji: ':white_check_mark:',
        attachments: [{
          color: '#28a745',
          title: `${data.itemName} - Unit ${droneSerial}`,
          text: `Component installation completed in ${data.systemName} > ${data.assemblyName}`,
          fields: [
            {
              title: 'System',
              value: data.systemName || 'Unknown',
              short: true
            },
            {
              title: 'Assembly',
              value: data.assemblyName || 'Unknown',
              short: true
            }
          ],
          footer: 'Drone Assembly Tracker',
          ts: Math.floor(new Date(timestamp).getTime() / 1000)
        }]
      }

    case 'system_completed':
      return {
        text: `🎉 System Assembly Completed!`,
        username: 'Drone Assembly Bot',
        icon_emoji: ':tada:',
        attachments: [{
          color: '#28a745',
          title: `${data.systemName} System - Unit ${droneSerial}`,
          text: `Major system assembly completed successfully`,
          fields: [
            {
              title: 'Drone Model',
              value: model,
              short: true
            },
            {
              title: 'Overall Progress',
              value: `${milestone}%`,
              short: true
            }
          ],
          footer: 'Drone Assembly Tracker',
          ts: Math.floor(new Date(timestamp).getTime() / 1000)
        }]
      }

    case 'drone_completed':
      return {
        text: `🚁 DRONE ASSEMBLY COMPLETED! 🚁`,
        username: 'Drone Assembly Bot',
        icon_emoji: ':helicopter:',
        attachments: [{
          color: '#28a745',
          title: `Unit ${droneSerial} (${model}) - 100% Complete`,
          text: `🎊 Congratulations! Another drone ready for deployment!`,
          fields: [
            {
              title: 'Status',
              value: 'Ready for Testing',
              short: true
            },
            {
              title: 'Completion Time',
              value: new Date(timestamp).toLocaleString(),
              short: true
            }
          ],
          footer: 'Drone Assembly Tracker',
          ts: Math.floor(new Date(timestamp).getTime() / 1000)
        }]
      }

    default:
      return {
        text: `📊 Drone Assembly Update - Unit ${droneSerial}`,
        username: 'Drone Assembly Bot',
        icon_emoji: ':gear:'
      }
  }
}
