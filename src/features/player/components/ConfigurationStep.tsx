import React, { useState, useCallback } from 'react';
import { GameMode } from '../../../shared/types/game';
import { GAME_CONSTANTS } from '../../../shared/utils/constants';

interface ConfigurationStepProps {
  gameMode: GameMode;
  startingScore: number;
  startingLives: number;
  onUpdateScore: (score: number) => void;
  onUpdateLives: (lives: number) => void;
  onNext: () => void;
  onBack: () => void;
  onReset: () => void;
}

const ConfigurationStep: React.FC<ConfigurationStepProps> = ({
  gameMode,
  startingScore,
  startingLives,
  onUpdateScore,
  onUpdateLives,
  onNext,
  onBack,
  onReset
}) => {
  const [localScore, setLocalScore] = useState(startingScore);
  const [localLives, setLocalLives] = useState(startingLives);

  const handleScoreChange = useCallback((score: number) => {
    setLocalScore(score);
    onUpdateScore(score);
  }, [onUpdateScore]);

  const handleLivesChange = useCallback((lives: number) => {
    setLocalLives(lives);
    onUpdateLives(lives);
  }, [onUpdateLives]);

  const handleContinue = useCallback(() => {
    onNext();
  }, [onNext]);

  const isCountdown = gameMode === GAME_CONSTANTS.GAME_MODES.COUNTDOWN;

  return (
    <div className="step-configuration" role="region" aria-labelledby="configuration-title">
      <h1 id="configuration-title">
        {isCountdown ? 'Set Target Score' : 'Set Starting Lives'}
      </h1>
      
      <div className="configuration-section">
        {isCountdown ? (
          <div className="score-configuration">
            <label htmlFor="starting-score" className="configuration-label">
              Target Score
            </label>
            <input
              id="starting-score"
              type="number"
              min="1"
              max="1000"
              value={localScore}
              onChange={(e) => handleScoreChange(parseInt(e.target.value) || 501)}
              className="configuration-input"
            />
            
            <div className="preset-buttons">
              <button
                type="button"
                onClick={() => handleScoreChange(301)}
                className="preset-button"
              >
                301
              </button>
              <button
                type="button"
                onClick={() => handleScoreChange(501)}
                className="preset-button"
              >
                501
              </button>
              <button
                type="button"
                onClick={() => handleScoreChange(701)}
                className="preset-button"
              >
                701
              </button>
            </div>
          </div>
        ) : (
          <div className="lives-configuration">
            <label htmlFor="starting-lives" className="configuration-label">
              Starting Lives
            </label>
            <input
              id="starting-lives"
              type="number"
              min="1"
              max="10"
              value={localLives}
              onChange={(e) => handleLivesChange(parseInt(e.target.value) || 5)}
              className="configuration-input"
            />
            
            <div className="preset-buttons">
              <button
                type="button"
                onClick={() => handleLivesChange(3)}
                className="preset-button"
              >
                3
              </button>
              <button
                type="button"
                onClick={() => handleLivesChange(5)}
                className="preset-button"
              >
                5
              </button>
              <button
                type="button"
                onClick={() => handleLivesChange(7)}
                className="preset-button"
              >
                7
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="step-actions">
        <button
          type="button"
          onClick={onBack}
          className="back-btn secondary"
        >
          ← Back
        </button>
        
        <button
          type="button"
          onClick={onReset}
          className="reset-btn secondary"
        >
          Reset
        </button>
        
        <button
          type="button"
          onClick={handleContinue}
          className="continue-btn primary"
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default ConfigurationStep;
