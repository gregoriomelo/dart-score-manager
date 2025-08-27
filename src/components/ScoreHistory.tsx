import React from 'react';
import { Player } from '../types/game';
import HistoryTable from './HistoryTable';
import './HistoryView.css';

interface ScoreHistoryProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
}

const ScoreHistory: React.FC<ScoreHistoryProps> = ({ player, isOpen, onClose }) => {
  if (!isOpen) return null;

  const isHighLowMode = player.scoreHistory.some(
    (e) =>
      e.challengeDirection !== undefined ||
      e.passedChallenge !== undefined ||
      e.livesAfter !== undefined
  );

  const entries = player.scoreHistory.map(entry => ({ entry }));

  return (
    <div className="history-view-overlay" onClick={onClose}>
      <div className="history-view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="history-view-header">
          <h2>{player.name}'s Score History</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="history-view-content">
          {player.scoreHistory.length === 0 ? (
            <p className="no-history">No scores recorded yet</p>
          ) : (
            <HistoryTable entries={entries} isHighLowMode={isHighLowMode} showPlayerColumn={false} />
          )}
        </div>
        
        <div className="history-view-footer">
          {isHighLowMode ? (
            <div className="current-score">Lives Left: <strong>{player.lives ?? '—'}</strong></div>
          ) : (
            <div className="current-score">Current Score: <strong>{player.score}</strong></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreHistory;
