import { useState, useCallback } from 'react';
import { GameState } from '../types/game';
import {
  createGameState,
  updatePlayerScore,
  nextPlayer,
  startGame,
  resetGame,
  getCurrentPlayer,
} from '../utils/gameLogic';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPlayerIndex: 0,
    startingScore: 501,
    gameStarted: false,
    gameFinished: false,
    winner: null,
    currentDart: 1,
    doubleOutRule: false,
    lastThrowWasBust: false,
  });

  const initializeGame = useCallback((playerNames: string[], startingScore: number = 501, doubleOutRule: boolean = false) => {
    const newGameState = createGameState(playerNames, startingScore, doubleOutRule);
    setGameState(newGameState);
  }, []);

  const startNewGame = useCallback(() => {
    setGameState(prevState => startGame(prevState));
  }, []);

  const submitScore = useCallback((playerId: string, scoreToSubtract: number) => {
    setGameState(prevState => {
      try {
        const updatedState = updatePlayerScore(prevState, playerId, scoreToSubtract);
        return updatedState;
      } catch (error) {
        console.error('Error updating score:', error);
        return prevState;
      }
    });
  }, []);

  const goToNextPlayer = useCallback(() => {
    setGameState(prevState => nextPlayer(prevState));
  }, []);

  const resetCurrentGame = useCallback(() => {
    setGameState(prevState => resetGame(prevState));
  }, []);

  const currentPlayer = getCurrentPlayer(gameState);

  return {
    gameState,
    currentPlayer,
    initializeGame,
    startNewGame,
    submitScore,
    goToNextPlayer,
    resetCurrentGame,
  };
};
