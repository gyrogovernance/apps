import React from 'react';
import GlassCard from '../../shared/GlassCard';

const DetectorGuide: React.FC = () => {
  return (
    <GlassCard className="p-4 mb-4" variant="glassBlue">
      <p className="text-sm text-gray-700 dark:text-gray-300">
        This tool uses automated multi-dimensional quality assessment to evaluate AI responses across 12 evaluation criteria.
        It detects scoring imbalances where surface metrics (fluency, presentation) score high while foundational metrics 
        (truthfulness, groundedness) score low - revealing deceptive coherence patterns.
      </p>
    </GlassCard>
  );
};

export default DetectorGuide;