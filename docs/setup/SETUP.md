# Setup & Deployment Guide

## ✅ Project Status

All files from the Lovable repository have been successfully cloned and are ready for local development and deployment.

## 📋 Quick Start

### 1. Install Node.js (if not already installed)

```bash
# Using Homebrew (macOS)
brew install node

# Or download from https://nodejs.org/
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:8080

### 4. Build for Production

```bash
npm run build
```

## 🚀 Deploy to Vercel

### Option 1: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

### Option 2: Using Vercel Dashboard

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the Vite configuration
5. Click "Deploy"

The project is already configured with `vercel.json` for optimal deployment.

## 📁 Project Structure

All components and files are in place:

- ✅ All pages (Dashboard, Calendar, Formaggi, Produzioni, Statistiche)
- ✅ All UI components (shadcn-ui)
- ✅ Custom components (CheeseBadge, StatCard, ActivityCard, etc.)
- ✅ Type definitions
- ✅ Mock data
- ✅ Styling and theming
- ✅ Vercel configuration

## 🎨 Features Included

- **Dashboard**: Quick stats, activities, recent productions, rankings
- **Calendar**: Monthly view with production and activity management
- **Cheese Types**: Full CRUD for cheese types with protocols
- **Productions**: Production history with search and filters
- **Statistics**: Charts and analytics with Recharts
- **Activities**: Protocol steps, recurring tasks, one-time activities

## 🔧 Configuration Files

- `vercel.json` - Vercel deployment configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration

## 📝 Next Steps

1. Install Node.js if needed
2. Run `npm install`
3. Test locally with `npm run dev`
4. Deploy to Vercel using one of the methods above
5. Update the domain in Vercel settings if needed

## 🐛 Troubleshooting

### Node.js not found
- Install Node.js from https://nodejs.org/
- Or use nvm: `nvm install 18 && nvm use 18`

### Port 8080 already in use
- Change the port in `vite.config.ts` or use `npm run dev -- --port 3000`

### Build errors
- Make sure all dependencies are installed: `npm install`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
