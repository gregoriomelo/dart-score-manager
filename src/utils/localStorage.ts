import { GameState } from '../types/game';

const STORAGE_KEY = 'dart-score-manager-game-state';

export const saveGameState = (gameState: GameState): void => {
  try {
    const serializedState = JSON.stringify({
      ...gameState,
      // Convert Date objects to strings for JSON serialization
      players: gameState.players.map(player => ({
        ...player,
        scoreHistory: player.scoreHistory.map(entry => ({
          ...entry,
          timestamp: entry.timestamp.toISOString()
        }))
      }))
    });
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (error) {
    console.warn('Failed to save game state to localStorage:', error);
  }
};

export const loadGameState = (): GameState | null => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) return null;

    const parsedState = JSON.parse(serializedState);
    
    // Convert timestamp strings back to Date objects
    return {
      ...parsedState,
      players: parsedState.players.map((player: any) => ({
        ...player,
        scoreHistory: player.scoreHistory.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }))
      }))
    };
  } catch (error) {
    console.warn('Failed to load game state from localStorage:', error);
    return null;
  }
};

export const clearGameState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear game state from localStorage:', error);
  }
};

export const hasStoredGameState = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch (error) {
    return false;
  }
};
