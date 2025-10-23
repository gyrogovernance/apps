// Core data types for the Governance Apps extension

// App-based navigation types
export type AppScreen = 'welcome' | 'challenges' | 'journal' | 'insights' | 'settings' | 'detector' | 'glossary';
export type ChallengesView = 'select-type' | 'gyro-suite' | 'sdg-gallery' | 'custom-builder' | 'prompt-workshop';
export type JournalView = 'home' | 'session' | 'active-session' | 'synthesis' | 'analysis';
export type InsightsView = 'library' | 'detail' | 'comparison' | 'suites' | 'tracker';
export type DetectorView = 'input' | 'analyst1' | 'analyst2' | 'results';
export type DetectorMode = 'quick' | 'standard' | 'custom';

export type ChallengeType = 'normative' | 'strategic' | 'epistemic' | 'procedural' | 'formal' | 'custom';
export type Platform = 'lmarena' | 'chatgpt' | 'claude' | 'poe' | 'custom';
export type TurnNumber = 1 | 2 | 3 | 4 | 5 | 6;
export type Confidence = 'high' | 'medium' | 'low';
export type Section = 'epoch1' | 'epoch2' | 'analyst1_epoch1' | 'analyst1_epoch2' | 'analyst2_epoch1' | 'analyst2_epoch2' | 'report';
export type AlignmentCategory = 'VALID' | 'SUPERFICIAL' | 'SLOW';
export type SessionStatus = 'active' | 'paused' | 'analyzing' | 'complete';
export type EpochStatus = 'pending' | 'in-progress' | 'complete';

// Lie Detector types
export interface TranscriptParseResult {
  turns: Turn[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  method: 'turn_markers' | 'alternating' | 'paragraphs' | 'manual';
  suggestions?: string[];
}

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
  completedInsightId?: string; // Link to generated insight when complete
}

// UI State for detector workflow (ephemeral, not stored)
export interface DetectorUIState {
  transcript: string;
  parsedResult: TranscriptParseResult | null;
  analyst1?: AnalystResponse;
  analyst2?: AnalystResponse;
  model_analyst1?: string; // Store model names
  model_analyst2?: string;
  durationMinutes?: number; // User override for AR calculation
  timestamp?: number; // For draft management
}

export interface NotebookState {
  // Multi-session support (SINGLE SOURCE OF TRUTH)
  sessions: Session[];
  activeSessionId?: string;

  // Gyro Suite tracking
  gyroSuiteSessionIds?: string[]; // IDs of all 5 suite sessions
  gyroSuiteCurrentIndex?: number; // Current challenge index (0-4)
  currentSuiteRunId?: string; // NEW: track current suite run for linking insights

  // Draft storage for temporary data (detector, etc.)
  drafts?: Record<string, any>; // Temporary storage for detector workflow and other drafts

  // UI state
  ui: {
    currentSection: Section;
    currentTurn: number;
    currentApp: AppScreen;
    challengesView?: ChallengesView;
    journalView?: JournalView;
    insightsView?: InsightsView;
    detectorView?: DetectorView; // Added for Detector app navigation
    showGlossary?: boolean; // Added for Glossary modal
    detectorDraftKey?: string; // Track active detector draft per run
  };
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
  
  // Suite tracking metadata
  suiteRunId?: string; // Links insights from same GD run
  suiteMetadata?: {
    suiteIndex: number; // 0-4 (Formal, Normative, Procedural, Strategic, Epistemic)
    totalChallenges: 5;
    modelEvaluated: string; // Primary model name
    suiteStartedAt: string;
    suiteCompletedAt?: string; // Set when last challenge finishes
  };
  
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
  sessions: [],
  activeSessionId: undefined,
  gyroSuiteSessionIds: undefined,
  gyroSuiteCurrentIndex: undefined,
  currentSuiteRunId: undefined,
  ui: {
    currentSection: 'epoch1',
    currentTurn: 1,
    currentApp: 'welcome',
    challengesView: 'select-type',
    journalView: 'home',
    insightsView: 'library'
  }
};

