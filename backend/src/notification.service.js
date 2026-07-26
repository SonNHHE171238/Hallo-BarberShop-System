const Notification = require('../models/notification.model');
const { getIO } = require('./socket');

const sendNotificationToUser = async (userId, title, message, type = 'system', link = null) => {
  try {
    if (!userId) return null; // Không tạo thông báo cho guest

    // Lưu vào DB
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      link
    });
    await notification.save();

    // Phát qua Socket.IO nếu có
    try {
      const io = getIO();
      io.to(`room_user_${userId}`).emit('new_notification', notification);
    } catch (socketErr) {
      console.log('Socket.io không khả dụng hoặc chưa khởi tạo');
    }

    return notification;
  } catch (error) {
    console.error('Lỗi khi tạo và gửi thông báo:', error);
    return null;
  }
};

const sendNotificationToAdmins = async (title, message, type = 'system', link = null) => {
  try {
    // Phát qua Socket.IO tới room admin
    try {
      const io = getIO();
      // Không lưu DB cho Admin, chỉ phát qua socket realtime
      io.to(`room_role_admin`).emit('new_notification', {
        title,
        message,
        type,
        link,
        createdAt: new Date()
      });
    } catch (socketErr) {
      console.log('Socket.io không khả dụng hoặc chưa khởi tạo');
    }
  } catch (error) {
    console.error('Lỗi khi gửi thông báo cho Admin:', error);
  }
};

module.exports = {
  sendNotificationToUser,
  sendNotificationToAdmins
};
