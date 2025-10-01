import { test, expect } from '@playwright/test';
import { setupTest, removeWebpackOverlay, createTestHelper } from '../test-helpers';

test.describe('Rounds Undo Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page, {
      players: ['Alice', 'Bob'],
      gameMode: 'rounds',
      totalRounds: 3
    });
  });

  test('should undo last score correctly', async ({ page }) => {
    const helper = createTestHelper(page);
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Submit some scores
    await helper.submitScoreForPlayer('Alice', 100);
    await helper.submitScoreForPlayer('Bob', 80);
    await helper.submitScoreForPlayer('Alice', 90);
    
    // Verify current state
    await helper.expectPlayerTotalScore('Alice', 190);
    await helper.expectPlayerTotalScore('Bob', 80);
    
    // Open all players history
    await helper.openAllPlayersHistory();
    
    // Undo the last move (Alice's 90)
    await page.getByRole('button', { name: 'Undo Last Move' }).click();
    
    // Modal should close automatically
    await expect(page.getByText('📊 All History')).not.toBeVisible();
    
    // Verify Alice's score was reverted
    await helper.expectPlayerTotalScore('Alice', 100);
    await helper.expectPlayerTotalScore('Bob', 80);
    
    // Should be Alice's turn again
    await expect(page.locator('.player-card.current-player').getByText('Alice')).toBeVisible();
  });

  test('should undo multiple moves correctly', async ({ page }) => {
    const helper = createTestHelper(page);
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Submit several scores
    await helper.submitScoreForPlayer('Alice', 100);
    await helper.submitScoreForPlayer('Bob', 80);
    await helper.submitScoreForPlayer('Alice', 90);
    await helper.submitScoreForPlayer('Bob', 70);
    
    // Verify current state
    await helper.expectPlayerTotalScore('Alice', 190);
    await helper.expectPlayerTotalScore('Bob', 150);
    
    // Undo Bob's last score (70)
    await helper.openAllPlayersHistory();
    await page.getByRole('button', { name: 'Undo Last Move' }).click();
    
    await helper.expectPlayerTotalScore('Alice', 190);
    await helper.expectPlayerTotalScore('Bob', 80);
    await expect(page.locator('.player-card.current-player').getByText('Bob')).toBeVisible();
    
    // Undo Alice's score (90)
    await helper.openAllPlayersHistory();
    await page.getByRole('button', { name: 'Undo Last Move' }).click();
    
    await helper.expectPlayerTotalScore('Alice', 100);
    await helper.expectPlayerTotalScore('Bob', 80);
    await expect(page.locator('.player-card.current-player').getByText('Alice')).toBeVisible();
    
    // Undo Bob's score (80)
    await helper.openAllPlayersHistory();
    await page.getByRole('button', { name: 'Undo Last Move' }).click();
    
    await helper.expectPlayerTotalScore('Alice', 100);
    await helper.expectPlayerTotalScore('Bob', 0);
    await expect(page.locator('.player-card.current-player').getByText('Bob')).toBeVisible();
    
    // Undo Alice's first score (100)
    await helper.openAllPlayersHistory();
    await page.getByRole('button', { name: 'Undo Last Move' }).click();
    
    await helper.expectPlayerTotalScore('Alice', 0);
    await helper.expectPlayerTotalScore('Bob', 0);
    await expect(page.locator('.player-card.current-player').getByText('Alice')).toBeVisible();
  });

  test('should handle undo when no moves are available', async ({ page }) => {
    const helper = createTestHelper(page);
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Don't submit any scores yet
    await helper.openAllPlayersHistory();
    
    // Undo button should be disabled
    await expect(page.getByRole('button', { name: 'Undo Last Move' })).toBeDisabled();
    
    // Close modal
    await page.getByRole('button', { name: 'Close' }).click();
  });

  test('should handle undo after round completion', async ({ page }) => {
    const helper = createTestHelper(page);
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Complete round 1
    await helper.submitScoreForPlayer('Alice', 100);
    await helper.submitScoreForPlayer('Bob', 80);
    
    // Should be in round 2
    await expect(page.getByText('Rounds (2/3)')).toBeVisible();
    
    // Undo Bob's score
    await helper.openAllPlayersHistory();
    await page.getByRole('button', { name: 'Undo Last Move' }).click();
    
    // Should be back in round 1
    await expect(page.getByText('Rounds (1/3)')).toBeVisible();
    await helper.expectPlayerTotalScore('Alice', 100);
    await helper.expectPlayerTotalScore('Bob', 0);
    await expect(page.locator('.player-card.current-player').getByText('Bob')).toBeVisible();
  });

  test('should handle undo after game completion', async ({ page }) => {
    const helper = createTestHelper(page);
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Complete all rounds
    await helper.submitScoreForPlayer('Alice', 100);
    await helper.submitScoreForPlayer('Bob', 80);
    await helper.submitScoreForPlayer('Alice', 90);
    await helper.submitScoreForPlayer('Bob', 70);
    await helper.submitScoreForPlayer('Alice', 110);
    await helper.submitScoreForPlayer('Bob', 85);
    
    // Game should be finished
    await expect(page.getByText('Final Scores & Rankings')).toBeVisible();
    
    // Open all players history from winner announcement
    await page.getByRole('button', { name: '📊 All History' }).click();
    
    // Undo the last move (Bob's 85)
    await page.getByRole('button', { name: 'Undo Last Move' }).click();
    
    // Game should no longer be finished
    await expect(page.getByText('Final Scores & Rankings')).not.toBeVisible();
    await expect(page.getByText('Rounds (3/3)')).toBeVisible();
    
    // Bob should be the current player
    await expect(page.locator('.player-card.current-player').getByText('Bob')).toBeVisible();
    
    // Bob's score should be reverted
    await helper.expectPlayerTotalScore('Bob', 150); // 80 + 70 = 150
    await helper.expectPlayerTotalScore('Alice', 300); // 100 + 90 + 110 = 300
  });

  test('should update history correctly after undo', async ({ page }) => {
    const helper = createTestHelper(page);
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Submit some scores
    await helper.submitScoreForPlayer('Alice', 100);
    await helper.submitScoreForPlayer('Bob', 80);
    await helper.submitScoreForPlayer('Alice', 90);
    
    // Open Alice's history
    await helper.openPlayerHistory('Alice');
    
    // Verify history shows both scores
    await expect(page.getByText('100')).toBeVisible();
    await expect(page.getByText('90')).toBeVisible();
    await expect(page.getByText('Total Score: 190')).toBeVisible();
    
    // Close modal
    await page.getByRole('button', { name: 'Close' }).click();
    
    // Undo Alice's last score
    await helper.openAllPlayersHistory();
    await page.getByRole('button', { name: 'Undo Last Move' }).click();
    
    // Open Alice's history again
    await helper.openPlayerHistory('Alice');
    
    // Verify history only shows first score
    await expect(page.getByText('100')).toBeVisible();
    await expect(page.getByText('90')).not.toBeVisible();
    await expect(page.getByText('Total Score: 100')).toBeVisible();
    
    // Close modal
    await page.getByRole('button', { name: 'Close' }).click();
  });

  test('should handle undo with multiple players', async ({ page }) => {
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
    
    // Play through some scores
    await helper.submitScoreForPlayer('Alice', 100);
    await helper.submitScoreForPlayer('Bob', 80);
    await helper.submitScoreForPlayer('Charlie', 90);
    await helper.submitScoreForPlayer('Alice', 110);
    
    // Verify current state
    await helper.expectPlayerTotalScore('Alice', 210);
    await helper.expectPlayerTotalScore('Bob', 80);
    await helper.expectPlayerTotalScore('Charlie', 90);
    
    // Undo Alice's last score (110)
    await helper.openAllPlayersHistory();
    await page.getByRole('button', { name: 'Undo Last Move' }).click();
    
    // Verify state after undo
    await helper.expectPlayerTotalScore('Alice', 100);
    await helper.expectPlayerTotalScore('Bob', 80);
    await helper.expectPlayerTotalScore('Charlie', 90);
    await expect(page.locator('.player-card.current-player').getByText('Alice')).toBeVisible();
    
    // Undo Charlie's score (90)
    await helper.openAllPlayersHistory();
    await page.getByRole('button', { name: 'Undo Last Move' }).click();
    
    // Verify state after second undo
    await helper.expectPlayerTotalScore('Alice', 100);
    await helper.expectPlayerTotalScore('Bob', 80);
    await helper.expectPlayerTotalScore('Charlie', 0);
    await expect(page.locator('.player-card.current-player').getByText('Charlie')).toBeVisible();
  });
});
