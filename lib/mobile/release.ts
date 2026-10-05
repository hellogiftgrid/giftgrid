import "server-only";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

export const APP_DOWNLOAD_URL = "https://www.degiftgrid.com/app";
export const ANDROID_APK_PATH = "downloads/giftgrid-android.apk";

export async function getAndroidRelease() {
  try {
    const file = await stat(path.join(process.cwd(), "public", ANDROID_APK_PATH));
    if (!file.isFile() || file.size === 0) return null;
    let version: string | null = null;
    try {
      const metadata = JSON.parse(await readFile(path.join(process.cwd(), "public/downloads/giftgrid-android.json"), "utf8"));
      if (typeof metadata.version === "string" && metadata.version.trim()) version = metadata.version.trim();
    } catch { /* Version is optional; never guess it from the native project. */ }
    return { href: `/${ANDROID_APK_PATH}`, version, bytes: file.size };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
