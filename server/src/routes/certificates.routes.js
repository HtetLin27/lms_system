import  express from 'express';
import {
  verifyCertificate,
  getMyCertificate,
  getAllMyCertificates,
} from '../controllers/certificates.controller';
import { protect, authorise } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/verify/:verifyCode', verifyCertificate);

// Student only
router.get('/my', protect, authorise('student'), getAllMyCertificates);
router.get('/my/:enrollmentId', protect, authorise('student'), getMyCertificate);

export default router;