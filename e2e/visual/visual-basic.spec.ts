import { test } from '@playwright/test';
import { 
  setupGameForVisualTest, 
  takeFullPageScreenshot, 
  setViewportSize
} from './visual-test-helpers';

test.describe('Visual Regression - Basic Screens', () => {
  
  test('should match game setup screen - countdown mode', async ({ page }) => {
    await setViewportSize(page, 'desktop');
    await setupGameForVisualTest(page, {
      players: ['Alice', 'Bob'],
      gameMode: 'countdown',
      startingScore: 501
    });
    
    await takeFullPageScreenshot(page, 'game-setup-countdown-basic.png');
  });

  test('should match game setup screen - high-low mode', async ({ page }) => {
    await setViewportSize(page, 'desktop');
    await setupGameForVisualTest(page, {
      players: ['Alice', 'Bob'],
      gameMode: 'high-low',
      startingLives: 5
    });
    
    await takeFullPageScreenshot(page, 'game-setup-highlow-basic.png');
  });

  test('should match game setup screen - mobile', async ({ page }) => {
    await setViewportSize(page, 'mobile');
    await setupGameForVisualTest(page, {
      players: ['Alice', 'Bob'],
      gameMode: 'countdown',
      startingScore: 501
    });
    
    await takeFullPageScreenshot(page, 'game-setup-mobile-basic.png');
  });
});
