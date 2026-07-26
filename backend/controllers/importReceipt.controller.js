const ImportReceipt = require('../models/import-receipt.model');
const Product = require('../models/product.model');

// Create a new import receipt
exports.createReceipt = async (req, res, next) => {
  try {
    const { items, note } = req.body;
    const userRole = req.role; // Assuming user role is attached by auth middleware
    const userId = req.userId;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất 1 sản phẩm' });
    }

    let status = 'pending';
    let approvedBy = null;

    // If admin, auto-approve
    if (userRole === 'admin') {
      status = 'approved';
      approvedBy = userId;
    }

    const receipt = new ImportReceipt({
      createdBy: userId,
      approvedBy,
      items,
      status,
      note,
    });

    await receipt.save();

    // If approved (admin), update stock immediately
    if (status === 'approved') {
      for (let item of items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    res.status(201).json({
      success: true,
      message: status === 'approved' ? 'Nhập hàng thành công' : 'Đã tạo phiếu chờ duyệt',
      data: receipt,
    });
  } catch (error) {
    next(error);
  }
};

// Get list of receipts
exports.getReceipts = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};
    
    // If staff, only see their own pending/approved receipts, or maybe all depending on requirements.
    // For now, let's let admin see all, staff see theirs.
    if (req.role !== 'admin') {
      query.createdBy = req.userId;
    }

    if (status) {
      query.status = status;
    }

    const receipts = await ImportReceipt.find(query)
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('items.productId', 'name image price stock')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: receipts,
    });
  } catch (error) {
    next(error);
  }
};

// Approve receipt (Admin only)
exports.approveReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Chỉ Admin mới có quyền duyệt phiếu' });
    }

    const receipt = await ImportReceipt.findById(id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu nhập' });
    }

    if (receipt.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Phiếu này đã được xử lý (trạng thái: ${receipt.status})` });
    }

    // Update stock
    for (let item of receipt.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    receipt.status = 'approved';
    receipt.approvedBy = req.userId;
    await receipt.save();

    res.status(200).json({
      success: true,
      message: 'Đã duyệt phiếu và cập nhật kho',
      data: receipt,
    });
  } catch (error) {
    next(error);
  }
};

// Reject receipt (Admin only)
exports.rejectReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Chỉ Admin mới có quyền từ chối phiếu' });
    }

    const receipt = await ImportReceipt.findById(id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu nhập' });
    }

    if (receipt.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Phiếu này đã được xử lý (trạng thái: ${receipt.status})` });
    }

    receipt.status = 'rejected';
    receipt.approvedBy = req.userId;
    await receipt.save();

    res.status(200).json({
      success: true,
      message: 'Đã từ chối phiếu',
      data: receipt,
    });
  } catch (error) {
    next(error);
  }
};
