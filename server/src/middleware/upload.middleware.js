import multer from 'multer';
import config from '../config/config.js';

const memoryStorage = multer.memoryStorage();

const createFileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type: ${file.mimetype}. ` + `Allowed types: ${allowedTypes.join(', ')}`
        ),
        false
      );
    }
  };
};

const uploadImage = multer({
  storage: memoryStorage,
  limits: { fileSize: config.upload.maxImageSize },
  fileFilter: createFileFilter(config.allowedImageTypes),
}).single('image');

const uploadPdf = multer({
  storage: memoryStorage,
  limits: { fileSize: config.upload.maxPdfSize },
  fileFilter: createFileFilter(config.allowedPdfTypes),
}).single('pdf');

const uploadVideo = multer({
  storage: memoryStorage,
  limits: { fileSize: config.upload.maxVideoSize },
  fileFilter: createFileFilter(config.allowedVideoTypes),
}).single('video');

const handleUpload = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (!err) return next();

    // Multer-specific errors have a 'code' property
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        detail: `Maximum size: ${err.field === 'video' ? '500MB' : err.field === 'pdf' ? '50MB' : '5MB'}`,
      });
    }

    // Our custom file type error
    if (err.message.startsWith('Invalid file type')) {
      return res.status(400).json({ error: err.message });
    }

    // Unexpected error
    next(err);
  });
};

export { handleUpload, uploadImage, uploadPdf, uploadVideo };
