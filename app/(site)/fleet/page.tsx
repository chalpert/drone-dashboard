"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Minus } from "lucide-react"
import { mockBuildDrones } from "@/lib/mockBuildData"
import { BuildDrone } from "@/lib/types"

export default function FleetPage() {
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDrone, setSelectedDrone] = useState<BuildDrone | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const filteredDrones = mockBuildDrones.filter(drone => {
    if (selectedStatus === "all") return true
    if (selectedStatus === "in-progress") {
      return drone.status === "in-progress" || (drone.overallCompletion > 0 && drone.overallCompletion < 100)
    }
    if (selectedStatus === "pending") {
      return drone.status === "pending" || drone.overallCompletion === 0
    }
    return drone.status === selectedStatus
  })

  const statusCounts = {
    all: mockBuildDrones.length,
    'in-progress': mockBuildDrones.filter(d => d.status === 'in-progress' || (d.overallCompletion > 0 && d.overallCompletion < 100)).length,
    'pending': mockBuildDrones.filter(d => d.status === 'pending' || d.overallCompletion === 0).length,
    'completed': mockBuildDrones.filter(d => d.status === 'completed').length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in-progress': return 'bg-orange-500' 
      case 'pending': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default'
      case 'in-progress': return 'default'
      case 'pending': return 'outline'
      default: return 'outline'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600 dark:text-green-400'
    if (progress >= 70) return 'text-blue-600 dark:text-blue-400'
    if (progress >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Build Tracking</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Monitor drone build progress and component completion
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Start New Build
          </Button>
        </div>
      </div>

      {/* Status Filter Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card 
            key={status}
            className={`cursor-pointer transition-colors ${
              selectedStatus === status 
                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            onClick={() => setSelectedStatus(status)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {status.replace('-', ' ')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {count}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Drone Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrones.map((drone) => (
          <Card 
            key={drone.serial} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedDrone(drone)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    Serial: {drone.serial}
                  </CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Model: {drone.model}
                  </p>
                </div>
                <Badge variant={getStatusBadgeVariant(drone.status)}>
                  {drone.status.replace('-', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Overall Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
                    <span className={`text-sm font-bold ${getProgressColor(drone.overallCompletion)}`}>
                      {drone.overallCompletion}%
                    </span>
                  </div>
                  <Progress value={drone.overallCompletion} className="h-3" />
                </div>

                {/* Category Progress */}
                <div className="space-y-2">
                  {drone.categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">{category.name}</span>
                      <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                          style={{ width: `${category.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedDrone(drone)
                    }}
                  >
                    View Build Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Build Progress Modal */}
      {selectedDrone && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedDrone(null)}
        >
          <Card 
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                    Serial: {selectedDrone.serial}
                  </CardTitle>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Complete component status and progress tracking
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      {selectedDrone.overallCompletion}%
                    </div>
                    <div className="text-sm text-gray-500">
                      Overall Complete
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedDrone(null)}
                    className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-md"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Progress - Combined */}
              <div>
                <div className="flex items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Build Progress</h3>
                </div>
                <div className="relative">
                  <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      className="h-full bg-black rounded-full transition-all duration-300" 
                      style={{ width: `${selectedDrone.overallCompletion}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-3">
                {selectedDrone.categories.map((category) => (
                  <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" 
                      onClick={() => toggleCategory(category.id)}
                    >
                      <div className="flex items-center gap-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
                        <span className="text-sm text-gray-500">({category.weight}% of total)</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                            style={{ width: `${category.completionPercentage}%` }}
                          />
                        </div>
                        <Button variant="ghost" size="sm">
                          {expandedCategories.includes(category.id) ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    {expandedCategories.includes(category.id) && (
                      <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="space-y-2 pt-3">
                          {category.components.map((component) => {
                            // Calculate the weighted total for this component (category weight * component weight / 100)
                            const weightedTotal = (category.weight * component.weight / 100).toFixed(1);
                            return (
                              <div key={component.id} className="flex items-center justify-between text-sm py-1">
                                <div className="flex items-center gap-2 flex-1">
                                  <span className={`flex items-center gap-2 ${
                                    component.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                                    component.status === 'in-progress' ? 'text-orange-600 dark:text-orange-400' :
                                    'text-gray-500 dark:text-gray-400'
                                  }`}>
                                    <span className="w-4 text-center">
                                      {component.status === 'completed' ? '✓' : 
                                       component.status === 'in-progress' ? '◐' : '○'}
                                    </span>
                                    {component.name}
                                  </span>
                                  <span className="text-xs text-gray-400 ml-2">
                                    ({weightedTotal}%)
                                  </span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  component.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  component.status === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {component.status === 'completed' ? 'Complete' :
                                   component.status === 'in-progress' ? 'In Progress' : 'Pending'}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => setSelectedDrone(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
