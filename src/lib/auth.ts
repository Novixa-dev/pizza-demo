import { cookies } from "next/headers";
import crypto from "crypto";

export type StaffRole = "ADMIN" | "KITCHEN" | "CASHIER";

const SESSION_COOKIE_NAME = "ph_staff_session";
const SESSION_MAX_AGE_MS = 14 * 60 * 60 * 1000; // 14 hours (full restaurant double shift)

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret && Buffer.byteLength(secret) >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must contain at least 32 bytes in production");
  }
  return "pizza-demo-development-only-secret-key";
}

export function getRolePins(): Record<StaffRole, string[]> {
  const adminPin = process.env.ADMIN_PIN?.trim();
  const kitchenPin = process.env.KITCHEN_PIN?.trim();
  const cashierPin = process.env.CASHIER_PIN?.trim();
  const allowDevelopmentDefaults = process.env.NODE_ENV !== "production";

  return {
    ADMIN: Array.from(new Set([adminPin, allowDevelopmentDefaults ? "1024" : undefined].filter((p): p is string => Boolean(p)))),
    KITCHEN: Array.from(new Set([kitchenPin, allowDevelopmentDefaults ? "2048" : undefined].filter((p): p is string => Boolean(p)))),
    CASHIER: Array.from(new Set([cashierPin, allowDevelopmentDefaults ? "4096" : undefined].filter((p): p is string => Boolean(p)))),
  };
}

// Brute-force rate limiting: In-memory sliding window
interface RateLimitEntry {
  attempts: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, RateLimitEntry>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

/**
 * Timing-safe string comparison to prevent timing side-channel attacks.
 */
function constantTimeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Checks if an identifier (e.g. IP or role) is currently locked out from PIN attempts.
 */
export function checkPinRateLimit(identifier: string): {
  isLocked: boolean;
  remainingLockoutMinutes?: number;
} {
  const now = Date.now();
  const entry = loginAttempts.get(identifier);

  if (!entry) return { isLocked: false };

  if (entry.lockedUntil && now < entry.lockedUntil) {
    const remainingMinutes = Math.ceil((entry.lockedUntil - now) / (60 * 1000));
    return { isLocked: true, remainingLockoutMinutes: remainingMinutes };
  }

  // If lockout has elapsed, reset attempts
  if (entry.lockedUntil && now >= entry.lockedUntil) {
    loginAttempts.delete(identifier);
    return { isLocked: false };
  }

  return { isLocked: false };
}

/**
 * Records a failed PIN attempt. Triggers a 15-minute lockout on the 5th failed attempt.
 */
export function recordFailedPinAttempt(identifier: string): {
  isNowLocked: boolean;
  remainingAttempts: number;
} {
  const now = Date.now();
  const entry = loginAttempts.get(identifier) || { attempts: 0 };
  entry.attempts += 1;

  if (entry.attempts >= MAX_FAILED_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_DURATION_MS;
    loginAttempts.set(identifier, entry);
    return { isNowLocked: true, remainingAttempts: 0 };
  }

  loginAttempts.set(identifier, entry);
  return {
    isNowLocked: false,
    remainingAttempts: MAX_FAILED_ATTEMPTS - entry.attempts,
  };
}

/**
 * Resets failed attempts after successful authentication.
 */
export function resetPinAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
}

/**
 * Generates an HMAC signature for a payload.
 */
function signPayload(payload: string): string {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("hex");
}

/**
 * Creates a signed session token.
 */
export function createStaffToken(role: StaffRole): string {
  const timestamp = Date.now();
  const payload = `${role}:${timestamp}`;
  const signature = signPayload(payload);
  return `${payload}:${signature}`;
}

/**
 * Verifies a signed session token.
 */
export function verifyStaffToken(
  token: string | undefined | null
): { isValid: boolean; role?: StaffRole } {
  if (!token) return { isValid: false };

  const parts = token.split(":");
  if (parts.length !== 3) return { isValid: false };

  const [roleStr, timestampStr, signature] = parts;
  const role = roleStr as StaffRole;

  if (!["ADMIN", "KITCHEN", "CASHIER"].includes(role)) {
    return { isValid: false };
  }

  const payload = `${roleStr}:${timestampStr}`;
  const expectedSignature = signPayload(payload);

  if (!constantTimeCompare(signature, expectedSignature)) {
    return { isValid: false };
  }

  const timestamp = Number(timestampStr);
  if (isNaN(timestamp) || Date.now() - timestamp > SESSION_MAX_AGE_MS) {
    return { isValid: false }; // Expired session
  }

  return { isValid: true, role };
}

/**
 * Verifies if entered PIN matches role using constant-time comparison.
 * Also allows ADMIN PIN to unlock any role.
 */
export function verifyPinForRole(
  pin: string,
  targetRole: StaffRole
): { success: boolean; role?: StaffRole } {
  const trimmed = pin.trim();
  const rolePins = getRolePins();

  // Admin PIN unlocks everything
  for (const adminPin of rolePins.ADMIN) {
    if (constantTimeCompare(trimmed, adminPin)) {
      return { success: true, role: "ADMIN" };
    }
  }

  // Check role specific PINs
  for (const rolePin of rolePins[targetRole]) {
    if (constantTimeCompare(trimmed, rolePin)) {
      return { success: true, role: targetRole };
    }
  }

  return { success: false };
}

/**
 * Reads staff session from cookies in Server Components or Server Actions.
 */
export async function getStaffSession(): Promise<{ isAuthenticated: boolean; role?: StaffRole }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const result = verifyStaffToken(token);
    return {
      isAuthenticated: result.isValid,
      role: result.role,
    };
  } catch {
    return { isAuthenticated: false };
  }
}

/**
 * Sets staff session cookie.
 */
export async function setStaffSessionCookie(role: StaffRole): Promise<void> {
  const token = createStaffToken(role);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_MAX_AGE_MS / 1000),
  });
}

/**
 * Clears staff session cookie.
 */
export async function clearStaffSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Authoritative guard helper for Server Actions.
 * Returns true if the user has one of the required roles.
 */
export async function isAuthorizedStaff(
  allowedRoles: StaffRole[] = ["ADMIN", "KITCHEN", "CASHIER"]
): Promise<boolean> {
  const session = await getStaffSession();
  if (!session.isAuthenticated || !session.role) {
    return false;
  }
  // ADMIN has full authority over all staff actions
  if (session.role === "ADMIN") {
    return true;
  }
  return allowedRoles.includes(session.role);
}
