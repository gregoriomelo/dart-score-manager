import { test, expect } from '@playwright/test';
import { setupTest, removeWebpackOverlay } from './test-helpers';

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

  test('should allow setting up a game with more than 2 players', async ({ page }) => {
    await setupTest(page, {
      players: ['Alice', 'Bob', 'Charlie'],
      gameMode: 'countdown',
      startingScore: 501
    });
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Verify all players are present
    await expect(page.locator('.player-card')).toHaveCount(3);
    await expect(page.locator('.player-card').first()).toContainText('Alice');
    await expect(page.locator('.player-card').nth(1)).toContainText('Bob');
    await expect(page.locator('.player-card').nth(2)).toContainText('Charlie');
  });

  test('should allow navigation between steps', async ({ page }) => {
    await setupTest(page);
    
    // Start on players step
    await expect(page.locator('.step-players')).toBeVisible();
    
    // Fill in player names to enable continue button
    await page.locator('#player-0').type('Alice');
    await page.locator('#player-1').type('Bob');
    
    // Go to game mode step
    await page.getByRole('button', { name: 'Continue →' }).click();
    await expect(page.locator('.step-game-mode')).toBeVisible();
    
    // Go back to players step
    await page.getByRole('button', { name: '← Back' }).click();
    await expect(page.locator('.step-players')).toBeVisible();
    
    // Go forward again
    await page.getByRole('button', { name: 'Continue →' }).click();
    await expect(page.locator('.step-game-mode')).toBeVisible();
    
    // Select countdown mode and continue
    await page.locator('.game-mode-button.countdown').click();
    await page.getByRole('button', { name: 'Continue →' }).click();
    await expect(page.locator('.step-configuration')).toBeVisible();
    
    // Go back to game mode
    await page.getByRole('button', { name: '← Back' }).click();
    await expect(page.locator('.step-game-mode')).toBeVisible();
    
    // Select high-low mode and continue
    await page.locator('.game-mode-button.high-low').click();
    await page.getByRole('button', { name: 'Continue →' }).click();
    await expect(page.locator('.step-configuration')).toBeVisible();
  });

  test('should allow resetting the setup', async ({ page }) => {
    await setupTest(page);
    
    // Fill in player names to enable continue button
    await page.locator('#player-0').type('Alice');
    await page.locator('#player-1').type('Bob');
    
    // Go to game mode step
    await page.getByRole('button', { name: 'Continue →' }).click();
    await expect(page.locator('.step-game-mode')).toBeVisible();
    
    // Reset the setup
    await page.getByRole('button', { name: 'Reset' }).click();
    
    // Should be back on players step with empty values
    await expect(page.locator('.step-players')).toBeVisible();
    await expect(page.locator('#player-0')).toHaveValue('');
    await expect(page.locator('#player-1')).toHaveValue('');
  });

  test('should show correct configuration options based on game mode', async ({ page }) => {
    await setupTest(page);
    
    // Fill in player names to enable continue button
    await page.locator('#player-0').type('Alice');
    await page.locator('#player-1').type('Bob');
    
    // Go to game mode step
    await page.getByRole('button', { name: 'Continue →' }).click();
    
    // Select countdown mode and continue
    await page.locator('.game-mode-button.countdown').click();
    await page.getByRole('button', { name: 'Continue →' }).click();
    
    // Should show score configuration
    await expect(page.locator('.step-configuration')).toBeVisible();
    await expect(page.locator('.configuration-section')).toContainText('Target Score');
    await expect(page.locator('#starting-score')).toBeVisible();
    
    // Go back and select high-low mode
    await page.getByRole('button', { name: '← Back' }).click();
    await page.locator('.game-mode-button.high-low').click();
    await page.getByRole('button', { name: 'Continue →' }).click();
    
    // Should show lives configuration
    await expect(page.locator('.step-configuration')).toBeVisible();
    await expect(page.locator('.configuration-section')).toContainText('Starting Lives');
    await expect(page.locator('#starting-lives')).toBeVisible();
  });

  test('should allow using preset values', async ({ page }) => {
    await setupTest(page);
    
    // Fill in player names to enable continue button
    await page.locator('#player-0').type('Alice');
    await page.locator('#player-1').type('Bob');
    
    // Complete setup to configuration step
    await page.getByRole('button', { name: 'Continue →' }).click();
    await page.locator('.game-mode-button.countdown').click();
    await page.getByRole('button', { name: 'Continue →' }).click();
    
    // Test preset buttons
    await page.locator('.preset-button').filter({ hasText: '301' }).click();
    await expect(page.locator('#starting-score')).toHaveValue('301');
    
    await page.locator('.preset-button').filter({ hasText: '501' }).click();
    await expect(page.locator('#starting-score')).toHaveValue('501');
    
    await page.locator('.preset-button').filter({ hasText: '701' }).click();
    await expect(page.locator('#starting-score')).toHaveValue('701');
  });

  test('should show correct summary in review step', async ({ page }) => {
    await setupTest(page);
    
    // Fill in player names to enable continue button
    await page.locator('#player-0').type('Alice');
    await page.locator('#player-1').type('Bob');
    
    // Complete full setup
    await page.getByRole('button', { name: 'Continue →' }).click();
    await page.locator('.game-mode-button.countdown').click();
    await page.getByRole('button', { name: 'Continue →' }).click();
    await page.locator('.preset-button').filter({ hasText: '301' }).click();
    await page.getByRole('button', { name: 'Continue →' }).click();
    
    // Verify review step shows correct information
    await expect(page.locator('.step-review')).toBeVisible();
    await expect(page.locator('.player-item').first()).toContainText('Alice');
    await expect(page.locator('.player-item').nth(1)).toContainText('Bob');
    await expect(page.locator('.mode-name')).toContainText('Countdown');
    await expect(page.locator('.setting-value')).toContainText('301');
  });

  test('should have large, touch-friendly buttons', async ({ page }) => {
    await setupTest(page);
    
    // Check that buttons have minimum dimensions for mobile
    const continueButton = page.getByRole('button', { name: 'Continue →' });
    await expect(continueButton).toBeVisible();
    
    // Verify button has minimum dimensions (should be enforced by CSS)
    const buttonBox = await continueButton.boundingBox();
    expect(buttonBox?.width).toBeGreaterThanOrEqual(120);
    expect(buttonBox?.height).toBeGreaterThanOrEqual(56);
  });
});
