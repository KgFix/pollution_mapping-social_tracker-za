# 🌍 VukaMap - Pollution Tracking & Community Cleanup Platform

> **Empowering South African communities to fight pollution through AI-powered crowdsourcing and gamification**

VukaMap is a gamified, mobile-first web application that enables citizens to report pollution hotspots, verify cleanups using AI, and earn eco-credits. Built for South African townships, it combines Azure Computer Vision, real-time mapping, and social features to drive environmental action.

[![.NET 9](https://img.shields.io/badge/.NET-9.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.0-000000?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Azure AI](https://img.shields.io/badge/Azure-Computer_Vision-0078D4?logo=microsoft-azure)](https://azure.microsoft.com/en-us/products/ai-services/ai-vision/)

---

## 🎯 Problem Statement

South Africa faces significant pollution challenges, particularly in townships where waste management infrastructure is limited. Citizens lack effective tools to:
- Report pollution hotspots easily
- Coordinate cleanup efforts
- Get recognized for environmental contributions
- Verify that cleanups actually happened

## ✨ Key Features

### 🤖 AI-Powered Image Analysis
- **Azure Computer Vision Integration** - Automatically analyzes pollution severity from uploaded photos
- **EXIF Metadata Extraction** - Validates GPS coordinates, timestamps, and camera information
- **Smart Pollution Rating** - AI calculates dirtiness percentage (0-100%) from image content
- **Cleanup Verification** - AI confirms location match and cleanliness improvement

### 🗺️ Interactive Mapping
- **150+ Hotspots** across South Africa (Johannesburg, Cape Town, Durban, etc.)
- **Real-time Updates** - See pollution reports as they're submitted
- **Color-coded Markers** - Red (dirty), Green (cleaned), with severity-based sizing
- **Geographic Clustering** - Hotspots naturally cluster around cities

### 🏆 Gamification & Social Features
- **Eco-Credits System** - Earn points for reporting and cleaning pollution
- **Leaderboards** - City-based rankings of top contributors
- **User Profiles** - Track your impact (waste removed, credits earned)
- **Cleanup Events** - Organize community cleanup activities
- **Timeline Feed** - Real-time activity stream of platform actions

### 📱 Mobile-First Design
- **Progressive Web App (PWA)** ready
- **Native-like UI** with bottom navigation
- **Camera Integration** - Take photos directly from the app
- **Geolocation** - Auto-detect user position for accurate reporting

---

## 🛠️ Tech Stack

### Backend (.NET 9 API)
- **ASP.NET Core 9.0** - RESTful API with minimal APIs
- **Entity Framework Core** - SQLite database with migrations
- **Azure Computer Vision SDK 7.0.1** - AI image analysis
- **MetadataExtractor 2.8.1** - EXIF GPS and camera data extraction
- **C# 12** with nullable reference types

### Frontend (Next.js 15)
- **Next.js 15** with App Router
- **React 19** with Server Components
- **TypeScript 5** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Leaflet.js** - Interactive maps with OpenStreetMap
- **Radix UI** - Accessible component primitives

### Infrastructure
- **SQLite** - Lightweight embedded database
- **Azure AI Services** - Computer Vision API
- **REST API** - JSON over HTTP

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm ([Download](https://nodejs.org/))
- **.NET SDK 9.0** ([Download](https://dotnet.microsoft.com/download/dotnet/9.0))
- **Git** ([Download](https://git-scm.com/downloads))
- **Azure Account** (for AI features) - [Free tier available](https://azure.microsoft.com/free/)

### Optional
- **Visual Studio Code** with C# and TypeScript extensions
- **Azure CLI** for easier Azure setup

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/pollution_mapping-social_tracker-za.git
cd pollution_mapping-social_tracker-za
```

### 2. Set Up Azure Computer Vision (Required for AI Features)

1. **Create Azure Computer Vision Resource**
   - Go to [Azure Portal](https://portal.azure.com)
   - Create new resource → "Computer Vision"
   - Select Free (F0) tier (5,000 calls/month)
   - Note the **Endpoint** and **API Key**

2. **Configure Backend**
   
   Create `backend/VukaMap.Api/appsettings.Development.json`:
   ```json
   {
     "Logging": {
       "LogLevel": {
         "Default": "Information",
         "Microsoft.AspNetCore": "Warning"
       }
     },
     "AzureComputerVision": {
       "Endpoint": "https://YOUR-RESOURCE-NAME.cognitiveservices.azure.com/",
       "ApiKey": "YOUR-API-KEY-HERE"
     }
   }
   ```

   > ⚠️ **Never commit `appsettings.Development.json`** - it's already in `.gitignore`

### 3. Install Backend Dependencies

```bash
cd backend/VukaMap.Api
dotnet restore
```

### 4. Set Up Database

```bash
# Apply migrations and seed data (creates 150 hotspots)
dotnet ef database update
```

This creates `vukamap.db` with:
- 150 pollution hotspots across South Africa
- 15 sample users
- 3 cleanup events
- Timeline entries

### 5. Install Frontend Dependencies

```bash
cd ../../frontend
npm install
```

### 6. Start Development Servers

**Terminal 1 - Backend API** (runs on http://localhost:5292)
```bash
cd backend/VukaMap.Api
dotnet run
```

**Terminal 2 - Frontend** (runs on http://localhost:3000)
```bash
cd frontend
npm run dev
```

### 7. Open the App

Navigate to **http://localhost:3000** in your browser

---

## 📖 Usage Guide

### First Time Setup

1. **Login** (Profile Tab)
   - Enter any name
   - Choose an avatar
   - Credentials stored locally

2. **Explore the Map**
   - View 150+ pollution hotspots
   - Red markers = dirty spots
   - Green markers = cleaned spots
   - Click markers for details

3. **Report Pollution**
   - Tap "Report" tab
   - Upload photo (or take new one)
   - AI analyzes pollution rating
   - Confirm to add to map

4. **Verify Cleanup**
   - Find a dirty hotspot
   - Clean it up in real life
   - Upload "after" photo
   - AI verifies location + cleanliness
   - Earn eco-credits!

---

## 📁 Project Structure

```
pollution_mapping-social_tracker-za/
├── backend/
│   └── VukaMap.Api/
│       ├── Controllers/          # API endpoints
│       │   ├── HotspotsController.cs    # CRUD + AI analysis
│       │   ├── ProfileController.cs     # User profiles
│       │   ├── LeaderboardController.cs # Rankings
│       │   └── EventsController.cs      # Cleanup events
│       ├── Data/
│       │   ├── AppDbContext.cs          # EF Core context
│       │   └── DbSeeder.cs              # Seed 150 hotspots
│       ├── DTOs/                 # Data transfer objects
│       ├── Models/               # Entity models (User, Hotspot, etc.)
│       ├── Migrations/           # EF Core migrations
│       ├── Services/
│       │   └── ImageAnalysisService.cs  # Azure AI integration
│       ├── Utilities/
│       │   └── DistanceCalculator.cs    # Haversine formula
│       ├── wwwroot/
│       │   └── uploads/          # User-uploaded images
│       │       ├── dirty/        # 32 pollution images
│       │       └── clean/        # 11 cleanup images
│       ├── appsettings.json
│       ├── Program.cs            # App configuration
│       └── VukaMap.Api.csproj
├── frontend/
│   ├── app/
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home (redirects to map)
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── app-shell.tsx         # Main navigation shell
│   │   ├── map-view.tsx          # Interactive Leaflet map
│   │   ├── report-view.tsx       # AI-powered upload
│   │   ├── cleanup-verify-view.tsx # Cleanup verification
│   │   ├── events-view.tsx       # Community events
│   │   ├── leaderboard-view.tsx  # Rankings
│   │   └── profile-view.tsx      # User profile
│   ├── lib/
│   │   ├── api.ts                # API client functions
│   │   └── data.ts               # TypeScript types
│   ├── public/                   # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.mjs
├── pollution_mapping-social_tracker-za.sln
└── README.md
```

---

## 🔌 API Endpoints

### Hotspots
- `GET /api/hotspots` - List all hotspots (optional `?city=` filter)
- `GET /api/hotspots/{id}` - Get single hotspot
- `POST /api/hotspots` - Create new hotspot (with AI analysis)
- `POST /api/hotspots/resolve/{id}` - Mark as cleaned (with AI verification)

### Profile
- `GET /api/profile/{name}` - Get user profile and stats

### Leaderboard
- `GET /api/leaderboard?city={city}` - Get city rankings
- `GET /api/leaderboard/cities` - Get all city scores

### Events
- `GET /api/events` - List cleanup events
- `POST /api/events/{id}/register` - Register for event

### Timeline
- `GET /api/timeline` - Get recent activity feed

---

## 🧪 Testing the AI Features

### Test Pollution Upload

```powershell
# Windows PowerShell
cd backend/VukaMap.Api
$formData = @{
    latitude = "-26.2041"
    longitude = "28.0473"
    description = "Test pollution"
    city = "Johannesburg"
    reportedBy = "TestUser"
    image = Get-Item "wwwroot/uploads/dirty/1.jpg"
}
Invoke-RestMethod -Uri "http://localhost:5292/api/hotspots" `
    -Method Post -Form $formData
```

### Test Cleanup Verification

```powershell
$formData = @{
    afterImage = Get-Item "wwwroot/uploads/clean/1.jpg"
    claimedBy = "TestUser"
}
Invoke-RestMethod -Uri "http://localhost:5292/api/hotspots/resolve/1" `
    -Method Post -Form $formData
```

---

## 🎨 Customization

### Change Database Location

Edit `backend/VukaMap.Api/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=your-custom-path/vukamap.db"
  }
}
```

### Modify Seed Data

Edit `backend/VukaMap.Api/Data/DbSeeder.cs` to change:
- Number of hotspots (default: 150)
- City locations and names
- Image paths
- User profiles

Then regenerate database:
```bash
rm vukamap.db
dotnet ef database update
```

### Frontend Configuration

Edit `frontend/lib/api.ts` to change API base URL:
```typescript
const BASE_URL = "http://localhost:5292" // Change for production
```

---

## 🐛 Troubleshooting

### Backend won't start

**Issue**: `Unable to load the service index for source`
- **Fix**: Run `dotnet restore` in backend folder

**Issue**: `Azure Computer Vision not initialized`
- **Fix**: Verify `appsettings.Development.json` has correct endpoint and API key

### Frontend build errors

**Issue**: `Module not found: Can't resolve 'leaflet'`
- **Fix**: `npm install` in frontend folder

### Database issues

**Issue**: `No such table: Hotspots`
- **Fix**: Run `dotnet ef database update` in backend folder

### AI Analysis not working

**Issue**: All pollution ratings are random (30-90%)
- **Fix**: Check Azure Computer Vision quota (5,000/month on free tier)
- **Fix**: Verify API key is active in Azure Portal

---

## 🚢 Deployment

### Backend (Azure App Service)
```bash
cd backend/VukaMap.Api
dotnet publish -c Release -o ./publish
# Deploy publish folder to Azure App Service
```

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy .next folder
```

> 🔐 Remember to set environment variables in production:
> - `AzureComputerVision__Endpoint`
> - `AzureComputerVision__ApiKey`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Team

Built for hackathons and community impact in South Africa.

---

## 🙏 Acknowledgments

- **Azure Computer Vision** for AI-powered pollution detection
- **OpenStreetMap** contributors for mapping data
- **South African communities** working to solve pollution challenges

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ for a cleaner South Africa** 🇿🇦
