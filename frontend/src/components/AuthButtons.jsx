import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthButtons.css';

export const AuthButtons = () => {
  const { user, login, logout, loading } = useAuth();

  if (loading) {
    return <div className="auth-buttons">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="auth-buttons">
        <button onClick={login} className="btn btn-primary">
          Login with Google
        </button>
      </div>
    );
  }

  return (
    <div className="auth-buttons">
      <span className="user-info">Welcome, {user.displayName || user.email}</span>
      <button onClick={logout} className="btn btn-secondary">
        Logout
      </button>
    </div>
  );
};
