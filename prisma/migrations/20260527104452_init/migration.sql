-- CreateTable
CREATE TABLE "app_user" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "app_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "color" VARCHAR(7) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "appUserId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget" (
    "id" SERIAL NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "limitCriteria" DECIMAL(5,2) NOT NULL DEFAULT 80.00,
    "projectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert" (
    "id" SERIAL NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'unread',
    "message" TEXT NOT NULL,
    "budgetId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_user_alert" (
    "appUserId" INTEGER NOT NULL,
    "alertId" INTEGER NOT NULL,

    CONSTRAINT "app_user_alert_pkey" PRIMARY KEY ("appUserId","alertId")
);

-- CreateTable
CREATE TABLE "participant" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "appUserId" INTEGER,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_participant" (
    "projectId" INTEGER NOT NULL,
    "participantId" INTEGER NOT NULL,

    CONSTRAINT "project_participant_pkey" PRIMARY KEY ("projectId","participantId")
);

-- CreateTable
CREATE TABLE "operation" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payerParticipantId" INTEGER NOT NULL,
    "appUserId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "operation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operation_participant" (
    "operationId" INTEGER NOT NULL,
    "participantId" INTEGER NOT NULL,
    "repartitionAmount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "operation_participant_pkey" PRIMARY KEY ("operationId","participantId")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_user_email_key" ON "app_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "category_color_key" ON "category"("color");

-- CreateIndex
CREATE UNIQUE INDEX "budget_projectId_key" ON "budget"("projectId");

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget" ADD CONSTRAINT "budget_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert" ADD CONSTRAINT "alert_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_user_alert" ADD CONSTRAINT "app_user_alert_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_user_alert" ADD CONSTRAINT "app_user_alert_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant" ADD CONSTRAINT "participant_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_participant" ADD CONSTRAINT "project_participant_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_participant" ADD CONSTRAINT "project_participant_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation" ADD CONSTRAINT "operation_payerParticipantId_fkey" FOREIGN KEY ("payerParticipantId") REFERENCES "participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation" ADD CONSTRAINT "operation_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation" ADD CONSTRAINT "operation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation" ADD CONSTRAINT "operation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation_participant" ADD CONSTRAINT "operation_participant_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "operation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation_participant" ADD CONSTRAINT "operation_participant_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
