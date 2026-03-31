/**
 * Static Side Image Extension
 * Displays a static image on the right side of SillyTavern
 */

// ========================================
// Configuration
// ========================================
const CONFIG = {
    DEFAULT_PANEL_WIDTH: 250,
    DEFAULT_TAB_WIDTH: 50,
    DEFAULT_VISIBLE: true,
    DEFAULT_DISPLAY_ENABLED: true,
    IMAGES_FOLDER: 'assets/images/',
    PLACEHOLDER_IMAGE: 'assets/placeholder.png'
};

// ========================================
// State Management
// ========================================
let state = {
    isVisible: CONFIG.DEFAULT_VISIBLE,
    isDisplayEnabled: CONFIG.DEFAULT_DISPLAY_ENABLED,
    currentImage: null,
    images: [],
    fileSystemHandle: null
};

// ========================================
// File System Manager
// ========================================
class FileSystemManager {
    async requestAccess() {
        try {
            // Get the extension root directory
            const rootHandle = await window.showDirectoryPicker({
                mode: 'readwrite'
            });
            
            // Navigate to assets/images folder
            const assetsHandle = await rootHandle.getDirectoryHandle('assets', { create: true });
            const imagesHandle = await assetsHandle.getDirectoryHandle('images', { create: true });
            
            state.fileSystemHandle = imagesHandle;
            return true;
        } catch (error) {
            console.error('[StaticImageExtension] File System Access failed:', error);
            return false;
        }
    }

    async listImages() {
        if (!state.fileSystemHandle) {
            return [];
        }

        const images = [];
        for await (const entry of state.fileSystemHandle.values()) {
            if (entry.kind === 'file') {
                const fileName = entry.name.toLowerCase();
                if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || 
                    fileName.endsWith('.jpeg') || fileName.endsWith('.webp')) {
                    images.push({
                        name: entry.name,
                        handle: entry
                    });
                }
            }
        }
        return images;
    }

    async uploadImage(file) {
        if (!state.fileSystemHandle) {
            throw new Error('File system access not granted');
        }

        try {
            const fileHandle = await state.fileSystemHandle.getFileHandle(file.name, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(file);
            await writable.close();
            return true;
        } catch (error) {
            console.error('[StaticImageExtension] Upload failed:', error);
            return false;
        }
    }

    async getImageUrl(handle) {
        try {
            const file = await handle.getFile();
            return URL.createObjectURL(file);
        } catch (error) {
            console.error('[StaticImageExtension] Get image URL failed:', error);
            return null;
        }
    }
}

// ========================================
// UI Manager
// ========================================
class UIManager {
    constructor() {
        this.panel = null;
        this.tab = null;
        this.settingsButton = null;
        this.imageElement = null;
    }

    createPanel() {
        this.panel = document.createElement('div');
        this.panel.className = 'static-image-panel';
        
        this.imageElement = document.createElement('img');
        this.imageElement.alt = 'Static side image';
        this.imageElement.src = CONFIG.PLACEHOLDER_IMAGE;
        
        this.panel.appendChild(this.imageElement);
        document.body.appendChild(this.panel);
    }

    createTab() {
        this.tab = document.createElement('div');
        this.tab.className = 'static-image-tab';
        
        const tabImage = document.createElement('img');
        tabImage.alt = 'Toggle image panel';
        tabImage.src = CONFIG.PLACEHOLDER_IMAGE;
        
        this.tab.appendChild(tabImage);
        this.tab.addEventListener('click', () => this.toggleVisibility());
        
        document.body.appendChild(this.tab);
        return tabImage;
    }

    createSettingsButton() {
        this.settingsButton = document.createElement('button');
        this.settingsButton.className = 'static-image-settings';
        this.settingsButton.innerHTML = '&#9881;'; // Gear icon
        this.settingsButton.title = 'Image Settings';
        this.settingsButton.addEventListener('click', () => {
            settingsManager.showModal();
        });
        
        if (this.panel) {
            this.panel.appendChild(this.settingsButton);
        }
    }

    toggleVisibility() {
        state.isVisible = !state.isVisible;
        this.updateVisibility();
    }

    updateVisibility() {
        if (state.isDisplayEnabled) {
            if (state.isVisible) {
                if (this.panel) this.panel.style.display = 'block';
                if (this.tab) this.tab.style.display = 'none';
            } else {
                if (this.panel) this.panel.style.display = 'none';
                if (this.tab) this.tab.style.display = 'block';
            }
        } else {
            if (this.panel) this.panel.style.display = 'none';
            if (this.tab) this.tab.style.display = 'none';
        }
    }

    updateImage(src) {
        if (this.imageElement) {
            this.imageElement.src = src;
        }
        // Also update tab image if it exists
        const tabImg = this.tab?.querySelector('img');
        if (tabImg) {
            tabImg.src = src;
        }
    }
}

// ========================================
// Settings Manager
// ========================================
class SettingsManager {
    constructor() {
        this.modal = null;
        this.overlay = null;
    }

