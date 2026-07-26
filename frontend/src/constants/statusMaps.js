/**
 * Map configurations for Order Statuses
 */
export const ORDER_STATUS_MAP = {
  'pending': { label: 'Đơn mới', color: 'text-primary border-primary bg-primary/10', bg: 'bg-primary text-on-primary' },
  'processing': { label: 'Đang chuẩn bị', color: 'text-secondary border-secondary bg-secondary/10', bg: 'bg-secondary text-on-secondary' },
  'shipped': { label: 'Đang giao hàng', color: 'text-tertiary border-tertiary bg-tertiary/10', bg: 'bg-tertiary text-on-tertiary' },
  'completed': { label: 'Hoàn thành', color: 'text-success border-success bg-success/10', bg: 'bg-success text-on-success' },
  'cancelled': { label: 'Đã hủy', color: 'text-error border-error bg-error/10', bg: 'bg-error text-on-error' }
};

/**
 * Get configuration for an order status
 * @param {string} status 
 * @returns {Object} { label, color, bg }
 */
export const getOrderStatusConfig = (status) => {
  return ORDER_STATUS_MAP[status] || { label: status || 'N/A', color: 'text-outline border-outline bg-surface-container', bg: 'bg-surface-variant text-on-surface-variant' };
};


/**
 * Map configurations for Booking Statuses
 */
export const BOOKING_STATUS_MAP = {
  'pending': { label: 'Đang chờ', icon: 'pending', color: 'text-warning border-warning/30 bg-warning/10' },
  'confirmed': { label: 'Đã cọc/Giữ chỗ', icon: 'event_available', color: 'text-info border-info/30 bg-info/10' },
  'completed': { label: 'Hoàn thành', icon: 'check_circle', color: 'text-success border-success/30 bg-success/10' },
  'cancelled': { label: 'Đã hủy', icon: 'cancel', color: 'text-error border-error/30 bg-error/10' },
  'no_show': { label: 'Không tới', icon: 'person_off', color: 'text-error border-error/30 bg-error/10' },
  'rejected': { label: 'Từ chối', icon: 'do_not_disturb_on', color: 'text-error border-error/30 bg-error/10' }
};

/**
 * Get configuration for a booking status
 * @param {string} status 
 * @returns {Object} { label, icon, color }
 */
export const getBookingStatusConfig = (status) => {
  return BOOKING_STATUS_MAP[status] || { label: 'Đang phục vụ', icon: 'sync', color: 'text-primary border-primary/30 bg-primary/10' };
};
