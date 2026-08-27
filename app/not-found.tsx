import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] bg-[#F7F9FC] px-6 py-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <img
            src="/images/logo-full.png"
            alt="GiftGrid"
            className="h-14 w-14 object-contain"
          />
        </div>

        <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-[#4F46E5]">
          Error 404
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
          This page doesn&apos;t exist.
        </h1>

        <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
          The page you&apos;re looking for may have moved, been removed, or
          never existed. Let&apos;s get you back to GiftGrid.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-xl bg-[#4F46E5] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4338CA]"
          >
            Back to GiftGrid
          </Link>

          <Link
            href="/blog"
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Visit the Blog
          </Link>

          <Link
            href="/contact"
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </main>
  );
}
