# 📋 Unused Files Analysis

## ✅ Files Currently Used

### Supabase Files:
- ✅ `src/utils/supabase.ts` - Used by supabaseAuth.ts, supabaseStorage.js
- ✅ `src/utils/supabaseAuth.ts` - Used by AppLayout, ProtectedRoute, Login.jsx
- ✅ `src/utils/supabaseStorage.js` - Used by use-data.ts, Login.jsx
- ✅ `src/lib/adapters.ts` - Used by supabaseStorage.ts

### UI Components (TypeScript versions used):
- ✅ `src/components/ui/button.tsx` - Used everywhere
- ✅ `src/components/ui/input.tsx` - Used in pages
- ✅ `src/components/ui/calendar.tsx` - Used in dialogs
- ✅ `src/components/ui/sidebar.tsx` - Used in AppLayout
- ✅ `src/components/ui/sheet.tsx` - Used in components
- ✅ `src/components/ui/separator.tsx` - Used in components
- ✅ `src/components/ui/skeleton.tsx` - Used in components
- ✅ `src/components/ui/tooltip.tsx` - Used in App.tsx
- ✅ `src/components/ui/navigation-menu.tsx` - Used in components

## ❌ Files NOT Used (Can be removed)

### Duplicate JavaScript UI Components:
- ❌ `src/components/ui/Button.jsx` - Duplicate of button.tsx
- ❌ `src/components/ui/Input.jsx` - Duplicate of input.tsx
- ❌ `src/components/ui/Calendar.jsx` - Duplicate of calendar.tsx
- ❌ `src/components/ui/Sidebar.jsx` - Duplicate of sidebar.tsx
- ❌ `src/components/ui/Sheet.jsx` - Duplicate of sheet.tsx
- ❌ `src/components/ui/Separator.jsx` - Duplicate of separator.tsx
- ❌ `src/components/ui/Skeleton.jsx` - Duplicate of skeleton.tsx
- ❌ `src/components/ui/Tooltip.jsx` - Duplicate of tooltip.tsx
- ❌ `src/components/ui/NavigationMenu.jsx` - Duplicate of navigation-menu.tsx

### Old Supabase Files (Need verification):
- ❓ `src/utils/supabase.js` - Old version? Check if used
- ❓ `src/utils/supabaseAuth.js` - Old version? Check if used
- ❓ `src/utils/supabaseStorage.ts` - Uses adapters, but not imported anywhere

### Unused Utility Files:
- ❓ `src/utils/storage.js` - Old localStorage? Check if used
- ❓ `src/utils/userStorage.js` - Unused?
- ❓ `src/utils/predictions.js` - Unused?
- ❓ `src/utils/mockData.js` - Old? Check vs mock-data.ts
- ❓ `src/lib/mock-data.ts` - Unused?

### Duplicate Color Files:
- ❓ `src/utils/cheeseColors.js` - Check if used
- ❓ `src/lib/mock-data.ts` - Has colors, check if used

## 🔍 Files to Verify Before Removing

1. **Login.jsx** uses `supabaseAuth` - need to check if it's `.ts` or `.js`
2. **supabaseStorage.ts** - uses adapters but might not be imported
3. **mockData.js vs mock-data.ts** - check which is used

## 📝 Cleanup Plan

1. Remove duplicate `.jsx` UI components (keep `.tsx` versions)
2. Verify and remove old `.js` supabase files if not used
3. Remove unused utility files
4. Test locally first
5. Get approval before pushing
