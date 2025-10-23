# GyroGovernance Apps - General Specifications

> **AI-Empowered Governance Apps Platform**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Product Suite](#product-suite)
3. [Architecture](#architecture)
4. [Core Applications](#core-applications)
5. [User Journey](#user-journey)
6. [Data Flow](#data-flow)
7. [Technical Specifications](#technical-specifications)
8. [Integration Points](#integration-points)
9. [Future Roadmap](#future-roadmap)

---

## 🎯 Overview

**GyroGovernance Apps** is a comprehensive platform for **AI-Empowered Participatory Governance**, built on the foundation of the **GyroDiagnostics** framework. The platform provides tools that transform everyday AI conversations into rigorous governance analysis, enabling communities, researchers, and policy makers to validate AI-generated solutions for UN Sustainable Development Goals and community challenges using mathematical assessment.

### Platform Scope

GyroGovernance Apps serves as the **general domain** for a suite of governance evaluation tools. Currently, it includes:

1. **AI Inspector** (Browser Extension) - The flagship tool for AI model evaluation and governance analysis

Future applications may include web apps, desktop tools, mobile applications, and specialized platforms for specific governance domains.

---

## 🔧 Product Suite

### AI Inspector (Browser Extension)

**Status**: Active Development  
**Platform**: Chrome Browser Extension (Manifest V3)  
**Purpose**: Real-time AI model evaluation using clipboard-based workflow

The AI Inspector browser extension is a comprehensive platform for evaluating AI model responses against governance challenges. It transforms everyday AI conversations into rigorous governance analysis through quantitative metrics and structured evaluation protocols.

#### Key Features

- **Multi-App Architecture**: Welcome, Challenges, Journal, Insights, Settings
- **Multi-Session Support**: Manage multiple evaluations simultaneously with browser-style tabs
- **Real-Time Sync**: Cross-tab synchronization using Chrome storage API
- **Glassmorphism UI**: Modern, unified design system with dark mode support
- **Platform Agnostic**: Clipboard-based workflow compatible with any AI service
- **Export Capabilities**: JSON and Markdown export for sharing and archiving

#### Mission Statement

> **Transform everyday AI conversations into rigorous governance analysis by democratizing access to sophisticated AI evaluation tools, enabling communities to validate AI-generated solutions for sustainable development and policy challenges through quantitative metrics.**

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
- **Detector App** - Rapid multi-dimensional quality assessment for AI conversation transcripts
  - Detector Input
  - Detector Analyst (Dual Evaluation)
  - Detector Results
  - Truth Spectrum Gauge
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
├── DetectorApp
│   ├── DetectorInput
│   ├── DetectorAnalyst (Dual Evaluation)
│   ├── DetectorResults
│   └── TruthSpectrumGauge
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

### 5. Detector App

**Purpose**: Rapid multi-dimensional quality assessment for AI conversation transcripts

**Key Features**:
- **Transcript Input**: Paste any AI conversation (3-6 turns recommended)
- **Multi-criteria Evaluation**: Seamless rubric-based assessment across 12 evaluation criteria
- **Dual Analyst Evaluation**: Two different AI models assess using structured rubrics
- **Risk Score (DRS)**: Mathematical 0-100 scoring based on scoring imbalance analysis
- **Risk Score Gauge**: Visual circular indicator showing deception risk level
- **Scoring Imbalance Detection**: Identifies when surface metrics (fluency) score high while foundational metrics (truthfulness) score low
- **Pathology Detection**: Identifies specific failure modes through scoring pattern analysis
- **Export Options**: Save as insight or export Markdown/JSON reports

**Workflow**:
1. **Input**: Paste AI conversation transcript
2. **Analysis**: Two AI models evaluate using structured evaluation rubrics
3. **Scoring**: Calculate Risk Score using geometric balance of evaluation criteria
4. **Visualization**: Display Risk Score Gauge and detailed metrics
5. **Export**: Save results as insight or export reports

**Technical Implementation**:
- **Multi-dimensional Assessment**: 12 predefined quality criteria with detailed scoring guidelines
- **Scoring Pattern Analysis**: Detects imbalances between surface and foundational metrics
- **Draft Persistence**: Temporary storage during analysis workflow
- **Insight Integration**: Saves completed analyses as GovernanceInsights

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

5. **AI Lie Detection** (Alternative Workflow)
   - Paste any AI conversation transcript
   - Get rapid structural deception analysis
   - View Truth Spectrum Gauge and Risk Score
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
- **AI Content Verification**: Detecting structural deception in AI-generated content
- **Quality Assurance**: Validating AI responses for accuracy and coherence
- **Research Analysis**: Analyzing AI conversation patterns for academic studies

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

## 📞 Contact & Support

- **Repository**: [github.com/gyrogovernance/apps](https://github.com/gyrogovernance/apps)
- **GyroDiagnostics Framework**: [github.com/gyrogovernance/diagnostics](https://github.com/gyrogovernance/diagnostics)
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Community discussion forum on GitHub Discussions
- **License**: MIT License (code), local data storage

---

**© 2025 GyroGovernance. All rights reserved.**

*Built with ❤️ for the AI safety community*
