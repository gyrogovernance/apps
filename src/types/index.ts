// Core data types for the Governance Apps extension

export type ChallengeType = 'normative' | 'strategic' | 'epistemic' | 'procedural' | 'formal' | 'custom';
export type Platform = 'lmarena' | 'chatgpt' | 'claude' | 'poe' | 'custom';
export type TurnNumber = 1 | 2 | 3 | 4 | 5 | 6;
export type Confidence = 'high' | 'medium' | 'low';
export type Section = 'setup' | 'epoch1' | 'epoch2' | 'analyst1' | 'analyst2' | 'report';
export type AlignmentCategory = 'VALID' | 'SUPERFICIAL' | 'SLOW';

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

export interface NotebookState {
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
  };
  
  results: GovernanceInsight | null;
}

export interface GovernanceInsight {
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
      comparison: number;
      preference: number;
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
      completed: false
    },
    epoch2: {
      turns: [],
      duration_minutes: 0,
      completed: false
    }
  },
  analysts: {
    analyst1: null,
    analyst2: null
  },
  ui: {
    currentSection: 'setup',
    currentTurn: 1
  },
  results: null
};

