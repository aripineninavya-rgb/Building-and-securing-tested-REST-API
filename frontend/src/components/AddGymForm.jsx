import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/AddGymForm.css';

export const AddGymForm = ({ onGymAdded }) => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({ name: '', location: '', rating: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!user) {
    return null; // Hide form when not logged in
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/gyms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const newGym = await response.json();
      setSuccess(true);
      setFormData({ name: '', location: '', rating: 0 });
      if (onGymAdded) onGymAdded(newGym);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-gym-form">
      <h3>Add a New Gym</h3>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Gym added successfully!</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Gym Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="rating"
          placeholder="Rating"
          min="0"
          max="5"
          step="0.1"
          value={formData.rating}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Adding...' : 'Add Gym'}
        </button>
      </form>
    </div>
  );
};
