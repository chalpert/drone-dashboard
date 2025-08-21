import { BuildDrone, BuildActivity } from './types'

// Export data to CSV format
export function exportToCSV(data: BuildDrone[], filename: string = 'drone-data.csv'): void {
  // Flatten the data for CSV export
  const flatData = data.map(drone => ({
    serial: drone.serial,
    model: drone.model,
    status: drone.status,
    overallCompletion: drone.overallCompletion,
    startDate: drone.startDate || '',
    estimatedCompletion: drone.estimatedCompletion || '',
    systemCount: drone.systems?.length || 0,
    // Add system-specific data
    ...drone.systems?.reduce((acc, system, index) => ({
      ...acc,
      [`system_${index + 1}_name`]: system.name,
      [`system_${index + 1}_completion`]: system.completionPercentage,
      [`system_${index + 1}_weight`]: system.weight,
      [`system_${index + 1}_assemblies`]: system.assemblies?.length || 0,
    }), {}),
    // Add summary statistics
    avgSystemCompletion: drone.systems?.length 
      ? Math.round(drone.systems.reduce((sum, sys) => sum + sys.completionPercentage, 0) / drone.systems.length)
      : 0,
    totalItems: drone.systems?.reduce((total, system) => 
      total + (system.assemblies?.reduce((assemblyTotal, assembly) => 
        assemblyTotal + (assembly.items?.length || 0), 0) || 0), 0) || 0
  }))

  // Convert to CSV
  if (flatData.length === 0) {
    console.warn('No data to export')
    return
  }

  const headers = Object.keys(flatData[0])
  const csvContent = [
    headers.join(','),
    ...flatData.map(row =>
      headers.map(header => {
        const value = (row as Record<string, unknown>)[header] || ''
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"` 
          : value
      }).join(',')
    )
  ].join('\n')

  downloadFile(csvContent, filename, 'text/csv')
}

// Export data to JSON format
export function exportToJSON(data: BuildDrone[], filename: string = 'drone-data.json'): void {
  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, filename, 'application/json')
}

// Export build activities to CSV
export function exportActivitiesToCSV(activities: BuildActivity[], filename: string = 'build-activities.csv'): void {
  if (activities.length === 0) {
    console.warn('No activities to export')
    return
  }

  const headers = ['id', 'droneSerial', 'timestamp', 'itemName', 'assemblyName', 'systemName', 'action', 'notes']
  const csvContent = [
    headers.join(','),
    ...activities.map(activity =>
      headers.map(header => {
        const value = (activity as unknown as Record<string, unknown>)[header] || ''
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"` 
          : value
      }).join(',')
    )
  ].join('\n')

  downloadFile(csvContent, filename, 'text/csv')
}

// Export detailed drone report (includes all system/assembly/item data)
export function exportDetailedReport(data: BuildDrone[], format: 'csv' | 'json', filename?: string): void {
  if (format === 'json') {
    exportToJSON(data, filename || 'detailed-drone-report.json')
    return
  }

  // For CSV, create a comprehensive flat structure
  const detailedData: Record<string, unknown>[] = []

  data.forEach(drone => {
    drone.systems?.forEach(system => {
      system.assemblies?.forEach(assembly => {
        assembly.items?.forEach(item => {
          detailedData.push({
            // Drone info
            droneSerial: drone.serial,
            droneModel: drone.model,
            droneStatus: drone.status,
            droneOverallCompletion: drone.overallCompletion,
            droneStartDate: drone.startDate || '',
            droneEstimatedCompletion: drone.estimatedCompletion || '',
            
            // System info
            systemId: system.id,
            systemName: system.name,
            systemWeight: system.weight,
            systemCompletion: system.completionPercentage,
            
            // Assembly info
            assemblyId: assembly.id,
            assemblyName: assembly.name,
            assemblyWeight: assembly.weight,
            assemblyCompletion: assembly.completionPercentage,
            
            // Item info
            itemId: item.id,
            itemName: item.name,
            itemStatus: item.status,
            itemWeight: item.weight
          })
        })
      })
    })
  })

  if (detailedData.length === 0) {
    console.warn('No detailed data to export')
    return
  }

  const headers = Object.keys(detailedData[0])
  const csvContent = [
    headers.join(','),
    ...detailedData.map(row =>
      headers.map(header => {
        const value = row[header] || ''
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"` 
          : value
      }).join(',')
    )
  ].join('\n')

  downloadFile(csvContent, filename || 'detailed-drone-report.csv', 'text/csv')
}

// Export system performance analytics
export function exportSystemAnalytics(data: BuildDrone[], filename: string = 'system-analytics.csv'): void {
  if (data.length === 0) {
    console.warn('No data for analytics export')
    return
  }

  // Calculate system analytics
  const systemAnalytics: { [systemName: string]: {
    name: string
    avgCompletion: number
    totalDrones: number
    inProgressDrones: number
    completedDrones: number
    weight: number
  } } = {}

  data.forEach(drone => {
    drone.systems?.forEach(system => {
      if (!systemAnalytics[system.name]) {
        systemAnalytics[system.name] = {
          name: system.name,
          avgCompletion: 0,
          totalDrones: 0,
          inProgressDrones: 0,
          completedDrones: 0,
          weight: system.weight
        }
      }

      const analytics = systemAnalytics[system.name]
      analytics.totalDrones += 1
      analytics.avgCompletion += system.completionPercentage
      
      if (system.completionPercentage === 100) {
        analytics.completedDrones += 1
      } else if (system.completionPercentage > 0) {
        analytics.inProgressDrones += 1
      }
    })
  })

  // Finalize averages
  Object.values(systemAnalytics).forEach(analytics => {
    analytics.avgCompletion = Math.round(analytics.avgCompletion / analytics.totalDrones)
  })

  const analyticsArray = Object.values(systemAnalytics)

  const headers = ['name', 'avgCompletion', 'totalDrones', 'inProgressDrones', 'completedDrones', 'weight', 'completionRate']
  const csvContent = [
    headers.join(','),
    ...analyticsArray.map(analytics => [
      analytics.name,
      analytics.avgCompletion,
      analytics.totalDrones,
      analytics.inProgressDrones,
      analytics.completedDrones,
      analytics.weight,
      Math.round((analytics.completedDrones / analytics.totalDrones) * 100)
    ].join(','))
  ].join('\n')

  downloadFile(csvContent, filename, 'text/csv')
}

// Utility function to trigger file download
function downloadFile(content: string, filename: string, contentType: string): void {
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up the URL object
  URL.revokeObjectURL(url)
}

// Generate filename with timestamp
export function generateTimestampedFilename(baseName: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0]
  return `${baseName}_${timestamp}.${extension}`
}
