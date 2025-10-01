import React from 'react';
import { Player, isHighLowPlayer, isRoundsPlayer, CountdownPlayer } from '../../../shared/types/game';
import { getPlayerColor } from '../../../shared/utils/playerColors';
import { CSS_CLASSES } from '../../../shared/utils/constants';
import { formatPlayerLivesLabel, formatHistoryButtonTitle } from '../../../shared/utils/textUtils';
import { getPlayerRank } from '../../../shared/utils/rankingUtils';
import '../../game/components/GameBoard.css';

interface PlayerListProps {
  players: Player[];
  currentPlayer: Player | null;
  gameMode: 'countdown' | 'highLow' | 'rounds';
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
            <div className="player-score-container">
              <span className={CSS_CLASSES.PLAYER_SCORE}>{(player as CountdownPlayer).score}</span>
              {(() => {
                const rank = getPlayerRank(player as CountdownPlayer, players as CountdownPlayer[]);
                return rank !== null ? (
                  <span className={`player-rank ${rank <= 3 ? `rank-${rank}` : ''}`}>#{rank}</span>
                ) : null;
              })()}
            </div>
          ) : gameMode === 'rounds' ? (
            <div className="player-score-container">
              <span className={CSS_CLASSES.PLAYER_SCORE}>
                {isRoundsPlayer(player) ? player.totalScore : 0}
              </span>
              {isRoundsPlayer(player) && (
                <span className="round-info">
                  Round {player.currentRoundScore}
                </span>
              )}
            </div>
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
