import React from 'react';
import { HighLowPlayer } from '../../../shared/types/game';
import HistoryModal from './HistoryModal';
import HighLowHistoryTable from './HighLowHistoryTable';

interface HighLowPlayerHistoryModalProps {
  player: HighLowPlayer;
  isOpen: boolean;
  onClose: () => void;
}

const HighLowPlayerHistoryModal: React.FC<HighLowPlayerHistoryModalProps> = ({ player, isOpen, onClose }) => {
  if (!player) return null;

  const entries = player.scoreHistory.map(entry => ({ entry }));

  const footer = (
    <div className="current-score">
      Lives Left: <strong>{player.lives}</strong>
    </div>
  );

  return (
    <HistoryModal
      title={`${player.name}'s Score History`}
      isOpen={isOpen}
      onClose={onClose}
      footer={footer}
    >
      <HighLowHistoryTable 
        entries={entries} 
        showPlayerColumn={false} 
      />
    </HistoryModal>
  );
};

export default HighLowPlayerHistoryModal;
