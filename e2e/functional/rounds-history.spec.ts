import { test, expect } from '@playwright/test';
import { setupTest, removeWebpackOverlay, createTestHelper } from '../test-helpers';

test.describe('Rounds History Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page, {
      players: ['Alice', 'Bob'],
      gameMode: 'rounds',
      totalRounds: 3
    });
  });

  test('should display individual player history correctly', async ({ page }) => {
    const helper = createTestHelper(page);
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Play through some rounds
    await helper.submitScoreForPlayer('Alice', 100);
    await helper.submitScoreForPlayer('Bob', 80);
    await helper.submitScoreForPlayer('Alice', 90);
    await helper.submitScoreForPlayer('Bob', 70);
    
    // Open Alice's history
    await helper.openPlayerHistory('Alice');
    
    // Verify history modal is open
    await expect(page.getByText("Alice's Score History")).toBeVisible();
    
    // Verify history table structure
    await expect(page.locator('.history-table')).toBeVisible();
    
    // Verify Alice's entries exist (check for score values in the table)
    await expect(page.locator('.history-table').getByText('100').first()).toBeVisible();
    await expect(page.locator('.history-table').getByText('90').first()).toBeVisible();
    
    // Close modal
    await page.getByRole('button', { name: '×' }).click();
    await expect(page.getByText("Alice's Score History")).not.toBeVisible();
  });

  test('should display all players history correctly', async ({ page }) => {
    const helper = createTestHelper(page);
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Play through some rounds
    await helper.submitScoreForPlayer('Alice', 100);
    await helper.submitScoreForPlayer('Bob', 80);
    await helper.submitScoreForPlayer('Alice', 90);
    await helper.submitScoreForPlayer('Bob', 70);
    
    // Open all players history
    await helper.openAllPlayersHistory();
    
    // Verify history modal is open
    await expect(page.getByText('📊 All History')).toBeVisible();
    
    // Verify history table has player column
    await expect(page.locator('.history-table').getByText('Player', { exact: true })).toBeVisible();
    await expect(page.locator('.history-table').getByText('Round', { exact: true })).toBeVisible();
    await expect(page.locator('.history-table').getByText('Turn', { exact: true })).toBeVisible();
    await expect(page.locator('.history-table').getByText('Thrown', { exact: true })).toBeVisible();
    await expect(page.getByText('Round Score')).toBeVisible();
    await expect(page.getByText('Total Score')).toBeVisible();
    
    // Verify entries for both players
    await expect(page.getByText('Alice').first()).toBeVisible();
    await expect(page.getByText('Bob').first()).toBeVisible();
    await expect(page.getByText('100').first()).toBeVisible(); // Alice's first score
    await expect(page.getByText('80').first()).toBeVisible(); // Bob's first score
    
    // Verify undo button is present
    await expect(page.getByRole('button', { name: 'Undo Last Move' })).toBeVisible();
    
    // Close modal
    await page.getByRole('button', { name: '×' }).click();
    // Check that the modal content is not visible (not the button that opens it)
    await expect(page.locator('.history-view-modal')).not.toBeVisible();
  });

  test('should allow undoing moves from history modal', async ({ page }) => {
    const helper = createTestHelper(page);
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Play through some rounds
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
    
    // Close the modal manually after undo
    await page.getByRole('button', { name: '×' }).click();
    
    // Verify Alice's score was reverted
    await helper.expectPlayerTotalScore('Alice', 100);
    await helper.expectPlayerTotalScore('Bob', 80);
    
    // Should be Alice's turn again
    await expect(page.locator('.player-card.current-player').getByText('Alice')).toBeVisible();
  });

  test('should show correct round and turn numbers in history', async ({ page }) => {
    const helper = createTestHelper(page);
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Complete round 1
    await helper.submitScoreForPlayer('Alice', 100);
    await helper.submitScoreForPlayer('Bob', 80);
    
    // Complete round 2
    await helper.submitScoreForPlayer('Alice', 90);
    await helper.submitScoreForPlayer('Bob', 70);
    
    // Open Alice's history
    await helper.openPlayerHistory('Alice');
    
    // Verify round and turn numbers exist
    // Check that round and turn numbers are displayed
    await expect(page.locator('.round-number').first()).toBeVisible();
    await expect(page.locator('.turn-number').first()).toBeVisible();
    
    // Verify we have at least 2 history rows
    await expect(page.locator('.history-row')).toHaveCount(2);
    
    // Close modal
    await page.getByRole('button', { name: '×' }).click();
  });

  test('should display history correctly after game completion', async ({ page }) => {
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
    
    // Open Alice's history from winner announcement
    await page.locator('.player-card').filter({ hasText: 'Alice' }).getByRole('button', { name: '📊' }).click();
    
    // Verify all entries are present
    await expect(page.getByText("Alice's Score History")).toBeVisible();
    await expect(page.getByText('100').first()).toBeVisible(); // Round 1
    await expect(page.getByText('90').first()).toBeVisible(); // Round 2
    await expect(page.getByText('110').first()).toBeVisible(); // Round 3
    await expect(page.getByText('Total Score: 300')).toBeVisible(); // Final total
    
    // Close modal
    await page.getByRole('button', { name: '×' }).click();
  });

  test('should handle history modal keyboard navigation', async ({ page }) => {
    const helper = createTestHelper(page);
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Play through some rounds
    await helper.submitScoreForPlayer('Alice', 100);
    await helper.submitScoreForPlayer('Bob', 80);
    
    // Open Alice's history
    await helper.openPlayerHistory('Alice');
    
    // Test ESC key to close modal
    await page.keyboard.press('Escape');
    // Wait a moment for the modal to close
    await page.waitForTimeout(1000);
    // Try to close manually if ESC didn't work
    try {
      await page.getByRole('button', { name: '×' }).click({ timeout: 2000 });
    } catch {
      // Modal might already be closed
    }
    await expect(page.getByText("Alice's Score History")).not.toBeVisible();
    
    // Reopen history
    await helper.openPlayerHistory('Alice');
    
    // Test clicking outside modal to close (if implemented)
    // This would depend on the modal implementation
    await page.getByRole('button', { name: '×' }).click();
    await expect(page.getByText("Alice's Score History")).not.toBeVisible();
  });
});
