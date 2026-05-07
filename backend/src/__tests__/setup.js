import { vi } from 'vitest';

export const mockVerifyIdToken = vi.fn();

// Set up environment variables for testing
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test.iam.gserviceaccount.com';
process.env.FIREBASE_PRIVATE_KEY = 'test-private-key';

vi.mock('firebase-admin', () => {
  return {
    default: {
      apps: [],
      initializeApp: vi.fn(() => ({})),
      auth: vi.fn(() => ({
        verifyIdToken: mockVerifyIdToken
      })),
      credential: {
        cert: vi.fn()
      }
    }
  };
});







