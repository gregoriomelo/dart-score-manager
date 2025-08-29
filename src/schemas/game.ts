/**
 * Data validation schemas for game state and related structures
 */

export interface Player {
  id: string;
  name: string;
  score: number;
  lives?: number;
  isEliminated?: boolean;
  history: ScoreHistoryEntry[];
}

export interface ScoreHistoryEntry {
  score: number;
  timestamp: number;
  round: number;
  isBust?: boolean;
  challenge?: string;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  gameMode: 'countdown' | 'highlow';
  targetScore?: number;
  startingLives?: number;
  currentRound: number;
  isGameOver: boolean;
  winner?: Player;
  gameHistory: GameHistoryEntry[];
}

export interface GameHistoryEntry {
  playerId: string;
  playerName: string;
  score: number;
  timestamp: number;
  round: number;
  gameMode: 'countdown' | 'highlow';
  isBust?: boolean;
  challenge?: string;
}

/**
 * Validation functions for game data structures
 */
export const gameValidators = {
  /**
   * Validate player name
   */
  validatePlayerName: (name: string): boolean => {
    return (
      typeof name === 'string' &&
      name.trim().length > 0 &&
      name.trim().length <= 50 &&
      /^[a-zA-Z0-9\s\-_]+$/.test(name.trim())
    );
  },

  /**
   * Validate player ID
   */
  validatePlayerId: (id: string): boolean => {
    return (
      typeof id === 'string' &&
      id.length > 0 &&
      /^[a-zA-Z0-9\-_]+$/.test(id)
    );
  },

  /**
   * Validate score
   */
  validateScore: (score: number): boolean => {
    return (
      typeof score === 'number' &&
      !isNaN(score) &&
      score >= 0 &&
      score <= 180 &&
      Number.isInteger(score)
    );
  },

  /**
   * Validate lives
   */
  validateLives: (lives: number): boolean => {
    return (
      typeof lives === 'number' &&
      !isNaN(lives) &&
      lives >= 0 &&
      lives <= 10 &&
      Number.isInteger(lives)
    );
  },

  /**
   * Validate timestamp
   */
  validateTimestamp: (timestamp: number): boolean => {
    return (
      typeof timestamp === 'number' &&
      !isNaN(timestamp) &&
      timestamp > 0 &&
      timestamp <= Date.now() + 60000 // Allow 1 minute future tolerance
    );
  },

  /**
   * Validate round number
   */
  validateRound: (round: number): boolean => {
    return (
      typeof round === 'number' &&
      !isNaN(round) &&
      round >= 1 &&
      round <= 1000 &&
      Number.isInteger(round)
    );
  },

  /**
   * Validate game mode
   */
  validateGameMode: (mode: string): boolean => {
    return mode === 'countdown' || mode === 'highlow';
  },

  /**
   * Validate target score
   */
  validateTargetScore: (score: number): boolean => {
    return (
      typeof score === 'number' &&
      !isNaN(score) &&
      score >= 1 &&
      score <= 1000 &&
      Number.isInteger(score)
    );
  },

  /**
   * Validate challenge text
   */
  validateChallenge: (challenge: string): boolean => {
    return (
      typeof challenge === 'string' &&
      challenge.trim().length > 0 &&
      challenge.trim().length <= 200 &&
      !/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(challenge)
    );
  },

  /**
   * Validate score history entry
   */
  validateScoreHistoryEntry: (entry: any): entry is ScoreHistoryEntry => {
    return (
      entry &&
      typeof entry === 'object' &&
      gameValidators.validateScore(entry.score) &&
      gameValidators.validateTimestamp(entry.timestamp) &&
      gameValidators.validateRound(entry.round) &&
      (entry.isBust === undefined || typeof entry.isBust === 'boolean') &&
      (entry.challenge === undefined || gameValidators.validateChallenge(entry.challenge))
    );
  },

  /**
   * Validate player object
   */
  validatePlayer: (player: any): player is Player => {
    return (
      player &&
      typeof player === 'object' &&
      gameValidators.validatePlayerId(player.id) &&
      gameValidators.validatePlayerName(player.name) &&
      gameValidators.validateScore(player.score) &&
      (player.lives === undefined || gameValidators.validateLives(player.lives)) &&
      (player.isEliminated === undefined || typeof player.isEliminated === 'boolean') &&
      Array.isArray(player.history) &&
      player.history.every((entry: any) => gameValidators.validateScoreHistoryEntry(entry))
    );
  },

  /**
   * Validate game history entry
   */
  validateGameHistoryEntry: (entry: any): entry is GameHistoryEntry => {
    return (
      entry &&
      typeof entry === 'object' &&
      gameValidators.validatePlayerId(entry.playerId) &&
      gameValidators.validatePlayerName(entry.playerName) &&
      gameValidators.validateScore(entry.score) &&
      gameValidators.validateTimestamp(entry.timestamp) &&
      gameValidators.validateRound(entry.round) &&
      gameValidators.validateGameMode(entry.gameMode) &&
      (entry.isBust === undefined || typeof entry.isBust === 'boolean') &&
      (entry.challenge === undefined || gameValidators.validateChallenge(entry.challenge))
    );
  },

  /**
   * Validate game state
   */
  validateGameState: (state: any): state is GameState => {
    return (
      state &&
      typeof state === 'object' &&
      Array.isArray(state.players) &&
      state.players.length >= 2 &&
      state.players.length <= 20 &&
      state.players.every((player: any) => gameValidators.validatePlayer(player)) &&
      typeof state.currentPlayerIndex === 'number' &&
      state.currentPlayerIndex >= 0 &&
      state.currentPlayerIndex < state.players.length &&
      gameValidators.validateGameMode(state.gameMode) &&
      (state.targetScore === undefined || gameValidators.validateTargetScore(state.targetScore)) &&
      (state.startingLives === undefined || gameValidators.validateLives(state.startingLives)) &&
      gameValidators.validateRound(state.currentRound) &&
      typeof state.isGameOver === 'boolean' &&
      (state.winner === undefined || gameValidators.validatePlayer(state.winner)) &&
      Array.isArray(state.gameHistory) &&
      state.gameHistory.every((entry: any) => gameValidators.validateGameHistoryEntry(entry))
    );
  },
};

