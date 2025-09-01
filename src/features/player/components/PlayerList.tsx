import React from 'react';
import { Player, isHighLowPlayer } from '../../../shared/types/game';
import { getPlayerColor } from '../../../shared/utils/playerColors';
import { CSS_CLASSES } from '../../../shared/utils/constants';
import { formatPlayerLivesLabel, formatHistoryButtonTitle } from '../../../shared/utils/textUtils';
import '../../game/components/GameBoard.css';

interface PlayerListProps {
  players: Player[];
  currentPlayer: Player | null;
  gameMode: 'countdown' | 'highLow';
  onHistoryClick: (player: Player) => void;
  showWinner?: boolean;
}

const PlayerList: React.FC<PlayerListProps> = React.memo(({ 
  players, 
  currentPlayer, 
  gameMode, 
  onHistoryClick,
  showWinner = false 
}) => {
  return (
    <div className={CSS_CLASSES.PLAYERS_LIST}>
      {players.map((player) => (
        <div 
          key={player.id} 
          className={`${CSS_CLASSES.PLAYER_CARD} ${currentPlayer?.id === player.id ? CSS_CLASSES.CURRENT_PLAYER : ''} ${showWinner && player.isWinner ? CSS_CLASSES.WINNER : ''} ${gameMode === 'highLow' && isHighLowPlayer(player) && player.lives <= 0 ? CSS_CLASSES.ELIMINATED : ''}`}
        >
          <span className={CSS_CLASSES.PLAYER_NAME} style={{ color: getPlayerColor(player.id) }}>
            {player.name}
          </span>
          {gameMode === 'countdown' ? (
            <span className={CSS_CLASSES.PLAYER_SCORE}>{player.score}</span>
          ) : (
            <span className={CSS_CLASSES.PLAYER_LIVES}>{formatPlayerLivesLabel(isHighLowPlayer(player) ? player.lives : 0)}</span>
          )}
          <button 
            className={CSS_CLASSES.HISTORY_BTN}
            onClick={() => onHistoryClick(player)}
            title={formatHistoryButtonTitle(player.name)}
          >
            📊
          </button>
        </div>
      ))}
    </div>
  );
});

PlayerList.displayName = 'PlayerList';

export default PlayerList;
