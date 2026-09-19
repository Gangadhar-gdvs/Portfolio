import { profile } from "@/content/profile";

/**
 * First-visit intro: a line of light, a count to 100, then the screen opens
 * top and bottom like a cinema curtain. Pure CSS, so it plays before the
 * JavaScript arrives; a script in the layout decides whether it runs.
 */
export function Intro() {
  return (
    <div className="intro" aria-hidden="true">
      <div className="intro-bar" />
      <div className="intro-bar" />
      <div className="intro-slit" />
      <div className="intro-meta t-label">
        <span>{profile.name}</span>
        <span className="intro-count" />
      </div>
    </div>
  );
}
