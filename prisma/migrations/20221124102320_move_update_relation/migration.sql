/*
  Warnings:

  - You are about to drop the column `bookId` on the `Update` table. All the data in the column will be lost.
  - Added the required column `savedBookId` to the `Update` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Update" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "progress" INTEGER NOT NULL,
    "savedBookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Update_savedBookId_fkey" FOREIGN KEY ("savedBookId") REFERENCES "SavedBook" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Update_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Update" ("content", "createdAt", "id", "progress", "userId") SELECT "content", "createdAt", "id", "progress", "userId" FROM "Update";
DROP TABLE "Update";
ALTER TABLE "new_Update" RENAME TO "Update";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
