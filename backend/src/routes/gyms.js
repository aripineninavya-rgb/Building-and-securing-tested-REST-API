const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET /gyms - Public route
router.get('/', (req, res) => {
  const gyms = db.getAllGyms();
  res.status(200).json(gyms);
});

// GET /gyms/:id - Public route
router.get('/:id', (req, res) => {
  const gym = db.getGymById(req.params.id);
  
  if (!gym) {
    return res.status(404).json({ error: 'Gym not found' });
  }
  
  res.status(200).json(gym);
});

// POST /gyms - Protected route
router.post('/', verifyToken, (req, res) => {
  const { name, location, rating } = req.body;

  if (!name || !location) {
    return res.status(400).json({ error: 'Name and location are required' });
  }

  const newGym = db.createGym({
    name,
    location,
    rating: rating || 0
  });

  res.status(201).json(newGym);
});

// POST /gyms/:id/reviews - Protected route
router.post('/:id/reviews', verifyToken, (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({ error: 'Rating and comment are required' });
  }

  const review = db.addReview(req.params.id, {
    userId: req.user.uid,
    userName: req.user.name || 'Anonymous',
    rating,
    comment
  });

  if (!review) {
    return res.status(404).json({ error: 'Gym not found' });
  }

  res.status(201).json(review);
});

module.exports = router;
