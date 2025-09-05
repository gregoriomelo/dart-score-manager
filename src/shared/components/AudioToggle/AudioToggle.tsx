import React, { useState, useEffect } from 'react';
import { soundManager } from '../../../utils/audio/soundManager';
import './AudioToggle.css';

interface AudioToggleProps {
  className?: string;
}

export const AudioToggle: React.FC<AudioToggleProps> = ({ className = '' }) => {
  const [isEnabled, setIsEnabled] = useState(() => {
    // Load saved preference immediately
    const savedPreference = localStorage.getItem('audioEnabled');
    return savedPreference !== null ? JSON.parse(savedPreference) : false;
  });

  useEffect(() => {
    // Initialize sound manager in background
    soundManager.initialize().catch(() => {
      // Silently fail in test environment or when audio is not available
    });

    // Set the saved preference
    soundManager.setEnabled(isEnabled);
  }, [isEnabled]);

  const handleToggle = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    soundManager.setEnabled(newEnabled);
    
    // Save preference
    localStorage.setItem('audioEnabled', JSON.stringify(newEnabled));
  };

  return (
    <div className={`audio-toggle ${className}`}>
      <button
        type="button"
        className={`audio-toggle-btn ${isEnabled ? 'enabled' : 'disabled'}`}
        onClick={handleToggle}
        aria-label={isEnabled ? 'Disable sound effects' : 'Enable sound effects'}
        title={isEnabled ? 'Sound effects enabled' : 'Sound effects disabled'}
      >
        <span className="audio-icon">
          {isEnabled ? '🔊' : '🔇'}
        </span>
        <span className="audio-label">
          {isEnabled ? 'Sound On' : 'Sound Off'}
        </span>
      </button>
    </div>
  );
};
