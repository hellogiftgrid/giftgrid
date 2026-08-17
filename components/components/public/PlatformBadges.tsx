import { supportedPlatforms } from "@/config/branding";

// States a real capability (which store platforms GiftGrid can audit),
// not a claim of partnership. Text-based by design — we don't reproduce
// other companies' trademarked logo marks.
export default function PlatformBadges() {
  return (
    <div className="border-b border-borderCustom bg-secondary py-8">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-x-10 gap-y-4 px-7">
        <span className="text-[13px] font-medium text-textSecondary">Reviews stores built on</span>
        {supportedPlatforms.map((platform) => (
          <span key={platform} className="text-[15px] font-semibold text-textPrimary">
            {platform}
          </span>
        ))}
      </div>
    </div>
  );
}
