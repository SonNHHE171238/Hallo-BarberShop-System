exports.applyRoleBasedBookingFilter = (req, res, next) => { req.bookingFilter = {}; next(); };
exports.requireAdminForBookingConfirmation = (req, res, next) => next();
exports.checkBookingUpdatePermission = (req, res, next) => next();
