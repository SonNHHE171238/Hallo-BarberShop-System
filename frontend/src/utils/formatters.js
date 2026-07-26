/**
 * Format a number to Vietnamese Dong currency format
 * @param {number} price - The price to format
 * @returns {string} - Formatted price (e.g., 100.000 ₫)
 */
export const formatPrice = (price) => {
  if (price == null) return "0 ₫";
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

/**
 * Format a Date object or ISO string to standard date string (VN timezone)
 * @param {Date|string} dateInput - Date to format
 * @returns {string} - Formatted date (e.g., 16/07/2026)
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  return d.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * Format a Date object or ISO string to standard time string (VN timezone)
 * @param {Date|string} dateInput - Date to format
 * @returns {string} - Formatted time (e.g., 14:30)
 */
export const formatTime = (dateInput) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  return d.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false });
};

/**
 * Format a Date object or ISO string to date and time string (VN timezone)
 * @param {Date|string} dateInput - Date to format
 * @returns {string} - Formatted string (e.g., 14:30 - 16/07/2026)
 */
export const formatDateTime = (dateInput) => {
  if (!dateInput) return "";
  return `${formatTime(dateInput)} - ${formatDate(dateInput)}`;
};

/**
 * Extract just the time HH:mm from a time string or Date
 * @param {string|Date} timeString 
 * @returns {string}
 */
export const extractTimeSlot = (timeString) => {
  if (!timeString) return "";
  // If it's an ISO date string or Date object
  if (timeString instanceof Date || (typeof timeString === 'string' && timeString.includes('T'))) {
    return formatTime(timeString);
  }
  // If it's a simple HH:mm string
  if (typeof timeString === 'string' && timeString.includes(':')) {
    const parts = timeString.split(':');
    return `${parts[0]}:${parts[1]}`;
  }
  return formatTime(timeString);
};
