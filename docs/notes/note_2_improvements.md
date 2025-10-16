# User Journey, Heuristic Evaluation & Recommendations

## 🎯 User Journey Map: Proposed Multi-App Architecture

### **Entry Point: Welcome Screen**

```
┌─────────────────────────────────────────────┐
│   🌍 AI-Empowered Governance Apps           │
│                                             │
│   Transform AI conversations into          │
│   validated governance insights            │
│                                             │
│   ┌─────────────┐  ┌─────────────┐        │
│   │ 📋 Challenges│  │ 📓 Journal   │       │
│   │ Select &    │  │ Active      │        │
│   │ Create      │  │ Sessions    │        │
│   └─────────────┘  └─────────────┘        │
│                                             │
│   ┌─────────────┐  ┌─────────────┐        │
│   │ 💡 Insights │  │ ⚙️ Settings  │       │
│   │ Browse &    │  │ Preferences │        │
│   │ Share       │  │             │        │
│   └─────────────┘  └─────────────┘        │
│                                             │
│   Quick Start: [New Evaluation] [Resume]   │
└─────────────────────────────────────────────┘
```

---

### **App 1: Challenges (Participation)**

**Purpose**: Challenge selection, prompt design, and template management

#### Journey Flow:

1. **Challenge Type Selection Screen**
```
┌─────────────────────────────────────────────┐
│  📋 Select Challenge Type                   │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ 🎯 GyroDiagnostics Evaluation Suite  │ │
│  │ Complete 5-challenge assessment       │ │
│  │ [Start Full Suite] →                  │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  🎨 Quick Challenge Templates              │
│                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ 🧮   │ │ ⚖️   │ │ 💻   │ │ 🎲   │     │
│  │Formal│ │Norm. │ │Proc. │ │Strat.│     │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│  ┌──────┐                                  │
│  │ 🔍   │                                  │
│  │Epist.│                                  │
│  └──────┘                                  │
│                                             │
│  🌍 UN SDG Challenges (17)                 │
│  [View SDG Gallery] →                      │
│                                             │
│  ✏️ Custom Challenge                       │
│  [Create Your Own] →                       │
└─────────────────────────────────────────────┘
```

2. **GyroDiagnostics Suite View** (when selected)
```
┌─────────────────────────────────────────────┐
│  🎯 GyroDiagnostics Evaluation Suite        │
│                                             │
│  Complete model assessment across 5 domains │
│                                             │
│  ✓ Formal (Physics & Math)                 │
│  ✓ Normative (Policy & Ethics)             │
│  ✓ Procedural (Code & Debugging)           │
│  ✓ Strategic (Finance & Strategy)          │
│  ✓ Epistemic (Knowledge & Communication)   │
│                                             │
│  ⏱️ Estimated Time: 2-4 hours              │
│  📊 Output: Comprehensive model report      │
│                                             │
│  [Start Evaluation] [Learn More]           │
└─────────────────────────────────────────────┘
```

3. **SDG Challenge Gallery**
```
┌─────────────────────────────────────────────┐
│  🌍 UN Sustainable Development Goals        │
│                                             │
│  Select a governance challenge:             │
│                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐         │
│  │ 🚫 SDG1│ │ 🍎 SDG2│ │ 🏥 SDG3│        │
│  │No      │ │Zero    │ │Health  │        │
│  │Poverty │ │Hunger  │ │        │        │
│  └────────┘ └────────┘ └────────┘         │
│                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐         │
│  │ 📚 SDG4│ │ ⚖️ SDG5│ │ 💧 SDG6│        │
│  │Educ.   │ │Gender  │ │Water   │        │
│  └────────┘ └────────┘ └────────┘         │
│                                             │
│  [Show All 17] [Filter by Domain]          │
└─────────────────────────────────────────────┘
```

4. **Custom Challenge Builder**
```
┌─────────────────────────────────────────────┐
│  ✏️ Create Custom Challenge                 │
│                                             │
│  Title: [                              ]   │
│                                             │
│  Description:                               │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Type: [Custom ▾]                          │
│  Domain Tags: [+ Add SDG] [+ Add Custom]   │
│                                             │
│  🔧 Prompt Designer                         │
│  [Open Prompt Workshop] →                  │
│                                             │
│  💾 [Save as Template] [Start Session]     │
└─────────────────────────────────────────────┘
```

