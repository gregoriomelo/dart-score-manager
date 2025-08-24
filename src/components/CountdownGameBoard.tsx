import React, { useState } from 'react';
import { GameState, Player } from '../types/game';
import ScoreHistory from './ScoreHistory';
import ConsolidatedHistory from './ConsolidatedHistory';
import './GameBoard.css';

interface CountdownGameBoardProps {
  gameState: GameState;
  currentPlayer: Player | null;
  onSubmitScore: (playerId: string, score: number) => void;
  onNextPlayer: () => void;
  onResetGame: () => void;
  onNewGame: () => void;
}

const CountdownGameBoard: React.FC<CountdownGameBoardProps> = ({
  gameState,
  currentPlayer,
  onSubmitScore,
  onNextPlayer,
  onResetGame,
  onNewGame,
}) => {
  const [scoreInput, setScoreInput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [historyPlayer, setHistoryPlayer] = useState<Player | null>(null);
  const [showConsolidatedHistory, setShowConsolidatedHistory] = useState(false);

  const handleSubmitScore = () => {
    if (!currentPlayer) return;
    
    const score = parseInt(scoreInput);
    if (isNaN(score) || score < 0 || score > 180) {
      setError('Please enter a valid score (0-180)');
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
          <h2>🎉 Congratulations!</h2>
          <p>{gameState.winner.name} wins!</p>
        </div>
        
        <div className="final-scores">
          <h3>Final Scores & History</h3>
          <div className="players-list">
            {gameState.players.map((player) => (
              <div 
                key={player.id} 
                className={`player-card ${player.isWinner ? 'winner' : ''}`}
              >
                <span className="player-name">{player.name}</span>
                <span className="player-score">{player.score}</span>
                <button 
                  className="history-btn"
                  onClick={() => setHistoryPlayer(player)}
                  title={`View ${player.name}'s score history`}
                >
                  📊
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="game-actions">
          <button onClick={() => setShowConsolidatedHistory(true)} className="consolidated-history-button">
            📊 All History
          </button>
          <button className="new-game-btn" onClick={onResetGame}>Play Again</button>
          <button className="back-to-setup-btn" onClick={onNewGame}>Back to Setup</button>
        </div>

        <ScoreHistory 
          player={historyPlayer!}
          isOpen={historyPlayer !== null}
          onClose={() => setHistoryPlayer(null)}
        />
        
        <ConsolidatedHistory 
          players={gameState.players}
          isOpen={showConsolidatedHistory}
          onClose={() => setShowConsolidatedHistory(false)}
        />
      </div>
    );
  }

  return (
    <div className="game-board">
      <h1>Dart Score Manager</h1>
      <div className="game-mode-indicator">
        Countdown ({gameState.players[0]?.turnStartScore || 501})
      </div>
      
      <div className="players-list">
        {gameState.players.map((player) => (
          <div 
            key={player.id} 
            className={`player-card ${currentPlayer?.id === player.id ? 'current-player' : ''}`}
          >
            <span className="player-name">{player.name}</span>
            <span className="player-score">{player.score}</span>
            <button 
              className="history-btn"
              onClick={() => setHistoryPlayer(player)}
              title={`View ${player.name}'s score history`}
            >
              📊
            </button>
          </div>
        ))}
      </div>

      {currentPlayer && (
        <div className="score-input-section">
          <h3>{currentPlayer.name}'s Turn</h3>
          {gameState.lastThrowWasBust && (
            <div className="bust-message">BUST! Score reverted to turn start.</div>
          )}
          <div className="score-input">
            <input
              type="number"
              value={scoreInput}
              onChange={(e) => setScoreInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter score (0-180)"
              autoFocus
            />
            <button className="submit-score-btn" onClick={handleSubmitScore}>
              Submit
            </button>
          </div>
          {error && <div className="bust-message">{error}</div>}
        </div>
      )}
      
      <div className="game-actions">
        <button onClick={() => setShowConsolidatedHistory(true)} className="consolidated-history-button">
          📊 All History
        </button>
        <button className="new-game-btn" onClick={onResetGame}>Reset Game</button>
        <button className="back-to-setup-btn" onClick={onNewGame}>Back to Setup</button>
      </div>

      <ScoreHistory 
        player={historyPlayer!}
        isOpen={historyPlayer !== null}
        onClose={() => setHistoryPlayer(null)}
      />
      
      <ConsolidatedHistory 
        players={gameState.players}
        isOpen={showConsolidatedHistory}
        onClose={() => setShowConsolidatedHistory(false)}
      />
    </div>
  );
};

export default CountdownGameBoard;
