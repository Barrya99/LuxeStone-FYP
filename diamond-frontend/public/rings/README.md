# Ring Images Setup Guide

## Overview
This folder contains photorealistic ring images for the try-on visualization feature.

## File Naming Convention
```
{setting-type}-{metal}-{carat}.png
```

Examples:
- `solitaire-white_gold-1ct.png`
- `three-stone-yellow_gold-1.5ct.png`
- `halo-platinum-2ct.png`

## Supported Settings & Metals

### Setting Types
- `solitaire` - Single stone settings
- `three-stone` - Center stone with accent stones
- `halo` - Center stone surrounded by smaller stones

### Metal Types
- `white_gold`
- `yellow_gold`
- `rose_gold`
- `platinum`

### Carat Weights
Supported: `0.3`, `0.5`, `0.75`, `1`, `1.25`, `1.5`, `2`, `2.5`, `3`

**Note**: Not all combinations need to be provided. The component will disable unavailable options.

## Image Guidelines

### Recommended Specs
- **Format**: PNG with transparent background
- **Size**: 400×600px (minimum) or 600×900px (recommended)
- **Orientation**: Portrait (vertical)
- **Ring Position**: Center-aligned, facing forward
- **Background**: Transparent (RGBA PNG)
- **Quality**: High-resolution product photography

### What to Include in Image
- Ring band and setting only
- Stone(s) are visible and prominent
- Clean, professional diamond/gem rendering
- Good lighting/reflection to show metal finish

### What NOT to Include
- Hands or fingers (the hand model provides context)
- Shadows or background
- Text or watermarks

## Setup Steps

1. **Export/Download Images**: Get your ring product photos (JPG or PNG)

2. **Prepare Images**:
   - Resize to ~500×800px
   - Remove background (make transparent)
   - Ensure PNG format with alpha channel

3. **Save to This Folder**:
   - Save with naming convention: `{type}-{metal}-{carat}.png`
   - Example: `solitaire-white_gold-1ct.png`

4. **Verify in Component**:
   - Component will automatically find images in this folder
   - Load `HandModelViewer_v2.jsx` in configurator
   - Select different options to test

## Adding New Images

### For a New Carat Weight
Add to `RING_CATALOG` object in `HandModelViewer_v2.jsx`:
```javascript
solitaire: {
  white_gold: {
    // ... existing weights
    4: 'solitaire-white_gold-4ct.png',  // New
  }
}
```

### For a New Metal
Add entry in `METALS` array:
```javascript
const METALS = [
  // ... existing
  { id: 'custom_gold', label: 'Custom Gold' },
];
```

Then add to `RING_CATALOG`:
```javascript
solitaire: {
  custom_gold: {
    1: 'solitaire-custom_gold-1ct.png',
  }
}
```

### For a New Setting Type
Add to `SHAPES` array and create full `RING_CATALOG` section.

## Testing Checklist

- [ ] All PNG files are in `/public/rings/` folder
- [ ] File names match the naming convention exactly
- [ ] Images load without errors in browser console
- [ ] Ring displays correctly positioned on hand
- [ ] Different carats show proper scale variation
- [ ] Metal selection changes display correct images
- [ ] Zoom in/out works smoothly
- [ ] No background images showing (transparent PNG)

## Troubleshooting

### Images Not Loading
1. Check file names match exactly (case-sensitive on Linux/Mac)
2. Verify PNG format with transparency
3. Check browser console for 404 errors
4. Ensure image file size is reasonable (<500KB per image)

### Ring Not Positioned Correctly
Adjust in `HandModelViewer_v2.jsx`:
```javascript
const RING_POSITIONING = {
  cx_ratio: 0.596,     // Move left/right on hand (0-1)
  cy_ratio: 0.618,     // Move up/down on hand (0-1)
  offsetX: 0,          // Fine-tune X position (pixels)
  offsetY: -8,         // Fine-tune Y position (pixels)
  rotationDeg: 3,      // Rotate to match finger angle
};
```

### Ring Too Large/Small
Adjust `baseScale` and `scalePerCarat`:
```javascript
baseScale: 1.0,        // 1ct ring size
scalePerCarat: 0.15,   // Scale increase per carat
```

## Example Files to Create

Start by creating these 4 images from your sample:
```
solitaire-white_gold-1ct.png
solitaire-white_gold-1.5ct.png
solitaire-yellow_gold-1ct.png
three-stone-platinum-1ct.png
```

Then expand as needed for other carats/metals.

## File Count Reference
- Minimum setup: 4-6 images
- Standard setup: 15-20 images
- Full setup: 30+ images (all combinations)

---

**Next Steps**:
1. Save ring images to this folder with proper naming
2. Update component selection in your app to use `HandModelViewer_v2`
3. Test different combinations
4. Adjust positioning if needed using calibration values
