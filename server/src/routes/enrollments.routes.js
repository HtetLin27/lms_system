import express from 'express';
const router = express.Router();

import { getMyEnrollments } from '../controllers/enrollments.controller';
import { protect, authorise } from '../middleware/auth.middleware';

router.get('/my', protect, authorise('student'), getMyEnrollments);


export default router;