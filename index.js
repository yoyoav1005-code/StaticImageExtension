// The main script for the Static Image Extension
// Uses SillyTavern's official extension API

// Import required functions from SillyTavern's core
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

// Extension identification - name should match folder name
const extensionName = "StaticImageExtension";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const extensionSettings = extension_settings[extensionName];

// Default settings for the extension
const defaultSettings = {
    enabled: true,
    imageUrl: 'assets/placeholder.png',
    panelWidth: 250,
    collapsed: false,
    autoHide: false,
    autoHideDelay: 30,
    availableImages: ['assets/placeholder.png'],
};

// State variables
let idleTimer = null;

/**
 * Load extension settings from SillyTavern
 */
async function loadSettings() {
    // Create the settings if they don't exist
    extension_settings[extensionName] = extension_settings[extensionName] || {};
    
    // If settings are empty, initialize with defaults
    if (Object.keys(extension_settings[extensionName]).length === 0) {
        Object.assign(extension_settings[extensionName], defaultSettings);
    }
    
    // Ensure all default keys exist (helpful after updates)
    for (const key of Object.keys(defaultSettings)) {
        if (!Object.hasOwn(extension_settings[extensionName], key)) {
            extension_settings[extensionName][key] = defaultSettings[key];
        }
    }
}

/**
 * Get current settings
 * @returns {Object} Settings object
 */
function getSettings() {
    return extension_settings[extensionName];
}

/**
 * Build the settings panel HTML
 * @returns {string} Settings HTML
 */
function buildSettingsPanel() {
    const settings = getSettings();
    
    return `
        <div class="setting-group">
            <label class="setting-label">
                <input type="checkbox" id="static_image_enabled" ${settings.enabled ? 'checked' : ''}>
                Enable Static Image Panel
            </label>
        </div>
        
        <div class="setting-group">
            <label for="static_image_url">Image Source:</label>
            <select id="static_image_url" class="setting-control">
                ${settings.availableImages.map(img => 
                    `<option value="${img}" ${settings.imageUrl === img ? 'selected' : ''}>${img.split('/').pop()}</option>`
                ).join('')}
            </select>
        </div>
        
        <div class="setting-group">
            <label for="static_image_width">Panel Width: <span id="static_image_width_value">${settings.panelWidth}px</span></label>
            <input type="range" id="static_image_width" class="setting-control" 
                   min="150" max="400" value="${settings.panelWidth}">
        </div>
        
        <div class="setting-group">
            <label class="setting-label">
                <input type="checkbox" id="static_image_collapsed" ${settings.collapsed ? 'checked' : ''}>
                Start Collapsed
            </label>
        </div>
        
        <div class="setting-group">
            <label class="setting-label">
                <input type="checkbox" id="static_image_autohide" ${settings.autoHide ? 'checked' : ''}>
                Auto-hide when idle
            </label>
        </div>
        
        <div class="setting-group" id="static_image_delay_group" style="${settings.autoHide ? '' : 'display:none'}">
            <label for="static_image_delay">Hide After (seconds):</label>
            <input type="number" id="static_image_delay" class="setting-control" 
                   min="5" max="300" value="${settings.autoHideDelay}">
        </div>
        
        <div class="setting-group">
            <button id="static_image_add_image" class="setting-btn">Add Custom Image</button>
            <small class="setting-hint">Add image path (e.g., assets/myimage.png)</small>
        </div>
    `;
}

/**
 * Build the panel HTML
 * @returns {jQuery} Panel element
 */
function buildPanel() {
    const settings = getSettings();
    
    const panel = $(`
        <div id="static_image_panel" class="static-image-panel" style="width: ${settings.panelWidth}px">
            <div class="panel-header">
                <span class="panel-title">Static Image</span>
                <button class="panel-collapse-btn" id="static_image_collapse_btn">−</button>
            </div>
            <div class="panel-content">
                <img id="static_image_panel_img" src="${settings.imageUrl}" alt="Static Image">
            </div>
        </div>
    `);
    
    return panel;
}

/**
 * Update panel image
 */
function updatePanelImage() {
    const settings = getSettings();
    const img = $('#static_image_panel_img');
    
    if (img.length) {
        img.fadeOut(100, () => {
            img.attr('src', settings.imageUrl).fadeIn(200);
        });
    }
}

/**
 * Update panel width
 * @param {number} width - New width in pixels
 */
function updatePanelWidth(width) {
    const settings = getSettings();
    settings.panelWidth = Math.max(150, Math.min(400, width));
    saveSettingsDebounced();
    
    $('#static_image_panel').css('width', settings.panelWidth + 'px');
    $('#static_image_width_value').text(settings.panelWidth + 'px');
}

