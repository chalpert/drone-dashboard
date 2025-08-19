"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Plus, MoreHorizontal, MapPin, Battery, Clock } from "lucide-react"

// Mock drone data - will be replaced with real data later
const mockDrones = [
  {
    id: "drone-01",
    name: "Surveyor Alpha",
    model: "DJI Matrice 300",
    status: "active",
    location: { name: "Zone A", coordinates: { lat: 40.7128, lng: -74.0060 } },
    battery: 85,
    lastSeen: "2 min ago",
    flightTime: 2.5,
    missions: 12,
  },
  {
    id: "drone-02", 
    name: "Inspector Beta",
    model: "DJI Phantom 4 Pro",
    status: "active",
    location: { name: "Zone B", coordinates: { lat: 40.7589, lng: -73.9851 } },
    battery: 92,
    lastSeen: "1 min ago",
    flightTime: 1.8,
    missions: 8,
  },
  {
    id: "drone-03",
    name: "Patrol Gamma", 
    model: "DJI Mavic 2 Enterprise",
    status: "maintenance",
    location: { name: "Base Station", coordinates: { lat: 40.7505, lng: -73.9934 } },
    battery: 0,
    lastSeen: "3 hours ago",
    flightTime: 0,
    missions: 25,
  },
  {
    id: "drone-04",
    name: "Scout Delta",
    model: "DJI Mini 3 Pro", 
    status: "active",
    location: { name: "Zone C", coordinates: { lat: 40.7282, lng: -73.7949 } },
    battery: 68,
    lastSeen: "5 min ago", 
    flightTime: 0.9,
    missions: 15,
  },
  {
    id: "drone-05",
    name: "Mapper Echo",
    model: "DJI Matrice 210",
    status: "offline", 
    location: { name: "Hangar", coordinates: { lat: 40.7505, lng: -73.9934 } },
    battery: 45,
    lastSeen: "1 day ago",
    flightTime: 0,
    missions: 32,
  }
]

export default function FleetPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDrone, setSelectedDrone] = useState<typeof mockDrones[0] | null>(null)

  const filteredDrones = mockDrones.filter(drone => {
    const matchesSearch = drone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         drone.model.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || drone.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: mockDrones.length,
    active: mockDrones.filter(d => d.status === 'active').length,
    maintenance: mockDrones.filter(d => d.status === 'maintenance').length,
    offline: mockDrones.filter(d => d.status === 'offline').length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'maintenance': return 'bg-orange-500' 
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'maintenance': return 'secondary'
      case 'offline': return 'outline'
      default: return 'outline'
    }
  }

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return 'text-green-600 dark:text-green-400'
    if (battery > 20) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fleet Management</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage and monitor your drone fleet
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Drone
          </Button>
        </div>
      </div>

      {/* Stats and Search */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Search */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search drones..."
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
                    {status}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {count}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  status === 'active' ? 'bg-green-500' :
                  status === 'maintenance' ? 'bg-orange-500' :
                  status === 'offline' ? 'bg-gray-500' :
                  'bg-blue-500'
                }`}></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Drone Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrones.map((drone) => (
          <Card 
            key={drone.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedDrone(drone)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  {drone.name}
                </CardTitle>
                <Badge variant={getStatusBadgeVariant(drone.status)}>
                  {drone.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {drone.model}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Battery */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Battery</span>
                  </div>
                  <span className={`text-sm font-medium ${getBatteryColor(drone.battery)}`}>
                    {drone.battery}%
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Location</span>
                  </div>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {drone.location.name}
                  </span>
                </div>

                {/* Last Seen */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Last seen</span>
                  </div>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {drone.lastSeen}
                  </span>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <Link href={`/fleet/${drone.id}`}>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Details Modal */}
      {selectedDrone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedDrone.name}
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedDrone.model}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(selectedDrone.status)}>
                  {selectedDrone.status}
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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Battery Level
                  </p>
                  <p className={`text-lg font-semibold ${getBatteryColor(selectedDrone.battery)}`}>
                    {selectedDrone.battery}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Flight Time Today
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedDrone.flightTime}h
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Location
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedDrone.location.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Total Missions
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedDrone.missions}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Link href={`/fleet/${selectedDrone.id}`} className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    View Full Details
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
