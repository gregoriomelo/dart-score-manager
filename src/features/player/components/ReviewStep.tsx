import React from 'react';
import { GameMode } from '../../../shared/types/game';
import { GAME_CONSTANTS } from '../../../shared/utils/constants';

interface SetupData {
  playerNames: string[];
  gameMode: GameMode;
  startingScore: number;
  startingLives: number;
}

interface ReviewStepProps {
  setupData: SetupData;
  onStartGame: (playerNames: string[], gameMode: GameMode, startingScore: number, startingLives: number) => void;
  onBack: () => void;
  onReset: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ setupData, onStartGame, onBack, onReset }) => {
  const handleStartGame = () => {
    onStartGame(
      setupData.playerNames,
      setupData.gameMode,
      setupData.startingScore,
      setupData.startingLives
    );
  };

  const isCountdown = setupData.gameMode === GAME_CONSTANTS.GAME_MODES.COUNTDOWN;

  return (
    <div className="step-review" role="region" aria-labelledby="review-title">
      <h1 id="review-title">Review & Start Game</h1>
      
      <div className="review-summary">
        <div className="summary-section">
          <h2>Players</h2>
          <div className="player-list">
            {setupData.playerNames.map((name, index) => (
              <div key={index} className="player-item">
                Player {index + 1}: {name}
              </div>
            ))}
          </div>
        </div>

        <div className="summary-section">
          <h2>Game Mode</h2>
          <div className="mode-name">
            {isCountdown ? 'Countdown' : 'High-Low Challenge'}
          </div>
        </div>

        <div className="summary-section">
          <h2>Game Settings</h2>
          <div className="setting-value">
            {isCountdown 
              ? `Starting Score: ${setupData.startingScore}`
              : `Starting Lives: ${setupData.startingLives}`
            }
          </div>
        </div>
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
          onClick={handleStartGame}
          className="start-game-btn primary"
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;
