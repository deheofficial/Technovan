import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  return bcryptjs.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcryptjs.compare(password, hash);
};

export const generateToken = (userId: string, email: string, role: string): string => {
  const expiresIn = (process.env.JWT_EXPIRE || '7d') as jwt.SignOptions['expiresIn'];
  return jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET!,
    { expiresIn }
  );
};

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}
