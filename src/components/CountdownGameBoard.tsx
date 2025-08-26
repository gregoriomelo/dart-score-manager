import React, { useEffect, useMemo, useState } from 'react';
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
  const [showBustBanner, setShowBustBanner] = useState(false);
  const [bustAnimKey, setBustAnimKey] = useState(0);

  // Incrementing counter that changes whenever any score entry is added.
  // This lets us re-trigger the bust banner even if the bust flag remains true.
  const historyVersion = useMemo(
    () => gameState.players.reduce((acc, p) => acc + p.scoreHistory.length, 0),
    [gameState.players]
  );

  // When a bust occurs, show the banner and auto-dismiss after a short delay,
  // but allow it to be visible at the start of the next player's turn.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (gameState.lastThrowWasBust) {
      setShowBustBanner(true);
      setBustAnimKey((k) => k + 1);
      timer = setTimeout(() => setShowBustBanner(false), 2000);
    } else {
      setShowBustBanner(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameState.lastThrowWasBust, currentPlayer?.id, historyVersion]);

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
      // Auto advance to next player immediately if game isn't finished
      if (!gameState.gameFinished) {
        onNextPlayer();
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
          {showBustBanner && (
            <div
              key={bustAnimKey}
              className="bust-message bust-banner"
              role="status"
              aria-live="polite"
            >
              BUST! Score reverted to turn start.
            </div>
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
