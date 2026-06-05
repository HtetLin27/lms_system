import express from 'express';
const router = express.Router();

router.get('/', optionalAuth, listCourses);

export default router;