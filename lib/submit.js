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
  if (!body || typeof body !== 'object') {
    return false;
  }
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

async function submitApplication(body, env) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, CONTACT_PHONE, CONTACT_EMAIL } = env;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return {
      status: 500,
      body: { ok: false, error: 'Server is not configured. Missing Telegram credentials.' },
    };
  }

  if (!validateSubmission(body)) {
    return { status: 400, body: { ok: false, error: 'Invalid form data' } };
  }

  const data = {
    fullName: body.fullName.trim(),
    phone: body.phone.trim(),
    email: body.email.trim(),
    driverType: body.driverType,
    equipment: body.equipment,
    experience: body.experience,
    location: body.location.trim(),
    grossIncome: body.grossIncome?.trim() || 'Not specified',
    message: body.message?.trim() || 'None',
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
      return { status: 502, body: { ok: false, error: 'Failed to send message' } };
    }

    return { status: 200, body: { ok: true } };
  } catch (err) {
    console.error('Submit error:', err);
    return {
      status: 500,
      body: {
        ok: false,
        error: 'Submission failed',
        contactPhone: CONTACT_PHONE,
        contactEmail: CONTACT_EMAIL,
      },
    };
  }
}

module.exports = { validateSubmission, submitApplication };
