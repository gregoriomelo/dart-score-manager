import { Player, GameState, GameMode, CountdownPlayer, HighLowPlayer, RoundsPlayer, CountdownGameState, HighLowGameState, RoundsGameState, isHighLowPlayer, ScoreHistoryEntry, isCountdownGameState, isHighLowGameState, isRoundsGameState } from '../../../../shared/types/game';

export const createPlayer = (
  name: string, 
  startingScore: number = 501, 
  gameMode: GameMode = 'countdown',
  lives: number = 5
): Player => {
  const trimmedName = name.trim();
  
  if (gameMode === 'high-low') {
    const player: HighLowPlayer = {
      id: (Date.now() + Math.random()).toString(),
      name: trimmedName,
      score: 40, // Always start with 40 for High-Low mode
      lives: lives, // Use configurable lives parameter
      scoreHistory: [],
      isWinner: false,
      turnStartScore: 40,
    };
    return player;
  }
  
  if (gameMode === 'rounds') {
    const player: RoundsPlayer = {
      id: (Date.now() + Math.random()).toString(),
      name: trimmedName,
      totalScore: 0,
      currentRoundScore: 0,
      roundsCompleted: 0,
      scoreHistory: [],
      isWinner: false,
      turnStartScore: 0,
    };
    return player;
  }
  
  const player: CountdownPlayer = {
    id: (Date.now() + Math.random()).toString(),
    name: trimmedName,
    score: startingScore,
    scoreHistory: [],
    isWinner: false,
    turnStartScore: startingScore,
  };
  return player;
};

export const createGameState = (
  playerNames: string[], 
  startingScore: number = 501,
  gameMode: GameMode = 'countdown',
  lives: number = 5,
  totalRounds: number = 10
): GameState => {
  if (gameMode === 'countdown') {
    const players: CountdownPlayer[] = playerNames.map(name => {
      const player = createPlayer(name, startingScore, gameMode, lives);
      return player as CountdownPlayer;
    });
    return {
      players,
      currentPlayerIndex: 0,
      gameFinished: false,
      winner: null,
      lastThrowWasBust: false,
      gameMode: 'countdown',
      startingScore,
    };
  } else if (gameMode === 'high-low') {
    const players: HighLowPlayer[] = playerNames.map(name => {
      const player = createPlayer(name, startingScore, gameMode, lives);
      return player as HighLowPlayer;
    });
    return {
      players,
      currentPlayerIndex: 0,
      gameFinished: false,
      winner: null,
      lastThrowWasBust: false,
      gameMode: 'high-low',
      startingLives: lives,
      highLowChallenge: undefined,
    };
  } else {
    const players: RoundsPlayer[] = playerNames.map(name => {
      const player = createPlayer(name, startingScore, gameMode, lives);
      return player as RoundsPlayer;
    });
    return {
      players,
      currentPlayerIndex: 0,
      gameFinished: false,
      winner: null,
      lastThrowWasBust: false,
      gameMode: 'rounds',
      totalRounds,
      currentRound: 1,
    };
  }
};

export const isValidScore = (currentScore: number, scoreToSubtract: number): boolean => {
  if (scoreToSubtract < 0 || scoreToSubtract > 180) {
    return false;
  }
  
  const newScore = currentScore - scoreToSubtract;
  return newScore >= 0;
};

export const isValidRoundsScore = (score: number): boolean => {
  return score >= 0 && score <= 180;
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
    } while (isHighLowPlayer(gameState.players[nextIndex]) && gameState.players[nextIndex].lives <= 0);
  } else if (gameState.gameMode === 'rounds') {
    // For rounds mode, just move to next player
    nextIndex = (nextIndex + 1) % totalPlayers;
  } else {
    nextIndex = (nextIndex + 1) % totalPlayers;
  }

  // Update turnStartScore for the new current player (only for countdown mode)
  // For High-Low mode, preserve the existing players array (which may have updated lives)
  if (gameState.gameMode === 'countdown') {
    const updatedPlayers = gameState.players.map((player, index) => {
      if (index === nextIndex) {
        return {
          ...player,
          turnStartScore: player.score, // Set turn start score to current score
        };
      }
      return player;
    });

    return {
      ...gameState,
      currentPlayerIndex: nextIndex,
      players: updatedPlayers,
    };
  } else {
    // For High-Low and Rounds modes, preserve existing players array
    return {
      ...gameState,
      currentPlayerIndex: nextIndex,
    };
  }
};

