import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Profile.css';

export const Profile = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="profile">Please log in to view your profile.</div>;
  }

  if (loading) {
    return <div className="profile">Loading profile...</div>;
  }

  if (error) {
    return <div className="profile error">Error: {error}</div>;
  }

  return (
    <div className="profile">
      <h2>Your Profile</h2>
      {profile && (
        <div className="profile-info">
          <p><strong>UID:</strong> {profile.uid}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Name:</strong> {profile.name}</p>
        </div>
      )}
    </div>
  );
};
