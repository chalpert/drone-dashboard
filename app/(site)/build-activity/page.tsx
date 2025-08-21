"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, CheckCircle, AlertCircle } from "lucide-react"
import { BuildDrone, BuildActivity, ItemStatus } from "@/lib/types"
import { RealTimeIndicator } from "@/components/real-time-provider"

interface AssemblyWorkflowData {
  selectedDrones: string[]
  selectedSystem: string
  selectedAssembly: string
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
    selectedAssembly: '',
    selectedItems: [],
    status: 'pending',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  // BUG-001: Page crash on reload - problematic useEffect that causes infinite loop
  useEffect(() => {
    // This effect runs after every render and causes a crash when the page is reloaded
    // It tries to access properties that might not exist during the reload process
    if (drones.length > 0 && activities.length > 0) {
      // Force a re-render by updating state, causing infinite loop
      setLoading(false)
      setLoading(true) // This creates an infinite loop that crashes the page
    }
  }) // Missing dependency array causes this to run on every render

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
          selectedAssembly: '',
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
      // BUG-001: Submit button hanging animation - don't reset submitting state on error
      // This causes the button to stay in loading state indefinitely after errors
      // setSubmitting(false) // Commented out to create the bug
    }
    // BUG-001: Removed finally block that would reset submitting state
    // This causes the button to hang in loading animation even after successful submissions
    // The updates still work but the UI gets stuck
    // finally {
    //   setSubmitting(false)
    // }
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

  const getAvailableAssemblies = () => {
    const assembliesSet = new Set<string>()
    workflowForm.selectedDrones.forEach(droneSerial => {
      const drone = drones.find(d => d.serial === droneSerial)
      const system = drone?.systems.find(s => s.name === workflowForm.selectedSystem)
      system?.assemblies.forEach(assembly => {
        assembliesSet.add(assembly.name)
      })
    })
    return Array.from(assembliesSet)
  }

  const getAvailableItemsForAssembly = () => {
    const itemsMap = new Map<string, { id: string; name: string; status: string }>()

    // Only get items if we have selected drones, system, and assembly
    if (workflowForm.selectedDrones.length > 0 && workflowForm.selectedSystem && workflowForm.selectedAssembly) {
      // Use the first selected drone as the template (all drones should have the same item structure)
      const templateDrone = drones.find(d => d.serial === workflowForm.selectedDrones[0])
      const system = templateDrone?.systems.find(s => s.name === workflowForm.selectedSystem)
      const assembly = system?.assemblies.find(a => a.name === workflowForm.selectedAssembly)

      assembly?.items.forEach(item => {
        itemsMap.set(item.id, {
          id: item.id,
          name: item.name,
          status: item.status
        })
      })
    }

    return Array.from(itemsMap.values())
  }

  const getSelectedItemName = (itemId: string) => {
    const availableItems = getAvailableItemsForAssembly()
    const item = availableItems.find(item => item.id === itemId)
    return item?.name || ''
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
    <div className="space-y-6">
      {/* Streamlined Assembly Form */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Drone Selection Grid */}
            <div>
              <Label className="text-base font-medium text-gray-900 dark:text-white mb-3 block">Select Drones</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                {drones.map((drone) => (
                  <div key={drone.serial} className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded">
                    <Checkbox
                      id={`drone-${drone.serial}`}
                      checked={workflowForm.selectedDrones.includes(drone.serial)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setWorkflowForm(prev => ({
                            ...prev,
                            selectedDrones: [...prev.selectedDrones, drone.serial]
                          }))
                        } else {
                          setWorkflowForm(prev => ({
                            ...prev,
                            selectedDrones: prev.selectedDrones.filter(s => s !== drone.serial)
                          }))
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <label htmlFor={`drone-${drone.serial}`} className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer block truncate">
                        {drone.serial}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{drone.overallCompletion}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System, Assembly, Item Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">System</Label>
                <Select
                  value={workflowForm.selectedSystem}
                  onValueChange={(value) => setWorkflowForm(prev => ({ ...prev, selectedSystem: value, selectedItems: [] }))}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select system..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableSystems().map((systemName) => (
                      <SelectItem key={systemName} value={systemName}>
                        {systemName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">Assembly</Label>
                <Select
                  value={workflowForm.selectedAssembly || ''}
                  onValueChange={(value) => setWorkflowForm(prev => ({ ...prev, selectedAssembly: value, selectedItems: [] }))}
                  disabled={!workflowForm.selectedSystem}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select assembly..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableAssemblies().map((assemblyName) => (
                      <SelectItem key={assemblyName} value={assemblyName}>
                        {assemblyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">Item</Label>
                <Select
                  value={workflowForm.selectedItems.length === 1 ? workflowForm.selectedItems[0] : ''}
                  onValueChange={(value) => setWorkflowForm(prev => ({ ...prev, selectedItems: [value] }))}
                  disabled={!workflowForm.selectedAssembly}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select item...">
                      {workflowForm.selectedItems.length === 1 ? getSelectedItemName(workflowForm.selectedItems[0]) : ''}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableItemsForAssembly().map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status and Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">Status</Label>
                <Select
                  value={workflowForm.status}
                  onValueChange={(value) => setWorkflowForm(prev => ({ ...prev, status: value as ItemStatus }))}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="in-progress">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        In Progress
                      </div>
                    </SelectItem>
                    <SelectItem value="completed">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Completed
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">Notes</Label>
                <Textarea
                  placeholder="Work notes..."
                  value={workflowForm.notes}
                  onChange={(e) => setWorkflowForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <RealTimeIndicator className="text-xs" />
                {submitSuccess && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs">
                    ✓ Submitted
                  </Badge>
                )}
              </div>
              <Button
                onClick={submitWorkflow}
                disabled={submitting || !workflowForm.selectedDrones.length || !workflowForm.selectedItems.length}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit Updates
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compact Activity Timeline */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium text-gray-900 dark:text-white">
            <Clock className="h-4 w-4 text-gray-500" />
            Recent Activity
            <Badge variant="outline" className="text-xs">
              {activities.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {activities.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-2 rounded bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {activity.droneSerial}
                      </span>
                      <Badge className={`${getActivityBadgeColor(activity.action)} text-xs px-1.5 py-0.5`}>
                        {activity.action}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
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