export const startGame = (gameState: GameState): GameState => {
  // Initialize turnStartScore for the first player
  if (gameState.gameMode === 'countdown') {
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
  } else {
    // For High-Low mode, just return the state as is
    return gameState;
  }
};



export const updatePlayerScore = (
  gameState: GameState,
  playerId: string,
  scoreToSubtract: number
): GameState => {
  if (gameState.gameMode === 'countdown') {
    return updateCountdownPlayerScore(gameState as CountdownGameState, playerId, scoreToSubtract);
  } else if (gameState.gameMode === 'high-low') {
    return updateHighLowPlayerScore(gameState as HighLowGameState, playerId, scoreToSubtract);
  } else {
    return updateRoundsPlayerScore(gameState as RoundsGameState, playerId, scoreToSubtract);
  }
};

const updateCountdownPlayerScore = (
  gameState: CountdownGameState,
  playerId: string,
  scoreToSubtract: number
): CountdownGameState => {
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
    const historyEntry = {
      score: scoreToSubtract,
      previousScore: currentPlayer.score,
      timestamp: new Date(),
      turnNumber,
    };
    
    updatedPlayers[playerIndex] = {
      ...currentPlayer,
      score: currentPlayer.turnStartScore,
      scoreHistory: [...currentPlayer.scoreHistory, historyEntry],
    };
    
    return {
      ...gameState,
      players: updatedPlayers as HighLowPlayer[],
      lastThrowWasBust: true,
    };
  }

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

  const nextIndex = (playerIndex + 1) % gameState.players.length;
  
  const playersWithTurnStart = updatedPlayers.map((player, index) => {
    if (index === nextIndex) {
      return {
        ...player,
        turnStartScore: player.score,
      };
    }
    return player;
  });

  return {
    ...gameState,
    players: playersWithTurnStart,
    currentPlayerIndex: nextIndex,
    gameFinished,
    winner,
    lastThrowWasBust: false,
  };
};

