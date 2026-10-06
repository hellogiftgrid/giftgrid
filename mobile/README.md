# GiftGrid mobile app (standard)

This is the standard GiftGrid mobile app — an Expo (React Native) project.
The raw React Native copy in `../mobile-native` is legacy.

## Setup

```bash
cd mobile
npm install
```

Create `.env` in this folder:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxkodcatazrbjhwddqxg.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>
EXPO_PUBLIC_API_ORIGIN=https://community.degiftgrid.com
```

## Run

```bash
npm start          # Expo Go / dev server
npm run android    # Android emulator or device
npm run ios        # iOS simulator (macOS)
npm run web        # browser preview
```

## Build

```bash
npx eas-cli build --profile preview --platform android   # APK for testing
npx eas-cli build --profile production --platform android
npx eas-cli build --profile production --platform ios
```

The app talks to the same Supabase project and API origin as the website
(`https://community.degiftgrid.com`).
