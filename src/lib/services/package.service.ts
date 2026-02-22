import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { packageFormSchema } from '@/lib/validations/package';
import { logActivity } from '@/lib/activity-logger';
import { slugify, computePricing } from '@/lib/utils';

interface ListPackagesParams {
  agencyId: string;
  search?: string;
  category?: string;
  isActive?: string;
}

export async function listPackages({ agencyId, search, category, isActive }: ListPackagesParams) {
  const where: Record<string, unknown> = { agencyId };

  if (category) where.category = category;
  if (isActive !== undefined && isActive !== '') where.isActive = isActive === 'true';
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const data = await prisma.package.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return { data };
}

export async function getPackageById(id: string, agencyId: string) {
  const pkg = await prisma.package.findFirst({ where: { id, agencyId } });
  if (!pkg) throw new AppError('NOT_FOUND', 'Paket tidak ditemukan');
  return pkg;
}

interface CreatePackageParams {
  body: unknown;
  userId: string;
  agencyId: string;
}

export async function createPackage({ body, userId, agencyId }: CreatePackageParams) {
  const data = packageFormSchema.parse(body);

  let slug = slugify(data.name);
  const existingSlug = await prisma.package.findFirst({
    where: { slug, agencyId },
  });
  if (existingSlug) slug = `${slug}-${Date.now()}`;

  const { totalHpp, marginAmount, publishedPrice } = computePricing(
    data.hpp as Record<string, number>,
    data.margin,
  );

  const pkg = await prisma.package.create({
    data: {
      name: data.name,
      slug,
      category: data.category,
      description: data.description,
      duration: data.duration,
      airline: data.airline,
      itinerary: JSON.parse(JSON.stringify(data.itinerary)),
      hpp: JSON.parse(JSON.stringify(data.hpp)),
      totalHpp,
      margin: data.margin,
      marginAmount,
      publishedPrice,
      makkahHotel: data.makkahHotel,
      makkahHotelRating: data.makkahHotelRating,
      makkahHotelDistance: data.makkahHotelDistance,
      madinahHotel: data.madinahHotel,
      madinahHotelRating: data.madinahHotelRating,
      madinahHotelDistance: data.madinahHotelDistance,
      inclusions: data.inclusions,
      exclusions: data.exclusions,
      isActive: data.isActive,
      agencyId,
    },
  });

  logActivity({
    type: 'package',
    action: 'created',
    title: 'Paket baru dibuat',
    description: `Paket "${pkg.name}" telah dibuat`,
    userId,
    agencyId,
    metadata: { entityId: pkg.id },
  });

  return pkg;
}

interface UpdatePackageParams {
  id: string;
  body: unknown;
  userId: string;
  agencyId: string;
}

export async function updatePackage({ id, body, userId, agencyId }: UpdatePackageParams) {
  const data = packageFormSchema.parse(body);

  const existing = await prisma.package.findFirst({ where: { id, agencyId } });
  if (!existing) throw new AppError('NOT_FOUND', 'Paket tidak ditemukan');

  let slug = existing.slug;
  if (data.name !== existing.name) {
    slug = slugify(data.name);
    const slugConflict = await prisma.package.findFirst({
      where: { slug, agencyId, id: { not: id } },
    });
    if (slugConflict) slug = `${slug}-${Date.now()}`;
  }

  const { totalHpp, marginAmount, publishedPrice } = computePricing(
    data.hpp as Record<string, number>,
    data.margin,
  );

  const pkg = await prisma.package.update({
    where: { id },
    data: {
      name: data.name,
      slug,
      category: data.category,
      description: data.description,
      duration: data.duration,
      airline: data.airline,
      itinerary: JSON.parse(JSON.stringify(data.itinerary)),
      hpp: JSON.parse(JSON.stringify(data.hpp)),
      totalHpp,
      margin: data.margin,
      marginAmount,
      publishedPrice,
      makkahHotel: data.makkahHotel,
      makkahHotelRating: data.makkahHotelRating,
      makkahHotelDistance: data.makkahHotelDistance,
      madinahHotel: data.madinahHotel,
      madinahHotelRating: data.madinahHotelRating,
      madinahHotelDistance: data.madinahHotelDistance,
      inclusions: data.inclusions,
      exclusions: data.exclusions,
      isActive: data.isActive,
    },
  });

  logActivity({
    type: 'package',
    action: 'updated',
    title: 'Paket diperbarui',
    description: `Paket "${pkg.name}" telah diperbarui`,
    userId,
    agencyId,
    metadata: { entityId: pkg.id },
  });

  return pkg;
}

export async function deletePackage(id: string, userId: string, agencyId: string) {
  const existing = await prisma.package.findFirst({ where: { id, agencyId } });
  if (!existing) throw new AppError('NOT_FOUND', 'Paket tidak ditemukan');

  await prisma.package.delete({ where: { id } });

  logActivity({
    type: 'package',
    action: 'deleted',
    title: 'Paket dihapus',
    description: `Paket "${existing.name}" telah dihapus`,
    userId,
    agencyId,
    metadata: { entityId: id },
  });

  return { message: 'Paket berhasil dihapus' };
}
