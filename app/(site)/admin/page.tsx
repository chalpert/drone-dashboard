"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BuildDrone, ComponentStatus } from "@/lib/types"

export default function AdminPage() {
  const [drones, setDrones] = useState<BuildDrone[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDrone, setSelectedDrone] = useState<BuildDrone | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchDrones()
  }, [])

  const fetchDrones = async () => {
    try {
      const response = await fetch('/api/drones')
      if (response.ok) {
        const data = await response.json()
        setDrones(data)
      } else {
        console.error('Failed to fetch drones')
      }
    } catch (error) {
      console.error('Error fetching drones:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateComponentStatus = async (componentId: string, status: ComponentStatus, droneSerial: string) => {
    console.log('Updating component:', componentId, 'to status:', status)
    setUpdating(componentId)
    
    try {
      const response = await fetch(`/api/drones/${droneSerial}/components`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ componentId, status }),
      })

      if (response.ok) {
        console.log('Component update successful, refreshing data...')
        // Fetch fresh data
        const refreshResponse = await fetch('/api/drones')
        if (refreshResponse.ok) {
          const freshData = await refreshResponse.json()
          setDrones(freshData)
          
          // Update selected drone with fresh data
          if (selectedDrone?.serial === droneSerial) {
            const updatedDrone = freshData.find((d: BuildDrone) => d.serial === droneSerial)
            if (updatedDrone) {
              console.log('Updated selected drone:', updatedDrone.serial, 'Overall completion:', updatedDrone.overallCompletion)
              setSelectedDrone(updatedDrone)
            }
          }
        }
      } else {
        console.error('Failed to update component status')
      }
    } catch (error) {
      console.error('Error updating component:', error)
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (status: ComponentStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white'
      case 'in-progress':
        return 'bg-orange-500 text-white'
      case 'pending':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage drone build progress and update component statuses
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drone Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Drone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {drones.map((drone) => (
                <div
                  key={drone.serial}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDrone?.serial === drone.serial
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedDrone(drone)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Serial: {drone.serial}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Model: {drone.model}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getStatusColor(drone.status)}>
                        {drone.status.replace('-', ' ')}
                      </Badge>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                        {drone.overallCompletion}% Complete
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Component Management */}
        {selectedDrone && (
          <Card>
            <CardHeader>
              <CardTitle>
                Manage Components - Serial: {selectedDrone.serial}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedDrone.categories.map((category) => (
                  <div key={category.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {category.completionPercentage.toFixed(1)}% Complete
                      </span>
                    </div>
                    <div className="space-y-2">
                      {category.components.map((component) => (
                        <div
                          key={component.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {component.name}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({((category.weight * component.weight) / 100).toFixed(1)}% of total)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              value={component.status}
                              onValueChange={(value: ComponentStatus) =>
                                updateComponentStatus(component.id, value, selectedDrone.serial)
                              }
                              disabled={updating === component.id}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                            {updating === component.id && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
