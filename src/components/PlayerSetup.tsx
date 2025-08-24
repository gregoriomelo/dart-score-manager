import React, { useState } from 'react';
import { GameMode } from '../types/game';
import './PlayerSetup.css';

interface PlayerSetupProps {
  onStartGame: (playerNames: string[], gameMode: GameMode, startingScore: number, startingLives: number) => void;
}

const PlayerSetup: React.FC<PlayerSetupProps> = ({ onStartGame }) => {
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [gameMode, setGameMode] = useState<GameMode>('countdown');
  const [startingScore, setStartingScore] = useState<number>(501);
  const [startingLives, setStartingLives] = useState<number>(5);

  const handlePlayerNameChange = (index: number, name: string) => {
    const updatedNames = [...playerNames];
    updatedNames[index] = name;
    setPlayerNames(updatedNames);
  };

  const addPlayer = () => {
    if (playerNames.length < 8) {
      setPlayerNames([...playerNames, '']);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 2) {
      const updatedNames = playerNames.filter((_, i) => i !== index);
      setPlayerNames(updatedNames);
    }
  };

  const handleStartGame = () => {
    const validNames = playerNames.filter(name => name.trim() !== '').map(name => name.trim());
    if (validNames.length >= 2) {
      onStartGame(validNames, gameMode, startingScore, startingLives);
    }
  };

  const isValidToStart = playerNames.filter(name => name.trim() !== '').length >= 2;

  return (
    <div className="player-setup">
      <h1>Dart Score</h1>
      <div className="setup-form">
        <div className="game-mode-section">
          <label>Game Mode:</label>
          <select
            value={gameMode}
            onChange={(e) => setGameMode(e.target.value as GameMode)}
            className="game-mode-select"
          >
            <option value="countdown">Countdown (501/301)</option>
            <option value="high-low">High-Low Challenge</option>
          </select>
        </div>

        {gameMode === 'countdown' && (
          <div>
            <label>Starting Score:</label>
            <input
              type="number"
              value={startingScore}
              onChange={(e) => setStartingScore(parseInt(e.target.value) || 501)}
              placeholder="501"
            />
          </div>
        )}

        {gameMode === 'high-low' && (
          <div>
            <label>Starting Lives:</label>
            <input
              type="number"
              value={startingLives}
              onChange={(e) => setStartingLives(parseInt(e.target.value) || 5)}
              placeholder="5"
              min="1"
              max="10"
            />
          </div>
        )}


        <div className="players-section">
          <h3>Players (minimum 2):</h3>
          {playerNames.map((name, index) => (
            <div key={index} className="player-input">
              <input
                type="text"
                placeholder={`Player ${index + 1} name`}
                value={name}
                onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                maxLength={20}
              />
              {playerNames.length > 2 && (
                <button
                  type="button"
                  onClick={() => removePlayer(index)}
                  className="remove-player-btn"
                  aria-label={`Remove player ${index + 1}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          
          {playerNames.length < 8 && (
            <button type="button" onClick={addPlayer} className="add-player-btn">
              Add Player
            </button>
          )}
        </div>

        <button
          onClick={handleStartGame}
          disabled={!isValidToStart}
          className="start-game-btn"
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default PlayerSetup;
