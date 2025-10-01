import { test, expect } from '@playwright/test';
import { setupTest, removeWebpackOverlay, createTestHelper } from '../test-helpers';

test.describe('Full Rounds Game - 4 Players', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page, {
      players: ['Alice', 'Bob', 'Charlie', 'Diana'],
      gameMode: 'rounds',
      totalRounds: 5
    });
  });

  test('should complete a full rounds game with multiple players', async ({ page }) => {
    const helper = createTestHelper(page);
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Verify initial setup
    await expect(page.locator('.player-card').first().getByText('Alice')).toBeVisible();
    await expect(page.getByText(/Rounds \(1\/5\)/)).toBeVisible();
    
    // All players start with 0 total score
    await helper.expectPlayerTotalScore('Alice', 0);
    await helper.expectPlayerTotalScore('Bob', 0);
    await helper.expectPlayerTotalScore('Charlie', 0);
    await helper.expectPlayerTotalScore('Diana', 0);
    
    // Round 1: All players play
    await helper.submitScoreForPlayer('Alice', 100);
    await helper.submitScoreForPlayer('Bob', 80);
    await helper.submitScoreForPlayer('Charlie', 90);
    await helper.submitScoreForPlayer('Diana', 85);
    
    // Verify round 1 scores
    await helper.expectPlayerTotalScore('Alice', 100);
    await helper.expectPlayerTotalScore('Bob', 80);
    await helper.expectPlayerTotalScore('Charlie', 90);
    await helper.expectPlayerTotalScore('Diana', 85);
    await expect(page.getByText(/Rounds \(2\/5\)/)).toBeVisible();
    
    // Round 2: All players play
    await helper.submitScoreForPlayer('Alice', 110);
    await helper.submitScoreForPlayer('Bob', 70);
    await helper.submitScoreForPlayer('Charlie', 95);
    await helper.submitScoreForPlayer('Diana', 75);
    
    // Verify round 2 scores
    await helper.expectPlayerTotalScore('Alice', 210);
    await helper.expectPlayerTotalScore('Bob', 150);
    await helper.expectPlayerTotalScore('Charlie', 185);
    await helper.expectPlayerTotalScore('Diana', 160);
    await expect(page.getByText(/Rounds \(3\/5\)/)).toBeVisible();
    
    // Round 3: All players play
    await helper.submitScoreForPlayer('Alice', 95);
    await helper.submitScoreForPlayer('Bob', 85);
    await helper.submitScoreForPlayer('Charlie', 100);
    await helper.submitScoreForPlayer('Diana', 90);
    
    // Verify round 3 scores
    await helper.expectPlayerTotalScore('Alice', 305);
    await helper.expectPlayerTotalScore('Bob', 235);
    await helper.expectPlayerTotalScore('Charlie', 285);
    await helper.expectPlayerTotalScore('Diana', 250);
    await expect(page.getByText(/Rounds \(4\/5\)/)).toBeVisible();
    
    // Round 4: All players play
    await helper.submitScoreForPlayer('Alice', 105);
    await helper.submitScoreForPlayer('Bob', 90);
    await helper.submitScoreForPlayer('Charlie', 85);
    await helper.submitScoreForPlayer('Diana', 95);
    
    // Verify round 4 scores
    await helper.expectPlayerTotalScore('Alice', 410);
    await helper.expectPlayerTotalScore('Bob', 325);
    await helper.expectPlayerTotalScore('Charlie', 370);
    await helper.expectPlayerTotalScore('Diana', 345);
    await expect(page.getByText(/Rounds \(5\/5\)/)).toBeVisible();
    
    // Round 5: Final round
    await helper.submitScoreForPlayer('Alice', 120);
    await helper.submitScoreForPlayer('Bob', 100);
    await helper.submitScoreForPlayer('Charlie', 110);
    await helper.submitScoreForPlayer('Diana', 105);
    
    // Verify final scores
    await helper.expectPlayerTotalScore('Alice', 530);
    await helper.expectPlayerTotalScore('Bob', 425);
    await helper.expectPlayerTotalScore('Charlie', 480);
    await helper.expectPlayerTotalScore('Diana', 450);
    
    // Game should be finished
    await expect(page.getByText('Final Scores & Rankings')).toBeVisible();
    
    // Alice should be the winner
    await expect(page.locator('.player-card.winner').getByText('Alice')).toBeVisible();
  });

  test('should handle game reset correctly', async ({ page }) => {
    const helper = createTestHelper(page);
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Play through some rounds
    await helper.submitScoreForPlayer('Alice', 100);
    await helper.submitScoreForPlayer('Bob', 80);
    await helper.submitScoreForPlayer('Charlie', 90);
    await helper.submitScoreForPlayer('Diana', 85);
    
    // Verify scores are accumulated
    await helper.expectPlayerTotalScore('Alice', 100);
    await helper.expectPlayerTotalScore('Bob', 80);
    await helper.expectPlayerTotalScore('Charlie', 90);
    await helper.expectPlayerTotalScore('Diana', 85);
    
    // Reset the game
    await helper.resetGame();
    
    // All scores should be reset to 0
    await helper.expectPlayerTotalScore('Alice', 0);
    await helper.expectPlayerTotalScore('Bob', 0);
    await helper.expectPlayerTotalScore('Charlie', 0);
    await helper.expectPlayerTotalScore('Diana', 0);
    
    // Should be back to round 1
    await expect(page.getByText(/Rounds \(1\/5\)/)).toBeVisible();
    
    // Should be Alice's turn
    await expect(page.locator('.player-card.current-player').getByText('Alice')).toBeVisible();
  });

  test('should handle new game correctly', async ({ page }) => {
    const helper = createTestHelper(page);
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Play through some rounds
    await helper.submitScoreForPlayer('Alice', 100);
    await helper.submitScoreForPlayer('Bob', 80);
    
    // Go to new game
    await helper.goToSetup();
    
    // Should be back to setup screen
    await expect(page.getByText('Player 1 name')).toBeVisible();
    await expect(page.getByText('Player 2 name')).toBeVisible();
    
    // Set up a new game with different settings
    await helper.setupGame({
      players: ['Eve', 'Frank'],
      gameMode: 'rounds',
      totalRounds: 3
    });
    
    // Verify new game started
    await expect(page.locator('.player-card').first().getByText('Eve')).toBeVisible();
    await expect(page.locator('.player-card').nth(1).getByText('Frank')).toBeVisible();
    await expect(page.getByText('Rounds (1/3)')).toBeVisible();
    
    // All scores should start at 0
    await helper.expectPlayerTotalScore('Eve', 0);
    await helper.expectPlayerTotalScore('Frank', 0);
  });

  test('should display correct winner announcement', async ({ page }) => {
    const helper = createTestHelper(page);
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Play through all rounds with Charlie winning
    // Round 1
    await helper.submitScoreForPlayer('Alice', 80);
    await helper.submitScoreForPlayer('Bob', 70);
    await helper.submitScoreForPlayer('Charlie', 100);
    await helper.submitScoreForPlayer('Diana', 75);
    
    // Round 2
    await helper.submitScoreForPlayer('Alice', 85);
    await helper.submitScoreForPlayer('Bob', 75);
    await helper.submitScoreForPlayer('Charlie', 95);
    await helper.submitScoreForPlayer('Diana', 80);
    
    // Round 3
    await helper.submitScoreForPlayer('Alice', 90);
    await helper.submitScoreForPlayer('Bob', 80);
    await helper.submitScoreForPlayer('Charlie', 110);
    await helper.submitScoreForPlayer('Diana', 85);
    
    // Round 4
    await helper.submitScoreForPlayer('Alice', 95);
    await helper.submitScoreForPlayer('Bob', 85);
    await helper.submitScoreForPlayer('Charlie', 105);
    await helper.submitScoreForPlayer('Diana', 90);
    
    // Round 5
    await helper.submitScoreForPlayer('Alice', 100);
    await helper.submitScoreForPlayer('Bob', 90);
    await helper.submitScoreForPlayer('Charlie', 120);
    await helper.submitScoreForPlayer('Diana', 95);
    
    // Verify final scores
    await helper.expectPlayerTotalScore('Alice', 450);
    await helper.expectPlayerTotalScore('Bob', 400);
    await helper.expectPlayerTotalScore('Charlie', 530);
    await helper.expectPlayerTotalScore('Diana', 425);
    
    // Game should be finished
    await expect(page.getByText('Final Scores & Rankings')).toBeVisible();
    
    // Charlie should be the winner
    await expect(page.locator('.player-card.winner').getByText('Charlie')).toBeVisible();
    
    // Verify winner announcement
    await expect(page.getByText('🎉 Charlie wins! 🎉')).toBeVisible();
  });

  test('should handle edge case with minimum rounds', async ({ page }) => {
    // Set up a new game with minimum rounds
    await page.getByRole('button', { name: 'Back to Setup' }).click();
    await page.waitForSelector('input[placeholder="Player 1 name"]', { timeout: 10000 });
    
    const helper = createTestHelper(page);
    await helper.setupGame({
      players: ['Alice', 'Bob'],
      gameMode: 'rounds',
      totalRounds: 1
    });
    
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Verify initial state
    await expect(page.getByText('Rounds (1/1)')).toBeVisible();
    
    // Play the only round
    await helper.submitScoreForPlayer('Alice', 100);
    await helper.submitScoreForPlayer('Bob', 80);
    
    // Game should be finished immediately
    await expect(page.getByText('Final Scores & Rankings')).toBeVisible();
    await helper.expectPlayerTotalScore('Alice', 100);
    await helper.expectPlayerTotalScore('Bob', 80);
    
    // Alice should be the winner
    await expect(page.locator('.player-card.winner').getByText('Alice')).toBeVisible();
  });
});
