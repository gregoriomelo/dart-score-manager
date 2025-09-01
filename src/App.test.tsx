import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('component can be imported', () => {
    // Test that the component can be imported without errors
    expect(App).toBeDefined();
    expect(typeof App).toBe('function');
  });
});
