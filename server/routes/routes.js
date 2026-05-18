const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query('SELECT * FROM routes', (err, results) => {
    if (err) return res.status(500).json({ fout: err });
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { naam, van, naar } = req.body;
  db.query('INSERT INTO routes (naam, van, naar) VALUES (?, ?, ?)',
    [naam, van, naar], (err, result) => {
      if (err) return res.status(500).json({ fout: err });
      res.json({ bericht: 'Route toegevoegd', id: result.insertId });
    });
});

router.post('/ritten', (req, res) => {
  const { route_id, chauffeur_id, datum, tijd } = req.body;
  db.query('INSERT INTO ritten (route_id, chauffeur_id, datum, tijd) VALUES (?, ?, ?, ?)',
    [route_id, chauffeur_id, datum, tijd], (err, result) => {
      if (err) return res.status(500).json({ fout: err });
      res.json({ bericht: 'Rit toegevoegd', id: result.insertId });
    });
});

module.exports = router;