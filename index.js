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
 * Save all current settings from UI to storage
 */
function saveAllSettings() {
    const settings = getSettings();
    
    // Get values from UI elements
    settings.enabled = $('#static_image_enabled').prop('checked');
    settings.imageUrl = $('#static_image_url').val();
    settings.panelWidth = parseInt($('#static_image_width').val(), 10);
    settings.collapsed = $('#static_image_collapsed').prop('checked');
    settings.autoHide = $('#static_image_autohide').prop('checked');
    settings.autoHideDelay = parseInt($('#static_image_delay').val(), 10);
    
    // Save to SillyTavern's storage
    saveSettingsDebounced();
    
    // Show success message
    toastr.success('Settings saved successfully!', 'Static Image Extension');
    
    // Apply changes
    applySettings();
}

/**
 * Remove the currently selected image from the available images list
 */
function removeCurrentImage() {
    const select = $('#static_image_url');
    const selectedIndex = parseInt(select.val());
    const availableImages = extension_settings[extensionName].availableImages;
    
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= availableImages.length) {
        toastr.error('Please select an image to remove');
        return;
    }
    
    const removedImage = availableImages[selectedIndex];
    
    // Remove the image from the array
    availableImages.splice(selectedIndex, 1);
    
    // If the removed image was the current image, set to placeholder
    if (extension_settings[extensionName].imageUrl === removedImage) {
        extension_settings[extensionName].imageUrl = defaultSettings.imageUrl;
        updatePanelImage();
    }
    
    // Update the UI
    populateSettingsUI();
    saveAllSettings();
    
    toastr.info(`Removed image: ${removedImage}`);
}

/**
 * Apply settings to the UI
 */
function applySettings() {
    const settings = getSettings();
    
    // Update panel width
    if ($('#static_image_panel').length) {
        $('#static_image_panel').css('width', settings.panelWidth + 'px');
    }
    
    // Update panel image
    updatePanelImage();
    
    // Update collapsed state
    if (settings.collapsed) {
        $('#static_image_panel').addClass('collapsed');
        $('#static_image_panel .panel-content').hide();
    } else {
        $('#static_image_panel').removeClass('collapsed');
        $('#static_image_panel .panel-content').show();
    }
    
    // Show/hide panel based on enabled state
    if (settings.enabled) {
        $('#static_image_panel').fadeIn(200);
    } else {
        $('#static_image_panel').fadeOut(200);
    }
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
 * Setup event listeners for settings panel
 */
function setupSettingsListeners() {
    // Enable/disable checkbox
    $('#static_image_enabled').on('change', function() {
        const settings = getSettings();
        settings.enabled = $(this).prop('checked');
    });
    
    // Image source dropdown
    $('#static_image_url').on('change', function() {
        const settings = getSettings();
        settings.imageUrl = $(this).val();
    });
    
    // Width slider
    $('#static_image_width').on('input', function(e) {
        const width = parseInt(e.target.value, 10);
        $('#static_image_width_value').text(width + 'px');
        $('#static_image_panel').css('width', width + 'px');
    });
    
    // Collapsed checkbox
    $('#static_image_collapsed').on('change', function() {
        const settings = getSettings();
        settings.collapsed = $(this).prop('checked');
    });
    
    // Auto-hide checkbox
    $('#static_image_autohide').on('change', function() {
        const settings = getSettings();
        settings.autoHide = $(this).prop('checked');
        $('#static_image_delay_group').toggle(settings.autoHide);
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
            
            alert('Image added! Place the image file in the specified path.');
        } else {
            alert('This image is already in the list.');
        }
    });
    
    // Save settings button
    $('#static_image_save_settings').on('click', saveAllSettings);
    
    // Remove image button
    $('#static_image_remove_image').on('click', removeCurrentImage);
}

/**
 * Setup event listeners for panel
 */
function setupPanelListeners() {
    const { eventSource, event_types } = getContext();
    
    // Panel collapse button
    $('#static_image_collapse_btn').on('click', function() {
        const settings = getSettings();
        togglePanelCollapsed(!settings.collapsed);
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
 * Populate settings UI with current values
 */
function populateSettingsUI() {
    const settings = getSettings();
    
    // Populate checkbox values
    $('#static_image_enabled').prop('checked', settings.enabled);
    $('#static_image_collapsed').prop('checked', settings.collapsed);
    $('#static_image_autohide').prop('checked', settings.autoHide);
    
    // Populate image dropdown
    const $dropdown = $('#static_image_url');
    $dropdown.empty();
    settings.availableImages.forEach(img => {
        const selected = img === settings.imageUrl ? 'selected' : '';
        $dropdown.append($(`<option value="${img}" ${selected}>${img.split('/').pop()}</option>`));
    });
    
    // Populate slider
    $('#static_image_width').val(settings.panelWidth);
    $('#static_image_width_value').text(settings.panelWidth + 'px');
    
    // Populate delay
    $('#static_image_delay').val(settings.autoHideDelay);
    
    // Show/hide delay group
    $('#static_image_delay_group').toggle(settings.autoHide);
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
    setupSettingsListeners();
    setupPanelListeners();
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
    
    // Populate settings UI
    populateSettingsUI();
    
    // Initialize the extension
    await init();
});

// Export functions for settings panel
export { getSettings, updatePanelImage, updatePanelWidth, togglePanelCollapsed, saveAllSettings };
