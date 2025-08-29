import { legacyStorage } from '../secureStorage';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('LegacyStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setItem', () => {
    it('should store data in localStorage', () => {
      const testData = { test: 'data' };
      const testKey = 'test-key';

      // Mock successful storage
      mockLocalStorage.setItem.mockImplementation(() => {});

      legacyStorage.setItem(testKey, testData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(testKey, JSON.stringify(testData));
    });

    it('should handle errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const testData = { test: 'data' };
      const testKey = 'test-key';

      // Legacy storage catches errors and logs them, but doesn't re-throw
      expect(() => legacyStorage.setItem(testKey, testData)).not.toThrow();
    });
  });

  describe('getItem', () => {
    it('should return null for non-existent keys', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = legacyStorage.getItem('non-existent');

      expect(result).toBeNull();
    });

    it('should return parsed data for existing keys', () => {
      const testData = { test: 'data' };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testData));

      const result = legacyStorage.getItem('existing-key');

      expect(result).toEqual(testData);
    });

    it('should handle corrupted data gracefully', () => {
      // Mock a corrupted JSON string that will fail to parse
      mockLocalStorage.getItem.mockReturnValue('{"invalid": json,}');

      const result = legacyStorage.getItem('corrupted-key');

      expect(result).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('should remove item from storage', () => {
      const testKey = 'test-key';

      legacyStorage.removeItem(testKey);

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(testKey);
    });
  });

  describe('clear', () => {
    it('should clear all items', () => {
      legacyStorage.clear();

      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });
  });
});
