import { vi } from 'vitest';

export const mockVerifyIdToken = vi.fn();

export default {
  apps: [],
  initializeApp: vi.fn(),
  auth: vi.fn(() => ({
    verifyIdToken: mockVerifyIdToken
  })),
  credential: {
    cert: vi.fn()
  }
};
