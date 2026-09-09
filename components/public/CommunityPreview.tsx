import Script from "next/script";

export default function CommunityPreview() {
  return (
    <>
      <link rel="stylesheet" href="/platform-preview/style.css" />
      <main id="community-preview-root">
        <div id="root" />
      </main>
      <Script src="/platform-preview/react.js" strategy="beforeInteractive" />
      <Script src="/platform-preview/react-dom.js" strategy="beforeInteractive" />
      <Script src="/platform-preview/content.js" strategy="beforeInteractive" />
      <Script src="/platform-preview/journal.js" strategy="beforeInteractive" />
      <Script src="/platform-preview/app.js" strategy="beforeInteractive" />
    </>
  );
}
