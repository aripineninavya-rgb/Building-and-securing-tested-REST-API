const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// GET /profile - Protected route
router.get('/', verifyToken, (req, res) => {
  res.status(200).json({
    uid: req.user.uid,
    email: req.user.email,
    name: req.user.name || 'User'
  });
});

module.exports = router;
