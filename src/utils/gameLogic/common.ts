import { Player, GameState, GameMode } from '../../types/game';

export const createPlayer = (
  name: string, 
  startingScore: number = 501, 
  gameMode: GameMode = 'countdown',
  lives: number = 5
): Player => {
  const trimmedName = name.trim();
  
  if (gameMode === 'high-low') {
    return {
      id: (Date.now() + Math.random()).toString(),
      name: trimmedName,
      score: 40, // Always start with 40 for High-Low mode
      lives: lives, // Use configurable lives parameter
      scoreHistory: [],
      isWinner: false,
      turnStartScore: 40,
    };
  }
  
  return {
    id: (Date.now() + Math.random()).toString(),
    name: trimmedName,
    score: startingScore,
    scoreHistory: [],
    isWinner: false,
    turnStartScore: startingScore,
  };
};

export const createGameState = (
  playerNames: string[], 
  startingScore: number = 501,
  gameMode: GameMode = 'countdown',
  lives: number = 5
): GameState => {
  const players = playerNames.map(name => createPlayer(name, startingScore, gameMode, lives));
  
  return {
    players,
    currentPlayerIndex: 0,
    gameFinished: false,
    winner: null,
    lastThrowWasBust: false,
    gameMode,
    startingScore,
    startingLives: gameMode === 'high-low' ? lives : undefined,
    ...(gameMode === 'high-low' && { highLowChallenge: undefined })
  };
};

export const isValidScore = (currentScore: number, scoreToSubtract: number): boolean => {
  if (scoreToSubtract < 0 || scoreToSubtract > 180) {
    return false;
  }
  
  const newScore = currentScore - scoreToSubtract;
  return newScore >= 0;
};

export const getCurrentPlayer = (gameState: GameState): Player | null => {
  if (gameState.players.length === 0) {
    return null;
  }
  return gameState.players[gameState.currentPlayerIndex] || null;
};

export const nextPlayer = (gameState: GameState): GameState => {
  if (gameState.gameFinished) {
    return gameState;
  }

  const totalPlayers = gameState.players.length;
  let nextIndex = gameState.currentPlayerIndex;

  if (gameState.gameMode === 'high-low') {
    // In High-Low mode, skip players with no lives
    let attempts = 0;
    do {
      nextIndex = (nextIndex + 1) % totalPlayers;
      attempts++;
      
      // Prevent infinite loop if all players are eliminated
      if (attempts >= totalPlayers) {
        break;
      }
    } while ((gameState.players[nextIndex].lives || 0) <= 0);
  } else {
    nextIndex = (nextIndex + 1) % totalPlayers;
  }

  // Update turnStartScore for the new current player (only for countdown mode)
  // For High-Low mode, preserve the existing players array (which may have updated lives)
  const updatedPlayers = gameState.gameMode === 'countdown' 
    ? gameState.players.map((player, index) => {
        if (index === nextIndex) {
          return {
            ...player,
            turnStartScore: player.score, // Set turn start score to current score
          };
        }
        return player;
      })
    : gameState.players; // Preserve existing players array for High-Low mode

  return {
    ...gameState,
    currentPlayerIndex: nextIndex,
    players: updatedPlayers,
  };
};

export const startGame = (gameState: GameState): GameState => {
  // Initialize turnStartScore for the first player
  const updatedPlayers = gameState.players.map((player, index) => {
    if (index === gameState.currentPlayerIndex) {
      return {
        ...player,
        turnStartScore: player.score,
      };
    }
    return player;
  });

  return {
    ...gameState,
    players: updatedPlayers,
  };
};

export const resetGame = (gameState: GameState, startingLives?: number, startingScore?: number): GameState => {
  const resetPlayers = gameState.players.map(player => {
    if (gameState.gameMode === 'high-low') {
      return {
        ...player,
        score: 40, // Reset to 40 for High-Low mode
        lives: startingLives || 5, // Use configurable lives parameter
        scoreHistory: [],
        isWinner: false,
        turnStartScore: 40,
      };
    }
    
    return {
      ...player,
      score: startingScore || gameState.startingScore || 501, // Reset to original starting score
      scoreHistory: [],
      isWinner: false,
      turnStartScore: startingScore || gameState.startingScore || 501,
    };
  });

  return {
    ...gameState,
    players: resetPlayers,
    currentPlayerIndex: 0,
    gameFinished: false,
    winner: null,
    lastThrowWasBust: false,
    ...(gameState.gameMode === 'high-low' && { highLowChallenge: undefined })
  };
};
