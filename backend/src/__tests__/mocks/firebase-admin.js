import { vi } from 'vitest';

export const mockVerifyIdToken = vi.fn();

export const apps = [];

export function initializeApp() {
  return vi.fn();
}

export function auth() {
  return {
    verifyIdToken: mockVerifyIdToken
  };
}

export const credential = {
  cert: vi.fn()
};

export default {
  apps,
  initializeApp,
  auth,
  credential
};
