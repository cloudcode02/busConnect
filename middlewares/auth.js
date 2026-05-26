const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ success: false, error: 'Missing authorization header' });
  const parts = auth.split(' ');
  const token = parts.length === 2 ? parts[1] : parts[0];

  jwt.verify(token, process.env.JWT_SECRET || 'changeme', (err, decoded) => {
    if (err) return res.status(401).json({ success: false, error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};
