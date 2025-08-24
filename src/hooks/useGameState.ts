import { useState, useCallback, useEffect } from 'react';
import { GameState, GameMode } from '../types/game';
import { 
  createPlayer,
  createGameState,
  updatePlayerScore, 
  nextPlayer, 
  resetGame, 
  getCurrentPlayer, 
  startGame,
  setHighLowChallenge,
  processHighLowTurn,
  isHighLowGameMode
} from '../utils/gameLogic/index';
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
      gameMode: 'countdown',
    };
  });

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (gameState.players.length > 0) {
      saveGameState(gameState);
    }
  }, [gameState]);

  const initializeGame = useCallback((playerNames: string[], gameMode: GameMode = 'countdown', startingScore: number = 501, startingLives: number = 5) => {
    setGameState(createGameState(playerNames, startingScore, gameMode, startingLives));
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
    setGameState(prevState => resetGame(prevState, prevState.startingLives, prevState.startingScore));
  }, []);

  const clearStoredGame = useCallback(() => {
    clearGameState();
    setGameState({
      players: [],
      currentPlayerIndex: 0,
      gameFinished: false,
      winner: null,
      lastThrowWasBust: false,
      gameMode: 'countdown',
    });
  }, []);

  // High-Low specific functions
  const setChallengeForHighLow = useCallback((direction: 'higher' | 'lower', targetScore: number, challengerId?: string) => {
    setGameState(prevState => {
      const currentPlayerId = challengerId || prevState.players[prevState.currentPlayerIndex]?.id || '';
      return setHighLowChallenge(prevState, currentPlayerId, direction, targetScore);
    });
  }, []);

  const submitHighLowScore = useCallback((playerId: string, score: number) => {
    setGameState(prevState => {
      try {
        return processHighLowTurn(prevState, playerId, score);
      } catch (error) {
        console.error('Error processing high-low turn:', error);
        return prevState;
      }
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
    setChallengeForHighLow,
    submitHighLowScore,
    isHighLowMode: isHighLowGameMode(gameState),
  };
};
