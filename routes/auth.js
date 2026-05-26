const express = require('express');
const jwt = require('jsonwebtoken');

module.exports = () => {
  const router = express.Router();

  // Simple token endpoint for demonstration (creates a JWT for given email)
  router.post('/token', (req, res) => {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ success: false, error: 'Missing email' });

    const secret = process.env.JWT_SECRET || 'changeme';
    const token = jwt.sign({ email }, secret, { expiresIn: '7d' });
    return res.json({ success: true, token });
  });

  return router;
};
