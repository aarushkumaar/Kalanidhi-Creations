export const ADMIN_EMAILS: string[] = [
  "aarushk0207@gmail.com",
];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
