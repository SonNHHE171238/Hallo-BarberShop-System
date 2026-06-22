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

exports.optionalAuthenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      (authHeader?.startsWith('Bearer ') && authHeader.split(' ')[1]) ||
      req.cookies?.accessToken;

    if (!token) {
      return next(); // Proceed without authentication
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId || decoded.id;
    req.role = decoded.role;
    next();
  } catch (error) {
    // If token is invalid or expired, we can either ignore it and treat as guest,
    // or return 401. Usually, it's safer to treat as guest if optional,
    // but returning 401 prevents users from using expired tokens unknowingly.
    // We will just proceed as guest.
    console.error("Invalid token in optionalAuthenticate, proceeding as guest:", error.message);
    next();
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
