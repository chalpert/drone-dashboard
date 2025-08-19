"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, Filter } from "lucide-react"

const mockLogs = [
  {
    id: "log-001",
    timestamp: "2024-01-19 14:23:45",
    drone: "Surveyor Alpha",
    event: "Takeoff initiated",
    level: "info",
    details: "Pre-flight checks completed successfully",
  },
  {
    id: "log-002",
    timestamp: "2024-01-19 14:25:12",
    drone: "Surveyor Alpha", 
    event: "Waypoint reached",
    level: "info",
    details: "Waypoint 3 of 8 completed, proceeding to next target",
  },
  {
    id: "log-003",
    timestamp: "2024-01-19 14:27:33",
    drone: "Inspector Beta",
    event: "Battery low warning", 
    level: "warning",
    details: "Battery level at 22%, returning to base recommended",
  },
  {
    id: "log-004",
    timestamp: "2024-01-19 14:30:15",
    drone: "Patrol Gamma",
    event: "Landing completed",
    level: "info", 
    details: "Successful landing at base station for scheduled maintenance",
  },
  {
    id: "log-005",
    timestamp: "2024-01-19 14:15:08",
    drone: "Scout Delta",
    event: "GPS signal lost",
    level: "error",
    details: "Temporary GPS signal interruption for 15 seconds, signal restored",
  },
  {
    id: "log-006", 
    timestamp: "2024-01-19 14:12:22",
    drone: "Mapper Echo",
    event: "Mission started",
    level: "info",
    details: "Traffic monitoring mission initiated on Highway 101",
  },
]

export default function LogsPage() {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
      case 'warning': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'  
      case 'info': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getLevelDot = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-500'
      case 'warning': return 'bg-orange-500'
      case 'info': return 'bg-blue-500' 
      default: return 'bg-gray-500'
    }
  }

  const errorCount = mockLogs.filter(log => log.level === 'error').length
  const warningCount = mockLogs.filter(log => log.level === 'warning').length
  const infoCount = mockLogs.filter(log => log.level === 'info').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Flight Logs</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Monitor drone activity and system events
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Events
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockLogs.length}
                </p>
              </div>
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Errors
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {errorCount}
                </p>
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Warnings
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {warningCount}
                </p>
              </div>
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Info Events
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {infoCount}
                </p>
              </div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search logs by drone, event, or details..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockLogs.map((log) => (
              <div 
                key={log.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getLevelDot(log.level)}`}></div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                        {log.event}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {log.timestamp}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        <span className="font-medium">{log.drone}</span>
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {log.details}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
