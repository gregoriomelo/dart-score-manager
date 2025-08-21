import { useState, useCallback, useEffect } from 'react';
import { GameState } from '../types/game';
import { 
  createPlayer,
  createGameState,
  updatePlayerScore, 
  nextPlayer, 
  resetGame, 
  getCurrentPlayer, 
  startGame 
} from '../utils/gameLogic';
import { saveGameState, loadGameState, clearGameState } from '../utils/localStorage';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    // Try to load saved game state on initialization
    const savedState = loadGameState();
    return savedState || {
      players: [],
      currentPlayerIndex: 0,
      gameFinished: false,
      winner: null,
      lastThrowWasBust: false,
    };
  });

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (gameState.players.length > 0) {
      saveGameState(gameState);
    }
  }, [gameState]);

  const initializeGame = useCallback((playerNames: string[], startingScore: number = 501) => {
    const players = playerNames.map(name => createPlayer(name, startingScore));
    setGameState(createGameState(players));
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

  const clearStoredGame = useCallback(() => {
    clearGameState();
    setGameState({
      players: [],
      currentPlayerIndex: 0,
      gameFinished: false,
      winner: null,
      lastThrowWasBust: false,
    });
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
    clearStoredGame,
  };
};
