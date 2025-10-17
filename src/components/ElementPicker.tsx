import React, { useState, useEffect } from 'react';
import { useToast } from './shared/Toast';
import { chromeAPI } from '../lib/chrome-mock';

interface ElementPickerProps {
  onTextCaptured: (text: string) => void;
}

const ElementPicker: React.FC<ElementPickerProps> = ({ onTextCaptured }) => {
  const toast = useToast();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Only set up listeners if chrome.runtime exists (extension mode)
    if (!chromeAPI.runtime.onMessage) return;

    // Listen for element selection messages
    const handleMessage = (message: any) => {
      if (message.action === 'element_captured') {
        onTextCaptured(message.text);
        setIsActive(false);
      }
    };

    chromeAPI.runtime.onMessage.addListener(handleMessage);

    return () => {
      if (chromeAPI.runtime.onMessage) {
        chromeAPI.runtime.onMessage.removeListener(handleMessage);
      }
    };
  }, [onTextCaptured]);

  const activatePicker = async () => {
    try {
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        toast.show('Could not get active tab', 'error');
        return;
      }

      // Inject content script if not already injected
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Guard against double-injection
          // @ts-ignore
          if ((window as any).__gyroPickerActive) return;
          // @ts-ignore
          (window as any).__gyroPickerActive = true;

          let highlighted: HTMLElement | null = null;
          let tooltip: HTMLElement | null = null;

          function highlightElement(e: MouseEvent) {
            const target = e.target as HTMLElement;
            
            if (highlighted && highlighted !== target) {
              highlighted.style.outline = '';
            }
            
            target.style.outline = '2px solid #4A90E2';
            highlighted = target;
          }

          function selectElement(e: MouseEvent) {
            e.preventDefault();
            e.stopPropagation();
            
            const target = e.target as HTMLElement;
            const text = target.innerText || target.textContent || '';
            
            chrome.runtime.sendMessage({
              action: 'element_selected',
              text: text
            });
            
            cleanup();
          }

          function cleanup() {
            document.removeEventListener('mouseover', highlightElement as any);
            document.removeEventListener('click', selectElement as any);
            document.removeEventListener('keydown', handleEscape as any);
            
            if (highlighted) {
              highlighted.style.outline = '';
              highlighted = null;
            }
            
            if (tooltip) {
              tooltip.remove();
              tooltip = null;
            }

            // Reset guard flag
            // @ts-ignore
            (window as any).__gyroPickerActive = false;
          }

          function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') {
              cleanup();
            }
          }

          // Create tooltip
          tooltip = document.createElement('div');
          tooltip.innerHTML = '🎯 Click on AI response to capture (ESC to cancel)';
          tooltip.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #4A90E2;
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            z-index: 2147483647;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            cursor: default;
          `;
          document.body.appendChild(tooltip);
          
          // Add event listeners
          document.addEventListener('mouseover', highlightElement as any);
          document.addEventListener('click', selectElement as any);
          document.addEventListener('keydown', handleEscape as any);
        }
      });

      setIsActive(true);
      
    } catch (error) {
      console.error('Error activating element picker:', error);
      toast.show('Could not activate element picker. Make sure you are on a web page.', 'error');
    }
  };

  return (
    <button
      onClick={activatePicker}
      className={`btn-secondary flex items-center gap-1.5 px-2 py-1.5 text-xs ${
        isActive ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300 dark:hover:bg-gray-600'
      }`}
      disabled={isActive}
      title="Click to select text from the current webpage"
    >
      <span className="text-sm">🎯</span>
      <span>{isActive ? 'Picker Active...' : 'Pick from Page'}</span>
    </button>
  );
};

export default ElementPicker;

