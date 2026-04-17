import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gezma.ezyindustries.my.id';
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/berita`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/komunitas`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic news articles
  let newsPages: MetadataRoute.Sitemap = [];
  try {
    const articles = await prisma.newsArticle.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
    });

    newsPages = articles.map(article => ({
      url: `${baseUrl}/berita/${article.slug}`,
      lastModified: article.updatedAt || article.publishedAt || now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch {
    // DB unavailable — sitemap still works with static pages
  }

  // Category pages
  const categories = ['regulasi', 'pengumuman', 'event', 'tips', 'peringatan'];
  const categoryPages: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${baseUrl}/berita?category=${cat}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // Forum category pages
  const forumCategories = ['review', 'regulasi', 'operasional', 'sharing', 'scam', 'tanya'];
  const forumCategoryPages: MetadataRoute.Sitemap = forumCategories.map(cat => ({
    url: `${baseUrl}/komunitas?category=${cat}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // Dynamic forum threads
  let forumPages: MetadataRoute.Sitemap = [];
  try {
    const threads = await prisma.forumThread.findMany({
      where: { deletedAt: null },
      select: { id: true, updatedAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    forumPages = threads.map(thread => ({
      url: `${baseUrl}/komunitas/${thread.id}`,
      lastModified: thread.updatedAt || thread.createdAt || now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch {
    // DB unavailable — sitemap still works with static pages
  }

  return [...staticPages, ...categoryPages, ...newsPages, ...forumCategoryPages, ...forumPages];
}
