import React from 'react';
import { UI_TEXT, CSS_CLASSES } from '../../../shared/utils/constants';
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
  resetButtonText = "Reset Game"
}) => {
  return (
    <div className={CSS_CLASSES.GAME_ACTIONS}>
      <button onClick={onShowAllHistory} className={CSS_CLASSES.CONSOLIDATED_HISTORY_BUTTON}>
        {UI_TEXT.ALL_HISTORY_BUTTON}
      </button>
      <button className={CSS_CLASSES.NEW_GAME_BTN} onClick={onResetGame}>
        {resetButtonText}
      </button>
      <button className={CSS_CLASSES.BACK_TO_SETUP_BTN} onClick={onNewGame}>
        {UI_TEXT.BACK_TO_SETUP_BUTTON}
      </button>
    </div>
  );
});

export default GameActions;
