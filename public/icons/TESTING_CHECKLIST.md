# PWA Icon Testing Checklist

## 🧪 Testing Requirements

### Desktop Testing (Chrome DevTools)
- [ ] Open DevTools → Application → Manifest
- [ ] Verify all 4 icons listed (2 any + 2 maskable)
- [ ] Check icon paths resolve correctly
- [ ] Test "Install" button appears
- [ ] Install PWA and verify icon in taskbar/dock

### Android Testing (Chrome 114+)
- [ ] Visit deployed site on Android device
- [ ] Tap menu → "Install app" or "Add to Home Screen"
- [ ] Check install prompt shows correct icon
- [ ] After install, verify home screen icon appears
- [ ] Test icon in different launcher themes:
  - [ ] Circle shape
  - [ ] Square shape
  - [ ] Rounded square
  - [ ] Squircle
- [ ] Open installed PWA, check splash screen icon
- [ ] Verify app appears in app drawer with correct icon

### iOS Testing (Safari 16+)
- [ ] Visit deployed site on iPhone/iPad
- [ ] Tap Share button → "Add to Home Screen"
- [ ] Verify apple-touch-icon appears in preview
- [ ] After adding, check home screen icon quality
- [ ] Open PWA from home screen
- [ ] Verify status bar styling

### Desktop PWA Testing
- [ ] Windows: Install via Chrome/Edge
- [ ] macOS: Install via Chrome/Safari
- [ ] Linux: Install via Chrome/Firefox
- [ ] Verify Start Menu/Applications shortcut
- [ ] Check window icon in taskbar/dock

## 🎨 Icon Quality Checks

### Standard Icons (icon-192.png, icon-512.png)
- [ ] Clear and recognizable at all sizes
- [ ] No pixelation or blur
- [ ] Proper transparency (if applicable)
- [ ] Colors match brand (#e7507a)

### Maskable Icons (icon-*-maskable.png)
- [ ] Logo/content centered in safe zone (80%)
- [ ] Background color solid (#e7507a)
- [ ] No critical elements in outer 10%
- [ ] Looks good when cropped to circle
- [ ] Looks good when cropped to square
- [ ] Test on maskable.app to verify safe zone

## 📱 Platform-Specific Checks

### Android
- [ ] Icon displays correctly in all launcher shapes
- [ ] Adaptive icon behavior works
- [ ] Splash screen shows correct icon
- [ ] Notification icon (if used) displays

### iOS
- [ ] Home screen icon sharp and clear
- [ ] No black borders around icon
- [ ] Splash screen (if configured) shows icon
- [ ] Icon visible in Settings → General → Storage

### Desktop
- [ ] Taskbar/dock icon clear
- [ ] Window title bar icon visible
- [ ] Start menu/app launcher icon
- [ ] Alt+Tab icon recognizable

## 🔧 Debugging Tips

### Icons Not Showing
1. Clear browser cache and service worker
2. Check console for 404 errors
3. Verify paths in manifest.webmanifest
4. Ensure Content-Type: image/png headers
5. Check file permissions (readable)

### Wrong Icon Displayed
1. Check purpose: 'any' vs 'maskable'
2. Verify sizes match actual file dimensions
3. Clear cached PWA data
4. Uninstall and reinstall PWA

### Maskable Issues
1. Test on maskable.app first
2. Ensure 10% safe zone on all sides
3. Use solid background color
4. Center logo in safe zone
5. Export as PNG with proper dimensions

## 📊 Expected Results

| Platform | Icon Type | Expected Behavior |
|----------|-----------|------------------|
| Chrome Android | Maskable | Adaptive icon, cropped to launcher shape |
| Chrome Android | Any | Fallback if maskable fails |
| iOS Safari | Apple Touch | Home screen icon, no cropping |
| Chrome Desktop | Any | Square icon in taskbar/window |
| Edge Desktop | Any | Square icon in taskbar/Start Menu |

## ✅ Sign-Off

- [ ] All icons tested on real devices
- [ ] No console errors related to icons
- [ ] PWA installs successfully on all platforms
- [ ] Icons look professional and on-brand
- [ ] Documentation updated with findings
- [ ] Screenshots captured for reference

## 📸 Testing Screenshots

Create screenshots folder: `public/icons/testing-screenshots/`

Capture:
- Android home screen (multiple launcher shapes)
- iOS home screen
- Desktop installed PWA
- App drawer/launcher view
- Splash screen (if applicable)
- Install prompt
