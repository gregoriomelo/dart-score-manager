import { CountdownPlayer } from '../types/game';

/**
 * Calculates the ranking for countdown players based on their current score.
 * Lower scores rank higher (closer to 0 is better).
 * Only players who have played at least once are included in rankings.
 * 
 * @param players - Array of countdown players
 * @returns Array of players with their rank (1-based), sorted by rank
 */
export const calculateCountdownRankings = (players: CountdownPlayer[]): Array<CountdownPlayer & { rank: number }> => {
  // Filter players who have played at least once (have score history)
  const playersWhoHavePlayed = players.filter(player => player.scoreHistory.length > 0);
  
  if (playersWhoHavePlayed.length === 0) {
    return [];
  }
  
  // Sort by score (ascending - lower is better)
  const sortedPlayers = [...playersWhoHavePlayed].sort((a, b) => a.score - b.score);
  
  // Assign ranks, handling ties
  const rankedPlayers: Array<CountdownPlayer & { rank: number }> = [];
  let currentRank = 1;
  
  for (let i = 0; i < sortedPlayers.length; i++) {
    const player = sortedPlayers[i];
    
    // If this is the first player or has a different score than the previous player
    if (i === 0 || player.score !== sortedPlayers[i - 1].score) {
      currentRank = i + 1;
    }
    
    rankedPlayers.push({
      ...player,
      rank: currentRank
    });
  }
  
  return rankedPlayers;
};

/**
 * Gets the rank for a specific player in countdown mode.
 * Returns null if the player hasn't played yet or if no players have played.
 * 
 * @param player - The player to get rank for
 * @param allPlayers - All players in the game
 * @returns The player's rank (1-based) or null if not ranked
 */
export const getPlayerRank = (player: CountdownPlayer, allPlayers: CountdownPlayer[]): number | null => {
  const rankings = calculateCountdownRankings(allPlayers);
  const playerRanking = rankings.find(p => p.id === player.id);
  return playerRanking ? playerRanking.rank : null;
};
