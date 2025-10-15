# Changelog

All notable changes to the AI-Empowered Governance Apps browser extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0-Prototype] - 2025-10-16

### Added
- Chrome extension with Manifest V3 and side panel interface
- Three-step protocol: Participation → Preparation → Provision
- Challenge setup with type selection and UN SDGs domain integration
- AI synthesis with two-epoch process (6 turns each) and Element Picker
- Dual analyst evaluation with JSON validation and GyroDiagnostics scoring
- Quality calculations (Quality Index, Alignment Rate, Superintelligence Index)
- Export functionality (JSON, Markdown, GitHub contribution URLs)
- Chrome storage integration with persistent state management

### Changed
- Migrated to functional state updates to resolve race conditions
- Enhanced prompt generation with dynamic challenge integration
- Improved UI/UX with dark mode support and better user feedback

### Fixed
- Challenge content propagation from setup to synthesis prompts
- State race conditions between navigation and data updates
- Double turn markers in transcript parsing and validation
- GyroDiagnostics compliance with canonical challenge texts and scoring
- Element Picker message flow consistency

### Technical Details
- Chrome Extension (Manifest V3) + React + TypeScript
- Tailwind CSS with dark mode support
- Webpack 5 build system with Chrome Storage API
- GyroDiagnostics integration with canonical prompts and 120-point scoring

### Known Issues
- Bundle size warnings (400KB+ due to React dependencies)
- Performance optimization opportunities for large transcript handling

---

## Development Notes

This changelog tracks the initial prototype development phase completed on October 16th, 2025. This is the first version of the AI-Empowered Governance Apps browser extension, focused on establishing core functionality, user experience, and technical architecture. The extension serves as a prototype demonstrating the three-step protocol (Participation → Preparation → Provision) with GyroDiagnostics integration. While functional, this version requires further testing and refinement before full production deployment.