5. **Prompt Workshop** (New Feature)
```
┌─────────────────────────────────────────────┐
│  🔧 Prompt Design Workshop                  │
│                                             │
│  Your Draft:                                │
│  ┌─────────────────────────────────────┐   │
│  │ Develop a framework for...          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  🤖 AI-Powered Tools:                       │
│  [Clarify Scope] [Add Constraints]         │
│  [Check Completeness] [Simplify Language]  │
│                                             │
│  📊 Prompt Quality Indicators:              │
│  • Clarity: ████████░░ 80%                 │
│  • Specificity: ██████░░░░ 60%             │
│  • Testability: ███████░░░ 70%             │
│                                             │
│  💡 Suggestions:                            │
│  - Add quantitative success criteria       │
│  - Specify stakeholder perspectives        │
│                                             │
│  [Test with AI] [Save & Use]               │
└─────────────────────────────────────────────┘
```

---

### **App 2: Journal (Preparation)**

**Purpose**: Active synthesis sessions with 6-turn protocol + analyst evaluations

#### Journey Flow:

1. **Journal Home** (replaces current immediate form)
```
┌─────────────────────────────────────────────┐
│  📓 Journal                                 │
│                                             │
│  🔄 Active Session                          │
│  ┌───────────────────────────────────────┐ │
│  │ "Renewable Energy Transition"         │ │
│  │ Type: Normative | Domain: SDG 7      │ │
│  │                                       │ │
│  │ Progress: ████████████░░░░ 60%       │ │
│  │ Epoch 1 ✓ | Epoch 2 ⏳ (Turn 3/6)   │ │
│  │                                       │ │
│  │ [Continue Session] →                  │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  📜 Recent Sessions                         │
│  • Climate Policy Framework (Paused)       │
│  • Healthcare AI Regulation (Analyzing)    │
│                                             │
│  [+ New Session]                           │
└─────────────────────────────────────────────┘
```

2. **Session View** (improved from current SynthesisSection)
```
┌─────────────────────────────────────────────┐
│  📓 Renewable Energy Transition             │
│  Epoch 1 • Turn 3/6 • ⏱️ 8 min elapsed     │
│                                             │
│  ┌─ Synthesis Prompt ────────────────────┐ │
│  │ Design a framework for AI-Empowered   │ │
│  │ renewable energy transition...         │ │
│  │ [📋 Copy Prompt]                       │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  💬 Capture AI Response:                    │
│  ┌─────────────────────────────────────┐   │
│  │ Paste or pick from page...          │   │
│  │                                      │   │
│  │ [🎯 Pick from Page] [📋 Paste]      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  📊 Turn History:                           │
│  ✓ Turn 1 (432 words) ✓ Turn 2 (398 words)│
│                                             │
│  [← Pause] [Save Turn →]                   │
└─────────────────────────────────────────────┘
```

3. **Epoch Completion Transition**
```
┌─────────────────────────────────────────────┐
│  ✅ Epoch 1 Complete!                       │
│                                             │
│  📊 Session Summary                         │
│  • 6 turns completed                        │
│  • 2,847 total words                        │
│  • 15 minutes duration                      │
│  • Model: GPT-4o                            │
│                                             │
│  Next Step: Epoch 2 Synthesis              │
│  Use a different model or perspective      │
│                                             │
│  [View Transcript] [Start Epoch 2] →       │
└─────────────────────────────────────────────┘
```

4. **Analysis Phase** (improved from AnalystSection)
```
┌─────────────────────────────────────────────┐
│  🔬 Analysis: Analyst 1/2                   │
│                                             │
│  📋 Step 1: Copy Evaluation Prompt          │
│  Contains both epoch transcripts           │
│  [📋 Copy to Clipboard] ✓ Copied!          │
│                                             │
│  🤖 Step 2: Run in Different AI Model       │
│  Recommended: Claude, Llama, GLM            │
│  Platform: [Claude ▾] Model: [______]      │
│                                             │
│  📥 Step 3: Paste JSON Response             │
│  ┌─────────────────────────────────────┐   │
│  │ { "structure_scores": { ... }       │   │
│  │                                      │   │
│  │ [🎯 Pick] [Validate & Save]         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  💡 Tip: Use models different from synthesis│
│  [← Back] [Continue →]                     │
└─────────────────────────────────────────────┘
```

