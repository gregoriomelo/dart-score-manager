import React from 'react';
import './HistoryView.css';

interface HistoryModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ 
  title, 
  isOpen, 
  onClose, 
  children, 
  footer 
}) => {
  if (!isOpen) return null;

  return (
    <div className="history-view-overlay" onClick={onClose}>
      <div className="history-view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="history-view-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="history-view-content">
          {children}
        </div>
        
        {footer && (
          <div className="history-view-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModal;
