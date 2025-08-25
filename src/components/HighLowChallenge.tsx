import React from 'react';
import { HighLowChallenge as ChallengeType } from '../types/game';
import './HighLowChallenge.css';

interface HighLowChallengeProps {
  currentChallenge?: ChallengeType;
  currentPlayerName: string;
  lastScore?: number;
  onSetChallenge: (direction: 'higher' | 'lower', targetScore: number) => void;
  showChallengeForm: boolean;
}

const HighLowChallenge: React.FC<HighLowChallengeProps> = ({
  currentChallenge,
  currentPlayerName,
  lastScore,
  onSetChallenge,
  showChallengeForm
}) => {
  const handleSetChallenge = (direction: 'higher' | 'lower') => {
    const fixedTarget = lastScore !== undefined ? lastScore : 40;
    onSetChallenge(direction, fixedTarget);
  };

  if (currentChallenge) {
    return (
      <div className="high-low-challenge active-challenge">
        <h3>Current Challenge</h3>
        <div className="challenge-display">
          <p>
            <strong>{currentPlayerName}</strong> must score{' '}
            <span className="direction">{currentChallenge.direction}</span> than{' '}
            <span className="target-score">{currentChallenge.targetScore}</span>
          </p>
        </div>
      </div>
    );
  }

  if (showChallengeForm) {
    const fixedTarget = lastScore !== undefined ? lastScore : 40;
    
    return (
      <div className="high-low-challenge challenge-form">
        <div className="challenge-buttons">
          <button
            type="button"
            onClick={() => handleSetChallenge('higher')}
            className="challenge-btn higher-btn"
          >
            ↑ Higher than {fixedTarget}
          </button>
          <button
            type="button"
            onClick={() => handleSetChallenge('lower')}
            className="challenge-btn lower-btn"
          >
            ↓ Lower than {fixedTarget}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="high-low-challenge waiting">
      <p>Waiting for challenge to be set...</p>
    </div>
  );
};

export default HighLowChallenge;
