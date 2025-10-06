// Test setup file for vitest
import { beforeEach } from 'vitest';

beforeEach(() => {
  // Reset DOM before each test
  if (document.body) {
    document.body.innerHTML = '';
  }
});