const Service = require('../models/service.model');
const { sendSuccess } = require('../utils/response.helper');
const { uploadAvatar } = require('../services/cloudStorage.service');

// @desc    Get active services
// @route   GET /api/services/active
exports.getActiveServices = async (req, res, next) => {
  try {
    // Find services where isActive is true OR isActive doesn't exist (for raw imported data)
    const services = await Service.find({ 
      $or: [{ isActive: true }, { isActive: { $exists: false } }] 
    })
      .sort({ popularity: -1, createdAt: -1 })
      .lean();

    return sendSuccess(res, 200, 'Services retrieved successfully', { services });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new service (Admin only)
// @route   POST /api/services
exports.createService = async (req, res) => {
  try {
    const {
      name,
      description,
      steps,
      suggestedFor,
      hairTypes,
      styleCompatibility,
      expertiseRequired,
      price,
      durationMinutes,
      isActive,
      category,
      images,
      imageBase64,
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: "Name and price are required." });
    }

    const service = new Service({
      name,
      description,
      steps: steps || [],
      suggestedFor: suggestedFor || [],
      hairTypes: hairTypes || [],
      styleCompatibility: styleCompatibility || [],
      expertiseRequired: expertiseRequired || [],
      price,
      durationMinutes: durationMinutes || 30,
      isActive: isActive !== undefined ? isActive : true,
      category: category || "cut",
      images: images || [],
    });

    if (imageBase64) {
      const uploadedImageUrl = await uploadAvatar({ avatarBase64: imageBase64, filename: `service-${name.replace(/\s+/g, '-').toLowerCase()}` });
      if (uploadedImageUrl) {
        service.images = [uploadedImageUrl];
      }
    }

    await service.save();

    res.status(201).json({
      success: true,
      message: "Service created successfully.",
      service,
    });
  } catch (err) {
    console.error("Error creating service:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all services (Public)
// @route   GET /api/services
exports.getAllServices = async (req, res) => {
  try {
    const {
      search,
      category,
      isActive,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    // 1. Search filter
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // 2. Category filter
    if (category && category !== "all") {
      query.category = category;
    }

    // 3. Active status filter
    if (isActive !== undefined && isActive !== "") {
      query.isActive = isActive === "true";
    }

    // 4. Pagination config
    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.max(1, parseInt(limit));
    const skip = (parsedPage - 1) * parsedLimit;

    // 5. Sorting
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    }

    const services = await Service.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parsedLimit);

    const total = await Service.countDocuments(query);

    res.status(200).json({
      success: true,
      services,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        pages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (err) {
    console.error("Error getting services:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get service detail (Public)
// @route   GET /api/services/:id
exports.getServiceDetail = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found." });
    }
    res.status(200).json({ success: true, service });
  } catch (err) {
    console.error("Error getting service detail:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update an existing service (Admin only)
// @route   PUT /api/services/:id
exports.updateService = async (req, res) => {
  try {
    const {
      name,
      description,
      steps,
      suggestedFor,
      hairTypes,
      styleCompatibility,
      expertiseRequired,
      price,
      durationMinutes,
      isActive,
      category,
      images,
      imageBase64,
    } = req.body;

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found." });
    }

    if (name !== undefined) service.name = name;
    if (description !== undefined) service.description = description;
    if (steps !== undefined) service.steps = steps;
    if (suggestedFor !== undefined) service.suggestedFor = suggestedFor;
    if (hairTypes !== undefined) service.hairTypes = hairTypes;
    if (styleCompatibility !== undefined) service.styleCompatibility = styleCompatibility;
    if (expertiseRequired !== undefined) service.expertiseRequired = expertiseRequired;
    if (price !== undefined) service.price = price;
    if (durationMinutes !== undefined) service.durationMinutes = durationMinutes;
    if (isActive !== undefined) service.isActive = isActive;
    if (category !== undefined) service.category = category;
    if (images !== undefined) service.images = images;
    if (imageBase64) {
      const uploadedImageUrl = await uploadAvatar({ avatarBase64: imageBase64, filename: `service-${service.name.replace(/\s+/g, '-').toLowerCase()}` });
      if (uploadedImageUrl) {
        service.images = [uploadedImageUrl];
      }
    }

    await service.save();

    res.status(200).json({
      success: true,
      message: "Service updated successfully.",
      service,
    });
  } catch (err) {
    console.error("Error updating service:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a service (Admin only)
// @route   DELETE /api/services/:id
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found." });
    }

    res.status(200).json({
      success: true,
      message: "Service deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting service:", err);
    res.status(500).json({ message: err.message });
  }
};