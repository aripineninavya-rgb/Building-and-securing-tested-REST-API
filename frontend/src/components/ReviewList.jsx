import React from 'react';
import '../styles/ReviewList.css';

export const ReviewList = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return <div className="no-reviews">No reviews yet</div>;
  }

  return (
    <div className="reviews-container">
      <h4>Reviews ({reviews.length})</h4>
      <div className="reviews-list">
        {reviews.map((review, index) => (
          <div key={index} className="review-item">
            <div className="review-header">
              <span className="reviewer-name">{review.userName}</span>
              <span className="review-rating">★ {review.rating}/5</span>
            </div>
            <p className="review-comment">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
