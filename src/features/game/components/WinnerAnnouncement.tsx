import React from 'react';
import { Player } from '../../../shared/types/game';
import { UI_TEXT, CSS_CLASSES } from '../../../shared/utils/constants';
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
  return (
    <div className={CSS_CLASSES.GAME_BOARD}>
      <div className={CSS_CLASSES.WINNER_ANNOUNCEMENT}>
        <h2>{UI_TEXT.WINNER_CONGRATULATIONS}</h2>
        <p>{formatWinnerAnnouncement(winner.name)}</p>
      </div>
      
      <div className={CSS_CLASSES.FINAL_SCORES}>
        <h3>{gameMode === 'countdown' ? UI_TEXT.FINAL_SCORES_COUNTDOWN : UI_TEXT.FINAL_RESULTS_HIGH_LOW}</h3>
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
        resetButtonText={UI_TEXT.PLAY_AGAIN_BUTTON}
      />
    </div>
  );
});

export default WinnerAnnouncement;
