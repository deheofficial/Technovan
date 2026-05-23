import { Router, Request, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/async-handler';

const router = Router();
router.get('/', verifyToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userProjects = await prisma.project.findMany({
    where: { userId: req.user?.id },
    include: { pricing: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(userProjects);
}));

router.get('/:id', verifyToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: { pricing: true },
  });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  if (project.userId !== req.user?.id) return res.status(403).json({ error: 'Unauthorized' });
  res.json(project);
}));

router.post('/', verifyToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, pricingId, budget, deadline } = req.body;
  if (!title || !description || !pricingId) {
    return res.status(400).json({ error: 'Title, description and pricingId are required' });
  }

  const project = await prisma.project.create({
    data: {
      title,
      description,
      pricingId,
      userId: req.user!.id,
      budget: budget === undefined ? null : Number(budget),
      deadline: deadline ? new Date(deadline) : null,
      status: 'PENDING',
    },
    include: { pricing: true },
  });

  res.status(201).json(project);
}));

router.put('/:id', verifyToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Project not found' });
  if (existing.userId !== req.user?.id) return res.status(403).json({ error: 'Unauthorized' });

  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: {
      title: typeof req.body.title === 'string' ? req.body.title : undefined,
      description: typeof req.body.description === 'string' ? req.body.description : undefined,
      budget: req.body.budget === undefined ? undefined : Number(req.body.budget),
      deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
      notes: typeof req.body.notes === 'string' ? req.body.notes : undefined,
    },
    include: { pricing: true },
  });

  res.json(project);
}));

export default router;
