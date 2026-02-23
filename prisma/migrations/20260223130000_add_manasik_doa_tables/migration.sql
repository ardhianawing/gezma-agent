-- CreateTable
CREATE TABLE "manasik_lessons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "videoUrl" TEXT,
    "content" TEXT NOT NULL,
    "tips" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "emoji" TEXT NOT NULL DEFAULT '📖',
    "agencyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manasik_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doa_prayers" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "arabic" TEXT NOT NULL,
    "latin" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "occasion" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🤲',
    "order" INTEGER NOT NULL DEFAULT 0,
    "agencyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doa_prayers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pilgrim_manasik_progress" (
    "id" TEXT NOT NULL,
    "pilgrimId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pilgrim_manasik_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pilgrim_doa_favorites" (
    "id" TEXT NOT NULL,
    "pilgrimId" TEXT NOT NULL,
    "doaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pilgrim_doa_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pilgrim_manasik_progress_pilgrimId_lessonId_key" ON "pilgrim_manasik_progress"("pilgrimId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "pilgrim_doa_favorites_pilgrimId_doaId_key" ON "pilgrim_doa_favorites"("pilgrimId", "doaId");

-- AddForeignKey
ALTER TABLE "manasik_lessons" ADD CONSTRAINT "manasik_lessons_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doa_prayers" ADD CONSTRAINT "doa_prayers_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pilgrim_manasik_progress" ADD CONSTRAINT "pilgrim_manasik_progress_pilgrimId_fkey" FOREIGN KEY ("pilgrimId") REFERENCES "pilgrims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pilgrim_manasik_progress" ADD CONSTRAINT "pilgrim_manasik_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "manasik_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pilgrim_doa_favorites" ADD CONSTRAINT "pilgrim_doa_favorites_pilgrimId_fkey" FOREIGN KEY ("pilgrimId") REFERENCES "pilgrims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pilgrim_doa_favorites" ADD CONSTRAINT "pilgrim_doa_favorites_doaId_fkey" FOREIGN KEY ("doaId") REFERENCES "doa_prayers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
