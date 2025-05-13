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
                      : file.mimetype.startsWith('audio') ? 'video' // audio is treated as video
                      : 'auto';
    var folder = req.query.folder || 'others';
    return {
      folder: `2k17/${folder}`,
      resource_type: resourceType,
    };
  },
});

const upload = multer({ storage });

module.exports = { upload };
