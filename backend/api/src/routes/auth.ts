import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { verifyToken, verifyAdmin } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);
router.get('/users', verifyToken, verifyAdmin, asyncHandler(async (_req, res) => {
	const users = await prisma.user.findMany({
		select: {
			id: true,
			email: true,
			fullName: true,
			phone: true,
			role: true,
			isActive: true,
			createdAt: true,
			updatedAt: true,
		},
		orderBy: { createdAt: 'desc' },
	});

	res.json(users);
}));

export default router;
