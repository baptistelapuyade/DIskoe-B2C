// Input checks for the login form. They only decide whether a value is worth
// sending to the auth provider; the provider remains the authority.

const MAX_EMAIL_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_PATTERN = /^\d{6,10}$/;

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const email = value.trim().toLowerCase();

  if (email.length === 0 || email.length > MAX_EMAIL_LENGTH) {
    return null;
  }

  return EMAIL_PATTERN.test(email) ? email : null;
}

export function normalizeOtp(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const token = value.replace(/\s+/g, "");

  return OTP_PATTERN.test(token) ? token : null;
}
