const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { chauffeur_id, bericht } = req.body;
  db.query('INSERT INTO meldingen (chauffeur_id, bericht) VALUES (?, ?)',
    [chauffeur_id, bericht], (err, result) => {
      if (err) return res.status(500).json({ fout: err });
      res.json({ bericht: 'Melding verstuurd' });
    });
});

router.get('/:chauffeur_id', (req, res) => {
  db.query('SELECT * FROM meldingen WHERE chauffeur_id = ? ORDER BY verstuurd_op DESC',
    [req.params.chauffeur_id], (err, results) => {
      if (err) return res.status(500).json({ fout: err });
      res.json(results);
    });
});

module.exports = router;