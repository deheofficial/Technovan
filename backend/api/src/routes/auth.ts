import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);

export default router;
