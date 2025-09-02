import React from 'react';
import { useTranslation } from 'react-i18next';
import { HighLowChallenge as ChallengeType } from '../../../shared/types/game';
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
  const { t } = useTranslation();
  
  const handleSetChallenge = (direction: 'higher' | 'lower') => {
    const fixedTarget = lastScore !== undefined ? lastScore : 40;
    onSetChallenge(direction, fixedTarget);
  };

  if (currentChallenge) {
    return (
      <div className="high-low-challenge active-challenge">
        <h3>{t('game.challenge.currentChallenge')}</h3>
        <div className="challenge-display">
          <p>
            <strong>{currentPlayerName}</strong> {t('game.challenge.mustScore')}{' '}
            <span className="direction">{t(`game.challenge.${currentChallenge.direction}`)}</span> {t('game.challenge.than')}{' '}
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
            ↑ {t('game.challenge.higherThan', { score: fixedTarget })}
          </button>
          <button
            type="button"
            onClick={() => handleSetChallenge('lower')}
            className="challenge-btn lower-btn"
          >
            ↓ {t('game.challenge.lowerThan', { score: fixedTarget })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="high-low-challenge waiting">
      <p>{t('game.challenge.waitingForChallenge')}</p>
    </div>
  );
};

export default HighLowChallenge;
