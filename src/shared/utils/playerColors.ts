/**
 * Utility functions for player color management
 */

const PLAYER_COLORS = [
  '#2563eb', // blue
  '#dc2626', // red
  '#16a34a', // green
  '#ca8a04', // yellow
  '#9333ea', // purple
  '#c2410c', // orange
  '#0891b2', // cyan
  '#be185d', // pink
] as const;

/**
 * Generates a consistent color for a player based on their ID
 * @param playerId - The unique identifier for the player
 * @returns A hex color string
 */
export const getPlayerColor = (playerId: string): string => {
  let hash = 0;
  for (let i = 0; i < playerId.length; i++) {
    hash = playerId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PLAYER_COLORS[Math.abs(hash) % PLAYER_COLORS.length];
};
