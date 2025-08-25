import { GameState } from '../../types/game';

export const updatePlayerScore = (gameState: GameState, playerId: string, scoreToSubtract: number): GameState => {
  const playerIndex = gameState.players.findIndex(p => p.id === playerId);
  
  if (playerIndex === -1) {
    throw new Error('Player not found');
  }

  const currentPlayer = gameState.players[playerIndex];
  
  // Validate score range (0-180 for darts)
  if (scoreToSubtract < 0 || scoreToSubtract > 180) {
    throw new Error('Invalid score');
  }

  const newScore = currentPlayer.score - scoreToSubtract;
  const updatedPlayers = [...gameState.players];

  // Handle bust (score goes below 0 or equals 1)
  if (newScore < 0 || newScore === 1) {
    // Bust - revert to score at start of current turn
    updatedPlayers[playerIndex] = {
      ...currentPlayer,
      score: currentPlayer.turnStartScore, // Revert to turn start score
      scoreHistory: [
        ...currentPlayer.scoreHistory,
        {
          score: scoreToSubtract,
          previousScore: currentPlayer.score,
          timestamp: new Date(),
          turnNumber: currentPlayer.scoreHistory.length + 1,
        },
      ],
    };

    return {
      ...gameState,
      players: updatedPlayers,
      lastThrowWasBust: true,
    };
  }

  // Valid score
  const isWinner = newScore === 0;
  
  updatedPlayers[playerIndex] = {
    ...currentPlayer,
    score: newScore,
    isWinner,
    // Keep original turnStartScore for proper reset functionality
    scoreHistory: [
      ...currentPlayer.scoreHistory,
      {
        score: scoreToSubtract,
        previousScore: currentPlayer.score,
        timestamp: new Date(),
        turnNumber: currentPlayer.scoreHistory.length + 1,
      },
    ],
  };

  const gameFinished = isWinner;
  const winner = isWinner ? updatedPlayers[playerIndex] : null;

  if (gameFinished) {
    return {
      ...gameState,
      players: updatedPlayers,
      gameFinished,
      winner,
    };
  }

  return {
    ...gameState,
    players: updatedPlayers,
  };
};
