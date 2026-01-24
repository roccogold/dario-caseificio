# 🚀 Deployment Workflow - Local First, Then Production

## New Workflow Process

**I will ALWAYS:**
1. ✅ Make changes locally
2. ✅ Test locally (you verify)
3. ⏸️ **WAIT for your approval**
4. ✅ Only then push to production

## Current Status

**Last Deployment:** `0e3c375` - Design consistency fixes
**Status:** ✅ Deployed to production

## Unused/Confusing Files Found

### ⚠️ Duplicate Files (Need to Check):

1. **Supabase Files:**
   - `src/utils/supabase.js` ❓ (old?)
   - `src/utils/supabase.ts` ✅ (used)
   - `src/utils/supabaseAuth.js` ❓ (old?)
   - `src/utils/supabaseAuth.ts` ✅ (used)
   - `src/utils/supabaseStorage.js` ✅ (used by use-data.ts)
   - `src/utils/supabaseStorage.ts` ❓ (uses adapters, but not imported)

2. **Storage Files:**
   - `src/utils/storage.js` ❓ (old localStorage?)
   - `src/utils/localStorage.ts` ✅ (might be used)
   - `src/utils/userStorage.js` ❓ (unused?)

3. **Mock Data:**
   - `src/utils/mockData.js` ❓ (old?)
   - `src/lib/mock-data.ts` ❓ (unused?)

4. **Other:**
   - `src/utils/predictions.js` ❓ (unused?)
   - `src/utils/cheeseColors.js` ❓ (unused?)
   - `src/lib/adapters.ts` ✅ (used by supabaseStorage.ts)

### 🔍 Files to Investigate:

**UI Components (duplicates):**
- `src/components/ui/Button.jsx` vs `button.tsx` ❓
- `src/components/ui/Input.jsx` vs `input.tsx` ❓
- `src/components/ui/Calendar.jsx` vs `calendar.tsx` ❓
- `src/components/ui/Sidebar.jsx` vs `sidebar.tsx` ❓
- `src/components/ui/Sheet.jsx` vs `sheet.tsx` ❓
- `src/components/ui/Separator.jsx` vs `separator.tsx` ❓
- `src/components/ui/Skeleton.jsx` vs `skeleton.tsx` ❓
- `src/components/ui/Tooltip.jsx` vs `tooltip.tsx` ❓
- `src/components/ui/NavigationMenu.jsx` vs `navigation-menu.tsx` ❓

## Next Steps

1. **I'll analyze which files are actually used**
2. **Remove unused duplicates**
3. **Test locally first**
4. **Wait for your approval before pushing**

## Commands for Local Testing

```bash
# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Start dev server
cd ~/Desktop/projects/proj-dario
npm run dev
```

Then test at: http://localhost:8081 (or whatever port it uses)
