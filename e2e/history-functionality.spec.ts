import { test, expect } from '@playwright/test';
import { setupTest } from './test-helpers';

test.describe('History Functionality', () => {
  test('should open and close individual player history during countdown game', async ({ page }) => {
    // Setup a countdown game using the helper
    const helper = await setupTest(page, {
      players: ['Alice', 'Bob'],
      gameMode: 'countdown',
      startingScore: 501
    });

    // Submit a score for Alice
    await helper.submitScore(50);

    // Click Alice's history button (📊)
    const aliceHistoryBtn = page.locator('.player-card').filter({ hasText: 'Alice' }).getByRole('button', { name: /📊/ });
    await aliceHistoryBtn.click();

    // Verify Alice's history modal opens
    await expect(page.getByText("Alice's Score History")).toBeVisible();
    
    // Verify the score entry is visible in the history table (using more specific selectors)
    await expect(page.locator('.score-thrown').getByText('50')).toBeVisible();
    await expect(page.locator('.previous-score').getByText('501')).toBeVisible();
    await expect(page.locator('.new-score').getByText('451')).toBeVisible();

    // Close the modal
    await page.getByRole('button', { name: '×' }).click();

    // Verify modal is closed
    await expect(page.getByText("Alice's Score History")).toBeHidden();
  });

  test('should open and close consolidated history during countdown game', async ({ page }) => {
    // Setup a countdown game using the helper
    const helper = await setupTest(page, {
      players: ['Alice', 'Bob'],
      gameMode: 'countdown',
      startingScore: 501
    });

    // Submit scores for both players
    await helper.submitScore(50);
    await helper.submitScore(60);

    // Click "All History" button
    await page.getByRole('button', { name: /All History/i }).click();

    // Verify consolidated history modal opens
    await expect(page.getByText('Game History - All Players')).toBeVisible();
    
    // Verify both players' scores are visible in the history table
    await expect(page.locator('.player-name-cell').getByText('Alice')).toBeVisible();
    await expect(page.locator('.player-name-cell').getByText('Bob')).toBeVisible();
    await expect(page.locator('.score-thrown').getByText('50')).toBeVisible();
    await expect(page.locator('.score-thrown').getByText('60')).toBeVisible();

    // Close the modal
    await page.getByRole('button', { name: '×' }).click();

    // Verify modal is closed
    await expect(page.getByText('Game History - All Players')).toBeHidden();
  });

  test('should verify history buttons are available during gameplay', async ({ page }) => {
    // Setup a countdown game using the helper
    const helper = await setupTest(page, {
      players: ['Alice', 'Bob'],
      gameMode: 'countdown',
      startingScore: 501
    });

    // Submit a score
    await helper.submitScore(50);

    // Verify that history buttons are available
    await expect(page.getByRole('button', { name: 'All History' })).toBeVisible();
    
    const aliceHistoryBtn = page.locator('.player-card').filter({ hasText: 'Alice' }).getByRole('button', { name: /📊/ });
    await expect(aliceHistoryBtn).toBeVisible();
    
    const bobHistoryBtn = page.locator('.player-card').filter({ hasText: 'Bob' }).getByRole('button', { name: /📊/ });
    await expect(bobHistoryBtn).toBeVisible();
  });
});
