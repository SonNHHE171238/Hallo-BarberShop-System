const Brand = require('../models/brand.model');
const Product = require('../models/product.model');

// Lấy tất cả thương hiệu (có thể lọc theo isActive)
exports.getAllBrands = async (req, res, next) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === 'true' ? {} : { isActive: true };
    const brands = await Brand.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: brands });
  } catch (error) {
    next(error);
  }
};

// Admin: Tạo thương hiệu mới
exports.createBrand = async (req, res, next) => {
  try {
    const { name, description, logoUrl } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Tên hãng là bắt buộc' });
    
    const newBrand = new Brand({ name, description, logoUrl });
    await newBrand.save();
    res.status(201).json({ success: true, data: newBrand, message: 'Tạo hãng thành công' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Tên hãng đã tồn tại' });
    next(error);
  }
};

// Admin: Sửa thương hiệu
exports.updateBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, logoUrl, isActive } = req.body;
    
    // Nếu đổi tên hãng, phải cập nhật luôn tên hãng ở tất cả sản phẩm đang dùng hãng này
    const brandToUpdate = await Brand.findById(id);
    if (!brandToUpdate) return res.status(404).json({ success: false, message: 'Không tìm thấy hãng' });

    const oldName = brandToUpdate.name;

    brandToUpdate.name = name || brandToUpdate.name;
    brandToUpdate.description = description !== undefined ? description : brandToUpdate.description;
    brandToUpdate.logoUrl = logoUrl !== undefined ? logoUrl : brandToUpdate.logoUrl;
    brandToUpdate.isActive = isActive !== undefined ? isActive : brandToUpdate.isActive;

    await brandToUpdate.save();

    // Nếu tên hãng thay đổi, cập nhật tên hãng trong Product collection
    if (name && oldName !== name) {
        await Product.updateMany({ brand: oldName }, { brand: name });
    }
    
    res.json({ success: true, data: brandToUpdate, message: 'Cập nhật thành công' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Tên hãng đã tồn tại' });
    next(error);
  }
};

// Admin: Xóa thương hiệu
exports.deleteBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findById(id);
    if (!brand) return res.status(404).json({ success: false, message: 'Không tìm thấy hãng' });
    
    // Kiểm tra xem có sản phẩm nào đang dùng hãng này không
    const productsUsingBrand = await Product.findOne({ brand: brand.name });
    if (productsUsingBrand) {
        return res.status(400).json({ 
            success: false, 
            message: 'Không thể xóa hãng vì đang có sản phẩm thuộc hãng này. Vui lòng chuyển sản phẩm sang hãng khác hoặc xóa sản phẩm trước.' 
        });
    }

    await Brand.findByIdAndDelete(id);
    
    res.json({ success: true, message: 'Xóa hãng thành công' });
  } catch (error) {
    next(error);
  }
};
