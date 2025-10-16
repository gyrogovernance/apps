import React, { useState } from 'react';

interface SmartTooltipProps {
  term: string;
  children: React.ReactNode;
  definition?: string;
  learnMoreUrl?: string;
}

// Canonical GyroDiagnostics term definitions
const TOOLTIP_REGISTRY: Record<string, { definition: string; learnMore?: string }> = {
  'QI': {
    definition: 'Quality Index: Weighted average of Structure (40%), Behavior (40%), and Specialization (20%) scores. Scale: 0-100%.',
    learnMore: '#quality-index'
  },
  'SI': {
    definition: 'Superintelligence Index: Measures structural coherence via K₄ graph topology. Target aperture A* ≈ 0.020701. Lower deviation = more balanced.',
    learnMore: '#superintelligence-index'
  },
  'AR': {
    definition: 'Alignment Rate: Quality points achieved per minute. Categories: VALID (0.03-0.15), SUPERFICIAL (>0.15), SLOW (<0.03). Units: /min.',
    learnMore: '#alignment-rate'
  },
  'Epoch': {
    definition: 'A 6-turn synthesis phase where an AI model generates autonomous reasoning on a governance challenge.',
  },
  'Analyst': {
    definition: 'An AI model that evaluates completed synthesis transcripts using structured rubrics (structure, behavior, specialization scores).',
  },
  'Aperture': {
    definition: 'Measure of non-associative residual in K₄ topology. A* = 0.020701 represents optimal spherical balance in behavior score distribution.',
  },
  'Pathology': {
    definition: 'Canonical failure modes: sycophantic_agreement, deceptive_coherence, goal_misgeneralization, superficial_optimization, semantic_drift.',
  }
};

export const SmartTooltip: React.FC<SmartTooltipProps> = ({ 
  term, 
  children, 
  definition,
  learnMoreUrl 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const info = TOOLTIP_REGISTRY[term] || { definition: definition || term };

  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="border-b border-dotted border-blue-600 dark:border-blue-400 cursor-help"
      >
        {children}
      </span>
      
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-2xl">
          <div className="font-semibold mb-1.5">{term}</div>
          <div className="text-gray-300 leading-relaxed">{info.definition}</div>
          {(info.learnMore || learnMoreUrl) && (
            <a 
              href={info.learnMore || learnMoreUrl} 
              className="text-blue-400 hover:underline mt-2 inline-block"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more →
            </a>
          )}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-900" />
        </div>
      )}
    </span>
  );
};

// Convenience wrapper components for common terms
export const QI: React.FC = () => <SmartTooltip term="QI">QI</SmartTooltip>;
export const SI: React.FC = () => <SmartTooltip term="SI">SI</SmartTooltip>;
export const AR: React.FC = () => <SmartTooltip term="AR">AR</SmartTooltip>;
export const EpochTerm: React.FC = () => <SmartTooltip term="Epoch">Epoch</SmartTooltip>;
export const AnalystTerm: React.FC = () => <SmartTooltip term="Analyst">Analyst</SmartTooltip>;

