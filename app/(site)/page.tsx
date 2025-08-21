"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart, ChevronRight, Clock, ActivitySquare, AlertCircle, Zap } from "lucide-react"
import { RealTimeIndicator, useRealTimeData } from "@/components/real-time-provider"
import { Button } from "@/components/ui/button"
import { BuildDrone, BuildActivity } from "@/lib/types"

export default function Dashboard() {
  const [drones, setDrones] = useState<BuildDrone[]>([])
  const [activities, setActivities] = useState<BuildActivity[]>([])
  const [loading, setLoading] = useState(true)
  const { data: realtimeData, isConnected, refreshData } = useRealTimeData()
  
  useEffect(() => {
    // Fetch drones and build activities
    const fetchData = async () => {
      try {
        const response = await fetch('/api/drones')
        if (response.ok) {
          const data = await response.json()
          setDrones(data)
          
          // Extract build activities
          const activities: BuildActivity[] = []
          data.forEach((drone: BuildDrone) => {
            if (drone.buildActivities) {
              activities.push(...drone.buildActivities)
            }
          })
          
          // Sort by most recent first
          activities.sort((a, b) => {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          })
          
          setActivities(activities)
        } else {
          console.error('Failed to fetch drones')
        }
      } catch (error) {
        console.error('Error fetching drones:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
    
    // Set up periodic refresh
    const refreshInterval = setInterval(() => {
      refreshData()
    }, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(refreshInterval)
  }, [refreshData])
  
  const totalDrones = drones.length
  const dronesInBuild = drones.filter(drone => drone.status === 'in-progress').length
  const dronesTesting = drones.filter(drone => drone.overallCompletion === 100).length
  
  // Calculate average build progress
  const averageProgress = drones.length > 0 ? Math.round(
    drones.reduce((sum, drone) => sum + drone.overallCompletion, 0) / drones.length
  ) : 0
  
  // Find system bottlenecks (lowest average completion rates)
  // const systemStats = drones[0]?.systems?.map(system => {
  //   const systemName = system.name
  //   const avgCompletion = Math.round(
  //     drones.reduce((sum, drone) => {
  //       const droneSystem = drone.systems?.find(sys => sys.name === systemName)
  //       return sum + (droneSystem?.completionPercentage || 0)
  //     }, 0) / drones.length
  //   )
  //   return { name: systemName, avgCompletion, weight: system.weight }
  // }).sort((a, b) => a.avgCompletion - b.avgCompletion) || []

  // Count recent activities (last 24 hours)
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).getTime()
  const recentActivities = activities.filter(activity => 
    new Date(activity.timestamp).getTime() > last24Hours
  ).length
  
  // Extract recent system health data - handle different possible structures
  const systemHealthOverview = realtimeData.systemHealth.systems as { systems?: Array<{ id: string; name: string; health: number; status: string; cpu: number; memory: number }> }
  const systemHealth = systemHealthOverview?.systems || []
  
  // If loading, show a loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Executive Header Section - Tablet Optimized */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 rounded-t-lg mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Production Dashboard</h1>
            <p className="text-blue-100 text-base sm:text-lg">
              Real-time monitoring and analytics for your drone manufacturing operations
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <RealTimeIndicator className="text-sm bg-white/10 px-3 py-2 rounded-lg text-white" />
            <div className="text-blue-100 text-sm">
              Updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Executive KPI Cards - Tablet Optimized Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
              Total Units
            </CardTitle>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BarChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{totalDrones}</div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                In Production Pipeline
              </p>
              {isConnected && realtimeData.lastUpdate && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-700">
                  ● Live Data
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
              Active Builds
            </CardTitle>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <ActivitySquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{dronesInBuild}</div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Currently in Assembly
              </p>
              {activities.length > 0 && (
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 border-orange-200 dark:border-orange-700">
                  {activities.length} Activities
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
              Quality Testing
            </CardTitle>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{dronesTesting}</div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Final Validation Phase
              </p>
              {systemHealth.length > 0 && (
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200 dark:border-purple-700">
                  {systemHealth.filter(sys => sys.status === 'online').length} Systems Online
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
              Fleet Progress
            </CardTitle>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{averageProgress}%</div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Average Completion
              </p>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-700">
                {drones.filter(d => d.overallCompletion > averageProgress).length} Above Target
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Build Progress by Drone */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Production Progress
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time unit assembly tracking</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Clock className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {drones.map((drone) => {
                // Get real-time data if available
                const realtimeProgress = realtimeData.buildProgress[drone.serial];
                const displayCompletion = realtimeProgress ? realtimeProgress.overallCompletion : drone.overallCompletion;
                const isRealtime = !!realtimeProgress;
                
                return (
                  <div key={drone.serial} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                          Unit {drone.serial}
                          {isRealtime && (
                            <span className="ml-2 flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                              <span className="text-xs text-green-600 dark:text-green-400">Live</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {drone.model} • {drone.status.replace('-', ' ').toUpperCase()}
                          {realtimeProgress?.currentAssembly && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                              {realtimeProgress.currentAssembly}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {displayCompletion}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Completion
                        </div>
                      </div>
                    </div>
                    <Progress value={displayCompletion} className="h-3 sm:h-4" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Build Activity */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Activity Timeline
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{recentActivities} operations in the last 24 hours</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <ActivitySquare className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {activities.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border-l-4 border-l-blue-500"
                >
                  <div
                    className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                      activity.action === "completed"
                        ? "bg-green-500 shadow-lg shadow-green-500/50"
                        : activity.action === "started"
                        ? "bg-blue-500 shadow-lg shadow-blue-500/50"
                        : "bg-orange-500 shadow-lg shadow-orange-500/50"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      <span className="font-semibold">Unit {activity.droneSerial}:</span> {activity.itemName}
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        activity.action === "completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : activity.action === "started"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                      }`}>
                        {activity.action.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="font-medium">{activity.systemName}</span> → {activity.assemblyName}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                    {activity.notes && (
                      <div className="text-xs text-gray-600 dark:text-gray-300 mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        {activity.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full mt-6 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 py-3 text-base touch-manipulation" onClick={() => window.location.href = '/build-activity'}>
                View All Activities <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Monitoring (if real-time data available) */}
      {systemHealth.length > 0 && (
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  System Health Overview
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Real-time infrastructure performance monitoring
                </p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-700">
                {systemHealth.filter(sys => sys.status === 'online').length}/{systemHealth.length} Online
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {systemHealth.map((system) => (
                <div key={system.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                        {system.name}
                        <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                          system.status === 'online' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {system.status.toUpperCase()}
                          {system.status === 'online' && <span className="ml-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex gap-4">
                        <span>CPU: {system.cpu}%</span>
                        <span>Memory: {system.memory}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        system.health >= 70 ? 'text-green-600 dark:text-green-400' :
                        system.health >= 40 ? 'text-orange-600 dark:text-orange-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {system.health}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        System Health
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={system.health} 
                    className="h-3 sm:h-4"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
