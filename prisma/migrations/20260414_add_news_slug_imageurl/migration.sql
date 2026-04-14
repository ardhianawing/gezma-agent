-- Add slug and imageUrl to news_articles
ALTER TABLE "news_articles" ADD COLUMN "slug" TEXT;
ALTER TABLE "news_articles" ADD COLUMN "imageUrl" TEXT;

-- Populate slugs from title
UPDATE "news_articles" SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE("title", '[^\w\s-]', '', 'g'), '[\s_-]+', '-', 'g')) WHERE "slug" IS NULL OR "slug" = '';

-- Make slug NOT NULL + UNIQUE
ALTER TABLE "news_articles" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "news_articles_slug_key" ON "news_articles"("slug");
