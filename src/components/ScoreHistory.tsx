import React from 'react';
import { Player, ScoreHistoryEntry } from '../types/game';
import './ScoreHistory.css';

interface ScoreHistoryProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
}

const ScoreHistory: React.FC<ScoreHistoryProps> = ({ player, isOpen, onClose }) => {
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

  const isHighLowMode = player.scoreHistory.some(
    (e) =>
      e.challengeDirection !== undefined ||
      e.passedChallenge !== undefined ||
      e.livesAfter !== undefined
  );

  const renderHighLowRow = (entry: ScoreHistoryEntry, index: number) => {
    const challengeLabel = entry.challengeDirection && entry.challengeTarget !== undefined
      ? `${entry.challengeDirection === 'higher' ? 'Higher' : 'Lower'} ${entry.challengeTarget}`
      : '—';
    const resultPass = entry.passedChallenge === true;
    const resultFail = entry.passedChallenge === false;
    const livesBefore = entry.livesBefore ?? player.lives;
    const livesAfter = entry.livesAfter ?? player.lives;
    const eliminated = livesAfter !== undefined && livesAfter <= 0;

    return (
      <div key={index} className={`history-row ${resultFail ? 'bust' : ''}`}>
        <span className="turn-number">{entry.turnNumber}</span>
        <span className="time">{formatTime(entry.timestamp)}</span>
        <span className="challenge">{challengeLabel}</span>
        <span className="score-thrown">{entry.score}</span>
        <span className="result">
          {resultPass && <span className="pass-badge">PASS ✅</span>}
          {resultFail && <span className="fail-badge">FAIL ❌</span>}
          {!resultPass && !resultFail && <span>—</span>}
        </span>
        <span className="lives">
          {livesBefore !== undefined && livesAfter !== undefined ? (
            <>
              {livesBefore} → {livesAfter}{' '}
              {resultFail && (livesBefore || 0) > (livesAfter || 0) && (
                <span className="lives-delta">-1 💔</span>
              )}
              {eliminated && <span className="eliminated-badge">Eliminated ☠️</span>}
            </>
          ) : (
            '—'
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="score-history-overlay" onClick={onClose}>
      <div className="score-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="score-history-header">
          <h2>{player.name}'s Score History</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="score-history-content">
          {player.scoreHistory.length === 0 ? (
            <p className="no-history">No scores recorded yet</p>
          ) : (
            <div className="history-table">
              {isHighLowMode ? (
                <>
                  <div className="history-header">
                    <span>Turn</span>
                    <span>Time</span>
                    <span>Challenge</span>
                    <span>Thrown</span>
                    <span>Result</span>
                    <span>Lives</span>
                  </div>
                  {player.scoreHistory.map((entry, index) => renderHighLowRow(entry, index))}
                </>
              ) : (
                <>
                  <div className="history-header">
                    <span>Turn</span>
                    <span>Time</span>
                    <span>Score</span>
                    <span>From</span>
                    <span>To</span>
                  </div>
                  {player.scoreHistory.map((entry, index) => {
                    const newScore = calculateNewScore(entry);
                    const isBust = newScore < 0 || newScore === 1;
                    
                    return (
                      <div key={index} className={`history-row ${isBust ? 'bust' : ''}`}>
                        <span className="turn-number">{entry.turnNumber}</span>
                        <span className="time">{formatTime(entry.timestamp)}</span>
                        <span className="score-thrown">{entry.score}</span>
                        <span className="previous-score">{entry.previousScore}</span>
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
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="score-history-footer">
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
