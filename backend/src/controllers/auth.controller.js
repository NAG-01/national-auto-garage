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
}
