const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') return `http://${window.location.hostname}:5000/api`;
  return 'http://localhost:5000/api';
};

export const fetchWithAuth = async (endpoint, options = {}) => {
  const url = `${getBaseUrl()}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
    credentials: 'include', // Important to send cookies
  };

  let response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    throw new Error('Lỗi kết nối máy chủ. Vui lòng kiểm tra lại đường truyền hoặc xem backend đã chạy chưa.');
  }
  
  // Try to parse json response
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = {};
  }

  if (!response.ok || data.success === false) {
    throw new Error(data.message || data.error_code || 'Có lỗi xảy ra khi kết nối máy chủ.');
  }

  // Tự động bóc vỏ data nếu Backend trả về định dạng { success, message, data }
  if (data && data.success && data.data !== undefined) {
    return data.data;
  }

  return data;
};
