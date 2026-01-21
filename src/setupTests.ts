// @testing-library/jest-dom provides custom matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { vi } from 'vitest';

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

// Mock AudioContext for testing
if (typeof global !== 'undefined') {
  const mockAudioContext = {
    createBuffer: vi.fn(() => ({
      getChannelData: vi.fn(() => new Float32Array(44100)),
      length: 44100,
      sampleRate: 44100,
    })),
    createBufferSource: vi.fn(() => ({
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
    })),
    createGain: vi.fn(() => ({
      gain: { value: 1 },
      connect: vi.fn(),
    })),
    destination: {},
    sampleRate: 44100,
    state: 'running',
    resume: vi.fn(),
    decodeAudioData: vi.fn(() => Promise.resolve({
      getChannelData: vi.fn(() => new Float32Array(44100)),
      length: 44100,
      sampleRate: 44100,
    })),
  };

  const MockAudioContext = vi.fn(() => mockAudioContext);
  const MockWebkitAudioContext = vi.fn(() => mockAudioContext);

  Object.defineProperty(global, 'AudioContext', {
    value: MockAudioContext,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(global, 'webkitAudioContext', {
    value: MockWebkitAudioContext,
    writable: true,
    configurable: true,
  });
}

// Mock localStorage for testing
if (typeof global !== 'undefined') {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: (key: string) => {
        return store[key] || null;
      },
      setItem: (key: string, value: string) => {
        store[key] = String(value);
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      get length() {
        return Object.keys(store).length;
      },
      key: (index: number) => {
        const keys = Object.keys(store);
        return keys[index] || null;
      },
    };
  })();

  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  });
}
