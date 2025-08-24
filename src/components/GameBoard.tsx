import React from 'react';
import { GameState, Player } from '../types/game';
import CountdownGameBoard from './CountdownGameBoard';
import HighLowGameBoard from './HighLowGameBoard';

interface GameBoardProps {
  gameState: GameState;
  currentPlayer: Player | null;
  onSubmitScore: (playerId: string, score: number) => void;
  onNextPlayer: () => void;
  onResetGame: () => void;
  onNewGame: () => void;
  onSetChallenge?: (direction: 'higher' | 'lower', targetScore: number) => void;
  onSubmitHighLowScore?: (playerId: string, score: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  currentPlayer,
  onSubmitScore,
  onNextPlayer,
  onResetGame,
  onNewGame,
  onSetChallenge,
  onSubmitHighLowScore,
}) => {
  if (gameState.gameMode === 'high-low') {
    return (
      <HighLowGameBoard
        gameState={gameState}
        currentPlayer={currentPlayer}
        onSubmitHighLowScore={onSubmitHighLowScore!}
        onSetChallenge={onSetChallenge!}
        onNextPlayer={onNextPlayer}
        onResetGame={onResetGame}
        onNewGame={onNewGame}
      />
    );
  }

  return (
    <CountdownGameBoard
      gameState={gameState}
      currentPlayer={currentPlayer}
      onSubmitScore={onSubmitScore}
      onNextPlayer={onNextPlayer}
      onResetGame={onResetGame}
      onNewGame={onNewGame}
    />
  );
};

export default GameBoard;
