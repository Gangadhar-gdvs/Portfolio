import { DepthShell } from "./DepthShell";
import { Core, Strata, Surfacing } from "./sections/Depths";
import { Globe } from "./sections/Globe";
import { Surface } from "./sections/Surface";
import { Work } from "./sections/Work";

/**
 * The depth design, end to end: surface, work, the world of skills, the core,
 * the path, and back up. It reads the same content files as the dark design,
 * so there is one set of facts on this site and two ways of showing them.
 */
export function DepthHome() {
  return (
    <DepthShell>
      <main id="main" tabIndex={-1} className="d-main">
        <Surface />
        <Work />
        <Globe />
        <Core />
        <Strata />
        <Surfacing />
      </main>
    </DepthShell>
  );
}
