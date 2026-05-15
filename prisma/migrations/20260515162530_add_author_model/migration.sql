-- CreateTable: authors
CREATE TABLE "authors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT DEFAULT NULL,
    "avatar" TEXT DEFAULT NULL,
    "email" TEXT DEFAULT NULL,
    "twitter" TEXT DEFAULT NULL,
    "linkedin" TEXT DEFAULT NULL,
    "website" TEXT DEFAULT NULL,
    "credentials" TEXT DEFAULT NULL,
    "job_title" TEXT DEFAULT NULL,
    "domain" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "authors_domain_slug_key" ON "authors"("domain", "slug");

-- AlterTable: posts (nullable FK to authors, NULL by default so existing rows stay untouched)
ALTER TABLE "posts" ADD COLUMN "author_ref_id" INTEGER DEFAULT NULL;

-- CreateIndex
CREATE INDEX "posts_author_ref_id_idx" ON "posts"("author_ref_id");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_ref_id_fkey" FOREIGN KEY ("author_ref_id") REFERENCES "authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
