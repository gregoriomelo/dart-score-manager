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
    await this.page.waitForSelector('.step-players', { timeout: 10000 });
  }

  /**
   * Step 1: Set up players (reusable helper)
   */
  async setupPlayers(players: string[]) {
    // Fill in player names (inputs start empty now)
    for (let i = 0; i < Math.min(players.length, 2); i++) {
      const input = this.page.locator(`#player-${i}`);
      await input.click();
      await input.type(players[i]);
    }

    // Add more players if needed
    for (let i = 2; i < players.length; i++) {
      const addPlayerButton = this.page.locator('button').filter({ hasText: 'Add Player' });
      if (await addPlayerButton.isVisible()) {
        await addPlayerButton.click();
        await this.page.waitForSelector(`#player-${i}`, { timeout: 5000 });
        await this.page.locator(`#player-${i}`).type(players[i]);
      }
    }

    // Continue to next step
    await this.page.getByRole('button', { name: 'Continue →' }).click();
    await this.page.waitForSelector('.step-game-mode', { timeout: 5000 });
  }

  /**
   * Step 2: Select game mode (reusable helper)
   */
  async selectGameMode(gameMode: 'countdown' | 'high-low') {
    if (gameMode === 'countdown') {
      await this.page.locator('.game-mode-button.countdown').click();
    } else {
      await this.page.locator('.game-mode-button.high-low').click();
    }
    
    // Continue to next step
    await this.page.getByRole('button', { name: 'Continue →' }).click();
    await this.page.waitForSelector('.step-configuration', { timeout: 5000 });
  }

  /**
   * Step 3a: Configure countdown game (reusable helper)
   */
  async configureCountdownGame(startingScore: number) {
    if (startingScore !== 501) {
      const scoreInput = this.page.locator('#starting-score');
      await scoreInput.fill(startingScore.toString());
    }
    
    // Continue to next step
    await this.page.getByRole('button', { name: 'Continue →' }).click();
    await this.page.waitForSelector('.step-review', { timeout: 5000 });
  }

  /**
   * Step 3b: Configure high-low game (reusable helper)
   */
  async configureHighLowGame(startingLives: number) {
    if (startingLives !== 5) {
      const livesInput = this.page.locator('#starting-lives');
      await livesInput.fill(startingLives.toString());
    }
    
    // Continue to next step
    await this.page.getByRole('button', { name: 'Continue →' }).click();
    await this.page.waitForSelector('.step-review', { timeout: 5000 });
  }

  /**
   * Step 4: Review and start game (reusable helper)
   */
  async reviewAndStartGame() {
    // Start the game
    await this.page.getByRole('button', { name: 'Start Game' }).click();
  }

  /**
   * Set up a game with the specified options using the multi-step setup
   */
  async setupGame(options: GameSetupOptions = {}) {
    const {
      players = ['Alice', 'Bob'],
      gameMode = 'countdown',
      startingScore = 501,
      startingLives = 5
    } = options;

    // Step 1: Players
    await this.setupPlayers(players);
    
    // Step 2: Game Mode
    await this.selectGameMode(gameMode);
    
    // Step 3: Configuration
    if (gameMode === 'high-low') {
      await this.configureHighLowGame(startingLives);
    } else {
      await this.configureCountdownGame(startingScore);
    }
    
    // Step 4: Review and Start
    await this.reviewAndStartGame();
    
    // Wait for game to load
    await this.page.waitForSelector('.player-card', { timeout: 10000 });
  }

  /**
   * Navigate to a specific step in the setup
   */
  async goToStep(step: 'players' | 'gameMode' | 'configuration' | 'review') {
    const stepSelectors = {
      players: '.step-players',
      gameMode: '.step-game-mode',
      configuration: '.step-configuration',
      review: '.step-review'
    };

    // Click on the step to navigate
    const stepElement = this.page.locator(stepSelectors[step]);
    await stepElement.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Verify current step is active
   */
  async expectCurrentStep(step: 'players' | 'gameMode' | 'configuration' | 'review') {
    const stepSelectors = {
      players: '.step-players',
      gameMode: '.step-game-mode',
      configuration: '.step-configuration',
      review: '.step-review'
    };

    await this.page.waitForSelector(stepSelectors[step], { timeout: 5000 });
  }

  /**
   * Verify setup data in review step
   */
  async expectReviewData(options: GameSetupOptions) {
    const { players = ['Alice', 'Bob'], gameMode = 'countdown', startingScore = 501, startingLives = 5 } = options;
    
    // Verify players
    for (let i = 0; i < players.length; i++) {
      await expect(this.page.locator('.player-item').nth(i)).toContainText(players[i]);
    }

    // Verify game mode
    if (gameMode === 'high-low') {
      await expect(this.page.locator('.mode-name')).toContainText('High-Low Challenge');
    } else {
      await expect(this.page.locator('.mode-name')).toContainText('Countdown');
    }

    // Verify configuration
    if (gameMode === 'high-low') {
      await expect(this.page.locator('.setting-value')).toContainText(startingLives.toString());
    } else {
      await expect(this.page.locator('.setting-value')).toContainText(startingScore.toString());
    }
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
    await this.page.waitForSelector('.step-players', { timeout: 10000 });
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
