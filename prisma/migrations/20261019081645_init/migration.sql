-- CreateTable
CREATE TABLE "Music" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "Music_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Singer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Singer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SongCategory" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "SongCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistMusic" (
    "playlistId" INTEGER NOT NULL,
    "musicId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "PlaylistMusic_pkey" PRIMARY KEY ("playlistId","musicId")
);

-- CreateTable
CREATE TABLE "_MusicToSinger" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_MusicToSinger_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Music_title_idx" ON "Music"("title");

-- CreateIndex
CREATE UNIQUE INDEX "SongCategory_category_key" ON "SongCategory"("category");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistMusic_playlistId_position_key" ON "PlaylistMusic"("playlistId", "position");

-- CreateIndex
CREATE INDEX "_MusicToSinger_B_index" ON "_MusicToSinger"("B");

-- AddForeignKey
ALTER TABLE "Music" ADD CONSTRAINT "Music_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SongCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistMusic" ADD CONSTRAINT "PlaylistMusic_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistMusic" ADD CONSTRAINT "PlaylistMusic_musicId_fkey" FOREIGN KEY ("musicId") REFERENCES "Music"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MusicToSinger" ADD CONSTRAINT "_MusicToSinger_A_fkey" FOREIGN KEY ("A") REFERENCES "Music"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MusicToSinger" ADD CONSTRAINT "_MusicToSinger_B_fkey" FOREIGN KEY ("B") REFERENCES "Singer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
