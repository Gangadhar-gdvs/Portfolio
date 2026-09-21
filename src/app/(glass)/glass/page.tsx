import { permanentRedirect } from "next/navigation";
import { StackHome } from "@/components/home/StackHome";
import { activeDesign } from "@/design/design";

/** The dark glass design at its own path. When it is already the home page, this is just `/`. */
export default function GlassPage() {
  if (activeDesign === "stack") permanentRedirect("/");
  return <StackHome />;
}
