const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/../'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/chauffeurs', require('./routes/chauffeur'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/meldingen', require('./routes/meldingen'));
app.use('/api/boekingen', require('./routes/boekingen'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🚌 BusConnect draait op http://localhost:' + PORT);
});