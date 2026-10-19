export function FilmGrain() {
  return (
    <>
      <div className="grain-overlay" aria-hidden />
      {/* Subtle vignette over the whole page for cinematic feel */}
      <div
        className="pointer-events-none fixed inset-0 z-[0] bg-cinematic"
        aria-hidden
      />
    </>
  );
}
