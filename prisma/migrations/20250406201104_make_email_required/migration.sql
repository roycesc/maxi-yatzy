/*
  Warnings:

  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "users_username_key";

-- Update existing users with NULL email to a placeholder
UPDATE "users" SET "email" = 'placeholder-' || "id" || '@example.com' WHERE "email" IS NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "email" SET NOT NULL;
