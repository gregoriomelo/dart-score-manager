import { UI_TEXT } from './constants';

/**
 * Formats a player name placeholder with the given index
 * @param index - The player index (1-based)
 * @returns The formatted placeholder text
 */
export const formatPlayerNamePlaceholder = (index: number): string => {
  return UI_TEXT.PLAYER_NAME_PLACEHOLDER.replace('{index}', index.toString());
};

/**
 * Formats a player lives label with the given lives count
 * @param lives - The number of lives
 * @returns The formatted lives label
 */
export const formatPlayerLivesLabel = (lives: number): string => {
  return UI_TEXT.PLAYER_LIVES_LABEL.replace('{lives}', lives.toString());
};

/**
 * Formats a player score label with name and lives
 * @param name - The player name
 * @param lives - The number of lives
 * @returns The formatted score label
 */
export const formatPlayerScoreLabel = (name: string, lives: number): string => {
  return UI_TEXT.PLAYER_SCORE_LABEL
    .replace('{name}', name)
    .replace('{lives}', lives.toString());
};

/**
 * Formats a winner announcement with the player name
 * @param name - The winner's name
 * @returns The formatted winner announcement
 */
export const formatWinnerAnnouncement = (name: string): string => {
  return UI_TEXT.WINNER_WINS.replace('{name}', name);
};

/**
 * Formats a history button title with the player name
 * @param name - The player name
 * @returns The formatted history button title
 */
export const formatHistoryButtonTitle = (name: string): string => {
  return UI_TEXT.HISTORY_BUTTON_TITLE.replace('{name}', name);
};

/**
 * Formats a countdown mode indicator with the starting score
 * @param score - The starting score
 * @returns The formatted countdown mode indicator
 */
export const formatCountdownModeIndicator = (score: number): string => {
  return UI_TEXT.COUNTDOWN_MODE_INDICATOR.replace('{score}', score.toString());
};

/**
 * Trims and validates a player name
 * @param name - The raw player name
 * @returns The trimmed player name
 */
export const sanitizePlayerName = (name: string): string => {
  return name.trim();
};

/**
 * Filters and sanitizes an array of player names
 * @param names - Array of raw player names
 * @returns Array of valid, trimmed player names
 */
export const sanitizePlayerNames = (names: string[]): string[] => {
  return names
    .map(sanitizePlayerName)
    .filter(name => name.length > 0);
};
