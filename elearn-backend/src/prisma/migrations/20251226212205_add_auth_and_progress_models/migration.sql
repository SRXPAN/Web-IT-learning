-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialView" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeSpent" INTEGER,

    CONSTRAINT "MaterialView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "quizAttempts" INTEGER NOT NULL DEFAULT 0,
    "materialsViewed" INTEGER NOT NULL DEFAULT 0,
    "goalsCompleted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");

-- CreateIndex
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_token_key" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_email_idx" ON "EmailVerificationToken"("email");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_token_idx" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE INDEX "MaterialView_userId_idx" ON "MaterialView"("userId");

-- CreateIndex
CREATE INDEX "MaterialView_materialId_idx" ON "MaterialView"("materialId");

-- CreateIndex
CREATE INDEX "MaterialView_viewedAt_idx" ON "MaterialView"("viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialView_userId_materialId_key" ON "MaterialView"("userId", "materialId");

-- CreateIndex
CREATE INDEX "UserActivity_userId_idx" ON "UserActivity"("userId");

-- CreateIndex
CREATE INDEX "UserActivity_date_idx" ON "UserActivity"("date");

-- CreateIndex
CREATE UNIQUE INDEX "UserActivity_userId_date_key" ON "UserActivity"("userId", "date");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
