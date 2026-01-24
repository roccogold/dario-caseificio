# Project Structure Guide

This document explains the organization and structure of the DARIO project.

## 📁 Root Directory

The root contains only essential configuration files:

- **`package.json`** - Node.js dependencies and scripts
- **`vite.config.ts`** - Vite build tool configuration
- **`tsconfig.json`** - TypeScript configuration
- **`tailwind.config.ts`** - Tailwind CSS configuration
- **`eslint.config.js`** - ESLint linting rules
- **`postcss.config.js`** - PostCSS configuration
- **`vercel.json`** - Vercel deployment configuration
- **`components.json`** - shadcn-ui component configuration
- **`index.html`** - Main HTML entry point
- **`README.md`** - Project overview

## 📂 Directory Structure

```
.
├── src/                    # Source code
│   ├── components/         # React components
│   │   ├── dashboard/     # Dashboard widgets
│   │   ├── dialogs/        # Modal dialogs
│   │   ├── layout/         # Layout components
│   │   └── ui/             # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and adapters
│   ├── pages/              # Page components
│   ├── types/              # TypeScript definitions
│   └── utils/              # Utility functions
│
├── database/               # Database scripts
│   └── scripts/            # SQL migration scripts
│
├── docs/                   # Documentation
│   ├── setup/              # Setup guides
│   ├── deployment/         # Deployment guides
│   ├── database/           # Database documentation
│   ├── testing/             # Testing guides
│   ├── architecture/        # Architecture docs
│   └── archive/            # Historical docs
│
├── scripts/                 # Utility scripts
│   ├── deploy.sh           # Deployment script
│   └── START_DEV_SERVER.sh # Dev server startup
│
├── public/                  # Static assets
│   ├── fonts/              # Custom fonts
│   ├── *.svg               # Logo and icon files
│   ├── manifest.json        # PWA manifest
│   ├── sw.js               # Service worker
│   └── robots.txt          # SEO configuration
│
└── [config files]          # Configuration files (root level)
```

## 🎯 Organization Principles

1. **Source Code** (`src/`) - All application code organized by feature/type
2. **Database** (`database/`) - All SQL scripts in one place
3. **Documentation** (`docs/`) - Organized by topic/category
4. **Scripts** (`scripts/`) - Utility and automation scripts
5. **Public Assets** (`public/`) - Static files served directly
6. **Config Files** (root) - Standard tooling configuration files

## 📝 File Naming Conventions

- **Components**: PascalCase (e.g., `AppLayout.tsx`)
- **Utilities**: camelCase (e.g., `generatePDF.ts`)
- **Config Files**: kebab-case or standard (e.g., `vite.config.ts`)
- **SQL Scripts**: UPPERCASE_WITH_UNDERSCORES (e.g., `FASE1_SCHEMA_MIGRATION.sql`)
- **Documentation**: UPPERCASE_WITH_UNDERSCORES.md (e.g., `QUICK_START.md`)

## 🔍 Finding Files

- **Looking for a component?** → `src/components/`
- **Looking for a page?** → `src/pages/`
- **Looking for SQL scripts?** → `database/scripts/`
- **Looking for documentation?** → `docs/`
- **Looking for utilities?** → `src/utils/` or `src/lib/`

## 🚫 What NOT to Commit

See `.gitignore` for complete list. Key exclusions:
- `node_modules/` - Dependencies
- `dist/` - Build output
- `.env*` - Environment variables
- `*.log` - Log files
- `.DS_Store` - OS files

## 📚 Related Documentation

- [Setup Guide](./setup/QUICK_START.md)
- [Database Scripts](../../database/scripts/README.md)
- [Deployment Guide](./deployment/DEPLOY_PRODUCTION.md)
