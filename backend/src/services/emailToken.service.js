import crypto from 'crypto';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { sendEmailConfirmationLink } from '../utils/mailer.js';

// In-memory Store for Magic Email Tokens (keyed by 64-char token string)
const magicTokenStore = new Map();

export class EmailTokenService {
  /**
   * Generates a 64-char crypto token, builds Magic Link, sends Gmail email
   */
  static async sendMagicLink(userId, newEmail) {
    if (!newEmail || !newEmail.trim()) {
      throw ApiError.badRequest('Valid email address is required.');
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

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    magicTokenStore.set(token, {
      token,
      userId: String(userId),
      newEmail: cleanEmail,
      expiresAt,
    });

    const frontendOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
    const magicLink = `${frontendOrigin}/verify-email?token=${token}`;

    console.log(`====================================================`);
    console.log(`  [MAGIC LINK GENERATED]`);
    console.log(`  Target Email: ${cleanEmail}`);
    console.log(`  Magic Verification Link: ${magicLink}`);
    console.log(`====================================================`);

    // Send Real Email via Mailer Utility
    await sendEmailConfirmationLink({ toEmail: cleanEmail, magicLink, token });

    return {
      success: true,
      email: cleanEmail,
      magicLink,
      token,
      message: `Gmail confirmation link sent to ${cleanEmail}`,
    };
  }

  /**
   * Validates Magic Link token, updates User.username & User.email in Database
   */
  static async verifyMagicToken(token) {
    if (!token || !token.trim()) {
      throw ApiError.badRequest('Magic verification token is required.');
    }

    const stored = magicTokenStore.get(token.trim());
    if (!stored) {
      throw ApiError.badRequest('Invalid or expired email verification link.');
    }

    if (Date.now() > stored.expiresAt) {
      magicTokenStore.delete(token.trim());
      throw ApiError.badRequest('Email verification link has expired. Please request a new link.');
    }

    const user = await User.findById(stored.userId);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    user.username = stored.newEmail;
    user.email = stored.newEmail;
    await user.save();

    // Invalidate token after single use
    magicTokenStore.delete(token.trim());

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      message: `Email & Username successfully verified and changed to '${stored.newEmail}'!`,
    };
  }
}
