"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";

export function ResumeButton({ link, text = "Résumé", className = "d-button d-button-ghost" }: { link: string, text?: string, className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Convert Google Drive view link to embeddable preview link
  
  const openModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(true);
  };

  const closeModal = () => {
    if (modalRef.current && backdropRef.current) {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.4, ease: "power2.inOut" });
      gsap.to(modalRef.current, {
        y: 100,
        z: -1000,
        rotateX: 15,
        opacity: 0,
        duration: 0.5,
        ease: "power3.in",
        onComplete: () => setIsOpen(false)
      });
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen && modalRef.current && backdropRef.current) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      
      gsap.set(backdropRef.current, { opacity: 0 });
      gsap.to(backdropRef.current, { opacity: 1, duration: 0.5, ease: "power2.out" });

      gsap.fromTo(modalRef.current,
        { 
          y: 150, 
          scale: 0.95,
          rotateX: -10, 
          opacity: 0,
          transformPerspective: 1500
        },
        { 
          y: 0, 
          scale: 1,
          rotateX: 0, 
          opacity: 1, 
          duration: 1.0, 
          ease: "expo.out",
          transformPerspective: 1500
        }
      );
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => { 
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <a className={className} href={link} onClick={openModal}>
        {text}
      </a>

      {isOpen && mounted && createPortal(
        <div 
          style={{ 
            position: "fixed", 
            inset: 0, 
            zIndex: 99990, 
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            perspective: "2000px" 
          }}
        >
          {/* Backdrop with data-lenis-prevent to completely stop background scrolling */}
          <div 
            ref={backdropRef}
            onClick={closeModal}
            data-lenis-prevent="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(20px) saturate(150%)",
              cursor: "pointer"
            }}
          />

          {/* Modal Container */}
          <div 
            ref={modalRef}
            data-lenis-prevent="true"
            style={{
              position: "relative",
              width: "calc(100% - 4rem)", // Ensure margins on mobile
              maxWidth: "1000px",
              height: "85vh", // Standard safe viewport height
              backgroundColor: "rgb(9, 10, 16)",
              border: "1px solid var(--line-2)",
              borderRadius: "16px",
              boxShadow: "0 50px 100px -20px rgba(0,0,0,1), 0 0 0 1px rgba(255,255,255,0.05)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              zIndex: 99991
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.5rem",
              borderBottom: "1px solid var(--line)",
              backgroundColor: "rgba(255,255,255,0.03)",
            }}>
              <span className="d-data" style={{ margin: 0, color: "var(--ash-1)", letterSpacing: "0.1em" }}>RESUME_VIEWER.PDF</span>
              
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <a href="/resume.pdf" download="Gangadhara_Resume.pdf" className="d-data" style={{ color: "var(--ember)", textDecoration: "none" }}>
                  Download PDF ↓
                </a>
              
              <button 
                onClick={closeModal}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--line)",
                  color: "var(--ash-1)",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "var(--ember)";
                  e.currentTarget.style.color = "#000";
                  e.currentTarget.style.borderColor = "var(--ember)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "var(--ash-1)";
                  e.currentTarget.style.borderColor = "var(--line)";
                }}
              >
                ✕
              </button>
              </div>
            </div>

            {/* iFrame strictly embedding the resume link */}
            <object 
              data="/resume.pdf"
              type="application/pdf"
              style={{
                width: "100%",
                flex: 1,
                border: "none",
                backgroundColor: "var(--void)" // Native PDF viewer often provides its own background, but this keeps the edges clean
              }}
            >
              <p style={{ padding: "2rem", color: "var(--ash-1)", textAlign: "center" }}>
                Your browser does not support native PDF viewing. <a href="/resume.pdf" target="_blank" style={{ color: "var(--ember)" }}>Click here to download it.</a>
              </p>
            </object>
          </div>
        </div>
      , document.body)}
    </>
  );
}
