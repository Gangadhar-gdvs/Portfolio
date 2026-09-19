/** The site mark: three layers of a stack, the top one solid. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M10 2 18 6.2 10 10.4 2 6.2Z" fill="currentColor" />
      <path d="M2 9.8 10 14l8-4.2" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" opacity={0.7} />
      <path d="M2 13.4 10 17.6l8-4.2" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" opacity={0.4} />
    </svg>
  );
}
