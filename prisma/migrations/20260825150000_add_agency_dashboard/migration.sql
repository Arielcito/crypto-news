-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CHURNED');

-- CreateEnum
CREATE TYPE "PackageStatus" AS ENUM ('OPEN', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'DONE');

-- CreateEnum
CREATE TYPE "SocialNetwork" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'X', 'TIKTOK', 'YOUTUBE');

-- CreateEnum
CREATE TYPE "PostOrigin" AS ENUM ('POSTPROXY', 'NATIVE');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "must_change_password" BOOLEAN NOT NULL DEFAULT false,
    "session_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "monthly_amount" INTEGER,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_profiles" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "postproxy_profile_id" TEXT NOT NULL,
    "network" "SocialNetwork" NOT NULL,
    "handle" TEXT,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "month" DATE NOT NULL,
    "committed_pieces" INTEGER NOT NULL,
    "amount" INTEGER,
    "status" "PackageStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "package_id" INTEGER NOT NULL,
    "assignee_id" INTEGER,
    "title" TEXT NOT NULL,
    "network" "SocialNetwork" NOT NULL,
    "format" TEXT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "permalink" TEXT,
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "briefs" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "blob_url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "content_type" TEXT NOT NULL,
    "uploaded_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "briefs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "package_id" INTEGER NOT NULL,
    "generated_by_id" INTEGER,
    "snapshot" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_posts" (
    "id" SERIAL NOT NULL,
    "postproxy_post_id" TEXT NOT NULL,
    "network" "SocialNetwork" NOT NULL,
    "client_profile_id" INTEGER,
    "permalink" TEXT,
    "body" TEXT,
    "origin" "PostOrigin" NOT NULL DEFAULT 'NATIVE',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_post_metrics" (
    "id" SERIAL NOT NULL,
    "social_post_id" INTEGER NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL,
    "impressions" INTEGER,
    "reach" INTEGER,
    "likes" INTEGER,
    "comments" INTEGER,
    "saves" INTEGER,
    "shares" INTEGER,
    "clicks" INTEGER,

    CONSTRAINT "social_post_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_account_metrics" (
    "id" SERIAL NOT NULL,
    "client_profile_id" INTEGER NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL,
    "followers" INTEGER,
    "posts" INTEGER,
    "reach_1d" INTEGER,
    "reach_7d" INTEGER,
    "reach_30d" INTEGER,
    "profile_views_7d" INTEGER,
    "accounts_engaged_7d" INTEGER,
    "interactions_7d" INTEGER,
    "website_clicks_7d" INTEGER,

    CONSTRAINT "social_account_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_slug_key" ON "clients"("slug");

-- CreateIndex
CREATE INDEX "client_profiles_client_id_idx" ON "client_profiles"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_profiles_postproxy_profile_id_network_key" ON "client_profiles"("postproxy_profile_id", "network");

-- CreateIndex
CREATE UNIQUE INDEX "packages_client_id_month_key" ON "packages"("client_id", "month");

-- CreateIndex
CREATE INDEX "tasks_package_id_idx" ON "tasks"("package_id");

-- CreateIndex
CREATE INDEX "tasks_assignee_id_status_idx" ON "tasks"("assignee_id", "status");

-- CreateIndex
CREATE INDEX "tasks_due_date_idx" ON "tasks"("due_date");

-- CreateIndex
CREATE INDEX "briefs_client_id_idx" ON "briefs"("client_id");

-- CreateIndex
CREATE INDEX "reports_package_id_idx" ON "reports"("package_id");

-- CreateIndex
CREATE INDEX "social_posts_client_profile_id_published_at_idx" ON "social_posts"("client_profile_id", "published_at");

-- CreateIndex
CREATE INDEX "social_posts_permalink_idx" ON "social_posts"("permalink");

-- CreateIndex
CREATE UNIQUE INDEX "social_posts_postproxy_post_id_network_key" ON "social_posts"("postproxy_post_id", "network");

-- CreateIndex
CREATE INDEX "social_post_metrics_social_post_id_recorded_at_idx" ON "social_post_metrics"("social_post_id", "recorded_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "social_post_metrics_social_post_id_recorded_at_key" ON "social_post_metrics"("social_post_id", "recorded_at");

-- CreateIndex
CREATE INDEX "social_account_metrics_client_profile_id_recorded_at_idx" ON "social_account_metrics"("client_profile_id", "recorded_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "social_account_metrics_client_profile_id_recorded_at_key" ON "social_account_metrics"("client_profile_id", "recorded_at");

-- AddForeignKey
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packages" ADD CONSTRAINT "packages_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "briefs" ADD CONSTRAINT "briefs_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "briefs" ADD CONSTRAINT "briefs_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_generated_by_id_fkey" FOREIGN KEY ("generated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_client_profile_id_fkey" FOREIGN KEY ("client_profile_id") REFERENCES "client_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_post_metrics" ADD CONSTRAINT "social_post_metrics_social_post_id_fkey" FOREIGN KEY ("social_post_id") REFERENCES "social_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_account_metrics" ADD CONSTRAINT "social_account_metrics_client_profile_id_fkey" FOREIGN KEY ("client_profile_id") REFERENCES "client_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

