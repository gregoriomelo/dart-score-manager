import { test, expect } from '@playwright/test';
import { setupTest, removeWebpackOverlay, createTestHelper } from '../test-helpers';

test.describe('Rounds Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page, {
      players: ['Alice', 'Bob'],
      gameMode: 'rounds',
      totalRounds: 3
    });
  });

  test('should allow players to submit scores and accumulate total scores', async ({ page }) => {
    const helper = createTestHelper(page);
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Verify initial state - Alice's turn, total score 0
    await expect(page.locator('.player-card').first().getByText('Alice')).toBeVisible();
    await helper.expectPlayerTotalScore('Alice', 0);
    await expect(page.getByText(/Rounds \(1\/3\)/)).toBeVisible();
    
    // Submit a score for Alice
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    await scoreInput.fill('100');
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Verify Alice's total score updated
    await helper.expectPlayerTotalScore('Alice', 100);
    
    // Wait for auto advance to next player (Bob)
    await page.waitForSelector('.player-card:nth-child(2).current-player', { timeout: 5000 });
    
    // Submit a score for Bob
    await scoreInput.fill('80');
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Verify Bob's total score updated
    await helper.expectPlayerTotalScore('Bob', 80);
    
    // After both players have submitted scores in round 1, should advance to round 2
    await expect(page.getByText(/Rounds \(2\/3\)/)).toBeVisible();
  });

  test('should advance to next round after all players have played', async ({ page }) => {
    const helper = createTestHelper(page);
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Complete round 1: Alice and Bob both play
    await helper.submitScoreForPlayer('Alice', 100);
    await helper.submitScoreForPlayer('Bob', 80);
    
    // Should advance to round 2
    await expect(page.getByText(/Rounds \(2\/3\)/)).toBeVisible();
    
    // Complete round 2
    await helper.submitScoreForPlayer('Alice', 90);
    await helper.submitScoreForPlayer('Bob', 70);
    
    // Should advance to round 3
    await expect(page.getByText(/Rounds \(3\/3\)/)).toBeVisible();
    
    // Complete round 3
    await helper.submitScoreForPlayer('Alice', 110);
    await helper.submitScoreForPlayer('Bob', 85);
    
    // Game should be finished
    await expect(page.getByText('Final Scores & Rankings')).toBeVisible();
  });

  test('should display correct winner based on total score', async ({ page }) => {
    const helper = createTestHelper(page);
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Play through all rounds with Alice scoring higher
    // Round 1
    await helper.submitScoreForPlayer('Alice', 100);
    await helper.submitScoreForPlayer('Bob', 80);
    
    // Round 2
    await helper.submitScoreForPlayer('Alice', 90);
    await helper.submitScoreForPlayer('Bob', 70);
    
    // Round 3
    await helper.submitScoreForPlayer('Alice', 110);
    await helper.submitScoreForPlayer('Bob', 85);
    
    // Verify Alice won with total score 300 vs Bob's 235
    await expect(page.getByText('Final Scores & Rankings')).toBeVisible();
    await helper.expectPlayerTotalScore('Alice', 300);
    await helper.expectPlayerTotalScore('Bob', 235);
    
    // Alice should be marked as winner
    await expect(page.locator('.player-card.winner').getByText('Alice')).toBeVisible();
  });

  test('should handle score input validation correctly', async ({ page }) => {
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    
    // Test valid scores
    await scoreInput.fill('180');
    await expect(scoreInput).toHaveValue('180');
    
    await scoreInput.fill('0');
    await expect(scoreInput).toHaveValue('0');
    
    await scoreInput.fill('90');
    await expect(scoreInput).toHaveValue('90');
    
    // Test invalid scores (should be rejected or clamped)
    await scoreInput.fill('181');
    // The input should either be rejected or clamped to 180
    const value = await scoreInput.inputValue();
    expect(parseInt(value)).toBeLessThanOrEqual(180);
    
    await scoreInput.fill('-1');
    // The input should either be rejected or clamped to 0
    const negativeValue = await scoreInput.inputValue();
    expect(parseInt(negativeValue)).toBeGreaterThanOrEqual(0);
  });

  test('should show round information for each player', async ({ page }) => {
    const helper = createTestHelper(page);
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Submit scores and verify round info is displayed
    await helper.submitScoreForPlayer('Alice', 100);
    await helper.submitScoreForPlayer('Bob', 80);
    
    // Check that round info is visible for both players
    await expect(page.locator('.player-card').first().getByText('Round 100')).toBeVisible();
    await expect(page.locator('.player-card').nth(1).getByText('Round 80')).toBeVisible();
  });

  test('should handle multiple players correctly', async ({ page }) => {
    // Set up a new game with 3 players
    await page.getByRole('button', { name: 'Back to Setup' }).click();
    await page.waitForSelector('input[placeholder="Player 1 name"]', { timeout: 10000 });
    
    const helper = createTestHelper(page);
    await helper.setupGame({
      players: ['Alice', 'Bob', 'Charlie'],
      gameMode: 'rounds',
      totalRounds: 2
    });
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Complete round 1 with all 3 players
    await helper.submitScoreForPlayer('Alice', 100);
    await helper.submitScoreForPlayer('Bob', 80);
    await helper.submitScoreForPlayer('Charlie', 90);
    
    // Should advance to round 2
    await expect(page.getByText('Rounds (2/2)')).toBeVisible();
    
    // Complete round 2
    await helper.submitScoreForPlayer('Alice', 110);
    await helper.submitScoreForPlayer('Bob', 70);
    await helper.submitScoreForPlayer('Charlie', 85);
    
    // Game should be finished
    await expect(page.getByText('Final Scores & Rankings')).toBeVisible();
    
    // Verify final scores
    await helper.expectPlayerTotalScore('Alice', 210);
    await helper.expectPlayerTotalScore('Bob', 150);
    await helper.expectPlayerTotalScore('Charlie', 175);
  });
});