---

### **App 3: Insights (Provision)**

**Purpose**: Browse, organize, share completed evaluations

#### Journey Flow:

1. **Insights Library**
```
┌─────────────────────────────────────────────┐
│  💡 Insights                                │
│                                             │
│  🔍 [Search] [Filter ▾] [Sort: Recent ▾]   │
│                                             │
│  ┌─ Renewable Energy Transition ─────────┐ │
│  │ Normative • SDG 7 • Jan 15, 2025      │ │
│  │ QI: 78.4% | SI: 45.2 | AR: VALID      │ │
│  │ Models: GPT-4o, Claude 3.5, Llama 3  │ │
│  │ [View] [Share] [Export]               │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌─ Healthcare AI Regulation ────────────┐ │
│  │ Strategic • SDG 3 • Jan 12, 2025      │ │
│  │ QI: 82.1% | SI: 52.7 | AR: VALID      │ │
│  │ [View] [Share] [Export]               │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  📊 [View Analytics] [Compare Insights]    │
└─────────────────────────────────────────────┘
```

2. **Insight Detail View**
```
┌─────────────────────────────────────────────┐
│  💡 Renewable Energy Transition             │
│  Normative Challenge • SDG 7                │
│                                             │
│  📊 Quality Metrics                         │
│  ┌──────┐ ┌──────┐ ┌──────┐               │
│  │ 78.4%│ │ 45.2 │ │VALID │               │
│  │  QI  │ │  SI  │ │  AR  │               │
│  └──────┘ └──────┘ └──────┘               │
│                                             │
│  [Structure] [Behavior] [Specialization]   │
│                                             │
│  📝 Key Insights (Expandable)               │
│  🔬 Pathologies Detected (2)                │
│  📊 Full Transcript                         │
│  🤖 Models Used                             │
│                                             │
│  💾 Export: [JSON] [Markdown] [PDF]        │
│  🌐 Share: [GitHub] [Twitter] [Copy Link]  │
│                                             │
│  [← Back to Library]                       │
└─────────────────────────────────────────────┘
```

3. **Insight Comparison** (New Feature)
```
┌─────────────────────────────────────────────┐
│  📊 Compare Insights                        │
│                                             │
│  Select insights to compare (2-4):         │
│  ☑ Renewable Energy (QI: 78.4%)            │
│  ☑ Healthcare AI (QI: 82.1%)               │
│  ☐ Climate Policy (QI: 71.3%)              │
│                                             │
│  Comparison View:                           │
│  ┌─────────────────────────────────────┐   │
│  │        │ Energy │ Health │          │   │
│  │ QI     │  78.4  │  82.1  │          │   │
│  │ SI     │  45.2  │  52.7  │          │   │
│  │ Truth. │   7.8  │   8.2  │          │   │
│  │ Comp.  │   7.2  │   8.5  │          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  📈 [View Chart] [Export Comparison]       │
└─────────────────────────────────────────────┘
```

---

## 🔍 Heuristic Evaluation

### Current vs. Proposed Architecture

| Heuristic | Current State | Proposed State | Impact |
|-----------|---------------|----------------|--------|
| **Visibility of System Status** | ⚠️ Progress bar exists but single linear flow | ✅ Clear app sections, session status, completion states | **High** - Users always know where they are |
| **Match Between System & Real World** | ⚠️ Technical terms (epoch, analyst) immediately visible | ✅ Familiar concepts: Challenges, Journal, Insights | **High** - Reduced cognitive load |
| **User Control & Freedom** | ❌ Can't easily switch tasks or pause | ✅ Can save sessions, switch between apps, resume anytime | **Critical** - Enables realistic workflows |
| **Consistency & Standards** | ✅ Good internal consistency | ✅ Maintains + adds app-level patterns | **Medium** - Improvement in navigation |
| **Error Prevention** | ⚠️ Easy to lose work if closing panel | ✅ Auto-save per app, clear session management | **High** - Protects user effort |
| **Recognition Rather Than Recall** | ❌ Must remember full flow, what comes next | ✅ Visual cards, recent items, contextual next steps | **High** - Easier onboarding |
| **Flexibility & Efficiency** | ❌ Must complete linearly | ✅ Jump to any app, quick-start options, templates | **Critical** - Power users & newcomers both served |
| **Aesthetic & Minimalist Design** | ⚠️ Wall of text on entry | ✅ Visual cards, progressive disclosure, emojis for scanning | **High** - Better first impression |
| **Help Users Recognize Errors** | ⚠️ JSON validation good, but limited guidance | ✅ Contextual tips, prompt quality indicators, validation feedback | **Medium** - Smoother completion |
| **Help & Documentation** | ❌ No onboarding or help system | ✅ Welcome screen, contextual tips, "Learn More" links | **High** - Reduces support burden |

