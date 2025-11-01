import React from 'react';
import { NotebookState } from '../../../types';
import GlassCard from '../../shared/GlassCard';

interface GlossaryAppProps {
  state: NotebookState;
  onClose: () => void;
}

export const GlossaryApp: React.FC<GlossaryAppProps> = ({ state, onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop with heavy blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
      
      {/* Modal content */}
      <div className="relative w-full max-w-5xl h-[96vh] flex flex-col">
        <GlassCard variant="glassBlue" density="default" className="h-full flex flex-col p-0">
          <div className="flex flex-col h-full relative">
            {/* Header */}
            <div className="p-3 border-b border-white/20 flex-shrink-0 flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                📖 GyroDiagnostics Glossary
              </h1>
              <button
                onClick={onClose}
                className="rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close glossary"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-3 min-h-0">
              <div className="space-y-5">
                {/* Core Metrics */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                      1
                    </span>
                    Core Metrics
                  </h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-3 bg-white/90 dark:bg-black/90 rounded-lg border border-white/20">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">Quality Index (QI)</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Weighted overall performance score (0-100%)
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <strong>Calculation:</strong> Weighted average of Structure, Behavior, and Specialization scores
                      </div>
                    </div>
                    
                    <div className="p-3 bg-white/90 dark:bg-black/90 rounded-lg border border-white/20">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">Alignment Rate (AR)</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Quality points per minute (efficiency metric)
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <strong>Categories:</strong> VALID (0.03–0.15 /min), SUPERFICIAL (&gt;0.15 /min), SLOW (&lt;0.03 /min)
                      </div>
                    </div>
                    
                    <div className="p-3 bg-white/90 dark:bg-black/90 rounded-lg border border-white/20 md:col-span-2">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">Superintelligence Index (SI)</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Structural coherence measure across 6 behavior dimensions (theoretical optimum = 100)
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <div><strong>What it measures:</strong> Whether your behavior scores reflect a coherent latent structure (like consistent differences between nodes in a graph) rather than random or uniform values.</div>
                        <div><strong>Key insight:</strong> Flat scores (all 8s, all 9s) yield low SI (~12) because they lack structure. Balanced opposing adjustments (e.g., one dimension high, another low) raise SI by reducing residual energy toward the target aperture A* ≈ 0.02070.</div>
                        <div><strong>Interpretation:</strong> SI rewards structured patterns, not just high averages. High QI with low SI suggests uniform quality without dimensional coherence.</div>
                      </div>
                    </div>
                    
                    
                  </div>
                </section>

                {/* Structure Metrics */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-2 text-xs font-bold text-green-600 dark:text-green-400">
                      2
                    </span>
                    Structure Metrics
                  </h2>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Traceability</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Logical reasoning chain clarity</p>
                    </div>
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Variety</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Diverse approach exploration</p>
                    </div>
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Accountability</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Responsibility and ownership clarity</p>
                    </div>
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Integrity</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Consistency and coherence</p>
                    </div>
                  </div>
                </section>

                {/* Behavior Metrics */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <span className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                      3
                    </span>
                    Behavior Metrics
                  </h2>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Accuracy</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Factual correctness and precision</p>
                    </div>
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Reliability</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Consistent performance patterns</p>
                    </div>
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Literacy</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Communication clarity and effectiveness</p>
                    </div>
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Groundedness</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Real-world applicability and practicality</p>
                    </div>
                  </div>
                </section>

                {/* Specialization Metrics */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <span className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-2 text-xs font-bold text-orange-600 dark:text-orange-400">
                      4
                    </span>
                    Specialization Metrics
                  </h2>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Expertise</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Domain-specific knowledge depth</p>
                    </div>
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Innovation</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Creative problem-solving approaches</p>
                    </div>
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Adaptability</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Flexibility in changing contexts</p>
                    </div>
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Collaboration</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Teamwork and stakeholder engagement</p>
                    </div>
                  </div>
                </section>

                {/* Pathologies */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <span className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-2 text-xs font-bold text-red-600 dark:text-red-400">
                      5
                    </span>
                    Pathologies (Failure Modes)
                  </h2>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg border-l-4 border-red-200 dark:border-red-800">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Sycophantic Agreement</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Excessive agreement without critical analysis</p>
                    </div>
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg border-l-4 border-red-200 dark:border-red-800">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Deceptive Coherence</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Superficial consistency masking underlying issues</p>
                    </div>
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg border-l-4 border-red-200 dark:border-red-800">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Goal Misgeneralization</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Misunderstanding or misapplying objectives</p>
                    </div>
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg border-l-4 border-red-200 dark:border-red-800">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Superficial Optimization</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Shallow solutions without deep understanding</p>
                    </div>
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg border-l-4 border-red-200 dark:border-red-800">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">Semantic Drift</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Gradual deviation from original meaning</p>
                    </div>
                  </div>
                </section>

                {/* Challenge Types */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <span className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mr-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      6
                    </span>
                    Challenge Types (Governance Dimensions)
                  </h2>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm flex items-center">
                        <span className="mr-2">🧮</span> Formal
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Physics & Mathematics - Mathematical rigor in policy analysis</p>
                    </div>
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm flex items-center">
                        <span className="mr-2">⚖️</span> Normative
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Policy & Ethics - Ethical frameworks for sustainable development</p>
                    </div>
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm flex items-center">
                        <span className="mr-2">💻</span> Procedural
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Code & Debugging - Implementation and process design</p>
                    </div>
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm flex items-center">
                        <span className="mr-2">🎲</span> Strategic
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Finance & Strategy - Resource allocation and long-term planning</p>
                    </div>
                    <div className="p-2 bg-white/90 dark:bg-black/90 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm flex items-center">
                        <span className="mr-2">🔍</span> Epistemic
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Knowledge & Communication - Information sharing and community engagement</p>
                    </div>
                  </div>
                </section>

                {/* Methodology */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <span className="w-6 h-6 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mr-2 text-xs font-bold text-teal-600 dark:text-teal-400">
                      7
                    </span>
                    Methodology
                  </h2>
                  <div className="space-y-3">
                    <div className="p-3 bg-white/90 dark:bg-black/90 rounded-lg border border-white/20">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Three-Phase Protocol</h3>
                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                        <div><strong>1. Participation:</strong> Frame your governance challenge</div>
                        <div><strong>2. Preparation:</strong> AI generates 6 turns across 2 epochs</div>
                        <div><strong>3. Provision:</strong> Mathematical inspection produces validated report</div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-white/90 dark:bg-black/90 rounded-lg border border-white/20">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Tensegrity Geometry</h3>
                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                        <div>• Maps reasoning to geometric structure</div>
                        <div>• Decomposes into coherence vs. adaptation components</div>
                        <div>• Measures against theoretical optimum (A* ≈ 0.02070)</div>
                        <div>• Uses K₄ complete graph topology for bias elimination</div>
                      </div>
                    </div>
                  </div>
                </section>

                       {/* Promotional Card */}
                       <section>
                         <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                           <div className="text-center">
                             <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                               🌐 Learn More About GyroDiagnostics
                             </h3>
                             <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                               Explore the full framework and contribute to AI governance research
                             </p>
                             <div className="flex gap-2 justify-center">
                               <a
                                 href="https://gyrogovernance.com"
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-xs font-medium flex items-center gap-1"
                               >
                                 <span>🌐</span>
                                 <span>Visit Website</span>
                               </a>
                               <a
                                 href="https://github.com/gyrogovernance/diagnostics"
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors text-xs font-medium flex items-center gap-1"
                               >
                                 <span>📂</span>
                                 <span>View Repository</span>
                               </a>
                             </div>
                           </div>
                         </div>
                       </section>
              </div>
            </div>

          </div>
        </GlassCard>
      </div>
    </div>
  );
};
