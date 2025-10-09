# PWA Icons

This directory should contain the following icon files for the PWA:

## Required Icons:

1. **icon-192.png** (192x192px)
   - Standard icon for Android home screen
   - Should be a clear, recognizable logo with good contrast
   - Suggested: Two hearts intertwined or a cute couple symbol

2. **icon-512.png** (512x512px)
   - High-resolution version for splash screens and larger displays
   - Same design as 192px version, just higher resolution

3. **icon-192-maskable.png** (192x192px)
   - Maskable icon for Android adaptive icons
   - Include safe zone: keep important content within center 80% circle
   - Can have background extending to edges

4. **icon-512-maskable.png** (512x512px)
   - High-resolution maskable icon
   - Follow same safe zone rules

## Design Guidelines:

- **Color scheme**: Pink (#e7507a) and purple (#a855f7) gradient
- **Style**: Friendly, romantic, minimal
- **Shapes**: Hearts, couples, pets (optional small mascot)
- **Safe zone for maskable**: Keep logo/text within center 80% diameter circle

## Generation Tools:

- Use tools like:
  - [Figma](https://figma.com)
  - [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
  - [RealFaviconGenerator](https://realfavicongenerator.net/)

## Temporary Placeholder:

For development, you can use generated solid color placeholders or simple SVG exports.
Run this command to generate basic placeholders using ImageMagick:

```bash
# 192x192 icon
magick -size 192x192 -background "#e7507a" -fill white -gravity center -pointsize 100 label:"CL" icon-192.png

# 512x512 icon  
magick -size 512x512 -background "#e7507a" -fill white -gravity center -pointsize 300 label:"CL" icon-512.png

# Maskable versions with padding
magick -size 192x192 -background "#e7507a" -fill white -gravity center -pointsize 80 label:"💕" icon-192-maskable.png

magick -size 512x512 -background "#e7507a" -fill white -gravity center -pointsize 240 label:"💕" icon-512-maskable.png
```

Or use an online tool like https://favicon.io/ to generate from text/emoji.
