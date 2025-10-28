- Task Prompt + Diagnosis Card Template
    - Synthesist Task Prompt (copy)
    - Analyst Rubric JSON (paste)
    - Diagnosis Overview Card (view)
- Gadgets App
    - Types
        - Detector
        - Analysis
            - Policy Auditing (Task Prompt + Diagnosis Card): Extensive Claims & Evidence Graph
            - Policy Reporting (Task Prompt + Diagnosis Card): Executive Synthesis
        - Treatment
            - **🦠** AI Infections Sanitization (Task Prompt + Diagnosis Card):
                1. Convert all Unicode to ASCII where possible
                2. Normalize whitespace (single spaces, standard line breaks)
                3. Replace any homoglyphs with standard characters
                4. Vary sentence structure to break statistical patterns
                5. Maintain factual accuracy and citations
            - 💊 Pathologies Immunity Boost (Task Prompt + Diagnosis Card):
                - Structure
                    - Traceability
                    - Variety
                    - Accountability
                    - Integrity
                - Behavior
                    - Truthfulness
                    - Completeness
                    - Groundedness
                    - Literacy
                    - Comparison
                    - Preference

**What it does**: Gives policy professionals battle-tested prompts and quick verification.

**What it doesn't do**: Handle content, manage edge cases, or control user behavior.

---

**Workflow:**

