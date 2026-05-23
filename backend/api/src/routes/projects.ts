import { Router, Response } from 'express';
import { verifyToken, AuthRequest, requireRoles } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

router.get('/', verifyToken, asyncHandler(async (_req: AuthRequest, res: Response) => {
  const projects = await prisma.project.findMany({
    include: {
      client: true,
      quotation: {
        include: {
          currentVersion: {
            include: { items: true },
          },
        },
      },
      owner: {
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(projects);
}));

router.get('/:id', verifyToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: {
      client: true,
      quotation: {
        include: {
          currentVersion: {
            include: { items: true },
          },
        },
      },
      owner: {
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
        },
      },
    },
  });

  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
}));

router.post('/', verifyToken, requireRoles('ADMIN', 'MANAGER'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { quotationId, name, scopeSummary, startDate, endDate, pricingStructure } = req.body;
  if (!quotationId || !name || !pricingStructure) {
    return res.status(400).json({ error: 'quotationId, name and pricingStructure are required' });
  }

  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { client: true, currentVersion: { include: { items: true } } },
  });

  if (!quotation) {
    return res.status(404).json({ error: 'Quotation not found' });
  }

  if (quotation.status !== 'ACCEPTED') {
    return res.status(400).json({ error: 'Only accepted quotations can be converted' });
  }

  const projectCount = await prisma.project.count();

  const project = await prisma.project.create({
    data: {
      projectCode: `PRJ-${new Date().getFullYear()}-${String(projectCount + 1).padStart(4, '0')}`,
      name,
      clientId: quotation.clientId,
      quotationId,
      ownerId: req.user!.id,
      scopeSummary,
      pricingStructure,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
    include: {
      client: true,
      quotation: true,
      owner: {
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
        },
      },
    },
  });

  res.status(201).json(project);
}));

export default router;
