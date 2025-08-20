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
  gameFinished: boolean;
  winner: Player | null;
  lastThrowWasBust: boolean;
}

export interface ScoreEntry {
  playerId: string;
  score: number;
  timestamp: Date;
}
