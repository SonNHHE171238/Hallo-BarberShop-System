const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hallo-barbershop', // The folder name in your Cloudinary account
    allowedFormats: ['jpeg', 'png', 'jpg', 'webp'],
    // transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optional: Resize image
  }
});

// Create upload middleware
const uploadCloud = multer({ storage: storage });

module.exports = uploadCloud;
