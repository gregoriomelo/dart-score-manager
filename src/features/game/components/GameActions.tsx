import React from 'react';
import { useTranslation } from 'react-i18next';
import { UI_TEXT_KEYS, CSS_CLASSES } from '../../../shared/utils/i18nConstants';
import './GameBoard.css';

interface GameActionsProps {
  onShowAllHistory: () => void;
  onResetGame: () => void;
  onNewGame: () => void;
  resetButtonText?: string;
}

const GameActions: React.FC<GameActionsProps> = React.memo(({ 
  onShowAllHistory, 
  onResetGame, 
  onNewGame,
  resetButtonText
}) => {
  const { t } = useTranslation();
  
  return (
    <div className={CSS_CLASSES.GAME_ACTIONS}>
      <button onClick={onShowAllHistory} className={CSS_CLASSES.CONSOLIDATED_HISTORY_BUTTON}>
        {t(UI_TEXT_KEYS.ALL_HISTORY_BUTTON)}
      </button>
      <button className={CSS_CLASSES.NEW_GAME_BTN} onClick={onResetGame}>
        {resetButtonText || t(UI_TEXT_KEYS.RESET_GAME_BUTTON)}
      </button>
      <button className={CSS_CLASSES.BACK_TO_SETUP_BTN} onClick={onNewGame}>
        {t(UI_TEXT_KEYS.BACK_TO_SETUP_BUTTON)}
      </button>
    </div>
  );
});

GameActions.displayName = 'GameActions';

export default GameActions;
