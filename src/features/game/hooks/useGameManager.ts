import { useState, useCallback, useEffect, useMemo } from 'react';
import { GameState, GameMode, CountdownGameState, isHighLowGameState, isCountdownGameState } from '../../../shared/types/game';
import { getCurrentPlayer, startGame } from '../utils/gameLogic/core';
import { isHighLowGameMode } from '../utils/gameLogic/highLow';
import { createGameState, resetGame } from '../utils/gameLogic/core';
import { saveGameState, loadGameState, clearGameState } from '../../../shared/utils/localStorage';
import { useCountdownGame } from './useCountdownGame';
import { useHighLowGame } from './useHighLowGame';

export const useGameManager = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPlayerIndex: 0,
    gameFinished: false,
    winner: null,
    lastThrowWasBust: false,
    gameMode: 'countdown',
    startingScore: 501,
  } as CountdownGameState);

  // Load saved game state on mount
  useEffect(() => {
    const loadSavedState = async () => {
      const savedState = await loadGameState();
      if (savedState) {
        setGameState(savedState);
      }
    };
    loadSavedState();
  }, []);

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
    setGameState(prevState => {
      if (isCountdownGameState(prevState)) {
        return resetGame(prevState, undefined, prevState.startingScore);
      } else if (isHighLowGameState(prevState)) {
        return resetGame(prevState, prevState.startingLives, undefined);
      }
      return prevState;
    });
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
      startingScore: 501,
    } as CountdownGameState);
  }, []);

  const countdownActions = useCountdownGame(setGameState);
  const highLowActions = useHighLowGame(setGameState);

  const currentPlayer = useMemo(() => getCurrentPlayer(gameState), [gameState]);

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
