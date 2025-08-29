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
    
    // Submit an invalid score (over 180)
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    await scoreInput.fill('200');
    
    // Remove overlay before clicking
    await removeWebpackOverlay(page);
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Verify error message appears (check the inline error message, not the notification)
    await expect(page.locator('.bust-message').filter({ hasText: 'Score cannot exceed 180' })).toBeVisible();
    
    // Verify score remains unchanged
    await expect(page.locator('.player-card').first().getByText('501')).toBeVisible();
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
