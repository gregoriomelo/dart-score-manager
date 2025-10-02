import React from 'react';
import { Player, ScoreHistoryEntry, RoundsPlayer } from '../../../shared/types/game';
import { getPlayerColor } from '../../../shared/utils/playerColors';
import './HistoryView.css';

interface RoundsHistoryTableProps {
  entries: { player?: Player; entry: ScoreHistoryEntry }[];
  showPlayerColumn: boolean;
}

const RoundsHistoryTable: React.FC<RoundsHistoryTableProps> = ({ entries, showPlayerColumn }) => {
  if (entries.length === 0) {
    return <p className="no-history">No scores recorded yet</p>;
  }

  return (
    <div className="history-table">
      <div className="history-header">
        {showPlayerColumn && <span>Player</span>}
        <span>Round</span>
        <span><strong>Score</strong></span>
        <span>Cumulative</span>
      </div>
      {entries.map((item, index) => {
        const { entry, player } = item;
        
        // Calculate cumulative total at the time of this throw
        // This includes all scores up to and including this entry
        let cumulativeTotal = 0;
        if (player) {
          // Find the current entry's position in the overall timeline
          const currentEntryIndex = entries.findIndex(e => e === item);
          
          // Get all entries up to and including the current entry
          const entriesUpToCurrent = entries.slice(0, currentEntryIndex + 1);
          
          // Filter for this player's entries only and sum their scores
          const playerEntriesUpToCurrent = entriesUpToCurrent.filter(e => e.player?.id === player.id);
          cumulativeTotal = playerEntriesUpToCurrent.reduce((sum, e) => sum + e.entry.score, 0);
        }

        return (
          <div key={`${player?.id}-${entry.turnNumber}-${index}`}
               className="history-row">
            {showPlayerColumn && player && (
              <span className="player-name-cell" style={{ color: getPlayerColor(player.id) }}>
                {player.name}
              </span>
            )}
            <span className="round-number">{entry.roundNumber || 'N/A'}</span>
            <span className="score-thrown"><strong>{entry.score}</strong></span>
            <span className="total-score">{cumulativeTotal}</span>
          </div>
        );
      })}
    </div>
  );
};

export default RoundsHistoryTable;
