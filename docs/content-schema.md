# Case Study Content Schema & Visualization System

The canonical, unified data structure for all project case studies on Kedar's portfolio website.

Governed by **Radical Simplicity ("Make It Click")** and built to support **Awwwards-caliber visual choreography** (interactive WebGL canvases, scrubbed video walkthroughs, pinned scroll stories, and tactile stubs).

---

## 1. What Exactly a `visual` Block Entails

Every visual element on a case study—whether in `heroVisual` or inside `problem.visuals[]`, `scope.visuals[]`, `solution.visuals[]`, or `outcome.visuals[]`—is a structured object with 7 explicit properties:

| Property | Type / Options | Description & Purpose |
|---|---|---|
| `format` | `static-frame`<br>`video-scrub`<br>`interactive-canvas`<br>`3d-model`<br>`explainer-figure`<br>`prototype-embed` | **The execution medium:**<br>• `static-frame`: High-res retina image / poster frame.<br>• `video-scrub`: Inline video whose timeline scrubs on scroll or plays on view.<br>• `interactive-canvas`: Procedural WebGL shader or interactive React canvas.<br>• `3d-model`: Three.js/OGL scene with orbital or scroll-linked rotation.<br>• `explainer-figure`: Isometric or exploded system architecture flow.<br>• `prototype-embed`: Sandboxed live UI micro-component or interactive stub. |
| `src` | `string` | Asset file path (e.g. `/assets/dhyan/token-hero.webp`), video URL (H.264/WebM), 3D asset (`.glb`), or registered React/Astro component name (e.g. `DhyanFrictionSimulator`). |
| `aspectRatio` | `16/9` \| `21/9` \| `4/3` \| `1/1` \| `fullscreen` | Controls layout container sizing and prevents cumulative layout shift (CLS). |
| `caption` | `string` | Editorial caption underneath the visual explaining the systems significance of what is shown. |
| `alt` | `string` | Accessible plain-text description for screen-readers and SEO. |
| `motion.behavior` | `pinned-scrub`<br>`idle-loop`<br>`hover-reveal`<br>`user-driven`<br>`static` | **How the visual animates:**<br>• `pinned-scrub`: Scroll locks the viewport and scrubs the visual timeline.<br>• `idle-loop`: Subtle continuous breathing motion at rest.<br>• `hover-reveal`: Expands details or highlights data under cursor.<br>• `user-driven`: Direct interactive canvas (visitor clicks/drags).<br>• `static`: Traditional motionless display. |
| `motion.driver` | `scroll` \| `pointer` \| `time` | The clock or input controlling the animation (scroll position, mouse cursor, or GSAP ticker). |

---

## 2. Where Visuals Attach Across the 4 Beats

1. **`heroVisual` (Top of Study)**: Immediate visual payoff before reading (e.g. Dhyan physical QR token + lockscreen, Preservation of Humans 3D celestial sphere, or Audri dual-pane overview).
2. **`problem.visuals[]`**: Visual evidence of the broken state or baseline failure mode (e.g. screenshot of the addictive screen time loop in Dhyan, photo of messy paper survey records in NFHS).
3. **`scope.visuals[]`**: Architectural boundary map or system topology (e.g. state machine schematic showing what is inside vs outside the design seam).
4. **`solution.visuals[]`**: Core interface choreography & interactive sandboxes (e.g. scrubbed video walkthrough, high-density component kit, or interactive friction slider).
5. **`outcome.visuals[]`**: Real-world proof & deployment artifacts (e.g. photo of the printed QR key in a physical room, screenshot of verified local device logs, or field survey in enumerator hands).

---

## 3. Unified Frontmatter / Content Schema Template

