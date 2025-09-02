import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GAME_CONSTANTS, UI_TEXT } from '../../../shared/utils/constants';
import { validatePlayerName } from '../../../shared/utils/validation';
import { sanitizePlayerNames } from '../../../shared/utils/textUtils';
import { useNotifications } from '../../../app/contexts/NotificationContext';
import { generateAriaId } from '../../../shared/utils/accessibility';
import './MultiStepSetup.css';

interface PlayersStepProps {
  playerNames: string[];
  onUpdatePlayerNames: (names: string[]) => void;
  onNext: () => void;
}

const PlayersStep: React.FC<PlayersStepProps> = ({ playerNames, onUpdatePlayerNames, onNext }) => {
  const [localPlayerNames, setLocalPlayerNames] = useState<string[]>(playerNames);
  const [lastAddedPlayerIndex, setLastAddedPlayerIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { showNotification } = useNotifications();

  const playersSectionId = generateAriaId('players-section');

  const handlePlayerNameChange = useCallback((index: number, name: string) => {
    const updatedNames = [...localPlayerNames];
    updatedNames[index] = name;
    setLocalPlayerNames(updatedNames);
  }, [localPlayerNames]);

  const addPlayer = useCallback(() => {
    if (localPlayerNames.length < GAME_CONSTANTS.MAX_PLAYERS) {
      const newIndex = localPlayerNames.length;
      setLocalPlayerNames([...localPlayerNames, '']);
      setLastAddedPlayerIndex(newIndex);
    } else {
      showNotification('warning', UI_TEXT.TOO_MANY_PLAYERS_ERROR);
    }
  }, [localPlayerNames, showNotification]);

  const removePlayer = useCallback((index: number) => {
    if (localPlayerNames.length > GAME_CONSTANTS.MIN_PLAYERS) {
      const updatedNames = localPlayerNames.filter((_, i) => i !== index);
      setLocalPlayerNames(updatedNames);
    } else {
      showNotification('warning', UI_TEXT.TOO_FEW_PLAYERS_ERROR);
    }
  }, [localPlayerNames, showNotification]);

  const handleContinue = useCallback(() => {
    const validNames = sanitizePlayerNames(localPlayerNames);

    // Validate all player names
    const invalidNames = validNames.filter(name => !validatePlayerName(name).isValid);
    if (invalidNames.length > 0) {
      showNotification('error', UI_TEXT.INVALID_PLAYER_NAME_ERROR);
      return;
    }

    if (validNames.length >= GAME_CONSTANTS.MIN_PLAYERS) {
      onUpdatePlayerNames(validNames);
      onNext();
    } else {
      showNotification('error', UI_TEXT.TOO_FEW_PLAYERS_ERROR);
    }
  }, [localPlayerNames, onUpdatePlayerNames, onNext, showNotification]);

  // Focus on the newly added player input field
  useEffect(() => {
    if (lastAddedPlayerIndex !== null && inputRefs.current[lastAddedPlayerIndex]) {
      inputRefs.current[lastAddedPlayerIndex]?.focus();
      setLastAddedPlayerIndex(null);
    }
  }, [lastAddedPlayerIndex]);

  // Focus on the first input when component mounts
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const isValidToContinue = localPlayerNames.every(name => name.trim().length > 0);

  return (
    <div className="step-players" role="region" aria-labelledby="players-title">
      <h1 id="players-title">Enter Player Names</h1>
      
      <div id={playersSectionId} className="players-section">
        <div className="player-inputs">
          {localPlayerNames.map((name, index) => (
            <div key={index} className="player-input">
              <label htmlFor={`player-${index}`} className="player-label">
                Player {index + 1}
              </label>
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                id={`player-${index}`}
                type="text"
                value={name}
                onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                placeholder={`Enter Player ${index + 1} name`}
                className={name.trim().length === 0 ? 'required' : ''}
                aria-required="true"
                aria-describedby={`${playersSectionId}-description`}
              />
              {localPlayerNames.length > GAME_CONSTANTS.MIN_PLAYERS && (
                <button
                  type="button"
                  onClick={() => removePlayer(index)}
                  className="remove-player-btn"
                  aria-label={`Remove player ${index + 1}`}
                  title="Remove player"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {localPlayerNames.length < GAME_CONSTANTS.MAX_PLAYERS && (
          <button
            type="button"
            onClick={addPlayer}
            className="add-player-btn"
            aria-describedby={`${playersSectionId}-description`}
          >
            Add Player
          </button>
        )}

        <p id={`${playersSectionId}-description`} className="step-description">
          Enter the names of all players. You need at least {GAME_CONSTANTS.MIN_PLAYERS} players to start.
        </p>
      </div>

      <div className="step-actions">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!isValidToContinue}
          className="continue-btn primary"
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default PlayersStep;
