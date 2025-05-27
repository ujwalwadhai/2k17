const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const resourceType = file.mimetype.startsWith('image') ? 'image'
      : file.mimetype.startsWith('video') ? 'video'
        : 'auto';
    var folder = req.query.folder || 'others';
    return {
      folder: `2k17/${folder}`,
      resource_type: resourceType,
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    };
  },
});

// File size limit in bytes
const FILE_LIMITS = {
  image: 10 * 1024 * 1024,  // 10MB
  video: 30 * 1024 * 1024,  // 30MB
};

// File filter to reject large files before upload
const fileFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith('image');
  const isVideo = file.mimetype.startsWith('video');
  const maxSize = isImage ? FILE_LIMITS.image : isVideo ? FILE_LIMITS.video : Infinity;

  if (file.size > maxSize) {
    return cb(new Error(`File ${file.originalname} exceeds limit of ${maxSize / 1024 / 1024}MB`), false);
  }

  cb(null, true);
};

const upload = multer({ storage, fileFilter });

const destroy = async (url, type='image') => {
  var parts = url.split('/upload/')[1];
  var noVersion = parts.split('/').slice(1).join('/');
  var publicId = noVersion.replace(/\.[^/.]+$/, '');
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: type.split('/')[0]
      });
    } catch (err) {
      console.error('Cloudinary deletion failed:', err);
    }
  }
}

module.exports = { upload, destroy };
