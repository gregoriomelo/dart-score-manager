export interface Player {
  id: string;
  name: string;
  score: number;
  isWinner: boolean;
  turnStartScore: number; // Score at the beginning of current turn
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  startingScore: number;
  gameStarted: boolean;
  gameFinished: boolean;
  winner: Player | null;
  currentDart: number; // 1, 2, or 3
  doubleOutRule: boolean; // Must finish on double
  lastThrowWasBust: boolean;
}

export interface ScoreEntry {
  playerId: string;
  score: number;
  timestamp: Date;
}
