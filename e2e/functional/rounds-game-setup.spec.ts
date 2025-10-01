import { test, expect } from '@playwright/test';
import { setupTest, removeWebpackOverlay } from '../test-helpers';

test.describe('Rounds Game Setup', () => {
  test('should allow setting up a rounds game with default settings', async ({ page }) => {
    await setupTest(page, {
      players: ['Player 1', 'Player 2'],
      gameMode: 'rounds',
      totalRounds: 10
    });
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Check initial state
    await expect(page.getByText('Dart Score Manager')).toBeVisible();
    
    // Verify game started with correct settings
    await expect(page.locator('.player-card').first().getByText('Player 1')).toBeVisible();
    await expect(page.locator('.player-card').first().locator('.player-score').getByText('0')).toBeVisible(); // Total score starts at 0
    await expect(page.getByText(/Rounds \(1\/10\)/)).toBeVisible(); // Round indicator
  });

  test('should allow setting up a rounds game with custom total rounds', async ({ page }) => {
    await setupTest(page, {
      players: ['Alice', 'Bob', 'Charlie'],
      gameMode: 'rounds',
      totalRounds: 5
    });
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Verify game started with correct settings
    await expect(page.locator('.player-card').first().getByText('Alice')).toBeVisible();
    await expect(page.locator('.player-card').first().locator('.player-score').getByText('0')).toBeVisible(); // Total score starts at 0
    await expect(page.getByText(/Rounds \(1\/5\)/)).toBeVisible(); // Round indicator with custom total
  });

  test('should validate total rounds input limits', async ({ page }) => {
    // Start fresh to test validation
    await setupTest(page, {
      players: ['Player 1', 'Player 2'],
      gameMode: 'rounds'
    });
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Go back to setup to test validation
    await page.getByRole('button', { name: 'Back to Setup' }).click();
    await page.waitForSelector('input[placeholder="Player 1 name"]', { timeout: 10000 });
    
    // Select rounds mode
    await page.locator('button').filter({ hasText: 'Highest Score (N Rounds)' }).click();
    
    // Test minimum value (1)
    const roundsInput = page.locator('input[type="number"][min="1"][max="50"]');
    await roundsInput.fill('0');
    await roundsInput.blur();
    // Should revert to 1 or show validation error
    const inputValue = await roundsInput.inputValue();
    expect(parseInt(inputValue)).toBeGreaterThanOrEqual(1);
    
    // Test maximum value (50)
    await roundsInput.fill('51');
    await roundsInput.blur();
    // Should revert to 50 or show validation error
    const maxInputValue = await roundsInput.inputValue();
    expect(parseInt(maxInputValue)).toBeLessThanOrEqual(50);
  });

  test('should display rounds mode indicator correctly', async ({ page }) => {
    await setupTest(page, {
      players: ['Alice', 'Bob'],
      gameMode: 'rounds',
      totalRounds: 3
    });
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Verify rounds mode indicator is visible
    await expect(page.getByText(/Rounds \(1\/3\)/)).toBeVisible();
    
    // Submit a score to advance to next round
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    await scoreInput.fill('100');
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Wait for next player
    await page.waitForSelector('.player-card:nth-child(2).current-player', { timeout: 5000 });
    
    // Submit another score
    await scoreInput.fill('80');
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // After both players submit scores, should advance to round 2
    await expect(page.getByText(/Rounds \(2\/3\)/)).toBeVisible();
  });
});
