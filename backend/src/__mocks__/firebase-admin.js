const { vi } = require('vitest');

const mockVerifyIdToken = vi.fn();

module.exports = {
  apps: [{}],

  initializeApp: vi.fn(),

  credential: {
    cert: vi.fn(),
  },

  auth: vi.fn(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),

  mockVerifyIdToken,
};