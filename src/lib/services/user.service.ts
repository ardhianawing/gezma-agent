import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { createUserSchema, updateUserSchema } from '@/lib/validations/user';
import bcrypt from 'bcryptjs';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  position: true,
  phone: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

export async function listUsers(agencyId: string) {
  const data = await prisma.user.findMany({
    where: { agencyId },
    select: USER_SELECT,
    orderBy: { createdAt: 'asc' },
  });

  return { data };
}

export async function getUserById(id: string, agencyId: string) {
  const user = await prisma.user.findFirst({
    where: { id, agencyId },
    select: USER_SELECT,
  });
  if (!user) throw new AppError('NOT_FOUND', 'User tidak ditemukan');
  return user;
}

interface CreateUserParams {
  body: unknown;
  agencyId: string;
}

export async function createUser({ body, agencyId }: CreateUserParams) {
  const data = createUserSchema.parse(body);

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingUser) throw new AppError('CONFLICT', 'Email sudah terdaftar');

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || 'staff',
      position: data.position || null,
      phone: data.phone || null,
      agencyId,
      isVerified: true,
    },
    select: USER_SELECT,
  });

  return user;
}

interface UpdateUserParams {
  id: string;
  body: unknown;
  agencyId: string;
}

export async function updateUser({ id, body, agencyId }: UpdateUserParams) {
  const data = updateUserSchema.parse(body);

  const existing = await prisma.user.findFirst({ where: { id, agencyId } });
  if (!existing) throw new AppError('NOT_FOUND', 'User tidak ditemukan');

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.position !== undefined) updateData.position = data.position;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: USER_SELECT,
  });

  return user;
}

export async function deleteUser(id: string, currentUserId: string, agencyId: string) {
  if (id === currentUserId) {
    throw new AppError('BAD_REQUEST', 'Tidak dapat menghapus akun sendiri');
  }

  const existing = await prisma.user.findFirst({ where: { id, agencyId } });
  if (!existing) throw new AppError('NOT_FOUND', 'User tidak ditemukan');

  await prisma.user.delete({ where: { id } });

  return { message: 'User berhasil dihapus' };
}
