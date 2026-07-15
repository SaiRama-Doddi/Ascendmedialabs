const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { otp, email } = req.body;

  if (!otp || !email) {
    return res.status(400).json({ error: 'Missing otp or email parameters' });
  }

  // Verify email is the eligible one
  if (email !== 'ascendmedialabsinfo@gmail.com') {
    return res.status(403).json({ error: 'Unauthorized email address' });
  }

  const gmailUser = process.env.GMAIL_USER || 'ascendmedialabsinfo@gmail.com';
  // Use user's app password
  const gmailPass = process.env.GMAIL_APP_PASSWORD || 'hegafcuvcbmlphvn'; 

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const mailOptions = {
      from: `"Ascend Media Labs Security" <${gmailUser}>`,
      to: email,
      subject: '🔒 Confidential Security OTP - Admin Access',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 4px; background-color: #ffffff;">
          <h2 style="color: #800000; font-family: Georgia, serif; text-align: center; border-bottom: 2px solid #800000; padding-bottom: 10px; margin-top: 0;">Ascend Media Labs</h2>
          <p style="font-size: 14px; color: #333; line-height: 1.5; margin-top: 20px;">Hello Administrator,</p>
          <p style="font-size: 14px; color: #333; line-height: 1.5;">A request was made to access the confidential <strong>Account settings</strong> in your Admin Dashboard.</p>
          
          <div style="background-color: #fcf8f3; border: 1px dashed #d0c0a0; padding: 20px; margin: 25px 0; text-align: center; border-radius: 4px;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin: 0 0 5px 0;">One-Time Verification Code</p>
            <span style="font-family: monospace; font-size: 32px; font-weight: bold; color: #800000; letter-spacing: 4px;">${otp}</span>
          </div>
          
          <p style="font-size: 12px; color: #666; line-height: 1.5; background-color: #f7f7f7; padding: 12px; border-left: 3px solid #800000; border-radius: 0 4px 4px 0;">
            <strong>Warning:</strong> This code is valid for this session only. Do not share this OTP with anyone. If you did not initiate this request, you can safely ignore this email.
          </p>
          
          <p style="font-size: 11px; color: #aaa; margin-top: 30px; text-align: center; border-top: 1px solid #f0f0f0; padding-top: 15px;">
            This email was sent automatically from your website's secure admin portal.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'OTP email sent successfully' });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Failed to send email: ' + error.message });
  }
};
