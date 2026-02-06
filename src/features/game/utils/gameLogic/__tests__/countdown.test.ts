import { updatePlayerScore } from '../core';
import { createGameState } from '../core';

describe('gameLogic/countdown', () => {
  describe('updatePlayerScore', () => {
    it('should update player score correctly', () => {
      const gameState = createGameState(['Alice', 'Bob'], 501);
      const playerId = gameState.players[0].id;
      
      const updatedState = updatePlayerScore(gameState, playerId, 100);
      
      expect(updatedState.players[0].score).toBe(401);
      expect(updatedState.currentPlayerIndex).toBe(1); // Automatically advances to next player
    });

    it('should mark player as winner when score reaches 0', () => {
      const gameState = createGameState(['Alice', 'Bob'], 100);
      const playerId = gameState.players[0].id;
      
      const updatedState = updatePlayerScore(gameState, playerId, 100);
      
      expect(updatedState.players[0].score).toBe(0);
      expect(updatedState.players[0].isWinner).toBe(true);
      expect(updatedState.gameFinished).toBe(true);
      expect(updatedState.winner).toBe(updatedState.players[0]);
    });

    it('should handle bust by reverting to turn start score', () => {
      const gameState = createGameState(['Alice', 'Bob'], 50);
      const playerId = gameState.players[0].id;
      
      const updatedState = updatePlayerScore(gameState, playerId, 51); // Bust (would go negative)
      
      expect(updatedState.players[0].score).toBe(50); // Reverted to turn start
      expect(updatedState.currentPlayerIndex).toBe(0); // Should not auto-advance player
    });

    it('should handle bust when score would be 1', () => {
      const gameState = createGameState(['Alice', 'Bob'], 50);
      const playerId = gameState.players[0].id;
      
      const updatedState = updatePlayerScore(gameState, playerId, 49); // Would leave 1
      
      expect(updatedState.players[0].score).toBe(50); // Reverted to turn start
    });

    it('should throw error for non-existent player', () => {
      const gameState = createGameState(['Alice', 'Bob']);
      
      expect(() => {
        updatePlayerScore(gameState, 'invalid-id', 100);
      }).toThrow('Player not found');
    });

    it('should throw error for invalid score', () => {
      const gameState = createGameState(['Alice', 'Bob'], 50);
      const playerId = gameState.players[0].id;
      
      expect(() => {
        updatePlayerScore(gameState, playerId, -10);
      }).toThrow('Invalid score');
    });

    it('should record score history', () => {
      const gameState = createGameState(['Alice', 'Bob'], 501);
      const playerId = gameState.players[0].id;
      
      const updatedState = updatePlayerScore(gameState, playerId, 100);
      
      expect(updatedState.players[0].scoreHistory).toHaveLength(1);
      expect(updatedState.players[0].scoreHistory[0].score).toBe(100);
      expect(updatedState.players[0].scoreHistory[0].previousScore).toBe(501);
    });
  });
});
