import React, { useState } from 'react';
import { GameState, Player } from '../types/game';
import HighLowChallenge from './HighLowChallenge';
import ScoreHistory from './ScoreHistory';
import ConsolidatedHistory from './ConsolidatedHistory';
import './GameBoard.css';

interface HighLowGameBoardProps {
  gameState: GameState;
  currentPlayer: Player | null;
  onSubmitHighLowScore: (playerId: string, score: number) => void;
  onSetChallenge: (direction: 'higher' | 'lower', targetScore: number) => void;
  onNextPlayer: () => void;
  onResetGame: () => void;
  onNewGame: () => void;
}

const HighLowGameBoard: React.FC<HighLowGameBoardProps> = ({
  gameState,
  currentPlayer,
  onSubmitHighLowScore,
  onSetChallenge,
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
      onSubmitHighLowScore(currentPlayer.id, score);
      setScoreInput('');
      setError('');
      
      // Auto advance to next player after score submission
      if (!gameState.gameFinished) {
        setTimeout(() => onNextPlayer(), 500);
      }
    } catch (err) {
      setError('Invalid score entry');
    }
  };

  const handleSetChallenge = (direction: 'higher' | 'lower', targetScore: number) => {
    onSetChallenge(direction, targetScore);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitScore();
    }
  };

  // Get the last score for reference
  const hasAnyPlayerPlayed = gameState.players.some(p => p.scoreHistory.length > 0);
  const lastPlayerScore = hasAnyPlayerPlayed ? 
    gameState.players[(gameState.currentPlayerIndex - 1 + gameState.players.length) % gameState.players.length]?.score : 
    undefined;
  
  const needsChallengeSet = !gameState.highLowChallenge;

  if (gameState.gameFinished && gameState.winner) {
    return (
      <div className="game-board">
        <div className="winner-announcement">
          <h2>🎉 Congratulations!</h2>
          <p>{gameState.winner.name} wins!</p>
        </div>
        
        <div className="final-scores">
          <h3>Final Results</h3>
          <div className="players-list">
            {gameState.players.map((player) => (
              <div 
                key={player.id} 
                className={`player-card ${player.isWinner ? 'winner' : ''} ${(player.lives || 0) <= 0 ? 'eliminated' : ''}`}
              >
                <span className="player-name">{player.name}</span>
                <span className="player-lives">Lives: {player.lives || 0}</span>
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
        High-Low Challenge
      </div>
      
      <div className="players-list">
        {gameState.players.map((player) => (
          <div 
            key={player.id} 
            className={`player-card ${currentPlayer?.id === player.id ? 'current-player' : ''} ${(player.lives || 0) <= 0 ? 'eliminated' : ''}`}
          >
            <span className="player-name">{player.name}</span>
            <span className="player-lives">Lives: {player.lives || 0}</span>
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

      <HighLowChallenge
        currentChallenge={gameState.highLowChallenge}
        currentPlayerName={currentPlayer?.name || ''}
        lastScore={lastPlayerScore}
        onSetChallenge={handleSetChallenge}
        showChallengeForm={needsChallengeSet}
      />

      {currentPlayer && gameState.highLowChallenge && (
        <div className="score-input-section">
          <h3>{currentPlayer.name}'s Turn</h3>
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

export default HighLowGameBoard;
