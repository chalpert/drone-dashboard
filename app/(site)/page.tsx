"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { mockBuildDrones, mockBuildActivity } from "@/lib/mockBuildData"
import { BuildDrone, BuildActivity } from "@/lib/types"

export default function Dashboard() {
  const totalDrones = mockBuildDrones.length
  const dronesInBuild = mockBuildDrones.filter(drone => drone.status === 'in-build').length
  const dronesCompleted = mockBuildDrones.filter(drone => drone.status === 'completed').length
  const dronesTesting = mockBuildDrones.filter(drone => drone.status === 'testing').length
  
  // Calculate average build progress
  const averageProgress = Math.round(
    mockBuildDrones.reduce((sum, drone) => sum + drone.overallCompletion, 0) / mockBuildDrones.length
  )
  
  // Find category bottlenecks (lowest average completion rates)
  const categoryStats = mockBuildDrones[0].categories.map(category => {
    const categoryName = category.name
    const avgCompletion = Math.round(
      mockBuildDrones.reduce((sum, drone) => {
        const droneCategory = drone.categories.find(cat => cat.name === categoryName)
        return sum + (droneCategory?.completionPercentage || 0)
      }, 0) / mockBuildDrones.length
    )
    return { name: categoryName, avgCompletion, weight: category.weight }
  }).sort((a, b) => a.avgCompletion - b.avgCompletion)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Build Overview</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Monitor production progress across your drone fleet
        </p>
      </div>

      {/* Build KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Builds
            </CardTitle>
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalDrones}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              in production
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              In Build
            </CardTitle>
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{dronesInBuild}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              active builds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Testing
            </CardTitle>
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{dronesTesting}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              in testing phase
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Avg Progress
            </CardTitle>
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{averageProgress}%</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              across fleet
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Build Progress by Drone */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Build Progress by Drone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockBuildDrones.map((drone) => (
                <div key={drone.serial} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Serial: {drone.serial}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {drone.model} • {drone.status.replace('-', ' ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {drone.overallCompletion}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        complete
                      </div>
                    </div>
                  </div>
                  <Progress value={drone.overallCompletion} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Build Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Build Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockBuildActivity.slice(0, 5).map((activity) => (
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
                      {activity.droneSerial}: {activity.component} {activity.action}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.category} • {new Date(activity.timestamp).toLocaleString()}
                    </div>
                    {activity.notes && (
                      <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        {activity.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Category Performance Analysis
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Average completion rates across component categories
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryStats.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {category.weight}% of total build weight
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${
                      category.avgCompletion >= 70 ? 'text-green-600 dark:text-green-400' :
                      category.avgCompletion >= 40 ? 'text-orange-600 dark:text-orange-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {category.avgCompletion}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      avg completion
                    </div>
                  </div>
                </div>
                <Progress 
                  value={category.avgCompletion} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