```yaml
---
title: ""
slug: ""
tagline: ""
year: ""
role: ""
clientOrPartner: ""
confidentiality: "public" # public | nda-sanitized | unlisted

# Two-layer metadata tag: [origin] / [type] / [name]
tagHierarchy:
  origin: "" # client | academic | research | speculative | personal
  projectType: "" # e.g. design-system | field-operations | tangible-friction | app-blocker
  identifier: "" # short project slug

# Executive Hook (for technical founders & engineering leads)
executiveHook:
  hookText: "What this proves: [1-2 sentences on systems/engineering takeaway]"
  primaryMetricOrProof: "" # e.g. "-42% turnaround", "Zero validation errors", "+38% deliberation"

# Dedicated Hero Visual (Top Anchor)
heroVisual:
  format: "static-frame" # static-frame | video-scrub | interactive-canvas | 3d-model | explainer-figure | prototype-embed
  src: "" # asset path, video file, or component identifier
  aspectRatio: "16/9" # 16/9 | 21/9 | 4/3 | 1/1 | fullscreen
  caption: ""
  alt: ""
  motion:
    behavior: "pinned-scrub" # pinned-scrub | idle-loop | hover-reveal | user-driven | static
    driver: "scroll" # scroll | pointer | time

# 1. Problem / Idea
problem:
  brokenState: "" # What was broken or being investigated before starting
  summary: "" # Plain-language context of why this problem mattered
  constraints: [] # [ "e.g. offline-first", "sub-second latency", "zero cloud dependency" ]
  visuals: # Visual evidence of the broken state / baseline
    - format: "static-frame"
      src: ""
      aspectRatio: "16/9"
      caption: ""
      alt: ""
      motion:
        behavior: "static"
        driver: "time"

# 2. Plan & Scope
scope:
  framing: "" # Commercial contract vs. applied R&D investigation
  deliverables: [] # [ "e.g. 48-screen design system", "state machine", "hardware token" ]
  seams: "" # What was explicitly out of scope / boundaries
  visuals: # Architectural boundary map or system topology
    - format: "explainer-figure"
      src: ""
      aspectRatio: "16/9"
      caption: ""
      alt: ""
      motion:
        behavior: "hover-reveal"
        driver: "pointer"

# 3. Design & System
solution:
  overview: "" # High-level architecture of interface and flows
  mechanics: "" # Key interactions, friction points, or state mechanics
  visuals: # Core interface visual choreography
    - format: "video-scrub"
      src: ""
      aspectRatio: "16/9"
      caption: ""
      alt: ""
      motion:
        behavior: "pinned-scrub"
        driver: "scroll"

# 4. Outcome & Learnings
outcome:
  summary: "" # What happened when deployed or tested
  metricsOrFindings: [] # [ { label: "", value: "" } ]
  systemReflection: "" # Architectural lesson learned about this class of system
  visuals: # Real deployment proof / device in hand
    - format: "static-frame"
      src: ""
      aspectRatio: "4/3"
      caption: ""
      alt: ""
      motion:
        behavior: "static"
        driver: "time"
---
```

---

## 4. TypeScript Interface Definition

```typescript
export type ProjectOrigin =
  | 'client'
  | 'academic'
  | 'research'
  | 'speculative'
  | 'personal';

export type VisualizationFormat =
  | 'static-frame'
  | 'video-scrub'
  | 'interactive-canvas'
  | '3d-model'
  | 'explainer-figure'
  | 'prototype-embed';

export type MotionBehavior =
  | 'pinned-scrub'
  | 'idle-loop'
  | 'hover-reveal'
  | 'user-driven'
  | 'static';

export type MotionDriver =
  | 'scroll'
  | 'pointer'
  | 'time';

export interface VisualBlock {
  format: VisualizationFormat;
  src: string;
  aspectRatio: '16/9' | '21/9' | '4/3' | '1/1' | 'fullscreen';
  caption?: string;
  alt: string;
  motion?: {
    behavior: MotionBehavior;
    driver: MotionDriver;
  };
}

export interface TagHierarchy {
  origin: ProjectOrigin;
  projectType: string;
  identifier: string;
}

export interface ExecutiveHook {
  hookText: string;
  primaryMetricOrProof: string;
}

export interface MetricFinding {
  label: string;
  value: string;
}

export interface ProblemStep {
  brokenState: string;
  summary: string;
  constraints: string[];
  visuals?: VisualBlock[];
}

export interface ScopeStep {
  framing: string;
  deliverables: string[];
  seams: string;
  visuals?: VisualBlock[];
}

export interface SolutionStep {
  overview: string;
  mechanics: string;
  visuals: VisualBlock[];
}

export interface OutcomeStep {
  summary: string;
  metricsOrFindings: MetricFinding[];
  systemReflection: string;
  visuals?: VisualBlock[];
}

export interface ProjectCaseStudy {
  title: string;
  slug: string;
  tagline: string;
  year: string;
  role: string;
  clientOrPartner: string;
  confidentiality: 'public' | 'nda-sanitized' | 'unlisted';
  tagHierarchy: TagHierarchy;
  executiveHook: ExecutiveHook;
  heroVisual?: VisualBlock;
  problem: ProblemStep;
  scope: ScopeStep;
  solution: SolutionStep;
  outcome: OutcomeStep;
}
```
