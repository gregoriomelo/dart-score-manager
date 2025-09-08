import { test, expect } from '@playwright/test';
import { createTestHelper } from '../test-helpers';

test.describe('Countdown Game Ranking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should not show rankings when no players have played yet', async ({ page }) => {
    const helper = createTestHelper(page);
    await helper.navigateToApp();
    
    // Setup a countdown game with 3 players
    await helper.setupGame({
      gameMode: 'countdown',
      startingScore: 501,
      players: ['Alice', 'Bob', 'Charlie']
    });

    // Check that no ranking indicators are visible
    const rankingElements = await page.locator('.player-rank').count();
    expect(rankingElements).toBe(0);

    // Verify that player scores are displayed without rankings
    await expect(page.locator('.player-name:has-text("Alice")')).toBeVisible();
    await expect(page.locator('.player-name:has-text("Bob")')).toBeVisible();
    await expect(page.locator('.player-name:has-text("Charlie")')).toBeVisible();
    
    // Check that scores are shown but no rank numbers
    await expect(page.locator('.player-score:has-text("501")')).toHaveCount(3);
    await expect(page.locator('text=#1')).not.toBeVisible();
    await expect(page.locator('text=#2')).not.toBeVisible();
    await expect(page.locator('text=#3')).not.toBeVisible();
  });

  test('should show rankings after first player plays', async ({ page }) => {
    const helper = createTestHelper(page);
    await helper.navigateToApp();
    
    // Setup a countdown game with 3 players
    await helper.setupGame({
      gameMode: 'countdown',
      startingScore: 501,
      players: ['Alice', 'Bob', 'Charlie']
    });

    // Alice plays first and scores 60
    await helper.submitScore(60);
    await helper.waitForPlayerTurn('Bob');

    // Check that Alice now has rank #1 (best score: 441)
    await expect(page.locator('.player-name:has-text("Alice")').locator('..').locator('.player-rank')).toHaveText('#1');
    
    // Bob and Charlie should not have rankings yet (haven't played)
    const bobRank = page.locator('.player-name:has-text("Bob")').locator('..').locator('.player-rank');
    const charlieRank = page.locator('.player-name:has-text("Charlie")').locator('..').locator('.player-rank');
    await expect(bobRank).not.toBeVisible();
    await expect(charlieRank).not.toBeVisible();

    // Verify Alice's score is updated
    await expect(page.locator('.player-name:has-text("Alice")').locator('..').locator('.player-score')).toHaveText('441');
  });

  test('should update rankings as more players play', async ({ page }) => {
    const helper = createTestHelper(page);
    await helper.navigateToApp();
    
    // Setup a countdown game with 3 players
    await helper.setupGame({
      gameMode: 'countdown',
      startingScore: 501,
      players: ['Alice', 'Bob', 'Charlie']
    });

    // Alice plays first and scores 60 (score: 441)
    await helper.submitScore(60);
    await helper.waitForPlayerTurn('Bob');

    // Bob plays and scores 80 (score: 421) - should be rank #1
    await helper.submitScore(80);
    await helper.waitForPlayerTurn('Charlie');

    // Check rankings
    await expect(page.locator('.player-name:has-text("Bob")').locator('..').locator('.player-rank')).toHaveText('#1');
    await expect(page.locator('.player-name:has-text("Alice")').locator('..').locator('.player-rank')).toHaveText('#2');
    
    // Charlie should not have ranking yet
    await expect(page.locator('.player-name:has-text("Charlie")').locator('..').locator('.player-rank')).not.toBeVisible();

    // Charlie plays and scores 100 (score: 401) - should be rank #1
    await helper.submitScore(100);
    await helper.waitForPlayerTurn('Alice');

    // Check updated rankings
    await expect(page.locator('.player-name:has-text("Charlie")').locator('..').locator('.player-rank')).toHaveText('#1');
    await expect(page.locator('.player-name:has-text("Bob")').locator('..').locator('.player-rank')).toHaveText('#2');
    await expect(page.locator('.player-name:has-text("Alice")').locator('..').locator('.player-rank')).toHaveText('#3');
  });

  test('should handle tied scores correctly', async ({ page }) => {
    const helper = createTestHelper(page);
    await helper.navigateToApp();
    
    // Setup a countdown game with 3 players
    await helper.setupGame({
      gameMode: 'countdown',
      startingScore: 501,
      players: ['Alice', 'Bob', 'Charlie']
    });

    // Alice plays and scores 60 (score: 441)
    await helper.submitScore(60);
    await helper.waitForPlayerTurn('Bob');

    // Bob plays and scores 60 (score: 441) - should tie with Alice
    await helper.submitScore(60);
    await helper.waitForPlayerTurn('Charlie');

    // Both Alice and Bob should have rank #1 (tied)
    await expect(page.locator('.player-name:has-text("Alice")').locator('..').locator('.player-rank')).toHaveText('#1');
    await expect(page.locator('.player-name:has-text("Bob")').locator('..').locator('.player-rank')).toHaveText('#1');
    
    // Charlie should not have ranking yet
    await expect(page.locator('.player-name:has-text("Charlie")').locator('..').locator('.player-rank')).not.toBeVisible();

    // Charlie plays and scores 50 (score: 451) - should be rank #3
    await helper.submitScore(50);
    await helper.waitForPlayerTurn('Alice');

    // Check final rankings
    await expect(page.locator('.player-name:has-text("Alice")').locator('..').locator('.player-rank')).toHaveText('#1');
    await expect(page.locator('.player-name:has-text("Bob")').locator('..').locator('.player-rank')).toHaveText('#1');
    await expect(page.locator('.player-name:has-text("Charlie")').locator('..').locator('.player-rank')).toHaveText('#3');
  });

  test('should update rankings when scores change', async ({ page }) => {
    const helper = createTestHelper(page);
    await helper.navigateToApp();
    
    // Setup a countdown game with 2 players
    await helper.setupGame({
      gameMode: 'countdown',
      startingScore: 501,
      players: ['Alice', 'Bob']
    });

    // Alice plays and scores 60 (score: 441)
    await helper.submitScore(60);
    await helper.waitForPlayerTurn('Bob');

    // Bob plays and scores 80 (score: 421) - should be rank #1
    await helper.submitScore(80);
    await helper.waitForPlayerTurn('Alice');

    // Check initial rankings
    await expect(page.locator('.player-name:has-text("Bob")').locator('..').locator('.player-rank')).toHaveText('#1');
    await expect(page.locator('.player-name:has-text("Alice")').locator('..').locator('.player-rank')).toHaveText('#2');

    // Alice plays again and scores 20 (score: 421) - should tie with Bob
    await helper.submitScore(20);
    await helper.waitForPlayerTurn('Bob');

    // Both should now have rank #1
    await expect(page.locator('.player-name:has-text("Alice")').locator('..').locator('.player-rank')).toHaveText('#1');
    await expect(page.locator('.player-name:has-text("Bob")').locator('..').locator('.player-rank')).toHaveText('#1');
  });

  test('should not show rankings in high-low mode', async ({ page }) => {
    const helper = createTestHelper(page);
    await helper.navigateToApp();
    
    // Setup a high-low game with 2 players
    await helper.setupGame({
      gameMode: 'high-low',
      startingLives: 5,
      players: ['Alice', 'Bob']
    });

    // Set a challenge
    await page.locator('.higher-btn').click();

    // Alice plays and scores 60
    await helper.submitScore(60);
    await helper.waitForPlayerTurn('Bob');

    // Check that no ranking indicators are visible in high-low mode
    const rankingElements = await page.locator('.player-rank').count();
    expect(rankingElements).toBe(0);

    // Verify that lives are displayed instead of scores
    await expect(page.locator('.player-name:has-text("Alice")').locator('..').locator('.player-lives')).toBeVisible();
    await expect(page.locator('.player-name:has-text("Bob")').locator('..').locator('.player-lives')).toBeVisible();
  });

  test('should maintain rankings after game reset', async ({ page }) => {
    const helper = createTestHelper(page);
    await helper.navigateToApp();
    
    // Setup a countdown game with 2 players
    await helper.setupGame({
      gameMode: 'countdown',
      startingScore: 501,
      players: ['Alice', 'Bob']
    });

    // Both players play
    await helper.submitScore(60); // Alice: 441
    await helper.waitForPlayerTurn('Bob');
    await helper.submitScore(80); // Bob: 421 (rank #1)
    await helper.waitForPlayerTurn('Alice');

    // Check rankings
    await expect(page.locator('.player-name:has-text("Bob")').locator('..').locator('.player-rank')).toHaveText('#1');
    await expect(page.locator('.player-name:has-text("Alice")').locator('..').locator('.player-rank')).toHaveText('#2');

    // Reset the game
    await helper.resetGame();

    // Rankings should be cleared after reset
    const rankingElements = await page.locator('.player-rank').count();
    expect(rankingElements).toBe(0);

    // Scores should be back to starting values
    await expect(page.locator('.player-score:has-text("501")')).toHaveCount(2);
  });
});