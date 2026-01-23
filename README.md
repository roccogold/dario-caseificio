# Dario's Cheese Production Diary

A beautiful, modern web application for managing artisan cheese production, built with React, TypeScript, and shadcn-ui.

**Live URL**: https://dario-caseificio.vercel.app/

## 🧀 Features

- **Dashboard**: Overview with quick stats, today's activities, recent productions, and cheese rankings
- **Calendar**: Monthly calendar view for managing productions and activities
- **Cheese Types Management**: Create and manage different cheese types with custom protocols
- **Production History**: Track all productions with search and filtering
- **Statistics**: Beautiful charts and analytics for production data
- **Activity Tracking**: Manage protocol steps, recurring tasks, and one-time activities

## 🛠️ Tech Stack

- **Vite** - Build tool and dev server
- **React 18** - UI framework
- **TypeScript** - Type safety
- **shadcn-ui** - Beautiful component library
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **React Router** - Navigation
- **date-fns** - Date handling
- **React Query** - Data management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm (or use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation

```bash
# Clone the repository
git clone https://github.com/roccogold/dario-s-cheese-diary.git
cd dario-s-cheese-diary

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📦 Project Structure

```
src/
├── components/        # React components
│   ├── dashboard/    # Dashboard-specific components
│   ├── dialogs/      # Modal dialogs
│   ├── layout/       # Layout components
│   └── ui/           # shadcn-ui components
├── hooks/            # Custom React hooks
├── lib/              # Utilities and mock data
├── pages/            # Page components
├── types/            # TypeScript type definitions
└── main.tsx          # Application entry point
```

## 🎨 Design System

The application features a warm, earthy Italian artisan aesthetic with:
- Custom color palette inspired by cheese and Italian craftsmanship
- EB Garamond serif font for elegant typography
- Smooth animations and transitions
- Responsive design for all screen sizes

## 🚢 Deployment

### Deploy to Vercel

The project is configured for Vercel deployment:

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Vercel will automatically detect the Vite configuration
4. Deploy!

The `vercel.json` file is already configured with the correct settings.

### Manual Deployment

```bash
# Build the project
npm run build

# The dist folder contains the production build
# Upload it to your hosting provider
```

## 📝 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## 🔧 Configuration

- `vite.config.ts` - Vite configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `components.json` - shadcn-ui configuration

## 📄 License

This project is private and proprietary.
