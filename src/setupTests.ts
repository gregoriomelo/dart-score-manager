// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfills for Web Crypto API in Jest environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock crypto for tests
if (typeof global.crypto === 'undefined') {
  const crypto = require('crypto');
  global.crypto = {
    getRandomValues: <T extends ArrayBufferView | null>(array: T): T => {
      if (array instanceof Uint8Array) {
        return crypto.randomFillSync(array) as T;
      }
      return array;
    },
    subtle: {
      generateKey: jest.fn().mockImplementation(async (algorithm, extractable, keyUsages) => {
        return { type: 'secret', extractable, algorithm, usages: keyUsages };
      }),
      encrypt: jest.fn().mockImplementation(async (algorithm, key, data) => {
        const mockEncrypted = new Uint8Array(32);
        crypto.randomFillSync(mockEncrypted);
        return mockEncrypted.buffer;
      }),
      decrypt: jest.fn().mockImplementation(async (algorithm, key, data) => {
        const mockDecrypted = new Uint8Array(16);
        crypto.randomFillSync(mockDecrypted);
        return mockDecrypted.buffer;
      }),
      digest: jest.fn().mockImplementation(async (algorithm, data) => {
        const mockHash = new Uint8Array(32);
        crypto.randomFillSync(mockHash);
        return mockHash.buffer;
      }),
      deriveBits: jest.fn().mockImplementation(async (algorithm, baseKey, length) => {
        const mockDerived = new Uint8Array(length / 8);
        crypto.randomFillSync(mockDerived);
        return mockDerived.buffer;
      }),
      deriveKey: jest.fn().mockImplementation(async (algorithm, baseKey, derivedKeyAlgorithm, extractable, keyUsages) => {
        return { type: 'secret', extractable, algorithm: derivedKeyAlgorithm, usages: keyUsages };
      }),
      importKey: jest.fn().mockImplementation(async (format, keyData, algorithm, extractable, keyUsages) => {
        return { type: 'secret', extractable, algorithm, usages: keyUsages };
      }),
      exportKey: jest.fn().mockImplementation(async (format, key) => {
        const mockExported = new Uint8Array(16);
        crypto.randomFillSync(mockExported);
        return mockExported.buffer;
      }),
    }
  };
}
