import { test, expect } from '@playwright/test';

test.describe('Countdown Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Set up a basic countdown game
    await page.getByPlaceholder('Player 1 name').fill('Alice');
    await page.getByPlaceholder('Player 2 name').fill('Bob');
    
    await page.getByRole('button', { name: 'Start Game' }).click();
  });

  test('should allow players to submit scores and track turns', async ({ page }) => {
    // Verify initial state
    await expect(page.locator('.player-card').first().getByText('Alice')).toBeVisible();
    await expect(page.locator('.player-card').first().getByText('501')).toBeVisible();
    
    // Submit a score for Alice
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    await scoreInput.fill('60');
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Verify score updated
    await expect(page.locator('.player-card').first().getByText('441')).toBeVisible();
    
    // Wait for auto advance to next player
    await page.waitForTimeout(600);
    
    // Verify it's Bob's turn
    await expect(page.locator('.player-card').nth(1).getByText('Bob')).toBeVisible();
    await expect(page.locator('.player-card').nth(1).getByText('501')).toBeVisible();
  });

  test('should handle invalid score input', async ({ page }) => {
    // Submit an invalid score (over 180)
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    await scoreInput.fill('200');
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Verify error message appears
    await expect(page.getByText('Please enter a valid score (0-180)')).toBeVisible();
    
    // Verify score remains unchanged
    await expect(page.locator('.player-card').first().getByText('501')).toBeVisible();
  });

  test('should allow valid score submission', async ({ page }) => {
    // Submit a valid score
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    await scoreInput.fill('100');
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Verify score updated
    await expect(page.locator('.player-card').first().getByText('401')).toBeVisible();
  });

  test('should allow game reset', async ({ page }) => {
    // Submit some scores
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    await scoreInput.fill('100');
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Wait for auto advance and reset the game
    await page.waitForTimeout(600);
    await page.getByRole('button', { name: 'Reset Game' }).click();
    
    // Verify scores are reset to original values
    await expect(page.locator('.player-card').first().getByText('501')).toBeVisible();
    await expect(page.locator('.player-card').first().getByText('Alice')).toBeVisible();
  });
});
