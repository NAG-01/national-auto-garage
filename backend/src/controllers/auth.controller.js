import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AuthController {
  static async login(req, res, next) {
    try {
      const { username, email, password } = req.body;
      const identifier = username || email;
      const ipAddress = req.ip || req.connection?.remoteAddress || '';

      const { user, token } = await AuthService.login(identifier, password, ipAddress);

      return ApiResponse.success(res, 'Admin authenticated successfully', { user, token });
    } catch (err) {
      next(err);
    }
  }

  static async me(req, res, next) {
    try {
      const user = await AuthService.getCurrentUser(req.user._id);
      return ApiResponse.success(res, 'Admin profile retrieved', { user });
    } catch (err) {
      next(err);
    }
  }

  static async verifyPassword(req, res, next) {
    try {
      const { currentPassword } = req.body;
      const result = await AuthService.verifyCurrentPassword(currentPassword, req.user._id);
      return ApiResponse.success(res, 'Password verified successfully', result);
    } catch (err) {
      next(err);
    }
  }

  static async updatePassword(req, res, next) {
    try {
      const { newPassword } = req.body;
      const { user, token } = await AuthService.updatePasswordWithVerification(newPassword, req.user._id);
      return ApiResponse.success(res, 'Admin password updated successfully', { user, token });
    } catch (err) {
      next(err);
    }
  }

  static async requestEmailOTP(req, res, next) {
    try {
      const { newEmail } = req.body;
      const result = await AuthService.requestEmailChangeOTP(newEmail, req.user._id);
      return ApiResponse.success(res, 'Email OTP sent successfully', result);
    } catch (err) {
      next(err);
    }
  }

  static async verifyEmailOTP(req, res, next) {
    try {
      const { otpCode, newEmail } = req.body;
      const { user, token } = await AuthService.verifyEmailOTPAndChangeUsername(otpCode, newEmail, req.user._id);
      return ApiResponse.success(res, 'Username & Email updated successfully', { user, token });
    } catch (err) {
      next(err);
    }
  }
}
