import {
  createPlayer,
  createGameState,
  resetGame
} from '../core';
import { isValidScore, getCurrentPlayer, nextPlayer } from '../core';
import { isHighLowPlayer, isHighLowGameState } from '../../../../../shared/types/game';

describe('gameLogic/common', () => {
  describe('createPlayer', () => {
    it('should create a player with default starting score of 501', () => {
      const player = createPlayer('John', 501);
      
      expect(player.name).toBe('John');
      expect(player.score).toBe(501);
      expect(player.isWinner).toBe(false);
      expect(player.id).toBeDefined();
    });

    it('should create a High-Low player with score 40 and lives', () => {
      const player = createPlayer('Alice', 501, 'high-low');
      
      expect(player.name).toBe('Alice');
      expect(player.score).toBe(40);
      expect(isHighLowPlayer(player) ? player.lives : 0).toBe(5);
      expect(player.isWinner).toBe(false);
    });

    it('should trim whitespace from player name', () => {
      const player = createPlayer('  John  ', 501);
      
      expect(player.name).toBe('John');
    });
  });

  describe('createGameState', () => {
    it('should create initial game state with players', () => {
      const gameState = createGameState(['Alice', 'Bob']);
      
      expect(gameState.players).toHaveLength(2);
      expect(gameState.players[0].name).toBe('Alice');
      expect(gameState.players[1].name).toBe('Bob');
      expect(gameState.currentPlayerIndex).toBe(0);
      expect(gameState.gameFinished).toBe(false);
      expect(gameState.winner).toBeNull();
    });

    it('should create High-Low game state', () => {
      const gameState = createGameState(['Alice', 'Bob'], 501, 'high-low');
      
      expect(gameState.gameMode).toBe('high-low');
      expect(gameState.players[0].score).toBe(40);
      expect(isHighLowPlayer(gameState.players[0]) ? gameState.players[0].lives : 0).toBe(5);
      expect(isHighLowGameState(gameState) ? gameState.highLowChallenge : undefined).toBeUndefined();
    });
  });

  describe('isValidScore', () => {
    it('should return true for valid scores', () => {
      expect(isValidScore(501, 100)).toBe(true);
      expect(isValidScore(100, 50)).toBe(true);
      expect(isValidScore(180, 180)).toBe(true);
    });

    it('should return false for invalid scores', () => {
      expect(isValidScore(50, 100)).toBe(false);
      expect(isValidScore(100, -10)).toBe(false);
      expect(isValidScore(100, 181)).toBe(false);
    });
  });

  describe('getCurrentPlayer', () => {
    it('should return current player', () => {
      const gameState = createGameState(['Alice', 'Bob']);
      const currentPlayer = getCurrentPlayer(gameState);
      
      expect(currentPlayer?.name).toBe('Alice');
    });

    it('should return null for empty players array', () => {
      const gameState = createGameState([]);
      const currentPlayer = getCurrentPlayer(gameState);
      
      expect(currentPlayer).toBeNull();
    });
  });

  describe('nextPlayer', () => {
    it('should advance to next player', () => {
      const gameState = createGameState(['Alice', 'Bob']);
      const nextState = nextPlayer(gameState);
      
      expect(nextState.currentPlayerIndex).toBe(1);
    });

    it('should cycle back to first player', () => {
      const gameState = createGameState(['Alice', 'Bob']);
      gameState.currentPlayerIndex = 1;
      const nextState = nextPlayer(gameState);
      
      expect(nextState.currentPlayerIndex).toBe(0);
    });

    it('should skip eliminated players in High-Low mode', () => {
      const gameState = createGameState(['Alice', 'Bob', 'Charlie'], 501, 'high-low');
      gameState.players[1].lives = 0; // Eliminate Bob
      const nextState = nextPlayer(gameState);
      
      expect(nextState.currentPlayerIndex).toBe(2); // Skip to Charlie
    });
  });

  describe('resetGame', () => {
    it('should reset countdown game', () => {
      const gameState = createGameState(['Alice', 'Bob'], 301);
      gameState.players[0].score = 100;
      gameState.gameFinished = true;
      
      const resetState = resetGame(gameState);
      
      expect(resetState.players[0].score).toBe(301);
      expect(resetState.gameFinished).toBe(false);
      expect(resetState.currentPlayerIndex).toBe(0);
    });

    it('should reset High-Low game to score 40', () => {
      const gameState = createGameState(['Alice', 'Bob'], 501, 'high-low');
      gameState.players[0].score = 100;
      gameState.players[0].lives = 2;
      
      const resetState = resetGame(gameState);
      
      expect(resetState.players[0].score).toBe(40);
      expect(resetState.players[0].lives).toBe(5);
    });

    it('should reset High-Low game with custom starting lives', () => {
      const gameState = createGameState(['Alice', 'Bob'], 501, 'high-low', 3);
      gameState.players[0].score = 100;
      gameState.players[0].lives = 1;
      
      const resetState = resetGame(gameState, 3);
      
      expect(resetState.players[0].score).toBe(40);
      expect(resetState.players[0].lives).toBe(3);
    });
  });
});
