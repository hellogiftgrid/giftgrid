import Link from "next/link";
import QRCode from "qrcode";
import { APP_DOWNLOAD_URL, getAndroidRelease } from "@/lib/mobile/release";
import PwaInstallButton from "@/components/app/PwaInstallButton";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Get the GiftGrid App",
  description: "Get GiftGrid directly for Android. Discover products, join the community, and manage your gifting workspace.",
  alternates: { canonical: APP_DOWNLOAD_URL },
};

export default async function AppDownloadPage() {
  const release = await getAndroidRelease();
  const qr = await QRCode.toDataURL(APP_DOWNLOAD_URL, { width: 224, margin: 2, errorCorrectionLevel: "M" });
  return <main className="bg-slate-50 px-5 pb-16 pt-28 sm:pt-36">
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 md:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <img src="/images/logo-horizontal.png" alt="GiftGrid" className="h-10 w-auto" />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Get the GiftGrid App</h1>
          <p className="mt-4 max-w-xl leading-7 text-slate-600">Keep your gifting conversations, product discovery, and merchant workspace close. Get GiftGrid directly from our website.</p>
          {release ? <>
            <p className="mt-5 text-sm text-slate-600">Android APK{release.version ? ` · Version ${release.version}` : ""} · {(release.bytes / (1024 * 1024)).toFixed(1)} MB</p>
            <a href="/app/download" download="giftgrid-android.apk" className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">Download Android APK</a>
          </> : <div role="status" className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">The native APK is not published yet. You can install GiftGrid on your phone directly from this website.</div>}
          {!release && <PwaInstallButton />}
          <Link href="https://community.degiftgrid.com/" className="mt-5 inline-block py-3 text-sm font-semibold text-blue-700">Open GiftGrid Community</Link>
        </div>
        <figure className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-4">
          <a href={APP_DOWNLOAD_URL} aria-label="Open GiftGrid app download page"><img src={qr} alt="QR code linking to the GiftGrid app download page" width={224} height={224} /></a>
          <figcaption className="mt-3 max-w-56 text-center text-sm text-slate-600">Scan to open this download page on your phone.</figcaption>
        </figure>
      </div>
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-950">Your GiftGrid workspace on mobile</h2>
        <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-600 sm:grid-cols-2">
          <li>Read and share community posts.</li><li>Discover products and merchant listings.</li>
          <li>Send gift-sourcing inquiries and exchange messages.</li><li>Track inquiries and access merchant tools.</li>
        </ul>
      </section>
      <section className="mt-8 grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 md:grid-cols-2">
        <div><h2 className="text-xl font-bold text-slate-950">Install on Android</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-600">
            {release ? <>
              <li>Tap “Download Android APK” and open the downloaded file on your phone.</li>
              <li>If Android asks, allow Chrome or your file manager to install apps from this source, then tap Install.</li>
            </> : <>
              <li>Open this page in Chrome on Android and tap “Install GiftGrid on this phone”.</li>
              <li>If Android does not show an install prompt, open Chrome’s ⋮ menu and choose “Install app” or “Add to Home screen”.</li>
            </>}
            <li>Open GiftGrid from your home screen and sign in with your existing account.</li>
          </ol>
        </div>
        <div><h2 className="text-xl font-bold text-slate-950">Download with confidence</h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">{release ? "The current Android APK downloads directly from GiftGrid. Android may ask you to allow installs from your browser or file manager." : "GiftGrid installs from this secure website as a phone app. A native Android APK will appear here when a release is ready."} Contact <a href="mailto:support@degiftgrid.com" className="text-blue-700 underline">GiftGrid support</a> if you need help installing it.</p>
          <h3 className="mt-6 font-bold text-slate-950">Using an iPhone?</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">An iOS download is not currently available. Use GiftGrid in Safari.</p>
        </div>
      </section>
    </div>
  </main>;
}
