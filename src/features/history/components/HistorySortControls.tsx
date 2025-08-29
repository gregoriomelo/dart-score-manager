import React from 'react';
import './HistoryView.css';

interface HistorySortControlsProps {
  sortBy: 'time' | 'turn' | 'player';
  onSortChange: (sortBy: 'time' | 'turn' | 'player') => void;
}

const HistorySortControls: React.FC<HistorySortControlsProps> = ({ sortBy, onSortChange }) => {
  return (
    <div className="sort-controls">
      <label>Sort by:</label>
      <select 
        value={sortBy} 
        onChange={(e) => onSortChange(e.target.value as 'time' | 'turn' | 'player')}
      >
        <option value="time">Time</option>
        <option value="turn">Turn Number</option>
        <option value="player">Player Name</option>
      </select>
    </div>
  );
};

export default HistorySortControls;
