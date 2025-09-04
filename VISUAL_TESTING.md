# Visual Regression Testing Guide

This document explains how to use and maintain the visual regression testing system for the Dart Score Manager application.

## Overview

Visual regression testing ensures that UI changes are intentional and don't break the visual appearance of the application. It captures screenshots of key UI components and compares them against baseline images to detect visual changes.

## How It Works

1. **Baseline Images**: Initial screenshots are captured and stored as "baseline" images
2. **Comparison**: New screenshots are compared against baseline images
3. **Diff Detection**: Any visual differences are flagged for review
4. **Approval Process**: Visual changes can be approved or rejected

## Running Visual Tests

### Local Development

```bash
# Run all visual tests
npm run test:visual

# Run only desktop visual tests
npm run test:visual:desktop

# Run only mobile visual tests
npm run test:visual:mobile

# Run visual tests with browser UI (for debugging)
npm run test:visual:ui

# Run visual tests in headed mode (see browser)
npm run test:visual:headed
```

### CI/CD Pipeline

Visual tests run automatically on:
- Pull requests to `main` branch
- Pushes to `main` and `develop` branches

## Test Structure

### Test Files

- `e2e/visual/visual-basic.spec.ts` - Basic visual regression tests
- `e2e/visual/visual-working.spec.ts` - Comprehensive working visual tests
- `e2e/visual/visual-test-helpers.ts` - Helper functions and utilities

### Test Categories

1. **Game Setup Screens**
   - Player setup with different player counts
   - Game mode selection (Countdown vs High-Low)
   - Starting score/lives configuration
   - Responsive layouts across breakpoints

2. **Gameplay Screens**
   - Countdown game board states
   - High-Low game board states
   - Score input interface
   - Current player highlighting
   - Game action toolbars

3. **Modals and Components**
   - Calculator modal
   - History modals (individual and consolidated)
   - Winner announcement modal
   - Language switcher
   - Performance dashboard

4. **Responsive Testing**
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1280px)
   - Large Desktop (1920px)

## Viewport Sizes

The visual tests cover these viewport sizes:

| Size | Dimensions | Device |
|------|------------|--------|
| Mobile | 375x667 | iPhone SE |
| Mobile Large | 414x896 | iPhone 11 Pro Max |
| Tablet | 768x1024 | iPad |
| Tablet Large | 1024x1366 | iPad Pro |
| Desktop | 1280x720 | Desktop |
| Desktop Large | 1920x1080 | Large Desktop |

## Baseline Images

Baseline images are stored in the `test-results/` directory and organized by:
- Browser (chromium, mobile-chrome)
- Test file
- Screenshot name

### File Naming Convention

```
test-results/
├── visual-chromium/
│   ├── visual-game-setup.spec.ts/
│   │   ├── game-setup-countdown-desktop.png
│   │   ├── game-setup-highlow-desktop.png
│   │   └── ...
│   └── visual-gameplay.spec.ts/
│       ├── countdown-gameboard-desktop.png
│       └── ...
└── visual-mobile/
    └── ...
```

## Adding New Visual Tests

### 1. Create Test File

```typescript
import { test, expect } from '@playwright/test';
import { 
  setupGameForVisualTest, 
  takeFullPageScreenshot, 
  setViewportSize 
} from './visual-test-helpers';

test.describe('Visual Regression - My New Feature', () => {
  test('should match my new component', async ({ page }) => {
    await setViewportSize(page, 'desktop');
    await setupGameForVisualTest(page, {
      players: ['Alice', 'Bob'],
      gameMode: 'countdown',
      startingScore: 501
    });
    
    await takeFullPageScreenshot(page, 'my-new-component.png');
  });
});
```

### 2. Use Helper Functions

- `takeFullPageScreenshot(page, name)` - Full page screenshot
- `takeElementScreenshot(page, selector, name)` - Element screenshot
- `takeViewportScreenshot(page, name)` - Viewport screenshot
- `setViewportSize(page, size)` - Set viewport size
- `prepareForVisualTest(page, options)` - Prepare page for testing

### 3. Best Practices

- **Wait for animations**: Use `waitForAnimations: true` option
- **Stable elements**: Wait for elements to be visible and stable
- **Consistent data**: Use the same test data for consistent results
- **Descriptive names**: Use clear, descriptive screenshot names
- **Multiple viewports**: Test across different screen sizes

## Handling Visual Changes

### When Tests Fail

1. **Review the diff**: Check if the visual change is intentional
2. **Update baseline**: If change is correct, update the baseline image
3. **Fix the issue**: If change is incorrect, fix the underlying code

### Updating Baseline Images

```bash
# Update baseline images (use with caution)
npx playwright test --project=visual-chromium --update-snapshots

# Update specific test
npx playwright test visual-game-setup.spec.ts --update-snapshots
```

### Approving Visual Changes

In CI/CD, visual test failures will:
1. Upload diff images as artifacts
2. Block the build until resolved
3. Require manual review and approval

## Troubleshooting

### Common Issues

1. **Flaky tests**: Ensure animations are disabled and elements are stable
2. **Font rendering**: Different OS/browser font rendering can cause false positives
3. **Timing issues**: Use proper waits and timeouts
4. **Dynamic content**: Avoid tests with timestamps or random data

### Debug Mode

```bash
# Run with browser UI for debugging
npm run test:visual:ui

# Run in headed mode to see what's happening
npm run test:visual:headed
```

### Performance

- Visual tests are slower than functional tests
- Run them separately from functional E2E tests
- Use parallel execution for faster feedback
- Consider running only on critical paths in CI

## Configuration

### Playwright Config

Visual testing is configured in `playwright.config.ts`:

```typescript
{
  name: 'visual-chromium',
  use: { 
    ...devices['Desktop Chrome'],
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  testMatch: '**/visual-*.spec.ts',
}
```

### CI/CD Integration

Visual tests run in the `visual-tests` job and are required for the build to pass.

## Maintenance

### Regular Tasks

1. **Review failed tests**: Check if visual changes are intentional
2. **Update baselines**: Keep baseline images up to date
3. **Clean up old images**: Remove unused baseline images
4. **Monitor performance**: Ensure tests run efficiently

### When to Update Baselines

- After intentional UI changes
- After design system updates
- After browser updates (if needed)
- After dependency updates that affect rendering

## Best Practices

1. **Test critical paths**: Focus on user-facing features
2. **Keep tests stable**: Avoid flaky visual tests
3. **Use consistent data**: Same test data for reproducible results
4. **Document changes**: Explain why baselines were updated
5. **Review diffs carefully**: Don't blindly approve all changes

## Resources

- [Playwright Visual Testing Documentation](https://playwright.dev/docs/test-snapshots)
- [Visual Testing Best Practices](https://playwright.dev/docs/test-snapshots#best-practices)
- [CI/CD Integration](https://playwright.dev/docs/ci)
