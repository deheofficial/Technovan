import { Router, Response } from 'express';
import { ProjectStatus } from '@prisma/client';
import { verifyToken, verifyAdmin, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

/* ---- OVERVIEW STATS ---- */
router.get('/', verifyToken, verifyAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const [
    totalUsers,
    totalProjects,
    activeProjects,
    payments,
    recentProjects,
    recentInquiries,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.project.count({ where: { status: { in: ['IN_PROGRESS', 'APPROVED'] } } }),
    prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    }),
    prisma.project.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        pricing: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.inquiry.findMany({
      where: { isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const stats = {
    totalUsers,
    totalProjects,
    activeProjects,
    totalRevenue: payments._sum.amount ?? 0,
  };

  res.json({ stats, recentProjects, recentInquiries });
}));

/* ---- SERVICES CRUD ---- */
router.post('/services', verifyToken, verifyAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, icon, order, isActive } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const svc = await prisma.service.create({
    data: {
      title,
      description: description || '',
      icon: icon || '⚙️',
      order: Number(order || 0),
      isActive: isActive !== false,
    },
  });

  res.status(201).json(svc);
}));

router.put('/services/:id', verifyToken, verifyAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: {
        title: typeof req.body.title === 'string' ? req.body.title : undefined,
        description: typeof req.body.description === 'string' ? req.body.description : undefined,
        icon: typeof req.body.icon === 'string' ? req.body.icon : undefined,
        order: req.body.order === undefined ? undefined : Number(req.body.order),
        isActive: typeof req.body.isActive === 'boolean' ? req.body.isActive : undefined,
      },
    });
    res.json(service);
  } catch {
    res.status(404).json({ error: 'Service not found' });
  }
}));

router.delete('/services/:id', verifyToken, verifyAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } });
  } catch {
    return res.status(404).json({ error: 'Service not found' });
  }

  res.json({ message: 'Service deleted' });
}));

/* ---- PRICING CRUD ---- */
router.post('/pricing', verifyToken, verifyAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, price, currency, description, features, order, isActive } = req.body;
  if (!name || price === undefined) return res.status(400).json({ error: 'Name and price are required' });

  const plan = await prisma.pricing.create({
    data: {
      name,
      price: Number(price),
      currency: currency || 'RM',
      description: description || '',
      features: Array.isArray(features) ? features : [],
      order: Number(order || 0),
      isActive: isActive !== false,
    },
  });

  res.status(201).json(plan);
}));

router.put('/pricing/:id', verifyToken, verifyAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const plan = await prisma.pricing.update({
      where: { id: req.params.id },
      data: {
        name: typeof req.body.name === 'string' ? req.body.name : undefined,
        price: req.body.price === undefined ? undefined : Number(req.body.price),
        currency: typeof req.body.currency === 'string' ? req.body.currency : undefined,
        description: typeof req.body.description === 'string' ? req.body.description : undefined,
        features: Array.isArray(req.body.features) ? req.body.features : undefined,
        order: req.body.order === undefined ? undefined : Number(req.body.order),
        isActive: typeof req.body.isActive === 'boolean' ? req.body.isActive : undefined,
      },
    });
    res.json(plan);
  } catch {
    res.status(404).json({ error: 'Pricing plan not found' });
  }
}));

router.delete('/pricing/:id', verifyToken, verifyAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    await prisma.pricing.delete({ where: { id: req.params.id } });
  } catch {
    return res.status(404).json({ error: 'Pricing plan not found' });
  }

  res.json({ message: 'Pricing plan deleted' });
}));

/* ---- ALL PROJECTS ---- */
router.get('/projects', verifyToken, verifyAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const projects = await prisma.project.findMany({
    include: {
      pricing: true,
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(projects);
}));

router.put('/projects/:id', verifyToken, verifyAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const status = req.body.status as ProjectStatus | undefined;
  const allowedStatuses: ProjectStatus[] = ['PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid project status' });
  }

  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        status,
        notes: typeof req.body.notes === 'string' ? req.body.notes : undefined,
      },
      include: { pricing: true },
    });
    res.json(project);
  } catch {
    res.status(404).json({ error: 'Project not found' });
  }
}));

/* ---- INQUIRIES ---- */
router.get('/inquiries', verifyToken, verifyAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: 'desc' },
  });

  res.json(inquiries);
}));

router.put('/inquiries/:id', verifyToken, verifyAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const inquiry = await prisma.inquiry.update({
      where: { id: req.params.id },
      data: {
        isRead: true,
        responded: req.body.responded === true ? true : undefined,
      },
    });
    res.json(inquiry);
  } catch {
    res.status(404).json({ error: 'Inquiry not found' });
  }
}));

export default router;
