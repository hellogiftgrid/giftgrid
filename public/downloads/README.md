# GiftGrid Android release

Place the real, signed release APK at `public/downloads/giftgrid-android.apk`.
The app page at https://www.degiftgrid.com/app enables the download only when this file exists and is nonempty. No APK is fabricated.

Optional: add `public/downloads/giftgrid-android.json` containing `{"version":"ACTUAL_RELEASE_VERSION"}` using the version of the supplied APK. File size is read from the actual binary. Only the current APK is featured.

Confirm the application ID is `com.hellogiftgrid.app`, verify release signing, and install-test the artifact before deployment. Do not publish a debug or unsigned build. Replace the current filename when releasing an update; preserve the signing key so Android can update installed copies.

The button uses `/app/download`, which redirects to the real APK and increments a single anonymous aggregate through a service-only database function. It counts download starts, not completed transfers or installations. Missing releases are not counted; counter failures never block downloads.
