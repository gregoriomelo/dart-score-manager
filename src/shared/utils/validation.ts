import { GAME_CONSTANTS } from './constants';

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validates if a score is within the valid range for dart scoring
 * @param score - The score to validate
 * @returns ValidationResult with validation status and error message if invalid
 */
export const validateScore = (score: number): ValidationResult => {
  if (isNaN(score)) {
    return { isValid: false, errorMessage: 'Score must be a valid number' };
  }
  if (score < GAME_CONSTANTS.MIN_SCORE) {
    return { isValid: false, errorMessage: 'Score cannot be negative' };
  }
  if (score > GAME_CONSTANTS.MAX_SCORE) {
    return { isValid: false, errorMessage: 'Score cannot exceed 180' };
  }
  return { isValid: true };
};

/**
 * Validates if a score is within the valid range for dart scoring
 * @param score - The score to validate
 * @returns true if the score is valid, false otherwise
 */
export const isValidScore = (score: number): boolean => {
  return validateScore(score).isValid;
};

/**
 * Validates if a score string can be parsed to a valid score
 * @param scoreString - The score string to validate
 * @returns true if the score string is valid, false otherwise
 */
export const isValidScoreString = (scoreString: string): boolean => {
  const score = parseInt(scoreString);
  return isValidScore(score);
};

/**
 * Parses a score string with a fallback value
 * @param scoreString - The score string to parse
 * @param fallback - The fallback value if parsing fails
 * @returns The parsed score or fallback value
 */
export const parseScoreWithFallback = (scoreString: string, fallback: number): number => {
  return parseInt(scoreString) || fallback;
};

/**
 * Validates if a player name is valid
 * @param name - The player name to validate
 * @returns ValidationResult with validation status and error message if invalid
 */
export const validatePlayerName = (name: string): ValidationResult => {
  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return { isValid: false, errorMessage: 'Player name cannot be empty' };
  }
  if (trimmedName.length > GAME_CONSTANTS.MAX_PLAYER_NAME_LENGTH) {
    return { isValid: false, errorMessage: 'Player name cannot exceed 20 characters' };
  }
  return { isValid: true };
};

/**
 * Validates if a player name is valid
 * @param name - The player name to validate
 * @returns true if the name is valid, false otherwise
 */
export const isValidPlayerName = (name: string): boolean => {
  return validatePlayerName(name).isValid;
};

/**
 * Validates if the number of players is within valid range
 * @param playerCount - The number of players
 * @returns true if the player count is valid, false otherwise
 */
export const isValidPlayerCount = (playerCount: number): boolean => {
  return playerCount >= GAME_CONSTANTS.MIN_PLAYERS && 
         playerCount <= GAME_CONSTANTS.MAX_PLAYERS;
};

/**
 * Validates if a starting lives value is valid
 * @param lives - The starting lives value
 * @returns true if the lives value is valid, false otherwise
 */
export const isValidStartingLives = (lives: number): boolean => {
  return !isNaN(lives) && lives >= 1 && lives <= 10;
};

/**
 * Validates if a starting score value is valid
 * @param score - The starting score value
 * @returns true if the score value is valid, false otherwise
 */
export const isValidStartingScore = (score: number): boolean => {
  return !isNaN(score) && score > 0;
};
