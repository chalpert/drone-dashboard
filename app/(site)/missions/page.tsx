"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Play, Pause, CheckCircle } from "lucide-react"

const mockMissions = [
  {
    id: "mission-01",
    name: "Area Survey - Downtown",
    status: "active",
    progress: 65,
    drone: "Surveyor Alpha", 
    startTime: "09:30 AM",
    estimatedEnd: "11:45 AM",
    location: "Zone A",
  },
  {
    id: "mission-02", 
    name: "Infrastructure Inspection",
    status: "active",
    progress: 30,
    drone: "Inspector Beta",
    startTime: "10:15 AM", 
    estimatedEnd: "12:30 PM",
    location: "Zone B",
  },
  {
    id: "mission-03",
    name: "Perimeter Patrol",
    status: "completed",
    progress: 100,
    drone: "Patrol Gamma",
    startTime: "08:00 AM",
    estimatedEnd: "09:30 AM",
    location: "Base Perimeter",
  },
  {
    id: "mission-04",
    name: "Traffic Monitoring",
    status: "planned", 
    progress: 0,
    drone: "Scout Delta",
    startTime: "02:00 PM",
    estimatedEnd: "04:30 PM", 
    location: "Highway 101",
  },
]

export default function MissionsPage() {
  const activeMissions = mockMissions.filter(m => m.status === 'active').length
  const completedToday = mockMissions.filter(m => m.status === 'completed').length
  const plannedMissions = mockMissions.filter(m => m.status === 'planned').length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4 text-green-500" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />
      case 'planned': return <Pause className="w-4 h-4 text-orange-500" />
      default: return <Pause className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
      case 'planned': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Missions</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Plan and monitor drone missions
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Mission
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Active Missions
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeMissions}
                </p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Completed Today
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {completedToday}
                </p>
              </div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Planned Missions
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {plannedMissions}
                </p>
              </div>
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Missions List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            All Missions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockMissions.map((mission) => (
              <div 
                key={mission.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(mission.status)}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {mission.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {mission.drone} • {mission.location}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {mission.startTime} - {mission.estimatedEnd}
                    </p>
                    {mission.status === 'active' && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {mission.progress}% complete
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(mission.status)}`}>
                    {mission.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
