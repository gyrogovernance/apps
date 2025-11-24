// Background service worker for the extension

chrome.runtime.onInstalled.addListener(async () => {
  // Set side panel to open when action button is clicked
  try {
    if (chrome.sidePanel) {
      // Explicitly set the sidepanel path to ensure it's correct
      if (chrome.sidePanel.setOptions) {
        await chrome.sidePanel.setOptions({
          path: 'sidepanel.html',
          enabled: true
        });
      }
      // Set behavior to open on action click
      if (chrome.sidePanel.setPanelBehavior) {
        await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
      }
    }
  } catch (error) {
    console.error('Error setting side panel:', error);
    // Side panel should still work via manifest
  }
});

// Also set on startup in case onInstalled didn't fire
chrome.runtime.onStartup.addListener(async () => {
  try {
    if (chrome.sidePanel && chrome.sidePanel.setOptions) {
      await chrome.sidePanel.setOptions({
        path: 'sidepanel.html',
        enabled: true
      });
    }
  } catch (error) {
    console.error('Error setting side panel on startup:', error);
  }
});

// Handle messages from content scripts or side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'element_selected') {
    // Forward element selection to side panel
    chrome.runtime.sendMessage({
      action: 'element_captured',
      text: message.text
    });
  }

  return true;
});


// Keep service worker alive
chrome.runtime.onConnect.addListener((port) => {
  port.onDisconnect.addListener(() => {
    // Port disconnected
  });
});

