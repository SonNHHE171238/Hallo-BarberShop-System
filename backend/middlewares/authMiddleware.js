const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      (authHeader?.startsWith('Bearer ') && authHeader.split(' ')[1]) ||
      req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId || decoded.id;
    req.role = decoded.role;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.role || !roles.includes(req.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
