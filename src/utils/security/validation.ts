/**
 * Security and validation utilities for input sanitization and validation
 */

export interface ValidationResult {
  isValid: boolean;
  value: string;
  errors: string[];
}

export interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

/**
 * Common validation rules
 */
export const validationRules = {
  required: (value: string): boolean => value.trim().length > 0,
  minLength: (min: number) => (value: string): boolean => value.length >= min,
  maxLength: (max: number) => (value: string): boolean => value.length <= max,
  alphanumeric: (value: string): boolean => /^[a-zA-Z0-9\s]+$/.test(value),
  numeric: (value: string): boolean => /^\d+$/.test(value),
  positiveInteger: (value: string): boolean => /^[1-9]\d*$/.test(value),
  scoreRange: (min: number, max: number) => (value: string): boolean => {
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= min && num <= max;
  },
  noSpecialChars: (value: string): boolean => /^[a-zA-Z0-9\s\-_]+$/.test(value),
  noScriptTags: (value: string): boolean => !/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(value),
  noHtmlTags: (value: string): boolean => !/<[^>]*>/g.test(value),
};

/**
 * Sanitize input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validate input against multiple rules
 */
export function validateInput(
  value: string,
  rules: ValidationRule[],
  sanitize: boolean = true
): ValidationResult {
  const sanitizedValue = sanitize ? sanitizeInput(value) : value;
  const errors: string[] = [];

  for (const rule of rules) {
    if (!rule.test(sanitizedValue)) {
      errors.push(rule.message);
    }
  }

  return {
    isValid: errors.length === 0,
    value: sanitizedValue,
    errors,
  };
}

/**
 * Player name validation
 */
export function validatePlayerName(name: string): ValidationResult {
  return validateInput(name, [
    { test: validationRules.required, message: 'Player name is required' },
    { test: validationRules.minLength(1), message: 'Player name must be at least 1 character' },
    { test: validationRules.maxLength(50), message: 'Player name must be 50 characters or less' },
    { test: validationRules.noSpecialChars, message: 'Player name contains invalid characters' },
    { test: validationRules.noScriptTags, message: 'Player name contains invalid content' },
  ]);
}

/**
 * Score validation for countdown game
 */
export function validateCountdownScore(score: string): ValidationResult {
  return validateInput(score, [
    { test: validationRules.required, message: 'Score is required' },
    { test: validationRules.numeric, message: 'Score must be a number' },
    { test: validationRules.scoreRange(0, 180), message: 'Score must be between 0 and 180' },
  ]);
}

/**
 * Score validation for high-low game
 */
export function validateHighLowScore(score: string): ValidationResult {
  return validateInput(score, [
    { test: validationRules.required, message: 'Score is required' },
    { test: validationRules.numeric, message: 'Score must be a number' },
    { test: validationRules.scoreRange(0, 180), message: 'Score must be between 0 and 180' },
  ]);
}

/**
 * Target score validation
 */
export function validateTargetScore(score: string): ValidationResult {
  return validateInput(score, [
    { test: validationRules.required, message: 'Target score is required' },
    { test: validationRules.positiveInteger, message: 'Target score must be a positive integer' },
    { test: validationRules.scoreRange(1, 1000), message: 'Target score must be between 1 and 1000' },
  ]);
}

/**
 * Number of lives validation
 */
export function validateLives(lives: string): ValidationResult {
  return validateInput(lives, [
    { test: validationRules.required, message: 'Number of lives is required' },
    { test: validationRules.positiveInteger, message: 'Lives must be a positive integer' },
    { test: validationRules.scoreRange(1, 10), message: 'Lives must be between 1 and 10' },
  ]);
}

/**
 * Number of players validation
 */
export function validatePlayerCount(count: string): ValidationResult {
  return validateInput(count, [
    { test: validationRules.required, message: 'Player count is required' },
    { test: validationRules.positiveInteger, message: 'Player count must be a positive integer' },
    { test: validationRules.scoreRange(2, 20), message: 'Player count must be between 2 and 20' },
  ]);
}

/**
 * Game mode validation
 */
export function validateGameMode(mode: string): ValidationResult {
  const validModes = ['countdown', 'highlow'];
  return validateInput(mode, [
    { test: validationRules.required, message: 'Game mode is required' },
    {
      test: (value) => validModes.includes(value.toLowerCase()),
      message: 'Game mode must be either "countdown" or "highlow"',
    },
  ]);
}

/**
 * Challenge validation for high-low game
 */
export function validateChallenge(challenge: string): ValidationResult {
  return validateInput(challenge, [
    { test: validationRules.required, message: 'Challenge is required' },
    { test: validationRules.minLength(1), message: 'Challenge must be at least 1 character' },
    { test: validationRules.maxLength(200), message: 'Challenge must be 200 characters or less' },
    { test: validationRules.noScriptTags, message: 'Challenge contains invalid content' },
  ]);
}

/**
 * Validate game state data integrity
 */
export function validateGameState(gameState: unknown): ValidationResult {
  const errors: string[] = [];

  if (!gameState || typeof gameState !== 'object') {
    errors.push('Game state must be an object');
    return {
      isValid: false,
      value: JSON.stringify(gameState),
      errors,
    };
  }

  const typedGameState = gameState as Record<string, unknown>;

  if (!Array.isArray(typedGameState.players)) {
    errors.push('Game state must have a players array');
  }

  if (typeof typedGameState.currentPlayerIndex !== 'number') {
    errors.push('Game state must have a valid currentPlayerIndex');
  }

  if (typeof typedGameState.gameMode !== 'string') {
    errors.push('Game state must have a valid gameMode');
  }

  if (typedGameState.players && Array.isArray(typedGameState.players) && typedGameState.players.length < 2) {
    errors.push('Game must have at least 2 players');
  }

  if (typedGameState.players && Array.isArray(typedGameState.players) && typedGameState.players.length > 20) {
    errors.push('Game cannot have more than 20 players');
  }

  return {
    isValid: errors.length === 0,
    value: JSON.stringify(gameState),
    errors,
  };
}
