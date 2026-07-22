import express from 'express';
import { register, login, getMe, updateProfile } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { registerRules, loginRules, updateProfileRules } from '../middleware/auth.validator.js';
const router = express.Router();

router.post('/register', registerRules, register);
router.post('/login', loginRules, login);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfileRules, updateProfile);

export default router;
