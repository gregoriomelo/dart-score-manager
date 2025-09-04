import { test, expect } from '@playwright/test';
import { setupTest, removeWebpackOverlay } from '../test-helpers';

test.describe('High-Low Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page, {
      players: ['Alice', 'Bob'],
      gameMode: 'high-low',
      startingLives: 5
    });
  });

  test('should allow setting challenges and tracking lives', async ({ page }) => {
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Verify initial state
    await expect(page.getByText('Alice')).toBeVisible();
    await expect(page.locator('.player-card').first().getByText('Lives: 5')).toBeVisible();
    
    // Set a challenge (use class selector for dynamic button text)
    await page.locator('.higher-btn').click();
    
    // Verify challenge is set
    await expect(page.getByText('Alice must score higher than')).toBeVisible();
    
    // Submit a failing score
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    await scoreInput.fill('35');
    
    // Remove overlay before clicking
    await removeWebpackOverlay(page);
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Verify life lost - be more specific with selector
    await expect(page.locator('.player-card').first().getByText('Lives: 4')).toBeVisible();
  });

  test('should handle successful challenges', async ({ page }) => {
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Set a challenge
    await page.locator('.lower-btn').click();
    
    // Submit a successful score
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    await scoreInput.fill('25');
    
    // Remove overlay before clicking
    await removeWebpackOverlay(page);
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Verify lives remain the same and wait for next turn
    await page.waitForSelector('.player-card:nth-child(2).current-player', { timeout: 5000 });
    await expect(page.locator('.player-card').first().getByText('Lives: 5')).toBeVisible();
  });

});
