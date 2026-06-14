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
            },
            lightbox: {
                enabled: true,
                modal: {
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    borderRadius: '12px',
                    border: 'none',
                    animation: 'fade',
                    animationDuration: '0.3s'
                },
                closeButton: {
                    enabled: true,
                    position: 'top-right',
                    size: '32px',
                    color: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    hoverColor: '#c77dff'
                },
                video: {
                    autoplay: true,
                    loop: true,
                    controls: true
                },
                watermark: {
                    enabled: true,
                    text: 'Your Name',
                    opacity: 0.3,
                    position: 'bottom-right',
                    fontSize: '20px',
                    color: '#ffffff'
                }
            },
            preloading: {
                enabled: true,
                showLoadingScreen: true,
                allowSkip: true,
                skipButtonText: 'Skip Loading',
                loadingText: 'Loading renders...'
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
    
    // Add click handler for lightbox
    if (config.lightbox && config.lightbox.enabled) {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => openLightbox(src, type));
    }
    
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

// Lightbox functionality
let lightboxModal = null;
let lightboxContent = null;

function createLightboxModal() {
    const modal = document.createElement('div');
    modal.className = 'lightbox-modal';
    modal.id = 'lightboxModal';
    
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.addEventListener('click', closeLightbox);
    
    const content = document.createElement('div');
    content.className = 'lightbox-content';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'lightbox-close';
    closeButton.innerHTML = '×';
    closeButton.addEventListener('click', closeLightbox);
    
    const mediaContainer = document.createElement('div');
    mediaContainer.className = 'lightbox-media';
    
    content.appendChild(closeButton);
    content.appendChild(mediaContainer);
    modal.appendChild(overlay);
    modal.appendChild(content);
    
    document.body.appendChild(modal);
    
    lightboxModal = modal;
    lightboxContent = mediaContainer;
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxModal) {
            closeLightbox();
        }
    });
}

function openLightbox(src, type) {
    if (!lightboxModal) {
        createLightboxModal();
    }
    
    lightboxContent.innerHTML = '';
    
    const lbConfig = config.lightbox;
    const modalConfig = lbConfig.modal;
    const closeConfig = lbConfig.closeButton;
    const videoConfig = lbConfig.video;
    const watermarkConfig = lbConfig.watermark;
    
    // Apply modal styles from config
    lightboxModal.querySelector('.lightbox-content').style.maxWidth = modalConfig.maxWidth;
    lightboxModal.querySelector('.lightbox-content').style.maxHeight = modalConfig.maxHeight;
    lightboxModal.querySelector('.lightbox-overlay').style.backgroundColor = modalConfig.backgroundColor;
    lightboxModal.querySelector('.lightbox-content').style.borderRadius = modalConfig.borderRadius;
    lightboxModal.querySelector('.lightbox-content').style.border = modalConfig.border;
    
    // Apply close button styles
    const closeButton = lightboxModal.querySelector('.lightbox-close');
    if (closeConfig.enabled) {
        closeButton.style.display = 'flex';
        closeButton.style.width = closeConfig.size;
        closeButton.style.height = closeConfig.size;
        closeButton.style.color = closeConfig.color;
        closeButton.style.backgroundColor = closeConfig.backgroundColor;
        closeButton.style.fontSize = `calc(${closeConfig.size} * 0.8)`;
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.backgroundColor = closeConfig.hoverColor;
        });
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.backgroundColor = closeConfig.backgroundColor;
        });
    } else {
        closeButton.style.display = 'none';
    }
    
    // Create media element
    if (type === 'video') {
        const video = document.createElement('video');
        video.src = src;
        video.loop = videoConfig.loop;
        video.controls = videoConfig.controls;
        video.autoplay = videoConfig.autoplay;
        video.playsInline = true;
        video.style.maxWidth = '100%';
        video.style.maxHeight = '100%';
        video.style.objectFit = 'contain';
        lightboxContent.appendChild(video);
        
        if (videoConfig.autoplay) {
            video.play().catch(e => console.log('Autoplay prevented:', e));
        }
    } else {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Blender render';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'contain';
        lightboxContent.appendChild(img);
    }
    
    // Add watermark to lightbox if enabled
    if (watermarkConfig.enabled) {
        const watermark = document.createElement('div');
        watermark.className = `watermark lightbox-watermark ${watermarkConfig.position}`;
        watermark.textContent = watermarkConfig.text;
        watermark.style.opacity = watermarkConfig.opacity;
        watermark.style.fontSize = watermarkConfig.fontSize;
        watermark.style.color = watermarkConfig.color;
        lightboxContent.appendChild(watermark);
    }
    
    // Apply animation
    lightboxModal.style.animation = `lightbox-${modalConfig.animation}In ${modalConfig.animationDuration} ease-out`;
    lightboxModal.style.display = 'flex';
}

