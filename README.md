<div align="center">

# ◈ Gangadhara Gooti 
### Full-Stack Engineer & Interaction Developer

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white" alt="GSAP" />
</p>

A high-performance WebGL portfolio utilizing hardware-accelerated spatial rendering, custom scroll orchestration, and asynchronous route transitions to create a highly interactive, 3D-driven user interface.

<br>

</div>

---

<br>

<div align="center">

<table>
  <tr>
    <td width="50%"><img src="docs/readme/screens/depth-hero.jpg" alt="Hero Section"></td>
    <td width="50%"><img src="docs/readme/screens/depth-globe.jpg" alt="Interactive WebGL Globe"></td>
  </tr>
  <tr>
    <td align="center"><sub><b>SPATIAL UI</b> · Deep Z-Depth Transformations</sub></td>
    <td align="center"><sub><b>THE WORLD</b> · WebGL Extruded Geometry Data</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/readme/screens/depth-work.jpg" alt="Project Cards"></td>
    <td width="50%"><img src="docs/readme/screens/depth-mobile.jpg" alt="Mobile Responsive Design"></td>
  </tr>
  <tr>
    <td align="center"><sub><b>WORK</b> · Staggered GSAP Parallax Reveals</sub></td>
    <td align="center"><sub><b>RESPONSIVE</b> · Seamless Mobile Architecture</sub></td>
  </tr>
</table>

</div>

<br>

## ◈ Architecture & Rendering Engine

This repository operates on a highly customized frontend motion stack designed to bypass standard document limitations:

*   **Momentum Scrolling:** Native browser scroll behaviors are bypassed using `@studio-freight/lenis`, providing inertia-based physics scrolling for optimized frame delivery.
*   **Spatial Z-Depth (GSAP):** Elements are rendered within a strict 3D perspective context (`perspective: 2000px`). As components intersect the viewport, they are transformed via `translateZ` and `rotateX` matrices to enter the document flow from a negative Z-axis space.
*   **Parallax Orchestration:** Elements utilize GSAP ScrollTrigger `scrub` to offset their vertical translation relative to the scroll velocity, generating a layered depth effect independent of the main document flow.
*   **Asynchronous Route Transitions:** Next.js routing is intercepted by a custom GSAP transition controller. Route changes execute synchronized exit and entrance animations, bypassing hard document reloads.
*   **Custom Pointer Overlay:** The native pointer is replaced with a low-latency, GSAP-driven visual tracker constrained to a fixed 2D overlay layer (`translateZ(1000px)`) to prevent depth-sorting conflicts.

<br>

## ◈ WebGL Implementations

The application features two primary WebGL instances that run independently of the CSS transform engine to maintain target frame rates:

1.  **SkillGlobe (`SkillGlobe`):** A custom WebGL sphere initialized from `skills.ts`. Topographical data and borders are parsed from Natural Earth 1:50m, and urban light emission is mapped using GeoNames population data. Application skills are programmatically extruded into 3D geometry.
2.  **ShardMount:** A fractured sphere instance rendered via React Three Fiber. It utilizes pointer-velocity tracking and camera zoom controls to manipulate vertex displacement.

<br>

## ◈ Local Development

To initialize the development environment:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

> **Note:** Hardware acceleration is required. Browser rendering engines must support `backdrop-filter` and CSS 3D transforms for intended visual output.

<br>

## ◈ Content Management

Application data is decoupled from the UI components and is managed entirely within `src/content`. 

*   `profile.ts` — Contact information, availability, and external links.
*   `projects.ts` — Professional portfolio and case studies.
*   `experience.ts` — Employment history.
*   `skills.ts` — Technical stack (directly maps to WebGL Globe coordinates).

<br>

---

<br>

<div align="center">
  <img src="docs/readme/footer.svg" width="100%" alt="Let's work together.">
  <br><br>
  <sub>Typography utilizes Geist and Geist Mono by Vercel.</sub>
</div>
