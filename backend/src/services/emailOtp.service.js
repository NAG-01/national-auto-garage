import crypto from 'crypto';

// In-memory OTP storage for email confirmation (keyed by user ID)
const otpStore = new Map();

export class EmailOtpService {
  /**
   * Generates a 6-digit OTP code with 10-minute expiration
   */
  static generateOTP(userId, email) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(String(userId), {
      otp,
      email: email.trim().toLowerCase(),
      expiresAt,
    });

    console.log(`====================================================`);
    console.log(`  [SECURITY OTP SERVICE] EMAIL CONFIRMATION CODE`);
    console.log(`  Target Email: ${email}`);
    console.log(`  6-Digit OTP Code: ${otp}`);
    console.log(`  Expires In: 10 Minutes`);
    console.log(`====================================================`);

    return otp;
  }

  /**
   * Verifies the 6-digit OTP code for a user
   */
  static verifyOTP(userId, email, inputOtp) {
    const stored = otpStore.get(String(userId));
    if (!stored) {
      return { valid: false, message: 'No active OTP request found. Please request a new code.' };
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(String(userId));
      return { valid: false, message: 'OTP verification code has expired. Please request a new code.' };
    }

    if (stored.email !== email.trim().toLowerCase()) {
      return { valid: false, message: 'Email address does not match the OTP request.' };
    }

    if (stored.otp !== String(inputOtp).trim()) {
      return { valid: false, message: 'Invalid 6-digit OTP code. Please check and try again.' };
    }

    // Clear OTP after successful verification
    otpStore.delete(String(userId));
    return { valid: true };
  }
}
