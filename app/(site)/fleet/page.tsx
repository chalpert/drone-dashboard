"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Minus, X } from "lucide-react"
import { BuildDrone } from "@/lib/types"


export default function FleetPage() {
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDrone, setSelectedDrone] = useState<BuildDrone | null>(null)
  const [expandedSystems, setExpandedSystems] = useState<string[]>([])
  const [filteredDrones, setFilteredDrones] = useState<BuildDrone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDrones()
  }, [])

  const fetchDrones = async () => {
    try {
      const response = await fetch('/api/drones')
      if (response.ok) {
        const data = await response.json()
        setFilteredDrones(data)
      } else {
        console.error('Failed to fetch drones')
      }
    } catch (error) {
      console.error('Error fetching drones:', error)
    } finally {
      setLoading(false)
    }
  }



  const toggleSystem = (systemId: string) => {
    setExpandedSystems(prev => 
      prev.includes(systemId) 
        ? prev.filter(id => id !== systemId)
        : [...prev, systemId]
    )
  }

  const statusFilteredDrones = filteredDrones.filter(drone => {
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
    all: filteredDrones.length,
    'in-progress': filteredDrones.filter(d => d.status === 'in-progress' || (d.overallCompletion > 0 && d.overallCompletion < 100)).length,
    'pending': filteredDrones.filter(d => d.status === 'pending' || d.overallCompletion === 0).length,
    'completed': filteredDrones.filter(d => d.status === 'completed').length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in-progress': return 'bg-orange-500' 
      case 'pending': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }



  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600 dark:text-green-400'
    if (progress >= 70) return 'text-blue-600 dark:text-blue-400'
    if (progress >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Consistent Functional Header - Assembly Workflow Aligned */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Fleet Management</h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mt-1">
            Comprehensive oversight of drone manufacturing and assembly operations
          </p>
        </div>
      </div>



      {/* Executive Status Overview - Compact Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card
            key={status}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
              selectedStatus === status
                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                : 'bg-white dark:bg-gray-800 shadow border-0 hover:shadow-xl'
            }`}
            onClick={() => setSelectedStatus(status)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                    {status === 'all' ? 'Total Fleet' : status.replace('-', ' ')}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                    {count}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} shadow-lg`}></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fleet Overview Grid - Tablet Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {statusFilteredDrones.map((drone) => (
          <Card 
            key={drone.serial} 
            className="bg-white dark:bg-gray-800 shadow-lg border-0 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            onClick={() => setSelectedDrone(drone)}
          >
            <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Serial {drone.serial}
                  </CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {drone.model} Platform
                  </p>
                </div>
                <Badge 
                  variant="outline"
                  className={`px-3 py-1 text-xs font-medium ${
                    drone.status === 'completed' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700' :
                    drone.status === 'in-progress' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-700' :
                    'bg-gray-50 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {drone.status.replace('-', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                {/* Overall Progress */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Assembly Progress</span>
                    <span className={`text-lg font-bold ${getProgressColor(drone.overallCompletion)}`}>
                      {drone.overallCompletion}%
                    </span>
                  </div>
                  <Progress value={drone.overallCompletion} className="h-4 sm:h-5" />
                </div>

                {/* System Progress */}
                <div className="space-y-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    System Status
                  </div>
                  {drone.systems?.slice(0, 4).map((system) => (
                    <div key={system.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{system.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" 
                            style={{ width: `${system.completionPercentage}%` }}
                          />
                        </div>
                        {/* Removed percentage number display - keeping only visual progress bar */}
                      </div>
                    </div>
                  )) || []}
                </div>

                {/* Action Buttons - Touch Optimized with Workflow Integration */}
                <div className="pt-2 flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-medium py-3 text-base touch-manipulation"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedDrone(drone)
                    }}
                  >
                    View Detailed Analysis
                  </Button>
                  {drone.status === 'in-progress' && (
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 text-sm touch-manipulation"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.location.href = `/build-activity?serial=${drone.serial}`
                      }}
                    >
                      Update Assembly Progress
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Build Progress Modal - Touch Optimized */}
      {selectedDrone && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50"
          onClick={() => setSelectedDrone(null)}
        >
          <Card 
            className="w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-white dark:bg-gray-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="pb-4 sm:pb-6">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    Serial {selectedDrone.serial}
                  </CardTitle>
                  <p className="text-gray-500 dark:text-gray-400 mt-1 text-base">
                    Complete component status and progress tracking
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-left sm:text-right">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                      {selectedDrone.overallCompletion}%
                    </div>
                    <div className="text-sm text-gray-500">
                      Overall Complete
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedDrone(null)}
                    className="text-gray-400 hover:text-gray-900 dark:hover:text-white h-12 w-12 touch-manipulation"
                  >
                    <X className="w-6 h-6" />
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

              {/* System Breakdown */}
              <div className="space-y-3">
                {selectedDrone.systems?.map((system) => (
                  <div key={system.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" 
                      onClick={() => toggleSystem(system.id)}
                    >
                      <div className="flex items-center gap-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">{system.name}</h4>
                        <span className="text-sm text-gray-500">({system.weight}% of total)</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                            style={{ width: `${system.completionPercentage}%` }}
                          />
                        </div>
                        <Button variant="ghost" className="h-10 w-10 touch-manipulation">
                          {expandedSystems.includes(system.id) ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </Button>
                      </div>
                    </div>
                    {expandedSystems.includes(system.id) && (
                      <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="space-y-3 pt-3">
                          {system.assemblies?.map((assembly) => (
                            <div key={assembly.id} className="border border-gray-100 dark:border-gray-600 rounded p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">{assembly.name}</h5>
                                <span className="text-xs text-gray-500">{assembly.completionPercentage}%</span>
                              </div>
                              <div className="space-y-1">
                                {assembly.items?.map((item) => (
                                  <div key={item.id} className="flex items-center justify-between text-xs py-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`w-3 text-center ${
                                        item.status === 'completed' ? 'text-green-600' :
                                        item.status === 'in-progress' ? 'text-orange-600' :
                                        'text-gray-400'
                                      }`}>
                                        {item.status === 'completed' ? '✓' : 
                                         item.status === 'in-progress' ? '◐' : '○'}
                                      </span>
                                      <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                                    </div>
                                    <span className={`px-1 py-0.5 rounded text-xs ${
                                      item.status === 'completed' ? 'bg-green-100 text-green-700' :
                                      item.status === 'in-progress' ? 'bg-orange-100 text-orange-700' :
                                      'bg-gray-100 text-gray-600'
                                    }`}>
                                      {item.status === 'completed' ? 'Completed' :
                                       item.status === 'in-progress' ? 'In Progress' : 'Pending'}
                                    </span>
                                  </div>
                                )) || []}
                              </div>
                            </div>
                          )) || []}
                        </div>
                      </div>
                    )}
                  </div>
                )) || []}
              </div>

              <div className="flex justify-center sm:justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => setSelectedDrone(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 text-base font-medium w-full sm:w-auto touch-manipulation"
                >
                  Close Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
