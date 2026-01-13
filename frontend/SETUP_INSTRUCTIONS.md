# Scroll Morph Hero Component - Setup Instructions

## ✅ What Has Been Done

1. **TypeScript Support Added**
   - Installed TypeScript
   - Created `tsconfig.json` and `tsconfig.node.json`
   - Updated Vite config to support TypeScript

2. **Component Structure Created**
   - Created `/src/components/ui/` directory (shadcn-style structure)
   - Added `scroll-morph-hero.tsx` component

3. **Tailwind Configuration Updated**
   - Added `perspective-1000` utility class
   - Extended Tailwind config with perspective support

4. **Demo Page Created**
   - Created `ScrollMorphDemo.tsx` page
   - Added route `/scroll-demo` to App.jsx

## 📦 Required Dependencies

All dependencies are already installed:
- ✅ `framer-motion` (already in package.json)
- ✅ `typescript` (added to devDependencies)

## 🚀 Next Steps

1. **Install TypeScript** (if not already installed):
   ```bash
   cd frontend
   npm install
   ```

2. **Run the Development Server**:
   ```bash
   npm run dev
   ```

3. **View the Component**:
   - Navigate to `http://localhost:5173/scroll-demo` to see the scroll morph hero component

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              ← shadcn-style component directory
│   │   │   └── scroll-morph-hero.tsx
│   │   ├── Layout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   └── ScrollMorphDemo.tsx
│   └── ...
├── tsconfig.json            ← TypeScript configuration
└── tailwind.config.js       ← Updated with perspective utility
```

## 🎨 Component Features

- **Scroll-based animation**: Images morph from circle to arc on scroll
- **3D flip cards**: Hover effect with 3D rotation
- **Responsive design**: Adapts to mobile and desktop
- **Smooth animations**: Spring-based physics for natural motion
- **Touch support**: Works on mobile devices

## 🔧 Customization

### Change Images
Edit the `IMAGES` array in `scroll-morph-hero.tsx`:
```typescript
const IMAGES = [
    "https://your-image-url-1.jpg",
    "https://your-image-url-2.jpg",
    // ... add more images
];
```

### Adjust Animation Speed
Modify these values in the component:
- `MAX_SCROLL`: Total scroll range (default: 3000)
- `morphProgress`: Scroll range for morph animation (default: [0, 600])
- Spring stiffness/damping in `useSpring` hooks

### Change Text Content
Update the text in the component:
- Intro text: "The future is built on AI."
- Active content: "Explore Our Vision" section

## 📝 Notes

- The component uses TypeScript for type safety
- All images are loaded from Unsplash (already configured)
- The component is fully responsive and works on all screen sizes
- No additional context providers or state management required

## 🐛 Troubleshooting

### TypeScript Errors
If you see TypeScript errors, ensure:
1. TypeScript is installed: `npm install typescript --save-dev`
2. Restart your dev server after installation

### Component Not Rendering
- Check browser console for errors
- Ensure `framer-motion` is installed: `npm list framer-motion`
- Verify the route is added in `App.jsx`

### Images Not Loading
- Check network tab for failed image requests
- Verify Unsplash URLs are accessible
- Consider using local images or a CDN
