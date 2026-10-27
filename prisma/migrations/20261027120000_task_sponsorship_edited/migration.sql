-- CreateEnum
CREATE TYPE "Sponsorship" AS ENUM ('ORGANIC', 'PAID');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "sponsorship" "Sponsorship",
ADD COLUMN "edited_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN "telegram_chat_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_telegram_chat_id_key" ON "users"("telegram_chat_id");