/**
 * Toggle panel collapsed state
 * @param {boolean} collapsed - Collapsed state
 */
function togglePanelCollapsed(collapsed) {
    const settings = getSettings();
    settings.collapsed = collapsed;
    saveSettingsDebounced();
    
    const panel = $('#static_image_panel');
    const content = panel.find('.panel-content');
    
    if (collapsed) {
        panel.addClass('collapsed');
        content.hide();
    } else {
        panel.removeClass('collapsed');
        content.show();
    }
}

/**
 * Start auto-hide timer
 */
function startIdleTimer() {
    const settings = getSettings();
    
    if (!settings.autoHide) return;
    
    clearTimeout(idleTimer);
    
    idleTimer = setTimeout(() => {
        if (!settings.collapsed) {
            togglePanelCollapsed(true);
        }
    }, settings.autoHideDelay * 1000);
}

/**
 * Reset auto-hide timer
 */
function resetIdleTimer() {
    const settings = getSettings();
    
    if (!settings.autoHide) return;
    
    clearTimeout(idleTimer);
    idleTimer = null;
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    $(document).on('keydown.static-image-extension', (e) => {
        // Ctrl+Shift+I to toggle panel
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            const settings = getSettings();
            settings.enabled = !settings.enabled;
            saveSettingsDebounced();
            
            if (settings.enabled) {
                $('#static_image_panel').fadeIn(200);
            } else {
                $('#static_image_panel').fadeOut(200);
            }
        }
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    const { eventSource, event_types } = getContext();
    
    // Panel collapse button
    $('#static_image_collapse_btn').on('click', function() {
        const settings = getSettings();
        togglePanelCollapsed(!settings.collapsed);
    });
    
    // Width slider
    $('#static_image_width').on('input', function(e) {
        updatePanelWidth(parseInt(e.target.value, 10));
    });
    
    // Add image button
    $('#static_image_add_image').on('click', async () => {
        const imagePath = prompt('Enter image path (e.g., assets/myimage.png):');
        
        if (!imagePath) return;
        
        const settings = getSettings();
        
        // Validate path
        if (!imagePath.trim()) {
            alert('Please enter a valid path');
            return;
        }
        
        // Add to available images if not already present
        if (!settings.availableImages.includes(imagePath)) {
            settings.availableImages.push(imagePath);
            
            // Update dropdown
            const option = $(`<option value="${imagePath}">${imagePath.split('/').pop()}</option>`);
            $('#static_image_url').append(option);
            
            saveSettingsDebounced();
            alert('Image added! Place the image file in the specified path.');
        } else {
            alert('This image is already in the list.');
        }
    });
    
    // Mouse/keyboard activity for auto-hide
    $(document).on('mousemove.keydown.static-image-extension', resetIdleTimer);
    
    // Listen to ST events
    eventSource.on(event_types.CHAT_CHANGED, () => {
        // Could update panel based on chat context
    });
    
    // Cleanup on unload
    $(window).on('beforeunload', () => {
        $(document).off('.static-image-extension');
        if (idleTimer) {
            clearTimeout(idleTimer);
            idleTimer = null;
        }
    });
}

/**
 * Initialize the extension
 */
async function init() {
    console.log('[StaticImageExtension] Initializing...');
    
    // Load settings
    await loadSettings();
    
    const settings = getSettings();
    
    // Build and add panel
    const panel = buildPanel();
    $('body').append(panel);
    
    // Show/hide panel based on enabled state
    if (settings.enabled) {
        panel.show();
    } else {
        panel.hide();
    }
    
    // Apply collapsed state
    if (settings.collapsed) {
        panel.addClass('collapsed');
        panel.find('.panel-content').hide();
    }
    
    // Setup event listeners
    setupEventListeners();
    setupKeyboardShortcuts();
    
    // Start auto-hide timer if enabled
    if (settings.autoHide) {
        startIdleTimer();
    }
    
    console.log('[StaticImageExtension] Initialized successfully');
}

// Main entry point - called when extension is loaded
jQuery(async () => {
    // Load settings HTML from file
    const settingsHtml = await $.get(`${extensionFolderPath}/settings.html`);
    
    // Append settings to extensions settings panel
    $("#extensions_settings").append(settingsHtml);
    
    // Initialize the extension
    await init();
});

// Export functions for settings panel
export { getSettings, updatePanelImage, updatePanelWidth, togglePanelCollapsed };
