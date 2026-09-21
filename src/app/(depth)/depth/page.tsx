import { permanentRedirect } from "next/navigation";
import { DepthHome } from "@/design/depth/DepthHome";
import { activeDesign } from "@/design/design";

/** The depth design at its own path. When it is already the home page, this is just `/`. */
export default function DepthPage() {
  if (activeDesign === "depth") permanentRedirect("/");
  return <DepthHome />;
}
