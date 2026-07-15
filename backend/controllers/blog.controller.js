const Blog = require('../models/blog.model');

// CREATE a new blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const role = req.user.role;
    // Admin creates -> approved. Staff creates -> pending
    const status = role === 'admin' ? 'approved' : 'pending';

    const blog = await Blog.create({
      title,
      content,
      author: req.user.id,
      status
    });

    return res.status(201).json({ success: true, data: blog });
  } catch (error) {
    console.error('Error creating blog:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPDATE a blog
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Role checks
    const role = req.user.role;
    if (role === 'staff') {
      // Staff can only edit their own blogs AND only if it's rejected
      if (blog.author.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'You can only edit your own blogs' });
      }
      if (blog.status !== 'rejected') {
        return res.status(403).json({ success: false, message: 'You can only edit rejected blogs' });
      }
      // When staff edits a rejected blog, it goes back to pending
      blog.status = 'pending';
      blog.rejectionReason = '';
    } else if (role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    // Admin can edit anything and keep its current status

    if (title) blog.title = title;
    if (content) blog.content = content;
    
    // Auto-generate new slug if title changes
    if (title && blog.isModified('title')) {
      blog.slug = undefined; // trigger pre-validate hook
    }

    await blog.save();
    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error('Error updating blog:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE a blog
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Role checks
    const role = req.user.role;
    if (role === 'staff') {
      if (blog.author.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'You can only delete your own blogs' });
      }
      if (blog.status !== 'rejected') {
        return res.status(403).json({ success: false, message: 'You can only delete rejected blogs' });
      }
    } else if (role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await Blog.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// REVIEW a blog (Admin only)
exports.reviewBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body; // status: 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    blog.status = status;
    if (status === 'rejected') {
      blog.rejectionReason = rejectionReason || 'No reason provided';
    } else {
      blog.rejectionReason = '';
    }

    await blog.save();
    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error('Error reviewing blog:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET public blogs (approved only)
exports.getPublicBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'approved' })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    console.error('Error fetching public blogs:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET single public blog by slug
exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOneAndUpdate(
      { slug, status: 'approved' },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name');
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    
    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET admin/staff blogs
exports.getAdminBlogs = async (req, res) => {
  try {
    let query = {};
    const role = req.user.role;
    
    if (role === 'staff') {
      // Staff sees their own blogs OR approved blogs from others
      query = {
        $or: [
          { author: req.user.id },
          { status: 'approved' }
        ]
      };
    } // Admin sees all (query = {})

    const blogs = await Blog.find(query)
      .populate('author', 'name role')
      .sort({ createdAt: -1 });
      
    return res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
