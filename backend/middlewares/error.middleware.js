/**
 * Global Error Handler Middleware
 * Bắt tất cả các lỗi được đẩy xuống từ `next(error)` ở Controller
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Global Error]:', err);

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';
  const errorCode = err.errorCode || 'INTERNAL_ERROR';

  // Định dạng JSON trả về chuẩn
  res.status(statusCode).json({
    success: false,
    message: message,
    errorCode: errorCode,
    // Chỉ hiển thị stack trace trên môi trường dev
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
