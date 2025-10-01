import React from 'react';
import { RoundsPlayer } from '../../../shared/types/game';
import HistoryModal from './HistoryModal';
import RoundsHistoryTable from './RoundsHistoryTable';

interface RoundsPlayerHistoryModalProps {
  player: RoundsPlayer;
  isOpen: boolean;
  onClose: () => void;
}

const RoundsPlayerHistoryModal: React.FC<RoundsPlayerHistoryModalProps> = ({ player, isOpen, onClose }) => {
  if (!player) return null;

  const entries = player.scoreHistory.map(entry => ({ entry }));

  const footer = (
    <div className="current-score">
      <div>Total Score: <strong>{player.totalScore}</strong></div>
      <div>Current Round Score: <strong>{player.currentRoundScore}</strong></div>
      <div>Rounds Completed: <strong>{player.roundsCompleted}</strong></div>
    </div>
  );

  return (
    <HistoryModal
      title={`${player.name}'s Score History`}
      isOpen={isOpen}
      onClose={onClose}
      footer={footer}
    >
      <RoundsHistoryTable 
        entries={entries} 
        showPlayerColumn={false} 
      />
    </HistoryModal>
  );
};

export default RoundsPlayerHistoryModal;
