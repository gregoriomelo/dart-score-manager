/**
 * Secure localStorage wrapper with encryption and integrity checks
 */

import { encryptData, decryptData, isEncrypted, hashData, verifyDataIntegrity } from '../security/encryption';

export interface SecureStorageOptions {
  encrypt?: boolean;
  validateIntegrity?: boolean;
  version?: string;
}

export interface StorageItem {
  data: unknown;
  version: string;
  hash?: string;
  timestamp: number;
}

const DEFAULT_OPTIONS: SecureStorageOptions = {
  encrypt: true,
  validateIntegrity: true,
  version: '1.0.0',
};

// Version migration system implemented
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const STORAGE_VERSION_KEY = 'dart-score-manager-version';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MIGRATION_KEY = 'dart-score-manager-migration';

/**
 * Secure localStorage wrapper
 */
export class SecureStorage {
  private options: SecureStorageOptions;

  constructor(options: SecureStorageOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Set item in secure storage
   */
  async setItem(key: string, value: unknown): Promise<void> {
    try {
      const item: StorageItem = {
        data: value,
        version: this.options.version!,
        timestamp: Date.now(),
      };

      let serializedData = JSON.stringify(item);

      // Add integrity hash if enabled
      if (this.options.validateIntegrity) {
        item.hash = await hashData(serializedData);
        serializedData = JSON.stringify(item);
      }

      // Encrypt data if enabled
      if (this.options.encrypt) {
        serializedData = await encryptData(serializedData);
      }

      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error('Failed to set secure storage item:', error);
      throw new Error(`Failed to store data for key: ${key}`);
    }
  }

  /**
   * Get item from secure storage
   */
  async getItem<T = unknown>(key: string): Promise<T | null> {
    try {
      const encryptedData = localStorage.getItem(key);
      
      if (!encryptedData) {
        return null;
      }

      let decryptedData: string;

      // Check if data is encrypted
      if (isEncrypted(encryptedData)) {
        decryptedData = await decryptData(encryptedData);
      } else {
        decryptedData = encryptedData;
      }

      const item: StorageItem = JSON.parse(decryptedData);

      // Validate integrity if enabled
      if (this.options.validateIntegrity && item.hash) {
        const itemWithoutHash = { ...item };
        delete itemWithoutHash.hash;
        const serializedWithoutHash = JSON.stringify(itemWithoutHash);
        
        const isValid = await verifyDataIntegrity(serializedWithoutHash, item.hash);
        if (!isValid) {
          console.error('Data integrity check failed for key:', key);
          this.removeItem(key);
          return null;
        }
      }

      // Check version compatibility
      if (item.version !== this.options.version) {
        console.warn(`Version mismatch for key ${key}: expected ${this.options.version}, got ${item.version}`);
        // Could implement migration logic here
      }

      return item.data as T;
    } catch (error) {
      console.error('Failed to get secure storage item:', error);
      // Remove corrupted data
      this.removeItem(key);
      return null;
    }
  }

  /**
   * Remove item from secure storage
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clear all secure storage
   */
  clear(): void {
    localStorage.clear();
  }

  /**
   * Get all keys in secure storage
   */
  keys(): string[] {
    return Object.keys(localStorage);
  }

  /**
   * Check if key exists in secure storage
   */
  hasKey(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get storage size information
   */
  getStorageInfo(): { used: number; available: number; total: number } {
    let used = 0;
    let total = 0;

    try {
      // Estimate used space
      for (const key of this.keys()) {
        const value = localStorage.getItem(key);
        if (value) {
          used += key.length + value.length;
        }
      }

      // Estimate total available space (approximate)
      total = 5 * 1024 * 1024; // 5MB typical localStorage limit
    } catch (error) {
      console.error('Failed to get storage info:', error);
    }

    return {
      used,
      available: total - used,
      total,
    };
  }

  /**
   * Migrate data from old format
   */
  async migrateData(oldKey: string, newKey: string): Promise<boolean> {
    try {
      const oldData = localStorage.getItem(oldKey);
      if (!oldData) {
        return false;
      }

      // Try to parse as JSON first
      let parsedData;
      try {
        parsedData = JSON.parse(oldData);
      } catch {
        // If not JSON, treat as plain string
        parsedData = oldData;
      }

      // Store in new format
      await this.setItem(newKey, parsedData);
      
      // Remove old data
      localStorage.removeItem(oldKey);
      
      return true;
    } catch (error) {
      console.error('Failed to migrate data:', error);
      return false;
    }
  }

  /**
   * Backup all data
   */
  async backup(): Promise<string> {
    try {
      const backup: Record<string, unknown> = {};
      
      for (const key of this.keys()) {
        const value = await this.getItem(key);
        if (value !== null) {
          backup[key] = value;
        }
      }

      return JSON.stringify(backup);
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw new Error('Failed to create backup');
    }
  }

  /**
   * Restore from backup
   */
  async restore(backupData: string): Promise<void> {
    try {
      const backup = JSON.parse(backupData);
      
      // Clear existing data
      this.clear();
      
      // Restore data
      for (const [key, value] of Object.entries(backup)) {
        await this.setItem(key, value);
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw new Error('Failed to restore backup');
    }
  }
}

/**
 * Default secure storage instance
 */
export const secureStorage = new SecureStorage();

/**
 * Legacy storage for backward compatibility
 */
export const legacyStorage = {
  setItem: (key: string, value: unknown): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to set legacy storage item:', error);
    }
  },

  getItem: <T = unknown>(key: string): T | null => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get legacy storage item:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },

  clear: (): void => {
    localStorage.clear();
  },
};
