# 🚁 Drone Dashboard - Fleet Management System

A comprehensive drone fleet management system built with Next.js 15, TypeScript, and Tailwind CSS. This application provides real-time monitoring, build activity tracking, and complete management capabilities for drone manufacturing and assembly processes.

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
- Real-time WebSocket integration
- Dark/light theme support
- Responsive design (mobile-first)
- TypeScript for type safety
- Modern UI components with Radix UI

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

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🏗️ Architecture

### Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom Components
- **Icons**: Lucide React
- **Real-time**: WebSocket integration
- **State Management**: React useState/useEffect

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

### Real-time Features
- WebSocket connection for live updates
- System health monitoring
- Build progress streaming

## 🎨 UI Components

### Custom Components
- **SearchFilter**: Advanced filtering with presets
- **RealTimeIndicator**: Connection status display
- **Progress**: Animated progress bars
- **Badge**: Status indicators
- **Card**: Container components

### Responsive Design
- Mobile-first approach
- Collapsible sidebar navigation
- Touch-friendly interfaces
- Adaptive layouts

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
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## 🧪 Development

### Code Quality
- ESLint configuration with TypeScript rules
- Automatic code formatting
- Type checking at build time
- Component prop validation

### Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript checking

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub repository
2. Connect to Vercel
3. Configure environment variables
4. Deploy automatically on push

### Docker
```bash
# Build image
docker build -t drone-dashboard .

# Run container
docker run -p 3000:3000 drone-dashboard
```

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
