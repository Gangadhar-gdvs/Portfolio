import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="relative flex min-h-svh items-center bg-abyss outline-none">
      <div aria-hidden="true" className="grid-underlay absolute inset-0 opacity-70" />
      <div className="relative mx-auto w-full max-w-[1600px] px-5 sm:px-8 md:px-10">
        <p className="eyebrow text-phosphor">404</p>
        <h1 className="display mt-5 max-w-[14ch] text-[clamp(2.6rem,8vw,7rem)] text-bone uppercase">
          Nothing underneath this one.
        </h1>
        <p className="measure mt-6 text-lg leading-relaxed text-bone-soft">
          This page doesn&rsquo;t exist. The work does.
        </p>
        <Link href="/" className="btn btn-glow mt-10">
          Back to the surface
        </Link>
      </div>
    </main>
  );
}
