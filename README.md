# Static Image Extension v2.0.0

A SillyTavern extension that displays a static image panel on the side of the interface with customizable width, auto-hide, and collapse features.

## Features

- **Persistent Side Panel** - Fixed right-side panel with static image
- **Image Selection** - Dropdown from manually placed images in `assets/`
- **Customizable Width** - Slider (150-400px) with live preview
- **Auto-hide** - Hide panel after configurable idle time
- **Collapse Mode** - Minimize panel to icon-only view
- **Settings Persistence** - Official ST settings API
- **Keyboard Shortcuts** - Ctrl+Shift+I to toggle panel
- **Smooth Transitions** - CSS animations for panel show/hide

## Installation

1. Copy the `StaticImageExtension` folder to:
   - Production: `SillyTavern/scripts/extensions/third-party/StaticImageExtension/`
   - Development: `SillyTavern/data/<user-handle>/extensions/StaticImageExtension/`

2. Enable the extension in SillyTavern's extension settings

3. Place custom images in `StaticImageExtension/assets/` folder

## Usage

### Basic Usage

1. Open SillyTavern settings
2. Navigate to Extensions
3. Enable "Static Image Panel"
4. Configure settings:
   - Select image from dropdown
   - Adjust panel width with slider
   - Enable auto-hide if desired

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+I` | Toggle panel visibility |

### Adding Custom Images

1. Place image files in `StaticImageExtension/assets/` folder
2. In extension settings, click "Add Custom Image"
3. Enter the path (e.g., `assets/myimage.png`)
4. Select from dropdown

## Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `enabled` | Boolean | `true` | Show/hide the panel |
| `imageUrl` | String | `assets/placeholder.svg` | Path to selected image |
| `panelWidth` | Number | `250` | Width in pixels (150-400) |
| `collapsed` | Boolean | `false` | Panel collapsed state |
| `autoHide` | Boolean | `false` | Hide panel when idle |
| `autoHideDelay` | Number | `30` | Seconds before auto-hide |
| `availableImages` | Array | `['assets/placeholder.svg']` | List of available images |

## File Structure

```
StaticImageExtension/
├── manifest.json           # Extension metadata
├── index.js                # Main extension logic
├── style.css               # Extension styles
├── settings.html           # Settings UI template
├── README.md               # This file
└── assets/
    └── placeholder.svg     # Default placeholder image
```

## Troubleshooting

### Panel not showing

1. Check if extension is enabled in settings
2. Verify `manifest.json` is valid JSON
3. Check browser console for errors

### Image not displaying

1. Verify image path is correct
2. Check image format (PNG, JPG, SVG supported)
3. Ensure image file exists in specified path

### Settings not saving

1. Check SillyTavern server is running
2. Verify `extensionSettings` object is accessible
3. Check browser console for errors

## Development

### Architecture

- Uses official SillyTavern `getContext()` API
- Settings stored in `extensionSettings[MODULE_NAME]`
- Event system via `eventSource.emit()` / `eventSource.on()`
- Cleanup handlers for proper lifecycle management

### API Usage

```javascript
// Get context
const { extensionSettings, saveSettingsDebounced, eventSource } = SillyTavern.getContext();

// Get settings
function getSettings() {
    if (!extensionSettings[MODULE_NAME]) {
        extensionSettings[MODULE_NAME] = structuredClone(defaultSettings);
    }
    return extensionSettings[MODULE_NAME];
}

// Save settings
saveSettingsDebounced();

// Emit events
await eventSource.emit('custom-event', { data });
```

## License

MIT

## Author

Your Name
