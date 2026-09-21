/**
 * The home page's document, in whichever design NEXT_PUBLIC_DESIGN picks.
 * It deliberately imports no stylesheet: the dark design's Tailwind sheet is
 * pulled in by the pages that use it, so the depth design does not
 * render-block on a stylesheet it never applies.
 */
import { activeDesign } from "@/design/design";
import { fontClass } from "@/design/fonts";
import { RootDocument, siteMetadata, viewportFor } from "@/design/RootDocument";

export const metadata = siteMetadata;
export const viewport = viewportFor(activeDesign);

export default function HomeLayout({ children }: LayoutProps<"/">) {
  return (
    <RootDocument design={activeDesign} fontClass={fontClass}>
      {children}
    </RootDocument>
  );
}
