import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/async-handler';
import { requireRoles, verifyToken } from '../middleware/auth';
import { AppError } from '../utils/auth';

const router = Router();

const clientSchema = z.object({
  companyName: z.string().min(2),
  contactPerson: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
});

router.get('/', verifyToken, asyncHandler(async (_req, res) => {
  const clients = await prisma.client.findMany({
    include: {
      quotations: {
        include: {
          currentVersion: true,
        },
        orderBy: { updatedAt: 'desc' },
      },
      projects: true,
    },
    orderBy: { companyName: 'asc' },
  });

  res.json(clients);
}));

router.get('/:id', verifyToken, asyncHandler(async (req, res) => {
  const client = await prisma.client.findUnique({
    where: { id: req.params.id },
    include: {
      quotations: {
        include: {
          currentVersion: {
            include: { items: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      },
      projects: true,
    },
  });

  if (!client) {
    throw new AppError(404, 'Client not found');
  }

  res.json(client);
}));

router.post('/', verifyToken, requireRoles('ADMIN', 'SALES', 'MANAGER'), asyncHandler(async (req, res) => {
  const payload = clientSchema.parse(req.body);
  const client = await prisma.client.create({ data: payload });
  res.status(201).json(client);
}));

router.put('/:id', verifyToken, requireRoles('ADMIN', 'SALES', 'MANAGER'), asyncHandler(async (req, res) => {
  const payload = clientSchema.partial().parse(req.body);
  const client = await prisma.client.update({
    where: { id: req.params.id },
    data: payload,
  });

  res.json(client);
}));

router.delete('/:id', verifyToken, requireRoles('ADMIN', 'MANAGER'), asyncHandler(async (req, res) => {
  await prisma.client.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

export default router;