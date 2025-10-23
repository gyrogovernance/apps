import React, { useEffect } from 'react';
import { NotebookState, ChallengesView, ChallengeType, Platform } from '../../../types';
import { getChallengeById } from '../../../lib/challenges';
import TypeSelector from './TypeSelector';
import GyroSuiteView from './GyroSuiteView';
import SDGGallery from './SDGGallery';
import CustomBuilder from './CustomBuilder';
import PromptWorkshop from './PromptWorkshop';

interface ChallengesAppProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState> | ((prev: NotebookState) => Partial<NotebookState>)) => void;
  onStartSession: (challenge: {
    title: string;
    description: string;
    type: ChallengeType;
    domain: string[];
  }, platform: Platform) => void;
  onStartGyroSuite: (platform: Platform) => void;
}

const ChallengesApp: React.FC<ChallengesAppProps> = ({ 
  state, 
  onUpdate,
  onStartSession,
  onStartGyroSuite
}) => {
  const currentView = state.ui.challengesView || 'select-type';

  // Scroll to top whenever the challenges view changes
  useEffect(() => {
    const scrollToTop = () => {
      const scrollableContainer = document.querySelector('.overflow-y-auto');
      if (scrollableContainer) {
        scrollableContainer.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    scrollToTop();
    const timeoutId = setTimeout(scrollToTop, 50);
    return () => clearTimeout(timeoutId);
  }, [currentView]);

  const navigateToView = (view: ChallengesView) => {
    onUpdate(prev => ({
      ui: { ...prev.ui, challengesView: view }
    }));
  };

  const handleSDGSelect = (challengeId: string) => {
    const challenge = getChallengeById(challengeId);
    if (challenge) {
      // Start session with SDG challenge
      onStartSession(
        {
          title: challenge.title,
          description: challenge.prompt,
          type: challenge.type,
          domain: challenge.domain
        },
        'custom' // Default platform, user will select later
      );
    }
  };

  const handleGyroSuiteStart = () => {
    // Start Gyro Suite with all 5 challenges
    onStartGyroSuite('custom');
  };

  // Render current view
  switch (currentView) {
    case 'select-type':
      return <TypeSelector onNavigate={navigateToView} />;

    case 'gyro-suite':
      return (
        <GyroSuiteView
          onStart={handleGyroSuiteStart}
          onBack={() => navigateToView('select-type')}
        />
      );

    case 'sdg-gallery':
      return (
        <SDGGallery
          onSelect={handleSDGSelect}
          onBack={() => navigateToView('select-type')}
        />
      );

    case 'custom-builder':
      return (
        <CustomBuilder
          onNavigate={navigateToView}
          onStartSession={onStartSession}
          onBack={() => navigateToView('select-type')}
        />
      );

    case 'prompt-workshop':
      return (
        <PromptWorkshop
          onBack={() => navigateToView('custom-builder')}
        />
      );

    default:
      return <TypeSelector onNavigate={navigateToView} />;
  }
};

export default ChallengesApp;

