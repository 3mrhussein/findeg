import React, { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

export const DEFAULT_MASTER_PROMPT = `Act as a Creative Technologist, WebGL Shader Artist, and Lead Frontend Engineer at an award-winning digital studio. Build a complete, production-ready, cinematic 3D promotional and interactive e-commerce web app for "notd° PAPER & SUPPLY STUDIO" — a back-to-school stationery and student supply list web app — inside a single self-contained index.html file (Three.js r128 WebGL scenes, GSAP ScrollTrigger animations, interactive supply-list state management, and procedural High-DPI <canvas>/SVG textures bundled inline).

1. DESIGN SYSTEM & TYPOGRAPHY:
- Palette: Deep Drafting-Board Graphite (#0E1014) with warm amber desk-lamp radial backlight (#3B2818), 160gsm Archival Dot-Grid Paper (#EAE7DF) for catalog/clock sections, Highlighter Tangerine (#E07A38), and Fluorescent Study Volt (#C9F24B).
- Fonts: 'Inter Tight' (800/900 uppercase display, line-height 0.92), 'Caveat' (calligraphic handwritten annotations: "semester", "field notes"), and 'JetBrains Mono' (technical metadata, SKUs, odometer prices, receipt lines).

2. SECTION 1 — HERO & INTERACTIVE 3D DESK STAGE (100vh):
- Left column: Eyebrow "// BACK TO SCHOOL & STUDIO SUPPLIES", giant stacked headline "TOOLS / FOR YOUR" + script "semester", quick-load student track pills (High School Core, University STEM, Art & Arch Studio), and 3-column bottom metadata strip.
- Right column: Interactive Three.js WebGL stage with two floating hero models:
  (A) 3D B5 Hardcover Dot-Grid Journal with linen cover, charcoal spine, elastic closure band, amber ribbon bookmark, and procedural <canvas> cover label.
  (B) 3D Ceramic Studio Pen Cup tilted at -10deg holding anodized black 0.5mm gel pens, an amber highlighter, and an etched aluminum scale ruler.
- Include raycaster hover/click detection synced to a floating glassmorphic HUD card ("// IN THE BACKPACK — B5 DOT-GRID JOURNAL $14.00" vs "// ON THE DESK — 0.5MM DRAFTING PEN SET $16.50") with "+ ADD TO SUPPLY LIST".

3. SECTION 2 — INTERACTIVE BACK-TO-SCHOOL ESSENTIALS GRID & GRADE PRESET BAR:
- Archival paper backdrop (#EAE7DF) with giant "n." brushstroke watermark.
- 1-Click Student Track Preset Loaders (High School Core, University STEM, Art & Arch Studio, Full Master Kit) + category tabs, live search input, and price sorting.
- 8 Brutalist product cards (1px solid #181816) with odometer index (01–08), studio SVG illustrations, rolling prices, "[✓ HAVE IT]" owned-item toggle, and "+ ADD / - qty +" steppers.

4. SECTION 3 — INTERACTIVE STUDY CLOCK DIAL & CAMPUS PICKUP HUBS:
- 470px circular analog clock dial (#F8F6F1) with 60 radial minute ticks and numerals 1–12.
- Centerpiece: Studio ceramic pen cup with a protruding aluminum scale ruler acting as the sweeping clock hand, rotating smoothly on scroll or when clicking Study Block presets (08:00 Lecture, 13:00 Studio Lab, 17:00 Library Sprint, 21:00 Exam Review).

5. SECTION 4 — ZERO-GRAVITY 3D STATIONERY FIELD (WEBGL):
- Dark graphite stage with headline "THE SEMESTER NEVER STOPS. YOUR TOOLS SHOULDN'T SLOW YOU DOWN."
- 36 3D stationery objects (hexagonal pencils with ferrules/erasers, pastel highlighters, block erasers) floating across Z-depth with interactive physics modes (Zero-G Float, Orbit Swirl, Scatter Impulse).

6. SECTION 5 — SCROLL-DRIVEN THERMAL SUPPLY LIST RECEIPT PRINTER:
- Brushed-aluminum horizontal slot dispenser at top-center extruding a cream thermal paper receipt (#F4F0E6) with a serrated zig-zag bottom edge.
- Live interactive checklist synced with the catalog: students can check off items they already own at home, add custom teacher/syllabus supplies, toggle the 15% Student (.EDU) discount, copy their formatted supply list, or reserve a Campus Locker pickup bundle.`;

export interface PromptBlueprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customPromptText?: string;
  onCopy?: (promptText: string) => void;
  className?: string;
}

export const PromptBlueprintModal: React.FC<PromptBlueprintModalProps> = ({
  open,
  onOpenChange,
  customPromptText,
  onCopy,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const promptText = customPromptText ?? DEFAULT_MASTER_PROMPT;

  const handleCopy = async () => {
    setCopied(true);
    onCopy?.(promptText);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(promptText);
      }
    } catch {
      // Fallback if clipboard API errors
    }
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md transition-opacity data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          data-testid="prompt-blueprint-modal"
          className={`fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-4xl max-h-[88vh] flex flex-col bg-[#12151C] border border-white/20 rounded-2xl shadow-2xl overflow-hidden focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ${className}`}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/15 flex flex-wrap items-center justify-between gap-3 bg-[#0E1014]">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded bg-[#C9F24B] text-[#0E1014] font-mono text-[10px] font-bold uppercase tracking-wider">
                GETLAYERS.AI STYLE
              </span>
              <DialogPrimitive.Title className="font-sans text-base sm:text-lg uppercase font-bold text-white tracking-wide">
                Master AI Prompt — Cinematic 3D Stationery &amp; Supply List Web App
              </DialogPrimitive.Title>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid="copy-prompt-btn"
                onClick={handleCopy}
                className="font-mono text-xs uppercase px-3.5 py-1.5 rounded bg-[#E07A38] hover:bg-[#c96829] text-white font-bold transition-colors cursor-pointer"
              >
                {copied ? '✓ COPIED!' : 'COPY FULL PROMPT'}
              </button>
              <DialogPrimitive.Close asChild>
                <button
                  type="button"
                  data-testid="close-prompt-modal-btn"
                  className="font-mono text-xs uppercase px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  ✕ CLOSE
                </button>
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Description for screen readers */}
          <DialogPrimitive.Description className="sr-only">
            Master AI Prompt instructions for building the cinematic 3D back-to-school stationery
            studio web app.
          </DialogPrimitive.Description>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto font-mono text-xs leading-relaxed text-white/85 space-y-4 select-all">
            <p className="text-[#C9F24B] font-bold">
              // COPY &amp; PASTE THIS EXACT PROMPT INTO GEMINI, CLAUDE CODE, OR CURSOR:
            </p>
            <pre className="whitespace-pre-wrap text-[11px] bg-black/50 p-4 rounded-xl border border-white/10 text-[#F6F4EE] font-mono">
              {promptText}
            </pre>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
