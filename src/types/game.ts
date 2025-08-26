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

export interface Player {
  id: string;
  name: string;
  score: number;
  isWinner: boolean;
  turnStartScore: number; // Score at the beginning of current turn
  scoreHistory: ScoreHistoryEntry[];
  lives?: number; // For high-low mode
}

export interface HighLowChallenge {
  playerId: string; // Player who must complete the challenge
  targetScore: number;
  direction: 'higher' | 'lower';
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  gameFinished: boolean;
  winner: Player | null;
  lastThrowWasBust: boolean;
  gameMode: GameMode;
  startingScore?: number; // For countdown mode
  startingLives?: number; // For high-low mode
  highLowChallenge?: HighLowChallenge; // For high-low mode
}

export interface ScoreEntry {
  playerId: string;
  score: number;
  timestamp: Date;
}
