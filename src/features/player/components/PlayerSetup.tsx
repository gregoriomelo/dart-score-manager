import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GameMode } from '../../../shared/types/game';
import { GAME_CONSTANTS } from '../../../shared/utils/constants';
import { UI_TEXT_KEYS, CSS_CLASSES } from '../../../shared/utils/i18nConstants';
import { validatePlayerName } from '../../../shared/utils/validation';
import { sanitizePlayerNames } from '../../../shared/utils/textUtils';
// Remove the useNotifications import since we don't want popup notifications
import { ACCESSIBILITY, generateAriaId } from '../../../shared/utils/accessibility';
import { AudioToggle } from '../../../shared/components';
import './PlayerSetup.css';

interface PlayerSetupProps {
  onStartGame: (playerNames: string[], gameMode: GameMode, startingScore: number, startingLives: number, totalRounds?: number) => void;
}

const PlayerSetup: React.FC<PlayerSetupProps> = React.memo(({ onStartGame }) => {
  const { t } = useTranslation();
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [gameMode, setGameMode] = useState<GameMode>(GAME_CONSTANTS.GAME_MODES.COUNTDOWN);
  const [startingScore, setStartingScore] = useState<number>(GAME_CONSTANTS.DEFAULT_STARTING_SCORE);
  const [startingLives, setStartingLives] = useState<number>(GAME_CONSTANTS.DEFAULT_STARTING_LIVES);
  const [totalRounds, setTotalRounds] = useState<number>(10);
  const [startingScoreInput, setStartingScoreInput] = useState<string>(GAME_CONSTANTS.DEFAULT_STARTING_SCORE.toString());
  const [startingLivesInput, setStartingLivesInput] = useState<string>(GAME_CONSTANTS.DEFAULT_STARTING_LIVES.toString());
  const [totalRoundsInput, setTotalRoundsInput] = useState<string>('10');
  const [lastAddedPlayerIndex, setLastAddedPlayerIndex] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // Remove the useNotifications hook since we don't want popup notifications

  // Generate unique IDs for accessibility
  const gameModeId = generateAriaId('game-mode');
  const startingScoreId = generateAriaId('starting-score');
  const startingLivesId = generateAriaId('starting-lives');
  const playersSectionId = generateAriaId('players-section');

  const handlePlayerNameChange = useCallback((index: number, name: string) => {
    const updatedNames = [...playerNames];
    updatedNames[index] = name;
    setPlayerNames(updatedNames);
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  }, [playerNames, validationError]);

  const addPlayer = useCallback(() => {
    if (playerNames.length < GAME_CONSTANTS.MAX_PLAYERS) {
      const newIndex = playerNames.length;
      setPlayerNames([...playerNames, '']);
      setLastAddedPlayerIndex(newIndex);
      setValidationError(''); // Clear any previous errors
    }
    // Remove the showNotification call - just don't add the player if limit reached
  }, [playerNames]);

  const removePlayer = useCallback((index: number) => {
    if (playerNames.length > GAME_CONSTANTS.MIN_PLAYERS) {
      const updatedNames = playerNames.filter((_, i) => i !== index);
      setPlayerNames(updatedNames);
      setValidationError(''); // Clear any previous errors
    }
    // Remove the showNotification call - just don't remove the player if at minimum
  }, [playerNames]);

  const handleStartGame = useCallback(() => {
    const validNames = sanitizePlayerNames(playerNames);

    // Validate all player names
    const invalidNames = validNames.filter(name => !validatePlayerName(name).isValid);
    if (invalidNames.length > 0) {
      setValidationError(t(UI_TEXT_KEYS.INVALID_PLAYER_NAME_ERROR));
      return;
    }

    if (validNames.length >= GAME_CONSTANTS.MIN_PLAYERS) {
      onStartGame(validNames, gameMode, startingScore, startingLives, totalRounds);
    } else {
      setValidationError(t(UI_TEXT_KEYS.TOO_FEW_PLAYERS_ERROR));
    }
  }, [playerNames, gameMode, startingScore, startingLives, totalRounds, onStartGame, t]);

  // Focus on the newly added player input field
  useEffect(() => {
    if (lastAddedPlayerIndex !== null && inputRefs.current[lastAddedPlayerIndex]) {
      inputRefs.current[lastAddedPlayerIndex]?.focus();
      setLastAddedPlayerIndex(null);
    }
  }, [lastAddedPlayerIndex]);

  const isValidToStart = useMemo(() => 
    sanitizePlayerNames(playerNames).length >= GAME_CONSTANTS.MIN_PLAYERS, 
    [playerNames]
  );

  return (
    <div className={CSS_CLASSES.PLAYER_SETUP} role="region" aria-labelledby="setup-title">
      <h1 id="setup-title">{t(UI_TEXT_KEYS.APP_HEADER)}</h1>
      <div className={CSS_CLASSES.SETUP_FORM} role="form" aria-labelledby="setup-title">
        <div className={CSS_CLASSES.GAME_MODE_SECTION}>
          <label className={CSS_CLASSES.GAME_MODE_LABEL}>{t(UI_TEXT_KEYS.GAME_MODE_LABEL)}</label>
          <div className={CSS_CLASSES.GAME_MODE_BUTTONS} role="group" aria-labelledby={gameModeId}>
            <button
              type="button"
              className={`${CSS_CLASSES.GAME_MODE_BUTTON} ${gameMode === GAME_CONSTANTS.GAME_MODES.COUNTDOWN ? CSS_CLASSES.GAME_MODE_BUTTON_ACTIVE : ''}`}
              onClick={() => setGameMode(GAME_CONSTANTS.GAME_MODES.COUNTDOWN)}
              aria-pressed={gameMode === GAME_CONSTANTS.GAME_MODES.COUNTDOWN}
              aria-describedby={`${gameModeId}-description`}
            >
              {t(GAME_CONSTANTS.GAME_MODE_NAMES.COUNTDOWN)}
            </button>
            <button
              type="button"
              className={`${CSS_CLASSES.GAME_MODE_BUTTON} ${gameMode === GAME_CONSTANTS.GAME_MODES.HIGH_LOW ? CSS_CLASSES.GAME_MODE_BUTTON_ACTIVE : ''}`}
              onClick={() => setGameMode(GAME_CONSTANTS.GAME_MODES.HIGH_LOW)}
              aria-pressed={gameMode === GAME_CONSTANTS.GAME_MODES.HIGH_LOW}
              aria-describedby={`${gameModeId}-description`}
            >
              {t(GAME_CONSTANTS.GAME_MODE_NAMES.HIGH_LOW)}
            </button>
            <button
              type="button"
              className={`${CSS_CLASSES.GAME_MODE_BUTTON} ${gameMode === GAME_CONSTANTS.GAME_MODES.ROUNDS ? CSS_CLASSES.GAME_MODE_BUTTON_ACTIVE : ''}`}
              onClick={() => setGameMode(GAME_CONSTANTS.GAME_MODES.ROUNDS)}
              aria-pressed={gameMode === GAME_CONSTANTS.GAME_MODES.ROUNDS}
              aria-describedby={`${gameModeId}-description`}
            >
              {t(GAME_CONSTANTS.GAME_MODE_NAMES.ROUNDS)}
            </button>
          </div>
          <div id={`${gameModeId}-description`} className="sr-only">
            {gameMode === GAME_CONSTANTS.GAME_MODES.COUNTDOWN 
              ? ACCESSIBILITY.DESCRIPTIONS.GAME_MODE_COUNTDOWN 
              : gameMode === GAME_CONSTANTS.GAME_MODES.HIGH_LOW
              ? ACCESSIBILITY.DESCRIPTIONS.GAME_MODE_HIGH_LOW
              : ACCESSIBILITY.DESCRIPTIONS.GAME_MODE_ROUNDS}
          </div>
        </div>

        {gameMode === GAME_CONSTANTS.GAME_MODES.COUNTDOWN && (
          <div className="input-with-audio">
            <div className="input-field">
              <label htmlFor={startingScoreId}>{t(UI_TEXT_KEYS.STARTING_SCORE_LABEL)}</label>
            <input
              id={startingScoreId}
              type="number"
              value={startingScoreInput}
              onChange={(e) => setStartingScoreInput(e.target.value)}
              onBlur={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setStartingScore(GAME_CONSTANTS.DEFAULT_STARTING_SCORE);
                  setStartingScoreInput(GAME_CONSTANTS.DEFAULT_STARTING_SCORE.toString());
                } else {
                  const numValue = parseInt(value, 10);
                  if (numValue > 0 && numValue <= 1000) {
                    setStartingScore(numValue);
                  } else {
                    setStartingScoreInput(startingScore.toString()); // Revert to previous valid value
                  }
                }
              }}
              onKeyDown={(e) => {
                // Allow: backspace, delete, tab, escape, enter, and navigation keys
                const allowedKeys = [
                  'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                  'Home', 'End'
                ];
                
                // Allow numbers 0-9
                const isNumber = /^[0-9]$/.test(e.key);
                
                if (!allowedKeys.includes(e.key) && !isNumber) {
                  e.preventDefault();
                }
              }}
              placeholder={t(UI_TEXT_KEYS.STARTING_SCORE_PLACEHOLDER)}
              aria-label={ACCESSIBILITY.LABELS.STARTING_SCORE_INPUT}
              aria-describedby={`${startingScoreId}-description`}
              min="1"
              max="1000"
              step="1"
              inputMode="numeric"
              pattern="[0-9]*"
            />
              <div id={`${startingScoreId}-description`} className="sr-only">
                {ACCESSIBILITY.DESCRIPTIONS.SCORE_LIMITS}
              </div>
            </div>
            <div className="audio-toggle-inline">
              <AudioToggle />
            </div>
          </div>
        )}

        {gameMode === GAME_CONSTANTS.GAME_MODES.HIGH_LOW && (
          <div className="input-with-audio">
            <div className="input-field">
              <label htmlFor={startingLivesId}>
                {t(UI_TEXT_KEYS.STARTING_LIVES_LABEL)}
              </label>
            <input
              id={startingLivesId}
              type="number"
              value={startingLivesInput}
              onChange={(e) => setStartingLivesInput(e.target.value)}
              onBlur={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setStartingLives(GAME_CONSTANTS.DEFAULT_STARTING_LIVES);
                  setStartingLivesInput(GAME_CONSTANTS.DEFAULT_STARTING_LIVES.toString());
                } else {
                  const numValue = parseInt(value, 10);
                  if (numValue >= 1 && numValue <= 10) {
                    setStartingLives(numValue);
                  } else {
                    setStartingLivesInput(startingLives.toString()); // Revert to previous valid value
                  }
                }
              }}
              onKeyDown={(e) => {
                // Allow: backspace, delete, tab, escape, enter, and navigation keys
                const allowedKeys = [
                  'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                  'Home', 'End'
                ];
                
                // Allow numbers 0-9
                const isNumber = /^[0-9]$/.test(e.key);
                
                if (!allowedKeys.includes(e.key) && !isNumber) {
                  e.preventDefault();
                }
              }}
              placeholder={t(UI_TEXT_KEYS.STARTING_LIVES_PLACEHOLDER)}
              aria-label={ACCESSIBILITY.LABELS.STARTING_LIVES_INPUT}
              aria-describedby={`${startingLivesId}-description`}
              min="1"
              max="10"
              step="1"
              inputMode="numeric"
              pattern="[0-9]*"
            />
              <div id={`${startingLivesId}-description`} className="sr-only">
                {ACCESSIBILITY.DESCRIPTIONS.LIVES_LIMITS}
              </div>
            </div>
            <div className="audio-toggle-inline">
              <AudioToggle />
            </div>
          </div>
        )}

        {gameMode === GAME_CONSTANTS.GAME_MODES.ROUNDS && (
          <div className="input-with-audio">
            <div className="input-field">
              <label htmlFor="totalRoundsId">{t(UI_TEXT_KEYS.TOTAL_ROUNDS_LABEL)}</label>
            <input
              id="totalRoundsId"
              type="number"
              value={totalRoundsInput}
              onChange={(e) => setTotalRoundsInput(e.target.value)}
              onBlur={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setTotalRounds(10);
                  setTotalRoundsInput('10');
                } else {
                  const numValue = parseInt(value, 10);
                  if (numValue >= 1 && numValue <= 50) {
                    setTotalRounds(numValue);
                  } else {
                    setTotalRoundsInput(totalRounds.toString()); // Revert to previous valid value
                  }
                }
              }}
              onKeyDown={(e) => {
                // Allow: backspace, delete, tab, escape, enter, and navigation keys
                const allowedKeys = [
                  'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                  'Home', 'End'
                ];
                
                // Allow numbers 0-9
                const isNumber = /^[0-9]$/.test(e.key);
                
                if (!allowedKeys.includes(e.key) && !isNumber) {
                  e.preventDefault();
                }
              }}
              placeholder={t(UI_TEXT_KEYS.TOTAL_ROUNDS_PLACEHOLDER)}
              aria-label={ACCESSIBILITY.LABELS.TOTAL_ROUNDS_INPUT}
              aria-describedby="totalRoundsId-description"
              min="1"
              max="50"
              step="1"
              inputMode="numeric"
              pattern="[0-9]*"
            />
              <div id="totalRoundsId-description" className="sr-only">
                {ACCESSIBILITY.DESCRIPTIONS.ROUNDS_LIMITS}
              </div>
            </div>
            <div className="audio-toggle-inline">
              <AudioToggle />
            </div>
          </div>
        )}

        <div className={CSS_CLASSES.PLAYERS_SECTION} id={playersSectionId} role="group" aria-labelledby="players-title">
          <h3 id="players-title">{t(UI_TEXT_KEYS.PLAYERS_SECTION_TITLE)}</h3>
          <div className="sr-only" id={`${playersSectionId}-description`}>
            {ACCESSIBILITY.DESCRIPTIONS.PLAYER_LIMITS}
          </div>
          {playerNames.map((name, index) => (
            <div key={index} className={CSS_CLASSES.PLAYER_INPUT}>
              <label htmlFor={`player-${index}`} className="sr-only">
                {t(UI_TEXT_KEYS.PLAYER_NAME_PLACEHOLDER, { index: index + 1 })}
              </label>
              <input
                id={`player-${index}`}
                type="text"
                placeholder={t(UI_TEXT_KEYS.PLAYER_NAME_PLACEHOLDER, { index: index + 1 })}
                value={name}
                onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                maxLength={GAME_CONSTANTS.MAX_PLAYER_NAME_LENGTH}
                ref={(el) => { inputRefs.current[index] = el; }}
                aria-label={ACCESSIBILITY.LABELS.PLAYER_NAME_INPUT}
                aria-describedby={`${playersSectionId}-description`}
              />
              {playerNames.length > GAME_CONSTANTS.MIN_PLAYERS && (
                <button
                  type="button"
                  onClick={() => removePlayer(index)}
                  className={CSS_CLASSES.REMOVE_PLAYER_BTN}
                  aria-label={`${ACCESSIBILITY.LABELS.REMOVE_PLAYER_BUTTON} ${index + 1}`}
                  title={`Remove player ${index + 1}`}
                >
                  <span aria-hidden="true">×</span>
                  <span className="sr-only">Remove player {index + 1}</span>
                </button>
              )}
            </div>
          ))}
          
          {playerNames.length < GAME_CONSTANTS.MAX_PLAYERS && (
            <button 
              type="button" 
              onClick={addPlayer} 
              className={CSS_CLASSES.ADD_PLAYER_BTN}
              aria-label={ACCESSIBILITY.LABELS.ADD_PLAYER_BUTTON}
            >
              {t(UI_TEXT_KEYS.ADD_PLAYER_BUTTON)}
            </button>
          )}
        </div>

        <button
          onClick={handleStartGame}
          disabled={!isValidToStart}
          className={CSS_CLASSES.START_GAME_BTN}
          aria-label={ACCESSIBILITY.LABELS.START_GAME_BUTTON}
          aria-describedby={validationError ? 'validation-error' : undefined}
        >
          {t(UI_TEXT_KEYS.START_GAME_BUTTON)}
        </button>
        
        {/* Display validation errors inline */}
        {validationError && (
          <div id="validation-error" className="validation-error" role="alert" aria-live="polite">
            {validationError}
          </div>
        )}
        
        {!isValidToStart && (
          <div id="start-game-error" className="sr-only" role="alert">
            {t('errors.tooFewPlayers')}
          </div>
        )}
      </div>
    </div>
  );
});

PlayerSetup.displayName = 'PlayerSetup';

export default PlayerSetup;
