const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Cart = require('../models/cart.model');
const User = require('../models/user.model');
const voucherController = require('./voucher.controller');
const { PayOS } = require("@payos/node");

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY
});

// Tạo đơn hàng mới
exports.createOrder = async (req, res, next) => {
  try {
    const { items, customerName, customerPhone, shippingAddress, paymentMethod, voucherCode } = req.body;
    const userId = req.user ? req.user.id : null; // Hỗ trợ cả guest

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
    }

    let totalAmount = 0;
    const orderItems = [];

    // Verify stock and calculate total
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `Sản phẩm không tồn tại hoặc đã ngừng bán` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Sản phẩm ${product.name} không đủ số lượng tồn kho` });
      }

      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price
      });
      totalAmount += product.price * item.quantity;

      // Reduce stock (Should ideally be in a transaction, but for simplicity here)
      product.stock -= item.quantity;
      await product.save();
    }

    // Generate unique order code (Number) for PayOS
    const orderCode = Number(String(Date.now()).slice(-6) + Math.floor(Math.random() * 1000));

    // Process Voucher Lock
    let discountAmount = 0;
    let voucherLockId = null;
    let appliedVoucherCode = null;

    if (voucherCode) {
      try {
        const lockInfo = await voucherController.validateAndLockVoucher(voucherCode, totalAmount, userId, customerPhone);
        if (lockInfo) {
          discountAmount = lockInfo.discountAmount;
          voucherLockId = lockInfo.lockId;
          appliedVoucherCode = voucherCode.toUpperCase();
        }
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Lỗi mã giảm giá: ' + err.message });
      }
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount);

    const newOrder = new Order({
      userId,
      customerName,
      customerPhone,
      shippingAddress,
      items: orderItems,
      totalAmount: finalAmount, // Save the final amount to be paid
      paymentMethod,
      orderCode,
      historyLog: [{
        action: 'Khởi tạo đơn hàng',
        actor: userId ? customerName : 'Khách vãng lai (Guest)',
        note: 'Đơn hàng được tạo thành công trên hệ thống.',
      }],
      voucherCode: appliedVoucherCode,
      discountAmount,
      voucherLockId
    });

    await newOrder.save();

    // Clear cart if user is logged in
    if (userId) {
      // Clear only items that were ordered
      const productIds = orderItems.map(i => i.productId);
      await Cart.deleteMany({ userId, productId: { $in: productIds } });
    }

    // Xử lý PayOS
    let paymentUrl = null;
    if (paymentMethod === 'payos') {
      const body = {
        orderCode: orderCode,
        amount: finalAmount,
        description: `Thanh toan don hang`,
        items: orderItems.map(item => ({
          name: `SP ${item.productId}`, // You can pass real name if needed
          quantity: item.quantity,
          price: item.priceAtPurchase
        })),
        returnUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/shop/checkout/success`,
        cancelUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/shop/checkout/cancel`
      };

      try {
        const paymentLinkResponse = await payos.paymentRequests.create(body);
        paymentUrl = paymentLinkResponse.checkoutUrl;

        return res.status(201).json({
          success: true,
          message: 'Đặt hàng thành công',
          data: newOrder,
          paymentUrl,
          qrCode: paymentLinkResponse.qrCode
        });
      } catch (payosError) {
        console.error("Lỗi tạo PayOS link:", payosError);
        return res.status(500).json({
          success: false,
          message: 'Đã tạo đơn hàng nhưng lỗi tạo link thanh toán PayOS',
          error: payosError.message || payosError.toString()
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: newOrder,
      paymentUrl: null
    });

  } catch (error) {
    next(error);
  }
};

exports.trackOrderByCode = async (req, res, next) => {
  try {
    const orderCode = Number(req.params.code);
    const order = await Order.findOne({ 
      $or: [
        { orderCode: orderCode },
        { previousOrderCodes: orderCode }
      ]
    }).populate('items.productId', 'name image price brand');
      
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng với mã này' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// Khách hàng: Tạo lại mã thanh toán PayOS
exports.recreatePaymentLink = async (req, res, next) => {
  try {
    const orderCode = Number(req.params.code);
    const order = await Order.findOne({ 
      $or: [
        { orderCode: orderCode },
        { previousOrderCodes: orderCode }
      ]
    });
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    if (order.paymentStatus === 'paid') return res.status(400).json({ success: false, message: 'Đơn hàng đã được thanh toán' });
    
    // Lưu lại orderCode cũ để sau này tra cứu vẫn ra
    if (order.orderCode) {
      if (!order.previousOrderCodes) order.previousOrderCodes = [];
      order.previousOrderCodes.push(order.orderCode);
    }

    // Tạo orderCode mới để tránh lỗi duplicate của PayOS
    const newOrderCode = Number(String(Date.now()).slice(-6) + Math.floor(Math.random() * 1000));
    order.orderCode = newOrderCode;
    await order.save();
    
    const body = {
      orderCode: newOrderCode,
      amount: order.totalAmount,
      description: `Thanh toan don hang`,
      returnUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/shop/orders/${newOrderCode}`,
      cancelUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/shop/orders/${newOrderCode}`
    };
    
    const paymentLinkRes = await payos.paymentRequests.create(body);
    res.json({
      success: true,
      data: {
        qrCode: paymentLinkRes.qrCode,
        checkoutUrl: paymentLinkRes.checkoutUrl,
        bin: paymentLinkRes.bin,
        accountName: paymentLinkRes.accountName,
        accountNumber: paymentLinkRes.accountNumber,
        amount: order.totalAmount,
        orderCode: newOrderCode
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.lookupOrdersByPhone = async (req, res, next) => {
  try {
    const { phone } = req.params;
    // Tìm các đơn hàng có số điện thoại này
    // Chỉ trả về các trường cơ bản để bảo vệ thông tin
    const orders = await Order.find({ customerPhone: phone })
      .select('orderCode status paymentStatus paymentMethod totalAmount createdAt items')
      .populate('items.productId', 'name image') // Populate ảnh và tên sp để show preview
      .sort({ createdAt: -1 })
      .limit(20);
      
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// Khách hàng: Lịch sử mua hàng
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .populate('items.productId', 'name image')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// Admin: Lấy thống kê đơn hàng
exports.getOrderStats = async (req, res, next) => {
  try {
    const [total, pending, shipped, completed] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'completed' })
    ]);

    res.json({
      success: true,
      data: { total, pending, shipped, completed }
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Lấy tất cả đơn hàng
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, searchTerm, orderStatus, paymentStatus, paymentMethod, filterDate } = req.query;
    
    let filter = {};

    if (filterDate) {
      const targetDate = new Date(filterDate);
      if (!isNaN(targetDate.getTime())) {
        const start = new Date(targetDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(targetDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt = { $gte: start, $lte: end };
      }
    }
    
    if (searchTerm) {
      filter.$or = [
        { customerName: { $regex: searchTerm, $options: 'i' } },
        { customerPhone: { $regex: searchTerm, $options: 'i' } }
      ];
      if (!isNaN(Number(searchTerm))) {
        filter.$or.push({ orderCode: Number(searchTerm) });
      }
    }
    
    if (orderStatus && orderStatus !== 'Tất cả' && orderStatus !== 'Trạng thái ĐH') {
      const statusMap = {
        "Chờ xử lý": "pending",
        "Đang chuẩn bị": "processing",
        "Đang giao": "shipped",
        "Hoàn thành": "completed",
        "Đã hủy": "cancelled"
      };
      if (statusMap[orderStatus]) filter.status = statusMap[orderStatus];
    }
    
    if (paymentStatus && paymentStatus !== 'Tất cả' && paymentStatus !== 'Trạng thái TT') {
      const pStatusMap = {
        "Chờ thanh toán": "pending",
        "Đã thanh toán": "paid",
        "Thất bại": "failed"
      };
      if (pStatusMap[paymentStatus]) filter.paymentStatus = pStatusMap[paymentStatus];
    }
    
    if (paymentMethod && paymentMethod !== 'Tất cả' && paymentMethod !== 'PT Thanh toán') {
      const pMethodMap = {
        "COD": "cod",
        "QR Pay": { $in: ["payos", "bank_transfer"] }
      };
      if (pMethodMap[paymentMethod]) filter.paymentMethod = pMethodMap[paymentMethod];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Order.countDocuments(filter);
    
    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .populate('items.productId', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    res.json({ 
      success: true, 
      data: {
        orders,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Lấy chi tiết 1 đơn hàng
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('items.productId', 'name image');
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// Admin: Cập nhật trạng thái
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    let actor = 'System';
    if (req.userId) {
      const adminUser = await User.findById(req.userId);
      if (adminUser) actor = adminUser.name;
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    // Chỉ log khi thực sự có thay đổi trạng thái
    if (order.status !== status) {
      const actionLabels = {
        pending: 'Đưa về chờ xác nhận',
        processing: 'Xác nhận & Bắt đầu chuẩn bị',
        shipped: 'Giao cho đơn vị vận chuyển',
        completed: 'Giao hàng thành công',
        cancelled: 'Hủy đơn hàng'
      };

      order.status = status;
      order.historyLog.push({
        action: actionLabels[status] || `Đổi trạng thái: ${status}`,
        actor: actor,
        note: note || '',
      });

      // Nếu trạng thái là completed và đã thanh toán
      if (status === 'completed' && order.paymentStatus === 'paid') {
        order.historyLog.push({
          action: 'Đơn hàng giao dịch thành công',
          actor: 'System',
          note: 'Đơn hàng đã hoàn tất giao hàng và thanh toán đầy đủ.',
        });
      }

      // Redeem voucher lock if order is completed (for COD or admin manually completing)
      if (status === 'completed' && order.voucherLockId) {
        try {
          const voucherController = require('./voucher.controller');
          await voucherController.redeemVoucherLock(order.voucherLockId);
        } catch (err) {
          console.error("Failed to redeem voucher lock for completed order:", err);
        }
      }

      // Release voucher lock if order is cancelled
      if (status === 'cancelled' && order.voucherLockId) {
        try {
          const voucherController = require('./voucher.controller');
          await voucherController.releaseVoucherLock(order.voucherLockId);
        } catch (err) {
          console.error("Failed to release voucher lock for order:", err);
        }
      }
    }

    await order.save();
    res.json({ success: true, message: 'Cập nhật trạng thái thành công', data: order });
  } catch (error) {
    next(error);
  }
};

// Admin: Cập nhật ghi chú nội bộ
exports.updateInternalNote = async (req, res, next) => {
  try {
    const { internalNote } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { internalNote }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    res.json({ success: true, message: 'Cập nhật ghi chú thành công', data: order });
  } catch (error) {
    next(error);
  }
};

// Admin: Xác nhận đã thu tiền COD
exports.confirmCODPayment = async (req, res, next) => {
  try {
    let actor = 'System';
    if (req.userId) {
      const adminUser = await User.findById(req.userId);
      if (adminUser) actor = adminUser.name;
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    if (order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.historyLog.push({
        action: 'Xác nhận đã thu tiền COD',
        actor: actor,
        note: 'Admin xác nhận đã nhận được tiền mặt từ khách hàng/shipper.',
      });

      if (order.status === 'completed') {
        order.historyLog.push({
          action: 'Đơn hàng giao dịch thành công',
          actor: 'System',
          note: 'Đơn hàng đã hoàn tất giao hàng và thanh toán đầy đủ.',
        });
      }
      await order.save();
    }

    res.json({ success: true, message: 'Xác nhận thu tiền thành công', data: order });
  } catch (error) {
    next(error);
  }
};
