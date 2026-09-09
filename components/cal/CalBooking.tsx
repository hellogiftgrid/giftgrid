type Props = {
  calLink?: string;
  title?: string;
};

export default function CalBooking({
  calLink = "degiftgrid/gift-grid-30-min-call",
  title = "Book a call with GiftGrid",
}: Props) {
  const params = new URLSearchParams({
    embed: "true",
    layout: "month_view",
    theme: "light",
  });

  return (
    <div className="relative w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_-36px_rgba(15,23,42,.28)]">
      <div className="absolute inset-x-0 top-0 z-10 h-1 bg-blue-600" />
      <iframe
        src={"https://cal.com/" + calLink.replace(/^\/+/, "") + "?" + params.toString()}
        title={title}
        className="h-[760px] w-full border-0 sm:h-[720px]"
        loading="eager"
        allow="camera; microphone; fullscreen; payment"
      />
    </div>
  );
}
