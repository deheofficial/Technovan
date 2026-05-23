import { Response, Router } from 'express';
import PDFDocument from 'pdfkit';
import { AuditAction, Prisma, QuotationStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/async-handler';
import { AuthRequest, requireRoles, verifyToken } from '../middleware/auth';
import { AppError } from '../utils/auth';
import {
  buildProjectCode,
  buildQuotationNumber,
  buildVersionLabel,
  calculateQuotationTotals,
  createPortalToken,
  formatCurrency,
  parseAmount,
} from '../utils/quotation';

const router = Router();

const lineItemSchema = z.object({
  serviceName: z.string().min(2),
  description: z.string().min(2),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
});

const quotationSchema = z.object({
  clientId: z.string().min(1),
  title: z.string().min(2),
  expiryDate: z.string().datetime(),
  scopeSummary: z.string().optional(),
  discountAmount: z.coerce.number().nonnegative().default(0),
  sstRate: z.coerce.number().min(0).max(1).default(0.06),
  internalNotes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  items: z.array(lineItemSchema).min(1),
  templateId: z.string().optional(),
});

const templateSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  defaultDiscount: z.coerce.number().nonnegative().default(0),
  defaultSstRate: z.coerce.number().min(0).max(1).default(0.06),
  termsAndConditions: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1),
});

const portalResponseSchema = z.object({
  decision: z.enum(['accept', 'reject']),
  message: z.string().optional(),
});

const quotationInclude = Prisma.validator<Prisma.QuotationInclude>()({
  client: true,
  owner: {
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
    },
  },
  currentVersion: {
    include: {
      items: true,
      approvedBy: {
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
        },
      },
    },
  },
  versions: {
    include: {
      items: true,
      approvedBy: {
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  },
  auditLogs: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  },
  project: true,
});

const getQuotationOrThrow = async (quotationId: string) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: quotationInclude,
  });

  if (!quotation) {
    throw new AppError(404, 'Quotation not found');
  }

  return quotation;
};

const getTemplateItems = async (templateId: string | undefined) => {
  if (!templateId) {
    return undefined;
  }

  const template = await prisma.quotationTemplate.findUnique({ where: { id: templateId } });
  if (!template) {
    throw new AppError(404, 'Quotation template not found');
  }

  return {
    template,
    lineItems: template.lineItems as Array<{
      serviceName: string;
      description: string;
      quantity: number;
      unitPrice: number;
    }>,
  };
};

const logAudit = async (
  tx: Prisma.TransactionClient,
  quotationId: string,
  action: AuditAction,
  message: string,
  userId?: string,
  quotationVersionId?: string,
  metadata?: Prisma.InputJsonValue,
) => {
  await tx.quotationAuditLog.create({
    data: {
      quotationId,
      quotationVersionId,
      userId,
      action,
      message,
      metadata,
    },
  });
};

