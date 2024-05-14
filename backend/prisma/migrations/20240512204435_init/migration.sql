-- CreateTable
CREATE TABLE "Profile" (
    "name" TEXT NOT NULL,
    "email" INTEGER NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");
