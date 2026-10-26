-- AlterEnum
ALTER TYPE "TaskStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
ALTER TYPE "SocialNetwork" ADD VALUE 'WEB';
ALTER TYPE "SocialNetwork" ADD VALUE 'DISCORD';
ALTER TYPE "SocialNetwork" ADD VALUE 'OTHER';

-- CreateEnum
CREATE TYPE "Outlet" AS ENUM ('BTCARG', 'TEV', 'CLIENT');

-- AlterTable
ALTER TABLE "clients" ADD COLUMN "requires_approval" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "co_assignee_id" INTEGER,
ADD COLUMN "outlet" "Outlet",
ADD COLUMN "approved_at" TIMESTAMP(3),
ADD COLUMN "evidence_url" TEXT;

-- CreateIndex
CREATE INDEX "tasks_co_assignee_id_idx" ON "tasks"("co_assignee_id");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_co_assignee_id_fkey" FOREIGN KEY ("co_assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
