import React from 'react';
import { RoundsPlayer, ScoreHistoryEntry } from '../../../shared/types/game';
import HistoryModal from './HistoryModal';
import RoundsHistoryTable from './RoundsHistoryTable';

interface RoundsAllPlayersHistoryModalProps {
  players: RoundsPlayer[];
  isOpen: boolean;
  onClose: () => void;
  onUndoLastMove: () => void;
  canUndo: boolean;
}

interface ConsolidatedEntry {
  player: RoundsPlayer;
  entry: ScoreHistoryEntry;
}

const RoundsAllPlayersHistoryModal: React.FC<RoundsAllPlayersHistoryModalProps> = ({ 
  players, 
  isOpen, 
  onClose, 
  onUndoLastMove, 
  canUndo 
}) => {
  // Consolidate all player histories into a single timeline
  const consolidatedEntries: ConsolidatedEntry[] = players
    .flatMap(player => 
      player.scoreHistory.map(entry => ({ player, entry }))
    )
    .sort((a, b) => new Date(a.entry.timestamp).getTime() - new Date(b.entry.timestamp).getTime());

  const footer = (
    <div className="game-actions">
      {canUndo && (
        <button 
          onClick={onUndoLastMove}
          className="undo-button"
          aria-label="Undo last move"
        >
          Undo Last Move
        </button>
      )}
    </div>
  );

  return (
    <HistoryModal
      title="All Players Score History"
      isOpen={isOpen}
      onClose={onClose}
      footer={footer}
    >
      <RoundsHistoryTable 
        entries={consolidatedEntries} 
        showPlayerColumn={true} 
      />
    </HistoryModal>
  );
};

export default RoundsAllPlayersHistoryModal;
