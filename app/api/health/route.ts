import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  version: string
  uptime: number
  checks: {
    database: {
      status: 'healthy' | 'unhealthy'
      responseTime: number
      error?: string
    }
    websocket: {
      status: 'healthy' | 'unhealthy'
      port: number
      error?: string
    }
    memory: {
      status: 'healthy' | 'degraded'
      usage: {
        rss: number
        heapTotal: number
        heapUsed: number
        external: number
      }
      percentage: number
    }
  }
}

export async function GET() {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()
  
  // Initialize health check response
  const healthCheck: HealthCheck = {
    status: 'healthy',
    timestamp,
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    checks: {
      database: {
        status: 'healthy',
        responseTime: 0
      },
      websocket: {
        status: 'healthy',
        port: 3003
      },
      memory: {
        status: 'healthy',
        usage: {
          rss: 0,
          heapTotal: 0,
          heapUsed: 0,
          external: 0
        },
        percentage: 0
      }
    }
  }

  // Check database connectivity
  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const dbEnd = Date.now()
    
    healthCheck.checks.database.responseTime = dbEnd - dbStart
    
    if (healthCheck.checks.database.responseTime > 1000) {
      healthCheck.checks.database.status = 'unhealthy'
      healthCheck.status = 'degraded'
    }
  } catch (error) {
    healthCheck.checks.database.status = 'unhealthy'
    healthCheck.checks.database.error = error instanceof Error ? error.message : 'Unknown database error'
    healthCheck.status = 'unhealthy'
  }

  // Check WebSocket server
  try {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3003'
    const wsPort = parseInt(wsUrl.split(':').pop() || '3003')
    healthCheck.checks.websocket.port = wsPort
    
    // Simple port check (in production, you might want to actually connect)
    // For now, assume healthy if we can parse the port
    if (isNaN(wsPort) || wsPort < 1000 || wsPort > 65535) {
      healthCheck.checks.websocket.status = 'unhealthy'
      healthCheck.checks.websocket.error = 'Invalid WebSocket port configuration'
      healthCheck.status = 'degraded'
    }
  } catch (error) {
    healthCheck.checks.websocket.status = 'unhealthy'
    healthCheck.checks.websocket.error = error instanceof Error ? error.message : 'WebSocket check failed'
    healthCheck.status = 'degraded'
  }

  // Check memory usage
  try {
    const memUsage = process.memoryUsage()
    healthCheck.checks.memory.usage = memUsage
    
    // Calculate memory usage percentage (assuming 512MB limit for small deployment)
    const memoryLimitMB = parseInt(process.env.MEMORY_LIMIT_MB || '512')
    const memoryLimitBytes = memoryLimitMB * 1024 * 1024
    const memoryPercentage = (memUsage.rss / memoryLimitBytes) * 100
    
    healthCheck.checks.memory.percentage = Math.round(memoryPercentage * 100) / 100
    
    if (memoryPercentage > 90) {
      healthCheck.checks.memory.status = 'degraded'
      healthCheck.status = 'degraded'
    }
  } catch (error) {
    healthCheck.checks.memory.status = 'degraded'
    if (healthCheck.status === 'healthy') {
      healthCheck.status = 'degraded'
    }
  }

  // Determine overall status code
  const statusCode = healthCheck.status === 'healthy' ? 200 : 
                    healthCheck.status === 'degraded' ? 200 : 503

  return NextResponse.json(healthCheck, { status: statusCode })
}
