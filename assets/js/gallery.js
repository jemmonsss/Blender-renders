// Load configuration
let config = {};

async function loadConfig() {
    try {
        const response = await fetch('config.json');
        config = await response.json();
    } catch (error) {
        console.error('Error loading config:', error);
        // Use default config
        config = {
            watermark: {
                text: 'Your Name',
                opacity: 0.3,
                position: 'bottom-right',
                fontSize: '16px',
                color: '#ffffff'
            },
            gallery: {
                columns: 3,
                gap: '20px',
                borderRadius: '8px'
            },
            video: {
                autoplayMuted: true,
                showControls: true
            }
        };
    }
}

// Create watermark element
function createWatermark() {
    const watermark = document.createElement('div');
    watermark.className = `watermark ${config.watermark.position}`;
    watermark.textContent = config.watermark.text;
    watermark.style.opacity = config.watermark.opacity;
    watermark.style.fontSize = config.watermark.fontSize;
    watermark.style.color = config.watermark.color;
    return watermark;
}

// Check if video has audio
async function hasAudio(videoElement) {
    return new Promise((resolve) => {
        videoElement.addEventListener('loadedmetadata', () => {
            // Check if video has audio tracks
            if (videoElement.webkitAudioDecodedByteCount !== undefined) {
                resolve(videoElement.webkitAudioDecodedByteCount > 0);
            } else if (videoElement.mozHasAudio !== undefined) {
                resolve(videoElement.mozHasAudio);
            } else {
                // Fallback: assume it has audio if we can't detect
                resolve(true);
            }
        });
        
        // Timeout fallback
        setTimeout(() => resolve(true), 1000);
    });
}

// Create render item
function createRenderItem(src, type, filename) {
    const item = document.createElement('div');
    item.className = 'render-item';
    item.setAttribute('data-filename', filename.toLowerCase());
    
    const watermark = createWatermark();
    
    if (type === 'video') {
        const video = document.createElement('video');
        video.src = src;
        video.loop = true;
        video.muted = config.video.autoplayMuted;
        video.playsInline = true;
        
        if (config.video.showControls) {
            video.controls = true;
        }
        
        // Check for audio and set autoplay accordingly
        hasAudio(video).then(audio => {
            if (!audio) {
                video.autoplay = true;
                video.muted = true;
                video.play().catch(e => console.log('Autoplay prevented:', e));
            } else {
                video.autoplay = false;
                video.controls = true;
            }
        });
        
        item.appendChild(video);
    } else {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Blender render';
        img.loading = 'lazy';
        item.appendChild(img);
    }
    
    item.appendChild(watermark);
    return item;
}

// Toggle category collapse
function toggleCategory(element) {
    const categoryGrid = element.nextElementSibling;
    const isCollapsed = categoryGrid.classList.contains('collapsed');
    
    if (isCollapsed) {
        categoryGrid.classList.remove('collapsed');
        element.classList.remove('collapsed');
    } else {
        categoryGrid.classList.add('collapsed');
        element.classList.add('collapsed');
    }
}

// Check if a file exists by attempting to fetch it
async function fileExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Scan for files in a directory using common patterns
async function scanDirectory(path, maxFiles = 100) {
    const files = [];
    const extensions = ['.jpg', '.jpeg', '.png', '.mp4'];
    
    // Try numbered patterns: render1.jpg, render2.jpg, etc.
    for (let i = 1; i <= maxFiles; i++) {
        for (const ext of extensions) {
            const filename = `render${i}${ext}`;
            const url = `${path}/${filename}`;
            if (await fileExists(url)) {
                files.push(filename);
            }
        }
    }
    
    // Also try common naming patterns
    const commonNames = ['scene', 'shot', 'frame', 'final', 'render', 'output'];
    for (const name of commonNames) {
        for (let i = 1; i <= 20; i++) {
            for (const ext of extensions) {
                const filename = `${name}${i}${ext}`;
                const url = `${path}/${filename}`;
                if (await fileExists(url)) {
                    if (!files.includes(filename)) {
                        files.push(filename);
                    }
                }
            }
        }
    }
    
    return files;
}

