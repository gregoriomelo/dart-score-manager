import React, { useState } from 'react';
import { Player, ScoreHistoryEntry } from '../types/game';
import './ConsolidatedHistory.css';

interface ConsolidatedHistoryProps {
  players: Player[];
  isOpen: boolean;
  onClose: () => void;
}

interface ConsolidatedEntry {
  player: Player;
  entry: ScoreHistoryEntry;
}

const ConsolidatedHistory: React.FC<ConsolidatedHistoryProps> = ({ players, isOpen, onClose }) => {
  const [sortBy, setSortBy] = useState<'time' | 'turn' | 'player'>('time');

  if (!isOpen) return null;

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const calculateNewScore = (entry: ScoreHistoryEntry) => {
    return entry.previousScore - entry.score;
  };

  // Collect all entries from all players
  const allEntries: ConsolidatedEntry[] = [];
  players.forEach(player => {
    player.scoreHistory.forEach(entry => {
      allEntries.push({ player, entry });
    });
  });

  // Sort entries based on selected criteria
  const sortedEntries = [...allEntries].sort((a, b) => {
    switch (sortBy) {
      case 'time':
        return new Date(a.entry.timestamp).getTime() - new Date(b.entry.timestamp).getTime();
      case 'turn':
        return a.entry.turnNumber - b.entry.turnNumber;
      case 'player':
        return a.player.name.localeCompare(b.player.name);
      default:
        return 0;
    }
  });

  return (
    <div className="consolidated-history-overlay" onClick={onClose}>
      <div className="consolidated-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="consolidated-history-header">
          <h2>Game History - All Players</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'time' | 'turn' | 'player')}>
            <option value="time">Time</option>
            <option value="turn">Turn Number</option>
            <option value="player">Player Name</option>
          </select>
        </div>
        
        <div className="consolidated-history-content">
          {allEntries.length === 0 ? (
            <p className="no-history">No scores recorded yet</p>
          ) : (
            <div className="consolidated-table">
              <div className="consolidated-header">
                <span>Player</span>
                <span>Turn</span>
                <span>Time</span>
                <span>Score</span>
                <span>From</span>
                <span>To</span>
              </div>
              {sortedEntries.map((item, index) => {
                const newScore = calculateNewScore(item.entry);
                const isBust = newScore < 0 || newScore === 1;
                
                return (
                  <div key={`${item.player.id}-${item.entry.turnNumber}-${index}`} 
                       className={`consolidated-row ${isBust ? 'bust' : ''}`}>
                    <span className="player-name-cell" style={{color: getPlayerColor(item.player.id)}}>
                      {item.player.name}
                    </span>
                    <span className="turn-number">{item.entry.turnNumber}</span>
                    <span className="time">{formatTime(item.entry.timestamp)}</span>
                    <span className="score-thrown">{item.entry.score}</span>
                    <span className="previous-score">{item.entry.previousScore}</span>
                    <span className="new-score">
                      {isBust ? (
                        <span className="bust-indicator">BUST</span>
                      ) : (
                        newScore
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="consolidated-history-footer">
          <div className="current-scores">
            <h4>Current Scores:</h4>
            <div className="current-scores-list">
              {players.map(player => (
                <span key={player.id} className="current-score-item" style={{color: getPlayerColor(player.id)}}>
                  <strong>{player.name}:</strong> {player.score}
                  {player.isWinner && <span className="winner-badge">🏆</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to assign consistent colors to players
const getPlayerColor = (playerId: string): string => {
  const colors = [
    '#2563eb', // blue
    '#dc2626', // red
    '#16a34a', // green
    '#ca8a04', // yellow
    '#9333ea', // purple
    '#c2410c', // orange
    '#0891b2', // cyan
    '#be185d', // pink
  ];
  
  // Simple hash function to assign consistent colors
  let hash = 0;
  for (let i = 0; i < playerId.length; i++) {
    hash = playerId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default ConsolidatedHistory;
