import { test, expect } from '@playwright/test';

test.describe('Game Setup', () => {
  test('should allow setting up a countdown game with custom settings', async ({ page }) => {
    await page.goto('/');
    
    // Check initial state
    await expect(page.getByText('Dart Score')).toBeVisible();
    
    // Add players
    await page.getByPlaceholder('Player 1 name').fill('Player 1');
    await page.getByPlaceholder('Player 2 name').fill('Player 2');
    
    // Set custom starting score
    await page.getByPlaceholder('501').fill('301');
    
    // Start the game
    await page.getByRole('button', { name: 'Start Game' }).click();
    
    // Verify game started with correct settings
    await expect(page.locator('.player-card').first().getByText('Player 1')).toBeVisible();
    await expect(page.locator('.player-card').first().getByText('301')).toBeVisible();
  });

  test('should allow setting up a high-low game', async ({ page }) => {
    await page.goto('/');
    
    // Add players
    await page.getByPlaceholder('Player 1 name').fill('Player 1');
    await page.getByPlaceholder('Player 2 name').fill('Player 2');
    
    // Select High-Low mode
    await page.locator('.game-mode-select').selectOption('high-low');
    
    // Set custom lives
    await page.getByPlaceholder('5').fill('3');
    
    // Start the game
    await page.getByRole('button', { name: 'Start Game' }).click();
    
    // Verify high-low game started
    await expect(page.getByText('High-Low Challenge')).toBeVisible();
    await expect(page.locator('.player-card').first().getByText('Lives: 3')).toBeVisible();
  });
});
