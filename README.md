# 🚁 Drone Dashboard - Production-Ready Fleet Management System

A comprehensive, production-ready drone fleet management system built with Next.js 15, TypeScript, and Tailwind CSS. This executive-quality application provides real-time monitoring, build activity tracking, external integrations, and complete management capabilities for drone manufacturing and assembly processes.

**🎯 Status: Production Ready** - Fully optimized for executive presentation, mobile/tablet use, and small startup deployment.

## ✨ Features

### 🏠 **Dashboard**
- Real-time build progress monitoring
- KPI cards with live metrics
- System health monitoring
- Recent activity feed
- Build progress visualization

### 🛩️ **Fleet Management**
- Complete drone inventory management
- Advanced search and filtering
- System > Assembly > Item hierarchical structure
- Export capabilities (CSV/JSON)
- Detailed drone specifications

### 📋 **Build Activity Tracking**
- Activity logging and management
- Item status updates
- Search and filter activities
- Export build reports
- Real-time progress updates

### ⚙️ **Advanced Features**
- Real-time WebSocket integration with live updates
- Executive-quality UI with professional styling
- Full mobile responsiveness (mobile-first, tablet-optimized)
- External integrations (Slack webhooks, generic webhooks)
- Production monitoring with health check endpoints
- Advanced analytics and executive reporting
- TypeScript for complete type safety
- Modern UI components with Radix UI
- Comprehensive testing infrastructure
- Factory floor optimization for touch devices

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chalpert/Drone-Dashboard.git
   cd drone-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Configure your environment variables in `.env.local`

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the full application (Next.js + WebSocket)**
   ```bash
   npm run dev:all
   # This starts both Next.js and WebSocket servers
   ```

6. **Open your browser**
   Navigate to [http://localhost:3001](http://localhost:3001) (Next.js)
   WebSocket server runs on port 3003

### Build for Production

```bash
npm run build
npm start
```

### Health Monitoring

The application includes comprehensive health monitoring:
- `GET /api/health` - Overall system health
- `GET /api/health/database` - Database connectivity and statistics
- `GET /api/health/websocket` - WebSocket server status

### Testing

```bash
npm run test        # Run tests in watch mode
npm run test:run    # Run tests once
```

## 🏗️ Architecture

### Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: Prisma + SQLite
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + Custom Components
- **Icons**: Lucide React
- **Real-time**: WebSocket integration (Socket.IO)
- **Testing**: Vitest + React Testing Library
- **State Management**: React useState/useEffect + WebSocket context
- **External Integrations**: Slack webhooks, generic webhook system

### Project Structure
```
drone-dashboard/
├── app/                    # Next.js 15 App Router
│   ├── (site)/            # Site layout group
│   │   ├── page.tsx       # Dashboard page
│   │   ├── fleet/         # Fleet management
│   │   ├── build-activity/ # Build activity tracking
│   │   ├── admin/         # Admin panel
│   │   └── settings/      # Settings page
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── search-filter.tsx # Advanced search component
│   └── real-time-provider.tsx # WebSocket provider
├── lib/                  # Utilities and configurations
│   ├── types.ts         # TypeScript definitions
│   ├── export-utils.ts  # Export functionality
│   └── websocket-server.ts # WebSocket server
└── data/                # Mock data and seeds
```

## 📊 Data Model

### Hierarchical Structure
```
Drone
└── Systems (e.g., Propulsion, Navigation, Payload)
    └── Assemblies (e.g., Motor Assembly, GPS Module)
        └── Items (e.g., Motor, Propeller, GPS Chip)
```

### Key Entities
- **Drone**: Serial number, model, status, completion percentage
- **System**: Major functional groups with weight-based completion
- **Assembly**: Sub-components within systems
- **Item**: Individual parts with status tracking
- **Build Activity**: Time-stamped activity logs

## 🔧 API Endpoints

### Drones
- `GET /api/drones` - Fetch all drones with full hierarchy
- `PATCH /api/drones/[serial]/components` - Update item status

### Health Monitoring
- `GET /api/health` - Overall system health check
- `GET /api/health/database` - Database connectivity and statistics
- `GET /api/health/websocket` - WebSocket server status

### Executive Reporting
- `GET /api/reports/executive` - Executive summary with analytics

### External Integrations
- `POST /api/webhooks/slack` - Slack notification endpoint
- `POST /api/webhooks/generic` - Generic webhook endpoint

### Real-time Features
- WebSocket connection for live updates (port 3003)
- System health monitoring
- Build progress streaming
- Real-time notifications and alerts

## 🎨 UI Components

### Custom Components
- **SearchFilter**: Advanced filtering with presets
- **RealTimeIndicator**: Connection status display
- **Progress**: Animated progress bars
- **Badge**: Status indicators
- **Card**: Container components

### Responsive Design
- Mobile-first approach with comprehensive breakpoints
- Factory floor optimization (larger touch targets, enhanced contrast)
- Executive tablet experience (professional spacing, optimized layouts)
- Touch-friendly interfaces with enhanced gesture support
- Adaptive layouts across all device sizes
- Enhanced mobile navigation with larger touch targets

## 📈 Features Overview

### Navigation
- **Dashboard**: `/` - Overview and KPIs
- **Fleet**: `/fleet` - Drone management
- **Build Activity**: `/build-activity` - Activity tracking
- **Admin**: `/admin` - Administrative functions
- **Settings**: `/settings` - Configuration

### Export Capabilities
- CSV export for activities and fleet data
- JSON export for technical data
- Timestamped file generation
- Filtered data export

### Search & Filter
- Multi-field search across all data
- Status-based filtering
- Date range filtering
- System/Assembly filtering
- Completion percentage ranges

## 🔒 Environment Variables

Create a `.env.local` file with:

```env
# Database
DATABASE_URL="file:./dev.db"

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=ws://localhost:3003
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Slack Integration (Optional)
# SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
# SLACK_CHANNEL=#drone-assembly
# SLACK_ENABLE_MILESTONES=true

# Generic Webhooks (Optional)
# WEBHOOK_ENDPOINT_1=https://api.example.com/drone-updates
```

## 🧪 Development

### Code Quality
- ESLint configuration with TypeScript rules
- Automatic code formatting
- Type checking at build time
- Component prop validation

### Scripts
- `npm run dev` - Next.js development server only
- `npm run dev:all` - Start both Next.js and WebSocket servers
- `npm run build` - Production build (Next.js + WebSocket server)
- `npm run start` - Start production server (both services)
- `npm run lint` - Run ESLint
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run ws:dev` - Start WebSocket server only

## 🚀 Deployment

### Production Deployment Script
Use the included deployment script for automated setup:
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Manual Deployment
1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up production database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Start production servers**
   ```bash
   npm run start
   ```

### Vercel (Next.js only)
1. Push to GitHub repository
2. Connect to Vercel
3. Configure environment variables
4. Deploy automatically on push
5. Note: WebSocket server requires separate hosting

### Health Check Endpoints
After deployment, verify system health:
- `GET /api/health` - Overall system status
- `GET /api/health/database` - Database connectivity
- `GET /api/health/websocket` - WebSocket configuration

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ using Next.js 15 and modern web technologies**
