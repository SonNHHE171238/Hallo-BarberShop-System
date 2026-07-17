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
 * Format a Date object or ISO string to standard date string
 * @param {Date|string} dateInput - Date to format
 * @returns {string} - Formatted date (e.g., 16/07/2026)
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

/**
 * Format a Date object or ISO string to standard time string
 * @param {Date|string} dateInput - Date to format
 * @returns {string} - Formatted time (e.g., 14:30)
 */
export const formatTime = (dateInput) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/**
 * Format a Date object or ISO string to date and time string
 * @param {Date|string} dateInput - Date to format
 * @returns {string} - Formatted string (e.g., 14:30 - 16/07/2026)
 */
export const formatDateTime = (dateInput) => {
  if (!dateInput) return "";
  return `${formatTime(dateInput)} - ${formatDate(dateInput)}`;
};

/**
 * Extract just the time HH:mm from a time string or Date
 * @param {string} timeString 
 * @returns {string}
 */
export const extractTimeSlot = (timeString) => {
  if (!timeString) return "";
  if (typeof timeString === 'string' && timeString.includes(':')) {
    const parts = timeString.split(':');
    return `${parts[0]}:${parts[1]}`;
  }
  return formatTime(timeString);
};
