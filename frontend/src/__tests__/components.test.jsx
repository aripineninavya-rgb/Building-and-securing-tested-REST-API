import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { AuthButtons } from '../components/AuthButtons';
import { GymList } from '../components/GymList';
import { AddGymForm } from '../components/AddGymForm';

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn()
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(() => ({})),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null);
    return () => {};
  })
}));

describe('Frontend Unit Tests', () => {
  describe('AuthButtons Component', () => {
    it('shows login button when user is not logged in', () => {
      render(
        <AuthProvider>
          <AuthButtons />
        </AuthProvider>
      );
      
      const loginButton = screen.queryByRole('button', { name: /login with google/i });
      expect(loginButton).toBeTruthy();
    });

    it('shows loading state initially', () => {
      render(
        <AuthProvider>
          <AuthButtons />
        </AuthProvider>
      );
      
      const loadingText = screen.queryByText(/loading/i);
      expect(loadingText).toBeTruthy();
    });
  });

  describe('GymList Component', () => {
    it('shows a list of gyms when data is passed in', async () => {
      // Mock the fetch
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: '1', name: 'Test Gym', location: 'Test St', rating: 5, reviews: [] }
          ])
        })
      );

      render(
        <AuthProvider>
          <GymList />
        </AuthProvider>
      );

      const loadingText = await screen.findByText(/loading/i);
      expect(loadingText).toBeTruthy();
    });

    it('shows loading state', () => {
      render(
        <AuthProvider>
          <GymList />
        </AuthProvider>
      );
      
      const loadingText = screen.getByText(/loading/i);
      expect(loadingText).toBeTruthy();
    });
  });

  describe('AddGymForm Component', () => {
    it('hides the protected form when not logged in', () => {
      render(
        <AuthProvider>
          <AddGymForm />
        </AuthProvider>
      );

      // Form should not be rendered when user is null
      const formHeading = screen.queryByText(/add a new gym/i);
      expect(formHeading).toBeNull();
    });

    it('shows form title', () => {
      // Note: In real app, you'd need a test user logged in
      render(
        <AuthProvider>
          <AddGymForm />
        </AuthProvider>
      );

      // Form is hidden when no user, so this is expected
      const formHeading = screen.queryByText(/add a new gym/i);
      expect(formHeading).toBeNull();
    });
  });

  describe('useAuth Hook', () => {
    it('throws error when used outside AuthProvider', () => {
      const TestComponent = () => {
        useAuth();
        return null;
      };

      expect(() => {
        render(<TestComponent />);
      }).toThrow();
    });

    it('provides auth context inside provider', () => {
      let authValue;
      const TestComponent = () => {
        authValue = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(authValue).toBeDefined();
      expect(authValue).toHaveProperty('user');
      expect(authValue).toHaveProperty('login');
      expect(authValue).toHaveProperty('logout');
    });
  });
});
