-- Demo learners, signed-recognition replay protection, and global feed indexes.

-- AlterTable
ALTER TABLE "User" ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "RecognitionAttempt" ADD COLUMN "nonce" TEXT;

-- CreateIndex
CREATE INDEX "User_isDemo_idx" ON "User"("isDemo");

-- CreateIndex
CREATE UNIQUE INDEX "RecognitionAttempt_nonce_key" ON "RecognitionAttempt"("nonce");

-- CreateIndex
CREATE INDEX "RecognitionAttempt_createdAt_idx" ON "RecognitionAttempt"("createdAt");

-- CreateIndex
CREATE INDEX "RecognitionAttempt_correct_createdAt_idx" ON "RecognitionAttempt"("correct", "createdAt");
