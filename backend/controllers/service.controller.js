const Service = require('../models/service.model');
const { validateServiceInput, sanitizeServiceData } = require('../utils/serviceValidation');

/**
 * Create a new service
 * POST /api/services
 */
exports.createService = async (req, res) => {
  try {
    // Validate input
    const validation = validateServiceInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Dữ liệu không hợp lệ',
        errors: validation.errors
      });
    }

    // Sanitize data
    const sanitizedData = sanitizeServiceData(req.body);

    // Create service
    const newService = new Service(sanitizedData);
    const savedService = await newService.save();

    res.status(201).json({
      message: 'Dịch vụ đã được tạo thành công',
      data: savedService
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Lỗi tạo dịch vụ', error: error.message });
  }
};

/**
 * Get all services
 * GET /api/services
 */
exports.getAllServices = async (req, res) => {
  try {
    const {
      category,
      isActive = true,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 20
    } = req.query;

    // Build filter
    const filter = {};

    if (isActive !== 'all') {
      filter.isActive = isActive === 'true' || isActive === true;
    }

    if (category) {
      filter.category = category;
    }

    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Build sort
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Query
    const total = await Service.countDocuments(filter);
    const services = await Service.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      message: 'Danh sách dịch vụ',
      data: services,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error getting services:', error);
    res.status(500).json({ message: 'Lỗi lấy danh sách dịch vụ', error: error.message });
  }
};

/**
 * Get service by ID
 * GET /api/services/:id
 */
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    }

    res.status(200).json({
      message: 'Chi tiết dịch vụ',
      data: service
    });
  } catch (error) {
    console.error('Error getting service:', error);
    res.status(500).json({ message: 'Lỗi lấy chi tiết dịch vụ', error: error.message });
  }
};

/**
 * Update service
 * PUT /api/services/:id
 */
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if service exists
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    }

    // Validate input (only validate fields that are provided)
    const updateData = {};
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.price !== undefined) updateData.price = req.body.price;
    if (req.body.durationMinutes !== undefined) updateData.durationMinutes = req.body.durationMinutes;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.hairTypes !== undefined) updateData.hairTypes = req.body.hairTypes;
    if (req.body.styleCompatibility !== undefined) updateData.styleCompatibility = req.body.styleCompatibility;
    if (req.body.expertiseRequired !== undefined) updateData.expertiseRequired = req.body.expertiseRequired;
    if (req.body.images !== undefined) updateData.images = req.body.images;
    if (req.body.steps !== undefined) updateData.steps = req.body.steps;
    if (req.body.suggestedFor !== undefined) updateData.suggestedFor = req.body.suggestedFor;
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;
    if (req.body.popularity !== undefined) updateData.popularity = req.body.popularity;

    const validation = validateServiceInput(updateData);
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Dữ liệu không hợp lệ',
        errors: validation.errors
      });
    }

    // Sanitize and update
    const sanitizedData = sanitizeServiceData(updateData);
    const updatedService = await Service.findByIdAndUpdate(
      id,
      sanitizedData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Dịch vụ đã được cập nhật thành công',
      data: updatedService
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Lỗi cập nhật dịch vụ', error: error.message });
  }
};

/**
 * Delete service
 * DELETE /api/services/:id
 */
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    }

    res.status(200).json({
      message: 'Dịch vụ đã được xóa thành công',
      data: service
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Lỗi xóa dịch vụ', error: error.message });
  }
};

/**
 * Get service categories
 * GET /api/services/meta/categories
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = ['cut', 'perm', 'color', 'combo', 'styling', 'treatment'];
    res.status(200).json({
      message: 'Danh sách danh mục dịch vụ',
      data: categories
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ message: 'Lỗi lấy danh mục', error: error.message });
  }
};

/**
 * Bulk update service status (activate/deactivate)
 * PUT /api/services/bulk/status
 */
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { serviceIds, isActive } = req.body;

    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.status(400).json({ message: 'serviceIds phải là mảng không trống' });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive phải là boolean' });
    }

    const result = await Service.updateMany(
      { _id: { $in: serviceIds } },
      { isActive }
    );

    res.status(200).json({
      message: 'Trạng thái dịch vụ đã được cập nhật',
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    });
  } catch (error) {
    console.error('Error bulk updating services:', error);
    res.status(500).json({ message: 'Lỗi cập nhật hàng loạt', error: error.message });
  }
};

/**
 * Get service statistics
 * GET /api/services/stats
 */
exports.getServiceStats = async (req, res) => {
  try {
    const stats = await Service.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPopularity: { $avg: '$popularity' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const total = await Service.countDocuments();
    const activeCount = await Service.countDocuments({ isActive: true });

    res.status(200).json({
      message: 'Thống kê dịch vụ',
      data: {
        total,
        activeCount,
        inactiveCount: total - activeCount,
        byCategory: stats
      }
    });
  } catch (error) {
    console.error('Error getting service stats:', error);
    res.status(500).json({ message: 'Lỗi lấy thống kê', error: error.message });
  }
};
