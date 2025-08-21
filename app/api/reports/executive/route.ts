import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ExecutiveSummary {
  timestamp: string
  period: string
  overview: {
    totalDrones: number
    completedDrones: number
    inProgressDrones: number
    pendingDrones: number
    overallCompletionRate: number
  }
  productivity: {
    itemsCompletedToday: number
    itemsCompletedThisWeek: number
    averageCompletionTime: number
    velocityTrend: 'increasing' | 'stable' | 'decreasing'
  }
  bottlenecks: Array<{
    systemName: string
    averageCompletion: number
    issueType: 'slow_progress' | 'stalled' | 'resource_constraint'
    recommendation: string
  }>
  milestones: Array<{
    droneSerial: string
    model: string
    milestone: number
    achievedAt: string
    nextMilestone: number
    estimatedCompletion: string
  }>
  teamEfficiency: {
    totalActiveItems: number
    completionRate: number
    qualityScore: number
    recommendedActions: string[]
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'daily'
    
    // Get current date ranges
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Get all drones with their current status
    const drones = await prisma.drone.findMany({
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
        },
        buildActivities: {
          orderBy: { timestamp: 'desc' },
          take: 10
        }
      }
    })

    // Calculate overview metrics
    const totalDrones = drones.length
    const completedDrones = drones.filter(d => d.overallCompletion >= 100).length
    const inProgressDrones = drones.filter(d => d.overallCompletion > 0 && d.overallCompletion < 100).length
    const pendingDrones = drones.filter(d => d.overallCompletion === 0).length
    const overallCompletionRate = totalDrones > 0 ? 
      Math.round((drones.reduce((sum, d) => sum + d.overallCompletion, 0) / totalDrones) * 100) / 100 : 0

    // Get recent build activities for productivity metrics
    const recentActivities = await prisma.buildActivity.findMany({
      where: {
        timestamp: {
          gte: weekAgo
        }
      },
      orderBy: { timestamp: 'desc' }
    })

    const todayActivities = recentActivities.filter(a => 
      new Date(a.timestamp) >= today
    )

    const itemsCompletedToday = todayActivities.filter(a => a.status === 'completed').length
    const itemsCompletedThisWeek = recentActivities.filter(a => a.status === 'completed').length

    // Calculate system bottlenecks
    const systemStats = new Map<string, { total: number, completed: number, avgCompletion: number }>()
    
    drones.forEach(drone => {
      drone.systems.forEach(system => {
        const systemName = system.systemDefinition.name
        if (!systemStats.has(systemName)) {
          systemStats.set(systemName, { total: 0, completed: 0, avgCompletion: 0 })
        }
        const stats = systemStats.get(systemName)!
        stats.total++
        stats.avgCompletion += system.completionPercentage
      })
    })

    const bottlenecks = Array.from(systemStats.entries())
      .map(([systemName, stats]) => ({
        systemName,
        averageCompletion: Math.round((stats.avgCompletion / stats.total) * 100) / 100,
        issueType: stats.avgCompletion / stats.total < 30 ? 'stalled' as const :
                   stats.avgCompletion / stats.total < 60 ? 'slow_progress' as const :
                   'resource_constraint' as const,
        recommendation: stats.avgCompletion / stats.total < 30 ? 
          'Review assembly procedures and identify blockers' :
          stats.avgCompletion / stats.total < 60 ?
          'Consider additional training or resources' :
          'System performing well, monitor for optimization opportunities'
      }))
      .filter(b => b.averageCompletion < 80)
      .sort((a, b) => a.averageCompletion - b.averageCompletion)
      .slice(0, 3)

    // Identify recent milestones and next targets
    const milestones = drones
      .filter(d => d.overallCompletion > 0)
      .map(drone => {
        const currentMilestone = Math.floor(drone.overallCompletion / 25) * 25
        const nextMilestone = Math.min(currentMilestone + 25, 100)
        
        return {
          droneSerial: drone.serial,
          model: drone.model,
          milestone: currentMilestone,
          achievedAt: drone.updatedAt.toISOString(),
          nextMilestone,
          estimatedCompletion: drone.estimatedCompletion?.toISOString() || 'TBD'
        }
      })
      .sort((a, b) => b.milestone - a.milestone)
      .slice(0, 5)

    // Calculate team efficiency metrics
    const totalItems = drones.reduce((sum, drone) => 
      sum + drone.systems.reduce((sysSum, system) => 
        sysSum + system.assemblies.reduce((asmSum, assembly) => 
          asmSum + assembly.items.length, 0), 0), 0)
    
    const completedItems = drones.reduce((sum, drone) => 
      sum + drone.systems.reduce((sysSum, system) => 
        sysSum + system.assemblies.reduce((asmSum, assembly) => 
          asmSum + assembly.items.filter(item => item.status === 'completed').length, 0), 0), 0)

    const activeItems = drones.reduce((sum, drone) => 
      sum + drone.systems.reduce((sysSum, system) => 
        sysSum + system.assemblies.reduce((asmSum, assembly) => 
          asmSum + assembly.items.filter(item => item.status === 'in-progress').length, 0), 0), 0)

    const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 10000) / 100 : 0
    const qualityScore = 95 // Placeholder - could be calculated from rework/defect data

    const recommendedActions = []
    if (completionRate < 50) recommendedActions.push('Focus on completing in-progress items')
    if (bottlenecks.length > 2) recommendedActions.push('Address system bottlenecks identified')
    if (activeItems > totalItems * 0.3) recommendedActions.push('Consider reducing work-in-progress')
    if (recommendedActions.length === 0) recommendedActions.push('Maintain current pace and quality standards')

    const executiveSummary: ExecutiveSummary = {
      timestamp: new Date().toISOString(),
      period,
      overview: {
        totalDrones,
        completedDrones,
        inProgressDrones,
        pendingDrones,
        overallCompletionRate
      },
      productivity: {
        itemsCompletedToday,
        itemsCompletedThisWeek,
        averageCompletionTime: 2.5, // Placeholder - could be calculated from actual data
        velocityTrend: itemsCompletedThisWeek > itemsCompletedToday * 5 ? 'increasing' : 'stable'
      },
      bottlenecks,
      milestones,
      teamEfficiency: {
        totalActiveItems: activeItems,
        completionRate,
        qualityScore,
        recommendedActions
      }
    }

    return NextResponse.json(executiveSummary)

  } catch (error) {
    console.error('Executive report error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate executive report',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
