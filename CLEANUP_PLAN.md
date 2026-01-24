# 🧹 Cleanup Plan - Remove Unused Files

## ✅ Confirmed: Files to Remove

### Duplicate UI Components (.jsx versions - keep .tsx):
1. ❌ `src/components/ui/Button.jsx` - All imports use `button.tsx`
2. ❌ `src/components/ui/Input.jsx` - All imports use `input.tsx`
3. ❌ `src/components/ui/Calendar.jsx` - Not imported anywhere
4. ❌ `src/components/ui/Sidebar.jsx` - All imports use `sidebar.tsx`
5. ❌ `src/components/ui/Sheet.jsx` - All imports use `sheet.tsx`
6. ❌ `src/components/ui/Separator.jsx` - All imports use `separator.tsx`
7. ❌ `src/components/ui/Skeleton.jsx` - All imports use `skeleton.tsx`
8. ❌ `src/components/ui/Tooltip.jsx` - All imports use `tooltip.tsx`
9. ❌ `src/components/ui/NavigationMenu.jsx` - Not imported anywhere

### Old Supabase Files (Need to verify):
- ❓ `src/utils/supabase.js` - Check if used (supabase.ts is used)
- ❓ `src/utils/supabaseAuth.js` - Login.jsx imports without extension (might use .ts)
- ❓ `src/utils/supabaseStorage.ts` - Uses adapters but not imported (supabaseStorage.js is used)

### Unused Utility Files:
- ❓ `src/utils/storage.js` - Old localStorage? Check if used
- ❓ `src/utils/userStorage.js` - Used by Login.jsx (KEEP)
- ❓ `src/utils/predictions.js` - Check if used
- ❓ `src/utils/mockData.js` - Old? Check vs mock-data.ts
- ❓ `src/utils/cheeseColors.js` - Old? mock-data.ts has colors

## 📋 Files to Keep

- ✅ `src/utils/supabase.ts` - Used
- ✅ `src/utils/supabaseAuth.ts` - Used (Login.jsx resolves to this)
- ✅ `src/utils/supabaseStorage.js` - Used by use-data.ts
- ✅ `src/lib/adapters.ts` - Used by supabaseStorage.ts
- ✅ `src/lib/mock-data.ts` - Used for CHEESE_COLORS
- ✅ `src/utils/userStorage.js` - Used by Login.jsx
- ✅ `src/utils/auth.js` - Used by Login.jsx

## 🚀 Cleanup Steps

1. **Remove duplicate .jsx UI components** (9 files)
2. **Verify old .js supabase files** before removing
3. **Test locally first**
4. **Get your approval**
5. **Then push to production**

## ⚠️ Important Notes

- Login.jsx imports `supabaseAuth` without extension - TypeScript/JS resolution will use `.ts` first
- Need to verify which supabase files are actually loaded at runtime
- Test thoroughly after cleanup
