import { useCallback } from 'react';
import { GameState } from '../../../shared/types/game';
import { updatePlayerScore, nextPlayer } from '../utils/gameLogic/core';

export const useCountdownGame = (
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const submitScore = useCallback(
    (playerId: string, scoreToSubtract: number) => {
      setGameState(prevState => {
        try {
          const updatedState = updatePlayerScore(prevState, playerId, scoreToSubtract);
          return updatedState;
        } catch (error) {
          console.error('Error updating score:', error);
          return prevState;
        }
      });
    },
    [setGameState]
  );

  const goToNextPlayer = useCallback(() => {
    setGameState(prevState => nextPlayer(prevState));
  }, [setGameState]);

  return {
    submitScore,
    goToNextPlayer,
  };
};
