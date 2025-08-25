import { test, expect } from '@playwright/test';

test.describe('Full High-Low Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Set up a high-low game exactly like the working test
    await page.getByPlaceholder('Player 1 name').fill('Alice');
    await page.getByPlaceholder('Player 2 name').fill('Bob');
    
    // Select High-Low mode
    await page.locator('.game-mode-select').selectOption('high-low');
    
    // Set 3 lives for elimination
    await page.getByPlaceholder('5').fill('3');
    
    await page.getByRole('button', { name: 'Start Game' }).click();
  });

  test('should complete a high-low game with player elimination and winner validation', async ({ page }) => {
    // Verify initial state
    await expect(page.getByText('Alice')).toBeVisible();
    await expect(page.locator('.player-card').first().getByText('Lives: 3')).toBeVisible();
    
    // Alice's turn - eliminate her with 3 failing challenges
    for (let i = 3; i > 0; i--) {
      await page.locator('.higher-btn').click();
      await expect(page.getByText('Alice must score higher than')).toBeVisible();
      
      const scoreInput = page.getByPlaceholder('Enter score (0-180)');
      await scoreInput.fill('35'); // This will fail the "higher than 40" challenge
      await page.getByRole('button', { name: 'Submit' }).click();
      
      // Verify life lost (skip check when eliminated)
      if (i - 1 > 0) {
        await page.waitForTimeout(500); // Brief wait for Firefox
        await expect(page.locator('.player-card').first().getByText(`Lives: ${i - 1}`)).toBeVisible({ timeout: 8000 });
      }
      
      if (i > 1) {
        // Bob's turn - he succeeds to keep the game going
        // Wait for challenge form to be ready for next turn
        await expect(page.locator('.higher-btn')).toBeEnabled();
        await page.locator('.higher-btn').click();
        await page.getByPlaceholder('Enter score (0-180)').fill('100');
        await page.getByRole('button', { name: 'Submit' }).click();
        
        // Wait for next turn to be ready (challenge form available again)
        await page.waitForTimeout(500); // Brief wait for Firefox
        await expect(page.locator('.higher-btn')).toBeEnabled({ timeout: 8000 });
      }
    }
    
    // Alice is now eliminated, wait for winner announcement
    await page.waitForTimeout(800); // Firefox needs time for elimination processing
    await expect(page.getByText('🎉 Congratulations!')).toBeVisible({ timeout: 12000 });
    
    // Verify Bob wins the game
    await expect(page.getByText('🎉 Congratulations!')).toBeVisible();
    await expect(page.getByText('Bob wins!')).toBeVisible();
    
    // Verify history functionality
    await page.getByRole('button', { name: /All History/ }).click();
    await expect(page.getByText('Game History - All Players')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('🏆')).toBeVisible({ timeout: 5000 });
  });
});
