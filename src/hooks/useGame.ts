import { useState, useCallback, useEffect } from 'react';
import { GameState, GameMode } from '../types/game';
import { getCurrentPlayer, startGame } from '../utils/gameLogic';
import { isHighLowGameMode } from '../utils/gameLogic/highLow';
import { createGameState, resetGame } from '../utils/gameLogic/common';
import { saveGameState, loadGameState, clearGameState } from '../utils/localStorage';
import { useCountdownGame } from './useCountdownGame';
import { useHighLowGame } from './useHighLowGame';

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
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

  useEffect(() => {
    if (gameState.players.length > 0) {
      saveGameState(gameState);
    }
  }, [gameState]);

  const initializeGame = useCallback(
    (playerNames: string[], gameMode: GameMode = 'countdown', startingScore: number = 501, startingLives: number = 5) => {
      setGameState(createGameState(playerNames, startingScore, gameMode, startingLives));
    },
    []
  );

  const startNewGame = useCallback(() => {
    setGameState(prevState => startGame(prevState));
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

  const countdownActions = useCountdownGame(setGameState);
  const highLowActions = useHighLowGame(setGameState);

  const currentPlayer = getCurrentPlayer(gameState);

  return {
    gameState,
    currentPlayer,
    initializeGame,
    startNewGame,
    resetCurrentGame,
    clearStoredGame,
    isHighLowMode: isHighLowGameMode(gameState),
    ...countdownActions,
    ...highLowActions,
  };
};
