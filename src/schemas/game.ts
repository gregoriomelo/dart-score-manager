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
  gameMode: 'countdown' | 'highlow' | 'rounds';
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
  gameMode: 'countdown' | 'highlow' | 'rounds';
  isBust?: boolean;
  challenge?: string;
}



/**
 * Validation functions for game data structures
 */
export const gameValidators = {
  // String-based validators (for input validation)
  validatePlayerName: (name: string): boolean => {
    return (
      typeof name === 'string' &&
      name.trim().length > 0 &&
      name.trim().length <= 50 &&
      /^[a-zA-Z0-9\s\-_]+$/.test(name.trim())
    );
  },

  validatePlayerId: (id: string): boolean => {
    return (
      typeof id === 'string' &&
      id.length > 0 &&
      /^[a-zA-Z0-9\-_]+$/.test(id)
    );
  },

  // Number-based validators (for data validation)
  validateScore: (score: number): boolean => {
    return (
      typeof score === 'number' &&
      !isNaN(score) &&
      score >= 0 &&
      score <= 180 &&
      Number.isInteger(score)
    );
  },

  validateLives: (lives: number): boolean => {
    return (
      typeof lives === 'number' &&
      !isNaN(lives) &&
      lives >= 0 &&
      lives <= 10 &&
      Number.isInteger(lives)
    );
  },

  validateTimestamp: (timestamp: number): boolean => {
    return (
      typeof timestamp === 'number' &&
      !isNaN(timestamp) &&
      timestamp > 0 &&
      timestamp <= Date.now() + 60000
    );
  },

  validateRound: (round: number): boolean => {
    return (
      typeof round === 'number' &&
      !isNaN(round) &&
      round >= 1 &&
      round <= 1000 &&
      Number.isInteger(round)
    );
  },

  validateGameMode: (mode: string): boolean => {
    return mode === 'countdown' || mode === 'highlow' || mode === 'rounds';
  },

  validateChallenge: (challenge: string): boolean => {
    return (
      typeof challenge === 'string' &&
      challenge.trim().length > 0 &&
      challenge.trim().length <= 200 &&
      !/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(challenge)
    );
  },

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
   * Validate score history entry
   */
  validateScoreHistoryEntry: (entry: unknown): entry is ScoreHistoryEntry => {
    if (!entry || typeof entry !== 'object') return false;
    
    const typedEntry = entry as Record<string, unknown>;
    return (
      gameValidators.validateScore(typedEntry.score as number) &&
      gameValidators.validateTimestamp(typedEntry.timestamp as number) &&
      gameValidators.validateRound(typedEntry.round as number) &&
      (typedEntry.isBust === undefined || typeof typedEntry.isBust === 'boolean') &&
      (typedEntry.challenge === undefined || gameValidators.validateChallenge(typedEntry.challenge as string))
    );
  },

  /**
   * Validate player object
   */
  validatePlayer: (player: unknown): player is Player => {
    if (!player || typeof player !== 'object') return false;
    
    const typedPlayer = player as Record<string, unknown>;
    return (
      gameValidators.validatePlayerId(typedPlayer.id as string) &&
      gameValidators.validatePlayerName(typedPlayer.name as string) &&
      gameValidators.validateScore(typedPlayer.score as number) &&
      (typedPlayer.lives === undefined || gameValidators.validateLives(typedPlayer.lives as number)) &&
      (typedPlayer.isEliminated === undefined || typeof typedPlayer.isEliminated === 'boolean') &&
      Array.isArray(typedPlayer.history) &&
      (typedPlayer.history as unknown[]).every((entry: unknown) => gameValidators.validateScoreHistoryEntry(entry))
    );
  },

  /**
   * Validate game history entry
   */
  validateGameHistoryEntry: (entry: unknown): entry is GameHistoryEntry => {
    if (!entry || typeof entry !== 'object') return false;
    
    const typedEntry = entry as Record<string, unknown>;
    return (
      gameValidators.validatePlayerId(typedEntry.playerId as string) &&
      gameValidators.validatePlayerName(typedEntry.playerName as string) &&
      gameValidators.validateScore(typedEntry.score as number) &&
      gameValidators.validateTimestamp(typedEntry.timestamp as number) &&
      gameValidators.validateRound(typedEntry.round as number) &&
      gameValidators.validateGameMode(typedEntry.gameMode as string) &&
      (typedEntry.isBust === undefined || typeof typedEntry.isBust === 'boolean') &&
      (typedEntry.challenge === undefined || gameValidators.validateChallenge(typedEntry.challenge as string))
    );
  },

  /**
   * Validate game state
   */
  validateGameState: (state: unknown): state is GameState => {
    if (!state || typeof state !== 'object') return false;
    
    const typedState = state as Record<string, unknown>;
    return (
      Array.isArray(typedState.players) &&
      (typedState.players as unknown[]).length >= 2 &&
      (typedState.players as unknown[]).length <= 20 &&
      (typedState.players as unknown[]).every((player: unknown) => gameValidators.validatePlayer(player)) &&
      typeof typedState.currentPlayerIndex === 'number' &&
      (typedState.currentPlayerIndex as number) >= 0 &&
      (typedState.currentPlayerIndex as number) < (typedState.players as unknown[]).length &&
      gameValidators.validateGameMode(typedState.gameMode as string) &&
      (typedState.targetScore === undefined || gameValidators.validateTargetScore(typedState.targetScore as number)) &&
      (typedState.startingLives === undefined || gameValidators.validateLives(typedState.startingLives as number)) &&
      gameValidators.validateRound(typedState.currentRound as number) &&
      typeof typedState.isGameOver === 'boolean' &&
      (typedState.winner === undefined || gameValidators.validatePlayer(typedState.winner)) &&
      Array.isArray(typedState.gameHistory) &&
      (typedState.gameHistory as unknown[]).every((entry: unknown) => gameValidators.validateGameHistoryEntry(entry))
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
  sanitizeScore: (score: unknown): number => {
    const scoreStr = String(score);
    const num = parseInt(scoreStr, 10);
    if (isNaN(num) || num < 0) return 0;
    if (num > 180) return 180;
    return num;
  },

  /**
   * Sanitize lives
   */
  sanitizeLives: (lives: unknown): number => {
    const livesStr = String(lives);
    const num = parseInt(livesStr, 10);
    if (isNaN(num) || num < 0) return 0;
    if (num > 10) return 10;
    return num;
  },

  /**
   * Sanitize timestamp
   */
  sanitizeTimestamp: (timestamp: unknown): number => {
    const timestampStr = String(timestamp);
    const num = parseInt(timestampStr, 10);
    if (isNaN(num) || num <= 0) return Date.now();
    if (num > Date.now() + 60000) return Date.now();
    return num;
  },

  /**
   * Sanitize round number
   */
  sanitizeRound: (round: unknown): number => {
    const roundStr = String(round);
    const num = parseInt(roundStr, 10);
    if (isNaN(num) || num < 1) return 1;
    if (num > 1000) return 1000;
    return num;
  },
};

/**
 * Validate and sanitize game state
 */
export function validateAndSanitizeGameState(state: unknown): GameState | null {
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
    const typedState = state as Record<string, unknown>;
    if (Array.isArray(typedState.players)) {
      sanitizedState.players = (typedState.players as unknown[])
        .filter((player: unknown) => player && typeof player === 'object')
        .map((player: unknown) => {
          const typedPlayer = player as Record<string, unknown>;
          return {
            id: String(typedPlayer.id || `player-${Date.now()}-${Math.random()}`),
            name: gameSanitizers.sanitizePlayerName(String(typedPlayer.name)),
            score: gameSanitizers.sanitizeScore(typedPlayer.score),
            lives: typedPlayer.lives !== undefined ? gameSanitizers.sanitizeLives(typedPlayer.lives) : undefined,
            isEliminated: Boolean(typedPlayer.isEliminated),
            history: Array.isArray(typedPlayer.history)
              ? (typedPlayer.history as unknown[])
                  .filter((entry: unknown) => gameValidators.validateScoreHistoryEntry(entry))
                  .map((entry: unknown) => {
                    const typedEntry = entry as Record<string, unknown>;
                    return {
                      score: gameSanitizers.sanitizeScore(typedEntry.score),
                      timestamp: gameSanitizers.sanitizeTimestamp(typedEntry.timestamp),
                      round: gameSanitizers.sanitizeRound(typedEntry.round),
                      isBust: Boolean(typedEntry.isBust),
                      challenge: typedEntry.challenge ? gameSanitizers.sanitizeChallenge(String(typedEntry.challenge)) : undefined,
                    };
                  })
              : [],
          };
        })
        .filter((player: Player) => gameValidators.validatePlayer(player));
    }

    // Ensure minimum players
    if (sanitizedState.players.length < 2) {
      return null;
    }

    // Sanitize other fields
    sanitizedState.currentPlayerIndex = Math.max(0, Math.min(
      parseInt(String(typedState.currentPlayerIndex), 10) || 0,
      sanitizedState.players.length - 1
    ));

    const gameModeStr = String(typedState.gameMode);
    sanitizedState.gameMode = gameValidators.validateGameMode(gameModeStr) ? (gameModeStr as 'countdown' | 'highlow') : 'countdown';
    sanitizedState.targetScore = typedState.targetScore ? gameSanitizers.sanitizeScore(typedState.targetScore) : undefined;
    sanitizedState.startingLives = typedState.startingLives ? gameSanitizers.sanitizeLives(typedState.startingLives) : undefined;
    sanitizedState.currentRound = gameSanitizers.sanitizeRound(typedState.currentRound);
    sanitizedState.isGameOver = Boolean(typedState.isGameOver);

    // Sanitize game history
    if (Array.isArray(typedState.gameHistory)) {
      sanitizedState.gameHistory = (typedState.gameHistory as unknown[])
        .filter((entry: unknown) => gameValidators.validateGameHistoryEntry(entry))
        .map((entry: unknown) => {
          const typedEntry = entry as Record<string, unknown>;
          return {
            playerId: String(typedEntry.playerId),
            playerName: gameSanitizers.sanitizePlayerName(String(typedEntry.playerName)),
            score: gameSanitizers.sanitizeScore(typedEntry.score),
            timestamp: gameSanitizers.sanitizeTimestamp(typedEntry.timestamp),
            round: gameSanitizers.sanitizeRound(typedEntry.round),
            gameMode: String(typedEntry.gameMode) as 'countdown' | 'highlow',
            isBust: Boolean(typedEntry.isBust),
            challenge: typedEntry.challenge ? gameSanitizers.sanitizeChallenge(String(typedEntry.challenge)) : undefined,
          };
        });
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
