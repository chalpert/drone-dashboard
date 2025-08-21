/*
  Warnings:

  - You are about to drop the `category_definitions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `component_definitions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `drone_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `drone_components` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `componentName` on the `build_activities` table. All the data in the column will be lost.
  - Added the required column `assemblyName` to the `build_activities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemName` to the `build_activities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `systemName` to the `build_activities` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "category_definitions_name_key";

-- DropIndex
DROP INDEX "drone_categories_droneId_categoryDefinitionId_key";

-- DropIndex
DROP INDEX "drone_components_droneCategoryId_componentDefinitionId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "category_definitions";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "component_definitions";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "drone_categories";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "drone_components";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "system_definitions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "weight" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "assembly_definitions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    CONSTRAINT "assembly_definitions_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "system_definitions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "item_definitions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "assemblyId" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    CONSTRAINT "item_definitions_assemblyId_fkey" FOREIGN KEY ("assemblyId") REFERENCES "assembly_definitions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "drone_systems" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "droneId" TEXT NOT NULL,
    "systemDefinitionId" TEXT NOT NULL,
    "completionPercentage" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "drone_systems_droneId_fkey" FOREIGN KEY ("droneId") REFERENCES "drones" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "drone_systems_systemDefinitionId_fkey" FOREIGN KEY ("systemDefinitionId") REFERENCES "system_definitions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "drone_assemblies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "droneSystemId" TEXT NOT NULL,
    "assemblyDefinitionId" TEXT NOT NULL,
    "completionPercentage" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "drone_assemblies_droneSystemId_fkey" FOREIGN KEY ("droneSystemId") REFERENCES "drone_systems" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "drone_assemblies_assemblyDefinitionId_fkey" FOREIGN KEY ("assemblyDefinitionId") REFERENCES "assembly_definitions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "drone_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "droneAssemblyId" TEXT NOT NULL,
    "itemDefinitionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "drone_items_droneAssemblyId_fkey" FOREIGN KEY ("droneAssemblyId") REFERENCES "drone_assemblies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "drone_items_itemDefinitionId_fkey" FOREIGN KEY ("itemDefinitionId") REFERENCES "item_definitions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Clear existing build_activities data (will be regenerated with seed data)
DELETE FROM "build_activities";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_build_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "droneId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "assemblyName" TEXT NOT NULL,
    "systemName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "build_activities_droneId_fkey" FOREIGN KEY ("droneId") REFERENCES "drones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
-- Note: Not copying old build_activities data as schema has changed significantly
DROP TABLE "build_activities";
ALTER TABLE "new_build_activities" RENAME TO "build_activities";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "system_definitions_name_key" ON "system_definitions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "drone_systems_droneId_systemDefinitionId_key" ON "drone_systems"("droneId", "systemDefinitionId");

-- CreateIndex
CREATE UNIQUE INDEX "drone_assemblies_droneSystemId_assemblyDefinitionId_key" ON "drone_assemblies"("droneSystemId", "assemblyDefinitionId");

-- CreateIndex
CREATE UNIQUE INDEX "drone_items_droneAssemblyId_itemDefinitionId_key" ON "drone_items"("droneAssemblyId", "itemDefinitionId");
