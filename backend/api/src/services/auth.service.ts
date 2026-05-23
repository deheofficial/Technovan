import { Prisma, User, UserRole } from '@prisma/client';
import { hashPassword, comparePassword, generateToken, AppError } from '../utils/auth';
import { prisma } from '../lib/prisma';

type PublicUser = Omit<User, 'password'>;

interface RegisterUserInput {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
  phone?: string;
}

const toPublicUser = (user: User): PublicUser => {
  const { password: _password, ...safeUser } = user;
  return safeUser;
};

export class AuthService {
  async register(input: RegisterUserInput) {
    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    const hashedPassword = await hashPassword(input.password);
    const newUser = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        fullName: input.fullName,
        phone: input.phone,
        role: input.role ?? 'SALES',
        isActive: true,
      },
    });

    const token = generateToken(newUser.id, newUser.email, newUser.role);
    return { user: toPublicUser(newUser), token };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new AppError(403, 'Account is inactive');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    const token = generateToken(user.id, user.email, user.role);
    return { user: toPublicUser(user), token };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return toPublicUser(user);
  }

  async updateProfile(userId: string, data: Partial<User>) {
    const updateData: Prisma.UserUpdateInput = {};

    if (typeof data.fullName === 'string') updateData.fullName = data.fullName;
    if (typeof data.phone === 'string' || data.phone === null) updateData.phone = data.phone;
    if (typeof data.isActive === 'boolean') updateData.isActive = data.isActive;

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
      return toPublicUser(user);
    } catch (error) {
      throw new AppError(404, 'User not found');
    }
  }
}

export const authService = new AuthService();

