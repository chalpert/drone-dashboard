import { io, Socket } from 'socket.io-client'
import {
  DroneUpdateHandler,
  SystemAlertHandler,
  SystemHealthHandler,
  BuildProgressHandler,
  EmitPayloadMap
} from './types/websocket'

class WebSocketClient {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect(serverPath?: string): Socket {
    if (this.socket?.connected) {
      return this.socket
    }

    this.socket = io(serverPath || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3003', {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
    })

    this.setupEventListeners()
    return this.socket
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
      this.handleReconnect()
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      this.handleReconnect()
    })
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    setTimeout(() => {
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      this.connect()
    }, delay)
  }

  // Subscribe to drone updates
  onDroneUpdate(callback: DroneUpdateHandler) {
    this.socket?.on('drone_update', callback)
    return () => this.socket?.off('drone_update', callback)
  }

  // Subscribe to system alerts
  onSystemAlert(callback: SystemAlertHandler) {
    this.socket?.on('system_alert', callback)
    return () => this.socket?.off('system_alert', callback)
  }

  // Subscribe to build progress updates
  onBuildProgress(droneSerial: string, callback: BuildProgressHandler) {
    this.socket?.on(`build_progress:${droneSerial}`, callback)
    return () => this.socket?.off(`build_progress:${droneSerial}`, callback)
  }

  // Subscribe to system health updates
  onSystemHealth(callback: SystemHealthHandler) {
    this.socket?.on('system_health', callback)
    return () => this.socket?.off('system_health', callback)
  }

  // Join room for specific drone updates
  joinDroneRoom(droneSerial: string) {
    this.socket?.emit('join_drone_room', droneSerial)
  }

  // Leave drone room
  leaveDroneRoom(droneSerial: string) {
    this.socket?.emit('leave_drone_room', droneSerial)
  }

  // Emit custom events
  emit<E extends keyof EmitPayloadMap>(event: E, data: EmitPayloadMap[E]) {
    this.socket?.emit(event as string, data)
  }

  // Emit generic custom events (for events not in predefined map)
  emitCustom(event: string, data: unknown) {
    this.socket?.emit(event, data)
  }

  // Acknowledge alert
  acknowledgeAlert(alertId: string) {
    this.socket?.emit('acknowledge_alert', alertId)
  }

  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }

  get connected(): boolean {
    return this.socket?.connected ?? false
  }
}

// Export singleton instance
export const wsClient = new WebSocketClient()

// React hook for WebSocket integration
export function useWebSocket() {
  return {
    connect: (serverPath?: string) => wsClient.connect(serverPath),
    disconnect: () => wsClient.disconnect(),
    onDroneUpdate: (callback: DroneUpdateHandler) => wsClient.onDroneUpdate(callback),
    onSystemAlert: (callback: SystemAlertHandler) => wsClient.onSystemAlert(callback),
    onBuildProgress: (droneSerial: string, callback: BuildProgressHandler) => 
      wsClient.onBuildProgress(droneSerial, callback),
    onSystemHealth: (callback: SystemHealthHandler) => wsClient.onSystemHealth(callback),
    joinDroneRoom: (droneSerial: string) => wsClient.joinDroneRoom(droneSerial),
    leaveDroneRoom: (droneSerial: string) => wsClient.leaveDroneRoom(droneSerial),
    acknowledgeAlert: (alertId: string) => wsClient.acknowledgeAlert(alertId),
    emit: <E extends keyof EmitPayloadMap>(event: E, data: EmitPayloadMap[E]) => wsClient.emit(event, data),
    emitCustom: (event: string, data: unknown) => wsClient.emitCustom(event, data),
    connected: wsClient.connected
  }
}
