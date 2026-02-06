import { GameState, HighLowChallenge } from '../../../../shared/types/game';
import { nextPlayer } from './core';

export const setHighLowChallenge = (
  gameState: GameState,
  playerId: string,
  direction: 'higher' | 'lower',
  targetScore: number
): GameState => {
  if (gameState.gameMode !== 'high-low') {
    throw new Error('Can only set High-Low challenge in High-Low game mode');
  }

  const challenge: HighLowChallenge = {
    playerId,
    direction,
    targetScore,
  };

  return {
    ...gameState,
    highLowChallenge: challenge,
  };
};

export const processHighLowTurn = (gameState: GameState, playerId: string, score: number): GameState => {
  if (gameState.gameMode !== 'high-low') {
    throw new Error('Can only process High-Low turn in High-Low game mode');
  }

  if (!gameState.highLowChallenge) {
    throw new Error('No challenge set for High-Low turn');
  }

  if (gameState.highLowChallenge.playerId !== playerId) {
    throw new Error('Wrong player attempting turn');
  }

  const playerIndex = gameState.players.findIndex(p => p.id === playerId);
  const currentPlayer = gameState.players[playerIndex];
  const challenge = gameState.highLowChallenge;
  const updatedPlayers = [...gameState.players];

  const challengeSuccessful = challenge.direction === 'higher' 
    ? score > challenge.targetScore 
    : score < challenge.targetScore;

  const historyEntry = {
    score,
    previousScore: currentPlayer.score,
    timestamp: new Date(),
    turnNumber: currentPlayer.scoreHistory.length + 1,
    challengeDirection: challenge.direction,
    challengeTarget: challenge.targetScore,
    challengerId: challenge.playerId,
    passedChallenge: challengeSuccessful,
    livesBefore: currentPlayer.lives,
    livesAfter: challengeSuccessful ? currentPlayer.lives : (currentPlayer.lives || 0) - 1,
  };

  if (challengeSuccessful) {
    updatedPlayers[playerIndex] = {
      ...currentPlayer,
      score,
      scoreHistory: [...currentPlayer.scoreHistory, historyEntry],
    };

    const nextState: GameState = {
      ...gameState,
      players: updatedPlayers,
      highLowChallenge: undefined,
      currentPlayerIndex: playerIndex,
    };

    return nextPlayer(nextState);
  } else {
    const newLives = (currentPlayer.lives || 0) - 1;

    updatedPlayers[playerIndex] = {
      ...currentPlayer,
      score,
      lives: newLives,
      isWinner: false,
      scoreHistory: [...currentPlayer.scoreHistory, historyEntry],
    };

    const playersWithLives = updatedPlayers.filter(p => (p.lives || 0) > 0);
    const gameFinished = playersWithLives.length <= 1;
    const winner = gameFinished ? playersWithLives[0] || null : null;

    if (winner) {
      updatedPlayers[updatedPlayers.findIndex(p => p.id === winner.id)].isWinner = true;
    }

    const nextState: GameState = {
      ...gameState,
      players: updatedPlayers,
      currentPlayerIndex: playerIndex,
      gameFinished,
      winner,
      highLowChallenge: undefined,
    };

    return nextPlayer(nextState);
  }
};

export const isHighLowGameMode = (gameState: GameState): boolean => {
  return gameState.gameMode === 'high-low';
};
