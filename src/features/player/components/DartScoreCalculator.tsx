import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { generateAriaId } from '../../../shared/utils/accessibility';
import { usePerformanceTracking } from '../../performance/utils/performance';
import './DartScoreCalculator.css';

interface DartScoreCalculatorProps {
  onScoreSubmit: (totalScore: number) => void;
  onCancel?: () => void;
  maxScore?: number;
}

const DartScoreCalculator: React.FC<DartScoreCalculatorProps> = React.memo(React.forwardRef<HTMLDivElement, DartScoreCalculatorProps>(({
  onScoreSubmit,
  onCancel,
  maxScore = 180
}, ref) => {
  const { t } = useTranslation();
  
  // Performance tracking
  usePerformanceTracking('DartScoreCalculator');

  const [dartScores, setDartScores] = useState<[number, number, number]>([0, 0, 0]);
  const [inputValues, setInputValues] = useState<[string, string, string]>(['', '', '']);
  const [activeDartIndex, setActiveDartIndex] = useState<number>(0);
  const [showInvalidFlash, setShowInvalidFlash] = useState<[boolean, boolean, boolean]>([false, false, false]);

  // Generate unique IDs for accessibility
  const calculatorId = generateAriaId('dart-calculator');
  const dartInputIds = [
    generateAriaId('dart-1'),
    generateAriaId('dart-2'),
    generateAriaId('dart-3')
  ];

  // Ref for the first dart input
  const firstDartInputRef = useRef<HTMLInputElement>(null);

  // Function to focus the first dart input
  const focusFirstDartInput = useCallback(() => {
    if (firstDartInputRef.current) {
      firstDartInputRef.current.focus();
    }
  }, []);

  // Focus first dart input when calculator opens
  useEffect(() => {
    focusFirstDartInput();
  }, [focusFirstDartInput]);

  // Calculate total score
  const totalScore = useMemo(() => 
    dartScores.reduce((sum, score) => sum + score, 0), 
    [dartScores]
  );

  // Check if total score is valid
  const isValidTotal = useMemo(() => 
    totalScore >= 0 && totalScore <= maxScore, 
    [totalScore, maxScore]
  );

  // Handle dart score input change
  const handleDartScoreChange = useCallback((index: number, value: string) => {
    // Allow empty input
    if (value === '') {
      const newInputValues = [...inputValues] as [string, string, string];
      newInputValues[index] = value;
      setInputValues(newInputValues);
      
      const newDartScores = [...dartScores] as [number, number, number];
      newDartScores[index] = 0;
      setDartScores(newDartScores);
      return;
    }

    // Only allow numeric input
    if (!/^\d+$/.test(value)) {
      return;
    }

    const numValue = parseInt(value, 10);
    
    // Check if the complete number would exceed 60
    if (numValue > 60) {
      // Show brief visual feedback for invalid input
      const newFlashState = [...showInvalidFlash] as [boolean, boolean, boolean];
      newFlashState[index] = true;
      setShowInvalidFlash(newFlashState);
      setTimeout(() => {
        setShowInvalidFlash(prev => {
          const newState = [...prev] as [boolean, boolean, boolean];
          newState[index] = false;
          return newState;
        });
      }, 300); // Flash for 300ms
      return; // Don't update if the number is too large
    }
    
    // Input is valid, update it
    const newInputValues = [...inputValues] as [string, string, string];
    newInputValues[index] = value;
    setInputValues(newInputValues);
    
    const newDartScores = [...dartScores] as [number, number, number];
    newDartScores[index] = numValue;
    setDartScores(newDartScores);

    // Don't auto-advance - let user control navigation manually
    // Auto-advance was removed to prevent premature field switching
  }, [dartScores, inputValues, showInvalidFlash]);

  // Handle key navigation between dart inputs
  const handleDartKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];
    
    const isNumber = /^[0-9]$/.test(e.key);
    
    if (!allowedKeys.includes(e.key) && !isNumber) {
      e.preventDefault();
      return;
    }

    // Handle arrow key navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      setActiveDartIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < 2) {
      e.preventDefault();
      setActiveDartIndex(index + 1);
    }

    // Handle Enter key to submit
    if (e.key === 'Enter' && isValidTotal) {
      e.preventDefault();
      onScoreSubmit(totalScore);
    }
  }, [isValidTotal, totalScore, onScoreSubmit]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (isValidTotal) {
      onScoreSubmit(totalScore);
    }
  }, [isValidTotal, totalScore, onScoreSubmit]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  // Reset calculator
  const handleReset = useCallback(() => {
    setDartScores([0, 0, 0]);
    setInputValues(['', '', '']);
    setActiveDartIndex(0);
  }, []);



  return (
    <div ref={ref} className="dart-score-calculator" role="region">
      {/* Individual dart inputs */}
      <div className="dart-inputs" role="group">
        <div className="dart-input-row">
          {dartScores.map((score, index) => (
            <div key={index} className="dart-input-group">
              <label htmlFor={dartInputIds[index]} className="dart-label">
                {t('game.calculator.dartLabel', 'Dart {{number}}', { number: index + 1 })}
              </label>
              <input
                ref={index === 0 ? firstDartInputRef : undefined}
                id={dartInputIds[index]}
                type="number"
                value={inputValues[index]}
                onChange={(e) => handleDartScoreChange(index, e.target.value)}
                onKeyDown={(e) => handleDartKeyDown(e, index)}
                onFocus={() => setActiveDartIndex(index)}
                className={`dart-input ${activeDartIndex === index ? 'active' : ''} ${showInvalidFlash[index] ? 'dart-input-invalid' : ''}`}
                placeholder="0"
                min="0"
                max="60"
                step="1"
                inputMode="numeric"
                pattern="[0-9]*"
                aria-label={t('game.calculator.dartInputLabel', 'Dart {{number}} score (0-60)', { number: index + 1 })}
                aria-describedby={`${calculatorId}-help`}
              />
            </div>
          ))}
        </div>
      </div>





      {/* Action buttons */}
      <div className="calculator-actions">
        <button
          type="button"
          className="calculator-btn secondary"
          onClick={handleReset}
          aria-label={t('game.calculator.resetLabel', 'Reset calculator')}
        >
          {t('game.calculator.resetButton', 'Reset')}
        </button>
        
        {onCancel && (
          <button
            type="button"
            className="calculator-btn secondary"
            onClick={handleCancel}
            aria-label={t('game.calculator.cancelLabel', 'Cancel calculator')}
          >
            {t('game.calculator.cancelButton', 'Cancel')}
          </button>
        )}
        
        <button
          type="button"
          className="calculator-btn primary"
          onClick={handleSubmit}
          disabled={!isValidTotal}
          aria-label={t('game.calculator.submitLabel', 'Submit total score')}
        >
          {t('game.calculator.submitButton', 'Submit')}
        </button>
      </div>

      {/* Help text */}
      <div id={`${calculatorId}-help`} className="sr-only">
        {t('game.calculator.helpText', 'Enter individual dart scores (0-60 each). The total will be calculated and submitted automatically.')}
      </div>
    </div>
  );
}));

DartScoreCalculator.displayName = 'DartScoreCalculator';

export default DartScoreCalculator;
