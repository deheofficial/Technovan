import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/async-handler';

const router = Router();
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const pricing = await prisma.pricing.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  res.json(pricing);
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const plan = await prisma.pricing.findUnique({ where: { id: req.params.id } });
  if (!plan) return res.status(404).json({ error: 'Pricing not found' });
  res.json(plan);
}));

export default router;