    async showModal() {
        this.createModal();
        await this.populateDropdown();
        this.attachEventListeners();
    }

    createModal() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'static-image-modal-overlay';
        
        // Create modal
        this.modal = document.createElement('div');
        this.modal.className = 'static-image-modal';
        
        this.modal.innerHTML = `
            <div class="static-image-modal-header">
                <span class="static-image-modal-title">Static Image Settings</span>
                <button class="static-image-modal-close">&times;</button>
            </div>
            
            <div class="static-image-form-group">
                <label class="static-image-form-label">Select Image</label>
                <select class="static-image-dropdown" id="static-image-select">
                    <option value="">-- No images available --</option>
                </select>
            </div>
            
            <div class="static-image-form-group">
                <label class="static-image-form-label">Upload Image</label>
                <div class="static-image-upload-area" id="static-image-drop">
                    <p>Drag and drop an image here, or click to select</p>
                    <input type="file" id="static-image-file" accept="image/*" style="display: none;">
                </div>
            </div>
            
            <div class="static-image-form-group">
                <div class="static-image-toggle-container">
                    <label class="static-image-form-label">Enable Display</label>
                    <label class="static-image-toggle-switch">
                        <input type="checkbox" id="static-image-toggle" ${state.isDisplayEnabled ? 'checked' : ''}>
                        <span class="static-image-toggle-slider"></span>
                    </label>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.modal);
    }

    async populateDropdown() {
        const dropdown = this.modal.querySelector('#static-image-select');
        dropdown.innerHTML = '';
        
        state.images = await fileSystemManager.listImages();
        
        if (state.images.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '-- No images available --';
            dropdown.appendChild(option);
            return;
        }
        
        for (const image of state.images) {
            const option = document.createElement('option');
            option.value = image.name;
            option.textContent = image.name;
            dropdown.appendChild(option);
        }
        
        // Set current selection
        if (state.currentImage) {
            dropdown.value = state.currentImage.name;
        }
    }

    attachEventListeners() {
        // Close button
        const closeBtn = this.modal.querySelector('.static-image-modal-close');
        closeBtn.addEventListener('click', () => this.closeModal());
        
        // Overlay click to close
        this.overlay.addEventListener('click', () => this.closeModal());
        
        // Image selection change
        const dropdown = this.modal.querySelector('#static-image-select');
        dropdown.addEventListener('change', async (e) => {
            const imageName = e.target.value;
            if (imageName) {
                const image = state.images.find(img => img.name === imageName);
                if (image) {
                    const url = await fileSystemManager.getImageUrl(image.handle);
                    if (url) {
                        uiManager.updateImage(url);
                        state.currentImage = image;
                    }
                }
            }
        });
        
        // Upload area click
        const dropArea = this.modal.querySelector('#static-image-drop');
        const fileInput = this.modal.querySelector('#static-image-file');
        
        dropArea.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this.handleUpload(file);
            }
        });
        
        // Drag and drop
        dropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropArea.classList.add('drag-over');
        });
        
        dropArea.addEventListener('dragleave', () => {
            dropArea.classList.remove('drag-over');
        });
        
        dropArea.addEventListener('drop', async (e) => {
            e.preventDefault();
            dropArea.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                await this.handleUpload(file);
            }
        });
        
        // Toggle switch
        const toggle = this.modal.querySelector('#static-image-toggle');
        toggle.addEventListener('change', (e) => {
            state.isDisplayEnabled = e.target.checked;
            uiManager.updateVisibility();
        });
    }

    async handleUpload(file) {
        const success = await fileSystemManager.uploadImage(file);
        if (success) {
            alert('Image uploaded successfully!');
            await this.populateDropdown();
        } else {
            alert('Failed to upload image. Please try again.');
        }
    }

    closeModal() {
        if (this.modal) this.modal.remove();
        if (this.overlay) this.overlay.remove();
        this.modal = null;
        this.overlay = null;
    }
}

// ========================================
// Initialization
// ========================================
const fileSystemManager = new FileSystemManager();
const uiManager = new UIManager();
const settingsManager = new SettingsManager();

async function init() {
    console.log('[StaticImageExtension] Initializing...');
    
    // Request file system access
    const fsAccess = await fileSystemManager.requestAccess();
    if (!fsAccess) {
        console.warn('[StaticImageExtension] File system access not available. Images must be placed manually in assets/images/');
    }
    
    // Create UI elements
    uiManager.createPanel();
    const tabImage = uiManager.createTab();
    uiManager.createSettingsButton();
    
    // Load images and set default
    if (fsAccess) {
        state.images = await fileSystemManager.listImages();
        if (state.images.length > 0) {
            state.currentImage = state.images[0];
            const url = await fileSystemManager.getImageUrl(state.currentImage.handle);
            if (url) {
                uiManager.updateImage(url);
            }
        }
    }
    
    // Set initial visibility
    uiManager.updateVisibility();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for potential external use
export { CONFIG, state, fileSystemManager, uiManager, settingsManager };
