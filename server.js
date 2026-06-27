require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, CONTACT_PHONE, CONTACT_EMAIL } = process.env;

app.use(express.json());
app.use(express.static(__dirname));

function buildMessage(data) {
  return [
    '🚛 *New Driver Application — UZSD INC*',
    '',
    `👤 *Full Name:* ${data.fullName}`,
    `📞 *Phone:* ${data.phone}`,
    `📧 *Email:* ${data.email}`,
    '',
    `🚚 *Driver Type:* ${data.driverType}`,
    `🚛 *Equipment:* ${data.equipment}`,
    '',
    `📅 *Experience:* ${data.experience}`,
    `📍 *Location:* ${data.location}`,
    '',
    `💰 *Desired Weekly Gross:* ${data.grossIncome}`,
    '',
    `📝 *Additional Notes:* ${data.message}`,
  ].join('\n');
}

function validateSubmission(body) {
  const required = ['fullName', 'phone', 'email', 'driverType', 'equipment', 'experience', 'location'];
  for (const field of required) {
    if (!body[field] || !String(body[field]).trim()) {
      return false;
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return false;
  }
  return true;
}

app.post('/api/submit', async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return res.status(500).json({
      ok: false,
      error: 'Server is not configured. Missing Telegram credentials in .env',
    });
  }

  if (!validateSubmission(req.body)) {
    return res.status(400).json({ ok: false, error: 'Invalid form data' });
  }

  const data = {
    fullName: req.body.fullName.trim(),
    phone: req.body.phone.trim(),
    email: req.body.email.trim(),
    driverType: req.body.driverType,
    equipment: req.body.equipment,
    experience: req.body.experience,
    location: req.body.location.trim(),
    grossIncome: req.body.grossIncome?.trim() || 'Not specified',
    message: req.body.message?.trim() || 'None',
  };

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: buildMessage(data),
          parse_mode: 'Markdown',
        }),
      }
    );

    const json = await response.json();

    if (!json.ok) {
      console.error('Telegram API error:', json);
      return res.status(502).json({ ok: false, error: 'Failed to send message' });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('Submit error:', err);
    return res.status(500).json({
      ok: false,
      error: 'Submission failed',
      contactPhone: CONTACT_PHONE,
      contactEmail: CONTACT_EMAIL,
    });
  }
});

app.listen(PORT, () => {
  console.log(`UZSD INC site running at http://localhost:${PORT}`);
});
