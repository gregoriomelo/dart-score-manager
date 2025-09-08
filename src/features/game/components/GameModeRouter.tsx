import React from 'react';
import { GameState, Player, isHighLowGameState, isCountdownGameState, isHighLowPlayer, isCountdownPlayer } from '../../../shared/types/game';
import CountdownGameBoard from './CountdownGameBoard';
import HighLowGameBoard from './HighLowGameBoard';

interface GameModeRouterProps {
  gameState: GameState;
  currentPlayer: Player | null;
  onSubmitScore: (playerId: string, score: number) => void;
  onNextPlayer: () => void;
  onResetGame: () => void;
  onNewGame: () => void;
  onSetChallenge?: (direction: 'higher' | 'lower', targetScore: number) => void;
  onSubmitHighLowScore?: (playerId: string, score: number) => void;
  onUndoLastMove: () => void;
  canUndo: boolean;
}

const GameModeRouter: React.FC<GameModeRouterProps> = ({
  gameState,
  currentPlayer,
  onSubmitScore,
  onNextPlayer,
  onResetGame,
  onNewGame,
  onSetChallenge,
  onSubmitHighLowScore,
  onUndoLastMove,
  canUndo,
}) => {
  if (isHighLowGameState(gameState)) {
    return (
      <HighLowGameBoard
        gameState={gameState}
        currentPlayer={currentPlayer && isHighLowPlayer(currentPlayer) ? currentPlayer : null}
        onSubmitHighLowScore={onSubmitHighLowScore!}
        onSetChallenge={onSetChallenge!}
        onNextPlayer={onNextPlayer}
        onResetGame={onResetGame}
        onNewGame={onNewGame}
        onUndoLastMove={onUndoLastMove}
        canUndo={canUndo}
      />
    );
  }

  if (isCountdownGameState(gameState)) {
    return (
      <CountdownGameBoard
        gameState={gameState}
        currentPlayer={currentPlayer && isCountdownPlayer(currentPlayer) ? currentPlayer : null}
        onSubmitScore={onSubmitScore}
        onNextPlayer={onNextPlayer}
        onResetGame={onResetGame}
        onNewGame={onNewGame}
        onUndoLastMove={onUndoLastMove}
        canUndo={canUndo}
      />
    );
  }

  // Fallback for any edge cases
  return null;
};

export default GameModeRouter;
