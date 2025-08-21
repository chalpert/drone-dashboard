import { Server } from 'socket.io'
import { createServer, Server as HttpServer } from 'http'
import {
  DroneUpdate,
  SystemAlert,
  StatusData,
  BuildProgressData,
  SystemHealthData,
  SystemHealthItem,
  SystemHealthOverview,
  AlertAcknowledgedPayload,
  DroneUpdateKind
} from './types/websocket'

export class WebSocketServer {
  private io: Server | null = null
  private httpServer: HttpServer | null = null
  private updateInterval: NodeJS.Timeout | null = null

  constructor(port: number = 3001) {
    this.httpServer = createServer()
    this.io = new Server(this.httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      },
      transports: ['websocket', 'polling']
    })

    this.setupEventHandlers()
    this.httpServer.listen(port, () => {
      console.log(`🚀 WebSocket server running on port ${port}`)
    })
  }

  private setupEventHandlers() {
    if (!this.io) return

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`)

      // Handle drone room joining
      socket.on('join_drone_room', (droneSerial: string) => {
        socket.join(`drone:${droneSerial}`)
        console.log(`Client ${socket.id} joined room: drone:${droneSerial}`)
      })

      // Handle drone room leaving
      socket.on('leave_drone_room', (droneSerial: string) => {
        socket.leave(`drone:${droneSerial}`)
        console.log(`Client ${socket.id} left room: drone:${droneSerial}`)
      })

      // Handle alert acknowledgment
      socket.on('acknowledge_alert', (alertId: string) => {
        // In a real implementation, you'd update the database here
        console.log(`Alert ${alertId} acknowledged by client ${socket.id}`)
        const acknowledgedPayload: AlertAcknowledgedPayload = {
          alertId,
          timestamp: new Date().toISOString()
        }
        this.io?.emit('alert_acknowledged', acknowledgedPayload)
      })

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`)
      })
    })

    // Start simulation data broadcasts
    this.startSimulation()
  }

  private startSimulation() {
    // Simulate real-time updates every 5 seconds
    this.updateInterval = setInterval(() => {
      this.broadcastSimulatedUpdates()
    }, 5000)

    // Simulate random alerts
    setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 10 seconds
        this.broadcastRandomAlert()
      }
    }, 10000)
  }

  private broadcastSimulatedUpdates() {
    const droneSerials = ['S1', 'S2', 'S3']
    const updateTypes: Array<DroneUpdate['type']> = ['status', 'build_progress', 'system_health']
    
    droneSerials.forEach(serial => {
      const updateType = updateTypes[Math.floor(Math.random() * updateTypes.length)]
      const update: DroneUpdate = {
        serial,
        type: updateType,
        data: this.generateSimulatedData(updateType),
        timestamp: new Date().toISOString()
      }

      // Broadcast to all clients
      this.io?.emit('drone_update', update)
      
      // Broadcast to drone-specific room
      this.io?.to(`drone:${serial}`).emit('drone_update', update)
    })

    // Broadcast system health update
    const healthOverview: SystemHealthOverview = {
      timestamp: new Date().toISOString(),
      systems: this.generateSystemHealthData()
    }
    this.io?.emit('system_health', healthOverview)
  }

  private generateSimulatedData(type: DroneUpdateKind): StatusData | BuildProgressData | SystemHealthData | Record<string, unknown> {
    switch (type) {
      case 'status': {
        const statusData: StatusData = {
          status: Math.random() > 0.8 ? 'maintenance' : 'operational',
          battery: Math.floor(Math.random() * 100),
          location: {
            lat: 37.7749 + (Math.random() - 0.5) * 0.1,
            lng: -122.4194 + (Math.random() - 0.5) * 0.1
          }
        }
        return statusData
      }
      
      case 'build_progress': {
        const buildProgressData: BuildProgressData = {
          overallCompletion: Math.min(100, Math.floor(Math.random() * 100)),
          currentAssembly: 'Power Electronics',
          estimatedCompletion: '2024-02-28',
          recentActivity: 'Battery installation in progress'
        }
        return buildProgressData
      }
      
      case 'system_health': {
        const systemHealthData: SystemHealthData = {
          cpu: Math.floor(Math.random() * 100),
          memory: Math.floor(Math.random() * 100),
          storage: Math.floor(Math.random() * 100),
          temperature: Math.floor(Math.random() * 50) + 20,
          uptime: Math.floor(Math.random() * 1000000)
        }
        return systemHealthData
      }
      
      default:
        return {}
    }
  }

  private generateSystemHealthData(): SystemHealthItem[] {
    return [
      {
        id: 'SYS-001',
        name: 'Command Server Alpha',
        health: Math.floor(Math.random() * 100),
        status: Math.random() > 0.9 ? 'warning' : 'online',
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100)
      },
      {
        id: 'SYS-002',
        name: 'Database Cluster Beta',
        health: Math.floor(Math.random() * 100),
        status: Math.random() > 0.95 ? 'maintenance' : 'online',
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100)
      }
    ]
  }

  private broadcastRandomAlert() {
    const alertTypes: Array<SystemAlert['type']> = ['warning', 'error', 'info', 'success']
    const droneSerials = ['S1', 'S2', 'S3']
    const systems = ['Power Electronics', 'Avionics', 'Propulsion', 'Structure']
    
    const alert: SystemAlert = {
      id: `alert-${Date.now()}`,
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      title: this.generateAlertTitle(),
      message: this.generateAlertMessage(),
      droneSerial: Math.random() > 0.5 ? droneSerials[Math.floor(Math.random() * droneSerials.length)] : undefined,
      systemName: Math.random() > 0.5 ? systems[Math.floor(Math.random() * systems.length)] : undefined,
      timestamp: new Date().toISOString(),
      acknowledged: false
    }

    this.io?.emit('system_alert', alert)
  }

  private generateAlertTitle(): string {
    const titles = [
      'System Performance Warning',
      'Build Milestone Completed',
      'Component Installation Alert',
      'Maintenance Schedule Update',
      'Battery Level Critical',
      'Network Connectivity Issue',
      'Temperature Threshold Exceeded',
      'Assembly Quality Check Passed'
    ]
    return titles[Math.floor(Math.random() * titles.length)]
  }

  private generateAlertMessage(): string {
    const messages = [
      'System performance has degraded and requires attention.',
      'Build milestone successfully completed ahead of schedule.',
      'Component installation requires manual verification.',
      'Scheduled maintenance window has been updated.',
      'Battery level has dropped below critical threshold.',
      'Network connectivity issues detected on primary interface.',
      'System temperature has exceeded normal operating range.',
      'Assembly quality check has passed with no issues found.'
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  public stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    
    this.httpServer?.close()
    console.log('WebSocket server stopped')
  }
}

// For standalone server execution
if (require.main === module) {
  new WebSocketServer()
}
