import React from 'react';
import { useTranslation } from 'react-i18next';
import { Player } from '../../../shared/types/game';
import { UI_TEXT_KEYS, CSS_CLASSES } from '../../../shared/utils/i18nConstants';
import { formatWinnerAnnouncement } from '../../../shared/utils/textUtils';
import PlayerList from '../../player/components/PlayerList';
import GameActions from './GameActions';
import './GameBoard.css';

interface WinnerAnnouncementProps {
  winner: Player;
  players: Player[];
  gameMode: 'countdown' | 'highLow';
  onHistoryClick: (player: Player) => void;
  onShowAllHistory: () => void;
  onResetGame: () => void;
  onNewGame: () => void;
}

const WinnerAnnouncement: React.FC<WinnerAnnouncementProps> = React.memo(({
  winner,
  players,
  gameMode,
  onHistoryClick,
  onShowAllHistory,
  onResetGame,
  onNewGame
}) => {
  const { t } = useTranslation();
  
  return (
    <div className={CSS_CLASSES.GAME_BOARD}>
      <div className={CSS_CLASSES.WINNER_ANNOUNCEMENT}>
        <h2>{t(UI_TEXT_KEYS.WINNER_CONGRATULATIONS)}</h2>
        <p>{formatWinnerAnnouncement(winner.name)}</p>
      </div>
      
      <div className={CSS_CLASSES.FINAL_SCORES}>
        <h3>{gameMode === 'countdown' ? t(UI_TEXT_KEYS.FINAL_SCORES_COUNTDOWN) : t(UI_TEXT_KEYS.FINAL_RESULTS_HIGH_LOW)}</h3>
        <PlayerList
          players={players}
          currentPlayer={null}
          gameMode={gameMode}
          onHistoryClick={onHistoryClick}
          showWinner={true}
        />
      </div>
      
      <GameActions
        onShowAllHistory={onShowAllHistory}
        onResetGame={onResetGame}
        onNewGame={onNewGame}
        resetButtonText={t(UI_TEXT_KEYS.PLAY_AGAIN_BUTTON)}
      />
    </div>
  );
});

WinnerAnnouncement.displayName = 'WinnerAnnouncement';

export default WinnerAnnouncement;
