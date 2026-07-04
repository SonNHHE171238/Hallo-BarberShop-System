const fs = require('fs');
const errorHandler = (err, req, res, next) => {
  console.error('[Global Error]:', err);
  fs.appendFileSync('error.log', new Date().toISOString() + ' ' + err.stack + '\n');
  const statusCode = err.statusCode || 500;
  const isClientError = statusCode >= 400 && statusCode < 500;
  let message = (err.isOperational || isClientError) ? err.message : 'Có l?i x?y ra t? máy ch?, vui lòng th? l?i sau';
  const errorCode = err.errorCode || 'INTERNAL_ERROR';
  res.status(statusCode).json({
    success: false,
    message: message,
    errorCode: errorCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
module.exports = errorHandler;
