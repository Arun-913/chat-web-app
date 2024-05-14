-- CreateTable
CREATE TABLE "ChatRoom" (
    "roomId" INTEGER NOT NULL,
    "chats" TEXT[]
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_roomId_key" ON "ChatRoom"("roomId");
