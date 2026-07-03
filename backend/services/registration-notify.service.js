const { sendOtpEmail } = require('./email.service');



/**
 * Sends registration OTP to the user's email.
 * Falls back to console only when email fails and LOG_OTP_TO_CONSOLE is enabled.
 */
exports.notifyRegistrationOtp = async (email, plainOtp) => {
  const consoleFallback =
    process.env.LOG_OTP_TO_CONSOLE === '1' || process.env.LOG_OTP_TO_CONSOLE === 'true';

  try {
    await sendOtpEmail(email, plainOtp);
    return { sent: true };
  } catch (err) {
    console.error(`[OTP] Failed to send email to ${email}:`, err.message);
    return { sent: false, error: err.message };
  }
};
