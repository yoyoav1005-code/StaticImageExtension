// The main script for the Static Image Extension
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

// Keep track of where your extension is located
const extensionName = "static-image-extension";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const extensionSettings = extension_settings[extensionName];
const defaultSettings = {
  imagePath: "assets/placeholder.png",
  position: "right",
  width: 300,
  showCloseButton: true
};

// Loads the extension settings if they exist, otherwise initializes them to the defaults.
async function loadSettings() {
  // Create the settings if they don't exist
  extension_settings[extensionName] = extension_settings[extensionName] || {};
  if (Object.keys(extension_settings[extensionName]).length === 0) {
    Object.assign(extension_settings[extensionName], defaultSettings);
  }
}

// This function is called when the extension is loaded
jQuery(async () => {
  // Load settings when starting things up (if you have any)
  await loadSettings();
  
  console.log("Static Image Extension loaded!");
});
