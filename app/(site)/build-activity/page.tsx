"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, CheckCircle, AlertCircle, Wrench, Users } from "lucide-react"
import { BuildDrone, BuildActivity, ItemStatus } from "@/lib/types"
import { RealTimeIndicator } from "@/components/real-time-provider"

interface AssemblyWorkflowData {
  selectedDrones: string[]
  selectedSystem: string
  selectedItems: string[]
  status: ItemStatus
  notes: string
}

export default function BuildActivityPage() {
  const [drones, setDrones] = useState<BuildDrone[]>([])
  const [activities, setActivities] = useState<BuildActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Assembly workflow form state
  const [workflowForm, setWorkflowForm] = useState<AssemblyWorkflowData>({
    selectedDrones: [],
    selectedSystem: '',
    selectedItems: [],
    status: 'pending',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/drones')
      if (response.ok) {
        const data = await response.json()
        setDrones(data)
        
        // Extract and combine all build activities
        const allActivities: BuildActivity[] = []
        data.forEach((drone: BuildDrone) => {
          if (drone.buildActivities) {
            allActivities.push(...drone.buildActivities)
          }
        })
        
        // Sort by most recent first and take only the most recent 10 for compact display
        allActivities.sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        })

        setActivities(allActivities.slice(0, 10))
      } else {
        console.error('Failed to fetch drones')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitWorkflow = async () => {
    if (!workflowForm.selectedDrones.length || !workflowForm.selectedSystem || !workflowForm.selectedItems.length || !workflowForm.status) {
      alert('Please complete all required fields: Drones, System, Items, and Status')
      return
    }

    setSubmitting(true)
    try {
      // Process each selected drone and item combination
      const updatePromises = []

      for (const droneSerial of workflowForm.selectedDrones) {
        for (const itemId of workflowForm.selectedItems) {
          updatePromises.push(
            fetch(`/api/drones/${droneSerial}/components`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                itemId: itemId,
                status: workflowForm.status,
                notes: workflowForm.notes
              }),
            })
          )
        }
      }

      const responses = await Promise.all(updatePromises)
      const failedUpdates = responses.filter(response => !response.ok)

      if (failedUpdates.length === 0) {
        // Reset form
        setWorkflowForm({
          selectedDrones: [],
          selectedSystem: '',
          selectedItems: [],
          status: 'pending',
          notes: ''
        })

        // Show success message
        setSubmitSuccess(true)
        setTimeout(() => setSubmitSuccess(false), 3000)

        // Refresh data
        await fetchData()
      } else {
        throw new Error(`${failedUpdates.length} updates failed`)
      }
    } catch (error) {
      console.error('Error submitting workflow:', error)
      alert('Failed to submit some updates. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getAvailableSystems = () => {
    const systemsSet = new Set<string>()
    workflowForm.selectedDrones.forEach(droneSerial => {
      const drone = drones.find(d => d.serial === droneSerial)
      drone?.systems.forEach(system => {
        systemsSet.add(system.name)
      })
    })
    return Array.from(systemsSet)
  }

  const getAvailableItemsForSystem = () => {
    const itemsMap = new Map<string, { id: string; name: string; status: string }>()

    workflowForm.selectedDrones.forEach(droneSerial => {
      const drone = drones.find(d => d.serial === droneSerial)
      const system = drone?.systems.find(s => s.name === workflowForm.selectedSystem)

      system?.assemblies.forEach(assembly => {
        assembly.items.forEach(item => {
          itemsMap.set(item.id, {
            id: item.id,
            name: `${assembly.name} - ${item.name}`,
            status: item.status
          })
        })
      })
    })

    return Array.from(itemsMap.values())
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'started':
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-orange-500" />
    }
  }

  const getActivityBadgeColor = (action: string) => {
    switch (action) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'started':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      default:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
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
    <div className="space-y-6 sm:space-y-8">
      {/* Simple Functional Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Assembly Workflow</h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mt-1">
            Update build progress for assembly team
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RealTimeIndicator className="text-sm bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" />
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{activities.length}</div>
            <div>Recent Updates</div>
          </div>
        </div>
      </div>

      {/* Main Assembly Workflow Form */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
        <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-6">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Wrench className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            Assembly Team Workflow
            {submitSuccess && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-700">
                ✓ Updates Submitted Successfully
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="space-y-8">
            {/* Step 1: Drone Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">1</div>
                <Label className="text-lg font-semibold text-gray-900 dark:text-white">Select Drone(s)</Label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ml-11">
                {drones.map((drone) => (
                  <div key={drone.serial} className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <Checkbox
                      id={`drone-${drone.serial}`}
                      checked={workflowForm.selectedDrones.includes(drone.serial)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setWorkflowForm(prev => ({
                            ...prev,
                            selectedDrones: [...prev.selectedDrones, drone.serial],
                            selectedSystem: '',
                            selectedItems: []
                          }))
                        } else {
                          setWorkflowForm(prev => ({
                            ...prev,
                            selectedDrones: prev.selectedDrones.filter(s => s !== drone.serial),
                            selectedSystem: '',
                            selectedItems: []
                          }))
                        }
                      }}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <label htmlFor={`drone-${drone.serial}`} className="text-base font-medium text-gray-900 dark:text-white cursor-pointer">
                        {drone.serial}
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{drone.model} - {drone.overallCompletion}% complete</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: System Selection */}
            {workflowForm.selectedDrones.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">2</div>
                  <Label className="text-lg font-semibold text-gray-900 dark:text-white">Select System Category</Label>
                </div>
                <div className="ml-11">
                  <Select
                    value={workflowForm.selectedSystem}
                    onValueChange={(value) => setWorkflowForm(prev => ({ ...prev, selectedSystem: value, selectedItems: [] }))}
                  >
                    <SelectTrigger className="w-full max-w-md h-12 text-base">
                      <SelectValue placeholder="Choose system category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableSystems().map((systemName) => (
                        <SelectItem key={systemName} value={systemName} className="text-base py-3">
                          {systemName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Item Selection */}
            {workflowForm.selectedSystem && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">3</div>
                  <Label className="text-lg font-semibold text-gray-900 dark:text-white">Select Items/Components</Label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-11">
                  {getAvailableItemsForSystem().map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={workflowForm.selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setWorkflowForm(prev => ({
                              ...prev,
                              selectedItems: [...prev.selectedItems, item.id]
                            }))
                          } else {
                            setWorkflowForm(prev => ({
                              ...prev,
                              selectedItems: prev.selectedItems.filter(id => id !== item.id)
                            }))
                          }
                        }}
                        className="w-5 h-5"
                      />
                      <div className="flex-1">
                        <label htmlFor={`item-${item.id}`} className="text-base font-medium text-gray-900 dark:text-white cursor-pointer">
                          {item.name}
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Current: {item.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Status and Notes */}
            {workflowForm.selectedItems.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">4</div>
                  <Label className="text-lg font-semibold text-gray-900 dark:text-white">Status & Work Notes</Label>
                </div>
                <div className="ml-11 space-y-6">
                  <div>
                    <Label className="text-base font-medium text-gray-900 dark:text-white mb-3 block">Update Status</Label>
                    <Select
                      value={workflowForm.status}
                      onValueChange={(value) => setWorkflowForm(prev => ({ ...prev, status: value as ItemStatus }))}
                    >
                      <SelectTrigger className="w-full max-w-md h-12 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending" className="text-base py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                            Pending
                          </div>
                        </SelectItem>
                        <SelectItem value="in-progress" className="text-base py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            In Progress
                          </div>
                        </SelectItem>
                        <SelectItem value="completed" className="text-base py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            Completed
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-medium text-gray-900 dark:text-white mb-3 block">Work Notes</Label>
                    <Textarea
                      placeholder="Document the work performed, any issues encountered, next steps, or other important details..."
                      value={workflowForm.notes}
                      onChange={(e) => setWorkflowForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={6}
                      className="w-full text-base p-4 resize-none"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Detailed notes help track progress and communicate with other team members
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Submit */}
            {workflowForm.selectedItems.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">5</div>
                  <Label className="text-lg font-semibold text-gray-900 dark:text-white">Submit Updates</Label>
                </div>
                <div className="ml-11">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <div className="space-y-3 mb-6">
                      <p className="text-base font-medium text-gray-900 dark:text-white">Ready to submit:</p>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <p>• <strong>{workflowForm.selectedDrones.length}</strong> drone(s): {workflowForm.selectedDrones.join(', ')}</p>
                        <p>• <strong>{workflowForm.selectedItems.length}</strong> item(s) in <strong>{workflowForm.selectedSystem}</strong></p>
                        <p>• Status: <strong className="capitalize">{workflowForm.status}</strong></p>
                      </div>
                    </div>
                    <Button
                      onClick={submitWorkflow}
                      disabled={submitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-medium w-full sm:w-auto touch-manipulation"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Submitting Updates...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-3" />
                          Submit All Updates
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compact Activity Timeline */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
        <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-white">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            Recent Activity
            <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600 text-xs">
              Last {activities.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border-l-2 border-l-blue-500"
                >
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {activity.droneSerial}
                      </span>
                      <Badge className={`${getActivityBadgeColor(activity.action)} text-xs px-2 py-0.5`}>
                        {activity.action}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      {activity.itemName} • {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>


    </div>
  )
}
