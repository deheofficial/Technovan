import { ChangeRequestStatus, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

const transitions: Record<ChangeRequestStatus, ChangeRequestStatus[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['TECHNICAL_ASSESSMENT', 'RETURNED', 'REJECTED'],
  TECHNICAL_ASSESSMENT: ['APPROVAL', 'RETURNED', 'REJECTED'],
  APPROVAL: ['IMPLEMENTATION', 'RETURNED', 'REJECTED'],
  IMPLEMENTATION: ['UAT_TESTING', 'RETURNED', 'REJECTED'],
  UAT_TESTING: ['DEPLOYMENT', 'UAT_FAILED', 'RETURNED'],
  DEPLOYMENT: ['CLOSED', 'RETURNED'],
  CLOSED: [],
  REJECTED: ['DRAFT'],
  RETURNED: ['DRAFT'],
  UAT_FAILED: ['IMPLEMENTATION'],
};

export const detailInclude = {
  requestedBy: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
  preparedBy: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
  approvedBy: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
  assignedTo: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
  project: { select: { id: true, title: true, status: true } },
  technicalAssessment: { include: { assessedBy: { select: { id: true, firstName: true, lastName: true } } } },
  approvals: { include: { approver: { select: { id: true, firstName: true, lastName: true, email: true } } }, orderBy: { createdAt: 'asc' as const } },
  implementation: true,
  uatTestCases: { include: { tester: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'asc' as const } },
  attachments: { include: { uploadedBy: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' as const } },
  statusHistory: { include: { changedBy: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' as const } },
};

export function isPrivileged(role?: string): boolean {
  return role === 'ADMIN' || role === 'SUPPORT';
}

export function canView(requestedById: string, userId: string, role?: string): boolean {
  return isPrivileged(role) || requestedById === userId;
}

async function nextCrNumber(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear();
  const count = await tx.changeRequest.count({
    where: { crNumber: { startsWith: `CR-${year}-` } },
  });
  return `CR-${year}-${String(count + 1).padStart(4, '0')}`;
}

export type ChangeRequestInput = {
  title: string;
  requestType: 'CHANGE_REQUEST' | 'ENHANCEMENT' | 'BUG_FIX' | 'NEW_REQUIREMENT' | 'CONFIGURATION_CHANGE';
  systemModule: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  currentBehaviour: string;
  proposedChange: string;
  businessJustification: string;
  projectId?: string | null;
  requesterName?: string | null;
  requesterEmail?: string | null;
  preparedByName?: string | null;
  approvedByName?: string | null;
  requestedById?: string;
  preparedById?: string | null;
  approvedById?: string | null;
};

export async function createChangeRequest(input: ChangeRequestInput, requestedById: string, submit = false) {
  const requestId = await prisma.$transaction(async (tx) => {
    const request = await tx.changeRequest.create({
      data: {
        ...input,
        priority: input.priority || 'MEDIUM',
        requestedById,
        crNumber: await nextCrNumber(tx),
        status: submit ? 'SUBMITTED' : 'DRAFT',
        submittedAt: submit ? new Date() : null,
      },
    });
    await tx.changeRequestStatusHistory.create({
      data: {
        changeRequestId: request.id,
        toStatus: submit ? 'SUBMITTED' : 'DRAFT',
        changedById: requestedById,
        comments: submit ? 'Request submitted' : 'Request created',
      },
    });
    return request.id;
  }, { timeout: 15000 });

  return getChangeRequest(requestId);
}

export function getChangeRequest(id: string) {
  return prisma.changeRequest.findUnique({ where: { id }, include: detailInclude });
}

export function updateChangeRequest(id: string, input: Partial<ChangeRequestInput>) {
  return prisma.changeRequest.update({
    where: { id },
    data: {
      title: input.title,
      requestType: input.requestType,
      systemModule: input.systemModule,
      priority: input.priority,
      description: input.description,
      currentBehaviour: input.currentBehaviour,
      proposedChange: input.proposedChange,
      businessJustification: input.businessJustification,
      projectId: input.projectId,
      requesterName: input.requesterName,
      requesterEmail: input.requesterEmail,
      preparedByName: input.preparedByName,
      approvedByName: input.approvedByName,
      requestedById: input.requestedById,
      preparedById: input.preparedById,
      approvedById: input.approvedById,
    },
    include: detailInclude,
  });
}

export async function transitionChangeRequest(
  id: string,
  toStatus: ChangeRequestStatus,
  changedById: string,
  comments?: string,
) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.changeRequest.findUnique({ where: { id } });
    if (!current) throw new Error('Change request not found');
    if (!transitions[current.status].includes(toStatus)) {
      throw new Error(`Cannot move a ${current.status} request to ${toStatus}`);
    }

    const updated = await tx.changeRequest.update({
      where: { id },
      data: {
        status: toStatus,
        submittedAt: toStatus === 'SUBMITTED' ? new Date() : undefined,
        closedAt: toStatus === 'CLOSED' ? new Date() : undefined,
      },
    });
    await tx.changeRequestStatusHistory.create({
      data: { changeRequestId: id, fromStatus: current.status, toStatus, changedById, comments },
    });
    return updated;
  });
}

export async function updateSection(
  id: string,
  section: 'assessment' | 'implementation' | 'uat',
  data: Record<string, unknown>,
  userId: string,
) {
  if (section === 'assessment') {
    return prisma.technicalAssessment.upsert({
      where: { changeRequestId: id },
      create: { changeRequestId: id, assessedById: userId, ...(data as any) },
      update: { ...(data as any), assessedById: userId },
    });
  }
  if (section === 'implementation') {
    return prisma.changeRequestImplementation.upsert({
      where: { changeRequestId: id },
      create: { changeRequestId: id, ...(data as any) },
      update: data as any,
    });
  }
  if (section === 'uat') {
    return prisma.uATTestCase.create({
      data: { changeRequestId: id, testerId: userId, ...(data as any) },
    });
  }
  throw new Error('Unsupported section');
}

export async function decideApproval(
  id: string,
  approverId: string,
  decision: 'APPROVED' | 'REJECTED' | 'RETURNED',
  comments?: string,
) {
  const approval = await prisma.changeRequestApproval.upsert({
    where: { changeRequestId_approverId: { changeRequestId: id, approverId } },
    create: { changeRequestId: id, approverId, decision, comments, approvalDate: new Date() },
    update: { decision, comments, approvalDate: new Date() },
  });
  const nextStatus = { APPROVED: 'IMPLEMENTATION', REJECTED: 'REJECTED', RETURNED: 'RETURNED' }[decision] as ChangeRequestStatus;
  await transitionChangeRequest(id, nextStatus, approverId, comments);
  return approval;
}
