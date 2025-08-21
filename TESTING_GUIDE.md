# 🧪 Drone Dashboard Testing Guide

## Current System Status
- **Next.js**: Running on http://localhost:3001
- **WebSocket**: Running on port 3003
- **Database**: 3 drones, 5 systems, 88 items tracked
- **Status**: Production-ready with mobile optimization

## 🎯 **QUICK SYSTEM VERIFICATION**

### 1. Basic Functionality Test
```bash
# Check if servers are running
curl http://localhost:3001/api/health
curl http://localhost:3001/api/health/database
curl http://localhost:3001/api/health/websocket
```

### 2. Core API Tests
```bash
# Get all drones
curl http://localhost:3001/api/drones

# Get executive report
curl http://localhost:3001/api/reports/executive
```

## 🖥️ **FRONTEND TESTING CHECKLIST**

### Dashboard Page (http://localhost:3001)
- [ ] **Executive Header**: Professional gradient header with real-time indicators
- [ ] **KPI Cards**: 4 cards showing fleet statistics with proper styling
- [ ] **Production Progress**: Progress bars with live data
- [ ] **Activity Timeline**: Recent build activities with status badges
- [ ] **System Health**: Grid layout with status indicators
- [ ] **Mobile Responsive**: Test on different screen sizes

### Fleet Page (http://localhost:3001/fleet)
- [ ] **Fleet Overview**: Status cards with hover effects
- [ ] **Drone Cards**: Professional cards with progress indicators
- [ ] **Modal Functionality**: Click drone cards to open detailed view
- [ ] **Status Labels**: Should show "Completed", "In Progress", "Pending" (not "Done", "WIP", "Todo")
- [ ] **Expandable Categories**: Systems/assemblies expand with item details
- [ ] **Mobile Navigation**: Touch-friendly navigation and interactions

### Build Activity Page (http://localhost:3001/build-activity)
- [ ] **Operations Header**: Indigo/purple gradient header
- [ ] **Activity Metrics**: KPI cards with professional styling
- [ ] **Activity Feed**: Timeline with build activities
- [ ] **Search/Filter**: Functional search and filtering
- [ ] **Responsive Design**: Works on mobile/tablet

## 📱 **MOBILE OPTIMIZATION TESTING**

### Factory Floor Experience
1. **Open on tablet/mobile device** or use browser dev tools
2. **Test touch targets**: All buttons should be easily tappable
3. **Check text size**: Should be readable without zooming
4. **Verify contrast**: Text should be clearly visible
5. **Test navigation**: Mobile menu should work smoothly

### Responsive Breakpoints
- **Mobile (< 640px)**: Single column layout, larger touch targets
- **Tablet (640px - 1024px)**: Optimized grid layouts, professional spacing
- **Desktop (> 1024px)**: Full layout with all features

## ⚡ **REAL-TIME FEATURES TESTING**

### WebSocket Connection Test
1. **Open browser console** on any page
2. **Look for WebSocket connection**: Should see connection established
3. **Monitor real-time updates**: Data should update every 5 seconds
4. **Test multiple tabs**: Open multiple browser tabs to test concurrent connections

### Live Data Updates
1. **Open dashboard in one tab**
2. **Open fleet page in another tab**
3. **Make a status change** (update item status)
4. **Verify updates appear** in both tabs within 5 seconds

## 🔧 **INTEGRATION TESTING**

### Database Integration
```bash
# Test item status update (replace with actual item ID)
curl -X PATCH http://localhost:3001/api/drones/S1/components \
  -H "Content-Type: application/json" \
  -d '{"itemId": "actual-item-id", "status": "completed"}'
```

### Webhook Testing
```bash
# Test Slack webhook endpoint
curl -X POST http://localhost:3001/api/webhooks/slack \
  -H "Content-Type: application/json" \
  -d '{
    "droneSerial": "S1",
    "model": "G1-M",
    "milestone": 75,
    "action": "milestone_reached",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"
  }'

# Test generic webhook endpoint
curl -X POST http://localhost:3001/api/webhooks/generic \
  -H "Content-Type: application/json" \
  -d '{
    "event": "test_event",
    "data": {"test": "data"},
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
    "source": "drone_assembly_tracker"
  }'
```

## 🎯 **EXECUTIVE EXPERIENCE TESTING**

### Executive Dashboard Flow
1. **Open dashboard** - Should load in under 3 seconds
2. **Review KPIs** - Should show current fleet statistics
3. **Check progress visualization** - Should display real-time progress
4. **View recent activities** - Should show latest build activities
5. **Test on tablet** - Should work perfectly on iPad/tablet

### Executive Reporting
1. **Access executive report**: http://localhost:3001/api/reports/executive
2. **Verify data structure**: Should include overview, productivity, bottlenecks
3. **Check analytics**: Should identify bottlenecks and provide recommendations

## 🧪 **AUTOMATED TESTING**

### Run Test Suite
```bash
# Run all tests
npm run test:run

# Run tests in watch mode
npm run test

# Check test coverage
npm run test:run -- --coverage
```

### Build Verification
```bash
# Test production build
npm run build

# Verify build output
ls -la .next/

# Test production start
npm run start
```

## 🚨 **KNOWN ISSUES TO VERIFY FIXED**

1. **Status Labels**: Fleet page should show "Completed/In Progress/Pending" not "Done/WIP/Todo"
2. **WebSocket Connection**: Should establish within 2 seconds
3. **Mobile Navigation**: Should have larger touch targets
4. **Executive Styling**: Should have professional gradients and typography

## 📊 **PERFORMANCE BENCHMARKS**

### Expected Performance
- **Page Load**: < 3 seconds
- **API Response**: < 500ms (currently 3-49ms)
- **WebSocket Connection**: < 2 seconds
- **Database Queries**: < 100ms
- **Mobile Responsiveness**: Smooth on all devices

### Performance Testing
```bash
# Test API performance
time curl http://localhost:3001/api/drones

# Test health endpoints
time curl http://localhost:3001/api/health
```

## ✅ **SUCCESS CRITERIA**

- [ ] All pages load without errors
- [ ] Mobile optimization working on all screen sizes
- [ ] Real-time updates functioning
- [ ] Executive-quality styling throughout
- [ ] All API endpoints responding correctly
- [ ] WebSocket connection stable
- [ ] Database operations fast and reliable
- [ ] Integration hooks working (Slack/webhooks ready)

## 🎉 **READY FOR PRODUCTION**

Once all tests pass, your drone assembly tracker is ready for:
- Small startup deployment (2-3 assembly team members)
- Executive presentations and reporting
- Factory floor use on tablets/mobile devices
- External integrations (Slack notifications)
- Real-time monitoring and analytics