const renderPdf = (res: Response, quotation: Awaited<ReturnType<typeof getQuotationOrThrow>>) => {
  if (!quotation.currentVersion) {
    throw new AppError(400, 'Quotation has no current version');
  }

  const doc = new PDFDocument({ margin: 48, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${quotation.quotationNumber}.pdf"`);
  doc.pipe(res);

  doc.fontSize(22).text('TECHNOVAN', { align: 'left' });
  doc.moveDown(0.2);
  doc.fontSize(10).fillColor('#4b5563').text('Project Quotation');
  doc.moveDown();

  doc.fillColor('#111827').fontSize(11).text(`Quotation No: ${quotation.quotationNumber}`);
  doc.text(`Version: ${quotation.currentVersion.versionLabel}`);
  doc.text(`Status: ${quotation.status}`);
  doc.text(`Expiry Date: ${quotation.expiryDate.toDateString()}`);
  doc.moveDown();

  doc.fontSize(13).text('Client');
  doc.fontSize(11).text(quotation.client.companyName);
  doc.text(quotation.client.contactPerson);
  doc.text(`${quotation.client.email} | ${quotation.client.phone}`);
  doc.moveDown();

  doc.fontSize(13).text('Scope');
  doc.fontSize(11).text(quotation.currentVersion.scopeSummary || quotation.title);
  doc.moveDown();

  doc.fontSize(13).text('Items');
  quotation.currentVersion.items.forEach((item, index) => {
    doc.moveDown(0.5);
    doc.fontSize(11).text(`${index + 1}. ${item.serviceName}`);
    doc.fontSize(10).fillColor('#4b5563').text(item.description);
    doc.fillColor('#111827').text(
      `${Number(item.quantity)} x ${formatCurrency(Number(item.unitPrice), quotation.currency)} = ${formatCurrency(Number(item.lineTotal), quotation.currency)}`,
    );
  });

  doc.moveDown();
  doc.fontSize(12).text(`Subtotal: ${formatCurrency(Number(quotation.currentVersion.subtotal), quotation.currency)}`, { align: 'right' });
  doc.text(`Discount: ${formatCurrency(Number(quotation.currentVersion.discountAmount), quotation.currency)}`, { align: 'right' });
  doc.text(`SST: ${formatCurrency(Number(quotation.currentVersion.taxAmount), quotation.currency)}`, { align: 'right' });
  doc.fontSize(14).text(`Grand Total: ${formatCurrency(Number(quotation.currentVersion.grandTotal), quotation.currency)}`, { align: 'right' });
  doc.moveDown();

  doc.fontSize(13).text('Terms & Conditions');
  doc.fontSize(10).fillColor('#4b5563').text(quotation.termsAndConditions || 'Payment due within 14 days. Scope changes are billed separately.');
  doc.end();
};

router.get('/templates', verifyToken, asyncHandler(async (_req, res) => {
  const templates = await prisma.quotationTemplate.findMany({
    orderBy: { updatedAt: 'desc' },
  });
  res.json(templates);
}));

router.post('/templates', verifyToken, requireRoles('ADMIN', 'SALES', 'MANAGER'), asyncHandler(async (req: AuthRequest, res) => {
  const payload = templateSchema.parse(req.body);

  const template = await prisma.quotationTemplate.create({
    data: {
      ...payload,
      createdById: req.user!.id,
      lineItems: payload.lineItems,
    },
  });

  res.status(201).json(template);
}));

router.get('/portal/:token', asyncHandler(async (req, res) => {
  const quotation = await prisma.quotation.findUnique({
    where: { publicToken: req.params.token },
    include: quotationInclude,
  });

  if (!quotation) {
    throw new AppError(404, 'Quotation not found');
  }

  res.json(quotation);
}));

router.post('/portal/:token/respond', asyncHandler(async (req, res) => {
  const payload = portalResponseSchema.parse(req.body);
  const quotation = await prisma.quotation.findUnique({
    where: { publicToken: req.params.token },
    include: { currentVersion: true },
  });

  if (!quotation || !quotation.currentVersion) {
    throw new AppError(404, 'Quotation not found');
  }

  const currentVersionId = quotation.currentVersion.id;

  const nextStatus = payload.decision === 'accept' ? 'ACCEPTED' : 'REJECTED';
  const timestampField = payload.decision === 'accept' ? { acceptedAt: new Date() } : { rejectedAt: new Date() };

  await prisma.$transaction(async (tx) => {
    await tx.quotation.update({
      where: { id: quotation.id },
      data: {
        status: nextStatus,
        ...timestampField,
      },
    });

    await logAudit(
      tx,
      quotation.id,
      payload.decision === 'accept' ? 'CLIENT_ACCEPTED' : 'CLIENT_REJECTED',
      payload.message || (payload.decision === 'accept' ? 'Quotation accepted by client' : 'Quotation rejected by client'),
      undefined,
      currentVersionId,
    );
  });

  res.json(await getQuotationOrThrow(quotation.id));
}));

router.get('/', verifyToken, asyncHandler(async (req, res) => {
  const where: Prisma.QuotationWhereInput = {
    status: typeof req.query.status === 'string' ? req.query.status as QuotationStatus : undefined,
    clientId: typeof req.query.clientId === 'string' ? req.query.clientId : undefined,
    ownerId: typeof req.query.ownerId === 'string' ? req.query.ownerId : undefined,
  };

  const quotations = await prisma.quotation.findMany({
    where,
    include: quotationInclude,
    orderBy: { updatedAt: 'desc' },
  });

  res.json(quotations);
}));

router.get('/:id', verifyToken, asyncHandler(async (req, res) => {
  res.json(await getQuotationOrThrow(req.params.id));
}));

router.post('/', verifyToken, requireRoles('ADMIN', 'SALES'), asyncHandler(async (req: AuthRequest, res) => {
  const payload = quotationSchema.parse(req.body);
  const templateResult = await getTemplateItems(payload.templateId);
  const items = payload.items.length > 0 ? payload.items : templateResult?.lineItems || [];

  if (!items.length) {
    throw new AppError(400, 'Quotation must contain at least one line item');
  }

  const totals = calculateQuotationTotals(items, payload.discountAmount, payload.sstRate);
  const quotationCount = await prisma.quotation.count();
  const quotationNumber = buildQuotationNumber(quotationCount + 1);

  const quotation = await prisma.$transaction(async (tx) => {
    const createdQuotation = await tx.quotation.create({
      data: {
        quotationNumber,
        title: payload.title,
        clientId: payload.clientId,
        ownerId: req.user!.id,
        expiryDate: new Date(payload.expiryDate),
        discountAmount: totals.discountAmount,
        sstRate: payload.sstRate,
        internalNotes: payload.internalNotes,
        termsAndConditions: payload.termsAndConditions,
        publicToken: createPortalToken(),
      },
    });

    const currentVersion = await tx.quotationVersion.create({
      data: {
        quotationId: createdQuotation.id,
        versionLabel: buildVersionLabel(1),
        scopeSummary: payload.scopeSummary,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxAmount: totals.taxAmount,
        grandTotal: totals.grandTotal,
        items: {
          create: totals.items.map((item, index) => ({
            lineOrder: index + 1,
            serviceName: item.serviceName,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
          })),
        },
      },
    });

    await tx.quotation.update({
      where: { id: createdQuotation.id },
      data: {
        currentVersionId: currentVersion.id,
      },
    });

    await logAudit(tx, createdQuotation.id, 'CREATED', 'Quotation created', req.user!.id, currentVersion.id, {
      templateId: payload.templateId,
    });

    return createdQuotation;
  });

  res.status(201).json(await getQuotationOrThrow(quotation.id));
}));

router.put('/:id', verifyToken, requireRoles('ADMIN', 'SALES'), asyncHandler(async (req: AuthRequest, res) => {
  const payload = quotationSchema.partial().parse(req.body);
  const quotation = await prisma.quotation.findUnique({
    where: { id: req.params.id },
    include: {
      currentVersion: {
        include: { items: true },
      },
    },
  });

  if (!quotation || !quotation.currentVersion) {
    throw new AppError(404, 'Quotation not found');
  }

  const nextVersionNumber = quotation.versionNumber + 1;
  const existingItems = quotation.currentVersion.items.map((item) => ({
    serviceName: item.serviceName,
    description: item.description,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
  }));
  const sourceItems = payload.items?.length ? payload.items : existingItems;
  const discountAmount = payload.discountAmount ?? Number(quotation.discountAmount);
  const sstRate = payload.sstRate ?? Number(quotation.sstRate);
  const totals = calculateQuotationTotals(sourceItems, discountAmount, sstRate);

  await prisma.$transaction(async (tx) => {
    const version = await tx.quotationVersion.create({
      data: {
        quotationId: quotation.id,
        versionLabel: buildVersionLabel(nextVersionNumber),
        scopeSummary: payload.scopeSummary ?? quotation.currentVersion?.scopeSummary ?? undefined,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxAmount: totals.taxAmount,
        grandTotal: totals.grandTotal,
        items: {
          create: totals.items.map((item, index) => ({
            lineOrder: index + 1,
            serviceName: item.serviceName,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
          })),
        },
      },
    });

    await tx.quotation.update({
      where: { id: quotation.id },
      data: {
        title: payload.title ?? quotation.title,
        clientId: payload.clientId ?? quotation.clientId,
        expiryDate: payload.expiryDate ? new Date(payload.expiryDate) : quotation.expiryDate,
        discountAmount: totals.discountAmount,
        sstRate,
        internalNotes: payload.internalNotes ?? quotation.internalNotes,
        termsAndConditions: payload.termsAndConditions ?? quotation.termsAndConditions,
        status: 'DRAFT',
        versionNumber: nextVersionNumber,
        currentVersionId: version.id,
      },
    });

    await logAudit(tx, quotation.id, 'UPDATED', `Quotation updated to ${version.versionLabel}`, req.user!.id, version.id);
  });

  res.json(await getQuotationOrThrow(quotation.id));
}));

router.post('/:id/submit-approval', verifyToken, requireRoles('ADMIN', 'SALES'), asyncHandler(async (req: AuthRequest, res) => {
  const quotation = await getQuotationOrThrow(req.params.id);
  if (!quotation.currentVersion) {
    throw new AppError(400, 'Quotation has no current version');
  }

  await prisma.$transaction(async (tx) => {
    await tx.quotation.update({
      where: { id: quotation.id },
      data: { status: 'PENDING_APPROVAL' },
    });

    await tx.quotationVersion.update({
      where: { id: quotation.currentVersion!.id },
      data: { approvalRequestedAt: new Date() },
    });

    await logAudit(tx, quotation.id, 'SUBMITTED_FOR_APPROVAL', 'Quotation submitted for approval', req.user!.id, quotation.currentVersion!.id);
  });

  res.json(await getQuotationOrThrow(quotation.id));
}));

router.post('/:id/approve', verifyToken, requireRoles('ADMIN', 'MANAGER'), asyncHandler(async (req: AuthRequest, res) => {
  const quotation = await getQuotationOrThrow(req.params.id);
  if (!quotation.currentVersion) {
    throw new AppError(400, 'Quotation has no current version');
  }

  await prisma.$transaction(async (tx) => {
    await tx.quotation.update({
      where: { id: quotation.id },
      data: { status: 'APPROVED' },
    });

    await tx.quotationVersion.update({
      where: { id: quotation.currentVersion!.id },
      data: {
        approvedAt: new Date(),
        approvedById: req.user!.id,
        rejectionReason: null,
      },
    });

    await logAudit(tx, quotation.id, 'APPROVED', 'Quotation approved by manager', req.user!.id, quotation.currentVersion!.id);
  });

  res.json(await getQuotationOrThrow(quotation.id));
}));

router.post('/:id/send', verifyToken, requireRoles('ADMIN', 'SALES'), asyncHandler(async (req: AuthRequest, res) => {
  const quotation = await getQuotationOrThrow(req.params.id);
  if (quotation.status !== 'APPROVED') {
    throw new AppError(400, 'Quotation must be approved before sending');
  }

  await prisma.$transaction(async (tx) => {
    await tx.quotation.update({
      where: { id: quotation.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    await logAudit(tx, quotation.id, 'SENT', 'Quotation sent to client', req.user!.id, quotation.currentVersion?.id);
  });

  res.json(await getQuotationOrThrow(quotation.id));
}));

router.post('/:id/convert-project', verifyToken, requireRoles('ADMIN', 'MANAGER'), asyncHandler(async (req: AuthRequest, res) => {
  const quotation = await getQuotationOrThrow(req.params.id);
  if (!quotation.currentVersion) {
    throw new AppError(400, 'Quotation has no current version');
  }

  if (quotation.status !== 'ACCEPTED') {
    throw new AppError(400, 'Only accepted quotations can be converted into a project');
  }

  if (quotation.project) {
    res.json(quotation.project);
    return;
  }

  const projectCount = await prisma.project.count();

  const project = await prisma.$transaction(async (tx) => {
    const createdProject = await tx.project.create({
      data: {
        projectCode: buildProjectCode(projectCount + 1),
        name: req.body.name || quotation.title,
        clientId: quotation.clientId,
        quotationId: quotation.id,
        ownerId: req.user!.id,
        scopeSummary: quotation.currentVersion?.scopeSummary || quotation.title,
        pricingStructure: {
          subtotal: Number(quotation.currentVersion?.subtotal ?? 0),
          discountAmount: Number(quotation.currentVersion?.discountAmount ?? 0),
          taxAmount: Number(quotation.currentVersion?.taxAmount ?? 0),
          grandTotal: Number(quotation.currentVersion?.grandTotal ?? 0),
          items: quotation.currentVersion?.items.map((item) => ({
            serviceName: item.serviceName,
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            lineTotal: Number(item.lineTotal),
          })) || [],
        },
      },
    });

    await logAudit(tx, quotation.id, 'CONVERTED_TO_PROJECT', 'Quotation converted into project', req.user!.id, quotation.currentVersion?.id, {
      projectId: createdProject.id,
    });

    return createdProject;
  });

  res.status(201).json(project);
}));

router.get('/:id/pdf', verifyToken, asyncHandler(async (req, res) => {
  renderPdf(res, await getQuotationOrThrow(req.params.id));
}));

export default router;