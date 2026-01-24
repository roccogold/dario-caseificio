# 🔧 Fix Dev Server Issues

## Issue Found

- Port 8081 shows 404 error for `Tooltip.jsx`
- Port 8080 works (correct port per vite.config.ts)

## Solution

The error is likely from:
1. **Browser cache** - Old cached imports
2. **Dev server cache** - Vite cache needs clearing

## Steps to Fix

1. **Stop the dev server** (if running on 8081)
2. **Clear Vite cache:**
   ```bash
   rm -rf node_modules/.vite dist
   ```
3. **Restart dev server on correct port (8080):**
   ```bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   npm run dev
   ```
4. **Clear browser cache:**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
   - Or: DevTools → Application → Clear Storage

## Verification

All imports use `.tsx` versions:
- ✅ `@/components/ui/tooltip` → `tooltip.tsx`
- ✅ `@/components/ui/button` → `button.tsx`
- ✅ `@/components/ui/input` → `input.tsx`

No `.jsx` files are imported anywhere.

## Port Configuration

- **Correct port:** 8080 (from vite.config.ts)
- **8081:** Was from a different dev server instance

Use **http://localhost:8080** (not 8081)
