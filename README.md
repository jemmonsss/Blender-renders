# Blender Renders Gallery

A fully automated GitHub Pages site for displaying Blender renders with watermarks and smart video autoplay.

## Features

- **Auto-categorization**: Folders in `renders/` become categories automatically
- **Subcategories**: Support for nested folder structures (e.g., `characters/human/`, `characters/creature/`)
- **Smart video autoplay**: Detects audio track, mutes/autoplays if silent, shows controls if audio
- **Configurable watermark**: Name/text set in config.json, adjustable opacity/position
- **Zero maintenance**: Just add files to folders and push to GitHub - GitHub Actions auto-updates data.json
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
   - Create subfolders for subcategories (e.g., `characters/human/`, `characters/creature/`)
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

**That's it!** GitHub Actions will automatically scan your renders folder, update data.json, and deploy your site.

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
│       └── gallery.js   # Gallery logic
├── renders/             # Add your renders here
│   ├── data.json        # Auto-updated by GitHub Actions
│   ├── characters/      # Category folder
│   │   ├── human/       # Subcategory
│   │   │   ├── render1.jpg
│   │   │   └── animation1.mp4
│   │   └── creature/    # Another subcategory
│   │       └── render2.jpg
│   └── environments/    # Another category
│       └── scene1.jpg
└── .github/
    └── workflows/
        └── build.yml    # Auto-rebuild and update data.json
```

## Adding New Renders

1. Put files in the appropriate category/subcategory folder in `renders/`
2. Commit and push to GitHub
3. GitHub Actions will automatically:
   - Scan the renders folder (including subdirectories)
   - Update data.json with new files
   - Build and deploy the site

**No manual data.json editing required!**

## Subcategories

You can create nested folder structures for better organization:
- `renders/characters/human/` - Human character renders
- `renders/characters/creature/` - Creature renders
- `renders/environments/indoor/` - Indoor environments
- `renders/environments/outdoor/` - Outdoor environments

The gallery will automatically detect and display these as collapsible subcategories with proper indentation.

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
