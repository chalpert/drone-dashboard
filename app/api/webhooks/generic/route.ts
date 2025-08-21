import { NextRequest, NextResponse } from 'next/server'

interface GenericWebhookPayload {
  event: string
  data: Record<string, any>
  timestamp: string
  source: 'drone_assembly_tracker'
}

interface WebhookEndpoint {
  url: string
  headers?: Record<string, string>
  enabled: boolean
}

export async function POST(request: NextRequest) {
  try {
    const payload: GenericWebhookPayload = await request.json()
    
    // Get configured webhook endpoints from environment
    const webhookEndpoints = getConfiguredWebhooks()
    
    if (webhookEndpoints.length === 0) {
      return NextResponse.json({ 
        warning: 'No webhook endpoints configured',
        payload 
      })
    }

    // Send to all configured endpoints
    const results = await Promise.allSettled(
      webhookEndpoints.map(endpoint => sendWebhook(endpoint, payload))
    )

    // Process results
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      message: `Webhook sent to ${successful} endpoints`,
      stats: {
        total: webhookEndpoints.length,
        successful,
        failed
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Generic webhook error:', error)
    return NextResponse.json({ 
      error: 'Failed to send webhook notifications',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function getConfiguredWebhooks(): WebhookEndpoint[] {
  const endpoints: WebhookEndpoint[] = []
  
  // Parse webhook endpoints from environment variables
  // Format: WEBHOOK_ENDPOINT_1=https://api.example.com/webhook
  // Format: WEBHOOK_ENDPOINT_2=https://api.another.com/hook
  
  for (let i = 1; i <= 10; i++) {
    const url = process.env[`WEBHOOK_ENDPOINT_${i}`]
    const headers = process.env[`WEBHOOK_HEADERS_${i}`]
    const enabled = process.env[`WEBHOOK_ENABLED_${i}`] !== 'false'
    
    if (url && enabled) {
      endpoints.push({
        url,
        headers: headers ? JSON.parse(headers) : undefined,
        enabled
      })
    }
  }
  
  return endpoints
}

async function sendWebhook(endpoint: WebhookEndpoint, payload: GenericWebhookPayload): Promise<void> {
  const response = await fetch(endpoint.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Drone-Assembly-Tracker/1.0',
      ...endpoint.headers
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
  }
}

// Helper function to trigger webhooks from other parts of the application
export async function triggerWebhook(event: string, data: Record<string, any>) {
  const payload: GenericWebhookPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
    source: 'drone_assembly_tracker'
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
    const response = await fetch(`${baseUrl}/api/webhooks/generic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error('Failed to trigger webhook:', response.statusText)
    }
  } catch (error) {
    console.error('Webhook trigger error:', error)
  }
}
