// Analytics and Trend Calculation Functions

export interface TrendData {
  date: string
  value: number
}

export interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable'
  slope: number
  confidence: number
  prediction: number
}

export function calculateTrend(data: TrendData[]): TrendAnalysis {
  if (data.length < 2) {
    return {
      trend: 'stable',
      slope: 0,
      confidence: 0,
      prediction: data[0]?.value || 0
    }
  }

  // Simple linear regression
  const n = data.length
  const sumX = data.reduce((sum, _, i) => sum + i, 0)
  const sumY = data.reduce((sum, point) => sum + point.value, 0)
  const sumXY = data.reduce((sum, point, i) => sum + i * point.value, 0)
  const sumXX = data.reduce((sum, _, i) => sum + i * i, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Calculate R-squared for confidence
  const yMean = sumY / n
  const totalSumSquares = data.reduce((sum, point) => sum + Math.pow(point.value - yMean, 2), 0)
  const residualSumSquares = data.reduce((sum, point, i) => {
    const predicted = slope * i + intercept
    return sum + Math.pow(point.value - predicted, 2)
  }, 0)
  
  const rSquared = 1 - (residualSumSquares / totalSumSquares)
  const confidence = Math.max(0, Math.min(100, rSquared * 100))

  // Determine trend direction
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
  if (Math.abs(slope) > 0.1) {
    trend = slope > 0 ? 'increasing' : 'decreasing'
  }

  // Predict next value
  const prediction = slope * n + intercept

  return {
    trend,
    slope: Math.round(slope * 1000) / 1000,
    confidence: Math.round(confidence * 100) / 100,
    prediction: Math.round(prediction * 100) / 100
  }
}

export function calculateVelocity(completedItems: number[], timeWindow: number = 7): number {
  if (completedItems.length === 0) return 0
  
  const recentItems = completedItems.slice(-timeWindow)
  return recentItems.reduce((sum, items) => sum + items, 0) / recentItems.length
}

export function identifyBottlenecks(systemData: Array<{
  name: string
  completion: number
  itemCount: number
  averageTime: number
}>): Array<{
  system: string
  severity: 'high' | 'medium' | 'low'
  issue: string
  impact: number
}> {
  return systemData
    .map(system => {
      let severity: 'high' | 'medium' | 'low' = 'low'
      let issue = 'No significant issues'
      let impact = 0

      if (system.completion < 30) {
        severity = 'high'
        issue = 'Very low completion rate - possible blocker'
        impact = (30 - system.completion) * system.itemCount
      } else if (system.completion < 60) {
        severity = 'medium'
        issue = 'Below average completion rate'
        impact = (60 - system.completion) * system.itemCount * 0.5
      } else if (system.averageTime > 5) {
        severity = 'medium'
        issue = 'Items taking longer than expected'
        impact = (system.averageTime - 5) * system.itemCount * 0.3
      }

      return {
        system: system.name,
        severity,
        issue,
        impact: Math.round(impact * 100) / 100
      }
    })
    .filter(bottleneck => bottleneck.severity !== 'low')
    .sort((a, b) => b.impact - a.impact)
}

export function calculateResourceUtilization(
  totalCapacity: number,
  activeItems: number,
  completedItemsPerDay: number
): {
  utilization: number
  efficiency: number
  recommendation: string
} {
  const utilization = Math.min(100, (activeItems / totalCapacity) * 100)
  const efficiency = completedItemsPerDay / Math.max(1, activeItems) * 100
  
  let recommendation = 'Optimal resource utilization'
  
  if (utilization > 90) {
    recommendation = 'Consider increasing capacity or reducing work-in-progress'
  } else if (utilization < 50) {
    recommendation = 'Capacity available - consider taking on more work'
  } else if (efficiency < 20) {
    recommendation = 'Low efficiency - review processes and remove blockers'
  }

  return {
    utilization: Math.round(utilization * 100) / 100,
    efficiency: Math.round(efficiency * 100) / 100,
    recommendation
  }
}

export function forecastCompletion(
  currentCompletion: number,
  velocity: number,
  remainingItems: number
): {
  estimatedDays: number
  estimatedDate: string
  confidence: 'high' | 'medium' | 'low'
} {
  if (velocity <= 0) {
    return {
      estimatedDays: -1,
      estimatedDate: 'Unable to estimate',
      confidence: 'low'
    }
  }

  const estimatedDays = Math.ceil(remainingItems / velocity)
  const estimatedDate = new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  let confidence: 'high' | 'medium' | 'low' = 'medium'
  if (velocity > 5 && currentCompletion > 25) {
    confidence = 'high'
  } else if (velocity < 2 || currentCompletion < 10) {
    confidence = 'low'
  }

  return {
    estimatedDays,
    estimatedDate,
    confidence
  }
}
