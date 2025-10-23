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

// Initialize theme
initializeTheme();

const root = document.getElementById('root');

if (root) {
  try {
    createRoot(root).render(
      <React.StrictMode>
        <ToastProvider>
          <Notebook />
        </ToastProvider>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Error rendering React:', error);
    // Fallback: render a simple div to confirm React is working
    root.innerHTML = '<div style="padding: 20px; font-family: system-ui; background: #ffebee; color: #c62828;">Error: React failed to load - ' + (error as Error).message + '</div>';
  }
} else {
  console.error('Root element not found!');
  // Try to create a fallback message
  document.body.innerHTML = '<div style="padding: 20px; font-family: system-ui;">Error: Root element not found</div>';
}
