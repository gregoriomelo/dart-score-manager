import { Page, expect } from '@playwright/test';

export interface GameSetupOptions {
  players?: string[];
  gameMode?: 'countdown' | 'high-low';
  startingScore?: number;
  startingLives?: number;
}

export class TestHelper {
  constructor(private page: Page) {}

  /**
   * Remove webpack dev server overlay that interferes with tests
   */
  async removeWebpackOverlay() {
    await this.page.evaluate(() => {
      const overlay = document.getElementById('webpack-dev-server-client-overlay');
      if (overlay) {
        overlay.remove();
      }
    });
  }

  /**
   * Navigate to the app and wait for it to be ready
   */
  async navigateToApp() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Remove webpack overlay if it exists
    await this.removeWebpackOverlay();
    
    // Wait for lazy-loaded components to be ready
    await this.page.waitForSelector('input[placeholder="Player 1 name"]', { timeout: 10000 });
  }

  /**
   * Set up a game with the specified options
   */
  async setupGame(options: GameSetupOptions = {}) {
    const {
      players = ['Alice', 'Bob'],
      gameMode = 'countdown',
      startingScore = 501,
      startingLives = 5
    } = options;

    // Fill in the first 2 player names (which are always present)
    for (let i = 0; i < Math.min(2, players.length); i++) {
      const playerName = players[i];
      const placeholder = `Player ${i + 1} name`;
      
      await this.page.getByPlaceholder(placeholder).fill(playerName);
    }

    // Add more players if needed
    for (let i = 2; i < players.length; i++) {
      const addPlayerButton = this.page.locator('button').filter({ hasText: 'Add Player' });
      if (await addPlayerButton.isVisible()) {
        // Remove webpack overlay before clicking
        await this.removeWebpackOverlay();
        await addPlayerButton.click();
        await this.page.waitForSelector(`input[placeholder="Player ${i + 1} name"]`, { timeout: 5000 });
        await this.page.getByPlaceholder(`Player ${i + 1} name`).fill(players[i]);
      }
    }

    // Set game mode if high-low
    if (gameMode === 'high-low') {
      await this.page.locator('button').filter({ hasText: 'High-Low Challenge' }).click();
      
      // Set starting lives if specified
      if (startingLives !== 5) {
        const livesInput = this.page.locator('input[type="number"][min="1"][max="10"]');
        await livesInput.fill(startingLives.toString());
      }
    } else {
      // Set starting score if specified
      if (startingScore !== 501) {
        const scoreInput = this.page.getByPlaceholder('501');
        await scoreInput.fill(startingScore.toString());
      }
    }

    // Remove webpack overlay before clicking
    await this.removeWebpackOverlay();
    
    // Start the game
    await this.page.getByRole('button', { name: 'Start Game' }).click();
    
    // Wait for game to load
    await this.page.waitForSelector('.player-card', { timeout: 10000 });
  }

  /**
   * Submit a score for the current player
   */
  async submitScore(score: number) {
    const scoreInput = this.page.getByPlaceholder('Enter score (0-180)');
    await scoreInput.waitFor({ state: 'visible', timeout: 5000 });
    await scoreInput.fill(score.toString());
    
    const submitButton = this.page.getByRole('button', { name: 'Submit' });
    await submitButton.waitFor({ state: 'visible', timeout: 5000 });
    await submitButton.click();
    
    // Wait for score update
    await this.page.waitForSelector('.player-card.current-player .player-score, .player-card.current-player .score', { timeout: 5000 });
  }

  /**
   * Wait for a specific player's turn
   */
  async waitForPlayerTurn(playerName: string) {
    await this.page.waitForSelector(`.player-card.current-player:has-text("${playerName}")`, { timeout: 5000 });
  }

  /**
   * Get the current score for a player
   */
  async getPlayerScore(playerName: string): Promise<number> {
    const playerCard = this.page.locator('.player-card').filter({ hasText: playerName });
    const scoreText = await playerCard.getByText(/^\d+$/).first().textContent();
    return parseInt(scoreText || '0');
  }

  /**
   * Get the current lives for a player (high-low mode)
   */
  async getPlayerLives(playerName: string): Promise<number> {
    const playerCard = this.page.locator('.player-card').filter({ hasText: playerName });
    const livesText = await playerCard.getByText(/Lives: \d+/).textContent();
    const match = livesText?.match(/Lives: (\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Verify that a player has a specific score
   */
  async expectPlayerScore(playerName: string, expectedScore: number) {
    const actualScore = await this.getPlayerScore(playerName);
    expect(actualScore).toBe(expectedScore);
  }

  /**
   * Verify that a player has a specific number of lives
   */
  async expectPlayerLives(playerName: string, expectedLives: number) {
    const actualLives = await this.getPlayerLives(playerName);
    expect(actualLives).toBe(expectedLives);
  }

  /**
   * Reset the game
   */
  async resetGame() {
    await this.page.getByRole('button', { name: 'Reset Game' }).click();
    await this.page.waitForSelector('.player-card.current-player', { timeout: 5000 });
  }

  /**
   * Go back to setup
   */
  async goToSetup() {
    await this.page.getByRole('button', { name: 'New Game' }).click();
    await this.page.waitForSelector('input[placeholder="Player 1 name"]', { timeout: 10000 });
  }

  /**
   * Dismiss PWA install prompt if visible
   */
  async dismissPWAInstallPrompt() {
    const pwaPrompt = this.page.locator('.pwa-install-prompt');
    if (await pwaPrompt.isVisible()) {
      await pwaPrompt.locator('.pwa-install-dismiss').click();
      await expect(pwaPrompt).toBeHidden({ timeout: 1000 });
    }
  }

  /**
   * Click a button safely, dismissing PWA prompt if it interferes
   */
  async clickButtonSafely(selector: string | RegExp, options?: { timeout?: number }) {
    // First try to dismiss any PWA prompt
    await this.dismissPWAInstallPrompt();
    
    // Then click the button
    const button = typeof selector === 'string' 
      ? this.page.locator(selector)
      : this.page.getByRole('button', { name: selector });
    
    await button.click(options);
  }
}

/**
 * Create a test helper instance
 */
export function createTestHelper(page: Page): TestHelper {
  return new TestHelper(page);
}

/**
 * Common test setup for all e2e tests
 */
export async function setupTest(page: Page, options?: GameSetupOptions) {
  const helper = createTestHelper(page);
  await helper.navigateToApp();
  if (options) {
    await helper.setupGame(options);
  }
  return helper;
}

/**
 * Remove webpack overlay from page
 */
export async function removeWebpackOverlay(page: Page) {
  await page.evaluate(() => {
    const overlay = document.getElementById('webpack-dev-server-client-overlay');
    if (overlay) {
      overlay.remove();
    }
  });
}
