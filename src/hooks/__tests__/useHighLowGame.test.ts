import { renderHook, act } from '@testing-library/react';
import { useGame } from '../useGame';

describe('useHighLowGame', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes a high-low game', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.initializeGame(['Alice', 'Bob'], 'high-low', 0, 5);
    });

    expect(result.current.gameState.gameMode).toBe('high-low');
    expect(result.current.gameState.players[0].lives).toBe(5);
  });

  it('sets a challenge for high-low game', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.initializeGame(['Alice', 'Bob'], 'high-low', 0, 5);
      result.current.startNewGame();
    });

    const challengerId = result.current.gameState.players[0].id;

    act(() => {
      result.current.setChallengeForHighLow('higher', 100, challengerId);
    });

    const challenge = result.current.gameState.highLowChallenge;
    expect(challenge).toBeDefined();
    expect(challenge?.direction).toBe('higher');
    expect(challenge?.targetScore).toBe(100);
  });

  it('submits a score for high-low game and wins the challenge', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.initializeGame(['Alice', 'Bob'], 'high-low', 0, 5);
      result.current.startNewGame();
    });

    const challengerId = result.current.gameState.players[0].id;

    act(() => {
      result.current.setChallengeForHighLow('higher', 100, challengerId);
    });

    act(() => {
      result.current.submitHighLowScore(challengerId, 120);
    });

    expect(result.current.gameState.players[0].score).toBe(120);
    expect(result.current.gameState.players[0].lives).toBe(5);
    expect(result.current.gameState.highLowChallenge).toBeUndefined();
  });

  it('submits a score for high-low game and loses the challenge', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.initializeGame(['Alice', 'Bob'], 'high-low', 0, 5);
      result.current.startNewGame();
    });

    const challengerId = result.current.gameState.players[0].id;

    act(() => {
      result.current.setChallengeForHighLow('higher', 100, challengerId);
    });

    act(() => {
      result.current.submitHighLowScore(challengerId, 90);
    });

    expect(result.current.gameState.players[0].score).toBe(90);
    expect(result.current.gameState.players[0].lives).toBe(4);
    expect(result.current.gameState.highLowChallenge).toBeUndefined();
  });
});
