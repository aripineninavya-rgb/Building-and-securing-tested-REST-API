import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/GymList.css';

export const GymList = () => {
  const { token } = useAuth();
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGyms();
  }, []);

  const fetchGyms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/gyms`);
      if (!response.ok) throw new Error('Failed to fetch gyms');
      const data = await response.json();
      setGyms(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="gym-list">Loading gyms...</div>;

  if (error) {
    return <div className="gym-list error">Error: {error}</div>;
  }

  if (gyms.length === 0) {
    return <div className="gym-list empty">No gyms found.</div>;
  }

  return (
    <div className="gym-list">
      <h2>Available Gyms</h2>
      <div className="gyms-grid">
        {gyms.map(gym => (
          <div key={gym.id} className="gym-card">
            <h3>{gym.name}</h3>
            <p><strong>Location:</strong> {gym.location}</p>
            <p><strong>Rating:</strong> {gym.rating}/5</p>
            <p><strong>Reviews:</strong> {gym.reviews.length}</p>
            {token && (
              <button className="btn btn-small">Add Review</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
