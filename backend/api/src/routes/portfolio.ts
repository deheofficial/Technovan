import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/async-handler';

const router = Router();
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const portfolio = await prisma.portfolio.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  res.json(portfolio);
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const item = await prisma.portfolio.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ error: 'Portfolio item not found' });
  res.json(item);
}));

export default router;
