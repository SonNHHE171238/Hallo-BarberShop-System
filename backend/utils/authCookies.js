const ACCESS_COOKIE = 'accessToken';
const REFRESH_COOKIE = 'refreshToken';

const baseOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
});

const setAuthCookies = (res, accessToken, refreshToken) => {
  const base = baseOptions();
  const accessMs = parseExpiresToMs(process.env.JWT_ACCESS_EXPIRES || '15m');
  const refreshMs = parseExpiresToMs(process.env.JWT_REFRESH_EXPIRES || '7d');

  res.cookie(ACCESS_COOKIE, accessToken, {
    ...base,
    maxAge: accessMs,
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...base,
    maxAge: refreshMs,
  });
};

const clearAuthCookies = (res) => {
  const base = baseOptions();
  res.clearCookie(ACCESS_COOKIE, base);
  res.clearCookie(REFRESH_COOKIE, base);
};

/** Parses simple exp like 15m, 7d, 24h into milliseconds (fallback 15m / 7d). */
function parseExpiresToMs(exp) {
  const match = String(exp).trim().match(/^(\d+)([smhd])$/i);
  if (!match) return 15 * 60 * 1000;
  const n = parseInt(match[1], 10);
  const u = match[2].toLowerCase();
  const mult = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return n * (mult[u] || 60 * 1000);
}

module.exports = {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  setAuthCookies,
  clearAuthCookies,
};