/**
 * Sanitize game data
 */
export const gameSanitizers = {
  /**
   * Sanitize player name
   */
  sanitizePlayerName: (name: string): string => {
    if (typeof name !== 'string') return '';
    return name
      .replace(/[<>]/g, '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim()
      .substring(0, 50);
  },

  /**
   * Sanitize challenge text
   */
  sanitizeChallenge: (challenge: string): string => {
    if (typeof challenge !== 'string') return '';
    return challenge
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/[<>]/g, '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim()
      .substring(0, 200);
  },

  /**
   * Sanitize score
   */
  sanitizeScore: (score: any): number => {
    const num = parseInt(score, 10);
    if (isNaN(num) || num < 0) return 0;
    if (num > 180) return 180;
    return num;
  },

  /**
   * Sanitize lives
   */
  sanitizeLives: (lives: any): number => {
    const num = parseInt(lives, 10);
    if (isNaN(num) || num < 0) return 0;
    if (num > 10) return 10;
    return num;
  },

  /**
   * Sanitize timestamp
   */
  sanitizeTimestamp: (timestamp: any): number => {
    const num = parseInt(timestamp, 10);
    if (isNaN(num) || num <= 0) return Date.now();
    if (num > Date.now() + 60000) return Date.now();
    return num;
  },

  /**
   * Sanitize round number
   */
  sanitizeRound: (round: any): number => {
    const num = parseInt(round, 10);
    if (isNaN(num) || num < 1) return 1;
    if (num > 1000) return 1000;
    return num;
  },
};

/**
 * Validate and sanitize game state
 */
export function validateAndSanitizeGameState(state: any): GameState | null {
  try {
    if (!state || typeof state !== 'object') {
      return null;
    }

    // Create a sanitized copy
    const sanitizedState: GameState = {
      players: [],
      currentPlayerIndex: 0,
      gameMode: 'countdown',
      currentRound: 1,
      isGameOver: false,
      gameHistory: [],
    };

    // Sanitize players
    if (Array.isArray(state.players)) {
      sanitizedState.players = state.players
        .filter((player: any) => player && typeof player === 'object')
        .map((player: any) => ({
          id: player.id || `player-${Date.now()}-${Math.random()}`,
          name: gameSanitizers.sanitizePlayerName(player.name),
          score: gameSanitizers.sanitizeScore(player.score),
          lives: player.lives !== undefined ? gameSanitizers.sanitizeLives(player.lives) : undefined,
          isEliminated: Boolean(player.isEliminated),
          history: Array.isArray(player.history)
            ? player.history
                .filter((entry: any) => gameValidators.validateScoreHistoryEntry(entry))
                .map((entry: any) => ({
                  score: gameSanitizers.sanitizeScore(entry.score),
                  timestamp: gameSanitizers.sanitizeTimestamp(entry.timestamp),
                  round: gameSanitizers.sanitizeRound(entry.round),
                  isBust: Boolean(entry.isBust),
                  challenge: entry.challenge ? gameSanitizers.sanitizeChallenge(entry.challenge) : undefined,
                }))
            : [],
        }))
        .filter((player: Player) => gameValidators.validatePlayer(player));
    }

    // Ensure minimum players
    if (sanitizedState.players.length < 2) {
      return null;
    }

    // Sanitize other fields
    sanitizedState.currentPlayerIndex = Math.max(0, Math.min(
      parseInt(state.currentPlayerIndex, 10) || 0,
      sanitizedState.players.length - 1
    ));

    sanitizedState.gameMode = gameValidators.validateGameMode(state.gameMode) ? state.gameMode : 'countdown';
    sanitizedState.targetScore = state.targetScore ? gameSanitizers.sanitizeScore(state.targetScore) : undefined;
    sanitizedState.startingLives = state.startingLives ? gameSanitizers.sanitizeLives(state.startingLives) : undefined;
    sanitizedState.currentRound = gameSanitizers.sanitizeRound(state.currentRound);
    sanitizedState.isGameOver = Boolean(state.isGameOver);

    // Sanitize game history
    if (Array.isArray(state.gameHistory)) {
      sanitizedState.gameHistory = state.gameHistory
        .filter((entry: any) => gameValidators.validateGameHistoryEntry(entry))
        .map((entry: any) => ({
          playerId: entry.playerId,
          playerName: gameSanitizers.sanitizePlayerName(entry.playerName),
          score: gameSanitizers.sanitizeScore(entry.score),
          timestamp: gameSanitizers.sanitizeTimestamp(entry.timestamp),
          round: gameSanitizers.sanitizeRound(entry.round),
          gameMode: entry.gameMode,
          isBust: Boolean(entry.isBust),
          challenge: entry.challenge ? gameSanitizers.sanitizeChallenge(entry.challenge) : undefined,
        }));
    }

    // Validate final state
    if (!gameValidators.validateGameState(sanitizedState)) {
      return null;
    }

    return sanitizedState;
  } catch (error) {
    console.error('Failed to validate and sanitize game state:', error);
    return null;
  }
}
