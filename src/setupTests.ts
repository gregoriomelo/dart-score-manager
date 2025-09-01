// @testing-library/jest-dom provides custom matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfills for Web Crypto API in Vitest environment
if (typeof global !== 'undefined') {
  Object.defineProperty(global, 'crypto', {
    value: {
      subtle: {
        generateKey: () => Promise.resolve({}),
        encrypt: () => Promise.resolve(new ArrayBuffer(0)),
        decrypt: () => Promise.resolve(new ArrayBuffer(0)),
        sign: () => Promise.resolve(new ArrayBuffer(0)),
        verify: () => Promise.resolve(true),
        digest: () => Promise.resolve(new ArrayBuffer(0)),
        importKey: () => Promise.resolve({}),
        exportKey: () => Promise.resolve(new ArrayBuffer(0)),
        deriveKey: () => Promise.resolve({}),
        deriveBits: () => Promise.resolve(new ArrayBuffer(0)),
        wrapKey: () => Promise.resolve(new ArrayBuffer(0)),
        unwrapKey: () => Promise.resolve({}),
      },
      getRandomValues: (array: ArrayBufferView | null) => {
        if (array) {
          for (let i = 0; i < array.byteLength; i++) {
            (array as Uint8Array)[i] = Math.floor(Math.random() * 256);
          }
        }
        return array;
      },
      randomUUID: () => 'mock-uuid-' + Math.random().toString(36).substr(2, 9),
    },
    writable: true,
    configurable: true,
  });
}
