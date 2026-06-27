const { submitApplication } = require('../lib/submit');

function parseBody(req) {
  let body = req.body;

  if (typeof body === 'string' && body.length) {
    try {
      body = JSON.parse(body);
    } catch {
      return null;
    }
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return null;
  }

  return body;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = parseBody(req);
  if (!body) {
    return res.status(400).json({ ok: false, error: 'Invalid request body' });
  }

  const result = await submitApplication(body, process.env);
  return res.status(result.status).json(result.body);
};
