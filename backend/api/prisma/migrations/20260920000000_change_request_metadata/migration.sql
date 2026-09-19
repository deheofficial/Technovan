ALTER TABLE "ChangeRequest" ADD COLUMN "preparedById" TEXT;
ALTER TABLE "ChangeRequest" ADD COLUMN "approvedById" TEXT;

CREATE INDEX "ChangeRequest_preparedById_idx" ON "ChangeRequest"("preparedById");
CREATE INDEX "ChangeRequest_approvedById_idx" ON "ChangeRequest"("approvedById");

ALTER TABLE "ChangeRequest" ADD CONSTRAINT "ChangeRequest_preparedById_fkey" FOREIGN KEY ("preparedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChangeRequest" ADD CONSTRAINT "ChangeRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
