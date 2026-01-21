import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { RoundsGameState, RoundsPlayer, Player } from '../../../shared/types/game';
import { UI_TEXT_KEYS, CSS_CLASSES } from '../../../shared/utils/i18nConstants';
import { useScoreSubmission } from '../../player/hooks/useScoreSubmission';
import ScoreInput from '../../player/components/ScoreInput';
import PlayerList from '../../player/components/PlayerList';
import GameActions from './GameActions';
import WinnerAnnouncement from './WinnerAnnouncement';
import RoundsPlayerHistoryModal from '../../history/components/RoundsPlayerHistoryModal';
import RoundsAllPlayersHistoryModal from '../../history/components/RoundsAllPlayersHistoryModal';
import './GameBoard.css';

interface RoundsGameBoardProps {
  gameState: RoundsGameState;
  currentPlayer: RoundsPlayer | null;
  onSubmitScore: (playerId: string, score: number) => void;
  onNextPlayer: () => void;
  onResetGame: () => void;
  onNewGame: () => void;
  onUndoLastMove: () => void;
  canUndo: boolean;
}

const RoundsGameBoard: React.FC<RoundsGameBoardProps> = React.memo(({
  gameState,
  currentPlayer,
  onSubmitScore,
  onNextPlayer,
  onResetGame,
  onNewGame,
  onUndoLastMove,
  canUndo,
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
    onSubmitScore,
    onNextPlayer: undefined, // Rounds mode handles player advancement internally
    gameFinished: gameState.gameFinished
  });

  const handleScoreSubmit = useCallback(() => {
    if (currentPlayer) {
      handleSubmitScore(currentPlayer.id);
    }
  }, [currentPlayer, handleSubmitScore]);

  const handleScoreSubmitWithValue = useCallback((score: number) => {
    if (currentPlayer) {
      // Directly call the game logic with the score, bypassing the scoreInput state
      // Rounds mode handles player advancement internally in updateRoundsPlayerScore
      onSubmitScore(currentPlayer.id, score);
    }
  }, [currentPlayer, onSubmitScore]);

  if (gameState.gameFinished && gameState.winner) {
    return (
      <>
        <WinnerAnnouncement
          winner={gameState.winner}
          players={gameState.players}
          gameMode="rounds"
          onHistoryClick={setHistoryPlayer}
          onShowAllHistory={() => setShowConsolidatedHistory(true)}
          onResetGame={onResetGame}
          onNewGame={onNewGame}
        />
        
        <RoundsPlayerHistoryModal 
          player={historyPlayer! as RoundsPlayer}
          isOpen={historyPlayer !== null}
          onClose={() => setHistoryPlayer(null)}
        />
        
        <RoundsAllPlayersHistoryModal 
          players={gameState.players}
          isOpen={showConsolidatedHistory}
          onClose={() => setShowConsolidatedHistory(false)}
          onUndoLastMove={onUndoLastMove}
          canUndo={canUndo}
        />
      </>
    );
  }

  return (
    <>
      <div className={CSS_CLASSES.GAME_BOARD}>
        <h1>{t(UI_TEXT_KEYS.APP_TITLE)}</h1>
        <div className={CSS_CLASSES.GAME_MODE_INDICATOR}>
          {t(UI_TEXT_KEYS.ROUNDS_MODE_INDICATOR, { 
            currentRound: gameState.currentRound, 
            totalRounds: gameState.totalRounds 
          })}
        </div>
        
        <PlayerList
          players={gameState.players}
          currentPlayer={currentPlayer}
          gameMode="rounds"
          onHistoryClick={setHistoryPlayer}
        />

        {currentPlayer && !gameState.gameFinished && (
          <ScoreInput
            currentPlayer={currentPlayer}
            scoreInput={scoreInput}
            onScoreInputChange={handleScoreInputChange}
            onSubmitScore={handleScoreSubmit}
            onSubmitScoreWithValue={handleScoreSubmitWithValue}
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
      <RoundsPlayerHistoryModal 
        player={historyPlayer! as RoundsPlayer}
        isOpen={historyPlayer !== null}
        onClose={() => setHistoryPlayer(null)}
      />
      
      <RoundsAllPlayersHistoryModal 
        players={gameState.players}
        isOpen={showConsolidatedHistory}
        onClose={() => setShowConsolidatedHistory(false)}
        onUndoLastMove={onUndoLastMove}
        canUndo={canUndo}
      />
    </>
  );
});

RoundsGameBoard.displayName = 'RoundsGameBoard';

export default RoundsGameBoard;
