import Link from "next/link";

const hotspots = [
  // Header / navigation
  {
    name: "Sign In",
    href: "/auth/sign-in",
    className: "left-[68%] top-[1.8%] w-[13%] h-[2.8%]",
  },
  {
    name: "Get Started",
    href: "/auth/sign-up",
    className: "left-[82%] top-[1.8%] w-[16%] h-[3.2%]",
  },

  // Hero CTA
  {
    name: "Book a Call",
    href: "/book",
    className: "left-[31%] top-[13%] w-[39%] h-[5%]",
  },

  // Main page CTAs
  {
    name: "How It Works",
    href: "/how-it-works",
    className: "left-[30%] top-[26%] w-[40%] h-[4%]",
  },
  {
    name: "Opportunities",
    href: "/dashboard/opportunities",
    className: "left-[29%] top-[53%] w-[42%] h-[4%]",
  },
  {
    name: "Book a Call",
    href: "/book",
    className: "left-[29%] top-[88%] w-[42%] h-[4%]",
  },

  // Footer links
  {
    name: "Blog",
    href: "/blog",
    className: "left-[7%] top-[96.1%] w-[18%] h-[2%]",
  },
  {
    name: "Contact",
    href: "/contact",
    className: "left-[28%] top-[96.1%] w-[20%] h-[2%]",
  },
  {
    name: "FAQ",
    href: "/faq",
    className: "left-[52%] top-[96.1%] w-[16%] h-[2%]",
  },
  {
    name: "Privacy",
    href: "/privacy",
    className: "left-[70%] top-[96.1%] w-[20%] h-[2%]",
  },
];

export default function HomePage() {
  return (
    <main className="bg-white">
      <div className="relative mx-auto w-full max-w-[1440px]">
        <img
          src="/landing/giftgrid-landing.png"
          alt="GiftGrid"
          className="block h-auto w-full select-none"
          draggable={false}
        />

        {hotspots.map((item) => (
          <Link
            key={`${item.href}-${item.name}-${item.className}`}
            href={item.href}
            aria-label={item.name}
            className={`absolute z-10 block rounded-lg outline-none transition-colors focus-visible:bg-indigo-500/10 focus-visible:ring-2 focus-visible:ring-indigo-500 ${item.className}`}
          >
            <span className="sr-only">{item.name}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
