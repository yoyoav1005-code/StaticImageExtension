/**
 * Static Image Extension for SillyTavern
 * Displays a static image on the side of the screen
 */

(function() {
  'use strict';

  // Extension configuration (will be overridden by user settings)
  let config = {
    imagePath: 'assets/placeholder.png',
    position: 'right',
    width: 300,
    showCloseButton: true
  };

  // DOM elements
  let panel = null;
  let imageContainer = null;
  let closeButton = null;

  /**
   * Create the main panel element
   */
  function createPanel() {
    panel = document.createElement('div');
    panel.className = 'static-image-panel';
    if (config.position === 'left') {
      panel.classList.add('left');
    }
    panel.style.width = `${config.width}px`;

    // Panel header
    const header = document.createElement('div');
    header.className = 'static-image-panel-header';
    header.innerHTML = '<h3 class="static-image-panel-title">Static Image</h3>';

    // Close button
    if (config.showCloseButton) {
      closeButton = document.createElement('button');
      closeButton.className = 'static-image-close-btn';
      closeButton.innerHTML = '&times;';
      closeButton.title = 'Close panel';
      closeButton.onclick = togglePanel;
      header.appendChild(closeButton);
    }

    // Image container
    imageContainer = document.createElement('div');
    imageContainer.className = 'static-image-container loading';

    panel.appendChild(header);
    panel.appendChild(imageContainer);
    document.body.appendChild(panel);
  }

  /**
   * Load and display the image
   */
  async function loadImage() {
    if (!imageContainer) return;

    try {
      // Show loading state
      imageContainer.classList.add('loading');
      imageContainer.classList.remove('error');

      // Create image element
      const img = new Image();
      img.className = 'static-image';

      // Handle image load
      img.onload = () => {
        imageContainer.innerHTML = '';
        imageContainer.classList.remove('loading');
        imageContainer.classList.remove('error');
        imageContainer.appendChild(img);
      };

      // Handle image error
      img.onerror = () => {
        imageContainer.classList.remove('loading');
        imageContainer.classList.add('error');
        console.error('StaticImageExtension: Failed to load image:', config.imagePath);
      };

      // Set image source
      img.src = config.imagePath;

    } catch (error) {
      console.error('StaticImageExtension: Error loading image:', error);
      imageContainer.classList.remove('loading');
      imageContainer.classList.add('error');
    }
  }

  /**
   * Toggle panel visibility
   */
  function togglePanel() {
    if (panel) {
      panel.classList.toggle('hidden');
    }
  }

  /**
   * Initialize the extension
   */
  function init(userConfig) {
    // Merge user config with defaults
    if (userConfig) {
      config = { ...config, ...userConfig };
    }

    console.log('StaticImageExtension: Initializing with config:', config);

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        createPanel();
        loadImage();
      });
    } else {
      createPanel();
      loadImage();
    }
  }

  /**
   * Cleanup function
   */
  function destroy() {
    if (panel && panel.parentNode) {
      panel.parentNode.removeChild(panel);
      panel = null;
    }
  }

  // Expose extension API
  window.StaticImageExtension = {
    init,
    destroy,
    togglePanel,
    updateConfig: (newConfig) => {
      config = { ...config, ...newConfig };
      // Reinitialize with new config
      destroy();
      init(config);
    }
  };

  // Auto-initialize with default config
  init();

})();
