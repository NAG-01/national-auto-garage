import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { AuditLog } from '../models/AuditLog.js';

export class AuthService {
  static generateToken(user) {
    const secret = process.env.JWT_SECRET || 'national_auto_garage_super_secret_jwt_key_2026_production_grade';
    return jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  static async login(identifier, password, ipAddress = '') {
    if (!identifier || !password) {
      throw ApiError.badRequest('Username/email and password are required.');
    }

    const cleanIdentifier = String(identifier).trim().toLowerCase();

    const user = await User.findOne({
      $or: [{ username: cleanIdentifier }, { email: cleanIdentifier }],
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid username or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid username or password');
    }

    user.lastLogin = new Date();
    await user.save();

    const token = this.generateToken(user);

    // Audit log
    await AuditLog.create({
      action: 'LOGIN',
      entity: 'User',
      entityId: user._id.toString(),
      user: user.username,
      summary: `Admin user '${user.username}' logged in successfully`,
      metadata: { ipAddress },
    });

    const userProfile = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
    };

    return { user: userProfile, token };
  }

  static async getCurrentUser(userId) {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      throw ApiError.notFound('Admin account not found.');
    }
    return user;
  }
}
