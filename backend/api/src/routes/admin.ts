import { Router, Response } from 'express';
import { ProjectStatus } from '@prisma/client';
import { verifyToken, verifyAdmin, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

function makeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function uniqueSlug(base: string, idToExclude?: string): Promise<string> {
  const normalized = makeSlug(base) || 'post';
  let candidate = normalized;
  let suffix = 1;

  while (true) {
    const existing = await prisma.blogPost.findFirst({
      where: {
        slug: candidate,
        ...(idToExclude ? { NOT: { id: idToExclude } } : {}),
      },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${normalized}-${suffix++}`;
  }
}

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

/* ---- BLOG CRUD ---- */
router.get('/blog', verifyToken, verifyAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json(posts);
}));

router.post('/blog', verifyToken, verifyAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
  const excerpt = typeof req.body.excerpt === 'string' ? req.body.excerpt.trim() : '';
  const image = typeof req.body.image === 'string' ? req.body.image.trim() : '';
  const requestedSlug = typeof req.body.slug === 'string' ? req.body.slug.trim() : '';
  const published = typeof req.body.published === 'boolean' ? req.body.published : true;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const slug = await uniqueSlug(requestedSlug || title);

  const post = await prisma.blogPost.create({
    data: {
      title,
      content,
      excerpt: excerpt || null,
      image: image || null,
      slug,
      published,
    },
  });

  res.status(201).json(post);
}));

router.put('/blog/:id', verifyToken, verifyAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : undefined;
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : undefined;
  const excerpt = typeof req.body.excerpt === 'string' ? req.body.excerpt.trim() : undefined;
  const image = typeof req.body.image === 'string' ? req.body.image.trim() : undefined;
  const requestedSlug = typeof req.body.slug === 'string' ? req.body.slug.trim() : undefined;
  const published = typeof req.body.published === 'boolean' ? req.body.published : undefined;

  const existing = await prisma.blogPost.findUnique({
    where: { id: req.params.id },
    select: { id: true, title: true },
  });

  if (!existing) {
    return res.status(404).json({ error: 'Blog post not found' });
  }

  const shouldUpdateSlug = requestedSlug !== undefined || title !== undefined;
  const slug = shouldUpdateSlug
    ? await uniqueSlug(requestedSlug || title || existing.title, existing.id)
    : undefined;

  const post = await prisma.blogPost.update({
    where: { id: req.params.id },
    data: {
      title,
      content,
      excerpt,
      image,
      slug,
      published,
    },
  });

  res.json(post);
}));

router.delete('/blog/:id', verifyToken, verifyAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    await prisma.blogPost.delete({ where: { id: req.params.id } });
  } catch {
    return res.status(404).json({ error: 'Blog post not found' });
  }

  res.json({ message: 'Blog post deleted' });
}));

export default router;
