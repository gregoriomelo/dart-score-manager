import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Player, HighLowGameState, HighLowPlayer } from '../../../shared/types/game';
import { UI_TEXT_KEYS, CSS_CLASSES } from '../../../shared/utils/i18nConstants';
import { soundManager } from '../../../utils/audio/soundManager';
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
  onUndoLastMove: () => void;
  canUndo: boolean;
}

const HighLowGameBoard: React.FC<HighLowGameBoardProps> = React.memo(({
  gameState,
  currentPlayer,
  onSubmitHighLowScore,
  onSetChallenge,
  // onNextPlayer, // Unused parameter
  onResetGame,
  onNewGame,
  onUndoLastMove,
  canUndo,
}) => {
  const { t } = useTranslation();
  const [historyPlayer, setHistoryPlayer] = useState<Player | null>(null);
  const [showConsolidatedHistory, setShowConsolidatedHistory] = useState(false);
  const previousPlayersRef = useRef<HighLowPlayer[]>([]);

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

  const handleScoreSubmitWithValue = useCallback((score: number) => {
    if (currentPlayer) {
      // Directly call the game logic with the score, bypassing the scoreInput state
      onSubmitHighLowScore(currentPlayer.id, score);
    }
  }, [currentPlayer, onSubmitHighLowScore]);

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

  // Monitor for life lost and elimination sounds
  useEffect(() => {
    const previousPlayers = previousPlayersRef.current;
    const currentPlayers = gameState.players;

    // Don't play life lost/elimination sounds if game just finished (winner sound will play instead)
    if (gameState.gameFinished) {
      previousPlayersRef.current = currentPlayers;
      return;
    }

    // Check for life lost or elimination
    currentPlayers.forEach((currentPlayer, index) => {
      const previousPlayer = previousPlayers[index];
      if (previousPlayer && currentPlayer.lives !== undefined && previousPlayer.lives !== undefined) {
        // Life lost (but not eliminated)
        if (currentPlayer.lives < previousPlayer.lives && currentPlayer.lives > 0) {
          soundManager.playSound('lifeLost');
        }
        // Elimination (lives went to 0)
        else if (currentPlayer.lives === 0 && previousPlayer.lives > 0) {
          soundManager.playSound('elimination');
        }
      }
    });

    // Update the ref for next comparison
    previousPlayersRef.current = currentPlayers;
  }, [gameState.players, gameState.gameFinished]);

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
            onSubmitScoreWithValue={handleScoreSubmitWithValue}
            error={error}
          />
        )}
        
        <PlayerList
          players={gameState.players}
          currentPlayer={currentPlayer}
          gameMode="highLow"
          onHistoryClick={setHistoryPlayer}
        />
        
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
        onUndoLastMove={onUndoLastMove}
        canUndo={canUndo}
      />
    </>
  );
});

HighLowGameBoard.displayName = 'HighLowGameBoard';

export default HighLowGameBoard;
