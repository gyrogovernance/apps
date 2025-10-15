// Chrome storage wrapper for notebook state persistence

import { NotebookState, INITIAL_STATE } from '../types';

const STORAGE_KEY = 'notebook_state';

export const storage = {
  /**
   * Get the current notebook state
   */
  async get(): Promise<NotebookState> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      return result[STORAGE_KEY] || INITIAL_STATE;
    } catch (error) {
      console.error('Error loading state:', error);
      return INITIAL_STATE;
    }
  },

  /**
   * Save the notebook state
   */
  async set(state: NotebookState): Promise<void> {
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: state });
    } catch (error) {
      console.error('Error saving state:', error);
      throw error;
    }
  },

  /**
   * Update specific fields in the state
   */
  async update(updates: Partial<NotebookState>): Promise<NotebookState> {
    const currentState = await this.get();
    const newState = { ...currentState, ...updates };
    await this.set(newState);
    return newState;
  },

  /**
   * Clear all stored data
   */
  async clear(): Promise<void> {
    try {
      await chrome.storage.local.remove(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing state:', error);
      throw error;
    }
  },

  /**
   * Listen for storage changes
   */
  onChange(callback: (state: NotebookState) => void): void {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes[STORAGE_KEY]) {
        callback(changes[STORAGE_KEY].newValue);
      }
    });
  }
};

