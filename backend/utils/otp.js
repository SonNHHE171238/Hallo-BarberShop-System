/** 6-digit numeric OTP for email verification */
exports.generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

exports.getOtpTtlMs = () => {
  const minutes = parseInt(process.env.OTP_EXPIRES_MINUTES || '10', 10);
  return (Number.isFinite(minutes) && minutes > 0 ? minutes : 10) * 60 * 1000;
};
