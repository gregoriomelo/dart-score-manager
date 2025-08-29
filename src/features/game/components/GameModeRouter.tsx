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
      />
    );
  }

  // Fallback for any edge cases
  return null;
};

export default GameModeRouter;