**Overall Assessment**: Proposed architecture addresses **8 critical UX issues** with high impact on adoption and success rates.

---

## 🎨 Detailed Recommendations

### 1. **Navigation & App Structure**

**Implementation**:

```typescript
// New types for app-based navigation
export type AppScreen = 'welcome' | 'challenges' | 'journal' | 'insights' | 'settings';
export type ChallengesView = 'select-type' | 'gyro-suite' | 'sdg-gallery' | 'custom-builder' | 'prompt-workshop';
export type JournalView = 'home' | 'active-session' | 'synthesis' | 'analysis';
export type InsightsView = 'library' | 'detail' | 'comparison';

interface UIState {
  currentApp: AppScreen;
  challengesView?: ChallengesView;
  journalView?: JournalView;
  insightsView?: InsightsView;
  // ... existing properties
}
```

**Component Structure**:
```
src/components/
├── apps/
│   ├── WelcomeApp.tsx          // Entry screen with app cards
│   ├── ChallengesApp/
│   │   ├── ChallengesApp.tsx   // Main router
│   │   ├── TypeSelector.tsx    // Choose Gyro/SDG/Custom
│   │   ├── GyroSuiteView.tsx   // 5-challenge presentation
│   │   ├── SDGGallery.tsx      // 17 SDG cards
│   │   ├── CustomBuilder.tsx   // Custom challenge form
│   │   └── PromptWorkshop.tsx  // AI-assisted prompt design
│   ├── JournalApp/
│   │   ├── JournalApp.tsx      // Main router
│   │   ├── JournalHome.tsx     // Active + recent sessions
│   │   ├── SessionView.tsx     // Synthesis turns (replaces SynthesisSection)
│   │   ├── AnalysisView.tsx    // Analyst evaluation (replaces AnalystSection)
│   │   └── SessionProgress.tsx // Visual progress component
│   ├── InsightsApp/
│   │   ├── InsightsApp.tsx     // Main router
│   │   ├── InsightsLibrary.tsx // Browse all insights
│   │   ├── InsightDetail.tsx   // Full report view
│   │   └── InsightComparison.tsx // Compare multiple
│   └── SettingsApp.tsx
├── shared/
│   ├── AppCard.tsx             // Reusable card for app selection
│   ├── ProgressIndicator.tsx   // Better than current dashboard
│   └── NavigationBar.tsx       // Bottom nav or sidebar
└── Notebook.tsx                // Top-level router

```

### 2. **Challenge Selection UX**

**GyroDiagnostics Suite Presentation**:

```typescript
// In ChallengesApp/GyroSuiteView.tsx
const GYRO_SUITE = {
  title: "GyroDiagnostics Evaluation Suite",
  description: "Complete 5-domain model assessment",
  challenges: [
    { type: 'formal', icon: '🧮', label: 'Formal', domains: 'Physics & Math', color: 'blue' },
    { type: 'normative', icon: '⚖️', label: 'Normative', domains: 'Policy & Ethics', color: 'green' },
    { type: 'procedural', icon: '💻', label: 'Procedural', domains: 'Code & Debugging', color: 'purple' },
    { type: 'strategic', icon: '🎲', label: 'Strategic', domains: 'Finance & Strategy', color: 'orange' },
    { type: 'epistemic', icon: '🔍', label: 'Epistemic', domains: 'Knowledge & Communication', color: 'pink' }
  ],
  estimatedTime: "2-4 hours",
  output: "Comprehensive model quality report with SI, QI, AR metrics"
};
```

**SDG Gallery**:

