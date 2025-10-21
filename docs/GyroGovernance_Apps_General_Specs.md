# GyroGovernance Apps - General Specifications

> **AI-Empowered Governance Apps Browser Extension**  
> **Version 0.2.3-Alpha**  
> **Last Updated: October 21, 2025**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Applications](#core-applications)
4. [User Journey](#user-journey)
5. [Data Flow](#data-flow)
6. [Technical Specifications](#technical-specifications)
7. [Integration Points](#integration-points)
8. [Future Roadmap](#future-roadmap)

---

## 🎯 Overview

The **GyroGovernance Apps** browser extension is a comprehensive platform for **AI-Empowered Participatory Governance**, built on the foundation of the **GyroDiagnostics** framework. It transforms everyday AI conversations into rigorous governance analysis, enabling communities, researchers, and policy makers to validate AI-generated solutions for UN Sustainable Development Goals and community challenges using mathematical assessment.

### Mission Statement

> **Transform everyday AI conversations into rigorous governance analysis by democratizing access to sophisticated AI evaluation tools, enabling communities to validate AI-generated solutions for sustainable development and policy challenges through quantitative metrics.**

### Key Principles

- **Participatory Governance**: Enables communities to validate AI solutions for real-world challenges
- **Platform Agnostic**: Clipboard-based workflow works with any AI model (ChatGPT, Claude, Gemini, etc.)
- **Open Source**: All insights and evaluation data contribute to public knowledge commons (CC0)
- **Scientific Rigor**: Based on mathematical-physics principles from the Common Governance Model (CGM)
- **Sustainable Development**: Focused on UN SDGs and community-driven policy challenges
- **Reproducible**: All evaluations use public API access for independent verification

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GyroGovernance Apps                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Welcome   │  │ Challenges  │  │   Journal   │        │
│  │     App     │  │     App     │  │     App     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Insights   │  │  Settings   │  │   Shared    │        │
│  │     App     │  │     App     │  │ Components  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    Core Libraries                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Storage   │  │  Session    │  │   Report    │        │
│  │ Management  │  │  Helpers    │  │ Generator   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │Calculations │  │   Import    │  │   Export    │        │
│  │ & Metrics   │  │   Utils     │  │   Utils     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

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
- **Analyst Interface**: Dual-analyst evaluation with scoring forms
- **Report Generation**: Automated insight creation with metrics calculation

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
- **📚 Library**: Individual insight browsing and management
- **🎯 Suite Reports**: Complete evaluation suite analysis
- **📊 Model Tracker**: Cross-model performance comparison

**Visual Elements**:
- **Sparkline Charts**: Performance trends across challenges
- **Excellence Badges**: High-quality results (QI ≥ 80%)
- **Progress Rings**: Visual completion indicators
- **Status Badges**: Evaluation state and quality indicators

### 5. Settings App

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

- **Direct Integration**: Built on GyroDiagnostics methodology
- **Official Results**: Import benchmark data from official repository
- **Methodology Compliance**: Follows all CGM principles and metrics
- **Research Alignment**: Contributes to open science initiatives

---

**© 2025 GyroGovernance. All rights reserved.**

*Built with ❤️ for the AI safety community*
