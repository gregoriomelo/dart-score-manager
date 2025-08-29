import React from 'react';
import { Player, ScoreHistoryEntry } from '../../../shared/types/game';
import { getPlayerColor } from '../../../shared/utils/playerColors';
import { formatTime } from '../../../shared/utils/timeUtils';
import './HistoryView.css';

interface CountdownHistoryTableProps {
  entries: { player?: Player; entry: ScoreHistoryEntry }[];
  showPlayerColumn: boolean;
}





const CountdownHistoryTable: React.FC<CountdownHistoryTableProps> = ({ entries, showPlayerColumn }) => {
  const calculateNewScore = (entry: ScoreHistoryEntry) => {
    return entry.previousScore - entry.score;
  };

  if (entries.length === 0) {
    return <p className="no-history">No scores recorded yet</p>;
  }

  return (
    <div className="history-table">
      <div className="history-header">
        {showPlayerColumn && <span>Player</span>}
        <span>Turn</span>
        <span>Time</span>
        <span>Thrown</span>
        <span>Previous</span>
        <span>New Score</span>
        <span>Result</span>
      </div>
      {entries.map((item, index) => {
        const { entry, player } = item;
        const newScore = calculateNewScore(entry);
        const isBust = newScore < 0 || newScore === 1; // Bust if negative or would be 1
        const isWin = newScore === 0;

        return (
          <div key={`${player?.id}-${entry.turnNumber}-${index}`}
               className={`history-row ${isBust ? 'bust' : ''} ${isWin ? 'win' : ''}`}>
            {showPlayerColumn && player && (
              <span className="player-name-cell" style={{ color: getPlayerColor(player.id) }}>
                {player.name}
              </span>
            )}
            <span className="turn-number">{entry.turnNumber}</span>
            <span className="time">{formatTime(entry.timestamp)}</span>
            <span className="score-thrown">{entry.score}</span>
            <span className="previous-score">{entry.previousScore}</span>
            <span className="new-score">{newScore}</span>
            <span className="result">
              {isWin && <span className="win-badge">WIN 🎯</span>}
              {isBust && <span className="bust-badge">BUST 💥</span>}
              {!isWin && !isBust && <span>—</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default CountdownHistoryTable;
