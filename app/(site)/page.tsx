"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// Mock data - will be replaced with real data later
const mockDrones = [
  { id: "drone-01", name: "Surveyor Alpha", status: "active", battery: 85, location: "Zone A" },
  { id: "drone-02", name: "Inspector Beta", status: "active", battery: 92, location: "Zone B" },
  { id: "drone-03", name: "Patrol Gamma", status: "maintenance", battery: 0, location: "Base" },
  { id: "drone-04", name: "Scout Delta", status: "active", battery: 68, location: "Zone C" },
]

const mockMissions = [
  { id: "mission-01", name: "Area Survey", status: "active", progress: 65, drone: "Surveyor Alpha" },
  { id: "mission-02", name: "Infrastructure Inspection", status: "active", progress: 30, drone: "Inspector Beta" },
  { id: "mission-03", name: "Perimeter Patrol", status: "completed", progress: 100, drone: "Patrol Gamma" },
]

const recentActivity = [
  { time: "2 minutes ago", event: "Drone Surveyor Alpha completed waypoint 5/8", type: "info" },
  { time: "5 minutes ago", event: "Mission Area Survey progress updated to 65%", type: "info" },
  { time: "12 minutes ago", event: "Drone Patrol Gamma landed for maintenance", type: "warning" },
  { time: "18 minutes ago", event: "New mission Infrastructure Inspection started", type: "success" },
]

export default function Dashboard() {
  const activeDrones = mockDrones.filter(drone => drone.status === 'active').length
  const activeMissions = mockMissions.filter(mission => mission.status === 'active').length
  const maintenanceDue = mockDrones.filter(drone => drone.status === 'maintenance').length
  const lowBattery = mockDrones.filter(drone => drone.battery < 20 && drone.status === 'active').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Overview of your drone fleet and operations
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Active Drones
            </CardTitle>
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeDrones}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              of {mockDrones.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Active Missions
            </CardTitle>
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeMissions}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Maintenance Due
            </CardTitle>
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{maintenanceDue}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Low Battery
            </CardTitle>
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{lowBattery}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              alerts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Fleet Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDrones.map((drone) => (
                <div key={drone.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        drone.status === "active"
                          ? "bg-green-500"
                          : drone.status === "maintenance"
                          ? "bg-orange-500"
                          : "bg-gray-500"
                      }`}
                    ></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {drone.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {drone.location}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {drone.battery}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      battery
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.type === "success"
                        ? "bg-green-500"
                        : activity.type === "warning"
                        ? "bg-orange-500"
                        : "bg-blue-500"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {activity.event}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mission Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Active Missions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockMissions
              .filter(mission => mission.status === 'active')
              .map((mission) => (
                <div key={mission.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {mission.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Assigned to {mission.drone}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {mission.progress}%
                    </div>
                  </div>
                  <Progress 
                    value={mission.progress} 
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
