import express from 'express';
import { protect } from '../middleware/auth';
import { login, register, getMe, logout } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema } from '../utils/validators';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;