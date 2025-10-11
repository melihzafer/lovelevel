# PWA Icon Generation Guide

## 📱 Current Icon Status

All icons are in `public/icons/`:
- ✅ `icon-192.png` (192x192) - Standard PWA icon
- ✅ `icon-512.png` (512x512) - Standard PWA icon  
- ⚠️ `icon-192-maskable.png` - Currently just a copy, needs safe zone
- ⚠️ `icon-512-maskable.png` - Currently just a copy, needs safe zone
- ✅ `apple-touch-icon.png` (180x180) - iOS home screen
- ✅ `favicon-16x16.png` - Browser tab
- ✅ `favicon-32x32.png` - Browser tab

## 🎨 What is a Maskable Icon?

Maskable icons are designed for Android's adaptive icons. They have:
- **Safe zone**: 10% padding around the edges (40px for 512px icon)
- **Full bleed area**: Content can extend to edges but critical elements stay in safe zone
- **No transparency**: Background should be solid color

## 🛠️ How to Create Maskable Icons

### Option 1: Online Tool (Recommended)
Use **Maskable.app**: https://maskable.app/editor

1. Upload your `icon-512.png`
2. Add 10% padding/margin
3. Adjust positioning to keep logo centered in safe zone
4. Export as 512x512 and 192x192
5. Save as `icon-512-maskable.png` and `icon-192-maskable.png`

### Option 2: PWA Asset Generator (CLI)
```bash
npm install -g @vite-pwa/assets-generator
pwa-assets-generator --preset minimal public/icons/icon-512.png
```

### Option 3: Manual Creation (Figma/Photoshop)
1. Canvas: 512x512px or 192x192px
2. Safe zone circle: 80% diameter (409.6px for 512px canvas)
3. Place logo inside safe zone
4. Add solid background color (#e7507a - LoveLevel pink)
5. Export as PNG

## 📐 Sizing Guidelines

| Icon Type | Size | Purpose | Safe Zone |
|-----------|------|---------|-----------|
| Standard | 192x192 | PWA install, app drawer | No |
| Standard | 512x512 | Splash screen, high-DPI | No |
| Maskable | 192x192 | Android adaptive | Yes (10%) |
| Maskable | 512x512 | Android adaptive | Yes (10%) |
| Apple Touch | 180x180 | iOS home screen | No |

## 🔗 Useful Resources

- Maskable Icon Editor: https://maskable.app/editor
- PWA Icon Generator: https://www.pwabuilder.com/imageGenerator
- Icon Testing: https://maskable.app/
- Safe Zone Validator: https://maskable.app/ (upload to test)

## ✅ Checklist

- [x] Standard icons exist (192px, 512px)
- [ ] Maskable icons with proper safe zone (192px, 512px)
- [x] Apple touch icon (180px)
- [x] Favicon sizes (16px, 32px)
- [x] PWA manifest configured
- [ ] Icons tested on real devices

## 🎯 Next Steps

1. Create maskable icons using Maskable.app
2. Replace `icon-192-maskable.png` and `icon-512-maskable.png`
3. Test on Android device (Chrome → Add to Home Screen)
4. Verify icon appears correctly in all shapes (circle, square, rounded square)
