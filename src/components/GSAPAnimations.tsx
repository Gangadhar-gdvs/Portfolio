"use client";

import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useRouter, usePathname } from "next/navigation";

export function GSAPAnimations() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 5. Seamless Page Entrance Transition
    // A cinematic fade-in from black every time the route changes.
    const transitionScreen = document.createElement("div");
    transitionScreen.style.position = "fixed";
    transitionScreen.style.inset = "0";
    transitionScreen.style.backgroundColor = "var(--void)";
    transitionScreen.style.zIndex = "99999";
    transitionScreen.style.pointerEvents = "none";
    document.body.appendChild(transitionScreen);
    
    gsap.to(transitionScreen, {
      opacity: 0,
      duration: 1.2,
      ease: "power2.inOut",
      onComplete: () => transitionScreen.remove()
    });

    // Intercept link clicks for Exit Transitions
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      
      const href = target.getAttribute("href");
      // Only intercept internal page routes, not hashes or external links
      if (href && href.startsWith("/") && href !== pathname) {
        e.preventDefault();
        
        const exitScreen = document.createElement("div");
        exitScreen.style.position = "fixed";
        exitScreen.style.inset = "0";
        exitScreen.style.backgroundColor = "var(--void)";
        exitScreen.style.zIndex = "99999";
        exitScreen.style.opacity = "0";
        exitScreen.style.pointerEvents = "all";
        document.body.appendChild(exitScreen);
        
        gsap.to(exitScreen, {
          opacity: 1,
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: () => {
            router.push(href);
          }
        });
      }
    };
    
    document.addEventListener("click", handleLinkClick);

    gsap.registerPlugin(ScrollTrigger);
    gsap.registerPlugin(ScrollTrigger);

    // 1. Cinematic Staggered Title Reveals
    // We target all main section titles and split their text into words manually
    // so we can animate them in a staggered cascade.
    const titles = document.querySelectorAll<HTMLElement>(".d-head-title"); // Exclude .d-display to protect hero title
    
    titles.forEach((title) => {
      // Don't split the massive hero title again if it's already split, 
      // but for standard section heads, wrap words.
      if (!title.classList.contains("gsap-split")) {
        const text = title.textContent || "";
        title.innerHTML = "";
        text.split(" ").forEach((word) => {
          const span = document.createElement("span");
          span.style.display = "inline-block";
          span.style.overflow = "hidden";
          span.style.verticalAlign = "top";
          span.style.marginRight = "0.2em";
          
          const innerSpan = document.createElement("span");
          innerSpan.style.display = "inline-block";
          innerSpan.textContent = word;
          innerSpan.className = "gsap-word";
          
          span.appendChild(innerSpan);
          title.appendChild(span);
        });
        title.classList.add("gsap-split");
      }

      // Create the ScrollTrigger animation for the words
      const words = title.querySelectorAll(".gsap-word");
      if (words.length > 0) {
        gsap.fromTo(words, 
          { y: "100%", opacity: 0 },
          {
            y: "0%",
            opacity: 1,
            duration: 1.2,
            stagger: 0.04,
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: title,
              start: "top 85%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    });

    // EXTREME 3D Z-DEPTH ENGINE
    // We set perspective on the main wrapper so 3D transforms have real depth (vanishing point)
    gsap.set(".d-page", { perspective: 2000 });

    // 1. True Cinematic 3D & Parallax Engine
    // PDF scrolling happens because everything moves at 1x speed.
    // We break this by adding subtle PARALLAX (scrub) and PROPER 3D PERSPECTIVE.
    const cards = document.querySelectorAll<HTMLElement>(".d-slab, .d-incident, .d-offer, .d-head, .d-globe-readout");
    cards.forEach((card, index) => {
      
      // STRIP CSS TRANSITIONS: CSS transform transitions will viciously fight GSAP's scrub ticker
      card.style.transition = "none";
      
      // Part A: The 3D Entrance (Unfolding from space)
      gsap.fromTo(card, 
        { 
          y: 150, 
          scale: 0.8,
          rotationX: -20, 
          rotationY: index % 2 === 0 ? 5 : -5, // Alternating subtle 3D twist
          transformPerspective: 1200, // CRITICAL for 3D depth to actually render
          opacity: 0
        },
        {
          y: 0,
          scale: 1,
          rotationX: 0,
          rotationY: 0,
          opacity: 1,
          duration: 1.5,
          ease: "expo.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%", // Trigger slightly earlier
            toggleActions: "play reverse play reverse"
          }
        }
      );


    });

    
    return () => {
      document.removeEventListener("click", handleLinkClick);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return null;
}
