# GiftGrid Android app

GiftGrid’s Android app is a bare React Native application in `mobile-native/`. It builds as a native Android package with Gradle and React Native; it does not use Expo, Capacitor, or a website wrapper. The app connects to `https://community.degiftgrid.com` and uses the public Supabase configuration supplied by `/api/mobile/config` at runtime.

## Build a signed Android APK

Install Android Studio’s Android SDK (API 36, Build Tools 36.0.0, and NDK 27.1.12297006), Java 21, and Node.js 22.11 or later. Install JavaScript dependencies from `mobile-native/` with `npm ci`.

The production signing key and `release.properties` must be supplied securely at `.giftgrid-signing/`. The Gradle release build reads the key and passwords from that private directory; do not commit or upload it. From `mobile-native/android/`, run `gradlew assembleRelease` on Windows or `./gradlew assembleRelease` on macOS/Linux. The signed APK is written to `mobile-native/android/app/build/outputs/apk/release/app-release.apk`.

Before distributing, verify the APK with `node scripts/verify-apk.mjs <apk-path>`. It checks the APK v2 signature, file contents, and application ID (`com.hellogiftgrid.app`). Install and launch it on a physical Android device before a public release. Keep the signing key for future upgrades and increment `versionCode` for each release.

## Website download

Copy the verified APK to `public/downloads/giftgrid-android.apk` and set `public/downloads/giftgrid-android.json` to `{"version":"1.0.1"}` (use the actual version in the APK). Deploy the website to make the download available at `/app`. The download page remains disabled if the APK is absent. The app is distributed as a direct Android APK; a Google Play listing requires a separate Play Console release.

## iOS

The same React Native interface is present, but a signed iOS app requires macOS with Xcode and an Apple Developer account. No iOS release is claimed until it is built, signed, and tested there.
