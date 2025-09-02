import React from 'react';
import { GameMode } from '../../../shared/types/game';
import { GAME_CONSTANTS } from '../../../shared/utils/constants';

interface GameModeStepProps {
  gameMode: GameMode;
  onUpdateGameMode: (gameMode: GameMode) => void;
  onNext: () => void;
  onBack: () => void;
  onReset: () => void;
}

const GameModeStep: React.FC<GameModeStepProps> = ({ 
  gameMode, 
  onUpdateGameMode, 
  onNext, 
  onBack, 
  onReset 
}) => {
  const handleModeSelect = (selectedMode: GameMode) => {
    onUpdateGameMode(selectedMode);
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="step-game-mode" role="region" aria-labelledby="game-mode-title">
      <h1 id="game-mode-title">Choose Game Mode</h1>
      
      <div className="game-mode-options">
        <button
          type="button"
          className={`game-mode-button countdown ${gameMode === GAME_CONSTANTS.GAME_MODES.COUNTDOWN ? 'selected' : ''}`}
          onClick={() => handleModeSelect(GAME_CONSTANTS.GAME_MODES.COUNTDOWN)}
          aria-pressed={gameMode === GAME_CONSTANTS.GAME_MODES.COUNTDOWN}
        >
          <h2>Countdown</h2>
          <p>Start with a target score and count down to zero</p>
        </button>

        <button
          type="button"
          className={`game-mode-button high-low ${gameMode === GAME_CONSTANTS.GAME_MODES.HIGH_LOW ? 'selected' : ''}`}
          onClick={() => handleModeSelect(GAME_CONSTANTS.GAME_MODES.HIGH_LOW)}
          aria-pressed={gameMode === GAME_CONSTANTS.GAME_MODES.HIGH_LOW}
        >
          <h2>High-Low Challenge</h2>
          <p>Compete with lives and challenges</p>
        </button>
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

export default GameModeStep;
