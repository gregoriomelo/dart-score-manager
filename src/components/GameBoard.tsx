import React, { useState } from 'react';
import { GameState, Player } from '../types/game';
import './GameBoard.css';

interface GameBoardProps {
  gameState: GameState;
  currentPlayer: Player | null;
  onSubmitScore: (playerId: string, score: number) => void;
  onNextPlayer: () => void;
  onResetGame: () => void;
  onNewGame: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  currentPlayer,
  onSubmitScore,
  onNextPlayer,
  onResetGame,
  onNewGame,
}) => {
  const [scoreInput, setScoreInput] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmitScore = () => {
    if (!currentPlayer) return;

    const score = parseInt(scoreInput);
    if (isNaN(score) || score < 0 || score > 180) {
      setError('Please enter a valid score (0-180)');
      return;
    }

    if (score > currentPlayer.score) {
      setError('Score cannot be higher than remaining points');
      return;
    }

    try {
      onSubmitScore(currentPlayer.id, score);
      setScoreInput('');
      setError('');
      
      // Auto advance to next player if game isn't finished
      if (!gameState.gameFinished) {
        setTimeout(() => onNextPlayer(), 500);
      }
    } catch (err) {
      setError('Invalid score entry');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitScore();
    }
  };

  if (gameState.gameFinished && gameState.winner) {
    return (
      <div className="game-board">
        <div className="winner-announcement">
          <h1>🎉 {gameState.winner.name} Wins! 🎉</h1>
          <div className="game-actions">
            <button onClick={onResetGame} className="reset-btn">
              Play Again
            </button>
            <button onClick={onNewGame} className="new-game-btn">
              New Game
            </button>
          </div>
        </div>
        <div className="final-scores">
          <h3>Final Scores:</h3>
          <div className="players-grid">
            {gameState.players.map((player) => (
              <div key={player.id} className={`player-card ${player.isWinner ? 'winner' : ''}`}>
                <div className="player-name">{player.name}</div>
                <div className="player-score">{player.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-board">
      <div className="game-header">
        <h2>Dart Game - Starting Score: {gameState.startingScore}</h2>
        <div className="game-actions">
          <button onClick={onResetGame} className="reset-btn">
            Reset Game
          </button>
          <button onClick={onNewGame} className="new-game-btn">
            New Game
          </button>
        </div>
      </div>

      <div className="players-grid">
        {gameState.players.map((player) => (
          <div
            key={player.id}
            className={`player-card ${
              currentPlayer?.id === player.id ? 'current-player' : ''
            }`}
          >
            <div className="player-name">{player.name}</div>
            <div className="player-score">{player.score}</div>
            {currentPlayer?.id === player.id && (
              <div className="current-indicator">Current Turn</div>
            )}
          </div>
        ))}
      </div>

      {currentPlayer && (
        <div className="score-input-section">
          <h3>
            {currentPlayer.name}'s Turn
            <span className="remaining-score">({currentPlayer.score} remaining)</span>
            {gameState.doubleOutRule && <span className="double-out-indicator">Double-out rule</span>}
          </h3>
          
          {gameState.lastThrowWasBust && (
            <div className="bust-message">
              BUST! Score reverted to {currentPlayer.score}
            </div>
          )}
          
          <div className="score-input-controls">
            <input
              type="number"
              value={scoreInput}
              onChange={(e) => setScoreInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter score (0-180)"
              min="0"
              max="180"
              className="score-input"
            />
            <button
              onClick={handleSubmitScore}
              disabled={!scoreInput}
              className="submit-score-btn"
            >
              Submit Score
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="quick-scores">
            <span>Quick scores:</span>
            {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180].map((quickScore) => (
              <button
                key={quickScore}
                onClick={() => setScoreInput(quickScore.toString())}
                className="quick-score-btn"
                disabled={quickScore > currentPlayer.score}
              >
                {quickScore}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
