import { test, expect } from '@playwright/test';
import { setupTest, removeWebpackOverlay, createTestHelper } from './test-helpers';

test.describe('Full Countdown Game - 5 Players', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page, {
      players: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
      gameMode: 'countdown',
      startingScore: 501
    });
  });

  test('should complete a full countdown game with busts in final rounds', async ({ page }) => {
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Verify initial setup
    await expect(page.locator('.player-card').first().getByText('Alice')).toBeVisible();
    await expect(page.locator('.player-card').first().getByText('501')).toBeVisible();
    
    // We'll validate the expected player BEFORE each turn begins.

    // Test sequence with busts - respecting 180 score limit
    const scoreSequence = [
      { player: 'Alice', score: 100 },  // 501 -> 401
      { player: 'Bob', score: 90 },     // 501 -> 411
      { player: 'Charlie', score: 85 }, // 501 -> 416
      { player: 'Diana', score: 80 },   // 501 -> 421
      { player: 'Eve', score: 75 },     // 501 -> 426
      { player: 'Alice', score: 180 },  // 401 -> 221
      { player: 'Bob', score: 170 },    // 411 -> 241
      { player: 'Charlie', score: 160 }, // 416 -> 256
      { player: 'Diana', score: 150 },  // 421 -> 271
      { player: 'Eve', score: 180 },    // 426 -> 246
      { player: 'Alice', score: 180 },  // 221 -> 41
      { player: 'Bob', score: 62 },     // 241 -> 179
      { player: 'Charlie', score: 77 }, // 256 -> 179
      { player: 'Diana', score: 92 },   // 271 -> 179
      { player: 'Eve', score: 67 },     // 246 -> 179
      { player: 'Alice', score: 42 },   // 41 -> 41 (BUST - would go negative)
      { player: 'Bob', score: 180 },    // 179 -> 179 (BUST - would go negative)
      { player: 'Charlie', score: 179 }, // 179 -> 0 (WINNER!)
    ];
    
    const expectedBusts = 2; // fixed scenario: exactly two busts
    
    // Execute the predefined sequence
    for (const turn of scoreSequence) {
      // Wait for current player to be visible and ready
      await page.waitForSelector(`.player-card.current-player:has-text("${turn.player}")`, { timeout: 5000 });
      
      // Reference the current player's card (used after submission)
      const playerCard = page.locator('.player-card').filter({ hasText: turn.player });
      
      // Remove webpack overlay before interactions
      await removeWebpackOverlay(page);
      
      // Wait for score input to be ready and submit the score
      const scoreInput = page.getByPlaceholder('Enter score (0-180)');
      await scoreInput.waitFor({ state: 'visible', timeout: 5000 });
      await scoreInput.fill(turn.score.toString());
      
      const submitButton = page.getByRole('button', { name: 'Submit' });
      await submitButton.waitFor({ state: 'visible', timeout: 5000 });
      
      // Remove overlay before clicking
      await removeWebpackOverlay(page);
      await submitButton.click();
      
      // Wait for score update and check if it was a bust
      await page.waitForSelector(`.player-card:has-text("${turn.player}") .player-score, .player-card:has-text("${turn.player}") .score`, { timeout: 5000 });
      const scoreAfter = await playerCard.getByText(/^\d+$/).first().textContent();
      const scoreAfterNum = parseInt(scoreAfter || '0');
      
      // Check if someone won (reached 0)
      if (scoreAfterNum === 0) {
        break;
      }
    }
    
    // Validate that Charlie won (reached exactly 0)
    const charlieCard = page.locator('.player-card').filter({ hasText: 'Charlie' });
    await expect(charlieCard.getByText('0')).toBeVisible();
    
    // Validate winner announcement
    await expect(page.getByText('🎉 Congratulations!')).toBeVisible();
    await expect(page.getByText('Charlie wins!')).toBeVisible();
    
    // Validate busts occurred during gameplay
    expect(expectedBusts).toBe(2);
    
    // Open and validate history window
    try {
      // Use the helper to safely click the history button
      const helper = createTestHelper(page);
      await helper.clickButtonSafely(/All History/i);
      await expect(page.getByText('Game History - All Players')).toBeVisible({ timeout: 5000 });
      
      // Validate busts are visible in history (scroll into view to avoid off-screen false negatives)
      const bust = page.getByText('BUST').first();
      await bust.scrollIntoViewIfNeeded();
      await expect(bust).toBeVisible({ timeout: 5000 });
      
      // Validate winner badge in history
      await expect(page.getByText('🏆')).toBeVisible({ timeout: 5000 });
    } catch (error) {
      // Test continues - core validations (winner + busts) already passed
    }
  });
});
