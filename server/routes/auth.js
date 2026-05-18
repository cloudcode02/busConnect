const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@busconnect.nl' && password === 'admin123') {
    const token = jwt.sign({ id: 1, type: 'admin' }, 'geheim', { expiresIn: '8h' });
    return res.json({ token, bericht: 'Ingelogd als admin' });
  }
  return res.status(401).json({ bericht: 'Verkeerd wachtwoord' });
});

module.exports = router;