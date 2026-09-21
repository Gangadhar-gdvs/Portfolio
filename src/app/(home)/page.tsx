import { DesignHome } from "@/design/entry";

/**
 * One route, two designs.
 *
 * `@/design/entry` is resolved at build time by NEXT_PUBLIC_DESIGN (see the
 * alias in next.config.ts), so each build statically imports only the design
 * it is building: no dead components, no stylesheet and no webfont from the
 * other one. Both read the same content files, so the words and the numbers
 * cannot drift apart between them.
 */
export default function Home() {
  return <DesignHome />;
}
