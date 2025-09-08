import React, { useState } from 'react';
import { Player, ScoreHistoryEntry, HighLowPlayer } from '../../../shared/types/game';
import { getPlayerColor } from '../../../shared/utils/playerColors';
import HistoryModal from './HistoryModal';
import HighLowHistoryTable from './HighLowHistoryTable';
import HistorySortControls from './HistorySortControls';

interface HighLowAllPlayersHistoryModalProps {
  players: HighLowPlayer[];
  isOpen: boolean;
  onClose: () => void;
  onUndoLastMove: () => void;
  canUndo: boolean;
}

interface ConsolidatedEntry {
  player: Player;
  entry: ScoreHistoryEntry;
}

const HighLowAllPlayersHistoryModal: React.FC<HighLowAllPlayersHistoryModalProps> = ({ players, isOpen, onClose, onUndoLastMove, canUndo }) => {
  const [sortBy, setSortBy] = useState<'time' | 'turn' | 'player'>('time');

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

  const footer = (
    <div className="history-modal-footer">
      <div className="current-scores">
        <h4>Current Scores:</h4>
        <div className="current-scores-list">
          {players.map(player => (
            <span key={player.id} className="current-score-item" style={{color: getPlayerColor(player.id)}}>
              <strong>{player.name}:</strong> Lives {player.lives}
              {player.isWinner && <span className="winner-badge">🏆</span>}
            </span>
          ))}
        </div>
      </div>
      {canUndo && (
        <div className="undo-section">
          <button 
            className="undo-button"
            onClick={onUndoLastMove}
            title="Undo last score submission"
          >
            ↶ Undo Last Move
          </button>
        </div>
      )}
    </div>
  );

  return (
    <HistoryModal
      title="Game History - All Players"
      isOpen={isOpen}
      onClose={onClose}
      footer={footer}
    >
      <HistorySortControls sortBy={sortBy} onSortChange={setSortBy} />
      <HighLowHistoryTable 
        entries={sortedEntries} 
        showPlayerColumn={true} 
      />
    </HistoryModal>
  );
};

export default HighLowAllPlayersHistoryModal;
