# Troubleshooting - Can't See Changes

## Quick Fixes

### 1. **Restart Dev Server** (Most Common Fix)
```bash
# Stop the server (Ctrl+C in terminal)
# Then restart:
cd frontend
npm run dev
```

### 2. **Hard Refresh Browser**
- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`
- This clears cache and reloads everything

### 3. **Clear Browser Cache**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### 4. **Check Browser Console**
1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for red error messages
4. Share any errors you see

### 5. **Verify Files Exist**
Check these files exist:
- ✅ `frontend/src/pages/Login.tsx`
- ✅ `frontend/src/pages/Register.tsx`
- ✅ `frontend/src/components/ui/image-slider.tsx`
- ✅ `frontend/src/components/ui/button.tsx`
- ✅ `frontend/src/components/ui/input.tsx`
- ✅ `frontend/src/components/ui/label.tsx`
- ✅ `frontend/src/lib/utils.ts`

### 6. **Check Terminal for Errors**
Look at your terminal where `npm run dev` is running:
- Are there any red error messages?
- Does it say "compiled successfully"?
- Are there TypeScript errors?

### 7. **Verify Dependencies**
Run this to check if all packages are installed:
```bash
cd frontend
npm install
```

### 8. **Check Routes**
Make sure you're visiting:
- Login: `http://localhost:5173/login`
- Register: `http://localhost:5173/register`

## Common Issues

### Issue: "Cannot find module '@/components/ui/image-slider'"
**Solution**: 
1. Check `vite.config.js` has the path alias
2. Check `tsconfig.json` has path mapping
3. Restart dev server

### Issue: "Module not found: clsx"
**Solution**:
```bash
cd frontend
npm install clsx tailwind-merge
```

### Issue: Page shows old design
**Solution**:
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Restart dev server

### Issue: TypeScript errors
**Solution**:
1. Check `tsconfig.json` exists
2. Restart your IDE/editor
3. Run `npm install` again

### Issue: Images not loading
**Solution**:
- Check internet connection
- Images load from Unsplash
- Check browser console for CORS errors

## Step-by-Step Debug

1. **Stop dev server** (Ctrl+C)

2. **Clear node_modules and reinstall**:
```bash
cd frontend
rm -rf node_modules  # or on Windows: rmdir /s node_modules
npm install
```

3. **Restart dev server**:
```bash
npm run dev
```

4. **Open browser**:
- Go to `http://localhost:5173/login`
- Open DevTools (F12)
- Check Console for errors

5. **If still not working**, check:
- Terminal output for compilation errors
- Browser console for runtime errors
- Network tab for failed requests

## What You Should See

### Login Page (`/login`)
- **Left side**: Image slider with salon images (desktop only)
- **Right side**: Login form with "Welcome Back" heading
- **Mobile**: Full-width form, no slider

### Register Page (`/register`)
- **Left side**: Image slider with salon images (desktop only)
- **Right side**: Registration form with "Create Account" heading
- **Mobile**: Full-width form, no slider

## Still Not Working?

1. **Check terminal output** - Share any error messages
2. **Check browser console** - Share any red errors
3. **Verify file paths** - Make sure files are in correct locations
4. **Try a different browser** - Sometimes browser cache is the issue

## Quick Test

Create a simple test to verify components work:

1. Visit `http://localhost:5173/login`
2. You should see a split-screen layout (on desktop)
3. Images should auto-rotate every 4 seconds
4. Form should be on the right side

If you see the old simple form, the new files aren't loading. Try:
- Hard refresh
- Restart dev server
- Clear browser cache
