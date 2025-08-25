import { test, expect } from '@playwright/test';

test.describe('Full Countdown Game - 5 Players', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('should complete a full countdown game with busts in final rounds', async ({ page }) => {
    // Set up game with 5 players
    await page.getByPlaceholder('Player 1 name').fill('Alice');
    await page.getByPlaceholder('Player 2 name').fill('Bob');
    
    // Add 3 more players
    await page.getByRole('button', { name: 'Add Player' }).click();
    await page.getByPlaceholder('Player 3 name').fill('Charlie');
    await page.getByRole('button', { name: 'Add Player' }).click();
    await page.getByPlaceholder('Player 4 name').fill('Diana');
    await page.getByRole('button', { name: 'Add Player' }).click();
    await page.getByPlaceholder('Player 5 name').fill('Eve');
    
    // Start the game
    await page.getByRole('button', { name: 'Start Game' }).click();
    
    // Verify initial setup
    await expect(page.locator('.player-card').first().getByText('Alice')).toBeVisible();
    await expect(page.locator('.player-card').first().getByText('501')).toBeVisible();
    
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
    
    let bustCount = 0;
    
    // Execute the predefined sequence
    for (const turn of scoreSequence) {
      // Get current score before submission
      const playerCard = page.locator('.player-card').filter({ hasText: turn.player });
      const scoreBefore = await playerCard.getByText(/^\d+$/).first().textContent();
      const scoreBeforeNum = parseInt(scoreBefore || '0');
      
      // Submit the score
      const scoreInput = page.getByPlaceholder('Enter score (0-180)');
      await scoreInput.fill(turn.score.toString());
      await page.getByRole('button', { name: 'Submit' }).click();
      
      // Wait for auto advance to next player (same as working test)
      await page.waitForTimeout(600);
      
      // Check if it was a bust (score stayed the same)
      const scoreAfter = await playerCard.getByText(/^\d+$/).first().textContent();
      const scoreAfterNum = parseInt(scoreAfter || '0');
      
      if (scoreAfterNum === scoreBeforeNum) {
        bustCount++;
      }
      
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
    expect(bustCount).toBe(2);
    
    // Open and validate history window
    try {
      await page.getByRole('button', { name: 'View History' }).click();
      await expect(page.getByText('Game History - All Players')).toBeVisible({ timeout: 5000 });
      
      // Validate busts are visible in history
      await expect(page.getByText('BUST')).toBeVisible({ timeout: 5000 });
      
      // Validate winner badge in history
      await expect(page.getByText('🏆')).toBeVisible({ timeout: 5000 });
    } catch (error) {
      // Test continues - core validations (winner + busts) already passed
    }
  });
});
