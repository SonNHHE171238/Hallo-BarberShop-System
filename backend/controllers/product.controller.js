const Product = require('../models/product.model');

// Lấy danh sách sản phẩm (có filter và phân trang)
exports.getProducts = async (req, res, next) => {
  try {
    const { categoryId, brand, isBestSeller, search, includeInactive, page = 1, limit = 12 } = req.query;
    let filter = includeInactive === 'true' ? {} : { isActive: true };

    if (categoryId) filter.categoryId = categoryId;
    if (brand) filter.brand = brand;
    if (isBestSeller) filter.isBestSeller = isBestSeller === 'true';
    if (search) filter.name = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(filter);
    
    const products = await Product.find(filter)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        products,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Chi tiết sản phẩm
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId', 'name');
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// Admin: Tạo sản phẩm
exports.createProduct = async (req, res, next) => {
  try {
    // In a real app, image upload (multer) would be handled before this, and req.file or req.body.image would be used.
    // For now we assume image URL is sent in req.body.image
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct, message: 'Thêm sản phẩm thành công' });
  } catch (error) {
    next(error);
  }
};

// Admin: Sửa sản phẩm
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    res.json({ success: true, data: product, message: 'Cập nhật sản phẩm thành công' });
  } catch (error) {
    next(error);
  }
};

// Admin: Xóa sản phẩm
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    res.json({ success: true, message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    next(error);
  }
};
