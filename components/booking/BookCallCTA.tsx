import Link from "next/link";

export default function BookCallCTA() {
  return (
    <Link
      href="/book"
      className="inline-flex items-center justify-center rounded-xl bg-[#4F46E5] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#4338CA]"
    >
      Book a Call →
    </Link>
  );
}
