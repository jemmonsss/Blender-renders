# Blender Renders Gallery

A fully automated GitHub Pages site for displaying Blender renders with watermarks and smart video autoplay.

## Features

- **Auto-categorization**: Folders in `renders/` become categories automatically
- **Zero scripts**: No Python scripts or data.json files needed - JavaScript auto-detects files
- **Smart video autoplay**: Detects audio track, mutes/autoplays if silent, shows controls if audio
- **Configurable watermark**: Name/text set in config.json, adjustable opacity/position
- **Zero maintenance**: Just add files to folders and push to GitHub
- **Grid layout**: Clean, responsive grid matching modern design
- **No metadata display**: Just the visual content

## Setup

1. **Configure your settings**
   Edit `config.json` to set your watermark text and preferences:
   ```json
   {
     "watermark": {
       "text": "Your Name",
       "opacity": 0.3,
       "position": "bottom-right"
     }
   }
   ```

2. **Add your renders**
   - Create folders in `renders/` for each category (e.g., `characters/`, `environments/`)
   - Name your files using common patterns: `render1.jpg`, `render2.jpg`, `scene1.mp4`, etc.
   - Add your JPEG/PNG images and MP4 videos to these folders

3. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add new renders"
   git push
   ```

4. **Enable GitHub Pages**
   - Go to your repository Settings
   - Navigate to Pages
   - Source: GitHub Actions
   - The workflow will automatically build and deploy

**That's it!** No scripts needed - JavaScript automatically detects your files.

## File Naming

The gallery automatically detects files with these naming patterns:
- `render1.jpg`, `render2.jpg`, `render3.jpg`, etc.
- `scene1.jpg`, `scene2.jpg`, etc.
- `shot1.mp4`, `shot2.mp4`, etc.
- `frame1.png`, `frame2.png`, etc.
- `final1.jpg`, `final2.jpg`, etc.
- `output1.mp4`, `output2.mp4`, etc.

Supported extensions: `.jpg`, `.jpeg`, `.png`, `.mp4`

## Folder Structure

```
/
├── _config.yml          # Jekyll config
├── config.json          # Your settings (watermark, etc.)
├── index.html           # Main gallery page
├── assets/
│   ├── css/
│   │   └── style.css    # Grid layout, watermark styles
│   └── js/
│       └── gallery.js   # Gallery logic (auto-detects files)
├── renders/             # Add your renders here
│   ├── characters/      # Category folder
│   │   ├── render1.jpg
│   │   ├── render2.jpg
│   │   └── animation1.mp4
│   └── environments/    # Another category
│       ├── scene1.jpg
│       └── scene2.jpg
└── .github/
    └── workflows/
        └── build.yml    # Auto-build on push
```

## Adding New Renders

1. Name your files using the patterns above (e.g., `render3.jpg`)
2. Put files in the appropriate category folder in `renders/`
3. Commit and push to GitHub

**No scripts, no data.json editing - just add files and push!**

## Watermark Options

Edit `config.json` to customize:
- `text`: Your name or watermark text
- `opacity`: 0.0 to 1.0 (transparency)
- `position`: "bottom-right", "bottom-left", "top-right", "top-left"
- `fontSize`: Size in pixels
- `color`: Hex color code

## Video Behavior

Videos without audio will autoplay muted. Videos with audio will show controls and require user interaction to play.

## License

Free to use for your personal Blender renders gallery.
