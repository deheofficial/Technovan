import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/async-handler';

const router = Router();
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  res.json(services);
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const service = await prisma.service.findUnique({ where: { id: req.params.id } });
  if (!service) return res.status(404).json({ error: 'Service not found' });
  res.json(service);
}));

export default router;
