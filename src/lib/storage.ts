// Chrome storage wrapper for notebook state persistence

import { NotebookState, INITIAL_STATE, Session, GovernanceInsight } from '../types';

const STORAGE_KEY = 'notebook_state';
const INSIGHTS_KEY = 'insights_library';

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

// Session Management
export const sessions = {
  /**
   * Create a new session
   */
  async create(challenge: Session['challenge'], platform: Session['process']['platform']): Promise<Session> {
    const state = await storage.get();
    const now = new Date().toISOString();
    
    const newSession: Session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      challenge,
      status: 'active',
      process: {
        platform,
        model_epoch1: '',
        model_epoch2: '',
        model_analyst1: '',
        model_analyst2: '',
        started_at: now
      },
      epochs: {
        epoch1: {
          turns: [],
          duration_minutes: 0,
          completed: false,
          status: 'pending'
        },
        epoch2: {
          turns: [],
          duration_minutes: 0,
          completed: false,
          status: 'pending'
        }
      },
      analysts: {
        analyst1: { status: 'pending', data: null },
        analyst2: { status: 'pending', data: null }
      },
      createdAt: now,
      updatedAt: now
    };

    const updatedSessions = [...state.sessions, newSession];
    await storage.update({ sessions: updatedSessions, activeSessionId: newSession.id });
    
    return newSession;
  },

  /**
   * Update an existing session (atomic - returns full state)
   */
  async update(sessionId: string, updates: Partial<Session>): Promise<NotebookState> {
    const state = await storage.get();
    const sessionIndex = state.sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    const updatedSession = { 
      ...state.sessions[sessionIndex], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    
    const updatedSessions = [...state.sessions];
    updatedSessions[sessionIndex] = updatedSession;
    
    const newState = { ...state, sessions: updatedSessions };
    await storage.set(newState); // Single atomic write
    
    return newState;
  },

  /**
   * Get all sessions
   */
  async getAll(): Promise<Session[]> {
    const state = await storage.get();
    return state.sessions;
  },

  /**
   * Get a session by ID
   */
  async getById(sessionId: string): Promise<Session | null> {
    const state = await storage.get();
    return state.sessions.find(s => s.id === sessionId) || null;
  },

  /**
   * Delete a session (atomic - returns full state)
   */
  async delete(sessionId: string): Promise<NotebookState> {
    const state = await storage.get();
    const updatedSessions = state.sessions.filter(s => s.id !== sessionId);
    
    const newState: NotebookState = {
      ...state,
      sessions: updatedSessions,
      // Clear activeSessionId if deleting active session
      activeSessionId: state.activeSessionId === sessionId 
        ? undefined 
        : state.activeSessionId,
      // Reset UI if deleting active session
      ui: state.activeSessionId === sessionId
        ? { ...state.ui, currentSection: 'setup' }
        : state.ui
    };
    
    await storage.set(newState); // Single atomic write
    return newState;
  }
};

// Insights Library Management
export const insights = {
  /**
   * Get all insights
   */
  async getAll(): Promise<GovernanceInsight[]> {
    try {
      const result = await chrome.storage.local.get(INSIGHTS_KEY);
      return result[INSIGHTS_KEY] || [];
    } catch (error) {
      console.error('Error loading insights:', error);
      return [];
    }
  },

  /**
   * Save an insight
   */
  async save(insight: GovernanceInsight): Promise<void> {
    const allInsights = await this.getAll();
    
    // Check if insight already exists and update, otherwise add
    const existingIndex = allInsights.findIndex(i => i.id === insight.id);
    if (existingIndex >= 0) {
      allInsights[existingIndex] = insight;
    } else {
      allInsights.push(insight);
    }
    
    await chrome.storage.local.set({ [INSIGHTS_KEY]: allInsights });
  },

  /**
   * Delete an insight
   */
  async delete(insightId: string): Promise<void> {
    const allInsights = await this.getAll();
    const filtered = allInsights.filter(i => i.id !== insightId);
    await chrome.storage.local.set({ [INSIGHTS_KEY]: filtered });
  },

  /**
   * Get insight by ID
   */
  async getById(insightId: string): Promise<GovernanceInsight | null> {
    const allInsights = await this.getAll();
    return allInsights.find(i => i.id === insightId) || null;
  }
};

