/**
 * Gửi Response thành công
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP Status code (200, 201)
 * @param {String} message - Thông báo thành công
 * @param {Object|Array} data - Dữ liệu trả về
 */
exports.sendSuccess = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
  };
  
  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Gửi Response thất bại (Thường dùng cho các lỗi nghiệp vụ không cần ném qua next)
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP Status code (400, 401, 403, 404, 409)
 * @param {String} message - Thông báo lỗi
 * @param {String} errorCode - Mã lỗi nội bộ để Frontend dễ xử lý
 * @param {Object} details - Chi tiết lỗi bổ sung (nếu có)
 */
exports.sendError = (res, statusCode, message, errorCode = 'ERROR', details = null) => {
  const response = {
    success: false,
    message,
    errorCode,
  };

  if (details !== null) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};
