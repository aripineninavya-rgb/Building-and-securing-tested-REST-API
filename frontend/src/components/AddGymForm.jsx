import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/AddGymForm.css';

export const AddGymForm = ({ onGymAdded, onClose, isModal = false }) => {
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
      
      // Close modal after success
      if (isModal && onClose) {
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <>
      <h3>Add a New Gym</h3>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Gym added successfully!</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="name"
            placeholder="Gym Name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="rating">Initial Rating:</label>
          <select
            id="rating"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="0">0 - Not Rated</option>
            <option value="1">1 - Poor</option>
            <option value="2">2 - Fair</option>
            <option value="3">3 - Good</option>
            <option value="4">4 - Very Good</option>
            <option value="5">5 - Excellent</option>
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Adding...' : 'Add Gym'}
          </button>
          {isModal && (
            <button
              type="button"
              disabled={loading}
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </>
  );

  if (isModal) {
    return (
      <div className="add-gym-modal">
        <div className="add-gym-modal-content">
          {formContent}
        </div>
      </div>
    );
  }

  return <div className="add-gym-form">{formContent}</div>;
};
