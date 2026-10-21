# Case Study Content Schema & Visualization System

The canonical, unified data structure for all project case studies on Kedar's portfolio website.

Governed by **Radical Simplicity ("Make It Click")** and built to support **Awwwards-caliber visual choreography** (interactive WebGL canvases, scrubbed video walkthroughs, pinned scroll stories, and tactile stubs).

---

## 1. Unified Frontmatter / Content Schema Template

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

# Primary Hero Visual (Top of study: video, WebGL canvas, interactive stub, or poster frame)
heroVisual:
  format: "static-frame" # static-frame | video-scrub | interactive-canvas | 3d-model | explainer-figure | prototype-embed
  src: "" # Asset path, video URL, or registered component id
  aspectRatio: "16/9" # 16/9 | 21/9 | 4/3 | 1/1 | fullscreen
  caption: ""
  alt: ""
  motion:
    behavior: "idle-loop" # idle-loop | pinned-scrub | hover-reveal | user-driven | static
    driver: "scroll" # scroll | pointer | time

# 4 Universal Case Study Beats
problem:
  brokenState: "" # What was broken or being investigated before starting
  summary: "" # Plain-language context of why this problem mattered
  constraints: [] # [ "e.g. offline-first", "sub-second latency", "zero cloud dependency" ]
  visuals: [] # Optional visualization blocks (e.g. screenshot of problem loop, breakdown photo)

scope:
  framing: "" # Commercial contract vs. applied R&D investigation
  deliverables: [] # [ "e.g. 48-screen design system", "state machine", "hardware token" ]
  seams: "" # What was explicitly out of scope / boundaries
  visuals: [] # Optional system diagram, architecture map, or boundary flow

solution:
  overview: "" # High-level architecture of interface and flows
  mechanics: "" # Key interactions, friction points, or state mechanics
  visuals: # Core interface visual choreography
    - format: "interactive-canvas" # e.g. interactive slider, WebGL canvas, scrubbed video walkthrough
      src: ""
      caption: ""
      motion:
        behavior: "pinned-scrub"
        driver: "scroll"

outcome:
  summary: "" # What happened when deployed or tested
  metricsOrFindings: [] # [ { label: "", value: "" } ]
  systemReflection: "" # Architectural lesson learned about this class of system
  visuals: [] # Optional real deployment photo, device in hand, or verification log
---
```

---

## 2. Visualization Engine Specification

Each case study can scale from a clean editorial layout up to a full interactive spectacle without changing the core schema:

| Format | Execution | Example in Kedar's Roster |
|---|---|---|
| `static-frame` | Optimized responsive picture (`<img>` / picture set) with fine typography caption. | Screen design overview in *Audri* or *Newleaf*. |
| `video-scrub` | Inline H.264/WebM video scrubbed smoothly via GSAP ScrollTrigger ticker or played on view. | Mobile app navigation flows or survey entry in *NFHS*. |
| `interactive-canvas` | Dedicated canvas running procedural GL, Web Audio, or interactive state simulator. | Physical friction slider simulation in *The Melting Rupee*. |
| `3d-model` | Single-canvas Three.js/OGL scene with orbital control or scroll-driven rotation. | Celestial sphere in the void for *Preservation of Humans*. |
| `explainer-figure` | Isometric or flat exploded system flow illustrating multi-state mechanics. | Physical token separation loop and device admin hooks in *Dhyan*. |
| `prototype-embed` | Sandboxed interactive micro-component letting visitor test UI states directly. | Medical report keyboard shortcut state machine in *Audri*. |

---

## 3. TypeScript Interface Definition

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
  | 'idle-loop'
  | 'pinned-scrub'
  | 'hover-reveal'
  | 'user-driven'
  | 'static';

export interface VisualizationBlock {
  format: VisualizationFormat;
  src: string;
  caption?: string;
  alt?: string;
  aspectRatio?: '16/9' | '21/9' | '4/3' | '1/1' | 'fullscreen';
  motion?: {
    behavior: MotionBehavior;
    driver?: 'scroll' | 'pointer' | 'time';
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

export interface CaseStudyStep {
  summary: string;
  visuals?: VisualizationBlock[];
}

export interface ProblemStep extends CaseStudyStep {
  brokenState: string;
  constraints: string[];
}

export interface ScopeStep extends CaseStudyStep {
  framing: string;
  deliverables: string[];
  seams: string;
}

export interface SolutionStep extends CaseStudyStep {
  overview: string;
  mechanics: string;
}

export interface OutcomeStep extends CaseStudyStep {
  metricsOrFindings: MetricFinding[];
  systemReflection: string;
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
  heroVisual?: VisualizationBlock;
  problem: ProblemStep;
  scope: ScopeStep;
  solution: SolutionStep;
  outcome: OutcomeStep;
}
```
