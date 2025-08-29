// Mock for secure storage
export const mockSecureStorage = {
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn(),
  clear: jest.fn(),
  hasItem: jest.fn().mockReturnValue(false),
  backup: jest.fn().mockResolvedValue({}),
  restore: jest.fn().mockResolvedValue(true),
};

export const mockLegacyStorage = {
  setItem: jest.fn(),
  getItem: jest.fn().mockReturnValue(null),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock for service worker
export const mockServiceWorker = {
  register: jest.fn().mockResolvedValue({
    active: { postMessage: jest.fn() },
    installing: null,
    waiting: null,
    updateViaCache: 'all',
  }),
  unregister: jest.fn().mockResolvedValue(true),
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
  onTouchStart: jest.fn(),
  onTouchMove: jest.fn(),
  onTouchEnd: jest.fn(),
  onTouchCancel: jest.fn(),
};

// Mock for PWA install prompt
export const mockBeforeInstallPrompt = {
  prompt: jest.fn().mockResolvedValue({ outcome: 'accepted' }),
  userChoice: Promise.resolve({ outcome: 'accepted' }),
};

// Mock for online/offline status
export const mockOnlineStatus = {
  isOnline: true,
  onOnline: jest.fn(),
  onOffline: jest.fn(),
};

// Setup function to apply all mocks
export const setupTestMocks = () => {
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn(),
    },
    writable: true,
  });

  // Mock navigator.serviceWorker
  Object.defineProperty(navigator, 'serviceWorker', {
    value: mockServiceWorker,
    writable: true,
  });

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
    writable: true,
  });

  // Mock window.beforeinstallprompt
  Object.defineProperty(window, 'beforeinstallprompt', {
    value: mockBeforeInstallPrompt,
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
  jest.clearAllMocks();
  jest.resetAllMocks();
};
