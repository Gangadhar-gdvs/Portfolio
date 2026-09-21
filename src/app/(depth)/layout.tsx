/** The depth design's own document, for reading it at /depth. */
import { fontClass } from "@/design/fonts.depth";
import { RootDocument, siteMetadata, viewportFor } from "@/design/RootDocument";

export const metadata = siteMetadata;
export const viewport = viewportFor("depth");

export default function DepthLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootDocument design="depth" fontClass={fontClass}>
      {children}
    </RootDocument>
  );
}
