// Background service worker for the extension

chrome.runtime.onInstalled.addListener(async () => {
  console.log('AI Inspector installed');
  
  // Set side panel to open when action button is clicked
  try {
    if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
      console.log('Side panel behavior configured');
    }
  } catch (error) {
    console.log('Note: setPanelBehavior not available, side panel should still work via manifest');
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
    console.log('Port disconnected');
  });
});

