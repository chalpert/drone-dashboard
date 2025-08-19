"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Calendar, Settings, CheckCircle, Clock, Circle } from "lucide-react"
import Link from "next/link"
import { mockBuildDrones, mockBuildActivity } from "@/lib/mockBuildData"
import { BuildDrone, Component } from "@/lib/types"

export default function DroneDetailPage({ params }: { params: { serial: string } }) {
  // Find the drone by serial number
  const drone = mockBuildDrones.find(d => d.serial === params.serial)
  
  if (!drone) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Drone Not Found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Serial "{params.serial}" does not exist in the system.
          </p>
          <Link href="/fleet">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Fleet
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Filter build activity for this drone
  const droneActivity = mockBuildActivity.filter(activity => activity.droneSerial === drone.serial)

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default'
      case 'testing': return 'secondary'
      case 'in-build': return 'default'
      case 'planning': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400'
      case 'testing': return 'text-blue-600 dark:text-blue-400'
      case 'in-build': return 'text-orange-600 dark:text-orange-400'
      case 'planning': return 'text-gray-600 dark:text-gray-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600 dark:text-green-400'
    if (progress >= 70) return 'text-blue-600 dark:text-blue-400'
    if (progress >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getComponentIcon = (status: Component['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in-progress': return <Clock className="w-4 h-4 text-orange-500" />
      case 'pending': return <Circle className="w-4 h-4 text-gray-400" />
      default: return <Circle className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/fleet">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Serial: {drone.serial}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Model: {drone.model}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={getStatusBadgeVariant(drone.status)} className="text-sm px-3 py-1">
            {drone.status.replace('-', ' ').toUpperCase()}
          </Badge>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
            Overall Build Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg text-gray-700 dark:text-gray-300">Completion Status</span>
            <span className={`text-3xl font-bold ${getProgressColor(drone.overallCompletion)}`}>
              {drone.overallCompletion}%
            </span>
          </div>
          <Progress value={drone.overallCompletion} className="h-6" />
          
          {/* Build Timeline */}
          {(drone.startDate || drone.estimatedCompletion) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              {drone.startDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Build Started</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(drone.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              {drone.estimatedCompletion && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Completion</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(drone.estimatedCompletion).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Component Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {drone.categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  {category.name}
                </CardTitle>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getProgressColor(category.completionPercentage)}`}>
                    {category.completionPercentage}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {category.weight}% of total build
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={category.completionPercentage} className="h-3 mb-6" />
              
              {/* Individual Components */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Components
                </h4>
                {category.components.map((component) => (
                  <div key={component.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      {getComponentIcon(component.status)}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {component.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {component.status.replace('-', ' ')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Weight: {Math.round(component.weight)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Build Activity Log */}
      {droneActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Build Activity Log
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Recent build activities for {drone.serial}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {droneActivity.map((activity) => (
                <div key={activity.id} className="flex gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                    activity.action === 'completed' ? 'bg-green-500' :
                    activity.action === 'started' ? 'bg-blue-500' :
                    'bg-orange-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.component} - {activity.action}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      Category: {activity.category}
                    </div>
                    {activity.notes && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                        {activity.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
