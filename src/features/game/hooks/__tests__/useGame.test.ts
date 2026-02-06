import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useGameManager } from '../useGameManager';

describe('useGameManager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('initializes with empty game state', () => {
    const { result } = renderHook(() => useGameManager());

    expect(result.current.gameState.players).toHaveLength(0);
    expect(result.current.gameState.gameFinished).toBe(false);
    expect(result.current.currentPlayer).toBeNull();
  });

  it('initializes game with players', () => {
    const { result } = renderHook(() => useGameManager());

    act(() => {
      result.current.initializeGame(['Alice', 'Bob'], 'countdown', 501, 5);
    });

    expect(result.current.gameState.players).toHaveLength(2);
    expect(result.current.gameState.players[0]?.name).toBe('Alice');
    expect(result.current.gameState.players[1]?.name).toBe('Bob');
    // Players should have the correct starting score
    expect(result.current.gameState.players[0]?.score).toBe(501);
    expect(result.current.gameState.players[1]?.score).toBe(501);
  });

  it('starts a new game', () => {
    const { result } = renderHook(() => useGameManager());

    act(() => {
      result.current.initializeGame(['Alice', 'Bob'], 'countdown', 501, 5);
    });

    expect(result.current.gameState.gameFinished).toBe(false);

    act(() => {
      result.current.startNewGame();
    });

    expect(result.current.gameState.gameFinished).toBe(false);
    expect(result.current.gameState.currentPlayerIndex).toBe(0);
    expect(result.current.gameState.players[0].score).toBe(501);
    expect(result.current.gameState.players[1].score).toBe(501);
  });

  it('submits score for current player', () => {
    const { result } = renderHook(() => useGameManager());

    act(() => {
      result.current.initializeGame(['Alice', 'Bob'], 'countdown', 501, 5);
      result.current.startNewGame();
    });

    const playerId = result.current.gameState.players[0].id;
    const initialScore = result.current.gameState.players[0].score;

    act(() => {
      result.current.submitScore(playerId, 100);
    });

    expect(result.current.gameState.players[0].score).toBe(initialScore - 100);
  });

  it('handles invalid score submission gracefully', () => {
    const { result } = renderHook(() => useGameManager());
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    act(() => {
      result.current.initializeGame(['Alice', 'Bob']);
      result.current.startNewGame();
    });

    const playerId = result.current.gameState.players[0].id;
    const initialScore = result.current.gameState.players[0].score;

    act(() => {
      result.current.submitScore(playerId, 600); // Invalid score
    });

    expect(result.current.gameState.players[0].score).toBe(initialScore);
    expect(consoleSpy).toHaveBeenCalledWith('Error updating score:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('advances to next player', () => {
    const { result } = renderHook(() => useGameManager());

    act(() => {
      result.current.initializeGame(['Alice', 'Bob'], 'countdown', 501, 5);
      result.current.startNewGame();
    });

    expect(result.current.gameState.currentPlayerIndex).toBe(0);
    expect(result.current.currentPlayer?.name).toBe('Alice');

    act(() => {
      result.current.goToNextPlayer();
    });

    expect(result.current.gameState.currentPlayerIndex).toBe(1);
    expect(result.current.currentPlayer?.name).toBe('Bob');

    act(() => {
      result.current.goToNextPlayer();
    });

    expect(result.current.gameState.currentPlayerIndex).toBe(0);
    expect(result.current.currentPlayer?.name).toBe('Alice');
  });

  it('resets current game', () => {
    const { result } = renderHook(() => useGameManager());

    act(() => {
      result.current.initializeGame(['Alice', 'Bob'], 'countdown', 501, 5);
      result.current.startNewGame();
    });

    const playerId = result.current.gameState.players[0].id;

    act(() => {
      result.current.submitScore(playerId, 100);
    });

    expect(result.current.gameState.players[0].score).toBe(401);
    expect(result.current.gameState.currentPlayerIndex).toBe(1); // Automatically advances to next player

    act(() => {
      result.current.resetCurrentGame();
    });

    expect(result.current.gameState.players[0].score).toBe(501);
    expect(result.current.gameState.players[1].score).toBe(501);
    expect(result.current.gameState.currentPlayerIndex).toBe(0);
    // Game should be reset properly
    expect(result.current.gameState.gameFinished).toBe(false);
  });

  it('handles winning scenario', () => {
    const { result } = renderHook(() => useGameManager());

    act(() => {
      result.current.initializeGame(['Alice', 'Bob'], 'countdown', 50, 5);
      result.current.startNewGame();
    });

    const playerId = result.current.gameState.players[0].id;

    act(() => {
      result.current.submitScore(playerId, 50); // Exact finish to win
    });

    expect(result.current.gameState.players[0].score).toBe(0);
    expect(result.current.gameState.players[0].isWinner).toBe(true);
    expect(result.current.gameState.gameFinished).toBe(true);
    expect(result.current.gameState.winner).toBe(result.current.gameState.players[0]);
  });

  it('returns correct current player', () => {
    const { result } = renderHook(() => useGameManager());
    
    expect(result.current.currentPlayer).toBeNull();

    act(() => {
      result.current.initializeGame(['Alice', 'Bob'], 'countdown', 501, 5);
    });

    expect(result.current.currentPlayer?.name).toBe('Alice');

    act(() => {
      result.current.goToNextPlayer();
    });

    expect(result.current.currentPlayer?.name).toBe('Bob');
  });
});
