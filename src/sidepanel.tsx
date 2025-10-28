import React from 'react';
import { createRoot } from 'react-dom/client';
import Notebook from './components/Notebook';
import { ToastProvider } from './components/shared/Toast';
import { initializeTheme } from './lib/theme-utils';
import './styles/main.css';

// Add global error handler for unhandled errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  const root = document.getElementById('root');
  if (root && !root.querySelector('.error-boundary')) {
    root.innerHTML = `
      <div class="error-boundary" style="padding: 20px; font-family: system-ui; background: #ffebee; color: #c62828;">
        <h2>Application Error</h2>
        <p>${event.error?.message || 'Unknown error occurred'}</p>
        <details style="margin-top: 10px; cursor: pointer;">
          <summary>Stack trace</summary>
          <pre style="font-size: 12px; overflow: auto; background: white; padding: 10px; border-radius: 4px;">${event.error?.stack || 'No stack available'}</pre>
        </details>
      </div>
    `;
  }
});

let reactRoot: ReturnType<typeof createRoot> | null = null;

function renderApp() {
  const root = document.getElementById('root');
  if (!root) {
    console.error('Root element not found');
    return;
  }

  try {
    if (reactRoot) {
      reactRoot.unmount();
      reactRoot = null;
    }
    
    reactRoot = createRoot(root);
    reactRoot.render(
      <React.StrictMode>
        <ToastProvider>
          <Notebook />
        </ToastProvider>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Error rendering React:', error);
    root.innerHTML = `
      <div style="padding: 20px; font-family: system-ui; background: #ffebee; color: #c62828;">
        <h2>Error: React failed to load</h2>
        <p>${(error as Error).message || 'Unknown error'}</p>
        <pre style="font-size: 12px; overflow: auto; background: white; padding: 10px; border-radius: 4px; margin-top: 10px;">${(error as Error).stack || 'No stack trace'}</pre>
      </div>
    `;
  }
}

// Initialize app
function initializeApp() {
  try {
    initializeTheme();
  } catch (error) {
    console.error('Error initializing theme:', error);
  }
  renderApp();
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  setTimeout(initializeApp, 0);
}

// Hot Module Replacement (HMR)
if (typeof module !== 'undefined' && (module as any).hot) {
  const hot = (module as any).hot;
  hot.accept('./components/Notebook', () => {
    renderApp();
  });
  hot.accept('./styles/main.css', () => {
    // CSS updates handled automatically
  });
}
