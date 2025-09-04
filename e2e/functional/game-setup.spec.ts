import { test, expect } from '@playwright/test';
import { setupTest, removeWebpackOverlay } from '../test-helpers';

test.describe('Game Setup', () => {
  test('should allow setting up a countdown game with custom settings', async ({ page }) => {
    await setupTest(page, {
      players: ['Player 1', 'Player 2'],
      gameMode: 'countdown',
      startingScore: 301
    });
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Check initial state
    await expect(page.getByText('Dart Score Manager')).toBeVisible();
    
    // Verify game started with correct settings
    await expect(page.locator('.player-card').first().getByText('Player 1')).toBeVisible();
    await expect(page.locator('.player-card').first().getByText('301')).toBeVisible();
  });

  test('should allow setting up a high-low game', async ({ page }) => {
    await setupTest(page, {
      players: ['Player 1', 'Player 2'],
      gameMode: 'high-low',
      startingLives: 3
    });
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Verify high-low game started
    await expect(page.getByText('High-Low Challenge')).toBeVisible();
    await expect(page.locator('.player-card').first().getByText('Lives: 3')).toBeVisible();
  });
});
