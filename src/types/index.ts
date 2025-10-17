// Core data types for the Governance Apps extension

// App-based navigation types
export type AppScreen = 'welcome' | 'challenges' | 'journal' | 'insights' | 'settings';
export type ChallengesView = 'select-type' | 'gyro-suite' | 'sdg-gallery' | 'custom-builder' | 'prompt-workshop';
export type JournalView = 'home' | 'session' | 'active-session' | 'synthesis' | 'analysis';
export type InsightsView = 'library' | 'detail' | 'comparison';

export type ChallengeType = 'normative' | 'strategic' | 'epistemic' | 'procedural' | 'formal' | 'custom';
export type Platform = 'lmarena' | 'chatgpt' | 'claude' | 'poe' | 'custom';
export type TurnNumber = 1 | 2 | 3 | 4 | 5 | 6;
export type Confidence = 'high' | 'medium' | 'low';
export type Section = 'setup' | 'epoch1' | 'epoch2' | 'analyst1_epoch1' | 'analyst1_epoch2' | 'analyst2_epoch1' | 'analyst2_epoch2' | 'report';
export type AlignmentCategory = 'VALID' | 'SUPERFICIAL' | 'SLOW';
export type SessionStatus = 'active' | 'paused' | 'analyzing' | 'complete';
export type EpochStatus = 'pending' | 'in-progress' | 'complete';

export interface Turn {
  number: TurnNumber;
  content: string;
  word_count: number;
  captured_at: string;
  confidence: Confidence;
}

export interface Epoch {
  turns: Turn[];
  duration_minutes: number;
  completed: boolean;
  status: EpochStatus;
}

export interface StructureScores {
  traceability: number;
  variety: number;
  accountability: number;
  integrity: number;
}

export interface BehaviorScores {
  truthfulness: number;
  completeness: number;
  groundedness: number;
  literacy: number;
  comparison: number | "N/A";
  preference: number | "N/A";
}

export interface AnalystResponse {
  structure_scores: StructureScores;
  behavior_scores: BehaviorScores;
  specialization_scores: Record<string, number>;
  pathologies: string[];
  strengths: string;
  weaknesses: string;
  insights: string;
}

// Helper for per-epoch analyst slots
export interface EpochAnalystSlot {
  status: EpochStatus;
  data: AnalystResponse | null;
}

// Session interface for multi-session support
export interface Session {
  id: string;
  challenge: {
    title: string;
    description: string;
    type: ChallengeType;
    domain: string[];
  };
  status: SessionStatus;
  process: {
    platform: Platform;
    model_epoch1: string;
    model_epoch2: string;
    model_analyst1: string;
    model_analyst2: string;
    started_at: string;
  };
  epochs: {
    epoch1: Epoch;
    epoch2: Epoch;
  };
  analysts: {
    epoch1: { analyst1: EpochAnalystSlot; analyst2: EpochAnalystSlot };
    epoch2: { analyst1: EpochAnalystSlot; analyst2: EpochAnalystSlot };
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotebookState {
  // Legacy support - current active session data
  challenge: {
    title: string;
    description: string;
    type: ChallengeType;
    domain: string[];
  };
  
  process: {
    platform: Platform;
    model_epoch1: string;
    model_epoch2: string;
    model_analyst1: string;
    model_analyst2: string;
    started_at: string;
  };
  
  epochs: {
    epoch1: Epoch;
    epoch2: Epoch;
  };
  
  analysts: {
    analyst1: AnalystResponse | null;
    analyst2: AnalystResponse | null;
  };
  
  ui: {
    currentSection: Section;
    currentTurn: number;
    currentApp: AppScreen;
    challengesView?: ChallengesView;
    journalView?: JournalView;
    insightsView?: InsightsView;
  };
  
  // New multi-session support
  sessions: Session[];
  activeSessionId?: string;
  
  // Gyro Suite tracking
  gyroSuiteSessionIds?: string[]; // IDs of all 5 suite sessions
  gyroSuiteCurrentIndex?: number; // Current challenge index (0-4)
  
  results: GovernanceInsight | null;
}

export interface GovernanceInsight {
  id: string;
  sessionId?: string;
  challenge: {
    title: string;
    description: string;
    type: string;
    domain: string[];
  };
  
  insights: {
    summary: string;
    participation: string;
    preparation: string;
    provision: string;
    combined_markdown: string;
  };
  
  transcripts?: {
    epoch1: string[];
    epoch2: string[];
  };
  
  quality: {
    quality_index: number;
    alignment_rate: number;
    alignment_rate_category: AlignmentCategory;
    superintelligence_index: number;
    si_deviation: number;
    
    structure_scores: StructureScores;
    behavior_scores: {
      truthfulness: number;
      completeness: number;
      groundedness: number;
      literacy: number;
      comparison: number | "N/A";
      preference: number | "N/A";
    };
    specialization_scores: Record<string, number>;
    
    pathologies: {
      detected: string[];
      frequency: number;
    };
  };
  
  process: {
    platform: string;
    models_used: {
      synthesis_epoch1: string;
      synthesis_epoch2: string;
      analyst1: string;
      analyst2: string;
    };
    durations: {
      epoch1_minutes: number;
      epoch2_minutes: number;
    };
    created_at: string;
    schema_version: string;
  };
  
  contribution: {
    public: boolean;
    license: 'CC0';
    contributor: string;
  };
  
  // New metadata for organization
  tags: string[];
  starred: boolean;
  notes: string;
  
  // Optional metadata for imports and extended information
  metadata?: {
    model_name?: string;
    evaluation_method?: string;
    challenge_type?: string;
    epochs_analyzed?: number;
    source_file?: string;
    import_date?: string;
    pathology_frequency?: Record<string, number>;
    statistics?: {
      mean_qi?: number;
      std_qi?: number;
      min_qi?: number;
      max_qi?: number;
      mean_duration?: number;
      std_duration?: number;
    };
    [key: string]: any; // Allow additional custom metadata
  };
}

export const INITIAL_STATE: NotebookState = {
  challenge: {
    title: '',
    description: '',
    type: 'custom',
    domain: []
  },
  process: {
    platform: 'custom',
    model_epoch1: '',
    model_epoch2: '',
    model_analyst1: '',
    model_analyst2: '',
    started_at: ''
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
    analyst1: null,
    analyst2: null
  },
  ui: {
    currentSection: 'setup',
    currentTurn: 1,
    currentApp: 'welcome',
    challengesView: 'select-type',
    journalView: 'home',
    insightsView: 'library'
  },
  sessions: [],
  activeSessionId: undefined,
  gyroSuiteSessionIds: undefined,
  gyroSuiteCurrentIndex: undefined,
  results: null
};

