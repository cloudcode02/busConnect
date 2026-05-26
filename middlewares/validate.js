// Minimal request body validator — use for simple schema checks
module.exports = function(schema) {
  return (req, res, next) => {
    const body = req.body || {};
    const missing = [];
    (schema.required || []).forEach(field => {
      if (body[field] === undefined || body[field] === null || body[field] === '') missing.push(field);
    });
    if (missing.length) return res.status(400).json({ success: false, error: 'Missing fields: ' + missing.join(', ') });
    next();
  };
};
