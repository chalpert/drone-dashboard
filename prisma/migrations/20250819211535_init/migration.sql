-- CreateTable
CREATE TABLE "drones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serial" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "overallCompletion" REAL NOT NULL DEFAULT 0,
    "startDate" DATETIME,
    "estimatedCompletion" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "component_definitions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    CONSTRAINT "component_definitions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category_definitions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "category_definitions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "weight" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "drone_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "droneId" TEXT NOT NULL,
    "categoryDefinitionId" TEXT NOT NULL,
    "completionPercentage" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "drone_categories_droneId_fkey" FOREIGN KEY ("droneId") REFERENCES "drones" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "drone_categories_categoryDefinitionId_fkey" FOREIGN KEY ("categoryDefinitionId") REFERENCES "category_definitions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "drone_components" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "droneCategoryId" TEXT NOT NULL,
    "componentDefinitionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "drone_components_droneCategoryId_fkey" FOREIGN KEY ("droneCategoryId") REFERENCES "drone_categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "drone_components_componentDefinitionId_fkey" FOREIGN KEY ("componentDefinitionId") REFERENCES "component_definitions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "build_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "droneId" TEXT NOT NULL,
    "componentName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "build_activities_droneId_fkey" FOREIGN KEY ("droneId") REFERENCES "drones" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "drones_serial_key" ON "drones"("serial");

-- CreateIndex
CREATE UNIQUE INDEX "category_definitions_name_key" ON "category_definitions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "drone_categories_droneId_categoryDefinitionId_key" ON "drone_categories"("droneId", "categoryDefinitionId");

-- CreateIndex
CREATE UNIQUE INDEX "drone_components_droneCategoryId_componentDefinitionId_key" ON "drone_components"("droneCategoryId", "componentDefinitionId");
