require('dotenv').config();

const express = require('express');
const { submitApplication } = require('./lib/submit');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/submit', async (req, res) => {
  const result = await submitApplication(req.body, process.env);
  return res.status(result.status).json(result.body);
});

app.listen(PORT, () => {
  console.log(`UZSD INC site running at http://localhost:${PORT}`);
});
