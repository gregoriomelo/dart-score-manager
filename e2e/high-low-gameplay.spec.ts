import { test, expect } from '@playwright/test';

test.describe('High-Low Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Set up a high-low game
    await page.getByPlaceholder('Player 1 name').fill('Alice');
    await page.getByPlaceholder('Player 2 name').fill('Bob');
    
    // Select High-Low mode
    await page.locator('.game-mode-select').selectOption('high-low');
    
    await page.getByRole('button', { name: 'Start Game' }).click();
  });

  test('should allow setting challenges and tracking lives', async ({ page }) => {
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
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Verify life lost - be more specific with selector
    await expect(page.locator('.player-card').first().getByText('Lives: 4')).toBeVisible();
  });

  test('should handle successful challenges', async ({ page }) => {
    // Set a challenge
    await page.locator('.lower-btn').click();
    
    // Submit a successful score
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    await scoreInput.fill('25');
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Verify lives remain the same and wait for next turn
    await page.waitForTimeout(600);
    await expect(page.locator('.player-card').first().getByText('Lives: 5')).toBeVisible();
  });

});
