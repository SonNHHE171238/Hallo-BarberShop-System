const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Cart = require('../models/cart.model');
const { PayOS } = require("@payos/node");

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY
});

// Tạo đơn hàng mới
exports.createOrder = async (req, res, next) => {
  try {
    const { items, customerName, customerPhone, shippingAddress, paymentMethod } = req.body;
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

    const newOrder = new Order({
      userId,
      customerName,
      customerPhone,
      shippingAddress,
      items: orderItems,
      totalAmount,
      paymentMethod,
      orderCode
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
        amount: totalAmount,
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
        const paymentLinkResponse = await payos.createPaymentLink(body);
        paymentUrl = paymentLinkResponse.checkoutUrl;
      } catch (payosError) {
        console.error("Lỗi tạo PayOS link:", payosError);
        return res.status(500).json({ success: false, message: 'Đã tạo đơn hàng nhưng lỗi tạo link thanh toán' });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: newOrder,
      paymentUrl
    });

  } catch (error) {
    next(error);
  }
};

// Khách hàng: Lịch sử mua hàng
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('items.productId', 'name image')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// Admin: Lấy tất cả đơn hàng
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('items.productId', 'name image')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// Admin: Cập nhật trạng thái
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    res.json({ success: true, message: 'Cập nhật trạng thái thành công', data: order });
  } catch (error) {
    next(error);
  }
};
