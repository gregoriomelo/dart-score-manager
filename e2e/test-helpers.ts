import { Page } from '@playwright/test';

/**
 * Browser-specific waiting strategies for flaky tests
 */
export class TestHelpers {
  static async waitForStableElement(page: Page, selector: string, timeout = 10000) {
    // Wait for element to be visible and stable
    await page.waitForSelector(selector, { timeout });
    await page.waitForLoadState('domcontentloaded');
    
    // Additional wait for Firefox to ensure element is truly stable
    const browserName = page.context().browser()?.browserType().name();
    if (browserName === 'firefox') {
      await page.waitForTimeout(200);
    }
  }

  static async waitForElementWithText(page: Page, selector: string, text: string, timeout = 10000) {
    const browserName = page.context().browser()?.browserType().name();
    const firefoxTimeout = browserName === 'firefox' ? timeout * 1.5 : timeout;
    
    await page.waitForFunction(
      ({ selector, text }) => {
        const element = document.querySelector(selector);
        return element && element.textContent && element.textContent.includes(text);
      },
      { selector, text },
      { timeout: firefoxTimeout }
    );
  }

  static async clickAndWaitForResponse(page: Page, selector: string, timeout = 8000) {
    const browserName = page.context().browser()?.browserType().name();
    
    await page.click(selector);
    
    // Firefox needs more time for UI updates
    if (browserName === 'firefox') {
      await page.waitForTimeout(300);
    }
    
    await page.waitForLoadState('domcontentloaded');
  }

  static async submitScoreAndWait(page: Page, score: string, timeout = 8000) {
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    await scoreInput.fill(score);
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Wait for score processing
    await page.waitForLoadState('domcontentloaded');
    
    const browserName = page.context().browser()?.browserType().name();
    if (browserName === 'firefox') {
      await page.waitForTimeout(400);
    }
  }
}
