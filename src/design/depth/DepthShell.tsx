import type { ReactNode } from "react";
import { profile } from "@/content/profile";
import { DepthHud, DepthNav, LiteSwitch, Reveal } from "./chrome";
import { DescentMount } from "./gl/DescentMount";
import { depthStyles } from "./styles";

/**
 * The page's surround: the shaft behind everything, the instruments at the
 * edge, and the opening bars that retract on the first frame.
 */
export function DepthShell({ children }: { children: ReactNode }) {
  return (
    <div className="d-page">
      <style dangerouslySetInnerHTML={{ __html: depthStyles }} />
      <a href="#main" className="d-skip">
        Skip to content
      </a>
      <div className="d-curtain" aria-hidden="true">
        <span />
        <span />
      </div>
      <DescentMount />
      <DepthNav name={profile.name} />
      <DepthHud />
      {children}
      <footer className="d-colophon">
        <div className="d-wrap d-colophon-row">
          <div>
            <p className="d-colophon-name">{profile.name}</p>
            <p className="d-data">
              {profile.locationShort} · {profile.timeZone.split("/")[1]} · {profile.availability}
            </p>
            <p className="d-data">Built with Next.js and three.js · the globe is generated from the skills file</p>
          </div>
          <LiteSwitch />
        </div>
      </footer>
      <Reveal />
    </div>
  );
}
