import { test, expect } from '@playwright/test';
import { setupTest } from './test-helpers';

test.describe('Full High-Low Game', () => {
  test.setTimeout(120000); // 2 minutes for the full game test
  test.beforeEach(async ({ page }) => {
    await setupTest(page, {
      players: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
      gameMode: 'high-low',
      startingLives: 3
    });
  });

  test('should complete a high-low game with player elimination and winner validation', async ({ page }) => {
    // Verify initial state - all 5 players visible with specific player name selectors
    await expect(page.locator('.player-card').filter({ hasText: 'Alice' })).toBeVisible();
    await expect(page.locator('.player-card').filter({ hasText: 'Bob' })).toBeVisible();
    await expect(page.locator('.player-card').filter({ hasText: 'Charlie' })).toBeVisible();
    await expect(page.locator('.player-card').filter({ hasText: 'Diana' })).toBeVisible();
    await expect(page.locator('.player-card').filter({ hasText: 'Eve' })).toBeVisible();
    await expect(page.locator('.player-card').first().getByText('Lives: 3')).toBeVisible();

    // Predictable game journey with specific player actions
    const gameJourney = [
      // Round 1 - Everyone succeeds
      { player: 'Alice', action: 'higher', target: 40, score: 55, succeeds: true },
      { player: 'Bob', action: 'higher', target: 55, score: 70, succeeds: true },
      { player: 'Charlie', action: 'lower', target: 70, score: 45, succeeds: true },
      { player: 'Diana', action: 'higher', target: 45, score: 60, succeeds: true },
      { player: 'Eve', action: 'lower', target: 60, score: 35, succeeds: true },
      
      // Round 2 - Some start failing
      { player: 'Alice', action: 'higher', target: 35, score: 50, succeeds: true },
      { player: 'Bob', action: 'lower', target: 50, score: 60, succeeds: false }, // Bob loses a life
      { player: 'Charlie', action: 'higher', target: 60, score: 75, succeeds: true },
      { player: 'Diana', action: 'lower', target: 75, score: 80, succeeds: false }, // Diana loses a life
      { player: 'Eve', action: 'higher', target: 80, score: 95, succeeds: true },
      
      // Round 3 - More failures
      { player: 'Alice', action: 'lower', target: 95, score: 100, succeeds: false }, // Alice loses a life
      { player: 'Bob', action: 'higher', target: 100, score: 90, succeeds: false }, // Bob loses second life
      { player: 'Charlie', action: 'lower', target: 90, score: 65, succeeds: true },
      { player: 'Diana', action: 'higher', target: 65, score: 55, succeeds: false }, // Diana loses second life
      { player: 'Eve', action: 'lower', target: 55, score: 30, succeeds: true },
      
      // Round 4 - Eliminations begin
      { player: 'Alice', action: 'higher', target: 30, score: 25, succeeds: false }, // Alice loses second life
      { player: 'Bob', action: 'lower', target: 25, score: 30, succeeds: false }, // Bob eliminated (3rd life lost)
      { player: 'Charlie', action: 'higher', target: 30, score: 45, succeeds: true },
      { player: 'Diana', action: 'lower', target: 45, score: 50, succeeds: false }, // Diana eliminated (3rd life lost)
      { player: 'Eve', action: 'higher', target: 50, score: 65, succeeds: true },
      
      // Round 5 - Alice eliminated; Charlie begins failing
      { player: 'Alice', action: 'lower', target: 65, score: 70, succeeds: false }, // Alice eliminated (3rd life lost)
      { player: 'Charlie', action: 'higher', target: 70, score: 60, succeeds: false }, // Charlie loses first life (now 2)
      
      // Round 6 - Drive to completion
      { player: 'Eve', action: 'higher', target: 60, score: 90, succeeds: true },
      { player: 'Charlie', action: 'higher', target: 90, score: 80, succeeds: false }, // Charlie loses second life (now 1)
      { player: 'Eve', action: 'lower', target: 80, score: 70, succeeds: true },
      { player: 'Charlie', action: 'higher', target: 70, score: 60, succeeds: false }, // Charlie eliminated (3rd life lost)
      // Eve remains as the winner
    ];

    for (let i = 0; i < gameJourney.length; i++) {
      const turn = gameJourney[i];
      
      // Wait for the game to be ready
      await expect(page.locator('.higher-btn')).toBeEnabled({ timeout: 1000 });
      
      // Verify current player
      await expect(page.locator('.player-card.current-player').filter({ hasText: turn.player })).toBeVisible();
      
      // Make the choice
      if (turn.action === 'higher') {
        await page.locator('.higher-btn').click();
        await expect(page.getByText(`${turn.player} must score higher than ${turn.target}`)).toBeVisible();
      } else {
        await page.locator('.lower-btn').click();
        await expect(page.getByText(`${turn.player} must score lower than ${turn.target}`)).toBeVisible();
      }
      
      // Submit the score
      const scoreInput = page.getByPlaceholder('Enter score (0-180)');
      await scoreInput.fill(turn.score.toString());
      await page.getByRole('button', { name: 'Submit' }).click();
    }

    // Verify game completion deterministically via lives display
    // Alice, Bob, Diana, and Charlie should be eliminated
    await expect(page.locator('.player-card').filter({ hasText: 'Alice' }).getByText('Lives: 0')).toBeVisible();
    await expect(page.locator('.player-card').filter({ hasText: 'Bob' }).getByText('Lives: 0')).toBeVisible();
    await expect(page.locator('.player-card').filter({ hasText: 'Diana' }).getByText('Lives: 0')).toBeVisible();
    await expect(page.locator('.player-card').filter({ hasText: 'Charlie' }).getByText('Lives: 0')).toBeVisible();
    // Eve should still have exactly 3 lives left
    await expect(page.locator('.player-card').filter({ hasText: 'Eve' }).getByText('Lives: 3')).toBeVisible();

    // Winner message should mention Eve
    const winnerBanner = page.locator('.winner-message, .game-finished, .winner');
    await expect(winnerBanner).toBeVisible({ timeout: 2000 });
    await expect(winnerBanner).toContainText(/Eve/i);
    
    // Test history functionality works even after game completion
    const historyBtn = page.getByRole('button', { name: /All History/ });
    if (await historyBtn.isVisible()) {
      // Click the history button
      await historyBtn.click();
      await expect(page.getByText('Game History - All Players')).toBeVisible({ timeout: 800 });
      
      // Close history and wait for it to actually close
      await page.locator('.close-button').click();
      await expect(page.getByText('Game History - All Players')).toBeHidden({ timeout: 500 });
    }
  });
});
