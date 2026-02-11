-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'free',
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "requestLimit" INTEGER NOT NULL DEFAULT 1000,
    "lastUsedAt" DATETIME,
    "expiresAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Model" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "technical" TEXT NOT NULL,
    "mAP" REAL NOT NULL,
    "precision" REAL,
    "inferenceMs" INTEGER,
    "image" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "roboflowId" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "modelFormat" TEXT,
    "onnxModelUrl" TEXT,
    "tfjsModelUrl" TEXT,
    "modelSizeBytes" INTEGER,
    "inputShape" TEXT,
    "outputShape" TEXT,
    "labels" TEXT,
    "preprocessing" TEXT,
    "postprocessing" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "apiAccessTier" TEXT DEFAULT 'free',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Model" ("category", "createdAt", "creator", "description", "id", "image", "inferenceMs", "isPublic", "mAP", "precision", "roboflowId", "slug", "tags", "technical", "title", "updatedAt", "version") SELECT "category", "createdAt", "creator", "description", "id", "image", "inferenceMs", "isPublic", "mAP", "precision", "roboflowId", "slug", "tags", "technical", "title", "updatedAt", "version" FROM "Model";
DROP TABLE "Model";
ALTER TABLE "new_Model" RENAME TO "Model";
CREATE UNIQUE INDEX "Model_slug_key" ON "Model"("slug");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "roboflowApiKey" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "premiumTier" TEXT DEFAULT 'free',
    "premiumUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "image", "name", "roboflowApiKey", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "image", "name", "roboflowApiKey", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");

-- CreateIndex
CREATE INDEX "ApiKey_key_idx" ON "ApiKey"("key");
