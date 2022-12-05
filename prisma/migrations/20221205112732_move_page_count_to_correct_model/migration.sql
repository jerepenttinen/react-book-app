/*
  Warnings:

  - You are about to drop the column `pageCount` on the `SavedBook` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN "pageCount" INTEGER;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SavedBook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shelf" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "finishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavedBook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SavedBook" ("bookId", "createdAt", "finishedAt", "id", "shelf", "userId") SELECT "bookId", "createdAt", "finishedAt", "id", "shelf", "userId" FROM "SavedBook";
DROP TABLE "SavedBook";
ALTER TABLE "new_SavedBook" RENAME TO "SavedBook";
CREATE UNIQUE INDEX "SavedBook_bookId_userId_key" ON "SavedBook"("bookId", "userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
