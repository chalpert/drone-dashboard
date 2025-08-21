// WebSocket Type Definitions for Drone Dashboard
// Comprehensive types for all WebSocket communication

// ====== DroneUpdate Data Types ======

export interface StatusData {
  status: 'maintenance' | 'operational';
  battery: number; // 0-100
  location: {
    lat: number;
    lng: number;
  };
}

export interface BuildProgressData {
  overallCompletion: number; // 0-100
  currentAssembly: string;
  estimatedCompletion: string; // ISO date string
  recentActivity: string;
}

export interface SystemHealthData {
  cpu: number; // 0-100
  memory: number; // 0-100
  storage: number; // 0-100
  temperature: number; // degrees
  uptime: number; // seconds
}

export interface OperationData {
  // Reserved for future operation-specific data
  [key: string]: unknown;
}

// ====== DroneUpdate Types ======

export type DroneUpdateKind = 'status' | 'build_progress' | 'system_health' | 'operation';

export interface DroneUpdateMap {
  status: StatusData;
  build_progress: BuildProgressData;
  system_health: SystemHealthData;
  operation: OperationData;
}

export interface DroneUpdate<T extends DroneUpdateKind = DroneUpdateKind> {
  serial: string;
  type: T;
  data: DroneUpdateMap[T];
  timestamp: string;
}

// ====== System Health Overview Types ======

export interface SystemHealthItem {
  id: string;
  name: string;
  health: number; // 0-100
  status: 'warning' | 'online' | 'maintenance';
  cpu: number; // 0-100
  memory: number; // 0-100
}

export interface SystemHealthOverview {
  timestamp: string;
  systems: SystemHealthItem[];
}

// ====== Alert Types ======

export interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  droneSerial?: string;
  systemName?: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface AlertAcknowledgedPayload {
  alertId: string;
  timestamp: string;
}

// ====== Emit Event Payloads ======

export interface EmitPayloadMap {
  join_drone_room: string; // droneSerial
  leave_drone_room: string; // droneSerial
  acknowledge_alert: string; // alertId
}

// ====== Handler Types ======

export type DroneUpdateHandler<T extends DroneUpdate = DroneUpdate> = (update: T) => void;
export type SystemAlertHandler = (alert: SystemAlert) => void;
export type SystemHealthHandler = (overview: SystemHealthOverview) => void;
export type BuildProgressHandler = (progress: BuildProgressData) => void;
export type EmitEventHandler<E extends keyof EmitPayloadMap> = (data: EmitPayloadMap[E]) => void;

// ====== WebSocket Client Interface ======

export interface WebSocketClientMethods {
  connect: (serverPath?: string) => void;
  disconnect: () => void;
  onDroneUpdate: (callback: DroneUpdateHandler) => () => void;
  onSystemAlert: (callback: SystemAlertHandler) => () => void;
  onBuildProgress: (droneSerial: string, callback: BuildProgressHandler) => () => void;
  onSystemHealth: (callback: SystemHealthHandler) => () => void;
  joinDroneRoom: (droneSerial: string) => void;
  leaveDroneRoom: (droneSerial: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  emit: <E extends keyof EmitPayloadMap>(event: E, data: EmitPayloadMap[E]) => void;
  connected: boolean;
}
