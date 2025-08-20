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
    gameFinished: false,
    winner: null,
    lastThrowWasBust: false,
  });

  const initializeGame = useCallback((playerNames: string[], startingScore: number = 501) => {
    const players = playerNames.map(name => ({ 
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      score: startingScore,
      isWinner: false,
      turnStartScore: startingScore,
    }));
    const newGameState = createGameState(players, startingScore);
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
