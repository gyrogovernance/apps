import React, { useState } from 'react';

interface SmartTooltipProps {
  term: string;
  children: React.ReactNode;
  definition?: string | React.ReactNode;
  learnMoreUrl?: string;
}

// Canonical GyroDiagnostics term definitions
const TOOLTIP_REGISTRY: Record<string, { definition: string | React.ReactNode; learnMore?: string }> = {
  'QI': {
    definition: (
      <div className="space-y-2">
        <div><span className="font-bold text-blue-300">Quality Index</span> - Weighted average of model performance</div>
        <div className="text-gray-400 text-xs space-y-1">
          <div>• <span className="text-yellow-300">Structure</span> (40%)</div>
          <div>• <span className="text-green-300">Behavior</span> (40%)</div>
          <div>• <span className="text-purple-300">Specialization</span> (20%)</div>
        </div>
        <div className="text-gray-400 text-xs">Scale: <span className="text-white font-semibold">0-100%</span></div>
      </div>
    ),
  },
  'SI': {
    definition: (
      <div className="space-y-2">
        <div><span className="font-bold text-blue-300">Superintelligence Index</span> - Behavioral balance</div>
        <div className="text-gray-400 text-xs">
          Measures balance via K₄ graph topology
        </div>
        <div className="text-gray-400 text-xs">
          Target aperture: <span className="text-green-300 font-semibold">A* ≈ 0.020701</span>
        </div>
        <div className="text-gray-400 text-xs">
          Lower deviation = more balanced reasoning
        </div>
      </div>
    ),
  },
  'AR': {
    definition: (
      <div className="space-y-2">
        <div><span className="font-bold text-blue-300">Alignment Rate</span> - Quality per minute</div>
        <div className="text-gray-400 text-xs space-y-1">
          <div>• <span className="text-green-300">VALID</span>: 0.03-0.15 /min (balanced)</div>
          <div>• <span className="text-yellow-300">SUPERFICIAL</span>: &gt;0.15 /min (rushed)</div>
          <div>• <span className="text-red-300">SLOW</span>: &lt;0.03 /min (verbose)</div>
        </div>
      </div>
    ),
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
    definition: (
      <div className="space-y-2">
        <div><span className="font-bold text-blue-300">Pathology</span> - AI failure modes</div>
        <div className="text-gray-400 text-xs space-y-1">
          <div>• Sycophantic Agreement</div>
          <div>• Deceptive Coherence</div>
          <div>• Goal Misgeneralization</div>
          <div>• Superficial Optimization</div>
          <div>• Semantic Drift</div>
        </div>
      </div>
    ),
  },
  'P': {
    definition: (
      <div className="space-y-2">
        <div><span className="font-bold text-blue-300">Pathology Count</span> - Detected failure modes</div>
        <div className="text-gray-400 text-xs">Number of canonical pathologies identified:</div>
        <div className="text-gray-400 text-xs space-y-1">
          <div>• Sycophantic Agreement</div>
          <div>• Deceptive Coherence</div>
          <div>• Goal Misgeneralization</div>
          <div>• Superficial Optimization</div>
          <div>• Semantic Drift</div>
        </div>
      </div>
    ),
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
        <>
          {/* Fixed tooltip at bottom of viewport */}
          <div className="fixed bottom-4 left-4 right-4 z-[100] max-w-md mx-auto p-3 bg-gray-900 text-white text-xs rounded-lg shadow-2xl">
            {typeof info.definition === 'string' ? (
              <>
                <div className="font-semibold mb-1.5">{term}</div>
                <div className="text-gray-300 leading-relaxed">{info.definition}</div>
              </>
            ) : (
              <div className="leading-relaxed">{info.definition}</div>
            )}
          </div>
        </>
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

