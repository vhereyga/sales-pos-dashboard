import { prisma } from '../db';
import { verifyPassword } from '../utils/auth';
import { UnauthorizedError, ValidationError } from '../utils/errors';

export class AuthService {
  static async login(identifier: string, password: string) {
    if (!identifier || !password) {
      throw new ValidationError('Email/username dan password wajib diisi');
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.trim().toLowerCase() },
          { name: identifier.trim() }
        ]
      }
    });

    if (!user) {
      throw new UnauthorizedError('Email/username atau password salah');
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Email/username atau password salah');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }
}
