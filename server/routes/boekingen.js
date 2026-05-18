const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all bookings for a chauffeur
router.get('/chauffeur/:chauffeur_id', (req, res) => {
  db.query(
    'SELECT b.*, r.van, r.naar FROM boekingen b JOIN ritten r ON b.rit_id = r.id WHERE b.chauffeur_id = ? ORDER BY r.datum DESC',
    [req.params.chauffeur_id],
    (err, results) => {
      if (err) return res.status(500).json({ fout: err });
      res.json(results);
    }
  );
});

// Create new booking
router.post('/', (req, res) => {
  const { chauffeur_id, ouder_naam, ouder_email, kind_naam, rit_id } = req.body;

  if (!chauffeur_id || !ouder_email || !kind_naam || !rit_id) {
    return res.status(400).json({ bericht: 'Verplichte velden ontbreken' });
  }

  db.query(
    'INSERT INTO boekingen (chauffeur_id, ouder_naam, ouder_email, kind_naam, rit_id) VALUES (?, ?, ?, ?, ?)',
    [chauffeur_id, ouder_naam, ouder_email, kind_naam, rit_id],
    (err, result) => {
      if (err) return res.status(500).json({ fout: err });
      res.json({ bericht: 'Boeking aangemaakt', boeking_id: result.insertId });
    }
  );
});

// Update booking status
router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  const valid_statuses = ['wachtend', 'bevestigd', 'afgezeggd'];

  if (!valid_statuses.includes(status)) {
    return res.status(400).json({ bericht: 'Ongeldig status' });
  }

  db.query(
    'UPDATE boekingen SET status = ? WHERE id = ?',
    [status, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ fout: err });
      res.json({ bericht: 'Boeking status geupdate' });
    }
  );
});

// Delete booking
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM boekingen WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ fout: err });
    res.json({ bericht: 'Boeking verwijderd' });
  });
});

module.exports = router;
