import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3003'
    const wsPort = parseInt(wsUrl.split(':').pop() || '3003')
    
    // In a production environment, you might want to actually test the WebSocket connection
    // For now, we'll do basic configuration validation
    
    if (isNaN(wsPort) || wsPort < 1000 || wsPort > 65535) {
      throw new Error('Invalid WebSocket port configuration')
    }
    
    // Check if WebSocket URL is properly formatted
    if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
      throw new Error('Invalid WebSocket URL format')
    }
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      configuration: {
        url: wsUrl,
        port: wsPort,
        secure: wsUrl.startsWith('wss://'),
        protocol: wsUrl.startsWith('wss://') ? 'WSS' : 'WS'
      },
      note: 'Configuration validated. For full connection test, use WebSocket client.'
    })
    
  } catch (error) {
    console.error('WebSocket health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown WebSocket error',
      configuration: {
        url: process.env.NEXT_PUBLIC_WS_URL || 'Not configured',
        port: null,
        secure: false,
        protocol: 'Unknown'
      }
    }, { status: 503 })
  }
}
