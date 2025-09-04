import { test, expect } from '@playwright/test';
import { setupTest, removeWebpackOverlay } from './test-helpers';

test.describe('Calculator Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page, {
      players: ['Alice', 'Bob', 'Charlie'],
      gameMode: 'countdown',
      startingScore: 501
    });
  });

  test('should allow using calculator to submit scores and switch players correctly', async ({ page }) => {
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Verify initial state - Alice's turn
    await expect(page.locator('.player-card').first().getByText('Alice')).toBeVisible();
    await expect(page.locator('.player-card').first().getByText('501')).toBeVisible();
    
    // Open calculator
    await page.getByRole('button', { name: 'Show calculator' }).click();
    
    // Verify calculator is visible
    await expect(page.getByText('Dart 1')).toBeVisible();
    await expect(page.getByText('Dart 2')).toBeVisible();
    await expect(page.getByText('Dart 3')).toBeVisible();
    
    // Input scores using calculator
    const dart1Input = page.locator('input[aria-label*="Dart 1 score"]');
    const dart2Input = page.locator('input[aria-label*="Dart 2 score"]');
    const dart3Input = page.locator('input[aria-label*="Dart 3 score"]');
    
    await dart1Input.fill('25');
    await dart2Input.fill('30');
    await dart3Input.fill('15');
    
    // Submit score from calculator
    await page.locator('.calculator-btn.primary').click();
    
    // Verify calculator is hidden
    await expect(page.getByText('Dart 1')).not.toBeVisible();
    
    // Verify Alice's score was updated (501 - 70 = 431)
    await expect(page.locator('.player-card').first().getByText('431')).toBeVisible();
    
    // Wait for auto advance to next player (Bob)
    await page.waitForSelector('.player-card:nth-child(2).current-player', { timeout: 5000 });
    
    // Verify it's Bob's turn
    await expect(page.locator('.player-card').nth(1).getByText('Bob')).toBeVisible();
    await expect(page.locator('.player-card').nth(1).getByText('501')).toBeVisible();
    
    // Verify Bob can use regular score input (not calculator)
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    await expect(scoreInput).toBeVisible();
    
    // Submit a regular score for Bob
    await scoreInput.fill('45');
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Verify Bob's score was updated (501 - 45 = 456)
    await expect(page.locator('.player-card').nth(1).getByText('456')).toBeVisible();
    
    // Wait for auto advance to next player (Charlie)
    await page.waitForSelector('.player-card:nth-child(3).current-player', { timeout: 5000 });
    
    // Verify it's Charlie's turn
    await expect(page.locator('.player-card').nth(2).getByText('Charlie')).toBeVisible();
    await expect(page.locator('.player-card').nth(2).getByText('501')).toBeVisible();
  });

  test('should handle calculator input validation correctly', async ({ page }) => {
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Open calculator
    await page.getByRole('button', { name: 'Show calculator' }).click();
    
    // Input valid scores
    const dart1Input = page.locator('input[aria-label*="Dart 1 score"]');
    const dart2Input = page.locator('input[aria-label*="Dart 2 score"]');
    const dart3Input = page.locator('input[aria-label*="Dart 3 score"]');
    
    // Input scores within valid range (including 0 for missed darts)
    await dart1Input.fill('25');
    await dart2Input.fill('0');  // Missed dart
    await dart3Input.fill('35');
    
    // Submit the score
    await page.locator('.calculator-btn.primary').click();
    
    // Verify calculator is hidden
    await expect(page.getByText('Dart 1')).not.toBeVisible();
    
    // Verify Alice's score was updated (501 - 60 = 441)
    await expect(page.locator('.player-card').first().getByText('441')).toBeVisible();
  });

  test('should allow calculator reset and cancel functionality', async ({ page }) => {
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Open calculator
    await page.getByRole('button', { name: 'Show calculator' }).click();
    
    // Input some scores
    const dart1Input = page.locator('input[aria-label*="Dart 1 score"]');
    const dart2Input = page.locator('input[aria-label*="Dart 2 score"]');
    const dart3Input = page.locator('input[aria-label*="Dart 3 score"]');
    
    await dart1Input.fill('20');
    await dart2Input.fill('25');
    await dart3Input.fill('30');
    
    // Test reset functionality
    await page.locator('button[aria-label="Reset calculator"]').click();
    
    // Verify inputs are cleared (empty strings)
    await expect(dart1Input).toHaveValue('');
    await expect(dart2Input).toHaveValue('');
    await expect(dart3Input).toHaveValue('');
    
    // Input scores again
    await dart1Input.fill('15');
    await dart2Input.fill('20');
    await dart3Input.fill('25');
    
    // Test cancel functionality
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Verify calculator is hidden
    await expect(page.getByText('Dart 1')).not.toBeVisible();
    
    // Verify Alice's score remains unchanged
    await expect(page.locator('.player-card').first().getByText('501')).toBeVisible();
    
    // Verify regular score input is available
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    await expect(scoreInput).toBeVisible();
  });

  test('should handle calculator keyboard navigation correctly', async ({ page }) => {
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Open calculator
    await page.getByRole('button', { name: 'Show calculator' }).click();
    
    // Input scores using calculator
    const dart1Input = page.locator('input[aria-label*="Dart 1 score"]');
    const dart2Input = page.locator('input[aria-label*="Dart 2 score"]');
    const dart3Input = page.locator('input[aria-label*="Dart 3 score"]');
    
    // Test keyboard navigation between fields
    await dart1Input.fill('25');
    await dart1Input.press('ArrowRight');
    
    // Verify focus moved to second dart input
    await expect(dart2Input).toHaveClass(/active/);
    
    await dart2Input.fill('30');
    await dart2Input.press('ArrowRight');
    
    // Verify focus moved to third dart input
    await expect(dart3Input).toHaveClass(/active/);
    
    await dart3Input.fill('35');
    
    // Test Enter key submission
    await dart3Input.press('Enter');
    
    // Verify calculator is hidden
    await expect(page.getByText('Dart 1')).not.toBeVisible();
    
    // Verify Alice's score was updated (501 - 90 = 411)
    await expect(page.locator('.player-card').first().getByText('411')).toBeVisible();
  });

  test('should clear main input when calculator opens', async ({ page }) => {
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Type a score in the main input
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    await scoreInput.fill('150');
    
    // Verify the main input has the value
    await expect(scoreInput).toHaveValue('150');
    
    // Open calculator
    await page.getByRole('button', { name: 'Show calculator' }).click();
    
    // Verify the main input is now cleared
    await expect(scoreInput).toHaveValue('');
    
    // Verify calculator is visible
    await expect(page.getByText('Dart 1')).toBeVisible();
  });

  test('should clear main input when calculator inputs are submitted', async ({ page }) => {
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Type a score in the main input
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    await scoreInput.fill('150');
    
    // Open calculator
    await page.getByRole('button', { name: 'Show calculator' }).click();
    
    // Input scores using calculator
    const dart1Input = page.locator('input[aria-label*="Dart 1 score"]');
    const dart2Input = page.locator('input[aria-label*="Dart 2 score"]');
    const dart3Input = page.locator('input[aria-label*="Dart 3 score"]');
    
    await dart1Input.fill('25');
    await dart2Input.fill('30');
    await dart3Input.fill('15');
    
    // Submit score from calculator
    await page.locator('.calculator-btn.primary').click();
    
    // Verify calculator is hidden
    await expect(page.getByText('Dart 1')).not.toBeVisible();
    
    // Verify the main input is cleared
    await expect(scoreInput).toHaveValue('');
    
    // Verify Alice's score was updated (501 - 70 = 431)
    await expect(page.locator('.player-card').first().getByText('431')).toBeVisible();
  });

  test('should focus main input field after submitting score with main input', async ({ page }) => {
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Type a score in the main input
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    await scoreInput.fill('45');
    
    // Submit the score
    await page.getByRole('button', { name: 'Submit' }).click();
    
    // Wait for auto advance to next player (Bob)
    await page.waitForSelector('.player-card:nth-child(2).current-player', { timeout: 5000 });
    
    // Verify it's Bob's turn
    await expect(page.locator('.player-card').nth(1).getByText('Bob')).toBeVisible();
    
    // Verify the main input field has focus after player switch
    await expect(scoreInput).toBeFocused();
  });

  test('should focus main input field after submitting score with calculator', async ({ page }) => {
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Open calculator
    await page.getByRole('button', { name: 'Show calculator' }).click();
    
    // Input scores using calculator
    const dart1Input = page.locator('input[aria-label*="Dart 1 score"]');
    const dart2Input = page.locator('input[aria-label*="Dart 2 score"]');
    const dart3Input = page.locator('input[aria-label*="Dart 3 score"]');
    
    await dart1Input.fill('25');
    await dart2Input.fill('30');
    await dart3Input.fill('15');
    
    // Submit score from calculator
    await page.locator('.calculator-btn.primary').click();
    
    // Wait for auto advance to next player (Bob)
    await page.waitForSelector('.player-card:nth-child(2).current-player', { timeout: 5000 });
    
    // Verify it's Bob's turn
    await expect(page.locator('.player-card').nth(1).getByText('Bob')).toBeVisible();
    
    // Verify the main input field has focus after calculator submission and player switch
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    await expect(scoreInput).toBeFocused();
  });

  test('should focus first dart input when calculator is reset', async ({ page }) => {
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Open calculator
    await page.getByRole('button', { name: 'Show calculator' }).click();
    
    // Input scores using calculator
    const dart1Input = page.locator('input[aria-label*="Dart 1 score"]');
    const dart2Input = page.locator('input[aria-label*="Dart 2 score"]');
    const dart3Input = page.locator('input[aria-label*="Dart 3 score"]');
    
    await dart1Input.fill('25');
    await dart2Input.fill('30');
    await dart3Input.fill('15');
    
    // Focus on the third dart input
    await dart3Input.focus();
    
    // Click reset button
    await page.getByRole('button', { name: 'Reset calculator' }).click();
    
    // Verify the first dart input has focus after reset
    await expect(dart1Input).toBeFocused();
    
    // Verify inputs are cleared
    await expect(dart1Input).toHaveValue('');
    await expect(dart2Input).toHaveValue('');
    await expect(dart3Input).toHaveValue('');
  });

  test('should focus main input when calculator is cancelled', async ({ page }) => {
    // Remove webpack overlay before interactions
    await removeWebpackOverlay(page);
    
    // Open calculator
    await page.getByRole('button', { name: 'Show calculator' }).click();
    
    // Input some scores in calculator
    const dart1Input = page.locator('input[aria-label*="Dart 1 score"]');
    const dart2Input = page.locator('input[aria-label*="Dart 2 score"]');
    const dart3Input = page.locator('input[aria-label*="Dart 3 score"]');
    
    await dart1Input.fill('25');
    await dart2Input.fill('30');
    await dart3Input.fill('15');
    
    // Focus on the second dart input
    await dart2Input.focus();
    
    // Click cancel button
    await page.getByRole('button', { name: 'Cancel calculator' }).click();
    
    // Verify calculator is hidden
    await expect(page.getByText('Dart 1')).not.toBeVisible();
    
    // Verify the main input field has focus after cancelling calculator
    const scoreInput = page.getByPlaceholder('Enter score (0-180)');
    await expect(scoreInput).toBeFocused();
  });
});
