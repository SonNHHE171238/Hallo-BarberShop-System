const Product = require('../models/product.model');

// Lấy danh sách sản phẩm (có filter và phân trang)
exports.getProducts = async (req, res, next) => {
  try {
    const { categoryId, brand, isBestSeller, search, includeInactive, page = 1, limit = 12, sort } = req.query;
    let filter = includeInactive === 'true' ? {} : { isActive: true };

    if (categoryId) filter.categoryId = categoryId;
    if (brand) filter.brand = brand;
    if (isBestSeller) filter.isBestSeller = isBestSeller === 'true';
    if (search) filter.name = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(filter);
    
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };
    else if (sort === 'price_asc') sortOptions = { price: 1 };
    else if (sort === 'stock_asc') sortOptions = { stock: 1 };
    else if (sort === 'stock_desc') sortOptions = { stock: -1 };

    const products = await Product.find(filter)
      .populate('categoryId', 'name')
      .sort(sortOptions)
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
    const productData = { ...req.body };
    if (req.file) {
      productData.image = req.file.path;
    }
    const newProduct = new Product(productData);
    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct, message: 'Thêm sản phẩm thành công' });
  } catch (error) {
    next(error);
  }
};

// Admin: Sửa sản phẩm
exports.updateProduct = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.path;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
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

// Lấy danh sách thương hiệu (Brand)
exports.getBrands = async (req, res, next) => {
  try {
    const brands = await Product.distinct('brand', { isActive: true });
    const validBrands = brands.filter(b => b && b.trim() !== '');
    res.json({ success: true, data: validBrands });
  } catch (error) {
    next(error);
  }
};

// Lấy thống kê kho hàng
exports.getProductStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();
    const lowStock = await Product.countDocuments({ stock: { $lte: 10 } });
    const Category = require('../models/category.model');
    const totalCategories = await Category.countDocuments();
    
    res.json({
      success: true,
      data: {
        totalProducts,
        lowStock,
        totalCategories,
        monthlyRevenue: 0 // Mocked since we don't have orders yet
      }
    });
  } catch (error) {
    next(error);
  }
};
