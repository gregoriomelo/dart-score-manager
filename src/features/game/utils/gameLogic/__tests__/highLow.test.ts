import {
  setHighLowChallenge,
  processHighLowTurn,
  isHighLowGameMode
} from '../highLow';
import { createGameState } from '../core';

describe('gameLogic/highLow', () => {
  describe('setHighLowChallenge', () => {
    it('should set challenge for current player', () => {
      const gameState = createGameState(['Alice', 'Bob'], 501, 'high-low');
      const playerId = gameState.players[0].id;
      
      const updatedState = setHighLowChallenge(gameState, playerId, 'higher', 40);
      
      expect(updatedState.highLowChallenge).toEqual({
        playerId,
        direction: 'higher',
        targetScore: 40
      });
    });

    it('should throw error if not in high-low mode', () => {
      const gameState = createGameState(['Alice', 'Bob'], 501, 'countdown');
      const playerId = gameState.players[0].id;
      
      expect(() => {
        setHighLowChallenge(gameState, playerId, 'higher', 40);
      }).toThrow('Can only set High-Low challenge in High-Low game mode');
    });
  });

  describe('processHighLowTurn', () => {
    it('should process successful higher challenge', () => {
      const gameState = createGameState(['Alice', 'Bob'], 501, 'high-low');
      const playerId = gameState.players[0].id;
      gameState.highLowChallenge = {
        playerId,
        direction: 'higher',
        targetScore: 40
      };
      
      const updatedState = processHighLowTurn(gameState, playerId, 60); // 60 > 40
      
      expect(updatedState.players[0].score).toBe(60);
      expect(updatedState.currentPlayerIndex).toBe(1); // Should auto-advance player
      expect(updatedState.highLowChallenge).toBeUndefined(); // Challenge cleared
    });

    it('should process failed higher challenge', () => {
      const gameState = createGameState(['Alice', 'Bob'], 501, 'high-low');
      const playerId = gameState.players[0].id;
      gameState.highLowChallenge = {
        playerId,
        direction: 'higher',
        targetScore: 40
      };
      
      const updatedState = processHighLowTurn(gameState, playerId, 30); // 30 < 40
      
      expect(updatedState.players[0].score).toBe(30);
      expect(updatedState.players[0].lives).toBe(4); // Lost a life
      expect(updatedState.currentPlayerIndex).toBe(1); // Should auto-advance player
    });

    it('should process successful lower challenge', () => {
      const gameState = createGameState(['Alice', 'Bob'], 501, 'high-low');
      const playerId = gameState.players[0].id;
      gameState.highLowChallenge = {
        playerId,
        direction: 'lower',
        targetScore: 40
      };
      
      const updatedState = processHighLowTurn(gameState, playerId, 30); // 30 < 40
      
      expect(updatedState.players[0].score).toBe(30);
      expect(updatedState.currentPlayerIndex).toBe(1); // Should auto-advance player
      expect(updatedState.highLowChallenge).toBeUndefined(); // Challenge cleared
    });

    it('should eliminate player when lives reach 0', () => {
      const gameState = createGameState(['Alice', 'Bob'], 501, 'high-low');
      const playerId = gameState.players[0].id;
      gameState.players[0].lives = 1; // Only 1 life left
      gameState.highLowChallenge = {
        playerId,
        direction: 'higher',
        targetScore: 40
      };
      
      const updatedState = processHighLowTurn(gameState, playerId, 30); // Failed challenge
      
      expect(updatedState.players[0].lives).toBe(0); // Eliminated
      expect(updatedState.gameFinished).toBe(true); // Game over (only one player left)
      expect(updatedState.winner).toBe(updatedState.players[1]); // Bob wins
    });

    it('should throw error if no challenge is set', () => {
      const gameState = createGameState(['Alice', 'Bob'], 501, 'high-low');
      const playerId = gameState.players[0].id;
      
      expect(() => {
        processHighLowTurn(gameState, playerId, 50);
      }).toThrow('No challenge set for High-Low turn');
    });

    it('should throw error if wrong player attempts turn', () => {
      const gameState = createGameState(['Alice', 'Bob'], 501, 'high-low');
      const aliceId = gameState.players[0].id;
      const bobId = gameState.players[1].id;
      gameState.highLowChallenge = {
        playerId: aliceId,
        direction: 'higher',
        targetScore: 40
      };
      
      expect(() => {
        processHighLowTurn(gameState, bobId, 50); // Bob trying Alice's challenge
      }).toThrow('Wrong player attempting turn');
    });

    it('should throw error if not in high-low mode', () => {
      const gameState = createGameState(['Alice', 'Bob'], 501, 'countdown');
      const playerId = gameState.players[0].id;
      
      expect(() => {
        processHighLowTurn(gameState, playerId, 50);
      }).toThrow('Can only process High-Low turn in High-Low game mode');
    });
  });

  describe('isHighLowGameMode', () => {
    it('should return true for high-low mode', () => {
      const gameState = createGameState(['Alice', 'Bob'], 501, 'high-low');
      
      expect(isHighLowGameMode(gameState)).toBe(true);
    });

    it('should return false for countdown mode', () => {
      const gameState = createGameState(['Alice', 'Bob'], 501, 'countdown');
      
      expect(isHighLowGameMode(gameState)).toBe(false);
    });
  });
});