```typescript
// In ChallengesApp/SDGGallery.tsx
const SDG_CHALLENGES = [
  { 
    number: 1, 
    title: "No Poverty", 
    icon: '🚫',
    prompt: "Design AI-Empowered poverty alleviation framework...",
    color: '#E5243B',
    domains: ['normative', 'strategic']
  },
  { 
    number: 3, 
    title: "Good Health", 
    icon: '🏥',
    prompt: "Develop AI-Empowered global health systems...",
    color: '#4C9F38',
    domains: ['normative', 'strategic']
  },
  // ... all 17
];
```

### 3. **Prompt Workshop Feature**

**New Component**: `PromptWorkshop.tsx`

This is a powerful addition that helps users create better custom challenges:

```typescript
interface PromptQualityMetrics {
  clarity: number;        // 0-100
  specificity: number;    // 0-100
  testability: number;    // 0-100
  suggestions: string[];
}

// Use simple heuristics or AI API to analyze prompt
function analyzePrompt(draft: string): PromptQualityMetrics {
  // Check for clear success criteria
  const hasMetrics = /\d+%|quantif|measur|metric/i.test(draft);
  // Check for specific constraints
  const hasConstraints = /must|should|requir|constraint/i.test(draft);
  // Check for stakeholder mentions
  const hasStakeholders = /stakeholder|communit|group|actor/i.test(draft);
  
  return {
    clarity: draft.length > 100 ? 70 : 40,
    specificity: hasConstraints ? 75 : 50,
    testability: hasMetrics ? 80 : 40,
    suggestions: [
      !hasMetrics && "Consider adding quantitative success criteria",
      !hasStakeholders && "Specify stakeholder perspectives",
      draft.length < 100 && "Provide more context and detail"
    ].filter(Boolean)
  };
}
```

### 4. **Session Management**

**Enhanced State**:

```typescript
interface Session {
  id: string;
  challenge: Challenge;
  status: 'active' | 'paused' | 'analyzing' | 'complete';
  epochs: {
    epoch1: Epoch & { status: 'pending' | 'in-progress' | 'complete' };
    epoch2: Epoch & { status: 'pending' | 'in-progress' | 'complete' };
  };
  analysts: {
    analyst1: { status: 'pending' | 'in-progress' | 'complete', data: AnalystResponse | null };
    analyst2: { status: 'pending' | 'in-progress' | 'complete', data: AnalystResponse | null };
  };
  createdAt: string;
  updatedAt: string;
  estimatedTimeRemaining?: number;
}

interface NotebookState {
  sessions: Session[];        // Multiple sessions
  activeSessionId?: string;   // Currently active
  // ... rest
}
```

**Storage Enhancement**:

```typescript
// In storage.ts
export const sessions = {
  async getAll(): Promise<Session[]> { ... },
  async getById(id: string): Promise<Session | null> { ... },
  async create(challenge: Challenge): Promise<Session> { ... },
  async update(id: string, updates: Partial<Session>): Promise<void> { ... },
  async delete(id: string): Promise<void> { ... }
};
```

### 5. **Insights Organization**

**Enhanced GovernanceInsight with Metadata**:

```typescript
interface GovernanceInsight {
  id: string;
  sessionId: string;
  createdAt: string;
  tags: string[];          // User-added tags
  starred: boolean;        // Favorite flag
  notes: string;           // User notes
  // ... existing properties
}
```

**Filtering & Search**:

```typescript
// In InsightsApp/InsightsLibrary.tsx
interface InsightFilters {
  search?: string;
  challengeType?: ChallengeType[];
  domain?: string[];
  minQI?: number;
  minSI?: number;
  alignmentCategory?: AlignmentCategory[];
  dateRange?: { start: Date; end: Date };
}

function filterInsights(insights: GovernanceInsight[], filters: InsightFilters): GovernanceInsight[] {
  return insights.filter(insight => {
    if (filters.search && !insight.challenge.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.minQI && insight.quality.quality_index < filters.minQI) {
      return false;
    }
    // ... more filters
    return true;
  });
}
```

### 6. **Visual Design System**

**App Cards Component**:

```typescript
// In shared/AppCard.tsx
interface AppCardProps {
  icon: string;
  title: string;
  description: string;
  badge?: string;          // e.g., "3 Active" for Journal
  onClick: () => void;
  disabled?: boolean;
}

const AppCard: React.FC<AppCardProps> = ({ icon, title, description, badge, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="relative p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 
               hover:border-primary hover:shadow-lg transition-all duration-200 disabled:opacity-50 
               disabled:cursor-not-allowed text-left w-full"
  >
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    {badge && (
      <span className="absolute top-4 right-4 px-2 py-1 bg-primary text-white text-xs font-medium rounded-full">
        {badge}
      </span>
    )}
  </button>
);
```

