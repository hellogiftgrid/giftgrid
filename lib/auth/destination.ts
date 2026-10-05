export function signInDestination(role: string | null | undefined, requested: string) {
  const fallback = role === "admin" || role === "super_admin" ? "/admin" : role === "developer" ? "/console" : "/dashboard";
  if (!requested.startsWith("/") || requested.startsWith("//") || /[\\\u0000-\u0020]/.test(requested)) return fallback;
  try {
    const decoded = decodeURIComponent(requested);
    if (decoded.startsWith("//") || /[\\\u0000-\u0020]/.test(decoded)) return fallback;
    const url = new URL(requested, "https://giftgrid.invalid");
    if (url.origin !== "https://giftgrid.invalid" || url.pathname.startsWith("/auth/")) return fallback;
    return url.pathname + url.search + url.hash;
  } catch { return fallback; }
}
