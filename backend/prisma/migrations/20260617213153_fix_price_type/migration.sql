-- AlterTable: change Product.price from String to Float
-- SQLite does not support ALTER COLUMN, so recreate the table

CREATE TABLE IF NOT EXISTS "Product_new" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "image" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "Product_new" ("id", "name", "description", "price", "image", "stock", "category", "createdAt")
SELECT "id", "name", "description", CAST("price" AS REAL), "image", "stock", "category", "createdAt"
FROM "Product";

DROP TABLE "Product";

ALTER TABLE "Product_new" RENAME TO "Product";
