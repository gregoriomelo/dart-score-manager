import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Player, HighLowGameState, HighLowPlayer } from '../../../shared/types/game';
import { UI_TEXT_KEYS, CSS_CLASSES } from '../../../shared/utils/i18nConstants';
import { useScoreSubmission } from '../../player/hooks/useScoreSubmission';
import HighLowChallenge from './HighLowChallenge';
import HighLowPlayerHistoryModal from '../../history/components/HighLowPlayerHistoryModal';
import HighLowAllPlayersHistoryModal from '../../history/components/HighLowAllPlayersHistoryModal';
import PlayerList from '../../player/components/PlayerList';
import GameActions from './GameActions';
import WinnerAnnouncement from './WinnerAnnouncement';
import ScoreInput from '../../player/components/ScoreInput';
import './GameBoard.css';

interface HighLowGameBoardProps {
  gameState: HighLowGameState;
  currentPlayer: HighLowPlayer | null;
  onSubmitHighLowScore: (playerId: string, score: number) => void;
  onSetChallenge: (direction: 'higher' | 'lower', targetScore: number) => void;
  onNextPlayer: () => void;
  onResetGame: () => void;
  onNewGame: () => void;
}

const HighLowGameBoard: React.FC<HighLowGameBoardProps> = React.memo(({
  gameState,
  currentPlayer,
  onSubmitHighLowScore,
  onSetChallenge,
  // onNextPlayer, // Unused parameter
  onResetGame,
  onNewGame,
}) => {
  const { t } = useTranslation();
  const [historyPlayer, setHistoryPlayer] = useState<Player | null>(null);
  const [showConsolidatedHistory, setShowConsolidatedHistory] = useState(false);

  const {
    scoreInput,
    error,
    handleSubmitScore,
    handleScoreInputChange
  } = useScoreSubmission({
    onSubmitScore: onSubmitHighLowScore,
    gameFinished: gameState.gameFinished
  });

  const handleScoreSubmit = useCallback(() => {
    if (currentPlayer) {
      handleSubmitScore(currentPlayer.id);
    }
  }, [currentPlayer, handleSubmitScore]);

  const handleSetChallenge = useCallback((direction: 'higher' | 'lower', targetScore: number) => {
    onSetChallenge(direction, targetScore);
  }, [onSetChallenge]);

  // Get the last score for reference - find the most recent score from any player's history
  const lastPlayerScore = useMemo((): number | undefined => {
    let latestScore: number | undefined = undefined;
    let latestTimestamp = new Date(0);
    
    gameState.players.forEach(player => {
      if (player.scoreHistory.length > 0) {
        const lastEntry = player.scoreHistory[player.scoreHistory.length - 1];
        if (lastEntry.timestamp > latestTimestamp) {
          latestTimestamp = lastEntry.timestamp;
          latestScore = lastEntry.score;
        }
      }
    });
    
    return latestScore;
  }, [gameState.players]);
  
  const needsChallengeSet = useMemo(() => !gameState.highLowChallenge, [gameState.highLowChallenge]);

  if (gameState.gameFinished && gameState.winner) {
    return (
      <>
        <WinnerAnnouncement
          winner={gameState.winner}
          players={gameState.players}
          gameMode="highLow"
          onHistoryClick={setHistoryPlayer}
          onShowAllHistory={() => setShowConsolidatedHistory(true)}
          onResetGame={onResetGame}
          onNewGame={onNewGame}
        />
        
        <HighLowPlayerHistoryModal 
          player={historyPlayer! as HighLowPlayer}
          isOpen={historyPlayer !== null}
          onClose={() => setHistoryPlayer(null)}
        />
        
        <HighLowAllPlayersHistoryModal 
          players={gameState.players as HighLowPlayer[]}
          isOpen={showConsolidatedHistory}
          onClose={() => setShowConsolidatedHistory(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className={CSS_CLASSES.GAME_BOARD}>
        <h1>{t(UI_TEXT_KEYS.APP_TITLE)}</h1>
        <div className={CSS_CLASSES.GAME_MODE_INDICATOR}>
          {t(UI_TEXT_KEYS.HIGH_LOW_MODE_INDICATOR)}
        </div>
        
        <PlayerList
          players={gameState.players}
          currentPlayer={currentPlayer}
          gameMode="highLow"
          onHistoryClick={setHistoryPlayer}
        />

        <HighLowChallenge
          currentChallenge={gameState.highLowChallenge}
          currentPlayerName={currentPlayer?.name || ''}
          lastScore={lastPlayerScore}
          onSetChallenge={handleSetChallenge}
          showChallengeForm={needsChallengeSet}
        />

        {currentPlayer && gameState.highLowChallenge && (
          <ScoreInput
            currentPlayer={currentPlayer}
            scoreInput={scoreInput}
            onScoreInputChange={handleScoreInputChange}
            onSubmitScore={handleScoreSubmit}
            error={error}
          />
        )}
        
        <GameActions
          onShowAllHistory={() => setShowConsolidatedHistory(true)}
          onResetGame={onResetGame}
          onNewGame={onNewGame}
        />
      </div>

      {/* History modals - always rendered so they're available during the game */}
      <HighLowPlayerHistoryModal 
        player={historyPlayer! as HighLowPlayer}
        isOpen={historyPlayer !== null}
        onClose={() => setHistoryPlayer(null)}
      />
      
      <HighLowAllPlayersHistoryModal 
        players={gameState.players as HighLowPlayer[]}
        isOpen={showConsolidatedHistory}
        onClose={() => setShowConsolidatedHistory(false)}
      />
    </>
  );
});

HighLowGameBoard.displayName = 'HighLowGameBoard';

export default HighLowGameBoard;
