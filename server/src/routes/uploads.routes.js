// server/src/routes/uploads.routes.js
'use strict';

import express from 'express';
import {
  uploadImage as uploadImageHandler,
  uploadAvatar,
  uploadPdf as uploadPdfHandler,
  uploadVideo as uploadVideoHandler,
} from '../controllers/upload.controller.js';
import {
  uploadImage,
  uploadPdf,
  uploadVideo,
  handleUpload,
} from '../middleware/upload.middleware.js';
import { protect, authorise } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post(
  '/image',
  authorise('instructor', 'admin'),
  handleUpload(uploadImage),
  uploadImageHandler
);

router.post(
  '/avatar',
  handleUpload(uploadImage), // same Multer config — both are images
  uploadAvatar
);

router.post('/pdf', authorise('instructor', 'admin'), handleUpload(uploadPdf), uploadPdfHandler);

router.post(
  '/video',
  authorise('instructor', 'admin'),
  handleUpload(uploadVideo),
  uploadVideoHandler
);

export default router;
