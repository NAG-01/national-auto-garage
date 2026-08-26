import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { EmailOtpService } from './emailOtp.service.js';

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

  /**
   * Step 1 Password Verification Gate
   */
  static async verifyCurrentPassword(currentPassword, userId) {
    if (!currentPassword) {
      throw ApiError.badRequest('Current password is required.');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.badRequest('Current password is incorrect. Please try again.');
    }

    return { verified: true, message: 'Current password verified successfully!' };
  }

  /**
   * Step 2 Update Password after Verification
   */
  static async updatePasswordWithVerification(newPassword, userId) {
    if (!newPassword || newPassword.trim().length < 4) {
      throw ApiError.badRequest('New password must be at least 4 characters long.');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword.trim(), salt);
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

  /**
   * Step 1 Request Email OTP for Username/Email Change
   */
  static async requestEmailChangeOTP(newEmail, userId) {
    if (!newEmail || !newEmail.trim()) {
      throw ApiError.badRequest('Valid new email address is required.');
    }

    const cleanEmail = newEmail.trim().toLowerCase();

    // Check duplicate
    const existing = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanEmail }],
      _id: { $ne: userId },
    });

    if (existing) {
      throw ApiError.conflict(`Email '${cleanEmail}' is already registered.`);
    }

    const otp = EmailOtpService.generateOTP(userId, cleanEmail);
    return { success: true, email: cleanEmail, otp, message: `6-digit confirmation OTP sent to ${cleanEmail}` };
  }

  /**
   * Step 2 Verify Email OTP and Update Username & Email
   */
  static async verifyEmailOTPAndChangeUsername(otpCode, newEmail, userId) {
    if (!otpCode || !newEmail) {
      throw ApiError.badRequest('OTP code and email address are required.');
    }

    const cleanEmail = newEmail.trim().toLowerCase();
    const result = EmailOtpService.verifyOTP(userId, cleanEmail, otpCode);

    if (!result.valid) {
      throw ApiError.badRequest(result.message);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    user.username = cleanEmail;
    user.email = cleanEmail;
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
