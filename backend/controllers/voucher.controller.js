const Voucher = require("../models/voucher.model");
const VoucherLock = require("../models/voucher-lock.model");
const Order = require("../models/order.model");
const Booking = require("../models/booking.model");

// --- ADMIN APIs ---

// Create a new voucher
exports.createVoucher = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      validFrom,
      validUntil,
      usageLimit,
      usageLimitPerUser,
      isActive,
      isPublic,
      voucherType,
    } = req.body;

    if (
      discountType === "percentage" &&
      (discountValue < 0 || discountValue > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Discount percentage must be between 0 and 100",
      });
    }

    const validFromDate = new Date(validFrom);
    const validUntilDate = new Date(validUntil);
    const currentYear = new Date().getFullYear();

    if (validUntilDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Voucher end date cannot be in the past",
      });
    }

    if (validUntilDate.getFullYear() > currentYear) {
      return res.status(400).json({
        success: false,
        message: `Voucher end date cannot exceed the current year (${currentYear})`,
      });
    }

    if (validFromDate >= validUntilDate) {
      return res.status(400).json({
        success: false,
        message: "Valid until date must be after valid from date",
      });
    }

    // Check if code already exists
    const existingVoucher = await Voucher.findOne({ code: code.toUpperCase() });
    if (existingVoucher) {
      return res
        .status(400)
        .json({ success: false, message: "Voucher code already exists" });
    }

    const newVoucher = new Voucher({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      validFrom,
      validUntil,
      usageLimit,
      usageLimitPerUser: usageLimitPerUser || 1,
      isActive: isActive !== undefined ? isActive : true,
      isPublic: isPublic !== undefined ? isPublic : true,
      voucherType: voucherType || "all",
    });

    await newVoucher.save();
    return res.status(201).json({
      success: true,
      message: "Voucher created successfully",
      data: newVoucher,
    });
  } catch (error) {
    console.error("Error creating voucher:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all vouchers (with optional filtering and pagination)
exports.getVouchers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      filter.code = { $regex: req.query.search, $options: "i" };
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }

    const vouchers = await Voucher.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Voucher.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: vouchers,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get single voucher by ID
exports.getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res
        .status(404)
        .json({ success: false, message: "Voucher not found" });
    }
    return res.status(200).json({ success: true, data: voucher });
  } catch (error) {
    console.error("Error fetching voucher:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update a voucher
exports.updateVoucher = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      validFrom,
      validUntil,
      usageLimit,
      usageLimitPerUser,
      isActive,
      isPublic,
      voucherType,
    } = req.body;

    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res
        .status(404)
        .json({ success: false, message: "Voucher not found" });
    }

    const newDiscountType = discountType || voucher.discountType;
    const newDiscountValue =
      discountValue !== undefined ? discountValue : voucher.discountValue;
    if (
      newDiscountType === "percentage" &&
      (newDiscountValue < 0 || newDiscountValue > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Discount percentage must be between 0 and 100",
      });
    }

    const currentYear = new Date().getFullYear();
    const checkValidFrom = validFrom ? new Date(validFrom) : voucher.validFrom;
    const checkValidUntil = validUntil
      ? new Date(validUntil)
      : voucher.validUntil;

    if (checkValidUntil.getFullYear() > currentYear) {
      return res.status(400).json({
        success: false,
        message: `Voucher end date cannot exceed the current year (${currentYear})`,
      });
    }

    if (checkValidFrom >= checkValidUntil) {
      return res.status(400).json({
        success: false,
        message: "Valid until date must be after valid from date",
      });
    }

    // If changing code, ensure uniqueness
    if (code && code.toUpperCase() !== voucher.code) {
      const existing = await Voucher.findOne({ code: code.toUpperCase() });
      if (existing) {
        return res
          .status(400)
          .json({ success: false, message: "Voucher code already exists" });
      }
      voucher.code = code.toUpperCase();
    }

    if (discountType) voucher.discountType = discountType;
    if (discountValue !== undefined) voucher.discountValue = discountValue;
    if (minOrderValue !== undefined) voucher.minOrderValue = minOrderValue;
    if (maxDiscountAmount !== undefined)
      voucher.maxDiscountAmount = maxDiscountAmount;
    if (validFrom) voucher.validFrom = validFrom;
    if (validUntil) voucher.validUntil = validUntil;
    if (usageLimit !== undefined) voucher.usageLimit = usageLimit;
    if (usageLimitPerUser !== undefined)
      voucher.usageLimitPerUser = usageLimitPerUser;
    if (isActive !== undefined) voucher.isActive = isActive;
    if (isPublic !== undefined) voucher.isPublic = isPublic;
    if (voucherType !== undefined) voucher.voucherType = voucherType;

    await voucher.save();
    return res.status(200).json({
      success: true,
      message: "Voucher updated successfully",
      data: voucher,
    });
  } catch (error) {
    console.error("Error updating voucher:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a voucher
exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) {
      return res
        .status(404)
        .json({ success: false, message: "Voucher not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Voucher deleted successfully" });
  } catch (error) {
    console.error("Error deleting voucher:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// --- CUSTOMER APIs ---

// Apply a voucher (validate and calculate discount)
exports.applyVoucher = async (req, res) => {
  try {
    const { code, totalAmount, productIds = [], serviceIds = [] } = req.body;
    let userId = null;

    // Attempt to extract userId from token if provided
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const jwt = require("jsonwebtoken");
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId || decoded.id;
      } catch (err) {
        // Ignore token errors, treat as guest if token is invalid
        console.warn("Invalid token provided for voucher application");
      }
    }

    if (!code || totalAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Voucher code and total amount are required",
      });
    }

    const voucher = await Voucher.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!voucher) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid or inactive voucher" });
    }

    const now = new Date();
    if (now < voucher.validFrom) {
      return res
        .status(400)
        .json({ success: false, message: "Voucher is not yet valid" });
    }
    if (now > voucher.validUntil) {
      return res
        .status(400)
        .json({ success: false, message: "Voucher has expired" });
    }

    // Check applicableUsers
    if (voucher.applicableUsers && voucher.applicableUsers.length > 0) {
      if (
        !userId ||
        !voucher.applicableUsers.some(
          (uid) => uid.toString() === userId.toString(),
        )
      ) {
        return res.status(403).json({
          success: false,
          message: "This voucher is not applicable to your account",
        });
      }
    }

    // Check applicable products and services
    const hasProductRestriction =
      voucher.applicableProducts && voucher.applicableProducts.length > 0;
    const hasServiceRestriction =
      voucher.applicableServices && voucher.applicableServices.length > 0;

    if (hasProductRestriction || hasServiceRestriction) {
      let isProductValid = false;
      let isServiceValid = false;

      if (hasProductRestriction && productIds.length > 0) {
        isProductValid = productIds.some((pid) =>
          voucher.applicableProducts.some(
            (vpid) => vpid.toString() === pid.toString(),
          ),
        );
      }

      if (hasServiceRestriction && serviceIds.length > 0) {
        isServiceValid = serviceIds.some((sid) =>
          voucher.applicableServices.some(
            (vsid) => vsid.toString() === sid.toString(),
          ),
        );
      }

      if (!isProductValid && !isServiceValid) {
        return res.status(400).json({
          success: false,
          message: "This voucher cannot be applied to the selected items",
        });
      }
    }

    // Check voucherType
    if (
      voucher.voucherType === "product_only" &&
      (!productIds || productIds.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá này chỉ áp dụng khi mua Sản phẩm",
      });
    }
    if (
      voucher.voucherType === "booking_only" &&
      (!serviceIds || serviceIds.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá này chỉ áp dụng cho Dịch vụ cắt tóc",
      });
    }

    // Count active locks (holding only)
    const activeLocks = await VoucherLock.countDocuments({
      voucherId: voucher._id,
      status: "holding",
    });

    if (voucher.usedCount + activeLocks >= voucher.usageLimit) {
      return res
        .status(400)
        .json({ success: false, message: "Voucher usage limit reached" });
    }

    if (totalAmount < voucher.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ${voucher.minOrderValue} required`,
      });
    }

    // Check per-user limit
    if (userId) {
      // Check usages in Orders
      const orderUsages = await Order.countDocuments({
        userId: userId,
        voucherCode: voucher.code,
        status: { $ne: "cancelled" },
      });
      // Check usages in Bookings
      const bookingUsages = await Booking.countDocuments({
        customerId: userId,
        voucherCode: voucher.code,
        status: { $nin: ["cancelled", "rejected"] },
      });

      const totalUserUsages = orderUsages + bookingUsages;

      if (totalUserUsages >= voucher.usageLimitPerUser) {
        return res.status(400).json({
          success: false,
          message: "You have reached the maximum usage limit for this voucher",
        });
      }
    } else {
      // For guest users, we might limit by IP or email in a real scenario, but for now we'll allow it if they don't have an account
      // Or we can enforce that you must be logged in to use vouchers. Let's enforce login if usageLimitPerUser is meant to be tracked securely.
      // Actually, the prompt says guest checkout is allowed. For guests, we can't reliably track usageLimitPerUser without an email/phone.
      // I will just skip the per-user check if no userId is present, or maybe use phone number if passed.
      // Let's check if customerPhone is passed in body for guest check.
      if (req.body.customerPhone) {
        const orderUsages = await Order.countDocuments({
          customerPhone: req.body.customerPhone,
          voucherCode: voucher.code,
          status: { $ne: "cancelled" },
        });
        const bookingUsages = await Booking.countDocuments({
          customerPhone: req.body.customerPhone,
          voucherCode: voucher.code,
          status: { $nin: ["cancelled", "rejected"] },
        });
        const totalGuestUsages = orderUsages + bookingUsages;
        if (totalGuestUsages >= voucher.usageLimitPerUser) {
          return res.status(400).json({
            success: false,
            message:
              "You have reached the maximum usage limit for this voucher",
          });
        }
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (voucher.discountType === "fixed_amount") {
      discountAmount = voucher.discountValue;
    } else if (voucher.discountType === "percentage") {
      discountAmount = (totalAmount * voucher.discountValue) / 100;
      if (
        voucher.maxDiscountAmount &&
        discountAmount > voucher.maxDiscountAmount
      ) {
        discountAmount = voucher.maxDiscountAmount;
      }
    }

    // Ensure discount doesn't exceed total amount
    if (discountAmount > totalAmount) {
      discountAmount = totalAmount;
    }

    return res.status(200).json({
      success: true,
      message: "Voucher applied successfully",
      data: {
        code: voucher.code,
        discountAmount: discountAmount,
        finalAmount: totalAmount - discountAmount,
      },
    });
  } catch (error) {
    console.error("Error applying voucher:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Helper methods for internal use by Booking/Order controllers
exports.validateAndLockVoucher = async (
  code,
  totalAmount,
  userId,
  customerPhone,
  productIds = [],
  serviceIds = [],
) => {
  if (!code) return null;
  const voucher = await Voucher.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });
  if (!voucher) throw new Error("Invalid voucher code");

  const now = new Date();
  if (now < voucher.validFrom) throw new Error("Voucher is not yet valid");
  if (now > voucher.validUntil) throw new Error("Voucher has expired");
  if (totalAmount < voucher.minOrderValue)
    throw new Error(`Minimum order value of ${voucher.minOrderValue} required`);

  // Check applicableUsers
  if (voucher.applicableUsers && voucher.applicableUsers.length > 0) {
    if (
      !userId ||
      !voucher.applicableUsers.some(
        (uid) => uid.toString() === userId.toString(),
      )
    ) {
      throw new Error("This voucher is not applicable to your account");
    }
  }

  // Check applicable products and services
  const hasProductRestriction =
    voucher.applicableProducts && voucher.applicableProducts.length > 0;
  const hasServiceRestriction =
    voucher.applicableServices && voucher.applicableServices.length > 0;

  if (hasProductRestriction || hasServiceRestriction) {
    let isProductValid = false;
    let isServiceValid = false;

    if (hasProductRestriction && productIds.length > 0) {
      isProductValid = productIds.some((pid) =>
        voucher.applicableProducts.some(
          (vpid) => vpid.toString() === pid.toString(),
        ),
      );
    }

    if (hasServiceRestriction && serviceIds.length > 0) {
      isServiceValid = serviceIds.some((sid) =>
        voucher.applicableServices.some(
          (vsid) => vsid.toString() === sid.toString(),
        ),
      );
    }

    if (!isProductValid && !isServiceValid) {
      throw new Error("This voucher cannot be applied to the selected items");
    }
  }

  // Check voucherType
  if (
    voucher.voucherType === "product_only" &&
    (!productIds || productIds.length === 0)
  ) {
    throw new Error("Mã giảm giá này chỉ áp dụng khi mua Sản phẩm");
  }
  if (
    voucher.voucherType === "booking_only" &&
    (!serviceIds || serviceIds.length === 0)
  ) {
    throw new Error("Mã giảm giá này chỉ áp dụng cho Dịch vụ cắt tóc");
  }

  // Check global limit
  const activeLocks = await VoucherLock.countDocuments({
    voucherId: voucher._id,
    status: "holding",
  });
  if (voucher.usedCount + activeLocks >= voucher.usageLimit) {
    throw new Error("Voucher usage limit reached");
  }

  // Check per-user limit
  const orConditions = [];
  if (userId) orConditions.push({ userId });
  if (customerPhone) orConditions.push({ customerPhone });

  if (orConditions.length > 0) {
    const userLocks = await VoucherLock.countDocuments({
      voucherId: voucher._id,
      status: { $in: ["holding", "redeemed"] },
      $or: orConditions,
    });

    if (userLocks >= voucher.usageLimitPerUser) {
      throw new Error(
        "You have reached the maximum usage limit for this voucher",
      );
    }
  }

  // Create lock for 15 minutes
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const lock = new VoucherLock({
    voucherId: voucher._id,
    userId,
    customerPhone,
    expiresAt,
    status: "holding",
  });
  await lock.save();

  // Return discount info and lock id
  let discountAmount = 0;
  if (voucher.discountType === "fixed_amount") {
    discountAmount = voucher.discountValue;
  } else if (voucher.discountType === "percentage") {
    discountAmount = (totalAmount * voucher.discountValue) / 100;
    if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount)
      discountAmount = voucher.maxDiscountAmount;
  }
  if (discountAmount > totalAmount) discountAmount = totalAmount;

  return { discountAmount, lockId: lock._id, voucherId: voucher._id };
};

exports.redeemVoucherLock = async (lockId) => {
  if (!lockId) return;
  const lock = await VoucherLock.findById(lockId);
  if (lock && lock.status === "holding") {
    lock.status = "redeemed";
    await lock.save();
    // Increment official count
    await Voucher.findByIdAndUpdate(lock.voucherId, { $inc: { usedCount: 1 } });
  }
};

exports.releaseVoucherLock = async (lockId) => {
  if (!lockId) return;
  const lock = await VoucherLock.findById(lockId);
  if (lock && lock.status === "holding") {
    lock.status = "released";
    await lock.save();
  }
};

exports.getMyVouchers = async (req, res) => {
  try {
    const userId = req.userId || (req.user && (req.user.id || req.user._id));
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const now = new Date();

    const vouchers = await Voucher.find({
      isActive: true,
      validUntil: { $gte: now },
      $or: [
        { applicableUsers: { $size: 0 } },
        { applicableUsers: { $exists: false } },
        { applicableUsers: userId },
      ],
    }).sort({ validUntil: 1 });

    const validVouchers = [];
    for (const v of vouchers) {
      const activeLocks = await VoucherLock.countDocuments({
        voucherId: v._id,
        status: "holding",
      });
      if (v.usedCount + activeLocks >= v.usageLimit) {
        continue;
      }

      const orderUsages = await Order.countDocuments({
        userId: userId,
        voucherCode: v.code,
        status: { $ne: "cancelled" },
      });
      const bookingUsages = await Booking.countDocuments({
        customerId: userId,
        voucherCode: v.code,
        status: { $nin: ["cancelled", "rejected"] },
      });
      const totalUserUsages = orderUsages + bookingUsages;

      if (totalUserUsages < v.usageLimitPerUser) {
        validVouchers.push(v);
      }
    }

    return res.status(200).json({ success: true, data: validVouchers });
  } catch (error) {
    console.error("Error fetching my vouchers:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all public active vouchers
exports.getPublicVouchers = async (req, res) => {
  try {
    const now = new Date();
    // Only fetch vouchers that don't have applicableUsers restrictions (or size 0), are active, public and valid
    const vouchers = await Voucher.find({
      isActive: true,
      isPublic: { $ne: false },
      validUntil: { $gte: now },
      $or: [
        { applicableUsers: { $size: 0 } },
        { applicableUsers: { $exists: false } },
      ],
    })
      .select(
        "code discountType discountValue minOrderValue maxDiscountAmount validUntil usageLimit usedCount voucherType",
      )
      .sort({ validUntil: 1 });

    return res.status(200).json({ success: true, data: vouchers });
  } catch (error) {
    console.error("Error fetching public vouchers:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Save a voucher to user profile
exports.saveVoucher = async (req, res) => {
  try {
    const userId = req.userId || (req.user && (req.user.id || req.user._id));
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { voucherId } = req.body;
    if (!voucherId) {
      return res
        .status(400)
        .json({ success: false, message: "Voucher ID is required" });
    }

    const User = require("../models/user.model");
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if already saved
    if (user.savedVouchers && user.savedVouchers.includes(voucherId)) {
      return res
        .status(400)
        .json({ success: false, message: "Voucher already saved" });
    }

    if (!user.savedVouchers) user.savedVouchers = [];
    user.savedVouchers.push(voucherId);
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Voucher saved successfully" });
  } catch (error) {
    console.error("Error saving voucher:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
