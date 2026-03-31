# Static Image Extension for SillyTavern

A simple SillyTavern extension that displays a static image on the side of the screen.

## Features

- Displays a static image in a side panel
- Configurable position (left or right side)
- Adjustable panel width
- Toggle/close button to hide the panel
- Customizable image path

## Installation

1. Copy the `StaticImageExtension` folder to your SillyTavern extensions directory:
   ```
   data/<user-handle>/extensions/StaticImageExtension/
   ```

2. Restart SillyTavern or reload the page

3. Enable the extension in Settings → Extensions

## Configuration

The extension supports the following settings:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `imagePath` | string | `assets/placeholder.png` | Path to the static image to display |
| `position` | string | `right` | Position of the panel (`right` or `left`) |
| `width` | number | `300` | Width of the panel in pixels |
| `showCloseButton` | boolean | `true` | Whether to show a close button |

## Usage

Once enabled, the extension will automatically display the configured image in a side panel. You can:

- Click the **×** button to hide/show the panel
- Change settings in the extension settings panel
- Replace the placeholder image with your own

## File Structure

```
StaticImageExtension/
├── manifest.json          # Extension metadata and configuration
├── index.js               # Main JavaScript logic
├── style.css              # CSS styles
├── assets/
│   └── placeholder.png    # Default placeholder image
└── README.md              # This file
```

## Customization

### Changing the Image

1. Replace `assets/placeholder.png` with your own image
2. Or update the `imagePath` setting to point to a different image

### Styling

Modify `style.css` to customize:
- Panel colors and borders
- Animation effects
- Responsive behavior

## Troubleshooting

**Image not loading?**
- Check that the image path is correct
- Ensure the image file exists
- Check browser console for errors

**Panel not appearing?**
- Verify the extension is enabled
- Check for JavaScript errors in the console
- Ensure SillyTavern version is >= 1.0.0

## License

MIT
