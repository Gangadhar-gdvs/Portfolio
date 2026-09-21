import "@/app/globals.css";
import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="relative flex min-h-svh items-center overflow-hidden bg-night outline-none">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_70%_40%,#0b1626,transparent)]"
      />
      <div className="wrap relative">
        <p className="t-label flex items-center gap-3 text-fg-3">
          <span aria-hidden="true" className="size-1.5 bg-glow" />
          Error 404
        </p>
        <h1 className="t-display mt-7 max-w-[14ch]">
          This page doesn&rsquo;t <span className="t-serif">exist.</span>
        </h1>
        <p className="t-lead mt-7 max-w-[28rem] text-fg-2">
          The link may be old, or mistyped. Everything I&rsquo;ve built is on the home page.
        </p>
        <Link href="/" className="btn btn-solid mt-10">
          Go to the home page
          <Arrow />
        </Link>
      </div>
    </main>
  );
}
