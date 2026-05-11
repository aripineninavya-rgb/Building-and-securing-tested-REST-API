import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ReviewForm } from './ReviewForm';
import { ReviewList } from './ReviewList';
import { AddGymForm } from './AddGymForm';
import '../styles/GymList.css';

export const GymList = () => {
  const { token } = useAuth();
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGymId, setSelectedGymId] = useState(null);
  const [showAddGymModal, setShowAddGymModal] = useState(false);

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

  const handleReviewAdded = (newReview) => {
    setGyms(gyms.map(gym => 
      gym.id === selectedGymId 
        ? { ...gym, reviews: [...gym.reviews, newReview] }
        : gym
    ));
  };

  const handleGymAdded = (newGym) => {
    setGyms([...gyms, newGym]);
    setShowAddGymModal(false);
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
      <div className="gym-list-header">
        <h2>Available Gyms</h2>
        {token && (
          <button
            className="btn btn-add-gym-header"
            onClick={() => setShowAddGymModal(true)}
          >
            + Add New Gym
          </button>
        )}
      </div>
      <div className="gyms-grid">
        {gyms.map(gym => (
          <div key={gym.id} className="gym-card">
            <h3>{gym.name}</h3>
            <p><strong>Location:</strong> {gym.location}</p>
            <p><strong>Rating:</strong> {gym.rating}/5</p>
            <ReviewList reviews={gym.reviews} />
            {token && (
              <button
                className="btn btn-small"
                onClick={() => setSelectedGymId(gym.id)}
              >
                Add Review
              </button>
            )}
          </div>
        ))}
      </div>
      
      {selectedGymId && (
        <ReviewForm
          gymId={selectedGymId}
          onReviewAdded={handleReviewAdded}
          onClose={() => setSelectedGymId(null)}
        />
      )}

      {showAddGymModal && (
        <AddGymForm
          isModal={true}
          onClose={() => setShowAddGymModal(false)}
          onGymAdded={handleGymAdded}
        />
      )}
    </div>
  );
};
