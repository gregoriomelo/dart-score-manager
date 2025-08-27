import { useCallback } from 'react';
import { GameState } from '../types/game';
import { processHighLowTurn, setHighLowChallenge } from '../utils/gameLogic/highLow';

export const useHighLowGame = (
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
) => {
  const setChallengeForHighLow = useCallback(
    (direction: 'higher' | 'lower', targetScore: number, challengerId?: string) => {
      setGameState(prevState => {
        const currentPlayerId = challengerId || prevState.players[prevState.currentPlayerIndex]?.id || '';
        return setHighLowChallenge(prevState, currentPlayerId, direction, targetScore);
      });
    },
    [setGameState]
  );

  const submitHighLowScore = useCallback(
    (playerId: string, score: number) => {
      setGameState(prevState => {
        try {
          return processHighLowTurn(prevState, playerId, score);
        } catch (error) {
          console.error('Error processing high-low turn:', error);
          return prevState;
        }
      });
    },
    [setGameState]
  );

  return {
    setChallengeForHighLow,
    submitHighLowScore,
  };
};
