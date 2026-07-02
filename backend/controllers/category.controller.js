const Category = require('../models/category.model');

// Lấy tất cả danh mục (có thể lọc theo isActive)
exports.getAllCategories = async (req, res, next) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === 'true' ? {} : { isActive: true };
    const categories = await Category.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// Admin: Tạo danh mục mới
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Tên danh mục là bắt buộc' });
    
    const newCategory = new Category({ name, description });
    await newCategory.save();
    res.status(201).json({ success: true, data: newCategory, message: 'Tạo danh mục thành công' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Tên danh mục đã tồn tại' });
    next(error);
  }
};

// Admin: Sửa danh mục
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    const category = await Category.findByIdAndUpdate(id, { name, description, isActive }, { new: true });
    
    if (!category) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    res.json({ success: true, data: category, message: 'Cập nhật thành công' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Tên danh mục đã tồn tại' });
    next(error);
  }
};

// Admin: Xóa danh mục
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    
    res.json({ success: true, message: 'Xóa danh mục thành công' });
  } catch (error) {
    next(error);
  }
};
