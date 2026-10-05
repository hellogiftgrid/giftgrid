# GiftGrid Native

GiftGrid Native is a bare React Native Community CLI app for Android and iOS. It uses native React Native views; it is not an Expo app, Capacitor shell, or website wrapper.

The app connects to `https://community.degiftgrid.com`. It gets the public Supabase URL and publishable key from `/api/mobile/config`; no service-role key or AI provider key is bundled into the app. Signed-in requests send the user's Supabase access token to GiftGrid APIs.

## Included screens

- Community feed with post publishing, signed-in likes, and comments
- Shop catalog with product detail pages
- Searchable member directory
- Signed-in dashboard and account profile
- Email/password sign-in and persistent mobile sessions

## Development

Use Node.js 22.11 or later. Install dependencies with `npm install`, start Metro with `npm start`, and launch Android with `npm run android`. Android builds need Android Studio, an installed Android SDK, and a connected device or emulator. The app ID is `com.hellogiftgrid.app`.

iOS builds require macOS with Xcode and CocoaPods. From this folder, run `bundle install`, `bundle exec pod install` from `ios`, then `npm run ios`. The iOS bundle ID is also `com.hellogiftgrid.app`.

To create a release APK from a configured Android machine, run `cd android` then `gradlew.bat assembleRelease`. Configure a production signing keystore before distributing a release build; the generated debug key is only for local development.