const updateHighLowPlayerScore = (
  gameState: HighLowGameState,
  playerId: string,
  scoreToSubtract: number
): HighLowGameState => {
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
      players: updatedPlayers as HighLowPlayer[],
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

export const resetGame = (gameState: GameState, startingLives?: number, startingScore?: number, totalRounds?: number): GameState => {
  if (gameState.gameMode === 'high-low') {
    const resetPlayers = gameState.players.map(player => ({
      ...player,
      score: 40, // Reset to 40 for High-Low mode
      lives: startingLives || 5, // Use configurable lives parameter
      scoreHistory: [],
      isWinner: false,
      turnStartScore: 40,
    })) as HighLowPlayer[];

    return {
      ...gameState,
      players: resetPlayers,
      currentPlayerIndex: 0,
      gameFinished: false,
      winner: null,
      lastThrowWasBust: false,
      highLowChallenge: undefined,
    };
  } else if (gameState.gameMode === 'rounds') {
    const resetPlayers = gameState.players.map(player => ({
      ...player,
      totalScore: 0,
      currentRoundScore: 0,
      roundsCompleted: 0,
      scoreHistory: [],
      isWinner: false,
      turnStartScore: 0,
    })) as RoundsPlayer[];

    return {
      ...gameState,
      players: resetPlayers,
      currentPlayerIndex: 0,
      gameFinished: false,
      winner: null,
      lastThrowWasBust: false,
      currentRound: 1,
      totalRounds: totalRounds || gameState.totalRounds || 10,
    };
  } else {
    const resetPlayers = gameState.players.map(player => ({
      ...player,
      score: startingScore || gameState.startingScore || 501, // Reset to original starting score
      scoreHistory: [],
      isWinner: false,
      turnStartScore: startingScore || gameState.startingScore || 501,
    })) as CountdownPlayer[];

    return {
      ...gameState,
      players: resetPlayers,
      currentPlayerIndex: 0,
      gameFinished: false,
      winner: null,
      lastThrowWasBust: false,
    };
  }
};

/**
 * Undo the last score submission
 * Returns the game state with the last score removed and current player reverted
 */
export const undoLastScore = (gameState: GameState): GameState => {
  // Find the most recent score entry across all players
  let lastEntry: { playerIndex: number; entryIndex: number; entry: ScoreHistoryEntry } | null = null;
  let latestTimestamp = new Date(0);

  gameState.players.forEach((player, playerIndex) => {
    player.scoreHistory.forEach((entry, entryIndex) => {
      if (entry.timestamp > latestTimestamp) {
        latestTimestamp = entry.timestamp;
        lastEntry = { playerIndex, entryIndex, entry };
      }
    });
  });

  // If no entries found, return current state
  if (!lastEntry) {
    return gameState;
  }

  const { playerIndex, entryIndex, entry } = lastEntry;
  const player = gameState.players[playerIndex];

  // Remove the last entry from the player's history
  const updatedScoreHistory = player.scoreHistory.filter((_, index) => index !== entryIndex);

  // Revert the player's score to the previous score
  const updatedPlayer = {
    ...player,
    score: (entry as ScoreHistoryEntry).previousScore,
    scoreHistory: updatedScoreHistory,
    isWinner: false, // Reset winner status
  };

  // Update the players array
  const updatedPlayers = [...gameState.players];
  updatedPlayers[playerIndex] = updatedPlayer;

  // Determine the new current player index
  // We need to go back to the player who made the last move
  let newCurrentPlayerIndex = playerIndex;

  // Handle game mode specific logic
  if (isCountdownGameState(gameState)) {
    // For countdown, set the turnStartScore to the reverted score
    const countdownPlayer = updatedPlayer as CountdownPlayer;
    updatedPlayers[playerIndex] = {
      ...countdownPlayer,
      turnStartScore: (entry as ScoreHistoryEntry).previousScore,
    };
    
    // Check if game is still finished
    const winner = updatedPlayers.find(p => p.isWinner) as CountdownPlayer | null;
    const gameFinished = winner !== null && winner !== undefined;
    

    return {
      ...gameState,
      players: updatedPlayers as CountdownPlayer[],
      currentPlayerIndex: newCurrentPlayerIndex,
      gameFinished,
      winner: winner || null,
      lastThrowWasBust: false,
    };
  } else if (isHighLowGameState(gameState)) {
    // For high-low, we might need to restore lives if this was a failed challenge
    let highLowPlayer = updatedPlayer as HighLowPlayer;
    const scoreEntry = entry as ScoreHistoryEntry;
    if (scoreEntry.livesAfter !== undefined && scoreEntry.livesBefore !== undefined) {
      highLowPlayer = {
        ...highLowPlayer,
        lives: scoreEntry.livesBefore,
      };
    }
    updatedPlayers[playerIndex] = highLowPlayer;
    
    // Check if game is still finished
    const winner = updatedPlayers.find(p => p.isWinner) as HighLowPlayer | null;
    const gameFinished = winner !== null && winner !== undefined;

    return {
      ...gameState,
      players: updatedPlayers as HighLowPlayer[],
      currentPlayerIndex: newCurrentPlayerIndex,
      gameFinished,
      winner: winner || null,
      lastThrowWasBust: false,
    };
  } else if (isRoundsGameState(gameState)) {
    // For rounds, revert the total score and current round score
    const roundsPlayer = updatedPlayer as RoundsPlayer;
    const scoreEntry = entry as ScoreHistoryEntry;
    
    updatedPlayers[playerIndex] = {
      ...roundsPlayer,
      totalScore: roundsPlayer.totalScore - scoreEntry.score,
      currentRoundScore: scoreEntry.previousScore,
    };
    
    // Check if we need to revert round advancement
    // If this was the last score in a round, we need to go back to the previous round
    const currentRound = gameState.currentRound;
    const allPlayersInCurrentRound = updatedPlayers.every(player => 
      player.scoreHistory.some(entry => entry.roundNumber === currentRound)
    );
    
    let newCurrentRound = currentRound;
    
    // If no players have scores in the current round, go back to previous round
    if (!allPlayersInCurrentRound && currentRound > 1) {
      newCurrentRound = currentRound - 1;
      // Reset all players' current round scores for the previous round
      updatedPlayers.forEach((player, index) => {
        if (player.scoreHistory.some(entry => entry.roundNumber === newCurrentRound)) {
          // Find the last score for this player in the previous round
          const lastScoreInRound = player.scoreHistory
            .filter(entry => entry.roundNumber === newCurrentRound)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
          
          if (lastScoreInRound) {
            updatedPlayers[index] = {
              ...player,
              currentRoundScore: lastScoreInRound.previousScore + lastScoreInRound.score,
            };
          }
        }
      });
    }
    
    // Always set game as not finished when undoing in rounds mode
    // This ensures the game can continue after undo
    return {
      ...gameState,
      players: updatedPlayers as RoundsPlayer[],
      currentPlayerIndex: newCurrentPlayerIndex,
      currentRound: newCurrentRound,
      gameFinished: false,
      winner: null,
      lastThrowWasBust: false,
    };
  }

  // Fallback - should not reach here
  return gameState;
};

const updateRoundsPlayerScore = (
  gameState: RoundsGameState,
  playerId: string,
  score: number
): RoundsGameState => {
  const playerIndex = gameState.players.findIndex(p => p.id === playerId);
  
  if (playerIndex === -1) {
    throw new Error('Player not found');
  }

  const currentPlayer = gameState.players[playerIndex];
  
  if (!isValidRoundsScore(score)) {
    throw new Error('Invalid score: must be between 0 and 180');
  }

  const updatedPlayers = [...gameState.players];
  
  // Calculate turn number based on existing history
  const turnNumber = currentPlayer.scoreHistory.length + 1;
  
  // Add score to current round score
  const newRoundScore = currentPlayer.currentRoundScore + score;
  const newTotalScore = currentPlayer.totalScore + score;
  
  const historyEntry = {
    score,
    previousScore: currentPlayer.currentRoundScore,
    timestamp: new Date(),
    turnNumber,
    roundNumber: gameState.currentRound,
  };
  
  updatedPlayers[playerIndex] = {
    ...currentPlayer,
    currentRoundScore: newRoundScore,
    totalScore: newTotalScore,
    scoreHistory: [...currentPlayer.scoreHistory, historyEntry],
  };

  const allPlayersCompletedRound = updatedPlayers.every(player => 
    player.scoreHistory.some(entry => 
      entry.roundNumber === gameState.currentRound
    )
  );

  let newCurrentRound = gameState.currentRound;
  let newCurrentPlayerIndex = gameState.currentPlayerIndex;
  let gameFinished = gameState.gameFinished;
  let winner = gameState.winner;

  if (allPlayersCompletedRound) {
    newCurrentRound = gameState.currentRound + 1;
    
    updatedPlayers.forEach((player, index) => {
      updatedPlayers[index] = {
        ...player,
        currentRoundScore: 0,
        roundsCompleted: player.roundsCompleted + 1,
      };
    });

    if (newCurrentRound > gameState.totalRounds) {
      gameFinished = true;
      const sortedPlayers = [...updatedPlayers].sort((a, b) => b.totalScore - a.totalScore);
      winner = sortedPlayers[0];
      winner.isWinner = true;
    } else {
      newCurrentPlayerIndex = 0;
    }
  } else {
    newCurrentPlayerIndex = (playerIndex + 1) % gameState.players.length;
  }

  return {
    ...gameState,
    players: updatedPlayers,
    currentPlayerIndex: newCurrentPlayerIndex,
    currentRound: newCurrentRound,
    gameFinished,
    winner,
    lastThrowWasBust: false,
  };
};