// Recursively build category structure
async function buildCategoryStructure(path, level = 0) {
    const container = document.createElement('div');
    container.className = level > 0 ? 'subcategory' : 'category';
    
    // Try to scan for files in this directory
    const files = await scanDirectory(path);
    
    if (files.length > 0) {
        const grid = document.createElement('div');
        grid.className = 'gallery-grid';
        
        files.forEach(file => {
            const type = file.endsWith('.mp4') ? 'video' : 'image';
            const item = createRenderItem(`${path}/${file}`, type, file);
            grid.appendChild(item);
        });
        
        container.appendChild(grid);
    }
    
    return container;
}

// Filter renders based on search and category
function filterRenders() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const categories = document.querySelectorAll('.category');
    const noResults = document.getElementById('noResults');
    let hasVisibleResults = false;

    categories.forEach(category => {
        const categoryName = category.getAttribute('data-category');
        const renders = category.querySelectorAll('.render-item');
        let categoryHasVisibleRenders = false;

        // Check if category matches filter
        const categoryMatches = categoryFilter === 'all' || categoryFilter === categoryName;

        renders.forEach(render => {
            const filename = render.getAttribute('data-filename');
            const searchMatches = filename.includes(searchInput);

            // Show render if both category and search match
            if (categoryMatches && searchMatches) {
                render.style.display = 'block';
                categoryHasVisibleRenders = true;
                hasVisibleResults = true;
            } else {
                render.style.display = 'none';
            }
        });

        // Show/hide entire category based on whether it has visible renders
        if (categoryHasVisibleRenders) {
            category.style.display = 'block';
        } else {
            category.style.display = 'none';
        }
    });

    // Show "no results" message if nothing is visible
    if (hasVisibleResults) {
        if (noResults) noResults.style.display = 'none';
    } else {
        if (noResults) noResults.style.display = 'block';
    }
}

// Main function to build the gallery
async function buildGallery() {
    await loadConfig();
    
    const gallery = document.getElementById('gallery');
    const categoryFilter = document.getElementById('categoryFilter');
    gallery.innerHTML = '<div class="loading">Scanning for renders...</div>';
    
    try {
        // Define categories to scan
        const categories = ['characters', 'environments', 'objects', 'animations'];
        let hasAnyRenders = false;
        
        // Populate category filter dropdown
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categoryFilter.appendChild(option);
        });
        
        gallery.innerHTML = '';
        
        // Build gallery for each category
        for (const category of categories) {
            const categorySection = document.createElement('div');
            categorySection.className = 'category';
            categorySection.setAttribute('data-category', category);
            
            const title = document.createElement('h2');
            title.className = 'category-title';
            title.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            title.onclick = function() { toggleCategory(this); };
            categorySection.appendChild(title);
            
            const categoryContent = await buildCategoryStructure(`renders/${category}`, 1);
            categorySection.appendChild(categoryContent);
            
            // Only add category if it has renders
            if (categoryContent.querySelector('.render-item')) {
                gallery.appendChild(categorySection);
                hasAnyRenders = true;
            }
        }
        
        // Add no results message
        const noResults = document.createElement('div');
        noResults.id = 'noResults';
        noResults.className = 'no-results';
        noResults.style.display = 'none';
        noResults.textContent = 'No renders found. Try a different search or category.';
        gallery.appendChild(noResults);
        
        if (!hasAnyRenders) {
            gallery.innerHTML = '<div class="loading">No renders found. Add files to category folders with names like render1.jpg, render2.jpg, etc.</div>';
        }
        
    } catch (error) {
        console.error('Error building gallery:', error);
        gallery.innerHTML = '<div class="loading">Error loading gallery.</div>';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', buildGallery);
