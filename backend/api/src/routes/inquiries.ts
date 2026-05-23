import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(inquiries);
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      name,
      email,
      phone: phone || null,
      message,
      isRead: false,
      responded: false,
    },
  });

  res.status(201).json(inquiry);
}));

export default router;
