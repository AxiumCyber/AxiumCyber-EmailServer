import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

app.post('/api/signup', async (req, res) => {
  const { email } = req.body;
  
  const rawToken = crypto.randomBytes(32).toString('hex');
  const verificationUrl = `http://localhost:3000/verify-email?token=${rawToken}`;

  try {
    await transporter.sendMail({
      from: `"Auth System" <\${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify your email address',
      html: `<p>Click <a href="\${verificationUrl}">here</a> to verify your email setup.</p>`
    });
    res.status(200).json({ message: 'Verification email sent!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process email delivery.' });
  }
});

app.listen(3000, () => console.log('Verifier system active on port 3000'));