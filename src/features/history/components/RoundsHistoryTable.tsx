import React from 'react';
import { Player, ScoreHistoryEntry, RoundsPlayer } from '../../../shared/types/game';
import { getPlayerColor } from '../../../shared/utils/playerColors';
import './HistoryView.css';

interface RoundsHistoryTableProps {
  entries: { player?: Player; entry: ScoreHistoryEntry }[];
  showPlayerColumn: boolean;
}

const RoundsHistoryTable: React.FC<RoundsHistoryTableProps> = ({ entries, showPlayerColumn }) => {
  const calculateNewRoundScore = (entry: ScoreHistoryEntry) => {
    return entry.previousScore + entry.score;
  };

  if (entries.length === 0) {
    return <p className="no-history">No scores recorded yet</p>;
  }

  return (
    <div className="history-table">
      <div className="history-header">
        {showPlayerColumn && <span>Player</span>}
        <span>Turn</span>
        <span>Round</span>
        <span>Thrown</span>
        <span>Previous</span>
        <span>New Round Score</span>
        <span>Total Score</span>
      </div>
      {entries.map((item, index) => {
        const { entry, player } = item;
        const newRoundScore = calculateNewRoundScore(entry);
        const totalScore = player && 'totalScore' in player ? (player as RoundsPlayer).totalScore : 0;

        return (
          <div key={`${player?.id}-${entry.turnNumber}-${index}`}
               className="history-row">
            {showPlayerColumn && player && (
              <span className="player-name-cell" style={{ color: getPlayerColor(player.id) }}>
                {player.name}
              </span>
            )}
            <span className="turn-number">{entry.turnNumber}</span>
            <span className="round-number">{entry.roundNumber || 'N/A'}</span>
            <span className="score-thrown">{entry.score}</span>
            <span className="previous-score">{entry.previousScore}</span>
            <span className="new-score">{newRoundScore}</span>
            <span className="total-score">{totalScore}</span>
          </div>
        );
      })}
    </div>
  );
};

export default RoundsHistoryTable;
