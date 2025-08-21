"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useWebSocket } from '@/lib/websocket'
import type {
  DroneUpdate,
  StatusData,
  BuildProgressData,
  SystemHealthData,
  SystemHealthOverview
} from '@/lib/types/websocket'

interface RealTimeData {
  droneStatuses: Record<string, StatusData>
  buildProgress: Record<string, BuildProgressData>
  systemHealth: Record<string, SystemHealthData | SystemHealthOverview>
  lastUpdate: string | null
}

interface RealTimeContextType {
  data: RealTimeData
  isConnected: boolean
  joinDroneRoom: (serial: string) => void
  leaveDroneRoom: (serial: string) => void
  refreshData: () => void
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined)

interface RealTimeProviderProps {
  children: ReactNode
}

export function RealTimeProvider({ children }: RealTimeProviderProps) {
  const [data, setData] = useState<RealTimeData>({
    droneStatuses: {},
    buildProgress: {},
    systemHealth: {},
    lastUpdate: null
  })
  const [isConnected, setIsConnected] = useState(false)
  const ws = useWebSocket()

  useEffect(() => {
    // Connect to WebSocket
    ws.connect()
    
    // Check connection status
    const checkConnection = () => {
      setIsConnected(ws.connected)
    }
    
    const connectionInterval = setInterval(checkConnection, 1000)
    checkConnection()

    // Subscribe to drone updates
    const unsubscribeDroneUpdate = ws.onDroneUpdate((update: DroneUpdate) => {
      setData(prevData => {
        const newData = { ...prevData }
        
        switch (update.type) {
          case 'status':
            newData.droneStatuses = {
              ...newData.droneStatuses,
              [update.serial]: update.data as StatusData
            }
            break
            
          case 'build_progress':
            newData.buildProgress = {
              ...newData.buildProgress,
              [update.serial]: update.data as BuildProgressData
            }
            break
            
          case 'system_health':
            newData.systemHealth = {
              ...newData.systemHealth,
              [update.serial]: update.data as SystemHealthData
            }
            break
        }
        
        newData.lastUpdate = update.timestamp
        return newData
      })
    })

    // Subscribe to system health updates
    const unsubscribeSystemHealth = ws.onSystemHealth((healthData) => {
      setData(prevData => ({
        ...prevData,
        systemHealth: {
          ...prevData.systemHealth,
          systems: healthData
        },
        lastUpdate: healthData.timestamp
      }))
    })

    return () => {
      clearInterval(connectionInterval)
      unsubscribeDroneUpdate()
      unsubscribeSystemHealth()
      ws.disconnect()
    }
  }, [ws])

  const joinDroneRoom = (serial: string) => {
    ws.joinDroneRoom(serial)
  }

  const leaveDroneRoom = (serial: string) => {
    ws.leaveDroneRoom(serial)
  }

  const refreshData = () => {
    // Emit a request for fresh data
    ws.emitCustom('request_data_refresh', { timestamp: new Date().toISOString() })
  }

  const contextValue: RealTimeContextType = {
    data,
    isConnected,
    joinDroneRoom,
    leaveDroneRoom,
    refreshData
  }

  return (
    <RealTimeContext.Provider value={contextValue}>
      {children}
    </RealTimeContext.Provider>
  )
}

// Hook to use real-time data
export function useRealTimeData() {
  const context = useContext(RealTimeContext)
  if (context === undefined) {
    throw new Error('useRealTimeData must be used within a RealTimeProvider')
  }
  return context
}

// Hook for specific drone data
export function useDroneRealTime(droneSerial: string) {
  const { data, joinDroneRoom, leaveDroneRoom, isConnected } = useRealTimeData()

  useEffect(() => {
    if (droneSerial) {
      joinDroneRoom(droneSerial)
      return () => leaveDroneRoom(droneSerial)
    }
  }, [droneSerial, joinDroneRoom, leaveDroneRoom])

  return {
    status: data.droneStatuses[droneSerial],
    buildProgress: data.buildProgress[droneSerial],
    systemHealth: data.systemHealth[droneSerial],
    isConnected,
    lastUpdate: data.lastUpdate
  }
}

// Component to display real-time indicators
export function RealTimeIndicator({ className }: { className?: string }) {
  const { isConnected, data } = useRealTimeData()

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <div 
        className={`w-2 h-2 rounded-full animate-pulse ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} 
      />
      <span className={`${isConnected ? 'text-green-500' : 'text-red-500'}`}>
        {isConnected ? 'Live' : 'Offline'}
      </span>
      {data.lastUpdate && (
        <span className="text-neutral-400">
          • Updated {new Date(data.lastUpdate).toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}
