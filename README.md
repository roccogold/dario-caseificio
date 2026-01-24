# DARIO - Digital Production Management System

> A modern, elegant web application built for [Corzano e Paterno](https://www.corzanoepaterno.com/), an artisan cheese farm in Tuscany, Italy.

![DARIO Logo](./public/frog-logo.svg)

**DARIO** is a comprehensive production management system designed specifically for artisanal cheese production. Built as a digital diary for tracking daily operations, managing cheese types, monitoring production batches, and organizing activities at the Corzano e Paterno farm.

## 🏡 About Corzano e Paterno

[Corzano e Paterno](https://www.corzanoepaterno.com/) is a family-owned farm in San Casciano Val di Pesa, Tuscany, specializing in:
- **Artisan Cheese Production** - Handcrafted sheep's milk cheeses since 1992
- **Wine Production** - Organic wines from 20 hectares of vineyards
- **Extra Virgin Olive Oil** - From 4,000 olive trees
- **Agriturismo** - Farm stays in restored historic farmhouses

This application was built to digitize and modernize the production tracking and management processes at the farm.

## ✨ Features

### 📊 Dashboard
- Real-time overview of daily operations
- Quick statistics and production summaries
- Today's activities at a glance
- Cheese production rankings

### 📅 Calendar Management
- Day, Week, and Month views
- Visual production and activity tracking
- Protocol-based activity scheduling
- Recurring task management

### 🧀 Cheese Type Management
- Comprehensive cheese profiles with custom protocols
- Production parameters (temperature, ferment, molds, rennet)
- Multiple pricing tiers (Franco Caseificio, Franco Cliente, Vendita Diretta)
- Custom fields for farm-specific data
- PDF generation for cheese documentation

### 📦 Production Tracking
- Detailed production history with search and filters
- Multi-cheese production batches
- Production notes and documentation
- Date-based filtering and statistics

### 📈 Analytics & Statistics
- Production trends and insights
- Monthly and yearly statistics
- Cheese-specific analytics
- Visual charts and data visualization

### ✅ Activity Management
- Protocol-based activities linked to cheese types
- Recurring activities (daily, weekly, monthly, etc.)
- One-time tasks
- Completion tracking with date history

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn-ui (Radix UI primitives)
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Data Visualization**: Recharts
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **Date Handling**: date-fns
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Deployment**: Vercel
- **PWA**: Service Worker with offline support

## 🎨 Design Philosophy

The application features a warm, earthy Italian artisan aesthetic inspired by traditional craftsmanship:

- **Typography**: Custom serif fonts (TC Galliard, Garamond Premier) for elegant, timeless feel
- **Color Palette**: Warm browns, creams, and sage greens reflecting the natural farm environment
- **UI/UX**: Clean, minimalist interface with smooth animations
- **Responsive Design**: Optimized for desktop, tablet (iPad), and mobile devices

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm) for version management)
- **npm** or **bun**
- **Supabase Account** (for production deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/roccogold/dario-caseificio.git
cd dario-caseificio

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

### Environment Variables

Create a `.env.local` file in the root directory (this file is gitignored):

```env
# Supabase Configuration (Required for production)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development Default User (Optional, only for local development)
# In production, use Supabase Auth instead
VITE_DEFAULT_USERNAME=admin@example.com
VITE_DEFAULT_PASSWORD=changeme
```

**⚠️ Security**: 
- Never commit `.env.local` or any file containing credentials to version control
- All sensitive values are stored in environment variables
- The `.gitignore` file is configured to exclude all `.env*` files

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## 📁 Project Structure

```
.
├── src/                  # Source code
│   ├── components/       # React components
│   │   ├── dashboard/   # Dashboard widgets
│   │   ├── dialogs/      # Modal dialogs (add/edit forms)
│   │   ├── layout/       # Layout components (AppLayout, etc.)
│   │   └── ui/           # Reusable UI components (shadcn-ui)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and adapters
│   ├── pages/            # Page components
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── database/             # Database scripts
│   └── scripts/          # SQL migration and setup scripts
├── docs/                 # Documentation
│   ├── setup/            # Setup guides
│   ├── deployment/       # Deployment guides
│   ├── database/        # Database documentation
│   ├── testing/          # Testing guides
│   ├── architecture/     # Architecture docs
│   └── archive/          # Historical documentation
├── scripts/              # Utility scripts
│   ├── deploy.sh         # Deployment script
│   └── START_DEV_SERVER.sh # Dev server startup
├── public/               # Static assets
└── [config files]        # Configuration files (package.json, vite.config.ts, etc.)
```

## 🔐 Security

- All sensitive credentials are stored in environment variables
- Supabase Row Level Security (RLS) policies protect database access
- Authentication handled through Supabase Auth
- No hardcoded API keys or passwords in the codebase

## 🚢 Deployment

### Vercel Deployment

The project is configured for automatic deployment on Vercel:

1. Push code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

The `vercel.json` file includes proper routing configuration for the SPA.

### Manual Deployment

```bash
npm run build
# Upload the dist/ folder to your hosting provider
```

## 📝 Development

### Available Scripts

- `npm run dev` - Start development server (port 8080)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for code formatting (via ESLint)

## 📚 Documentation

All project documentation is organized in the [`docs/`](./docs/) directory:

- **[Setup Guides](./docs/setup/)** - Installation and configuration
- **[Deployment Guides](./docs/deployment/)** - Deployment instructions
- **[Database Documentation](./docs/database/)** - Schema and migrations
- **[Testing Guides](./docs/testing/)** - Testing procedures
- **[Architecture](./docs/architecture/)** - System design

See [docs/README.md](./docs/README.md) for the complete documentation index.

## 🗄️ Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:

- `formaggi` - Cheese types and their properties
- `produzioni` - Production batches
- `attivitia` - Activities and tasks
- `users` - User authentication (managed by Supabase Auth)

See `database/scripts/supabase-schema.sql` for the complete schema definition.

For detailed database documentation, see [docs/database/](./docs/database/).

All SQL scripts are located in [`database/scripts/`](./database/scripts/).

## 📄 License

This project is private and proprietary software built for Corzano e Paterno.

## 👨‍💻 Built By

Developed as a personal project for family farm operations at [Corzano e Paterno](https://www.corzanoepaterno.com/).

---

**Farm Location**: Via San Vito di Sopra, snc - 50020 San Casciano in Val di Pesa (Firenze), Toscana, Italia

**Website**: [www.corzanoepaterno.com](https://www.corzanoepaterno.com/)
