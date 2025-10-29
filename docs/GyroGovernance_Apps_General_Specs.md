# GyroGovernance Apps - General Specifications

> **AI-Empowered Governance Apps Platform**

---

## 📋 Table of Contents

1. [The Challenge](#the-challenge)
2. [Overview](#overview)
3. [Key Concepts](#key-concepts)
4. [Product Suite](#product-suite)
5. [Architecture](#architecture)
6. [Core Applications](#core-applications)
7. [User Journey](#user-journey)
8. [Data Flow](#data-flow)
9. [Technical Specifications](#technical-specifications)
10. [Integration Points](#integration-points)
11. [Frequently Asked Questions](#frequently-asked-questions)
12. [Contact & Support](#contact--support)

---

## 🎯 The Challenge

AI-Empowered governance requires accessible validation for policy recommendations in areas like climate strategies, healthcare reform, and resource allocation. Current limitations include restricted corporate access to advanced AI systems, general capability focus over governance-specific quality assessment, and high expertise barriers for rigorous evaluation. GyroGovernance Apps addresses this through platform-agnostic mathematical assessment via clipboard workflow, enabling any community or organization to validate AI-generated governance solutions using the GyroDiagnostics framework.

---

## 🎯 Overview

**GyroGovernance Apps** transform AI conversations into validated governance insights through mathematical assessment. The platform enables communities, researchers, and policy makers to evaluate AI-generated solutions for UN Sustainable Development Goals and local challenges.

### Platform Capabilities

- Clipboard-based workflow for any AI interface
- 12-metric quality assessment with geometric decomposition
- Three canonical indices: QI (performance), AR (efficiency), SI (alignment)
- Local-first architecture with export capabilities

### Current Products

1. **AI Inspector** (Browser Extension) - Flagship evaluation tool

Future expansions may include web apps, desktop tools, and specialized governance platforms.

---

## 📚 Key Concepts

<details>
<summary><strong>GyroDiagnostics Framework</strong></summary>

Mathematical framework for AI alignment measurement through rubric-based scoring across 12 metrics in three levels:
- **Level 1 (Structure)**: Traceability, Variety, Accountability, Integrity
- **Level 2 (Behavior)**: Truthfulness, Completeness, Groundedness, Literacy, Comparison, Preference
- **Level 3 (Specialization)**: Domain-specific metrics

Scoring is followed by geometric decomposition to yield three canonical indices:
- **Quality Index (QI)**: Weighted aggregate performance score (0-100%)
- **Alignment Rate (AR)**: Temporal efficiency metric in quality points per minute
- **Superintelligence Index (SI)**: Behavioral balance indicator quantifying structural alignment

</details>

<details>
<summary><strong>Superintelligence Index (SI)</strong></summary>

Quantifies structural alignment through behavioral balance measurement. Derived from aperture ratio A relative to theoretical target A* ≈ 0.02070. Computation uses Level 2 behavioral metrics with K₄ topology and Hodge decomposition to assess balance between coherent reasoning and adaptive differentiation. Higher SI correlates with reduced pathology rates.

</details>

<details>
<summary><strong>Behavioral Balance</strong></summary>

The equilibrium among measurable reasoning qualities including coherence, accuracy, and adaptability. Assessed through K₄ tetrahedral topology and Hodge decomposition, which separates gradient components (coherence) from cycle components (differentiation). This geometric approach provides objective measurement grounded in the Common Governance Model (CGM).

</details>

<details>
<summary><strong>Common Governance Model (CGM)</strong></summary>

The theoretical foundation underlying GyroDiagnostics. A Hilbert-style formal deductive system providing the mathematical-physics theory that grounds the evaluation methodology. The CGM defines geometric necessities that manifest as behavioral qualities in AI reasoning, which are then captured through rubric-based assessment and quantified via geometric decomposition.

</details>

---

## 🔧 Product Suite

### AI Inspector (Browser Extension)

**Status**: Active Development  
**Platform**: Chrome Browser Extension (Manifest V3)  
**Purpose**: Real-time AI model evaluation using clipboard-based workflow

The AI Inspector browser extension is a comprehensive platform for evaluating AI model responses against governance challenges. It transforms everyday AI conversations into rigorous governance analysis through multi-dimensional quality assessment rubrics and structured evaluation protocols.

#### Key Features

- **Multi-App Architecture**: Welcome, Challenges, Journal, Insights, Settings
- **Multi-Session Support**: Manage multiple evaluations simultaneously with browser-style tabs
- **Real-Time Sync**: Cross-tab synchronization using Chrome storage API
- **Glassmorphism UI**: Modern, unified design system with dark mode support
- **Platform Agnostic**: Clipboard-based workflow compatible with any AI service
- **Export Capabilities**: JSON and Markdown export for sharing and archiving

#### Key Principles

- **Participatory Governance**: Enables communities to validate AI solutions for real-world challenges
- **Platform Agnostic**: Clipboard-based workflow works with any AI model (ChatGPT, Claude, Gemini, etc.)
- **Open Source**: All code is open source with local-first data storage
- **Scientific Rigor**: Based on mathematical-physics principles from the Common Governance Model (CGM)
- **Sustainable Development**: Focused on UN SDGs and community-driven policy challenges
- **Reproducible**: All evaluations use public API access for independent verification

---

## 🏗️ Architecture

### AI Inspector Extension Architecture

The AI Inspector extension uses a modular, app-based architecture with the following components:

#### Application Layer
- **Welcome App** - Landing page with quick start guide and navigation
- **Challenges App** - Challenge selection and configuration
  - Type Selector
  - GyroDiagnostics Suite
  - SDG Gallery
  - Custom Builder
  - Prompt Workshop
- **Journal App** - Session management and evaluation workflow
  - Session List
  - Synthesis Section
  - Analyst Section
  - Report Section
- **Insights App** - Results library and analysis
  - Insights Library
  - Insight Detail
  - Model Tracker
  - Suite Reports
- **Rapid Test** - Accelerated quality assessment via JSON workflow
  - Analysis Prompt (copy to AI)
  - Single JSON Evaluation Response
  - Results with Behavioral Balance Gauge
- **Settings App** - Configuration and preferences
- **Shared Components** - Reusable UI elements

#### Core Libraries
- **Storage Management** - Chrome storage API integration
- **Session Helpers** - Session data access and manipulation
- **Report Generator** - Insight generation and formatting
- **Calculations & Metrics** - GyroDiagnostics calculations
- **Import Utils** - Data import functionality
- **Export Utils** - Data export functionality

### Data Architecture

The extension follows a **Single Source of Truth (SSoT)** pattern:

- **Primary State**: `sessions: Session[]` array containing all evaluation data
- **Active Context**: `activeSessionId` for current evaluation
- **UI State**: `ui` object for navigation and view preferences
- **Storage**: Chrome extension storage with atomic operations

### Component Hierarchy

```
Notebook (Root Router)
├── WelcomeApp
│   ├── Quick Start Guide
│   ├── Official Results Import
│   └── App Navigation Cards
├── ChallengesApp
│   ├── TypeSelector
│   ├── GyroSuiteView
│   ├── SDGGallery
│   ├── CustomBuilder
│   └── PromptWorkshop
├── JournalApp
│   ├── JournalHome (Session List)
│   ├── SessionView
│   ├── SynthesisSection
│   ├── AnalystSection
│   └── ReportSection
├── InsightsApp
│   ├── InsightsLibrary
│   ├── SuiteReports
│   ├── ModelTracker
│   └── InsightDetail
├── RapidTestApp (via Gadgets)
│   ├── Analysis Prompt
│   ├── Single JSON Evaluation
│   ├── Results Display
│   └── BehavioralBalanceGauge
└── SettingsApp
    ├── Data Management
    ├── Import/Export
    └── Preferences
```

---

## 🚀 Core Applications

### 1. Welcome App

**Purpose**: Entry point and onboarding experience

**Key Features**:
- **Quick Start Guide**: Interactive walkthrough of the evaluation process
- **Official Results Import**: One-click import of benchmark data from [GyroDiagnostics repository](https://github.com/gyrogovernance/diagnostics)
- **App Navigation**: Direct access to all major features
- **Progress Overview**: Current session status and completed evaluations

**User Flow**:
1. Landing page with clear value proposition
2. Option to import official benchmark data
3. Quick start for new evaluation
4. Resume existing session if available

### 2. Challenges App

**Purpose**: Challenge selection and configuration

**Key Features**:
- **Challenge Type Selection**: 5 core governance dimensions
- **GyroDiagnostics Suite**: Complete 5-challenge evaluation
- **SDG Gallery**: Sustainable Development Goals challenges
- **Custom Builder**: Create custom evaluation scenarios
- **Prompt Workshop**: Design and test evaluation prompts

**Challenge Types** (Governance Dimensions):
1. **Formal** (🧮): Physics & Mathematics - Mathematical rigor in policy analysis
2. **Normative** (⚖️): Policy & Ethics - Ethical frameworks for sustainable development
3. **Procedural** (💻): Code & Debugging - Implementation and process design
4. **Strategic** (🎲): Finance & Strategy - Resource allocation and long-term planning
5. **Epistemic** (🔍): Knowledge & Communication - Information sharing and community engagement

### 3. Journal App

**Purpose**: Multi-session workspace for active evaluations

**Key Features**:
- **Session Management**: Create, pause, resume, clone, delete sessions
- **Progress Tracking**: Real-time evaluation progress with visual indicators
- **Synthesis Interface**: 6-turn reasoning cycles with timer and model selection
- **Analyst Interface**: Dual-analyst evaluation with scoring forms (Analyst 1 and Analyst 2 for each epoch)
- **Report Generation**: Insight Overview with metrics calculation

**Session States**:
- **Active**: Currently in progress
- **Paused**: Temporarily stopped, can be resumed
- **Complete**: Finished evaluation with generated insight

**Navigation Flow**:
```
Journal Home → Session Selection → Epoch 1 → Epoch 2 → Analyst 1 (Epoch 1) → 
Analyst 1 (Epoch 2) → Analyst 2 (Epoch 1) → Analyst 2 (Epoch 2) → Report
```

### 4. Insights App

**Purpose**: Analysis and comparison of evaluation results

**Key Features**:
- **Library View**: Browse all insights with filtering and search
- **Suite Reports**: Aggregated analysis of complete GyroDiagnostics runs
- **Model Tracker**: Temporal comparison of model performance
- **Detail View**: Comprehensive insight analysis with metrics breakdown

**Multi-View Architecture**:
- **📖 Library**: Individual insight browsing and management
- **🎯 Suite Reports**: Complete evaluation suite analysis
- **📊 Model Tracker**: Cross-model performance comparison

**Visual Elements**:
- **Sparkline Charts**: Performance trends across challenges
- **Excellence Badges**: High-quality results (QI ≥ 80%)
- **Progress Rings**: Visual completion indicators
- **Status Badges**: Evaluation state and quality indicators

### 5. Rapid Test

**Purpose**: Accelerated quality assessment via JSON workflow

**Key Features**:
- **JSON Input**: Provide evaluation prompt and receive structured JSON response from AI
- **Single Analyst Evaluation**: One AI model scores using 12-metric rubric (structured JSON response)
- **Behavioral Balance Gauge**: Visual SI indicator with color-coded thresholds
- **Pathology Detection**: Identifies hallucinations, contradictions, goal drift, and other behavioral failure modes
- **Export Options**: Save as insight or export Markdown/JSON

**Workflow**:
1. **Provide Prompt**: Copy the evaluation prompt to your AI interface (references your conversation/topic)
2. **Receive JSON**: AI returns structured JSON with scoring data following the rubric
3. **Automated Processing**: System calculates QI, AR, SI from the JSON evaluation
4. **Visualization**: Display Behavioral Balance Gauge and detailed metrics breakdown
5. **Export or Save**: Export reports or save as insight

**Technical Details**: See Key Concepts for metric definitions and geometric decomposition methodology. JSON-only workflow; no transcript storage or handling. Single analyst evaluation pattern.

### 6. Settings App

**Purpose**: Configuration and data management

**Key Features**:
- **Data Import/Export**: JSON and ZIP file support
- **Storage Management**: Clear data and reset application state
- **Keyboard Shortcuts**: Customizable hotkeys for power users
- **Preferences**: UI customization and behavior settings

---

## 🛤️ User Journey

### New User Onboarding

1. **Welcome Screen**
   - Understand the platform's governance focus
   - Optionally import official benchmark data
   - Choose evaluation path (individual challenge or complete suite)

2. **Challenge Selection**
   - Select from SDG-aligned challenges (energy, healthcare, climate, etc.)
   - Choose governance dimension to evaluate
   - Review challenge requirements and context

3. **AI Interaction Process**
   - Copy prompts to your preferred AI chat (ChatGPT, Claude, etc.)
   - Capture AI responses using clipboard
   - Complete synthesis epochs (6 turns each)
   - Conduct analyst evaluations

4. **Governance Analysis**
   - Review validated governance insights
   - Compare AI solutions across different approaches
   - Export results for policy development or research

5. **Rapid Test** (Alternative Workflow)
   - Provide evaluation prompt and receive JSON response from AI
   - Get rapid quality assessment through automated metric calculation
   - View Behavioral Balance Gauge and Superintelligence Index
   - Save results as insights or export detailed reports

### Power User Workflow

1. **Community Governance Projects**
   - Create multiple evaluation sessions for different policy areas
   - Run parallel assessments across governance dimensions
   - Track progress across community initiatives

2. **Custom Policy Challenges**
   - Design domain-specific governance scenarios
   - Test custom evaluation prompts for local contexts
   - Validate policy frameworks and approaches

3. **Research & Policy Development**
   - Export validated insights for policy development
   - Compare AI solutions across different governance approaches
   - Generate research reports for academic or policy use

---

## 🌍 Target Communities

### Primary Users

- **Communities**: Evidence-based policy development and local governance
- **Researchers**: Reproducible governance experiments and academic studies
- **Policy Makers**: Quality assessment of AI recommendations for policy decisions
- **NGOs**: Validated advocacy proposals and impact assessment
- **Citizens**: Direct participation in AI governance and policy evaluation

### Use Cases

- **Energy Transition Policy**: Evaluating AI solutions for renewable energy adoption
- **Healthcare Equity**: Assessing AI recommendations for healthcare access
- **Climate Adaptation**: Validating AI strategies for climate resilience
- **Urban Planning**: Testing AI approaches to sustainable city development
- **Social Justice**: Evaluating AI solutions for equity and inclusion
- **AI Content Verification**: Assessing behavioral qualities in AI-generated content through rubric-based evaluation
- **Quality Assurance**: Validating AI responses for accuracy and coherence through multi-dimensional assessment
- **Research Analysis**: Analyzing AI conversation patterns for academic studies through quantitative metrics

---

## 🔄 Data Flow

### Session Lifecycle

```
Session Creation → Configuration → Synthesis → Analysis → Report Generation → Storage
```

### Data Persistence

- **Chrome Storage**: Primary persistence layer
- **Atomic Operations**: All state changes are atomic
- **Cross-Tab Sync**: Real-time synchronization across browser tabs
- **Backup & Restore**: Import/export functionality for data portability

### State Management

- **React State**: UI-specific state (forms, modals, navigation)
- **Chrome Storage**: Persistent application state
- **Session Helpers**: Centralized access to session data
- **Event Listeners**: Cross-component communication

---

## ⚙️ Technical Specifications

### Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **Build**: Webpack 5 with production optimizations
- **Storage**: Chrome Extension Storage API
- **State Management**: React hooks with Chrome storage sync

### Performance Characteristics

- **Bundle Size**: ~858 KiB (optimized for production)
- **Load Time**: <2 seconds on modern hardware
- **Memory Usage**: <50MB typical usage
- **Storage**: <10MB for typical usage patterns

### Browser Compatibility

- **Chrome**: 88+ (primary target)
- **Edge**: 88+ (Chromium-based)
- **Firefox**: Limited support (storage API differences)
- **Safari**: Not supported (no extension API)

### Security Considerations

- **No API Keys**: Users bring their own AI model access
- **Local Processing**: All evaluation logic runs locally
- **Data Privacy**: No external data transmission
- **Sandboxed**: Chrome extension security model

---

## 🔗 Integration Points

### GyroDiagnostics Framework

Provides the mathematical foundation for evaluation. See Key Concepts for methodology details.

- **Official Benchmarks**: Import validated results from [github.com/gyrogovernance/diagnostics](https://github.com/gyrogovernance/diagnostics)
- **Methodology Compliance**: Adheres to CGM principles
- **Research Contribution**: Supports open science initiatives

---

## ❓ Frequently Asked Questions

**Do I need technical expertise to use AI Inspector?**  
No. The extension provides a graphical interface with clipboard-based protocol. No coding or mathematical knowledge required.

**Which AI models are compatible?**  
Any AI chat interface that allows copy-paste. Tested with ChatGPT, Claude, Gemini, Poe, LMArena, and others.

**How long does an evaluation take?**  
Rapid Test: 5-10 minutes for a quick assessment. Full Challenge evaluation: 30-60 minutes depending on AI response time and complexity.

**Where is my data stored?**  
All data is stored locally in your browser using Chrome's extension storage API. No external transmission occurs unless you explicitly export data.

**Can I use this for academic research?**  
Yes. The extension is MIT licensed and designed for reproducible research. JSON exports include all metadata needed for research documentation.

**How accurate are the metrics?**  
The metrics are grounded in the Common Governance Model (CGM) formal system and validated through the GyroDiagnostics framework. They provide objective, reproducible measurements of behavioral qualities.

---

## 📞 Contact & Support

- **Repository**: [github.com/gyrogovernance/apps](https://github.com/gyrogovernance/apps)
- **GyroDiagnostics Framework**: [github.com/gyrogovernance/diagnostics](https://github.com/gyrogovernance/diagnostics)
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Community discussion forum on GitHub Discussions
- **License**: MIT License (code), local data storage

---

**© 2025 GyroGovernance. All rights reserved.**

*Built with ❤️ for the AI safety community*
