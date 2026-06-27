const { submitApplication } = require('../lib/submit');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const result = await submitApplication(req.body, process.env);
  return res.status(result.status).json(result.body);
};
