# Dynamic Wallpaper Manager - GNOME Extension

A GNOME Shell extension that automatically fetches and rotates wallpapers from configurable APIs.

## Features

- **Automatic Wallpaper Rotation**: Configurable intervals for wallpaper changes
- **API Integration**: Fetch wallpapers from any REST API
- **Background Operation**: Runs silently in the background
- **System Integration**: Native GNOME Shell integration
- **Notifications**: Optional wallpaper change notifications
- **Caching**: Intelligent wallpaper caching system

## Installation

### Method 1: Manual Installation

1. Copy the extension to your local extensions directory:
   ```bash
   cp -r dynamic-wallpaper-manager@yourname.github.io ~/.local/share/gnome-shell/extensions/
   ```

2. Compile the settings schema:
   ```bash
   glib-compile-schemas ~/.local/share/gnome-shell/extensions/dynamic-wallpaper-manager@yourname.github.io/schemas/
   ```

3. Restart GNOME Shell:
   - Press `Alt+F2`
   - Type `r` and press Enter
   - Or log out and log back in

4. Enable the extension:
   ```bash
   gnome-extensions enable dynamic-wallpaper-manager@yourname.github.io
   ```

### Method 2: Using the install script

```bash
chmod +x install.sh
./install.sh
```

## Configuration

Open the extension settings:
```bash
gnome-extensions prefs dynamic-wallpaper-manager@yourname.github.io
```

Configure:
- **API URL**: Your wallpaper API endpoint
- **Refresh Interval**: Minutes between wallpaper changes
- **Show Notifications**: Enable/disable change notifications
- **Auto Start**: Automatically start rotation on login

## API Format

Your API should return JSON with wallpaper data:

```json
[
  {
    "image_url": "https://example.com/image.jpg",
    "title": "Beautiful Sunset",
    "captured_by": "John Doe",
    "captured_at": "2024-01-15",
    "location": "California, USA",
    "more_info_link": "https://example.com/info"
  }
]
```

## Usage

1. Click the wallpaper icon in the top panel
2. Select "Settings" to configure your API
3. Click "Refresh from API" to fetch wallpapers
4. Click "Start Rotation" to begin automatic changes

## Troubleshooting

- Check the extension is enabled: `gnome-extensions list --enabled`
- View logs: `journalctl -f -o cat /usr/bin/gnome-shell`
- Reset settings: `dconf reset -f /org/gnome/shell/extensions/dynamic-wallpaper-manager/`

## Development

To modify the extension:

1. Edit the source files
2. Reload GNOME Shell (`Alt+F2`, type `r`)
3. Or restart the extension:
   ```bash
   gnome-extensions disable dynamic-wallpaper-manager@yourname.github.io
   gnome-extensions enable dynamic-wallpaper-manager@yourname.github.io
   ```
