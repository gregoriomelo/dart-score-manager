// Mock all external dependencies before importing App
jest.doMock('./utils/serviceWorker');
jest.doMock('./features/performance/utils/performance');
jest.doMock('./features/game/hooks/useGameManager');
jest.doMock('./hooks/useResponsive');
jest.doMock('./hooks/useTouch');
jest.doMock('./shared/utils/accessibility');
jest.doMock('./components/PWAInstall');
jest.doMock('./app/components/NotificationContainer');
jest.doMock('./app/contexts/NotificationContext');
jest.doMock('./app/components/LazyComponents');
jest.doMock('./features/game/components/GameModeRouter');
jest.doMock('./features/performance/components/PerformanceDashboard');

// Import App after mocking
// eslint-disable-next-line import/first
import App from './App';

test('App component can be imported', () => {
  // Test that the component can be imported without errors
  expect(App).toBeDefined();
  expect(typeof App).toBe('function');
});
