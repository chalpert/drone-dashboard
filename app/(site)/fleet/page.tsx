"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, Plus, Settings, Clock } from "lucide-react"
import { mockBuildDrones } from "@/lib/mockBuildData"
import { BuildDrone } from "@/lib/types"

export default function FleetPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDrone, setSelectedDrone] = useState<BuildDrone | null>(null)

  const filteredDrones = mockBuildDrones.filter(drone => {
    const matchesSearch = drone.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         drone.model.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || drone.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: mockBuildDrones.length,
    'in-build': mockBuildDrones.filter(d => d.status === 'in-build').length,
    'testing': mockBuildDrones.filter(d => d.status === 'testing').length,
    'completed': mockBuildDrones.filter(d => d.status === 'completed').length,
    'planning': mockBuildDrones.filter(d => d.status === 'planning').length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'testing': return 'bg-blue-500'
      case 'in-build': return 'bg-orange-500' 
      case 'planning': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default'
      case 'testing': return 'secondary'
      case 'in-build': return 'default'
      case 'planning': return 'outline'
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

      {/* Stats and Search */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {/* Search */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by serial or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Status Filter Stats */}
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
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                            style={{ width: `${category.completionPercentage}%` }}
                          />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium min-w-[3ch]">
                          {category.completionPercentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Estimated Completion */}
                {drone.estimatedCompletion && (
                  <div className="flex items-center gap-2 pt-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Est. completion: {new Date(drone.estimatedCompletion).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-2">
                  <Link href={`/fleet/${drone.serial}`}>
                    <Button variant="outline" className="w-full">
                      View Build Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Build Progress Modal */}
      {selectedDrone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Serial: {selectedDrone.serial}
                </CardTitle>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Model: {selectedDrone.model}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(selectedDrone.status)}>
                  {selectedDrone.status.replace('-', ' ')}
                </Badge>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedDrone(null)}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Progress */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Build Progress</h3>
                  <span className={`text-2xl font-bold ${getProgressColor(selectedDrone.overallCompletion)}`}>
                    {selectedDrone.overallCompletion}%
                  </span>
                </div>
                <Progress value={selectedDrone.overallCompletion} className="h-4" />
              </div>

              {/* Category Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Component Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDrone.categories.map((category) => (
                    <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {category.completionPercentage}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {category.weight}% of total
                          </div>
                        </div>
                      </div>
                      <Progress value={category.completionPercentage} className="h-2 mb-3" />
                      <div className="space-y-1">
                        {category.components.map((component) => (
                          <div key={component.id} className="flex items-center justify-between text-xs">
                            <span className={`${
                              component.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                              component.status === 'in-progress' ? 'text-orange-600 dark:text-orange-400' :
                              'text-gray-500 dark:text-gray-400'
                            }`}>
                              {component.status === 'completed' ? '✓' : 
                               component.status === 'in-progress' ? '◐' : '○'}
                              {' '}{component.name}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500">
                              {Math.round(component.weight)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Build Timeline */}
              {(selectedDrone.startDate || selectedDrone.estimatedCompletion) && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {selectedDrone.startDate && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Build Started
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(selectedDrone.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedDrone.estimatedCompletion && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Estimated Completion
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(selectedDrone.estimatedCompletion).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Link href={`/fleet/${selectedDrone.serial}`} className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    View Full Build Details
                  </Button>
                </Link>
                <Button
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedDrone(null)}
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
