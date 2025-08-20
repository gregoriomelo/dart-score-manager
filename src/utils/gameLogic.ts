import { Player, GameState } from '../types/game';

export const createPlayer = (name: string, startingScore: number = 501): Player => ({
  id: Math.random().toString(36).substr(2, 9),
  name: name.trim(),
  score: startingScore,
  isWinner: false,
  turnStartScore: startingScore,
});

export const createGameState = (players: Player[], startingScore: number = 501): GameState => {
  return {
    players: players.map(player => ({ ...player, score: startingScore, turnStartScore: startingScore })),
    currentPlayerIndex: 0,
    gameFinished: false,
    winner: null,
    lastThrowWasBust: false,
  };
};

export const isValidScore = (currentScore: number, scoreToSubtract: number): boolean => {
  // Score must be between 0 and 180, and not result in negative score
  return scoreToSubtract >= 0 && scoreToSubtract <= 180 && scoreToSubtract <= currentScore;
};

export const isBust = (currentScore: number, scoreToSubtract: number): boolean => {
  const newScore = currentScore - scoreToSubtract;
  
  // Bust if would go below zero
  if (newScore < 0) return true;
  
  // Bust if remaining score would be 1
  if (newScore === 1) return true;
  
  return false;
};

export const startNewTurn = (gameState: GameState): GameState => {
  const updatedPlayers = gameState.players.map((player, index) => {
    if (index === gameState.currentPlayerIndex) {
      return { ...player, turnStartScore: player.score };
    }
    return player;
  });

  return {
    ...gameState,
    players: updatedPlayers,
    lastThrowWasBust: false,
  };
};

export const updatePlayerScore = (
  gameState: GameState,
  playerId: string,
  scoreToSubtract: number
): GameState => {
  const playerIndex = gameState.players.findIndex(p => p.id === playerId);
  
  if (playerIndex === -1) {
    throw new Error('Player not found');
  }

  const currentPlayer = gameState.players[playerIndex];
  
  if (scoreToSubtract < 0 || scoreToSubtract > 180) {
    throw new Error('Invalid score: exceeds maximum possible score');
  }

  // Check for bust
  const bustOccurred = isBust(currentPlayer.score, scoreToSubtract);
  const updatedPlayers = [...gameState.players];
  
  if (bustOccurred) {
    // Revert to turn start score on bust
    updatedPlayers[playerIndex] = {
      ...currentPlayer,
      score: currentPlayer.turnStartScore,
    };
    
    return {
      ...gameState,
      players: updatedPlayers,
      lastThrowWasBust: true,
    };
  }

  // Normal score update
  const newScore = currentPlayer.score - scoreToSubtract;
  updatedPlayers[playerIndex] = {
    ...currentPlayer,
    score: newScore,
    isWinner: newScore === 0,
  };

  const winner = updatedPlayers.find(p => p.isWinner) || null;
  const gameFinished = winner !== null;

  return {
    ...gameState,
    players: updatedPlayers,
    gameFinished,
    winner,
    lastThrowWasBust: false,
  };
};

export const nextPlayer = (gameState: GameState): GameState => {
  if (gameState.gameFinished) {
    return gameState;
  }

  // Move to next player and start new turn
  const nextIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
  
  return startNewTurn({
    ...gameState,
    currentPlayerIndex: nextIndex,
  });
};

export const startGame = (gameState: GameState): GameState => ({
  ...gameState,
});

export const resetGame = (gameState: GameState, startingScore: number = 501): GameState => {
  const resetPlayers = gameState.players.map(player => ({
    ...player,
    score: startingScore,
    isWinner: false,
    turnStartScore: startingScore,
  }));

  return {
    ...gameState,
    players: resetPlayers,
    currentPlayerIndex: 0,
    gameFinished: false,
    winner: null,
    lastThrowWasBust: false,
  };
};

export const getCurrentPlayer = (gameState: GameState): Player | null => {
  if (gameState.players.length === 0) return null;
  return gameState.players[gameState.currentPlayerIndex];
};
