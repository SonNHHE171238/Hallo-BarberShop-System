const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) {
    return null;
  }

  const host = process.env.EMAIL_HOST;
  if (host) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user, pass },
    });
  } else {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  return transporter;
}

exports.sendOtpEmail = async (to, plainOtp) => {
  const transport = getTransporter();
  if (!transport) {
    throw new Error('Email is not configured (set EMAIL_USER and EMAIL_PASS in .env)');
  }

  const minutes = parseInt(process.env.OTP_EXPIRES_MINUTES || '10', 10);
  const ttlMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : 10;
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  await transport.sendMail({
    from: `"Barbershop" <${from}>`,
    to,
    subject: 'Mã xác thực đăng ký tài khoản Barbershop',
    text: [
      'Xin chào,',
      '',
      `Mã OTP xác thực email của bạn là: ${plainOtp}`,
      `Mã có hiệu lực trong ${ttlMinutes} phút.`,
      '',
      'Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.',
      '',
      'Trân trọng,',
      'Barbershop',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Xác thực đăng ký Barbershop</h2>
        <p>Xin chào,</p>
        <p>Mã OTP xác thực email của bạn là:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #c9a227;">${plainOtp}</p>
        <p>Mã có hiệu lực trong <strong>${ttlMinutes} phút</strong>.</p>
        <p style="color: #666; font-size: 14px;">Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.</p>
        <p>Trân trọng,<br/>Barbershop</p>
      </div>
    `,
  });
};

exports.sendPasswordResetEmail = async (to, resetLink) => {
  const transport = getTransporter();
  if (!transport) {
    throw new Error('Email is not configured (set EMAIL_USER and EMAIL_PASS in .env)');
  }

  const minutes = parseInt(process.env.RESET_TOKEN_EXPIRES_MINUTES || '60', 10);
  const ttlMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : 60;
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  await transport.sendMail({
    from: `"Barbershop" <${from}>`,
    to,
    subject: 'Đặt lại mật khẩu Barbershop',
    text: [
      'Xin chào,',
      '',
      'Bạn vừa yêu cầu đặt lại mật khẩu. Nhấn vào liên kết sau:',
      resetLink,
      '',
      `Liên kết có hiệu lực trong ${ttlMinutes} phút.`,
      'Nếu bạn không yêu cầu, vui lòng bỏ qua email này.',
      '',
      'Trân trọng,',
      'Barbershop',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Đặt lại mật khẩu</h2>
        <p>Xin chào,</p>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu. Nhấn nút bên dưới:</p>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${resetLink}" style="background: #c9a227; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Đặt lại mật khẩu</a>
        </p>
        <p style="color: #666; font-size: 14px;">Hoặc copy link: <br/><a href="${resetLink}">${resetLink}</a></p>
        <p style="color: #666; font-size: 14px;">Liên kết có hiệu lực trong <strong>${ttlMinutes} phút</strong>.</p>
        <p>Trân trọng,<br/>Barbershop</p>
      </div>
    `,
  });
};
