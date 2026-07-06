import { fetchWithAuth } from './api';

export const voucherService = {
  // Admin endpoints
  getAllVouchers: async (params = {}) => {
    try {
      // Remove undefined params
      const cleanParams = Object.entries(params).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null && v !== '') acc[k] = v;
        return acc;
      }, {});
      
      const queryParams = new URLSearchParams(cleanParams).toString();
      const url = queryParams ? `/vouchers?${queryParams}` : '/vouchers';
      return await fetchWithAuth(url, { method: 'GET', fullResponse: true });
    } catch (error) {
      throw error;
    }
  },

  createVoucher: async (data) => {
    try {
      return await fetchWithAuth('/vouchers', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw error;
    }
  },

  updateVoucher: async (id, data) => {
    try {
      return await fetchWithAuth(`/vouchers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw error;
    }
  },

  deleteVoucher: async (id) => {
    try {
      return await fetchWithAuth(`/vouchers/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw error;
    }
  },

  // Customer endpoints
  applyVoucher: async (code, totalAmount, customerPhone = null) => {
    try {
      return await fetchWithAuth('/vouchers/apply', {
        method: 'POST',
        body: JSON.stringify({ code, totalAmount, customerPhone }),
      });
    } catch (error) {
      const msg = error.message || "";
      let errorMsg = "Mã giảm giá không hợp lệ";
      
      if (msg.includes("Voucher code and total amount are required")) errorMsg = "Vui lòng nhập mã giảm giá";
      else if (msg.includes("Invalid or inactive voucher")) errorMsg = "Mã giảm giá không tồn tại hoặc đã bị khóa";
      else if (msg.includes("not yet valid")) errorMsg = "Mã giảm giá chưa đến thời gian áp dụng";
      else if (msg.includes("expired")) errorMsg = "Mã giảm giá đã hết hạn";
      else if (msg.includes("usage limit reached")) errorMsg = "Mã giảm giá đã hết lượt sử dụng";
      else if (msg.includes("Minimum order value")) errorMsg = "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này";
      else if (msg.includes("maximum usage limit")) errorMsg = "Bạn đã dùng hết số lượt của mã giảm giá này";
      else if (msg.includes("Only logged in users")) errorMsg = "Bạn cần đăng nhập để dùng mã giảm giá này";
      
      error.message = errorMsg;
      throw error;
    }
  }
};
