import crypto from 'crypto';

export const DEFAULT_DEMO_PASSWORD = 'Password@123';

/** Hash a password with scrypt (salt:hash hex format). */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/** Verify a password against a stored salt:hash value. */
export function verifyPassword(
  password: string,
  passwordHash?: string | null
): boolean {
  if (!passwordHash) {
    // Legacy / demo accounts created before password hashing
    return password === DEFAULT_DEMO_PASSWORD;
  }

  const [salt, storedHash] = passwordHash.split(':');
  if (!salt || !storedHash) {
    return password === DEFAULT_DEMO_PASSWORD;
  }

  try {
    const computed = crypto.scryptSync(password, salt, 64).toString('hex');
    const a = Buffer.from(storedHash, 'hex');
    const b = Buffer.from(computed, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
