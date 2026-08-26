import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';

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

    const userProfile = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
    };

    return { user: userProfile, token };
  }

  static async updateCredentials({ currentPassword, newUsername, newPassword }, currentUser) {
    if (!currentPassword) {
      throw ApiError.badRequest('Current password is required to change credentials.');
    }

    const user = await User.findById(currentUser._id);
    if (!user) {
      throw ApiError.notFound('Admin user not found.');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.badRequest('Current password is incorrect.');
    }

    if (newUsername && newUsername.trim()) {
      const cleanUsername = newUsername.trim().toLowerCase();
      const existing = await User.findOne({ username: cleanUsername, _id: { $ne: user._id } });
      if (existing) {
        throw ApiError.conflict(`Username '${cleanUsername}' is already taken.`);
      }
      user.username = cleanUsername;
    }

    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 4) {
        throw ApiError.badRequest('New password must be at least 4 characters long.');
      }
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword.trim(), salt);
    }

    await user.save();

    const token = this.generateToken(user);
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
