const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function stuurRegistratieMail(chauffeurNaam, chauffeurEmail) {
  const opties = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: '🚌 Nieuwe chauffeur geregistreerd',
    html: `
      <h2>Nieuwe registratie</h2>
      <p><strong>Naam:</strong> ${chauffeurNaam}</p>
      <p><strong>E-mail:</strong> ${chauffeurEmail}</p>
    `
  };
  return transporter.sendMail(opties);
}

module.exports = { stuurRegistratieMail };