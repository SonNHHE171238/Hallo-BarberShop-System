const cron = require('node-cron');
const VoucherLock = require('../../models/voucher-lock.model');
const Booking = require('../../models/booking.model');
const Order = require('../../models/order.model');

// Run every 1 minute
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    
    // Find expired locks that are still holding
    const expiredLocks = await VoucherLock.find({
      status: 'holding',
      expiresAt: { $lte: now }
    });

    if (expiredLocks.length === 0) return;

    console.log(`[Voucher Cleanup] Found ${expiredLocks.length} expired locks. Releasing...`);

    for (const lock of expiredLocks) {
      // 1. Release the lock
      lock.status = 'released';
      await lock.save();

      // 2. Check and cancel associated Booking if it is still pending
      // Wait, we don't save bookingId or orderId in the lock right now in validateAndLockVoucher 
      // because the lock is created BEFORE the booking/order is saved. 
      // However, we can find the Booking/Order that has this voucherLockId.
      const associatedBooking = await Booking.findOne({ voucherLockId: lock._id, status: 'pending', paymentMethod: 'payos' });
      if (associatedBooking) {
        associatedBooking.status = 'cancelled';
        associatedBooking.note = (associatedBooking.note || '') + '\n[Hệ thống] Hủy do hết thời gian thanh toán (Voucher Lock expired)';
        await associatedBooking.save();
        console.log(`[Voucher Cleanup] Cancelled pending booking ${associatedBooking._id}`);
      }

      const associatedOrder = await Order.findOne({ voucherLockId: lock._id, status: 'pending', paymentMethod: 'payos' });
      if (associatedOrder) {
        associatedOrder.status = 'cancelled';
        await associatedOrder.save();
        console.log(`[Voucher Cleanup] Cancelled pending order ${associatedOrder._id}`);
      }
    }
  } catch (error) {
    console.error('[Voucher Cleanup] Error:', error);
  }
});
