/** The dark glass design's own document, for reading it at /glass. */
import { fontClass } from "@/design/fonts.stack";
import { RootDocument, siteMetadata, viewportFor } from "@/design/RootDocument";

export const metadata = siteMetadata;
export const viewport = viewportFor("stack");

export default function GlassLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootDocument design="stack" fontClass={fontClass}>
      {children}
    </RootDocument>
  );
}
