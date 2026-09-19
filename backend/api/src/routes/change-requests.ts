import { Router, Response } from 'express';
import { ChangeRequestStatus, ChangeRequestType, ChangeRequestPriority, ApprovalDecision } from '@prisma/client';
import { asyncHandler } from '../utils/async-handler';
import { AuthRequest, verifyToken } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import {
  canView,
  createChangeRequest,
  decideApproval,
  getChangeRequest,
  isPrivileged,
  transitionChangeRequest,
  updateChangeRequest,
  updateSection,
} from '../services/change-request.service';

const router = Router();
router.use(verifyToken);

const requestTypes: ChangeRequestType[] = ['CHANGE_REQUEST', 'ENHANCEMENT', 'BUG_FIX', 'NEW_REQUIREMENT', 'CONFIGURATION_CHANGE'];
const priorities: ChangeRequestPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const statuses: ChangeRequestStatus[] = ['DRAFT', 'SUBMITTED', 'TECHNICAL_ASSESSMENT', 'APPROVAL', 'IMPLEMENTATION', 'UAT_TESTING', 'DEPLOYMENT', 'CLOSED', 'REJECTED', 'RETURNED', 'UAT_FAILED'];

router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const where = isPrivileged(req.user?.role) ? {} : { requestedById: req.user!.id };
  const requests = await prisma.changeRequest.findMany({
    where,
    include: { project: { select: { id: true, title: true, status: true } }, requestedBy: { select: { id: true, firstName: true, lastName: true, email: true } }, preparedBy: { select: { id: true, firstName: true, lastName: true, email: true } }, approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(requests);
}));

router.get('/users/options', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isPrivileged(req.user?.role)) return res.status(403).json({ error: 'Admin or support access required' });
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, firstName: true, lastName: true, email: true, role: true },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
  });
  res.json(users);
}));

router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, requestType, systemModule, priority, description, currentBehaviour, proposedChange, businessJustification, projectId, requesterName, requesterEmail, preparedByName, approvedByName, requestedById, preparedById, approvedById, action = 'draft' } = req.body;
  const required = [title, requestType, systemModule, description, currentBehaviour, proposedChange, businessJustification];
  if (!required.every((value) => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ error: 'All Change Request fields are required' });
  }
  if (!requestTypes.includes(requestType) || (priority && !priorities.includes(priority)) || !['draft', 'submit'].includes(action)) {
    return res.status(400).json({ error: 'Invalid request type, priority, or action' });
  }

  const request = await createChangeRequest({
    title: title.trim(), requestType, systemModule: systemModule.trim(), priority,
    description: description.trim(), currentBehaviour: currentBehaviour.trim(), proposedChange: proposedChange.trim(),
    businessJustification: businessJustification.trim(), projectId: projectId || null,
    requestedById: requestedById || undefined, preparedById: preparedById || null, approvedById: approvedById || null,
    requesterName: requesterName || null, requesterEmail: requesterEmail || null, preparedByName: preparedByName || null, approvedByName: approvedByName || null,
  }, req.user!.id, action === 'submit');
  res.status(201).json(request);
}));

router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const request = await getChangeRequest(req.params.id);
  if (!request) return res.status(404).json({ error: 'Change Request not found' });
  if (!canView(request.requestedById, req.user!.id, req.user?.role)) return res.status(403).json({ error: 'Unauthorized' });
  res.json(request);
}));

router.patch('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const existing = await getChangeRequest(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Change Request not found' });
  if (!canView(existing.requestedById, req.user!.id, req.user?.role)) return res.status(403).json({ error: 'Unauthorized' });

  const { title, requestType, systemModule, priority, description, currentBehaviour, proposedChange, businessJustification, projectId, requesterName, requesterEmail, preparedByName, approvedByName, requestedById, preparedById, approvedById } = req.body;
  if (![title, requestType, systemModule, description, currentBehaviour, proposedChange, businessJustification].every((value) => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ error: 'All Change Request fields are required' });
  }
  if (!requestTypes.includes(requestType) || !priorities.includes(priority)) {
    return res.status(400).json({ error: 'Invalid request type or priority' });
  }

  res.json(await updateChangeRequest(req.params.id, {
    title: title.trim(), requestType, systemModule: systemModule.trim(), priority,
    description: description.trim(), currentBehaviour: currentBehaviour.trim(), proposedChange: proposedChange.trim(),
    businessJustification: businessJustification.trim(), projectId: projectId || null,
    requesterName: requesterName || null, requesterEmail: requesterEmail || null, preparedByName: preparedByName || null, approvedByName: approvedByName || null,
  }));
}));

router.patch('/:id/transition', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isPrivileged(req.user?.role)) return res.status(403).json({ error: 'Admin or support access required' });
  const { status, comments } = req.body;
  if (!statuses.includes(status)) return res.status(400).json({ error: 'Invalid change request status' });
  try {
    const request = await transitionChangeRequest(req.params.id, status, req.user!.id, comments);
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to transition request' });
  }
}));

router.patch('/:id/assessment', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isPrivileged(req.user?.role)) return res.status(403).json({ error: 'Admin or support access required' });
  res.json(await updateSection(req.params.id, 'assessment', req.body, req.user!.id));
}));

router.patch('/:id/implementation', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isPrivileged(req.user?.role)) return res.status(403).json({ error: 'Admin or support access required' });
  res.json(await updateSection(req.params.id, 'implementation', req.body, req.user!.id));
}));

router.post('/:id/uat-cases', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isPrivileged(req.user?.role)) return res.status(403).json({ error: 'Admin or support access required' });
  res.status(201).json(await updateSection(req.params.id, 'uat', req.body, req.user!.id));
}));

router.patch('/:id/approvals', asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isPrivileged(req.user?.role)) return res.status(403).json({ error: 'Admin or support access required' });
  const { decision, comments } = req.body;
  if (!(['APPROVED', 'REJECTED', 'RETURNED'] as ApprovalDecision[]).includes(decision)) {
    return res.status(400).json({ error: 'Invalid approval decision' });
  }
  try {
    res.json(await decideApproval(req.params.id, req.user!.id, decision, comments));
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to record approval' });
  }
}));

export default router;
