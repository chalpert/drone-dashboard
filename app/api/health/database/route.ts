import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const startTime = Date.now()
    
    // Test basic connectivity
    await prisma.$queryRaw`SELECT 1`
    
    // Test actual data query
    const droneCount = await prisma.drone.count()
    const systemCount = await prisma.systemDefinition.count()
    const itemCount = await prisma.itemDefinition.count()
    
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime,
      statistics: {
        drones: droneCount,
        systems: systemCount,
        items: itemCount
      },
      connection: {
        url: process.env.DATABASE_URL?.replace(/\/[^\/]*$/, '/***') || 'Not configured',
        type: 'SQLite'
      }
    })
    
  } catch (error) {
    console.error('Database health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown database error',
      connection: {
        url: process.env.DATABASE_URL?.replace(/\/[^\/]*$/, '/***') || 'Not configured',
        type: 'SQLite'
      }
    }, { status: 503 })
  }
}
