const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

// Xem giỏ hàng của user hiện tại
exports.getCart = async (req, res, next) => {
  try {
    const userId = req.userId;
    const cartItems = await Cart.find({ userId }).populate('productId');
    res.json({ success: true, data: cartItems });
  } catch (error) {
    next(error);
  }
};

// Thêm sản phẩm vào giỏ hàng (hoặc tăng số lượng nếu đã có)
exports.addToCart = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { productId, quantity = 1 } = req.body;

    if (!productId) return res.status(400).json({ success: false, message: 'Thiếu thông tin sản phẩm' });

    // Kiểm tra xem sản phẩm có tồn tại và còn hàng không
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại hoặc đã ngừng bán' });
    }

    // Tìm xem sản phẩm đã có trong giỏ chưa
    let cartItem = await Cart.findOne({ userId, productId });

    if (cartItem) {
      // Tăng số lượng
      const newQuantity = cartItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({ success: false, message: 'Vượt quá số lượng tồn kho' });
      }
      cartItem.quantity = newQuantity;
      await cartItem.save();
    } else {
      if (quantity > product.stock) {
        return res.status(400).json({ success: false, message: 'Vượt quá số lượng tồn kho' });
      }
      cartItem = new Cart({ userId, productId, quantity });
      await cartItem.save();
    }

    // Populate để trả về đủ info hiển thị
    await cartItem.populate('productId');
    res.json({ success: true, data: cartItem, message: 'Đã thêm vào giỏ hàng' });
  } catch (error) {
    next(error);
  }
};

// Cập nhật số lượng của một sản phẩm trong giỏ
exports.updateCartItem = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) return res.status(400).json({ success: false, message: 'Số lượng không hợp lệ' });

    const product = await Product.findById(productId);
    if (quantity > (product ? product.stock : 0)) {
       return res.status(400).json({ success: false, message: 'Vượt quá số lượng tồn kho' });
    }

    const cartItem = await Cart.findOneAndUpdate(
      { userId, productId },
      { quantity },
      { new: true }
    ).populate('productId');

    if (!cartItem) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ' });

    res.json({ success: true, data: cartItem, message: 'Cập nhật số lượng thành công' });
  } catch (error) {
    next(error);
  }
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    const result = await Cart.findOneAndDelete({ userId, productId });
    if (!result) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ' });

    res.json({ success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
  } catch (error) {
    next(error);
  }
};
