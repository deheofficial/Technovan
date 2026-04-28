import { Prisma, User } from '@prisma/client';
import { hashPassword, comparePassword, generateToken, AppError } from '../utils/auth';
import { prisma } from '../lib/prisma';

type PublicUser = Omit<User, 'password'>;

const toPublicUser = (user: User): PublicUser => {
  const { password: _password, ...safeUser } = user;
  return safeUser;
};

export class AuthService {
  async register(email: string, password: string, firstName: string, lastName: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'CUSTOMER',
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

    if (typeof data.firstName === 'string') updateData.firstName = data.firstName;
    if (typeof data.lastName === 'string') updateData.lastName = data.lastName;
    if (typeof data.phone === 'string' || data.phone === null) updateData.phone = data.phone;
    if (typeof data.company === 'string' || data.company === null) updateData.company = data.company;
    if (typeof data.avatar === 'string' || data.avatar === null) updateData.avatar = data.avatar;

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

