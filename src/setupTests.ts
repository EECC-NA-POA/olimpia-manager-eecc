
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock console methods to clean up test output
global.console = {
  ...console,
  // log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
