"use client"

import React, { useState, useEffect } from 'react'
import { useWebSocket } from '@/lib/websocket'
import type { SystemAlert } from '@/lib/types/websocket'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Clock
} from 'lucide-react'

interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const ws = useWebSocket()

  useEffect(() => {
    // Connect to WebSocket
    ws.connect()

    // Subscribe to system alerts
    const unsubscribeAlerts = ws.onSystemAlert((alert: SystemAlert) => {
      setAlerts(prev => [alert, ...prev])
      if (!alert.acknowledged) {
        setUnreadCount(prev => prev + 1)
      }
    })

    return () => {
      unsubscribeAlerts()
      ws.disconnect()
    }
  }, [ws])

  const acknowledgeAlert = (alertId: string) => {
    ws.acknowledgeAlert(alertId)
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const clearAllAlerts = () => {
    setAlerts([])
    setUnreadCount(0)
  }

  const getAlertIcon = (type: SystemAlert['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-neutral-400 hover:text-white"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs p-0 min-w-0"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-96 overflow-y-auto z-50">
          <Card className="bg-neutral-900 border-neutral-700 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-neutral-700">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-neutral-400" />
                <span className="text-sm font-medium text-white">Notifications</span>
                {alerts.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {alerts.length}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {alerts.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllAlerts}
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    Clear All
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <CardContent className="p-0">
              {alerts.length === 0 ? (
                <div className="p-6 text-center text-neutral-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border-b border-neutral-800 last:border-b-0 ${
                        alert.acknowledged ? 'opacity-60' : ''
                      } hover:bg-neutral-800/50 transition-colors`}
                    >
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-medium text-white truncate">
                              {alert.title}
                            </h4>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!alert.acknowledged && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                              <span className="text-xs text-neutral-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimestamp(alert.timestamp)}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-neutral-400 mb-2 line-clamp-2">
                            {alert.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {alert.droneSerial && (
                                <Badge variant="outline" className="text-xs">
                                  {alert.droneSerial}
                                </Badge>
                              )}
                              {alert.systemName && (
                                <Badge variant="outline" className="text-xs">
                                  {alert.systemName}
                                </Badge>
                              )}
                            </div>
                            
                            {!alert.acknowledged && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => acknowledgeAlert(alert.id)}
                                className="text-xs h-6 px-2 text-neutral-400 hover:text-white"
                              >
                                Acknowledge
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Connection status indicator component
export function ConnectionStatus() {
  const [connected, setConnected] = useState(false)
  const ws = useWebSocket()

  useEffect(() => {
    const checkConnection = () => {
      setConnected(ws.connected)
    }

    // Check connection status periodically
    const interval = setInterval(checkConnection, 1000)
    checkConnection()

    return () => clearInterval(interval)
  }, [ws.connected])

  return (
    <div className="flex items-center gap-2 text-xs">
      <div 
        className={`w-2 h-2 rounded-full ${
          connected ? 'bg-green-500' : 'bg-red-500'
        }`} 
      />
      <span className={connected ? 'text-green-500' : 'text-red-500'}>
        {connected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  )
}