function closeLightbox() {
    if (!lightboxModal) return;
    
    const lbConfig = config.lightbox;
    const modalConfig = lbConfig.modal;
    
    lightboxModal.style.animation = `lightbox-${modalConfig.animation}Out ${modalConfig.animationDuration} ease-in`;
    
    setTimeout(() => {
        lightboxModal.style.display = 'none';
        lightboxContent.innerHTML = '';
        
        // Stop any playing videos
        const video = lightboxContent.querySelector('video');
        if (video) {
            video.pause();
        }
    }, parseFloat(modalConfig.animationDuration) * 1000);
}

// Recursively build category structure
function buildCategoryStructure(data, parentPath = 'renders', level = 0) {
    const container = document.createElement('div');
    container.className = level > 0 ? 'subcategory' : 'category';
    
    for (const [key, value] of Object.entries(data)) {
        if (key === '_files') {
            // This is a list of files
            const grid = document.createElement('div');
            grid.className = 'gallery-grid';
            
            value.forEach(file => {
                const type = file.endsWith('.mp4') ? 'video' : 'image';
                const item = createRenderItem(`${parentPath}/${file}`, type, file);
                grid.appendChild(item);
            });
            
            container.appendChild(grid);
        } else {
            // This is a subcategory
            const subcategorySection = document.createElement('div');
            subcategorySection.className = level > 0 ? 'subcategory-section' : 'category-section';
            
            const title = document.createElement('h3');
            title.className = level > 0 ? 'subcategory-title' : 'category-title';
            title.textContent = key.charAt(0).toUpperCase() + key.slice(1);
            title.onclick = function() { toggleCategory(this); };
            subcategorySection.appendChild(title);
            
            const subContent = buildCategoryStructure(value, `${parentPath}/${key}`, level + 1);
            subcategorySection.appendChild(subContent);
            
            container.appendChild(subcategorySection);
        }
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

// Load renders from data.json
async function loadRendersFromData() {
    try {
        const response = await fetch('renders/data.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading renders data:', error);
        return {};
    }
}

// Collect all category names (including subcategories)
function collectCategoryNames(data, prefix = '') {
    const names = [];
    
    for (const [key, value] of Object.entries(data)) {
        if (key !== '_files') {
            const fullName = prefix ? `${prefix}/${key}` : key;
            names.push(fullName);
            if (typeof value === 'object' && value !== null) {
                names.push(...collectCategoryNames(value, fullName));
            }
        }
    }
    
    return names;
}

// Collect all image/video URLs from data
function collectAllUrls(data, parentPath = 'renders') {
    const urls = [];
    
    for (const [key, value] of Object.entries(data)) {
        if (key === '_files') {
            value.forEach(file => {
                urls.push(`${parentPath}/${file}`);
            });
        } else if (typeof value === 'object' && value !== null) {
            urls.push(...collectAllUrls(value, `${parentPath}/${key}`));
        }
    }
    
    return urls;
}

// Preload images
function preloadImages(urls) {
    return new Promise((resolve) => {
        let loaded = 0;
        const total = urls.length;
        
        if (total === 0) {
            resolve();
            return;
        }
        
        urls.forEach(url => {
            const img = new Image();
            img.onload = () => {
                loaded++;
                updateLoadingProgress(loaded, total);
                if (loaded === total) resolve();
            };
            img.onerror = () => {
                loaded++;
                updateLoadingProgress(loaded, total);
                if (loaded === total) resolve();
            };
            img.src = url;
        });
    });
}

// Show loading screen
function showLoadingScreen() {
    const preloadConfig = config.preloading;
    
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loadingScreen';
    loadingScreen.className = 'loading-screen';
    
    const loadingContent = document.createElement('div');
    loadingContent.className = 'loading-content';
    
    const loadingText = document.createElement('div');
    loadingText.className = 'loading-text';
    loadingText.textContent = preloadConfig.loadingText;
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressFill.id = 'progressFill';
    progressFill.style.width = '0%';
    
    progressBar.appendChild(progressFill);
    
    loadingContent.appendChild(loadingText);
    loadingContent.appendChild(progressBar);
    
    if (preloadConfig.allowSkip) {
        const skipButton = document.createElement('button');
        skipButton.className = 'skip-button';
        skipButton.textContent = preloadConfig.skipButtonText;
        skipButton.addEventListener('click', () => {
            loadingScreen.remove();
            window.skipPreloading = true;
        });
        loadingContent.appendChild(skipButton);
    }
    
    loadingScreen.appendChild(loadingContent);
    document.body.appendChild(loadingScreen);
}

// Update loading progress
function updateLoadingProgress(loaded, total) {
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        const percentage = (loaded / total) * 100;
        progressFill.style.width = `${percentage}%`;
    }
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => loadingScreen.remove(), 300);
    }
}

