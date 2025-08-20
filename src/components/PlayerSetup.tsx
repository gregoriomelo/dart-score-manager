import React, { useState } from 'react';
import './PlayerSetup.css';

interface PlayerSetupProps {
  onStartGame: (playerNames: string[], startingScore: number, doubleOutRule: boolean) => void;
}

const PlayerSetup: React.FC<PlayerSetupProps> = ({ onStartGame }) => {
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [startingScore, setStartingScore] = useState<number>(501);
  const [doubleOutRule, setDoubleOutRule] = useState<boolean>(false);

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
      onStartGame(validNames, startingScore, doubleOutRule);
    }
  };

  const isValidToStart = playerNames.filter(name => name.trim() !== '').length >= 2;

  return (
    <div className="player-setup">
      <h1>Dart Score Manager</h1>
      <div className="setup-form">
        <div className="starting-score-section">
          <label htmlFor="starting-score">Starting Score:</label>
          <select
            id="starting-score"
            value={startingScore}
            onChange={(e) => setStartingScore(Number(e.target.value))}
          >
            <option value={301}>301</option>
            <option value={501}>501</option>
            <option value={701}>701</option>
            <option value={1001}>1001</option>
          </select>
        </div>

        <div className="game-rules-section">
          <label>
            <input
              type="checkbox"
              checked={doubleOutRule}
              onChange={(e) => setDoubleOutRule(e.target.checked)}
            />
            Double-out rule (must finish on double)
          </label>
        </div>

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
