import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Player } from '../../../shared/types/game';
import { UI_TEXT_KEYS, CSS_CLASSES } from '../../../shared/utils/i18nConstants';
import { ACCESSIBILITY, generateAriaId } from '../../../shared/utils/accessibility';
import { usePerformanceTracking } from '../../performance/utils/performance';
import DartScoreCalculator from './DartScoreCalculator';
import '../../game/components/GameBoard.css';

interface ScoreInputProps {
  currentPlayer: Player;
  scoreInput: string;
  onScoreInputChange: (value: string) => void;
  onSubmitScore: () => void;
  onSubmitScoreWithValue?: (score: number) => void;
  onSubmitBust?: () => void;
  error?: string;
}

const ScoreInput: React.FC<ScoreInputProps> = React.memo(({
  currentPlayer,
  scoreInput,
  onScoreInputChange,
  onSubmitScore,
  onSubmitScoreWithValue,
  onSubmitBust,
  error
}) => {
  const { t } = useTranslation();
  const [showCalculator, setShowCalculator] = useState(false);
  const [showInvalidFlash, setShowInvalidFlash] = useState(false);
  
  // Performance tracking
  usePerformanceTracking('ScoreInput');

  // Determine if bust is possible (only when score is less than 180)
  const canBust = currentPlayer.score < 180;

  const scoreInputId = generateAriaId('score-input');
  const errorId = generateAriaId('score-error');
  const mainInputRef = useRef<HTMLInputElement>(null);

  // Focus main input when current player changes and calculator is not shown
  useEffect(() => {
    if (!showCalculator && mainInputRef.current) {
      // Use a small delay to ensure the component has fully rendered
      setTimeout(() => {
        if (mainInputRef.current) {
          mainInputRef.current.focus();
        }
      }, 0);
    }
  }, [currentPlayer.id, showCalculator]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ACCESSIBILITY.KEYBOARD.ENTER) {
      onSubmitScore();
    }
  }, [onSubmitScore]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty input
    if (value === '') {
      onScoreInputChange(value);
      return;
    }

    // Only allow numeric input
    if (!/^\d+$/.test(value)) {
      return;
    }

    const numValue = parseInt(value, 10);
    
    // Check if the complete number would exceed 180
    if (numValue > 180) {
      // Show brief visual feedback for invalid input
      setShowInvalidFlash(true);
      setTimeout(() => setShowInvalidFlash(false), 300); // Flash for 300ms
      return; // Don't update with invalid input
    }
    
    // Input is valid, update it
    onScoreInputChange(value);
  }, [onScoreInputChange]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, and navigation keys
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];
    
    // Allow numbers 0-9
    const isNumber = /^[0-9]$/.test(e.key);
    
    if (!allowedKeys.includes(e.key) && !isNumber) {
      e.preventDefault();
    }
  }, []);

  const handleCalculatorToggle = useCallback(() => {
    const newShowCalculator = !showCalculator;
    setShowCalculator(newShowCalculator);
    
    // Clear main input when opening dart inputs
    if (newShowCalculator) {
      onScoreInputChange('');
    }
  }, [showCalculator, onScoreInputChange]);

  const handleCalculatorScoreSubmit = useCallback((totalScore: number) => {
    setShowCalculator(false);
    // Clear main input when dart inputs are submitted
    onScoreInputChange('');
    
    if (onSubmitScoreWithValue) {
      // Use the direct score submission if available
      onSubmitScoreWithValue(totalScore);
    } else {
      // Fallback to the old method
      onScoreInputChange(totalScore.toString());
      onSubmitScore();
    }
    
    // Focus the main input after dart submission
    setTimeout(() => {
      if (mainInputRef.current) {
        mainInputRef.current.focus();
      }
    }, 0);
  }, [onScoreInputChange, onSubmitScore, onSubmitScoreWithValue]);

  const handleCalculatorCancel = useCallback(() => {
    setShowCalculator(false);
    
    // Focus the main input after cancelling dart inputs
    setTimeout(() => {
      if (mainInputRef.current) {
        mainInputRef.current.focus();
      }
    }, 0);
  }, []);

  return (
    <div className={CSS_CLASSES.SCORE_INPUT_SECTION} role="region" aria-labelledby="turn-title">
      <h3 id="turn-title">{t('game.display.playerTurn', { name: currentPlayer.name })}</h3>
      

      {/* Individual dart inputs component */}
      {showCalculator && (
        <DartScoreCalculator
          onScoreSubmit={handleCalculatorScoreSubmit}
          onCancel={handleCalculatorCancel}
          maxScore={180}
        />
      )}

      <div className={CSS_CLASSES.SCORE_INPUT}>
        <label htmlFor={scoreInputId} className="sr-only">
          {ACCESSIBILITY.LABELS.SCORE_INPUT}
        </label>
        <input
          ref={mainInputRef}
          id={scoreInputId}
          type="number"
          value={scoreInput}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onKeyPress={handleKeyPress}
          placeholder={t(UI_TEXT_KEYS.SCORE_INPUT_PLACEHOLDER)}
          aria-label={ACCESSIBILITY.LABELS.SCORE_INPUT}
          aria-describedby={`${scoreInputId}-help ${error ? errorId : ''}`}
          aria-invalid={!!error}
          autoFocus={!showCalculator}
          min="0"
          max="180"
          step="1"
          inputMode="numeric"
          pattern="[0-9]*"
          className={showInvalidFlash ? CSS_CLASSES.SCORE_INPUT_INVALID : ''}
        />
        <div id={`${scoreInputId}-help`} className="sr-only">
          {ACCESSIBILITY.DESCRIPTIONS.SCORE_INPUT_HELP}
        </div>
        <button 
          className={CSS_CLASSES.SUBMIT_SCORE_BTN} 
          onClick={onSubmitScore}
          aria-label={ACCESSIBILITY.LABELS.SUBMIT_SCORE_BUTTON}
        >
          {t(UI_TEXT_KEYS.SUBMIT_BUTTON)}
        </button>
        {onSubmitBust && (
          <button 
            className={CSS_CLASSES.BUST_BTN} 
            onClick={onSubmitBust}
            disabled={!canBust}
            aria-label={t('game.actions.bust')}
            title={canBust ? t('game.actions.bust') : t('game.messages.bustNotPossible', 'Bust not possible when score is 180 or higher')}
          >
            {t(UI_TEXT_KEYS.BUST_BUTTON)}
          </button>
        )}
        <button
          type="button"
          className={`calculator-toggle-btn ${showCalculator ? 'active' : ''}`}
          onClick={handleCalculatorToggle}
          aria-label={showCalculator ? 
            t('game.darts.hideDarts', 'Hide dart inputs') : 
            t('game.darts.showDarts', 'Show dart inputs')
          }
          aria-expanded={showCalculator}
          aria-controls="dart-calculator"
        >
          🎯🎯🎯
        </button>
      </div>
      {error && (
        <div 
          id={errorId}
          className={CSS_CLASSES.BUST_MESSAGE} 
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
});

ScoreInput.displayName = 'ScoreInput';

export default ScoreInput;