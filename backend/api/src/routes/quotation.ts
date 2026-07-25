import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

const normalizeOwnerKey = (raw: unknown): string => {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!value) return '';
  return value.slice(0, 120);
};

const normalizeTemplateName = (raw: unknown): string => {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!value) return '';
  return value.slice(0, 120);
};

router.get('/templates', asyncHandler(async (req: Request, res: Response) => {
  const ownerKey = normalizeOwnerKey(req.query.ownerKey);
  if (!ownerKey) {
    return res.status(400).json({ error: 'Missing required query param: ownerKey' });
  }

  const templates = await prisma.quotationTemplate.findMany({
    where: { ownerKey },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      ownerKey: true,
      name: true,
      data: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json(templates);
}));

router.post('/templates', asyncHandler(async (req: Request, res: Response) => {
  const ownerKey = normalizeOwnerKey(req.body?.ownerKey);
  const name = normalizeTemplateName(req.body?.name);
  const data = req.body?.data;

  if (!ownerKey || !name || !data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ error: 'Missing required fields: ownerKey, name, data(object)' });
  }

  const template = await prisma.quotationTemplate.upsert({
    where: {
      ownerKey_name: {
        ownerKey,
        name,
      },
    },
    create: {
      ownerKey,
      name,
      data,
      updatedAt: new Date(),
    },
    update: {
      data,
      updatedAt: new Date(),
    },
  });

  res.status(201).json(template);
}));

router.delete('/templates/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
  const ownerKey = normalizeOwnerKey(req.query.ownerKey);

  if (!id || !ownerKey) {
    return res.status(400).json({ error: 'Missing required fields: id param and ownerKey query' });
  }

  const existing = await prisma.quotationTemplate.findFirst({
    where: { id, ownerKey },
    select: { id: true },
  });

  if (!existing) {
    return res.status(404).json({ error: 'Template not found' });
  }

  await prisma.quotationTemplate.delete({ where: { id } });
  res.json({ message: 'Template deleted' });
}));

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const rawLimit = Number(req.query.limit);
  const take = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(Math.floor(rawLimit), 100)
    : 50;

  const quotations = await prisma.quotation.findMany({
    orderBy: { createdAt: 'desc' },
    take,
  });

  res.json(quotations);
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    email,
    phone,
    company,
    service,
    budget,
    timeline,
    projectIdea,
    message,
    source,
  } = req.body;

  const resolvedIdea = typeof projectIdea === 'string' && projectIdea.trim()
    ? projectIdea.trim()
    : typeof message === 'string'
      ? message.trim()
      : '';

  if (!name || !email || !resolvedIdea) {
    return res.status(400).json({ error: 'Missing required fields: name, email, projectIdea/message' });
  }

  const quotation = await prisma.quotation.create({
    data: {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : null,
      company: company ? String(company).trim() : null,
      service: service ? String(service).trim() : null,
      budget: budget ? String(budget).trim() : null,
      timeline: timeline ? String(timeline).trim() : null,
      projectIdea: resolvedIdea,
      source: source ? String(source).trim() : 'public-site',
      isRead: false,
      responded: false,
    },
  });

  res.status(201).json({ message: 'Quotation request submitted successfully', quotation });
}));

export default router;
