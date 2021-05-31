-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "firstname" VARCHAR(255) NOT NULL,
    "lastname" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "password" VARCHAR(255),
    "last_update" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "created_by_id" INTEGER NOT NULL,
    "assigned_to_id" INTEGER NOT NULL,
    "dashboard_belonging_to_id" INTEGER NOT NULL,
    "status" VARCHAR(255) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboards" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "members_id" INTEGER[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_manyToMany" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users.id_unique" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users.email_unique" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tasks.id_unique" ON "tasks"("id");

-- CreateIndex
CREATE UNIQUE INDEX "dashboards.id_unique" ON "dashboards"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_manyToMany_AB_unique" ON "_manyToMany"("A", "B");

-- CreateIndex
CREATE INDEX "_manyToMany_B_index" ON "_manyToMany"("B");

-- AddForeignKey
ALTER TABLE "_manyToMany" ADD FOREIGN KEY ("A") REFERENCES "dashboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_manyToMany" ADD FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD FOREIGN KEY ("dashboard_belonging_to_id") REFERENCES "dashboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboards" ADD FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
