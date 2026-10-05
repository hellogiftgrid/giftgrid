export const GIFTGRID_ADMIN_AVATAR = "/images/logo-full.png";
export function isGiftGridAdmin(role: string | null | undefined) {
  return role === "admin" || role === "super_admin";
}
