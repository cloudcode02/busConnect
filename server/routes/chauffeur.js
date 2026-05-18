const express = require('express');
const router = express.Router();
const db = require('../db');
const { stuurRegistratieMail } = require('../mailer');

// Get all chauffeurs
router.get('/', (req, res) => {
  db.query('SELECT * FROM chauffeurs', [], (err, results) => {
    if (err) return res.status(500).json({ fout: err });
    res.json(results);
  });
});

// Get specific chauffeur
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM chauffeurs WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ fout: err });
    if (results.length === 0) return res.status(404).json({ bericht: 'Chauffeur niet gevonden' });
    res.json(results[0]);
  });
});

// Get chauffeur ritten
router.get('/:id/ritten', (req, res) => {
  db.query('SELECT r.*, COUNT(b.id) as geboekt FROM ritten r LEFT JOIN boekingen b ON r.id = b.rit_id WHERE r.chauffeur_id = ? GROUP BY r.id ORDER BY r.datum', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ fout: err });
    res.json(results);
  });
});

// Create new chauffeur (registration)
router.post('/', (req, res) => {
  const { naam, email, telefoon } = req.body;
  db.query('INSERT INTO chauffeurs (naam, email, telefoon) VALUES (?, ?, ?)',
    [naam, email, telefoon], async (err, result) => {
      if (err) return res.status(500).json({ fout: 'Email bestaat al' });
      await stuurRegistratieMail(naam, email);
      res.json({ bericht: 'Chauffeur toegevoegd', id: result.insertId });
    });
});

// Block chauffeur
router.put('/:id/blokkeer', (req, res) => {
  db.query('UPDATE chauffeurs SET status = "geblokkeerd" WHERE id = ?',
    [req.params.id], (err) => {
      if (err) return res.status(500).json({ fout: err });
      res.json({ bericht: 'Chauffeur geblokkeerd' });
    });
});

// Update chauffeur info
router.put('/:id', (req, res) => {
  const { naam, email, telefoon, route, school, voertuig, tijdOch, tijdMid, capaciteit, prijs, bio, extra, rating, reviews } = req.body;
  
  db.query('UPDATE chauffeurs SET naam=?, email=?, telefoon=?, route=?, school=?, voertuig=?, tijdOch=?, tijdMid=?, capaciteit=?, prijs=?, bio=?, extra=?, rating=?, reviews=? WHERE id = ?',
    [naam, email, telefoon, route, school, voertuig, tijdOch, tijdMid, capaciteit, prijs, bio, extra, rating, reviews, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ fout: err });
      res.json({ bericht: 'Chauffeur info geupdate' });
    });
});

// Delete chauffeur
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM chauffeurs WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ fout: err });
    res.json({ bericht: 'Chauffeur verwijderd' });
  });
});

module.exports = router;