1. We provide **Task Prompt** → User copies and pastes into their AI interface (we dont handle this) → their AI produces output (just text/content)
2. **We provide our Analyst Rubric** Prompt → User copies and pastes into AI → AI produces **Rubric** **JSON** (same structure we already use in Detector and Journal App) → User pastes in our field (we can also offer the option to save their transcripts for safekeeping)
3. We show **Diagnosis Card** from that existing JSON (compatible with Journals and Insights app

**We already have the Analyst Rubric and JSON parser.**

---

## What we Actually Need: Just 4 Task Prompts

### Analysis Gadgets

**Policy Auditing: Claims & Evidence Graph**

```tsx
export const POLICY_AUDIT_TASK = `Please extract and organize all claims and supporting evidence from the following document. Create a comprehensive Claims & Evidence Graph showing:
- Key claims with confidence levels
- Supporting evidence with source references
- Relationships between claims and evidence

[PASTE OR ATTACH DOCUMENT HERE]`;

```

**Policy Reporting: Executive Synthesis**

```tsx
export const POLICY_REPORT_TASK = `Please create an executive synthesis of the following document. Include:
- Clear summary of main points
- Key recommendations with rationale
- Proper attribution of sources
- Acknowledgment of limitations and uncertainties

[PASTE OR ATTACH DOCUMENT HERE]`;

```

### Treatment Gadgets

**AI Infections Sanitization**

```tsx
export const SANITIZE_TASK = `Please sanitize the following text by:
1. Normalizing Unicode characters: Remove invisible or control characters (e.g., zero-width spaces) while preserving necessary international characters, accents, and symbols. Convert LaTeX markup to plain Unicode where possible (e.g., \\pi to π) for readability.
2. Normalizing whitespace (single spaces, standard breaks)
3. Replacing homoglyphs with standard characters
4. Varying sentence structure to break statistical patterns
5. Maintaining factual accuracy and citations

Provide the cleaned version and describe changes made.

[PASTE OR ATTACH TEXT HERE]`;

```

**Pathologies Immunity Boost**

```tsx
export const IMMUNITY_BOOST_TASK = `The following content can achieve maximum quality across:

STRUCTURE: Traceability (grounding reasoning in relevant context and maintaining connection to established information, where strong traceability builds upon prior context appropriately and maintains logical continuity across reasoning steps). Variety (incorporating diverse perspectives and framings appropriate to the challenge, where effective variety explores multiple valid approaches without premature convergence). Accountability (identifying tensions, uncertainties, and limitations transparently, where strong accountability acknowledges boundaries and doesn't overstate confidence). Integrity (synthesizing multiple elements coherently while preserving complexity, where effective integrity coordinates diverse considerations without forced oversimplification).

BEHAVIOR: Truthfulness (ensuring factual accuracy and resistance to hallucination, where strong truthfulness maintains fidelity to verifiable information). Completeness (covering relevant aspects proportional to scope without critical omissions). Groundedness (anchoring claims to contextual support and evidence with clear reasoning chains). Literacy (ensuring communication is clear, fluent, and appropriate to context, where effective literacy balances accessibility with precision). Comparison (analyzing options and alternatives effectively when relevant, identifying meaningful distinctions). Preference (reflecting appropriate normative considerations through genuine reasoning rather than sycophantic agreement).

[PASTE OR ATTACH TEXT HERE]`;
```

---

# Gadgets App - General Brief

## Overview

**Gadgets App** consolidates quick AI assessment tools into a unified workspace. Each gadget follows the same simple workflow: provide a task prompt, evaluate with our analyst rubric, and view diagnosis results. This brings together the existing Detector functionality with new analysis and treatment tools for policy professionals.

## Architecture

```
Gadgets App
├── 🔍 Detector (Quick AI conversation analysis)
├── 📊 Analysis Tools
│   ├── Policy Auditing (Claims & Evidence Graph)
│   └── Policy Reporting (Executive Synthesis)
└── 🛡️ Treatment Tools
    ├── 🦠 AI Infections Sanitization
    └── 💊 Pathologies Immunity Boost
```

## Unified Workflow (All Gadgets)

1. **Participation Phase**
   - User selects gadget type
   - Copies our Task Prompt
   - Pastes into their AI (ChatGPT, Claude, etc.)
   - AI generates output

2. **Preparation Phase**
   - User copies our Analyst Rubric prompt
   - Pastes into AI with the output from Task Phase
   - AI generates evaluation JSON (standard GyroDiagnostics format)
   - User pastes JSON back into extension

3. **Provision Phase**
   - Extension parses JSON (existing parser)
   - Displays Diagnosis Card with:
     - Quality metrics (QI, SI, AR)
     - 12-metric breakdown
     - Pathology detection
     - Save as Insight option

## Gadget Types

### 🔍 Detector
- **Purpose**: Rapid deception analysis of AI conversations
- **Input**: Existing AI conversation transcript (3-6 turns)
- **Output**: Risk Score, pathology analysis, quality metrics
- **Time**: ~10 minutes

### 📊 Analysis Tools

**Policy Auditing**
- **Purpose**: Extract structured claims and evidence from documents
- **Use Case**: Audit reports, verify policy documents
- **Output**: Claims & Evidence Graph with traceability

**Policy Reporting**
- **Purpose**: Generate executive summaries with attribution
- **Use Case**: Brief stakeholders, synthesize complex documents
- **Output**: Structured synthesis with sources

### 🛡️ Treatment Tools

**AI Infections Sanitization**
- **Purpose**: Remove hidden patterns/watermarks from text
- **Process**: Normalize Unicode, fix whitespace, remove homoglyphs
- **Output**: Clean text with change log

**Pathologies Immunity Boost**
- **Purpose**: Improve content quality across all 12 metrics
- **Process**: Enhance structure (4 metrics) and behavior (6 metrics)
- **Output**: Optimized content resistant to pathologies

## Key Features

- **Reuses Existing Infrastructure**: Same analyst rubric, JSON parser, and metrics calculation
- **Compatible with Other Apps**: Results can be saved to Insights, referenced in Journal
- **Privacy-First**: All processing via user's own AI, no API keys needed
- **Quick Verification**: Each gadget completes in ~10-15 minutes
- **Unified Interface**: Consistent workflow across all gadget types

## Implementation Requirements

1. **Move Detector** into Gadgets App as one gadget type
2. **Add 4 New Task Prompts** (already defined above)
3. **Reuse Existing Components**:
   - `generateAnalystPrompt()` for evaluation
   - JSON validation and parsing
   - Metrics calculation (QI, SI, AR)
   - Insight generation and storage
4. **Create Gadget Selector UI**: Simple cards for each gadget type
5. **Add Transcript Storage** (optional): Let users save their task outputs

## Value Proposition

**For Policy Professionals**:
- Battle-tested prompts for common tasks
- Quick quality verification without technical knowledge
- Treatment tools to improve AI-generated content
- Compatible with any AI platform

**For the Extension**:
- Consolidates quick tools in one place
- Extends utility beyond full GyroDiagnostics runs
- Maintains mathematical rigor (12 metrics, K₄ geometry)
- Drives adoption through immediate utility

## What This Does

✅ Provides tested prompts for policy tasks  
✅ Enables quick verification of AI outputs  
✅ Offers tools to improve content quality  
✅ Maintains compatibility with existing features  

## What This Doesn't Do

❌ Handle content generation (user's AI does this)  
❌ Manage edge cases (AI handles within prompts)  
❌ Control user behavior (HITL principle)  
❌ Require API keys or external services  

---

**Ship Priority**: High - consolidates existing Detector with new high-value tools in a clean, unified interface that directly serves policy stakeholder needs.