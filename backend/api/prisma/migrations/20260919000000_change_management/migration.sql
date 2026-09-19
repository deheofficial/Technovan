-- Change Management persistence
CREATE TYPE "ChangeRequestStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'TECHNICAL_ASSESSMENT', 'APPROVAL', 'IMPLEMENTATION', 'UAT_TESTING', 'DEPLOYMENT', 'CLOSED', 'REJECTED', 'RETURNED', 'UAT_FAILED');
CREATE TYPE "ChangeRequestType" AS ENUM ('CHANGE_REQUEST', 'ENHANCEMENT', 'BUG_FIX', 'NEW_REQUIREMENT', 'CONFIGURATION_CHANGE');
CREATE TYPE "ChangeRequestPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "ApprovalDecision" AS ENUM ('APPROVED', 'REJECTED', 'RETURNED');
CREATE TYPE "UATResult" AS ENUM ('PENDING', 'PASS', 'FAIL');

CREATE TABLE "ChangeRequest" (
    "id" TEXT NOT NULL,
    "crNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requestType" "ChangeRequestType" NOT NULL,
    "systemModule" TEXT NOT NULL,
    "priority" "ChangeRequestPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "ChangeRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "currentBehaviour" TEXT NOT NULL,
    "proposedChange" TEXT NOT NULL,
    "businessJustification" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "projectId" TEXT,
    "submittedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ChangeRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TechnicalAssessment" (
    "id" TEXT NOT NULL,
    "changeRequestId" TEXT NOT NULL,
    "assessedById" TEXT NOT NULL,
    "technicalImpact" TEXT NOT NULL,
    "databaseApiUiImpact" TEXT NOT NULL,
    "estimatedEffort" TEXT NOT NULL,
    "risk" TEXT NOT NULL,
    "dependencies" TEXT NOT NULL,
    "proposedSolution" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TechnicalAssessment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChangeRequestApproval" (
    "id" TEXT NOT NULL,
    "changeRequestId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "decision" "ApprovalDecision" NOT NULL,
    "comments" TEXT,
    "approvalDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ChangeRequestApproval_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChangeRequestImplementation" (
    "id" TEXT NOT NULL,
    "changeRequestId" TEXT NOT NULL,
    "assignedDeveloperTeam" TEXT NOT NULL,
    "implementationDetails" TEXT NOT NULL,
    "developmentStatus" TEXT NOT NULL,
    "version" TEXT,
    "deploymentDetails" TEXT,
    "rollbackPlan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ChangeRequestImplementation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UATTestCase" (
    "id" TEXT NOT NULL,
    "changeRequestId" TEXT NOT NULL,
    "testerId" TEXT NOT NULL,
    "testScenario" TEXT NOT NULL,
    "expectedResult" TEXT NOT NULL,
    "actualResult" TEXT,
    "result" "UATResult" NOT NULL DEFAULT 'PENDING',
    "uatApproval" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UATTestCase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChangeRequestStatusHistory" (
    "id" TEXT NOT NULL,
    "changeRequestId" TEXT NOT NULL,
    "fromStatus" "ChangeRequestStatus",
    "toStatus" "ChangeRequestStatus" NOT NULL,
    "changedById" TEXT NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChangeRequestStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChangeRequestAttachment" (
    "id" TEXT NOT NULL,
    "changeRequestId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ChangeRequestAttachment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ChangeRequest_crNumber_key" ON "ChangeRequest"("crNumber");
CREATE INDEX "ChangeRequest_requestedById_idx" ON "ChangeRequest"("requestedById");
CREATE INDEX "ChangeRequest_assignedToId_idx" ON "ChangeRequest"("assignedToId");
CREATE INDEX "ChangeRequest_projectId_idx" ON "ChangeRequest"("projectId");
CREATE INDEX "ChangeRequest_status_idx" ON "ChangeRequest"("status");
CREATE INDEX "ChangeRequest_createdAt_idx" ON "ChangeRequest"("createdAt");
CREATE UNIQUE INDEX "TechnicalAssessment_changeRequestId_key" ON "TechnicalAssessment"("changeRequestId");
CREATE INDEX "TechnicalAssessment_assessedById_idx" ON "TechnicalAssessment"("assessedById");
CREATE UNIQUE INDEX "ChangeRequestApproval_changeRequestId_approverId_key" ON "ChangeRequestApproval"("changeRequestId", "approverId");
CREATE INDEX "ChangeRequestApproval_approverId_idx" ON "ChangeRequestApproval"("approverId");
CREATE UNIQUE INDEX "ChangeRequestImplementation_changeRequestId_key" ON "ChangeRequestImplementation"("changeRequestId");
CREATE INDEX "UATTestCase_testerId_idx" ON "UATTestCase"("testerId");
CREATE INDEX "ChangeRequestStatusHistory_changeRequestId_idx" ON "ChangeRequestStatusHistory"("changeRequestId");
CREATE INDEX "ChangeRequestStatusHistory_changedById_idx" ON "ChangeRequestStatusHistory"("changedById");
CREATE INDEX "ChangeRequestAttachment_uploadedById_idx" ON "ChangeRequestAttachment"("uploadedById");

ALTER TABLE "ChangeRequest" ADD CONSTRAINT "ChangeRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChangeRequest" ADD CONSTRAINT "ChangeRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChangeRequest" ADD CONSTRAINT "ChangeRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TechnicalAssessment" ADD CONSTRAINT "TechnicalAssessment_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "ChangeRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TechnicalAssessment" ADD CONSTRAINT "TechnicalAssessment_assessedById_fkey" FOREIGN KEY ("assessedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChangeRequestApproval" ADD CONSTRAINT "ChangeRequestApproval_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "ChangeRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChangeRequestApproval" ADD CONSTRAINT "ChangeRequestApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChangeRequestImplementation" ADD CONSTRAINT "ChangeRequestImplementation_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "ChangeRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UATTestCase" ADD CONSTRAINT "UATTestCase_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "ChangeRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UATTestCase" ADD CONSTRAINT "UATTestCase_testerId_fkey" FOREIGN KEY ("testerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChangeRequestStatusHistory" ADD CONSTRAINT "ChangeRequestStatusHistory_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "ChangeRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChangeRequestStatusHistory" ADD CONSTRAINT "ChangeRequestStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChangeRequestAttachment" ADD CONSTRAINT "ChangeRequestAttachment_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "ChangeRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChangeRequestAttachment" ADD CONSTRAINT "ChangeRequestAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
