# Static Side Image Extension

A SillyTavern extension that displays a static image on the right side of the chat interface.

## Features

- **Static Image Display**: Shows a user-selected image on the right side of the screen
- **Collapsible Panel**: Shrinks to a mini-thumbnail tab when hidden
- **Image Management**: Upload images via drag-and-drop to a dedicated folder
- **Image Selection**: Choose from available images via dropdown with thumbnail previews
- **Toggle Display**: Enable/disable the image panel display
- **File System Integration**: Uses Browser File System Access API for direct file storage

## Requirements

- SillyTavern latest version
- Chromium-based browser (Chrome, Edge, Opera) for File System Access API support

## Installation

### Method 1: Manual Installation

1. Download the `StaticImageExtension` folder
2. Navigate to your SillyTavern data directory:
   ```
   data/<your-user-handle>/extensions/
   ```
3. Copy the extension folder into the `extensions` directory
4. Restart SillyTavern or refresh the page
5. Enable the extension in Settings → Extensions

### Method 2: Development Installation

1. Clone or copy the extension to your development machine
2. Place in the third-party extensions folder:
   ```
   scripts/extensions/third-party/StaticImageExtension/
   ```
3. Follow the same enablement steps as Method 1

## Usage

### Initial Setup

1. Enable the extension in SillyTavern Settings → Extensions
2. When prompted, grant file system access permission (Chrome/Edge only)
3. The image panel will appear on the right side of the screen

### Managing Images

1. Click the gear icon (⚙️) on the image panel to open settings
2. **Upload Images**: Drag and drop images onto the upload area, or click to browse
3. **Select Image**: Choose from the dropdown menu to display a different image
4. **Toggle Display**: Use the "Enable Display" switch to show/hide the panel entirely

### Collapsing the Panel

- Click the tab on the right edge to expand the panel
- Click the gear icon and use settings to collapse/expand

### File Structure

```
StaticImageExtension/
├── manifest.json          # Extension metadata
├── index.js              # Main JavaScript logic
├── style.css             # All styling
├── README.md             # This file
└── assets/
    ├── placeholder.png   # Default placeholder image
    └── images/           # User-uploaded images directory
```

## Browser Compatibility

| Feature | Chrome/Edge | Firefox | Safari |
|---------|-------------|---------|--------|
| File System Access API | ✅ Supported | ❌ Not Supported | ❌ Not Supported |
| CSS object-fit | ✅ Supported | ✅ Supported | ✅ Supported |
| Drag-and-Drop API | ✅ Supported | ✅ Supported | ✅ Supported |

**Fallback Strategy**: For non-Chromium browsers, users must manually place images in the `assets/images/` folder.

## Troubleshooting

| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| Image doesn't appear | Wrong image path | Verify image exists in `assets/images/` folder |
| Panel overlaps chat | Z-index conflict | Increase `z-index` value in CSS (currently 9999) |
| Toggle button not working | JavaScript error | Check browser console for errors |
| Extension not loading | Invalid manifest | Validate `manifest.json` syntax |
| Image appears stretched | Wrong object-fit | CSS uses `object-fit: cover` - acceptable |
| File system access denied | Browser not supported | Use Chrome/Edge or manually place images |
| Drag-and-drop not working | File type rejected | Ensure file is a valid image (PNG, JPG, WebP) |
| Dropdown empty | No images in folder | Upload images or manually place in `assets/images/` |
| Settings modal doesn't close | Event listener issue | Reload page and try again |
| Tab doesn't expand | Click handler missing | Check browser console for errors |

## Uninstallation

1. Open SillyTavern Settings → Extensions
2. Disable the "Static Side Image" extension
3. Delete the extension folder from:
   ```
   data/<your-user-handle>/extensions/StaticImageExtension/
   ```
4. Refresh the page

## Future Enhancements

- Multiple Image Support: Allow users to configure multiple images and cycle through them
- Position Customization: Allow users to choose left/right positioning
- Panel Width Slider: Add slider to adjust panel width dynamically
- Opacity Control: Add slider to adjust panel transparency
- Character-Specific Images: Display different images based on active character
- Animation Support: Add CSS animations or transitions for the image
- Image Rotation: Add rotation controls for portrait/landscape orientation
- Auto-hide Timer: Automatically collapse panel after period of inactivity

## License

MIT License - Feel free to use and modify as needed.

## Support

For issues and feature requests, please open an issue on the GitHub repository.
