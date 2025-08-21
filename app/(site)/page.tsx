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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Build Overview</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Monitor production progress across your drone fleet
          </p>
        </div>
        <RealTimeIndicator className="text-sm" />
      </div>

      {/* Build KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Builds
            </CardTitle>
            <BarChart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalDrones}</div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                in production
              </p>
              {isConnected && realtimeData.lastUpdate && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                  Live
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              In Build
            </CardTitle>
            <ActivitySquare className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{dronesInBuild}</div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                active builds
              </p>
              {activities.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {activities.length} activities
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Testing
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{dronesTesting}</div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                in testing phase
              </p>
              {systemHealth.length > 0 && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                  {systemHealth.filter(sys => sys.status === 'online').length} systems online
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Avg Progress
            </CardTitle>
            <Zap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{averageProgress}%</div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                across fleet
              </p>
              <Badge variant="outline" className="text-xs">
                {drones.filter(d => d.overallCompletion > averageProgress).length} above avg
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Build Progress by Drone */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Build Progress by Drone
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Daily progress tracking</p>
            </div>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {drones.map((drone) => {
                // Get real-time data if available
                const realtimeProgress = realtimeData.buildProgress[drone.serial];
                const displayCompletion = realtimeProgress ? realtimeProgress.overallCompletion : drone.overallCompletion;
                const isRealtime = !!realtimeProgress;
                
                return (
                  <div key={drone.serial} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                          Serial: {drone.serial}
                          {isRealtime && (
                            <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {drone.model} • {drone.status.replace('-', ' ')}
                          {realtimeProgress?.currentAssembly && (
                            <span className="ml-1">• Working on: {realtimeProgress.currentAssembly}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {displayCompletion}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          complete {isRealtime ? '(live)' : ''}
                        </div>
                      </div>
                    </div>
                    <Progress value={displayCompletion} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Build Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Build Activity
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{recentActivities} activities in the last 24h</p>
            </div>
            <ActivitySquare className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.action === "completed"
                        ? "bg-green-500"
                        : activity.action === "started"
                        ? "bg-blue-500"
                        : "bg-orange-500"
                    }`}
                  ></div>
                  <div className="flex-1">
                  <div className="text-sm text-gray-900 dark:text-white">
                      {activity.droneSerial}: {activity.itemName} {activity.action}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.assemblyName} • {activity.systemName} • {new Date(activity.timestamp).toLocaleString()}
                    </div>
                    {activity.notes && (
                      <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        {activity.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full mt-2" size="sm" onClick={() => window.location.href = '/build-activity'}>
                View All Activities <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Monitoring (if real-time data available) */}
      {systemHealth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              System Health Monitoring
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Real-time system performance metrics
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemHealth.map((system) => (
                <div key={system.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                        {system.name}
                        <span className={`ml-2 w-2 h-2 rounded-full ${system.status === 'online' ? 'bg-green-500' : 'bg-orange-500'} ${system.status === 'online' ? 'animate-pulse' : ''}`}></span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        CPU: {system.cpu}% • Memory: {system.memory}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${
                        system.health >= 70 ? 'text-green-600 dark:text-green-400' :
                        system.health >= 40 ? 'text-orange-600 dark:text-orange-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {system.health}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        system health
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={system.health} 
                    className="h-2"
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
