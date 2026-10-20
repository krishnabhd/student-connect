import crypto from 'crypto';

const OTP_PEPPER = process.env.JWT_SECRET || 'student_connect_secret_jwt_key_2026';

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_RESEND_MS = 45 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

export function generateOtp(): string {
  return String(crypto.randomInt(100000, 1000000));
}

export function hashOtp(email: string, otp: string): string {
  return crypto
    .createHmac('sha256', OTP_PEPPER)
    .update(`${email.toLowerCase()}:${otp}`)
    .digest('hex');
}

export function otpMatches(email: string, otp: string, storedHash: string): boolean {
  const expected = hashOtp(email, otp);
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(storedHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
