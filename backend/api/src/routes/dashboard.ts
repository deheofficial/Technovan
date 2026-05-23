import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/async-handler';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.get('/metrics', verifyToken, asyncHandler(async (_req, res) => {
  const [
    totalQuotations,
    acceptedQuotations,
    rejectedQuotations,
    pendingApprovals,
    quotations,
  ] = await Promise.all([
    prisma.quotation.count(),
    prisma.quotation.count({ where: { status: 'ACCEPTED' } }),
    prisma.quotation.count({ where: { status: 'REJECTED' } }),
    prisma.quotation.count({ where: { status: 'PENDING_APPROVAL' } }),
    prisma.quotation.findMany({
      where: {
        status: {
          in: ['PENDING_APPROVAL', 'APPROVED', 'SENT', 'ACCEPTED'],
        },
      },
      include: { currentVersion: true },
    }),
  ]);

  const revenueForecast = quotations.reduce((total, quotation) => {
    return total + Number(quotation.currentVersion?.grandTotal ?? 0);
  }, 0);

  res.json({
    totalQuotations,
    acceptedQuotations,
    rejectedQuotations,
    pendingApprovals,
    revenueForecast,
  });
}));

export default router;