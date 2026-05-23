import { Router, Request, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

router.get('/', verifyToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const payments = await prisma.payment.findMany({
    where: { userId: req.user?.id },
    include: { project: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(payments);
}));

router.post('/', verifyToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { projectId, amount, method } = req.body;

  if (!projectId || amount === undefined || !method) {
    return res.status(400).json({ error: 'projectId, amount and method are required' });
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.userId !== req.user?.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const payment = await prisma.payment.create({
    data: {
      projectId,
      userId: req.user!.id,
      amount: Number(amount),
      method,
      status: 'PENDING',
      currency: 'RM',
    },
  });

  res.status(201).json(payment);
}));

router.get('/:id', verifyToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const payment = await prisma.payment.findUnique({
    where: { id: req.params.id },
    include: { project: true },
  });
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  if (payment.userId !== req.user?.id) return res.status(403).json({ error: 'Unauthorized' });
  res.json(payment);
}));

export default router;
