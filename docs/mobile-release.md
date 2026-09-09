# GiftGrid mobile release

GiftGrid is packaged with Capacitor as `com.hellogiftgrid.app`. The Android project is in `android/` and loads the deployed GiftGrid site through the Capacitor server configuration.

## Native capabilities

The app includes Capacitor support for push notifications, camera photos, GPS location, and Bluetooth Low Energy on Android and iPhone. Camera, location, and Bluetooth permissions are requested only when the related action is used. Push permission and registration are initialized when the native app starts; the registration token is emitted as the `giftgrid:push-token` browser event for the authenticated device-registration flow.

Bluetooth support covers Bluetooth Low Energy devices. It does not cover Bluetooth Classic or act as a Bluetooth peripheral.

Push delivery still requires production credentials and server support: Firebase Cloud Messaging for Android, Apple Push Notification service for iPhone, and an authenticated API that stores device tokens and sends notifications.

## Build

Use Java 21 (Java 17 is also supported by the Android toolchain), sync Capacitor, and build the debug APK:

```bash
JAVA_HOME=/path/to/java-21 npx cap sync android
cd android
JAVA_HOME=/path/to/java-21 ./gradlew assembleDebug
```

The debug artifact is written to `android/app/build/outputs/apk/debug/app-debug.apk`. Debug builds are for testing. A public release must use a protected release keystore and a stable signing identity.

## Distribution links

- Palm Store / Transsion developer portal: https://dev.dlightek.com/services/app
- F-Droid submission guidance: https://f-droid.org/docs/Submitting_to_F-Droid_Quick_Start_Guide/
- F-Droid metadata repository: https://gitlab.com/fdroid/fdroiddata
- Google Play Console: https://play.google.com/console/signup
- Samsung Galaxy Store Seller Portal: https://seller.samsungapps.com/
- Huawei AppGallery: https://developer.huawei.com/consumer/en/appgallery
- Xiaomi GetApps developer console: https://global.developer.mi.com/
- Direct APK hosting: https://www.degiftgrid.com/download

## F-Droid readiness

The repository now has an MIT license and includes the Android source project. F-Droid maintainers still need to review the complete dependency graph, remote-service behavior, analytics, privacy policy, reproducible build, and app metadata. F-Droid requires a public source repository, a FOSS license, and buildable source; proprietary dependencies can prevent inclusion in the main repository. See the [F-Droid developer FAQ](https://f-droid.org/docs/FAQ_-_App_Developers/) and [inclusion policy](https://f-droid.org/docs/Inclusion_Policy/).

Before submitting, prepare screenshots, a privacy policy URL, a changelog, a version code, and a public Git repository. Do not submit the debug APK as a production release.
