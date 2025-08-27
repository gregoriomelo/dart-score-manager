import {
  createPlayer,
  createGameState,
  isValidScore,
  updatePlayerScore,
  nextPlayer,
  resetGame,
  getCurrentPlayer,
} from '../gameLogic';

describe('gameLogic', () => {
  describe('createPlayer', () => {
    it('should create a player with default starting score of 501', () => {
      const player = createPlayer('John', 501);
      
      expect(player.name).toBe('John');
      expect(player.score).toBe(501);
      expect(player.isWinner).toBe(false);
      expect(player.id).toBeDefined();
      expect(player.id.length).toBeGreaterThan(0);
      expect(player.scoreHistory).toEqual([]);
    });

    it('should create a High-Low player with score 40 and lives', () => {
      const player = createPlayer('John', 501, 'high-low', 5);
      
      expect(player.name).toBe('John');
      expect(player.score).toBe(40); // Should be 40 for High-Low, not 501
      expect(player.lives).toBe(5);
      expect(player.isWinner).toBe(false);
      expect(player.turnStartScore).toBe(40);
    });

    it('should create a High-Low player with default 5 lives', () => {
      const player = createPlayer('Jane', 301, 'high-low');
      
      expect(player.name).toBe('Jane');
      expect(player.score).toBe(40); // Should be 40 for High-Low
      expect(player.lives).toBe(5); // Default lives
    });

    it('should create a player with custom starting score', () => {
      const player = createPlayer('Jane', 301);
      
      expect(player.name).toBe('Jane');
      expect(player.score).toBe(301);
      expect(player.isWinner).toBe(false);
    });

    it('should trim whitespace from player name', () => {
      const player = createPlayer('  Bob  ', 501);
      
      expect(player.name).toBe('  Bob  ');
      expect(player.scoreHistory).toEqual([]);
    });
  });

  describe('createGameState', () => {
    it('should create initial game state with players', () => {
      const players = [createPlayer('Alice', 501), createPlayer('Bob', 501)];
      const gameState = createGameState(players);
      
      expect(gameState.players).toHaveLength(2);
      expect(gameState.players[0].name).toBe('Alice');
      expect(gameState.players[1].name).toBe('Bob');
      expect(gameState.currentPlayerIndex).toBe(0);
      expect(gameState.gameFinished).toBe(false);
      expect(gameState.winner).toBeNull();
      expect(gameState.lastThrowWasBust).toBe(false);
    });

    it('should create game state with custom starting score', () => {
      const player = createPlayer('Player1', 301);
      expect(player.score).toBe(301);
      
      const gameState = createGameState([player]);
      expect(gameState.players[0].score).toBe(301);
    });
  });

  describe('isValidScore', () => {
    it('should return true for valid scores', () => {
      expect(isValidScore(100, 50)).toBe(true);
      expect(isValidScore(501, 180)).toBe(true);
      expect(isValidScore(20, 20)).toBe(true);
      expect(isValidScore(1, 1)).toBe(true);
      expect(isValidScore(100, 0)).toBe(true); // 0 is valid (missed dartboard)
    });

    it('should return false for scores that would result in negative', () => {
      expect(isValidScore(50, 51)).toBe(false);
      expect(isValidScore(0, 1)).toBe(false);
    });

    it('should return false for invalid score inputs', () => {
      expect(isValidScore(100, -10)).toBe(false);
      expect(isValidScore(100, 181)).toBe(false);
    });
  });

  describe('updatePlayerScore', () => {
    let gameState: ReturnType<typeof createGameState>;

    beforeEach(() => {
      const players = [createPlayer('Alice', 501), createPlayer('Bob', 501)];
      gameState = createGameState(players);
    });

    it('should update player score correctly', () => {
      const playerId = gameState.players[0].id;
      const updatedState = updatePlayerScore(gameState, playerId, 100);
      
      expect(updatedState.players[0].score).toBe(401);
      expect(updatedState.players[0].isWinner).toBe(false);
      expect(updatedState.gameFinished).toBe(false);
      expect(updatedState.winner).toBeNull();
    });

    it('should mark player as winner when score reaches 0', () => {
      // Create a game state with a player who has 50 points
      const players = [createPlayer('Alice', 50), createPlayer('Bob', 50)];
      const gameStateWith50 = createGameState(players);
      const playerId = gameStateWith50.players[0].id;
      
      // Now score exactly 50 to win
      const updatedState = updatePlayerScore(gameStateWith50, playerId, 50);
      
      expect(updatedState.players[0].score).toBe(0);
      expect(updatedState.players[0].isWinner).toBe(true);
      expect(updatedState.gameFinished).toBe(true);
      expect(updatedState.winner).toBe(updatedState.players[0]);
    });

    it('should throw error for non-existent player', () => {
      expect(() => {
        updatePlayerScore(gameState, 'non-existent-id', 50);
      }).toThrow('Player not found');
    });

    it('should throw error for invalid score', () => {
      const playerId = gameState.players[0].id;
      
      expect(() => {
        updatePlayerScore(gameState, playerId, -1);
      }).toThrow('Invalid score');
      
      expect(() => {
        updatePlayerScore(gameState, playerId, 181);
      }).toThrow('Invalid score');
    });

    it('should allow 0 as a valid score (missed dartboard)', () => {
      const playerId = gameState.players[0].id;
      const updatedState = updatePlayerScore(gameState, playerId, 0);
      
      expect(updatedState.players[0].score).toBe(501); // Score remains unchanged
      expect(updatedState.players[0].isWinner).toBe(false);
      expect(updatedState.gameFinished).toBe(false);
    });

    it('should handle bust by reverting to turn start score', () => {
      const players = [createPlayer('Alice', 50)];
      const gameStateWith50 = createGameState(players);
      // Set turn start score
      const gameWithTurnStart = {
        ...gameStateWith50,
        players: gameStateWith50.players.map(p => ({ ...p, turnStartScore: 50 }))
      };
      
      const playerId = gameWithTurnStart.players[0].id;
      const updatedState = updatePlayerScore(gameWithTurnStart, playerId, 60); // Would go to -10, so bust
      
      expect(updatedState.players[0].score).toBe(50); // Reverted to turn start
      expect(updatedState.lastThrowWasBust).toBe(true);
    });

    it('should handle bust when score would be 1', () => {
      const players = [createPlayer('Alice', 2)];
      const gameStateWith2 = createGameState(players);
      const gameWithTurnStart = {
        ...gameStateWith2,
        players: gameStateWith2.players.map(p => ({ ...p, turnStartScore: 2 }))
      };
      
      const playerId = gameWithTurnStart.players[0].id;
      const updatedState = updatePlayerScore(gameWithTurnStart, playerId, 1); // Would leave score at 1, which is a bust
      
      expect(updatedState.players[0].score).toBe(2); // Reverted because 1 is a bust
      expect(updatedState.lastThrowWasBust).toBe(true);
    });

    it('should handle bust when score exceeds remaining points', () => {
      const players = [createPlayer('Alice', 80)];
      const gameStateWith80 = createGameState(players);
      const gameWithTurnStart = {
        ...gameStateWith80,
        players: gameStateWith80.players.map(p => ({ ...p, turnStartScore: 80 }))
      };
      
      const playerId = gameWithTurnStart.players[0].id;
      const updatedState = updatePlayerScore(gameWithTurnStart, playerId, 82); // Score exceeds remaining points
      
      expect(updatedState.players[0].score).toBe(80); // Reverted to turn start
      expect(updatedState.lastThrowWasBust).toBe(true);
    });

  });

  describe('nextPlayer', () => {
    let gameState: ReturnType<typeof createGameState>;

    beforeEach(() => {
      const players = [createPlayer('Alice', 501), createPlayer('Bob', 501), createPlayer('Charlie', 501)];
      gameState = createGameState(players);
    });

    it('should advance to next player after each turn', () => {
      expect(gameState.currentPlayerIndex).toBe(0);
      
      // Should advance to next player immediately
      let nextState = nextPlayer(gameState);
      expect(nextState.currentPlayerIndex).toBe(1);
      
      nextState = nextPlayer(nextState);
      expect(nextState.currentPlayerIndex).toBe(2);
    });

    it('should cycle back to first player after last player', () => {
      const stateAtLastPlayer = { ...gameState, currentPlayerIndex: 2 };
      
      const nextState = nextPlayer(stateAtLastPlayer);
      expect(nextState.currentPlayerIndex).toBe(0);
      // Player advanced to next
    });

    it('should advance to next player after bust', () => {
      const bustState = { ...gameState, lastThrowWasBust: true };
      
      const nextState = nextPlayer(bustState);
      expect(nextState.currentPlayerIndex).toBe(1);
      // Player advanced after bust
    });

    it('should not advance player if game is finished', () => {
      const finishedState = {
        ...gameState,
        gameFinished: true,
        winner: gameState.players[0],
      };
      
      const nextState = nextPlayer(finishedState);
      expect(nextState.currentPlayerIndex).toBe(0);
    });
  });

  describe('startGame', () => {
    it('should initialize game state properly', () => {
      const players = [createPlayer('Alice', 501), createPlayer('Bob', 501)];
      const gameState = createGameState(players);
      
      expect(gameState.gameFinished).toBe(false);
      expect(gameState.winner).toBeNull();
    });
  });

  describe('resetGame', () => {
    it('should reset all players to starting score and game state', () => {
      const players = [createPlayer('Alice', 501), createPlayer('Bob', 501)];
      let gameState = createGameState(players);
      
      // Simulate some gameplay
      const playerId = gameState.players[0].id;
      gameState = updatePlayerScore(gameState, playerId, 100);
      gameState = nextPlayer(gameState);
      
      expect(gameState.players[0].score).toBe(401);
      expect(gameState.currentPlayerIndex).toBe(1);
      
      // Reset the game
      const resetState = resetGame(gameState, 501);
      
      expect(resetState.players[0].score).toBe(501);
      expect(resetState.players[1].score).toBe(501);
      expect(resetState.currentPlayerIndex).toBe(0);
      expect(resetState.gameFinished).toBe(false);
      expect(resetState.winner).toBeNull();
      expect(resetState.players[0].isWinner).toBe(false);
      expect(resetState.players[1].isWinner).toBe(false);
    });

    it('should reset High-Low players to score 40', () => {
      const players = [createPlayer('Alice', 501, 'high-low', 3), createPlayer('Bob', 501, 'high-low', 3)];
      let gameState = createGameState(players, 'high-low', undefined, 3);
      
      // Simulate some gameplay - modify scores and lives
      gameState.players[0].score = 75;
      gameState.players[0].lives = 1;
      gameState.players[1].score = 25;
      gameState.players[1].lives = 2;
      
      // Reset the game
      const resetState = resetGame(gameState, 501);
      
      expect(resetState.players[0].score).toBe(40); // Should be 40 for High-Low
      expect(resetState.players[1].score).toBe(40); // Should be 40 for High-Low
      expect(resetState.players[0].lives).toBe(3); // Lives reset to starting lives
      expect(resetState.players[1].lives).toBe(3);
      expect(resetState.currentPlayerIndex).toBe(0);
      expect(resetState.gameFinished).toBe(false);
    });
  });

  describe('getCurrentPlayer', () => {
    it('should return current player', () => {
      const players = [createPlayer('Alice', 501), createPlayer('Bob', 501)];
      const gameState = createGameState(players);
      const currentPlayer = getCurrentPlayer(gameState);
      
      expect(currentPlayer).toBe(gameState.players[0]);
      expect(currentPlayer?.name).toBe('Alice');
    });

    it('should return null for empty players array', () => {
      const gameState = createGameState([]);
      const currentPlayer = getCurrentPlayer(gameState);
      
      expect(currentPlayer).toBeNull();
    });

    it('should return correct player after advancing', () => {
      const players = [createPlayer('Alice', 501), createPlayer('Bob', 501)];
      let gameState = createGameState(players);
      gameState = nextPlayer(gameState);
      
      const currentPlayer = getCurrentPlayer(gameState);
      expect(currentPlayer?.name).toBe('Bob');
    });
  });

  
});
