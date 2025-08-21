"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Clock, CheckCircle, AlertCircle, Search, RefreshCw } from "lucide-react"
import { BuildDrone, BuildActivity, ItemStatus } from "@/lib/types"
import { exportActivitiesToCSV, generateTimestampedFilename } from "@/lib/export-utils"
import { RealTimeIndicator } from "@/components/real-time-provider"

interface ActivityFormData {
  droneSerial: string
  systemName: string
  assemblyName: string
  itemName: string
  action: 'started' | 'completed' | 'updated'
  notes: string
}

interface AssemblyUpdateData {
  droneSerial: string
  systemName: string
  assemblyName: string
  itemId: string
  newStatus: ItemStatus
  notes: string
}

export default function BuildActivityPage() {
  const [drones, setDrones] = useState<BuildDrone[]>([])
  const [activities, setActivities] = useState<BuildActivity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<BuildActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showNewActivityForm, setShowNewActivityForm] = useState(false)
  const [showAssemblyUpdateForm, setShowAssemblyUpdateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Form states
  const [activityForm, setActivityForm] = useState<ActivityFormData>({
    droneSerial: '',
    systemName: '',
    assemblyName: '',
    itemName: '',
    action: 'started',
    notes: ''
  })
  
  const [assemblyUpdateForm, setAssemblyUpdateForm] = useState<AssemblyUpdateData>({
    droneSerial: '',
    systemName: '',
    assemblyName: '',
    itemId: '',
    newStatus: 'pending',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Filter activities based on search term
    if (searchTerm.trim()) {
      const filtered = activities.filter(activity => 
        activity.droneSerial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.assemblyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.systemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.notes && activity.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredActivities(filtered)
    } else {
      setFilteredActivities(activities)
    }
  }, [activities, searchTerm])

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
        
        // Sort by most recent first
        allActivities.sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        })
        
        setActivities(allActivities)
      } else {
        console.error('Failed to fetch drones')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitActivity = async () => {
    if (!activityForm.droneSerial || !activityForm.itemName || !activityForm.assemblyName || !activityForm.systemName) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      // Here you would typically make an API call to submit the activity
      // For now, we'll simulate it and refresh the data
      console.log('Submitting activity:', activityForm)
      
      // Reset form and close modal
      setActivityForm({
        droneSerial: '',
        systemName: '',
        assemblyName: '',
        itemName: '',
        action: 'started',
        notes: ''
      })
      setShowNewActivityForm(false)
      
      // Refresh data
      await fetchData()
      
      alert('Activity submitted successfully!')
    } catch (error) {
      console.error('Error submitting activity:', error)
      alert('Failed to submit activity')
    } finally {
      setSubmitting(false)
    }
  }

  const submitAssemblyUpdate = async () => {
    if (!assemblyUpdateForm.droneSerial || !assemblyUpdateForm.itemId || !assemblyUpdateForm.newStatus) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/drones/${assemblyUpdateForm.droneSerial}/components`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: assemblyUpdateForm.itemId,
          status: assemblyUpdateForm.newStatus
        }),
      })

      if (response.ok) {
        // Reset form and close modal
        setAssemblyUpdateForm({
          droneSerial: '',
          systemName: '',
          assemblyName: '',
          itemId: '',
          newStatus: 'pending',
          notes: ''
        })
        setShowAssemblyUpdateForm(false)
        
        // Refresh data
        await fetchData()
        
        alert('Item status updated successfully!')
      } else {
        throw new Error('Failed to update item status')
      }
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Failed to update item status')
    } finally {
      setSubmitting(false)
    }
  }

  const getSelectedDroneData = (droneSerial: string) => {
    return drones.find(drone => drone.serial === droneSerial)
  }

  const getSystemsForDrone = (droneSerial: string) => {
    const drone = getSelectedDroneData(droneSerial)
    return drone?.systems || []
  }

  const getAssembliesForSystem = (droneSerial: string, systemName: string) => {
    const systems = getSystemsForDrone(droneSerial)
    const system = systems.find(sys => sys.name === systemName)
    return system?.assemblies || []
  }

  const getItemsForAssembly = (droneSerial: string, systemName: string, assemblyName: string) => {
    const assemblies = getAssembliesForSystem(droneSerial, systemName)
    const assembly = assemblies.find(asm => asm.name === assemblyName)
    return assembly?.items || []
  }

  const handleExport = () => {
    const filename = generateTimestampedFilename('build-activities', 'csv')
    exportActivitiesToCSV(filteredActivities, filename)
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
      {/* Executive Header - Tablet Optimized */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 dark:from-indigo-800 dark:to-purple-800 -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 rounded-t-lg mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Operations Center</h1>
            <p className="text-indigo-100 text-base sm:text-lg">
              Real-time monitoring and management of all assembly activities
            </p>
          </div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <RealTimeIndicator className="text-sm bg-white/10 px-3 py-2 rounded-lg text-white" />
              <div className="text-indigo-100 text-sm text-left sm:text-right">
                <div className="text-xl font-bold text-white">{activities.length}</div>
                <div>Total Operations</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Button 
                onClick={() => setShowNewActivityForm(true)}
                className="bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 text-base font-medium w-full sm:w-auto touch-manipulation"
              >
                <Plus className="w-5 h-5 mr-2" />
                Log Activity
              </Button>
              <Button 
                onClick={() => setShowAssemblyUpdateForm(true)}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-6 py-3 text-base font-medium w-full sm:w-auto touch-manipulation"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Update Status
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Metrics Dashboard - Tablet Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Operations</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {activities.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All Time</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Completed Today</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {activities.filter(a => 
                    a.action === 'completed' && 
                    new Date(a.timestamp).toDateString() === new Date().toDateString()
                  ).length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Daily Target</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Active Units</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {new Set(activities.map(a => a.droneSerial)).size}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">In Production</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <AlertCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Recent Activity</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {activities.filter(a => 
                    new Date(a.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
                  ).length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last 24 Hours</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <RefreshCw className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter - Mobile Optimized */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search activities by drone serial, item, assembly, system, or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 py-3 text-base"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={handleExport} className="px-6 py-3 text-base touch-manipulation">
            Export CSV
          </Button>
          <Button variant="outline" onClick={fetchData} className="px-6 py-3 text-base touch-manipulation">
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Activity Timeline */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
        <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
          <CardTitle className="flex items-center justify-between text-xl font-bold text-gray-900 dark:text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              Activity Timeline
            </div>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700">
              {filteredActivities.length} Operations
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Activities Found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  No activities match your current search criteria
                </p>
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-start gap-4 p-5 rounded-lg bg-gray-50 dark:bg-gray-700/50 border-l-4 border-l-indigo-500 hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors duration-200"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white text-lg">
                        Unit {activity.droneSerial}
                      </span>
                      <Badge className={`${getActivityBadgeColor(activity.action)} font-medium px-3 py-1`}>
                        {activity.action.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {activity.itemName} <span className="text-gray-500 dark:text-gray-400">in</span> {activity.assemblyName}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <span className="font-medium">{activity.systemName}</span>
                      <span>•</span>
                      <span>{new Date(activity.timestamp).toLocaleString()}</span>
                    </div>
                    
                    {activity.notes && (
                      <div className="text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-600 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Notes:</div>
                        {activity.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* New Activity Form Modal */}
      {showNewActivityForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Log New Build Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="drone-select">Drone Serial</Label>
                  <Select
                    value={activityForm.droneSerial}
                    onValueChange={(value) => setActivityForm(prev => ({ 
                      ...prev, 
                      droneSerial: value,
                      systemName: '',
                      assemblyName: '',
                      itemName: ''
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select drone" />
                    </SelectTrigger>
                    <SelectContent>
                      {drones.map((drone) => (
                        <SelectItem key={drone.serial} value={drone.serial}>
                          {drone.serial} - {drone.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="action-select">Action</Label>
                  <Select
                    value={activityForm.action}
                    onValueChange={(value) => 
                      setActivityForm(prev => ({ ...prev, action: value as 'started' | 'completed' | 'updated' }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="started">Started</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="updated">Updated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {activityForm.droneSerial && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>System</Label>
                    <Select
                      value={activityForm.systemName}
                      onValueChange={(value) => setActivityForm(prev => ({ 
                        ...prev, 
                        systemName: value,
                        assemblyName: '',
                        itemName: ''
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select system" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSystemsForDrone(activityForm.droneSerial).map((system) => (
                          <SelectItem key={system.id} value={system.name}>
                            {system.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Assembly</Label>
                    <Select
                      value={activityForm.assemblyName}
                      onValueChange={(value) => setActivityForm(prev => ({ 
                        ...prev, 
                        assemblyName: value,
                        itemName: ''
                      }))}
                      disabled={!activityForm.systemName}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select assembly" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAssembliesForSystem(activityForm.droneSerial, activityForm.systemName).map((assembly) => (
                          <SelectItem key={assembly.id} value={assembly.name}>
                            {assembly.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Item</Label>
                    <Select
                      value={activityForm.itemName}
                      onValueChange={(value) => setActivityForm(prev => ({ ...prev, itemName: value }))}
                      disabled={!activityForm.assemblyName}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {getItemsForAssembly(activityForm.droneSerial, activityForm.systemName, activityForm.assemblyName).map((item) => (
                          <SelectItem key={item.id} value={item.name}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this activity..."
                  value={activityForm.notes}
                  onChange={(e) => setActivityForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowNewActivityForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitActivity}
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submitting ? 'Submitting...' : 'Submit Activity'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assembly Update Form Modal */}
      {showAssemblyUpdateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Update Item Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Drone Serial</Label>
                  <Select
                    value={assemblyUpdateForm.droneSerial}
                    onValueChange={(value) => setAssemblyUpdateForm(prev => ({ 
                      ...prev, 
                      droneSerial: value,
                      systemName: '',
                      assemblyName: '',
                      itemId: ''
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select drone" />
                    </SelectTrigger>
                    <SelectContent>
                      {drones.map((drone) => (
                        <SelectItem key={drone.serial} value={drone.serial}>
                          {drone.serial} - {drone.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>New Status</Label>
                  <Select
                    value={assemblyUpdateForm.newStatus}
                    onValueChange={(value) => 
                      setAssemblyUpdateForm(prev => ({ ...prev, newStatus: value as ItemStatus }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {assemblyUpdateForm.droneSerial && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>System</Label>
                    <Select
                      value={assemblyUpdateForm.systemName}
                      onValueChange={(value) => setAssemblyUpdateForm(prev => ({ 
                        ...prev, 
                        systemName: value,
                        assemblyName: '',
                        itemId: ''
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select system" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSystemsForDrone(assemblyUpdateForm.droneSerial).map((system) => (
                          <SelectItem key={system.id} value={system.name}>
                            {system.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Assembly</Label>
                    <Select
                      value={assemblyUpdateForm.assemblyName}
                      onValueChange={(value) => setAssemblyUpdateForm(prev => ({ 
                        ...prev, 
                        assemblyName: value,
                        itemId: ''
                      }))}
                      disabled={!assemblyUpdateForm.systemName}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select assembly" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAssembliesForSystem(assemblyUpdateForm.droneSerial, assemblyUpdateForm.systemName).map((assembly) => (
                          <SelectItem key={assembly.id} value={assembly.name}>
                            {assembly.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Item</Label>
                    <Select
                      value={assemblyUpdateForm.itemId}
                      onValueChange={(value) => setAssemblyUpdateForm(prev => ({ ...prev, itemId: value }))}
                      disabled={!assemblyUpdateForm.assemblyName}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {getItemsForAssembly(assemblyUpdateForm.droneSerial, assemblyUpdateForm.systemName, assemblyUpdateForm.assemblyName).map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} (Currently: {item.status})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="update-notes">Update Notes (Optional)</Label>
                <Textarea
                  id="update-notes"
                  placeholder="Add any notes about this status change..."
                  value={assemblyUpdateForm.notes}
                  onChange={(e) => setAssemblyUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowAssemblyUpdateForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitAssemblyUpdate}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {submitting ? 'Updating...' : 'Update Status'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
