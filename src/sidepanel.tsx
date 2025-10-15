import React from 'react';
import { createRoot } from 'react-dom/client';
import Notebook from './components/Notebook';
import './styles/main.css';

// Debug logging
console.log('Side panel script loading...');

const root = document.getElementById('root');
console.log('Root element found:', root);

if (root) {
  console.log('Rendering Notebook component...');
  try {
    createRoot(root).render(<Notebook />);
    console.log('Notebook component rendered successfully');
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
