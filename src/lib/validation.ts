// A plausible email address. Shared by the admin forms (client pre-submit) and
// the public registration route (server).
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
