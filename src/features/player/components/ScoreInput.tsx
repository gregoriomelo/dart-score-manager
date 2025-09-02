import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Player } from '../../../shared/types/game';
import { UI_TEXT_KEYS, CSS_CLASSES } from '../../../shared/utils/i18nConstants';
import { ACCESSIBILITY, generateAriaId } from '../../../shared/utils/accessibility';
import { usePerformanceTracking } from '../../performance/utils/performance';
import '../../game/components/GameBoard.css';

interface ScoreInputProps {
  currentPlayer: Player;
  scoreInput: string;
  onScoreInputChange: (value: string) => void;
  onSubmitScore: () => void;
  error?: string;
}

const ScoreInput: React.FC<ScoreInputProps> = React.memo(({
  currentPlayer,
  scoreInput,
  onScoreInputChange,
  onSubmitScore,
  error
}) => {
  const { t } = useTranslation();
  
  // Performance tracking
  usePerformanceTracking('ScoreInput');

  const scoreInputId = generateAriaId('score-input');
  const errorId = generateAriaId('score-error');

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ACCESSIBILITY.KEYBOARD.ENTER) {
      onSubmitScore();
    }
  }, [onSubmitScore]);

  return (
    <div className={CSS_CLASSES.SCORE_INPUT_SECTION} role="region" aria-labelledby="turn-title">
      <h3 id="turn-title">{t('game.display.playerTurn', { name: currentPlayer.name })}</h3>
      <div className={CSS_CLASSES.SCORE_INPUT}>
        <label htmlFor={scoreInputId} className="sr-only">
          {ACCESSIBILITY.LABELS.SCORE_INPUT}
        </label>
        <input
          id={scoreInputId}
          type="number"
          value={scoreInput}
          onChange={(e) => onScoreInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t(UI_TEXT_KEYS.SCORE_INPUT_PLACEHOLDER)}
          aria-label={ACCESSIBILITY.LABELS.SCORE_INPUT}
          aria-describedby={`${scoreInputId}-help ${error ? errorId : ''}`}
          aria-invalid={!!error}
          autoFocus
          min="0"
          max="180"
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
