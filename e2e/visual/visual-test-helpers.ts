import { Page, expect } from '@playwright/test';
import { setupTest, removeWebpackOverlay } from '../test-helpers';

/**
 * Visual testing helper functions for consistent screenshot capture
 */

export interface VisualTestOptions {
  /** Wait for animations to complete before taking screenshot */
  waitForAnimations?: boolean;
  /** Wait for specific element to be visible before screenshot */
  waitForElement?: string;
  /** Custom timeout for waiting */
  timeout?: number;
  /** Whether to remove webpack overlay before screenshot */
  removeOverlay?: boolean;
}

/**
 * Wait for animations and transitions to complete
 */
export async function waitForAnimationsToComplete(page: Page): Promise<void> {
  // Wait for CSS transitions and animations to complete
  await page.waitForFunction(() => {
    const animations = document.getAnimations();
    return animations.every(animation => animation.playState === 'finished');
  }, { timeout: 5000 });
}

/**
 * Wait for element to be visible and stable
 */
export async function waitForElementStable(page: Page, selector: string, timeout = 5000): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout });
  
  // Wait for element to be stable (no position/size changes)
  await page.waitForFunction(
    (sel) => {
      const element = document.querySelector(sel);
      if (!element) return false;
      
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    },
    selector,
    { timeout: 2000 }
  );
}

/**
 * Prepare page for visual testing
 */
export async function prepareForVisualTest(
  page: Page, 
  options: VisualTestOptions = {}
): Promise<void> {
  const {
    waitForAnimations = true,
    waitForElement,
    removeOverlay = true,
    timeout = 5000
  } = options;

  // Remove webpack overlay if present
  if (removeOverlay) {
    await removeWebpackOverlay(page);
  }

  // Wait for specific element if provided
  if (waitForElement) {
    await waitForElementStable(page, waitForElement, timeout);
  }

  // Wait for animations to complete
  if (waitForAnimations) {
    await waitForAnimationsToComplete(page);
  }

  // Ensure page is fully loaded
  await page.waitForLoadState('networkidle');
  
  // Additional stability wait
  await page.waitForTimeout(500);
  
  // Force a stable layout
  await page.evaluate(() => {
    // Force reflow to ensure stable layout
    void document.body.offsetHeight;
  });
}

/**
 * Take a full page screenshot with consistent settings
 */
export async function takeFullPageScreenshot(
  page: Page,
  name: string,
  options: VisualTestOptions = {}
): Promise<void> {
  await prepareForVisualTest(page, options);
  
  await expect(page).toHaveScreenshot(name, {
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
    threshold: 0.2, // Allow 20% pixel difference for stability
    maxDiffPixels: 1000, // Allow up to 1000 pixels difference
  });
}

/**
 * Take a screenshot of a specific element
 */
export async function takeElementScreenshot(
  page: Page,
  selector: string,
  name: string,
  options: VisualTestOptions = {}
): Promise<void> {
  await prepareForVisualTest(page, options);
  
  const element = page.locator(selector);
  await expect(element).toHaveScreenshot(name, {
    animations: 'disabled',
    caret: 'hide',
    threshold: 0.2, // Allow 20% pixel difference for stability
    maxDiffPixels: 1000, // Allow up to 1000 pixels difference
  });
}

/**
 * Take a screenshot of the viewport (visible area only)
 */
export async function takeViewportScreenshot(
  page: Page,
  name: string,
  options: VisualTestOptions = {}
): Promise<void> {
  await prepareForVisualTest(page, options);
  
  await expect(page).toHaveScreenshot(name, {
    fullPage: false,
    animations: 'disabled',
    caret: 'hide',
    threshold: 0.2, // Allow 20% pixel difference for stability
    maxDiffPixels: 1000, // Allow up to 1000 pixels difference
  });
}

/**
 * Setup game and prepare for visual testing
 */
export async function setupGameForVisualTest(
  page: Page,
  gameOptions: {
    players: string[];
    gameMode: 'countdown' | 'high-low';
    startingScore?: number;
    startingLives?: number;
  }
): Promise<void> {
  await setupTest(page, gameOptions);
  await prepareForVisualTest(page);
}

/**
 * Common selectors for visual testing
 */
export const VISUAL_SELECTORS = {
  // Game setup
  gameSetup: '.player-setup',
  playerSetup: '.player-setup',
  gameModeSelector: '.game-mode-buttons',

  // Game boards
  countdownBoard: '.game-board',
  highLowBoard: '.game-board',
  playerCard: '.player-card',
  currentPlayer: '.current-player',

  // Score input
  scoreInput: '.score-input-section',
  scoreInputField: 'input[placeholder*="score"]',
  submitButton: 'button[type="submit"]',

  // Calculator
  calculator: '.dart-score-calculator',
  calculatorModal: '.dart-score-calculator', // The calculator is not a modal, it's a component
  calculatorButton: '.calculator-btn',

  // Modals
  modal: '.history-view-overlay', // History modals use this class
  modalContent: '.history-view-modal',
  modalHeader: '.history-view-header',
  modalBody: '.history-view-content',

  // History
  historyButton: '.history-btn',
  historyModal: '.history-view-overlay',
  historyTable: '.history-table',

  // Game actions
  gameActions: '.game-actions',
  resetButton: '[data-testid="reset-game"]',
  newGameButton: '[data-testid="new-game"]',

  // Winner announcement
  winnerAnnouncement: '.winner-announcement',
  winnerModal: '.winner-announcement', // Winner announcement is not a modal

  // Language switcher
  languageSwitcher: '.language-switcher',

  // Performance dashboard
  performanceDashboard: '.performance-dashboard',
} as const;

/**
 * Common viewport sizes for responsive testing
 */
export const VIEWPORT_SIZES = {
  mobile: { width: 375, height: 667 },      // iPhone SE
  mobileLarge: { width: 414, height: 896 }, // iPhone 11 Pro Max
  tablet: { width: 768, height: 1024 },     // iPad
  tabletLarge: { width: 1024, height: 1366 }, // iPad Pro
  desktop: { width: 1280, height: 720 },    // Desktop
  desktopLarge: { width: 1920, height: 1080 }, // Large desktop
} as const;

/**
 * Set viewport size for responsive visual testing
 */
export async function setViewportSize(page: Page, size: keyof typeof VIEWPORT_SIZES): Promise<void> {
  const dimensions = VIEWPORT_SIZES[size];
  await page.setViewportSize(dimensions);
}
