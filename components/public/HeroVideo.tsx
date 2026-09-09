export default function HeroVideo() {
  return (
    <video
      className="absolute inset-0 block h-full w-full min-w-full object-cover object-center"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/images/hero-poster.jpg"
      aria-label="GiftGrid unboxing experience"
    >
      <source src="/videos/hero.mp4" type="video/mp4" />
    </video>
  );
}
