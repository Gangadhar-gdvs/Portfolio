"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We only want this on desktop/mouse devices
    if (typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches) {
      document.body.style.cursor = "none";
      
      const cursor = cursorRef.current;
      const ring = ringRef.current;
      
      if (!cursor || !ring) return;

      const cursorSetX = gsap.quickSetter(cursor, "x", "px");
      const cursorSetY = gsap.quickSetter(cursor, "y", "px");
      
      const ringSetX = gsap.quickSetter(ring, "x", "px");
      const ringSetY = gsap.quickSetter(ring, "y", "px");

      const onMouseMove = (e: MouseEvent) => {
        cursorSetX(e.clientX);
        cursorSetY(e.clientY);
        
        // Add a slight delay for the ring for that "elastic" cinematic feel
        gsap.to(ring, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.3,
          ease: "power2.out"
        });
      };

      const onMouseDown = () => {
        gsap.to(cursor, { scale: 0.5, duration: 0.1 });
        gsap.to(ring, { scale: 1.5, opacity: 0.8, duration: 0.1 });
      };

      const onMouseUp = () => {
        gsap.to(cursor, { scale: 1, duration: 0.1 });
        gsap.to(ring, { scale: 1, opacity: 0.4, duration: 0.1 });
      };
      
      // Interactive hover states for links/buttons
      const onMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const isClickable = target.closest("a, button, [role='button'], input, select, textarea");
        
        if (isClickable) {
          gsap.to(cursor, { scale: 1.5, background: "var(--ember)", duration: 0.2 });
          gsap.to(ring, { scale: 0, opacity: 0, duration: 0.2 });
        } else {
          gsap.to(cursor, { scale: 1, background: "var(--magma)", duration: 0.2 });
          gsap.to(ring, { scale: 1, opacity: 0.4, duration: 0.2 });
        }
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("mouseover", onMouseOver);

      return () => {
        document.body.style.cursor = "auto";
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("mouseover", onMouseOver);
      };
    }
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 99999, /* Cursor is now 2D overlay */ }}>
      <div 
        ref={cursorRef}
        style={{
          position: "absolute",
          top: "-5px",
          left: "-5px",
          width: "10px",
          height: "10px",
          backgroundColor: "var(--magma)",
          borderRadius: "50%",
          boxShadow: "0 0 10px var(--magma)"
        }}
      />
      <div 
        ref={ringRef}
        style={{
          position: "absolute",
          top: "-15px",
          left: "-15px",
          width: "30px",
          height: "30px",
          border: "1px solid var(--ember)",
          borderRadius: "50%",
          opacity: 0.4,
        }}
      />
      <style dangerouslySetInnerHTML={{__html: `
        @media (pointer: fine) {
          a, button, [role="button"], input, select, textarea {
            cursor: none !important;
          }
        }
      `}} />
    </div>
  );
}
