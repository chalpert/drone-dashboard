"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketServer = void 0;
var socket_io_1 = require("socket.io");
var http_1 = require("http");
var WebSocketServer = /** @class */ (function () {
    function WebSocketServer(port) {
        if (port === void 0) { port = 3001; }
        this.io = null;
        this.httpServer = null;
        this.updateInterval = null;
        this.httpServer = (0, http_1.createServer)();
        this.io = new socket_io_1.Server(this.httpServer, {
            cors: {
                origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                methods: ["GET", "POST"]
            },
            transports: ['websocket', 'polling']
        });
        this.setupEventHandlers();
        this.httpServer.listen(port, function () {
            console.log("\uD83D\uDE80 WebSocket server running on port ".concat(port));
        });
    }
    WebSocketServer.prototype.setupEventHandlers = function () {
        var _this = this;
        if (!this.io)
            return;
        this.io.on('connection', function (socket) {
            console.log("Client connected: ".concat(socket.id));
            // Handle drone room joining
            socket.on('join_drone_room', function (droneSerial) {
                socket.join("drone:".concat(droneSerial));
                console.log("Client ".concat(socket.id, " joined room: drone:").concat(droneSerial));
            });
            // Handle drone room leaving
            socket.on('leave_drone_room', function (droneSerial) {
                socket.leave("drone:".concat(droneSerial));
                console.log("Client ".concat(socket.id, " left room: drone:").concat(droneSerial));
            });
            // Handle alert acknowledgment
            socket.on('acknowledge_alert', function (alertId) {
                var _a;
                // In a real implementation, you'd update the database here
                console.log("Alert ".concat(alertId, " acknowledged by client ").concat(socket.id));
                var acknowledgedPayload = {
                    alertId: alertId,
                    timestamp: new Date().toISOString()
                };
                (_a = _this.io) === null || _a === void 0 ? void 0 : _a.emit('alert_acknowledged', acknowledgedPayload);
            });
            socket.on('disconnect', function () {
                console.log("Client disconnected: ".concat(socket.id));
            });
        });
        // Start simulation data broadcasts
        this.startSimulation();
    };
    WebSocketServer.prototype.startSimulation = function () {
        var _this = this;
        // Simulate real-time updates every 5 seconds
        this.updateInterval = setInterval(function () {
            _this.broadcastSimulatedUpdates();
        }, 5000);
        // Simulate random alerts
        setInterval(function () {
            if (Math.random() < 0.3) { // 30% chance every 10 seconds
                _this.broadcastRandomAlert();
            }
        }, 10000);
    };
    WebSocketServer.prototype.broadcastSimulatedUpdates = function () {
        var _this = this;
        var _a;
        var droneSerials = ['S1', 'S2', 'S3'];
        var updateTypes = ['status', 'build_progress', 'system_health'];
        droneSerials.forEach(function (serial) {
            var _a, _b;
            var updateType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
            var update = {
                serial: serial,
                type: updateType,
                data: _this.generateSimulatedData(updateType),
                timestamp: new Date().toISOString()
            };
            // Broadcast to all clients
            (_a = _this.io) === null || _a === void 0 ? void 0 : _a.emit('drone_update', update);
            // Broadcast to drone-specific room
            (_b = _this.io) === null || _b === void 0 ? void 0 : _b.to("drone:".concat(serial)).emit('drone_update', update);
        });
        // Broadcast system health update
        var healthOverview = {
            timestamp: new Date().toISOString(),
            systems: this.generateSystemHealthData()
        };
        (_a = this.io) === null || _a === void 0 ? void 0 : _a.emit('system_health', healthOverview);
    };
    WebSocketServer.prototype.generateSimulatedData = function (type) {
        switch (type) {
            case 'status': {
                var statusData = {
                    status: Math.random() > 0.8 ? 'maintenance' : 'operational',
                    battery: Math.floor(Math.random() * 100),
                    location: {
                        lat: 37.7749 + (Math.random() - 0.5) * 0.1,
                        lng: -122.4194 + (Math.random() - 0.5) * 0.1
                    }
                };
                return statusData;
            }
            case 'build_progress': {
                var buildProgressData = {
                    overallCompletion: Math.min(100, Math.floor(Math.random() * 100)),
                    currentAssembly: 'Power Electronics',
                    estimatedCompletion: '2024-02-28',
                    recentActivity: 'Battery installation in progress'
                };
                return buildProgressData;
            }
            case 'system_health': {
                var systemHealthData = {
                    cpu: Math.floor(Math.random() * 100),
                    memory: Math.floor(Math.random() * 100),
                    storage: Math.floor(Math.random() * 100),
                    temperature: Math.floor(Math.random() * 50) + 20,
                    uptime: Math.floor(Math.random() * 1000000)
                };
                return systemHealthData;
            }
            default:
                return {};
        }
    };
    WebSocketServer.prototype.generateSystemHealthData = function () {
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
        ];
    };
    WebSocketServer.prototype.broadcastRandomAlert = function () {
        var _a;
        var alertTypes = ['warning', 'error', 'info', 'success'];
        var droneSerials = ['S1', 'S2', 'S3'];
        var systems = ['Power Electronics', 'Avionics', 'Propulsion', 'Structure'];
        var alert = {
            id: "alert-".concat(Date.now()),
            type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
            title: this.generateAlertTitle(),
            message: this.generateAlertMessage(),
            droneSerial: Math.random() > 0.5 ? droneSerials[Math.floor(Math.random() * droneSerials.length)] : undefined,
            systemName: Math.random() > 0.5 ? systems[Math.floor(Math.random() * systems.length)] : undefined,
            timestamp: new Date().toISOString(),
            acknowledged: false
        };
        (_a = this.io) === null || _a === void 0 ? void 0 : _a.emit('system_alert', alert);
    };
    WebSocketServer.prototype.generateAlertTitle = function () {
        var titles = [
            'System Performance Warning',
            'Build Milestone Completed',
            'Component Installation Alert',
            'Maintenance Schedule Update',
            'Battery Level Critical',
            'Network Connectivity Issue',
            'Temperature Threshold Exceeded',
            'Assembly Quality Check Passed'
        ];
        return titles[Math.floor(Math.random() * titles.length)];
    };
    WebSocketServer.prototype.generateAlertMessage = function () {
        var messages = [
            'System performance has degraded and requires attention.',
            'Build milestone successfully completed ahead of schedule.',
            'Component installation requires manual verification.',
            'Scheduled maintenance window has been updated.',
            'Battery level has dropped below critical threshold.',
            'Network connectivity issues detected on primary interface.',
            'System temperature has exceeded normal operating range.',
            'Assembly quality check has passed with no issues found.'
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    };
    WebSocketServer.prototype.stop = function () {
        var _a;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        (_a = this.httpServer) === null || _a === void 0 ? void 0 : _a.close();
        console.log('WebSocket server stopped');
    };
    return WebSocketServer;
}());
exports.WebSocketServer = WebSocketServer;
// For standalone server execution
if (require.main === module) {
    new WebSocketServer();
}
