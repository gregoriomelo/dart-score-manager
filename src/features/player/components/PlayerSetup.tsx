import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { GameMode } from '../../../shared/types/game';
import { GAME_CONSTANTS, UI_TEXT, CSS_CLASSES } from '../../../shared/utils/constants';
import { validatePlayerName } from '../../../shared/utils/validation';
import { sanitizePlayerNames } from '../../../shared/utils/textUtils';
import { useNotifications } from '../../../app/contexts/NotificationContext';
import { ACCESSIBILITY, generateAriaId } from '../../../shared/utils/accessibility';
import './PlayerSetup.css';

interface PlayerSetupProps {
  onStartGame: (playerNames: string[], gameMode: GameMode, startingScore: number, startingLives: number) => void;
}

const PlayerSetup: React.FC<PlayerSetupProps> = React.memo(({ onStartGame }) => {
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [gameMode, setGameMode] = useState<GameMode>(GAME_CONSTANTS.GAME_MODES.COUNTDOWN);
  const [startingScore, setStartingScore] = useState<number>(GAME_CONSTANTS.DEFAULT_STARTING_SCORE);
  const [startingLives, setStartingLives] = useState<number>(GAME_CONSTANTS.DEFAULT_STARTING_LIVES);
  const [lastAddedPlayerIndex, setLastAddedPlayerIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { showNotification } = useNotifications();

  // Generate unique IDs for accessibility
  const gameModeId = generateAriaId('game-mode');
  const startingScoreId = generateAriaId('starting-score');
  const startingLivesId = generateAriaId('starting-lives');
  const playersSectionId = generateAriaId('players-section');

  const handlePlayerNameChange = useCallback((index: number, name: string) => {
    const updatedNames = [...playerNames];
    updatedNames[index] = name;
    setPlayerNames(updatedNames);
  }, [playerNames]);

           const addPlayer = useCallback(() => {
           if (playerNames.length < GAME_CONSTANTS.MAX_PLAYERS) {
             const newIndex = playerNames.length;
             setPlayerNames([...playerNames, '']);
             setLastAddedPlayerIndex(newIndex);
           } else {
             showNotification('warning', UI_TEXT.TOO_MANY_PLAYERS_ERROR);
           }
         }, [playerNames, showNotification]);

           const removePlayer = useCallback((index: number) => {
           if (playerNames.length > GAME_CONSTANTS.MIN_PLAYERS) {
             const updatedNames = playerNames.filter((_, i) => i !== index);
             setPlayerNames(updatedNames);
           } else {
             showNotification('warning', UI_TEXT.TOO_FEW_PLAYERS_ERROR);
           }
         }, [playerNames, showNotification]);

           const handleStartGame = useCallback(() => {
           const validNames = sanitizePlayerNames(playerNames);

           // Validate all player names
           const invalidNames = validNames.filter(name => !validatePlayerName(name).isValid);
           if (invalidNames.length > 0) {
             showNotification('error', UI_TEXT.INVALID_PLAYER_NAME_ERROR);
             return;
           }

           if (validNames.length >= GAME_CONSTANTS.MIN_PLAYERS) {
             onStartGame(validNames, gameMode, startingScore, startingLives);
           } else {
             showNotification('error', UI_TEXT.TOO_FEW_PLAYERS_ERROR);
           }
         }, [playerNames, gameMode, startingScore, startingLives, onStartGame, showNotification]);

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
      <h1 id="setup-title">{UI_TEXT.APP_HEADER}</h1>
      <div className={CSS_CLASSES.SETUP_FORM} role="form" aria-labelledby="setup-title">
        <div className={CSS_CLASSES.GAME_MODE_SECTION}>
          <label className={CSS_CLASSES.GAME_MODE_LABEL}>{UI_TEXT.GAME_MODE_LABEL}</label>
          <div className={CSS_CLASSES.GAME_MODE_BUTTONS} role="group" aria-labelledby={gameModeId}>
            <button
              type="button"
              className={`${CSS_CLASSES.GAME_MODE_BUTTON} ${gameMode === GAME_CONSTANTS.GAME_MODES.COUNTDOWN ? CSS_CLASSES.GAME_MODE_BUTTON_ACTIVE : ''}`}
              onClick={() => setGameMode(GAME_CONSTANTS.GAME_MODES.COUNTDOWN)}
              aria-pressed={gameMode === GAME_CONSTANTS.GAME_MODES.COUNTDOWN}
              aria-describedby={`${gameModeId}-description`}
            >
              {GAME_CONSTANTS.GAME_MODE_NAMES.COUNTDOWN}
            </button>
            <button
              type="button"
              className={`${CSS_CLASSES.GAME_MODE_BUTTON} ${gameMode === GAME_CONSTANTS.GAME_MODES.HIGH_LOW ? CSS_CLASSES.GAME_MODE_BUTTON_ACTIVE : ''}`}
              onClick={() => setGameMode(GAME_CONSTANTS.GAME_MODES.HIGH_LOW)}
              aria-pressed={gameMode === GAME_CONSTANTS.GAME_MODES.HIGH_LOW}
              aria-describedby={`${gameModeId}-description`}
            >
              {GAME_CONSTANTS.GAME_MODE_NAMES.HIGH_LOW}
            </button>
          </div>
          <div id={`${gameModeId}-description`} className="sr-only">
            {gameMode === GAME_CONSTANTS.GAME_MODES.COUNTDOWN 
              ? ACCESSIBILITY.DESCRIPTIONS.GAME_MODE_COUNTDOWN 
              : ACCESSIBILITY.DESCRIPTIONS.GAME_MODE_HIGH_LOW}
          </div>
        </div>

        {gameMode === GAME_CONSTANTS.GAME_MODES.COUNTDOWN && (
          <div>
            <label htmlFor={startingScoreId}>{UI_TEXT.STARTING_SCORE_LABEL}</label>
            <input
              id={startingScoreId}
              type="number"
              value={startingScore}
              onChange={(e) => setStartingScore(parseInt(e.target.value) || GAME_CONSTANTS.DEFAULT_STARTING_SCORE)}
              placeholder={UI_TEXT.STARTING_SCORE_PLACEHOLDER}
              aria-label={ACCESSIBILITY.LABELS.STARTING_SCORE_INPUT}
              aria-describedby={`${startingScoreId}-description`}
              min="1"
              max="1000"
            />
            <div id={`${startingScoreId}-description`} className="sr-only">
              {ACCESSIBILITY.DESCRIPTIONS.SCORE_LIMITS}
            </div>
          </div>
        )}

        {gameMode === GAME_CONSTANTS.GAME_MODES.HIGH_LOW && (
          <div>
            <label htmlFor={startingLivesId}>
              {UI_TEXT.STARTING_LIVES_LABEL}
            </label>
            <input
              id={startingLivesId}
              type="number"
              value={startingLives}
              onChange={(e) => setStartingLives(parseInt(e.target.value) || GAME_CONSTANTS.DEFAULT_STARTING_LIVES)}
              placeholder={UI_TEXT.STARTING_LIVES_PLACEHOLDER}
              aria-label={ACCESSIBILITY.LABELS.STARTING_LIVES_INPUT}
              aria-describedby={`${startingLivesId}-description`}
              min="1"
              max="10"
            />
            <div id={`${startingLivesId}-description`} className="sr-only">
              {ACCESSIBILITY.DESCRIPTIONS.LIVES_LIMITS}
            </div>
          </div>
        )}


        <div className={CSS_CLASSES.PLAYERS_SECTION} id={playersSectionId} role="group" aria-labelledby="players-title">
          <h3 id="players-title">{UI_TEXT.PLAYERS_SECTION_TITLE}</h3>
          <div className="sr-only" id={`${playersSectionId}-description`}>
            {ACCESSIBILITY.DESCRIPTIONS.PLAYER_LIMITS}
          </div>
          {playerNames.map((name, index) => (
            <div key={index} className={CSS_CLASSES.PLAYER_INPUT}>
              <label htmlFor={`player-${index}`} className="sr-only">
                {`${UI_TEXT.PLAYER_NAME_PLACEHOLDER.replace('{index}', (index + 1).toString())}`}
              </label>
              <input
                id={`player-${index}`}
                type="text"
                placeholder={`Player ${index + 1} name`}
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
              {UI_TEXT.ADD_PLAYER_BUTTON}
            </button>
          )}
        </div>

        <button
          onClick={handleStartGame}
          disabled={!isValidToStart}
          className={CSS_CLASSES.START_GAME_BTN}
          aria-label={ACCESSIBILITY.LABELS.START_GAME_BUTTON}
          aria-describedby={!isValidToStart ? 'start-game-error' : undefined}
        >
          {UI_TEXT.START_GAME_BUTTON}
        </button>
        {!isValidToStart && (
          <div id="start-game-error" className="sr-only" role="alert">
            At least 2 players with valid names are required to start a game
          </div>
        )}
      </div>
    </div>
  );
});

PlayerSetup.displayName = 'PlayerSetup';

export default PlayerSetup;
