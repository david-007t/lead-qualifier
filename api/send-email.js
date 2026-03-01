import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { smtpConfig, to, subject, body } = req.body;

  if (!smtpConfig?.user || !smtpConfig?.pass) {
    return res.status(400).json({ error: 'Email credentials not configured' });
  }
  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Missing to, subject, or body' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: Number(smtpConfig.port) || 587,
      secure: Number(smtpConfig.port) === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });

    const fromLabel = smtpConfig.fromName
      ? `${smtpConfig.fromName} <${smtpConfig.user}>`
      : smtpConfig.user;

    await transporter.sendMail({
      from: fromLabel,
      to,
      subject,
      text: body,
    });

    console.log('[send-email] Sent to:', to);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[send-email] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
