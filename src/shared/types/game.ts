export type GameMode = 'countdown' | 'high-low';

export interface ScoreHistoryEntry {
  score: number;
  previousScore: number;
  timestamp: Date;
  turnNumber: number;
  
  // High-Low specific (optional)
  challengeDirection?: 'higher' | 'lower';
  challengeTarget?: number;
  challengerId?: string; // Who set the challenge
  passedChallenge?: boolean; // Whether the thrown score passed the challenge
  livesBefore?: number;
  livesAfter?: number;
  roundNumber?: number; // Optional grouping/round info
  note?: string; // Optional extra context
}

// Base player interface with common properties
export interface BasePlayer {
  id: string;
  name: string;
  isWinner: boolean;
  scoreHistory: ScoreHistoryEntry[];
}

// Countdown game specific player
export interface CountdownPlayer extends BasePlayer {
  score: number;
  turnStartScore: number; // Score at the beginning of current turn
}

// High-Low game specific player
export interface HighLowPlayer extends BasePlayer {
  score: number;
  lives: number; // Required for high-low mode
  turnStartScore: number; // Score at the beginning of current turn
}

// Union type for backward compatibility
export type Player = CountdownPlayer | HighLowPlayer;

// Type guards for better type safety
export const isCountdownPlayer = (player: Player): player is CountdownPlayer => {
  return 'turnStartScore' in player && !('lives' in player);
};

export const isHighLowPlayer = (player: Player): player is HighLowPlayer => {
  return 'lives' in player && typeof player.lives === 'number';
};

export interface HighLowChallenge {
  playerId: string; // Player who must complete the challenge
  targetScore: number;
  direction: 'higher' | 'lower';
}

// Base game state interface
export interface BaseGameState {
  currentPlayerIndex: number;
  gameFinished: boolean;
  lastThrowWasBust: boolean;
  gameMode: GameMode;
}

// Countdown game specific state
export interface CountdownGameState extends BaseGameState {
  gameMode: 'countdown';
  players: CountdownPlayer[];
  winner: CountdownPlayer | null;
  startingScore: number;
}

// High-Low game specific state
export interface HighLowGameState extends BaseGameState {
  gameMode: 'high-low';
  players: HighLowPlayer[];
  winner: HighLowPlayer | null;
  startingLives: number;
  highLowChallenge?: HighLowChallenge;
}

// Union type for backward compatibility
export type GameState = CountdownGameState | HighLowGameState;

// Type guards for game state
export const isCountdownGameState = (gameState: GameState): gameState is CountdownGameState => {
  return gameState.gameMode === 'countdown';
};

export const isHighLowGameState = (gameState: GameState): gameState is HighLowGameState => {
  return gameState.gameMode === 'high-low';
};

export interface ScoreEntry {
  playerId: string;
  score: number;
  timestamp: Date;
}
