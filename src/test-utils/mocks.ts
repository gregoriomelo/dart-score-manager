import { vi } from 'vitest';

// Mock secure storage
export const mockSecureStorage = {
  setItem: vi.fn().mockResolvedValue(undefined),
  getItem: vi.fn().mockResolvedValue(null),
  removeItem: vi.fn(),
  clear: vi.fn(),
  hasItem: vi.fn().mockReturnValue(false),
  backup: vi.fn().mockResolvedValue({}),
  restore: vi.fn().mockResolvedValue(true),
};

// Mock legacy storage
export const mockLegacyStorage = {
  setItem: vi.fn(),
  getItem: vi.fn().mockReturnValue(null),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock service worker registration
export const mockServiceWorkerRegistration = {
  register: vi.fn().mockResolvedValue({
    active: { postMessage: vi.fn() },
    installing: null,
    waiting: null,
    updateViaCache: 'all',
  }),
  unregister: vi.fn().mockResolvedValue(true),
  getRegistration: vi.fn().mockResolvedValue(null),
  getRegistrations: vi.fn().mockResolvedValue([]),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

// Mock touch events
export const mockTouchEvent = {
  onTouchStart: vi.fn(),
  onTouchMove: vi.fn(),
  onTouchEnd: vi.fn(),
  onTouchCancel: vi.fn(),
};



// Mock online/offline events
export const mockOnlineStatus = {
  onOnline: vi.fn(),
  onOffline: vi.fn(),
};

// Mock for device capabilities
export const mockDeviceCapabilities = {
  isTouch: true,
  isMobile: true,
  isTablet: false,
  isDesktop: false,
  hasHover: false,
  hasPointer: true,
  hasFinePointer: true,
  hasCoarsePointer: false,
  maxTouchPoints: 5,
};

// Mock for responsive hooks
export const mockResponsive = {
  breakpoint: 'mobile',
  deviceType: 'mobile',
  width: 375,
  height: 667,
  orientation: 'portrait',
  isMobile: true,
  isTablet: false,
  isDesktop: false,
};

// Mock for touch hooks
export const mockTouchHandlers = {
  onTouchStart: vi.fn(),
  onTouchMove: vi.fn(),
  onTouchEnd: vi.fn(),
  onTouchCancel: vi.fn(),
};

// Setup function to apply all mocks
export const setupTestMocks = () => {
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    },
    writable: true,
  });

  // Mock navigator.serviceWorker
  Object.defineProperty(navigator, 'serviceWorker', {
    value: mockServiceWorkerRegistration,
    writable: true,
  });

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
    writable: true,
  });



  // Mock navigator.onLine
  Object.defineProperty(navigator, 'onLine', {
    value: true,
    writable: true,
  });
};



// Cleanup function to reset all mocks
export const cleanupTestMocks = () => {
  vi.clearAllMocks();
  vi.resetAllMocks();
};
