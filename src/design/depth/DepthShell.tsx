import type { ReactNode } from "react";
import { profile } from "@/content/profile";
import { DepthNav, DepthTilt, Reveal } from "./chrome";
import { depthStyles } from "./styles";

/**
 * The page's surround: the shaft behind everything, the navigation, and the
 * opening bars that retract on the first frame.
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
      <div className="d-shaft" aria-hidden="true" />
      <DepthNav name={profile.name} />
      {children}
      <footer className="d-colophon">
        <div className="d-wrap d-colophon-row">
          <div>
            <p className="d-colophon-name">{profile.name}</p>
            <p className="d-data">
              {profile.locationShort} · {profile.timeZoneShort} · {profile.availability}
            </p>
            <p className="d-data d-surface-paths">
              <a href="/hire">Hire full-time</a>
              <span aria-hidden="true">·</span>
              <a href="/freelance">Start a build</a>
            </p>
            <p className="d-data">Built with Next.js and three.js · the globe is generated from the skills file</p>
          </div>
        </div>
      </footer>
      <Reveal />
      <DepthTilt />
    </div>
  );
}
