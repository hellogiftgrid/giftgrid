import { opportunityCategories } from "@/config/branding";

// Renders the real opportunity categories from the platform spec —
// not placeholder client logos. Duplicated once for a seamless loop.
export default function Marquee() {
  const track = [...opportunityCategories, ...opportunityCategories];

  return (
    <div className="border-b border-borderCustom bg-secondarySoft py-9">
      <div className="mx-auto mb-5 max-w-[1180px] px-7 text-center">
        <h2 className="text-[14.5px] font-semibold text-textSecondary">Our Opportunity Network</h2>
      </div>
      <div className="marquee-mask overflow-hidden">
        <div className="flex w-max animate-scrollMarquee gap-3.5">
          {track.map((category, i) => (
            <span
              key={`${category}-${i}`}
              className="flex items-center gap-2.5 whitespace-nowrap rounded-full border border-borderCustom bg-secondary px-5 py-2.5 text-[14px]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {category}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
