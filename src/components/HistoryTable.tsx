import React from 'react';
import { Player, ScoreHistoryEntry } from '../types/game';
import './HistoryView.css';

interface HistoryTableProps {
  entries: { player?: Player; entry: ScoreHistoryEntry }[];
  isHighLowMode: boolean;
  showPlayerColumn: boolean;
}

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
  let hash = 0;
  for (let i = 0; i < playerId.length; i++) {
    hash = playerId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const formatTime = (timestamp: Date) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const HistoryTable: React.FC<HistoryTableProps> = ({ entries, isHighLowMode, showPlayerColumn }) => {
  const calculateNewScore = (entry: ScoreHistoryEntry) => {
    return entry.previousScore - entry.score;
  };

  return (
    <div className={`history-table ${isHighLowMode ? 'high-low' : ''}`}>
      {isHighLowMode ? (
        <>
          <div className="history-header">
            {showPlayerColumn && <span>Player</span>}
            <span>Turn</span>
            <span>Time</span>
            <span>Challenge</span>
            <span>Thrown</span>
            <span>Result</span>
            <span>Lives</span>
          </div>
          {entries.map((item, index) => {
            const { entry, player } = item;
            const challengeLabel = entry.challengeDirection && entry.challengeTarget !== undefined
              ? `${entry.challengeDirection === 'higher' ? 'Higher' : 'Lower'} ${entry.challengeTarget}`
              : '—';
            const resultPass = entry.passedChallenge === true;
            const resultFail = entry.passedChallenge === false;
            const livesBefore = entry.livesBefore ?? player?.lives;
            const livesAfter = entry.livesAfter ?? player?.lives;
            const eliminated = livesAfter !== undefined && livesAfter <= 0;

            return (
              <div key={`${player?.id}-${entry.turnNumber}-${index}`}
                   className={`history-row ${resultFail ? 'bust' : ''}`}>
                {showPlayerColumn && player && (
                  <span className="player-name-cell" style={{ color: getPlayerColor(player.id) }}>
                    {player.name}
                  </span>
                )}
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
          })}
        </>
      ) : (
        <>
          <div className="history-header">
            {showPlayerColumn && <span>Player</span>}
            <span>Turn</span>
            <span>Time</span>
            <span>Score</span>
            <span>From</span>
            <span>To</span>
          </div>
          {entries.map((item, index) => {
            const newScore = calculateNewScore(item.entry);
            const isBust = newScore < 0 || newScore === 1;

            return (
              <div key={`${item.player?.id}-${item.entry.turnNumber}-${index}`}
                   className={`history-row ${isBust ? 'bust' : ''}`}>
                {showPlayerColumn && item.player && (
                    <span className="player-name-cell" style={{color: getPlayerColor(item.player.id)}}>
                        {item.player.name}
                    </span>
                )}
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
        </>
      )}
    </div>
  );
};

export default HistoryTable;
