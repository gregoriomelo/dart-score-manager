import { Player, GameState, GameMode } from '../types/game';

export const createPlayer = (name: string, startingScore: number, gameMode: GameMode = 'countdown', startingLives?: number): Player => ({
  id: `player-${name.toLowerCase().replace(/\s+/g, '-')}`,
  name,
  score: gameMode === 'high-low' ? 40 : startingScore,
  isWinner: false,
  turnStartScore: gameMode === 'high-low' ? 40 : startingScore,
  scoreHistory: [],
  lives: gameMode === 'high-low' ? startingLives || 5 : undefined,
});

export const createGameState = (players: Player[], gameMode: GameMode = 'countdown', startingScore?: number, startingLives?: number): GameState => {
  return {
    players: players.map(player => ({ ...player, turnStartScore: player.score })),
    currentPlayerIndex: 0,
    gameFinished: false,
    winner: null,
    lastThrowWasBust: false,
    gameMode,
    startingScore,
    startingLives,
  };
};

export const isValidScore = (currentScore: number, scoreToSubtract: number): boolean => {
  // Score must be between 0 and 180, and not result in negative score
  return scoreToSubtract >= 0 && scoreToSubtract <= 180 && scoreToSubtract <= currentScore;
};

export const isBust = (currentScore: number, scoreToSubtract: number): boolean => {
  // Bust if score exceeds remaining points
  if (scoreToSubtract > currentScore) return true;
  
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
  
  // Calculate turn number based on existing history
  const turnNumber = currentPlayer.scoreHistory.length + 1;
  
  if (bustOccurred) {
    // Add bust entry to history
    const historyEntry = {
      score: scoreToSubtract,
      previousScore: currentPlayer.score,
      timestamp: new Date(),
      turnNumber,
    };
    
    // Revert to turn start score on bust
    updatedPlayers[playerIndex] = {
      ...currentPlayer,
      score: currentPlayer.turnStartScore,
      scoreHistory: [...currentPlayer.scoreHistory, historyEntry],
    };
    
    return {
      ...gameState,
      players: updatedPlayers,
      lastThrowWasBust: true,
    };
  }

  // Normal score update
  const newScore = currentPlayer.score - scoreToSubtract;
  const historyEntry = {
    score: scoreToSubtract,
    previousScore: currentPlayer.score,
    timestamp: new Date(),
    turnNumber,
  };
  
  updatedPlayers[playerIndex] = {
    ...currentPlayer,
    score: newScore,
    isWinner: newScore === 0,
    scoreHistory: [...currentPlayer.scoreHistory, historyEntry],
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

  // In high-low mode, skip players with 0 lives
  if (gameState.gameMode === 'high-low') {
    let nextIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    let attempts = 0;
    
    // Find next player with lives remaining
    while (attempts < gameState.players.length && (gameState.players[nextIndex].lives || 0) <= 0) {
      nextIndex = (nextIndex + 1) % gameState.players.length;
      attempts++;
    }
    
    return startNewTurn({
      ...gameState,
      currentPlayerIndex: nextIndex,
    });
  }

  // Regular countdown mode - move to next player
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
    score: gameState.gameMode === 'high-low' ? 40 : startingScore,
    isWinner: false,
    turnStartScore: gameState.gameMode === 'high-low' ? 40 : startingScore,
    lives: gameState.gameMode === 'high-low' ? gameState.startingLives || 5 : undefined,
  }));

  return {
    ...gameState,
    players: resetPlayers,
    currentPlayerIndex: 0,
    gameFinished: false,
    winner: null,
    lastThrowWasBust: false,
    highLowChallenge: undefined,
  };
};

export const getCurrentPlayer = (gameState: GameState): Player | null => {
  if (gameState.players.length === 0) return null;
  return gameState.players[gameState.currentPlayerIndex];
};

// High-Low specific game logic
export const setHighLowChallenge = (gameState: GameState, direction: 'higher' | 'lower', targetScore: number): GameState => {
  if (gameState.gameMode !== 'high-low') {
    throw new Error('High-Low challenge can only be set in high-low game mode');
  }
  
  const currentPlayer = getCurrentPlayer(gameState);
  if (!currentPlayer) {
    throw new Error('No current player');
  }
  
  return {
    ...gameState,
    highLowChallenge: {
      playerId: currentPlayer.id,
      targetScore,
      direction,
    },
  };
};

export const processHighLowTurn = (gameState: GameState, playerId: string, score: number): GameState => {
  if (gameState.gameMode !== 'high-low') {
    throw new Error('High-Low turn can only be processed in high-low game mode');
  }
  
  if (!gameState.highLowChallenge) {
    throw new Error('No high-low challenge set');
  }
  
  if (gameState.highLowChallenge.playerId !== playerId) {
    throw new Error('Challenge is not for this player');
  }
  
  const playerIndex = gameState.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) throw new Error('Player not found');

  const currentPlayer = gameState.players[playerIndex];
  const challenge = gameState.highLowChallenge;
  
  if (!challenge) throw new Error('No active challenge');

  // Check if challenge was successful
  const isSuccessful = 
    (challenge.direction === 'higher' && score > challenge.targetScore) ||
    (challenge.direction === 'lower' && score < challenge.targetScore);

  const updatedPlayers = [...gameState.players];
  const turnNumber = currentPlayer.scoreHistory.length + 1;

  const historyEntry = {
    score,
    previousScore: currentPlayer.score,
    timestamp: new Date(),
    turnNumber,
  };

  if (isSuccessful) {
    // Player succeeded - they get to set next challenge
    updatedPlayers[playerIndex] = {
      ...currentPlayer,
      score,
      scoreHistory: [...currentPlayer.scoreHistory, historyEntry],
    };

    return nextPlayer({
      ...gameState,
      players: updatedPlayers,
      highLowChallenge: undefined, // Clear challenge, successful player will set new one
    });
  } else {
    // Player failed - lose a life
    const newLives = (currentPlayer.lives || 0) - 1;

    updatedPlayers[playerIndex] = {
      ...currentPlayer,
      score,
      lives: newLives,
      isWinner: false,
      scoreHistory: [...currentPlayer.scoreHistory, historyEntry],
    };

    // Check if game is over (only one player left with lives)
    const playersWithLives = updatedPlayers.filter(p => (p.lives || 0) > 0);
    const gameFinished = playersWithLives.length <= 1;
    const winner = gameFinished ? playersWithLives[0] || null : null;

    if (winner) {
      updatedPlayers[updatedPlayers.findIndex(p => p.id === winner.id)].isWinner = true;
    }

    return nextPlayer({
      ...gameState,
      players: updatedPlayers,
      gameFinished,
      winner,
      highLowChallenge: undefined, // Next player will decide challenge based on this score
    });
  }
};

export const isHighLowGameMode = (gameState: GameState): boolean => {
  return gameState.gameMode === 'high-low';
};
