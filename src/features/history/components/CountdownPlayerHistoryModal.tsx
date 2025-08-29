import React from 'react';
import { CountdownPlayer } from '../../../shared/types/game';
import HistoryModal from './HistoryModal';
import CountdownHistoryTable from './CountdownHistoryTable';

interface CountdownPlayerHistoryModalProps {
  player: CountdownPlayer;
  isOpen: boolean;
  onClose: () => void;
}

const CountdownPlayerHistoryModal: React.FC<CountdownPlayerHistoryModalProps> = ({ player, isOpen, onClose }) => {
  if (!player) return null;

  const entries = player.scoreHistory.map(entry => ({ entry }));

  const footer = (
    <div className="current-score">
      Current Score: <strong>{player.score}</strong>
    </div>
  );

  return (
    <HistoryModal
      title={`${player.name}'s Score History`}
      isOpen={isOpen}
      onClose={onClose}
      footer={footer}
    >
      <CountdownHistoryTable 
        entries={entries} 
        showPlayerColumn={false} 
      />
    </HistoryModal>
  );
};

export default CountdownPlayerHistoryModal;
