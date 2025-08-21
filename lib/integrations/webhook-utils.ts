interface GenericWebhookPayload {
  event: string
  data: Record<string, unknown>
  timestamp: string
  source: 'drone_assembly_tracker'
}

// Helper function to trigger webhooks from other parts of the application
export async function triggerWebhook(event: string, data: Record<string, unknown>) {
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
