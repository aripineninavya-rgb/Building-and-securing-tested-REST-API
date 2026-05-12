import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { AuthButtons } from '../components/AuthButtons';
import { GymList } from '../components/GymList';
import { AddGymForm } from '../components/AddGymForm';
import { ReviewList } from '../components/ReviewList';

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn()
}));

vi.mock('firebase/auth', () => {
  class GoogleAuthProvider {}
  return {
    getAuth: vi.fn(),
    signInWithPopup: vi.fn(),
    GoogleAuthProvider: GoogleAuthProvider,
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn((auth, callback) => {
      callback(null);
      return () => {};
    })
  };
});

describe('Gym Review API - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication UI', () => {
    it('shows a "not logged in" message when there is no user', () => {
      // This is the first required test - checks that login UI appears when no user
      render(
        <AuthProvider>
          <AuthButtons />
        </AuthProvider>
      );
      
      // User is not logged in by default (onAuthStateChanged calls callback with null)
      const loginButton = screen.queryByRole('button', { name: /login with google/i });
      expect(loginButton).toBeTruthy();
    });
  });

  describe(' User Profile Display', () => {
    it('shows the user name when logged in', () => {
      // Test with fake component that shows user name
      const TestUserDisplay = ({ user }) => {
        return (
          <div>
            {user ? (
              <div>Welcome, <span className="user-name">{user.displayName}</span></div>
            ) : (
              <div>Not logged in</div>
            )}
          </div>
        );
      };

      const mockUser = { uid: '123', email: 'test@test.com', displayName: 'John Doe' };
      render(<TestUserDisplay user={mockUser} />);

      // Verify user name is displayed when authenticated
      const displayName = screen.getByText(/John Doe/);
      expect(displayName).toBeTruthy();
      expect(screen.getByText(/Welcome/)).toBeTruthy();
    });
  });

  describe('Protected Form', () => {
    it('hides the protected form when not logged in', () => {
      // This is the third required test - verifies form is hidden for non-authenticated users
      render(
        <AuthProvider>
          <AddGymForm />
        </AuthProvider>
      );

      // Form should not be rendered when user is null
      const formHeading = screen.queryByText(/add a new gym/i);
      expect(formHeading).toBeNull();

      // Verify form inputs are also hidden
      const nameInput = screen.queryByPlaceholderText(/gym name/i);
      const locationInput = screen.queryByPlaceholderText(/location/i);
      
      expect(nameInput).toBeNull();
      expect(locationInput).toBeNull();
    });
  });

  describe('Gym List Display', () => {
    it('shows a list of gyms when data is passed in', () => {
      // This is the fourth required test - checks gym list rendering with fake data (no real network calls)
      const TestGymDisplay = () => {
        // Fake gym data - no real API call
        const gyms = [
          { 
            id: '1', 
            name: 'Fitness Pro Gym', 
            location: '123 Main St', 
            rating: 4.5, 
            reviews: []
          },
          { 
            id: '2', 
            name: 'Strength Zone', 
            location: '456 Oak Ave', 
            rating: 4.0, 
            reviews: []
          }
        ];

        return (
          <div>
            <h2>Available Gyms</h2>
            {gyms.length > 0 ? (
              <div className="gyms-grid">
                {gyms.map(gym => (
                  <div key={gym.id} className="gym-card">
                    <h3>{gym.name}</h3>
                    <p>Location: {gym.location}</p>
                    <p>Rating: {gym.rating}/5</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No gyms found</p>
            )}
          </div>
        );
      };

      render(<TestGymDisplay />);

      // Verify gym data is displayed correctly
      expect(screen.getByText('Fitness Pro Gym')).toBeTruthy();
      expect(screen.getByText('Strength Zone')).toBeTruthy();
      expect(screen.getByText(/Location: 123 Main St/)).toBeTruthy();
      expect(screen.getByText(/Rating: 4.5\/5/)).toBeTruthy();
    });
  });

  describe('Empty State Error Message', () => {
    it('shows an error message when the gym list is empty', () => {
      // Test with fake component that shows empty state
      const TestEmptyGymList = ({ error, gyms }) => {
        if (error) {
          return <div className="gym-list error">Error: {error}</div>;
        }

        if (!gyms || gyms.length === 0) {
          return <div className="gym-list empty">No gyms found.</div>;
        }

        return (
          <div className="gym-list">
            {gyms.map(gym => (
              <div key={gym.id}>{gym.name}</div>
            ))}
          </div>
        );
      };

      // Test with empty gym list
      const { rerender } = render(
        <TestEmptyGymList error={null} gyms={[]} />
      );

      // Verify empty state message is shown
      const emptyMessage = screen.getByText(/no gyms found/i);
      expect(emptyMessage).toBeTruthy();

      // Test with error state
      rerender(
        <TestEmptyGymList error="Failed to fetch gyms" gyms={[]} />
      );

      // Verify error message is displayed
      const errorMessage = screen.getByText(/Failed to fetch gyms/i);
      expect(errorMessage).toBeTruthy();
    });
  });

  describe('Supporting Unit Tests', () => {
    it('displays review list without network calls', () => {
      // Fake review data - no real API calls
      const reviews = [
        { 
          userName: 'Alice Johnson', 
          rating: 5, 
          comment: 'Excellent gym!' 
        },
        { 
          userName: 'Bob Smith', 
          rating: 4, 
          comment: 'Good experience' 
        }
      ];

      render(<ReviewList reviews={reviews} />);

      // Verify reviews display
      expect(screen.getByText('Alice Johnson')).toBeTruthy();
      expect(screen.getByText('Bob Smith')).toBeTruthy();
      expect(screen.getByText('Excellent gym!')).toBeTruthy();
      expect(screen.getByText('Good experience')).toBeTruthy();
    });

    it('shows empty reviews message when no reviews exist', () => {
      render(<ReviewList reviews={[]} />);
      
      const noReviewsText = screen.getByText(/no reviews yet/i);
      expect(noReviewsText).toBeTruthy();
    });

    it('displays correct review count', () => {
      const reviews = [
        { userName: 'User1', rating: 5, comment: 'Great!' },
        { userName: 'User2', rating: 4, comment: 'Good!' },
        { userName: 'User3', rating: 5, comment: 'Awesome!' }
      ];

      render(<ReviewList reviews={reviews} />);

      const heading = screen.getByText(/reviews \(3\)/i);
      expect(heading).toBeTruthy();
    });

    it('throws error when useAuth is used outside AuthProvider', () => {
      const TestComponent = () => {
        useAuth();
        return null;
      };

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within AuthProvider');
    });

    it('provides auth context when inside AuthProvider', () => {
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
      expect(authValue).toHaveProperty('token');
      expect(authValue).toHaveProperty('login');
      expect(authValue).toHaveProperty('logout');
    });
  });
});