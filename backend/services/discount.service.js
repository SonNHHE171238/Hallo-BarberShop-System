const Booking = require('../models/booking.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');

/**
 * Service to handle Loyalty Points and New User Discounts.
 */
class DiscountService {
  /**
   * Calculate discount amount and validate.
   * @param {Object} params - { userId, totalAmount, discountType, pointsToUse }
   * @returns {Object} { finalAmount, discountAmount, pointsUsed, discountType }
   */
  static async calculateDiscount({ userId, totalAmount, discountType, pointsToUse = 0 }) {
    if (!userId || discountType === 'none') {
      return { finalAmount: totalAmount, discountAmount: 0, pointsUsed: 0, discountType: 'none' };
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (discountType === 'new_user') {
      // Check if user is actually new (no completed bookings or orders)
      const completedBookings = await Booking.countDocuments({ customerId: userId, paymentStatus: 'paid' });
      const completedOrders = await Order.countDocuments({ userId: userId, status: 'completed' });
      
      if (completedBookings > 0 || completedOrders > 0) {
        throw new Error('Mã giảm giá Tân binh chỉ áp dụng cho lần sử dụng dịch vụ đầu tiên.');
      }

      // New User Discount Logic: 50% max 50k
      let discountAmount = totalAmount * 0.5;
      if (discountAmount > 50000) {
        discountAmount = 50000;
      }
      
      const finalAmount = Math.max(0, totalAmount - discountAmount);
      return { finalAmount, discountAmount, pointsUsed: 0, discountType };
    }

    if (discountType === 'loyalty_points') {
      if (totalAmount < 50000) {
        throw new Error('Đơn hàng phải tối thiểu 50,000đ để áp dụng tiêu điểm.');
      }

      if (pointsToUse <= 0) {
        throw new Error('Số điểm sử dụng phải lớn hơn 0.');
      }

      if (user.loyaltyPoints < pointsToUse) {
        throw new Error('Không đủ điểm trong tài khoản.');
      }

      // 1 point = 1,000 VND
      const maxDiscountValue = totalAmount * 0.5;
      const pointValue = pointsToUse * 1000;

      if (pointValue > maxDiscountValue) {
        throw new Error('Chỉ được thanh toán bằng điểm tối đa 50% tổng hóa đơn.');
      }

      const discountAmount = pointValue;
      const finalAmount = Math.max(0, totalAmount - discountAmount);

      return { finalAmount, discountAmount, pointsUsed: pointsToUse, discountType };
    }

    // Default fallback (e.g. vouchers, which is handled elsewhere or later)
    return { finalAmount: totalAmount, discountAmount: 0, pointsUsed: 0, discountType: 'none' };
  }

  /**
   * Deduct points for a user safely.
   */
  static async deductPoints(userId, pointsToUse, session = null) {
    if (!pointsToUse || pointsToUse <= 0) return;
    const user = await User.findById(userId);
    if (user.loyaltyPoints < pointsToUse) {
      throw new Error('Không đủ điểm trong tài khoản');
    }
    user.loyaltyPoints -= pointsToUse;
    await user.save({ session });
  }

  /**
   * Add flat points for completing a service.
   */
  static async addPointsForCompletion(userId, session = null) {
    if (!userId) return;
    const POINTS_EARNED = 5; // Flat 5 points
    const user = await User.findById(userId);
    if (user) {
      user.loyaltyPoints = (user.loyaltyPoints || 0) + POINTS_EARNED;
      await user.save({ session });
    }
  }

  /**
   * Revert points (add back points used, remove points earned).
   */
  static async revertPoints(userId, pointsUsed, wasCompleted, session = null) {
    if (!userId) return;
    const user = await User.findById(userId);
    if (user) {
      // Add back points they used
      if (pointsUsed > 0) {
        user.loyaltyPoints += pointsUsed;
      }
      // Remove points they earned if it was already completed
      if (wasCompleted) {
        const POINTS_EARNED = 5;
        user.loyaltyPoints = Math.max(0, user.loyaltyPoints - POINTS_EARNED);
      }
      await user.save({ session });
    }
  }
}

module.exports = DiscountService;