### 7. **Progressive Disclosure**

Current problem: Too much text upfront.

**Solution Pattern**:

```typescript
// Instead of showing full prompts immediately, use:
<details className="prompt-disclosure">
  <summary className="cursor-pointer font-medium text-primary flex items-center gap-2">
    <span>📋 View Full Prompt</span>
    <span className="text-xs text-gray-500">(Click to expand)</span>
  </summary>
  <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded">
    <pre className="whitespace-pre-wrap text-sm">{fullPrompt}</pre>
    <button onClick={copyPrompt} className="mt-2 btn-primary">
      Copy to Clipboard
    </button>
  </div>
</details>
```

### 8. **Onboarding & Help**

**Welcome Screen with Quick Tour**:

```typescript
// In apps/WelcomeApp.tsx
const WelcomeApp: React.FC = () => {
  const [showTour, setShowTour] = useState(false);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">🌍 Welcome to AI-Empowered Governance</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Transform AI conversations into validated governance insights using the GyroDiagnostics framework.
      </p>
      
      {/* App Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <AppCard
          icon="📋"
          title="Challenges"
          description="Select or create governance challenges"
          onClick={() => navigate('challenges')}
        />
        <AppCard
          icon="📓"
          title="Journal"
          description="Active synthesis sessions"
          badge={activeSessions.length > 0 ? `${activeSessions.length} Active` : undefined}
          onClick={() => navigate('journal')}
        />
        <AppCard
          icon="💡"
          title="Insights"
          description="Browse completed evaluations"
          badge={insights.length > 0 ? `${insights.length}` : undefined}
          onClick={() => navigate('insights')}
        />
        <AppCard
          icon="⚙️"
          title="Settings"
          description="Preferences and configuration"
          onClick={() => navigate('settings')}
        />
      </div>
      
      {/* Quick Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="font-medium mb-3">Quick Start</h3>
        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={() => startNew()}>
            🚀 New Evaluation
          </button>
          {activeSessions.length > 0 && (
            <button className="btn-secondary flex-1" onClick={() => resume()}>
              ▶️ Resume Last Session
            </button>
          )}
        </div>
      </div>
      
      {/* First-time user help */}
      <button 
        onClick={() => setShowTour(true)} 
        className="mt-4 text-sm text-primary hover:underline"
      >
        👋 First time here? Take a quick tour
      </button>
    </div>
  );
};
```

---

## 🚀 Implementation Priority

### Phase 1: Foundation 
1. ✅ Create app-based navigation structure
2. ✅ Build WelcomeApp with app cards
3. ✅ Refactor Notebook.tsx as top-level router
4. ✅ Add session management to state/storage

### Phase 2: Challenges App 
1. ✅ TypeSelector view
2. ✅ GyroSuiteView (5 challenges as a set)
3. ✅ SDG Gallery with all 17 goals
4. ✅ CustomBuilder (refactor from SetupSection)
5. ⭐ PromptWorkshop (new feature)

### Phase 3: Journal App 
1. ✅ JournalHome with active/recent sessions
2. ✅ Refactor SynthesisSection → SessionView
3. ✅ Refactor AnalystSection → AnalysisView
4. ✅ Add pause/resume functionality
5. ✅ Enhanced progress tracking

### Phase 4: Insights App 
1. ✅ InsightsLibrary with filtering
2. ✅ Enhanced InsightDetail view
3. ⭐ InsightComparison feature
4. ✅ Better export options
5. ✅ Tagging and organization

### Phase 5: Polish 
1. ✅ Onboarding tour
2. ✅ Contextual help/tips
3. ✅ Visual design refinement
4. ✅ Performance optimization
5. ✅ Testing & bug fixes

---

This architecture transforms your extension from a **linear form** into a **flexible workspace** that respects how users actually want to work with governance challenges—exploring options, working in sessions, building a personal library of validated insights.

The canonical GyroDiagnostics methodology remains unchanged; we're simply making it dramatically more accessible and usable. 🎯