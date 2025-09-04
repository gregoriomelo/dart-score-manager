import { test, expect } from '@playwright/test';
import { setupTest, removeWebpackOverlay } from './test-helpers';

test.describe('Countdown Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page, {
      players: ['Alice', 'Bob'],
      gameMode: 'countdown',
      startingScore: 501
    });
  });

  test('should allow players to submit scores and track turns', async ({ page }) => {
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Verify initial state
    await expect(page.locator('.player-card').first().getByText('Alice')).toBeVisible();
    await expect(page.locator('.player-card').first().getByText('501')).toBeVisible();
    
    // Submit a score for Alice
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    await scoreInput.fill('60');
    
    // Remove overlay before clicking
    await removeWebpackOverlay(page);
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Verify score updated
    await expect(page.locator('.player-card').first().getByText('441')).toBeVisible();
    
    // Wait for auto advance to next player
    await page.waitForSelector('.player-card:nth-child(2).current-player', { timeout: 5000 });
    
    // Verify it's Bob's turn
    await expect(page.locator('.player-card').nth(1).getByText('Bob')).toBeVisible();
    await expect(page.locator('.player-card').nth(1).getByText('501')).toBeVisible();
  });

  test('should handle invalid score input', async ({ page }) => {
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Try to submit an invalid score (over 180)
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    
    // Type "200" character by character to simulate real user behavior
    // This will trigger the input validation at each keystroke
    await scoreInput.click();
    await scoreInput.type('2'); // This should work
    await scoreInput.type('0'); // This should work  
    await scoreInput.type('0'); // This should be blocked because 200 > 180
    
    // Verify that only valid input was accepted (should be "20" not "200")
    await expect(scoreInput).toHaveValue('20');
    
    // Submit the valid score
    await removeWebpackOverlay(page);
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Verify score was updated with the valid input (501 - 20 = 481)
    await expect(page.locator('.player-card').first().getByText('481')).toBeVisible();
  });

  test('should allow valid score submission', async ({ page }) => {
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Submit a valid score
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    await scoreInput.fill('100');
    
    // Remove overlay before clicking
    await removeWebpackOverlay(page);
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Verify score updated
    await expect(page.locator('.player-card').first().getByText('401')).toBeVisible();
  });

  test('should allow game reset', async ({ page }) => {
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Submit some scores
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    await scoreInput.fill('100');
    
    // Remove overlay before clicking
    await removeWebpackOverlay(page);
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Wait for auto advance and reset the game
    await page.waitForSelector('.player-card:nth-child(2).current-player', { timeout: 5000 });
    
    // Remove overlay before clicking reset
    await removeWebpackOverlay(page);
    await page.getByRole('button', { name: 'Reset Game' }).click();
    
    // Verify scores are reset to original values
    await expect(page.locator('.player-card').first().getByText('501')).toBeVisible();
    await expect(page.locator('.player-card').first().getByText('Alice')).toBeVisible();
  });
});