// Main function to build the gallery
async function buildGallery() {
    await loadConfig();
    
    const gallery = document.getElementById('gallery');
    const categoryFilter = document.getElementById('categoryFilter');
    gallery.innerHTML = '';
    
    try {
        // Load from data.json
        const rendersData = await loadRendersFromData();
        
        if (Object.keys(rendersData).length > 0) {
            // Preload images if enabled
            const preloadConfig = config.preloading;
            if (preloadConfig && preloadConfig.enabled) {
                const urls = collectAllUrls(rendersData);
                const imageUrls = urls.filter(url => url.match(/\.(jpg|jpeg|png)$/i));
                
                if (preloadConfig.showLoadingScreen && imageUrls.length > 0) {
                    showLoadingScreen();
                    window.skipPreloading = false;
                    await preloadImages(imageUrls);
                    if (!window.skipPreloading) {
                        hideLoadingScreen();
                    } else {
                        const loadingScreen = document.getElementById('loadingScreen');
                        if (loadingScreen) loadingScreen.remove();
                    }
                } else {
                    await preloadImages(imageUrls);
                }
            }
            
            // Populate category filter dropdown with all categories and subcategories
            const allCategories = collectCategoryNames(rendersData);
            allCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                // Format: "characters" or "characters/human"
                const displayParts = category.split('/');
                const displayText = displayParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' / ');
                option.textContent = displayText;
                categoryFilter.appendChild(option);
            });
            
            // Build gallery with nested structure
            for (const [category, content] of Object.entries(rendersData)) {
                const categorySection = document.createElement('div');
                categorySection.className = 'category';
                categorySection.setAttribute('data-category', category);
                
                const title = document.createElement('h2');
                title.className = 'category-title';
                title.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                title.onclick = function() { toggleCategory(this); };
                categorySection.appendChild(title);
                
                const categoryContent = buildCategoryStructure(content, `renders/${category}`, 1);
                categorySection.appendChild(categoryContent);
                
                gallery.appendChild(categorySection);
            }
            
            // Add no results message
            const noResults = document.createElement('div');
            noResults.id = 'noResults';
            noResults.className = 'no-results';
            noResults.style.display = 'none';
            noResults.textContent = 'No renders found. Try a different search or category.';
            gallery.appendChild(noResults);
            
        } else {
            gallery.innerHTML = '<div class="loading">No renders found. Add renders to the renders/ folder and GitHub Actions will auto-update data.json</div>';
        }
    } catch (error) {
        console.error('Error building gallery:', error);
        gallery.innerHTML = '<div class="loading">Error loading gallery. Make sure renders/data.json exists.</div>';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', buildGallery);
