import { CountdownPlayer, RoundsPlayer } from '../types/game';

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

/**
 * Calculates the ranking for rounds players based on their total score.
 * Higher scores rank higher (higher total score is better).
 * Only players who have played at least once are included in rankings.
 * 
 * @param players - Array of rounds players
 * @returns Array of players with their rank (1-based), sorted by rank
 */
export const calculateRoundsRankings = (players: RoundsPlayer[]): Array<RoundsPlayer & { rank: number }> => {
  // Filter players who have played at least once (have score history)
  const playersWhoHavePlayed = players.filter(player => player.scoreHistory.length > 0);
  
  if (playersWhoHavePlayed.length === 0) {
    return [];
  }
  
  // Sort by total score (descending - higher is better)
  const sortedPlayers = [...playersWhoHavePlayed].sort((a, b) => b.totalScore - a.totalScore);
  
  // Assign ranks, handling ties
  const rankedPlayers: Array<RoundsPlayer & { rank: number }> = [];
  let currentRank = 1;
  
  for (let i = 0; i < sortedPlayers.length; i++) {
    const player = sortedPlayers[i];
    
    // If this is the first player or has a different score than the previous player
    if (i === 0 || player.totalScore !== sortedPlayers[i - 1].totalScore) {
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
 * Gets the rank for a specific player in rounds mode.
 * Returns null if the player hasn't played yet or if no players have played.
 * 
 * @param player - The player to get rank for
 * @param allPlayers - All players in the game
 * @returns The player's rank (1-based) or null if not ranked
 */
export const getRoundsPlayerRank = (player: RoundsPlayer, allPlayers: RoundsPlayer[]): number | null => {
  const rankings = calculateRoundsRankings(allPlayers);
  const playerRanking = rankings.find(p => p.id === player.id);
  return playerRanking ? playerRanking.rank : null;
};
