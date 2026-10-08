const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const isCloudinaryConfigured = () => {
  return (
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET)
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Upload a local file to Cloudinary (or return local public URL if not configured)
 * @param {string} filePath - Absolute path to local uploaded file
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<string>} - Public image URL
 */
const uploadImage = async (filePath, folder = 'aarrudh_fashion') => {
  if (isCloudinaryConfigured()) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        use_filename: true,
        unique_filename: true,
        resource_type: 'image',
      });
      // Remove temporary local file after successful Cloudinary upload
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return result.secure_url;
    } catch (error) {
      console.error('[Cloudinary Upload Error]', error.message);
      // Fallback to local file URL
    }
  }

  // Local fallback: Return static uploads URL
  const filename = filePath.split(/[\\/]/).pop();
  return `/uploads/${filename}`;
};

module.exports = { uploadImage, isCloudinaryConfigured };
