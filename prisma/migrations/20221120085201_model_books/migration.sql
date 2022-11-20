-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "authors" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SavedBook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shelf" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "finishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavedBook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Update" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "progress" INTEGER NOT NULL,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Update_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Update_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
