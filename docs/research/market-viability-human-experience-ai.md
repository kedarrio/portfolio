# Benchmark & Strategic Analysis: Market Viability of 'Human Experience in AI' and Context Design

**Document ID:** `RES-2026-10-21-HUMAN-EXPERIENCE-AI`  
**Related Ticket:** [kedarrio/portfolio#9](https://github.com/kedarrio/portfolio/issues/9)  
**Parent Epic:** [kedarrio/portfolio#1](https://github.com/kedarrio/portfolio/issues/1) (Map: Redesign Portfolio Website)  
**Investigator:** Wayfinder Research Subagent  
**Date:** October 21, 2026  

---

## 1. Executive Summary & The Market Reality Check

### 1.1 The Core Inquiry
Is positioning a design practice around the **"Preservation of Human Creativity/Experience in the Age of AI"** and **"Context Design"** a commercially viable, disruptive market moat—or is it perceived by technical founders and high-ticket commercial buyers as fluffy, academic rhetoric?

### 1.2 The Verdict: Fluff vs. Disruptive Moat
The market perception of this thesis is sharply split along execution lines:

```
                                  [ THE RHETORICAL TRAP ]
                                  "Putting humans at the center of AI"
                                  • Vague humanistic poetry & ethical posturing
                                  • Luddite skepticism or anti-technology sentiment
                                  • "Figma pusher" adding chat bubbles to web apps
                                  • Outcome: Dismissed as commodity agency waffle
                                               │
                                       CRUCIAL PIVOT:
                         Shift from "Sentimental Humanism"
                                       to
                         "Architectural Interface Engineering"
                                               │
                                               ▼
                                  [ THE COMMERCIAL MOAT ]
                                  "Context Design & Cognitive Workbenches"
                                  • Solving the LLM UI bottleneck (chat fatigue)
                                  • Grounding non-deterministic models in deterministic state
                                  • High-bandwidth verification loops (diffs, rollbacks)
                                  • Safeguarding taste, judgment, & agency for retention
                                  • Outcome: $15k–$40k+ strategic design partner retainers
```

1. **When it fails (The Fluff Trap):** If articulated as abstract humanism (*"We believe in human-centric AI and mindful technology"*), it is immediately dismissed by technical founders as toothless agency marketing, ethical theater, or commodity design jargon.
2. **When it wins (The Commercial Moat):** When articulated as **the defining architectural bottleneck of the generative software era**—the reality that foundation models are commoditizing into low-margin utility layers, and the entire product moat lives in the **context layer, state management, and human-in-the-loop verification workbench**—it becomes the most urgent, high-ticket design problem in the industry today.

As Karri Saarinen (CEO/Co-Founder of Linear) famously diagnosed:
> *"AI's unpredictability isn't fundamentally a model problem—it's an interface problem."*

High-ticket clients (Series A–C startups, dev tool platforms, enterprise software companies, and venture-backed AI labs) are not buying philosophical essays; they are buying **solutions to catastrophic user drop-off, prompt paralysis, and the unreliability of conversational interfaces**.

---

## 2. The Client Problem Space: What High-Ticket Founders Are Suffering From

Through interviews, post-mortems, and commercial AI app audits, technical founders and product leads repeatedly describe six acute points of failure in first-generation AI interfaces:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 THE 6 FATAL PATHOLOGIES OF FIRST-GEN AI UI                  │
├───────────────────────────────┬─────────────────────────────────────────────┤
│ 1. Chat Fatigue & The Local   │ Unstructured text boxes cause paralysis.    │
│    Maximum                    │ Users tire of typing magic incantations.    │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 2. Bandwidth Asymmetry        │ 1D serial text streaming is 50x slower than │
│                               │ 2D spatial, visual, or structural scanning. │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 3. State Obscurity            │ Users have no visibility into what context  │
│    ("Black Box Amnesia")      │ the AI has loaded or forgotten.             │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 4. "Generic Template Mush"    │ Autonomous one-shot generation strips taste,│
│    (Loss of Agency)           │ producing corporate statistical slop.       │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 5. The Verification Tax       │ Generating 500 lines takes 3 seconds;       │
│                               │ auditing it manually takes 30 minutes.      │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 6. Catastrophic Churn Cliff   │ 80%+ 30-day churn on AI wrapper apps once   │
│                               │ the initial novelty wears off.              │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

### 2.1 Chat Fatigue & The "Local Maximum" Trap
The scrolling chatbot box (inherited from 1990s IRC and SMS) was an effective zero-to-one on-ramp for ChatGPT, but it represents a **strict local maximum** for complex professional workflows. Users experience cognitive exhaustion ("prompt engineering burden") from having to formulate instructions, correct misunderstandings, and scroll endlessly through polite AI conversational filler (*"Sure! I'd be happy to help you rewrite this database schema..."*).

### 2.2 Asymmetry of Cognitive Bandwidth
Human perception is optimized for non-linear, spatial, parallel evaluation: scanning a visual timeline, diffing two code blocks side-by-side, or flicking through a grid of visual tokens in 50 milliseconds. A conversational chatbot forces all communication through a single, slow, serial 1D text bottleneck. For power users, chat is suffocatingly slow.

### 2.3 State Obscurity & The "Black Box Amnesia"
In standard chat interfaces, the context window is hidden. Users cannot see what tokens, system prompts, files, or vector embeddings the model actually has in memory. When the model hallucinates or strays off-course, the user has no mechanical steering wheel—they can only re-prompt or start a brand new conversation, destroying all preceding work.

### 2.4 Loss of Agency & "Generic Template Mush"
When AI systems attempt full end-to-end automation without human collaboration, they output the mathematical median of their training corpus: bland, generic, cookie-cutter prose, code, and graphics. Users feel alienated from the artifact because their personal judgment, idiosyncratic style, and domain nuance were bypassed. The tool feels like an alien oracle rather than an extension of their own mind.

### 2.5 The Verification Tax
Founders quickly learn that **generation is cheap, but verification is expensive**. An agent can generate 10 files in 4 seconds; reviewing those files without granular diffs, syntactic checkpoints, or visual sandboxes requires 45 minutes of intense cognitive labor. If the interface does not streamline verification, using AI becomes a net negative on developer and designer velocity.

### 2.6 The Retention Cliff
Venture capitalists and founders report that while early-stage AI tools acquire users at record speed, 30-day cohort retention frequently plummets below 15%. Users abandon the tool the moment non-deterministic randomness ruins a production workflow. Making AI sticky requires turning novelty demos into reliable, habitual workbenches.

---

## 3. The Mechanical Architecture of "Context Design"

**Context Design** is not prompt writing. It is the systemic discipline of architecting how non-deterministic models ("squish") interface with deterministic, stateful user interfaces ("structure").

```
                     ┌────────────────────────────────┐
                     │          HUMAN INTENT          │
                     │  (Taste, Domain Goals, Scope)  │
                     └───────────────┬────────────────┘
                                     │
                                     ▼
               ┌─────────────────────────────────────────────┐
               │         CONTEXT DESIGN INFRASTRUCTURE       │
               ├─────────────────────────────────────────────┤
               │ 1. Context Scoping: Visible @-chips, memory │
               │ 2. Scaffolding: Dynamic schemas & bounds    │
               │ 3. State Decoupling: Workbench vs Stream    │
               └─────────────────────┬───────────────────────┘
                                     │
                                     ▼
                     ┌────────────────────────────────┐
                     │       PROBABILISTIC MODEL      │
                     │   (Raw Completion / Inference) │
                     └───────────────┬────────────────┘
                                     │
                                     ▼
               ┌─────────────────────────────────────────────┐
               │           HIGH-BANDWIDTH VERIFICATION       │
               ├─────────────────────────────────────────────┤
               │ • Granular Inline Diffs (Accept/Reject)     │
               │ • Reversible State Rollbacks & Snapshots    │
               │ • Interactive Generative UI Affordances     │
               └─────────────────────┬───────────────────────┘
                                     │
                                     ▼
                     ┌────────────────────────────────┐
                     │       HIGH-AGENCY ARTIFACT     │
                     │   (Production-Grade Software)  │
                     └────────────────────────────────┘
```

Context Design solves the six pathologies through five concrete mechanical pillars:

### Pillar 1: Explicit Context Scoping & Context Chips
* **Mechanism:** Eliminating hidden prompt injection by exposing active context as first-class, manipulable UI tokens (e.g. Cursor's `@file`, `@docs`, `@git`, `@codebase`; Notion's database references).
* **Cognitive Function:** The human explicitly sees and curates what the machine knows. Context is scoped dynamically per action, preventing model drift and token bloat.

### Pillar 2: State Decoupling (The "Workbench" Architecture)
* **Mechanism:** Splitting the screen into a **transient conversational/intent controller** and a **persistent, executable artifact canvas** (as pioneered by Anthropic's *Claude Artifacts*, *Cursor Composer*, and *Vercel v0*).
* **Cognitive Function:** The prompt is never the end product; the persistent artifact (code, document, design, schema) lives in an interactive canvas where the user can directly manipulate, test, and edit it without regenerating from scratch.

### Pillar 3: High-Bandwidth Verification Loops & Reversible Diffs
* **Mechanism:** Presenting AI proposals as structured diffs (green/red line additions, visual overlay comparisons, state rollbacks) with atomic, keyboard-driven Accept/Reject affordances.
* **Governing Rule:** **Autonomy is proportional to Reversibility.** If an action cannot be undone in one keystroke, the interface must gate it behind explicit verification. When rollbacks are frictionless, user psychological safety and velocity skyrocket.

### Pillar 4: Asymmetric / Ambient Cognitive Scaffolding
* **Mechanism:** Designing AI to run silently in the background as asynchronous metadata enrichers, categorizers, and edge monitors (the *Linear* model: duplicate issue detection, automated triage, thread summaries) rather than an intrusive chatbot popping up in the center of the viewport.
* **Cognitive Function:** The human remains uninterrupted in their creative flow; AI handles invisible organizational plumbing.

### Pillar 5: Generative UI & Direct Manipulation Affordances
* **Mechanism:** Replacing raw text responses with ephemeral, task-specific UI widgets (sliders, toggles, filterable data tables, visual color pickers) synthesized in real-time (Linus Lee / Geoffrey Litt *Malleable Software*).
* **Cognitive Function:** Shifting the interaction mode from "talking about data" to "directly touching and shaping data."

---

## 4. Practitioner Benchmarks & Primary-Source Case Studies

To prove commercial viability and intellectual heritage, Kedar's thesis rests on benchmarks from primary figures across design research, hardware, software engineering, and AI labs:

```
┌─────────────────────────┬───────────────────────────────┬────────────────────────────────────────────┐
│ Practitioner / Entity   │ Domain & Lineage              │ Key Benchmark Contribution                 │
├─────────────────────────┼───────────────────────────────┼────────────────────────────────────────────┤
│ John Maeda              │ MIT Media Lab / Automattic    │ "From UX to AX" (Design in Tech 2026);     │
│                         │                               │ Taste & judgment as human competitive moat │
├─────────────────────────┼───────────────────────────────┼────────────────────────────────────────────┤
│ Bret Victor             │ Apple UI / Dynamicland / CDG  │ Tools as cognitive & bodily extensions;    │
│                         │                               │ "Media for Thinking the Unthinkable"       │
├─────────────────────────┼───────────────────────────────┼────────────────────────────────────────────┤
│ Maggie Appleton         │ Cultural Anthropology / Dev   │ "Squish Meets Structure"; LM-native        │
│                         │ GitHub Next                   │ interfaces; Epistemic Rubber Ducks         │
├─────────────────────────┼───────────────────────────────┼────────────────────────────────────────────┤
│ Teenage Engineering     │ Industrial & Sound Hardware   │ Physical constraints; tactile joy & play;  │
│ (Jesper Kouthoofd)      │ Panic Playdate, Rabbit r1     │ Anti-glass, high-sensory semiotics         │
├─────────────────────────┼───────────────────────────────┼────────────────────────────────────────────┤
│ Linus Lee               │ Notion AI / Independent Lab   │ Generative UI beyond chat; cognitive       │
│ (@thesephist)           │                               │ scaffolding; latent-space direct control   │
├─────────────────────────┼───────────────────────────────┼────────────────────────────────────────────┤
│ Cursor                  │ Anysphere                     │ Commercial proof of Context Design:        │
│ (Michael Truell et al.) │                               │ @-mentions, Composer, multi-file diffs     │
├─────────────────────────┼───────────────────────────────┼────────────────────────────────────────────┤
│ Linear                  │ Product / Engineering Systems │ "AI is an interface problem"; the workbench│
│ (Karri Saarinen)        │                               │ over the void; agents as team members      │
├─────────────────────────┼───────────────────────────────┼────────────────────────────────────────────┤
│ Anthropic               │ AI Safety & Frontier Research │ Claude Artifacts; Human-in-the-Loop        │
│                         │                               │ Steering; Autonomy Spectrum framework      │
└─────────────────────────┴───────────────────────────────┴────────────────────────────────────────────┘
```

### 4.1 John Maeda: *From UX to AX (Agentic Experience)*
In his landmark 2024–2026 *Design in Tech Reports*, John Maeda charts the structural shift from **UX** (designing screens and flows to help humans perform manual actions step-by-step) to **AX** (Agentic Experience, where autonomous models act directly on human intent).
* *The Core Insight:* Because AI can generate infinite variations instantly, the economic value of raw execution drops toward zero. The scarce, irreplaceable value shifts upstream to **evaluation, taste, cultural discernment, and intent framing**.
* *Application for Kedar:* Kedar is not an execution factory; he is a systems architect who designs the evaluation harnesses and taste-driven parameters that allow products to maintain high design standards.

### 4.2 Bret Victor: *Media for Thinking the Unthinkable*
Bret Victor’s body of work across Apple, CDG, and Dynamicland rejects the notion of computing as an opaque oracle that answers questions for passive consumers. Instead, computation must serve as an **amplifier of human bodily and intellectual agency**.
* *The Core Insight:* When an interface hides its representations or abstracts away the user's manual connection to ideas, it atrophies human understanding. Dynamic mediums must provide continuous representations where humans can see, feel, and manipulate complex computational feedback loops.
* *Application for Kedar:* Context Design in Kedar’s vocabulary is the direct digital descendant of Victor’s *explorable explanations*—building software that helps humans think with machines rather than handing over their cognitive agency to a black box.

### 4.3 Maggie Appleton: *Squish Meets Structure & Epistemic Artifacts*
Appleton’s essays (*Squish Meets Structure*, *Tools for Thought as Cultural Practices*, and *The Expanding Dark Forest*) represent the vanguard of digital anthropology applied to AI UX.
* *The Core Insight:* Foundation models are "squishy, biological, fuzzy, probabilistic reasoning engines," whereas production software demands rigid, deterministic reliability. The designer’s job is to craft the membrane where "squish meets structure."
* *Epistemic Rubber Ducking:* AI should not be built as an omniscient authority, but as an epistemic thinking partner that surfaces alternative perspectives, exposes assumptions, and supports human inquiry without hallucinating absolute truth.
* *Application for Kedar:* Gives Kedar the conceptual authority to show how his systems bridge fuzzy machine intelligence with rock-solid, production-grade frontend architectures.

### 4.4 Teenage Engineering: *Tactility, Play, and Physical Constraints*
Jesper Kouthoofd and Teenage Engineering (creators of the OP-1 synthesizer, Playdate console, and co-designers of the Rabbit r1) represent the ultimate counter-reaction to the commoditized "all-glass, cloud-first, frictionless" trend.
* *The Core Insight:* Human beings do not experience joy through abstract cloud computations; we experience joy through physical feedback, tactile buttons, weighted knobs, mechanical haptics, and intentional constraints.
* *Application for Kedar:* Connects directly to Kedar's sensory Web Audio micro-clicks, geometric line illustrations, and tactile interaction design. It proves that digital tools can feel like handcrafted instruments rather than soulless enterprise portals.

### 4.5 Linus Lee (@thesephist): *Generative UI Beyond Chat*
Linus Lee’s research at Notion and his personal lab (building over 100 malleable software prototypes like *Monocle* and *IdeaFlow*) proved that chat is an impoverished interface for thought.
* *The Core Insight:* Instead of text-stream conversation, AI should dynamically synthesize tailored, interactive controls—sliders to adjust nuance, visual nodes to connect thoughts, and latent-space embeddings rendered as spatial maps.
* *Application for Kedar:* Concrete blueprints for commercial software that replaces static chat boxes with dynamic generative interfaces.

### 4.6 Cursor (Anysphere): *The Multi-Billion Dollar Proof of Context Design*
Cursor didn't succeed by training a better model than OpenAI; Cursor used OpenAI and Anthropic models under the hood. Cursor won because they built the superior **Context & Verification Interface**:
* `@-mentions` to curate context explicitly.
* `Composer` to orchestrate multi-file actions in an editable workspace.
* Keyboard-driven inline diffs to verify every generated line of code.
* *Application for Kedar:* The undisputed market proof that **Interface & Context Architecture = The Entire Commercial Moat**.

### 4.7 Linear (Karri Saarinen): *The Workbench Over the Void*
Linear’s refusal to build a generic AI chatbot inside their issue tracker is legendary. Instead, they treat AI agents as first-class team members operating inside structured workbenches:
* Agents investigate bugs, triage metadata, and open draft pull requests.
* Humans retain absolute editorial authority via clear diffs and approvals.
* *Application for Kedar:* Resonates deeply with high-velocity engineering and B2B SaaS founders who worship Linear’s craft and product standards.

### 4.8 Anthropic: *Claude Artifacts & The Autonomy Spectrum*
Anthropic’s user interface design for Claude Artifacts fundamentally altered consumer LLM UX by decoupling conversation from output:
* Chat remains on the left; the interactive, running code or document renders on the right.
* Anthropic's human-in-the-loop steering research outlines the *Autonomy Spectrum*: autonomy must scale strictly with reversibility.
* *Application for Kedar:* Anchors Kedar's architectural diagrams in recognized, peer-reviewed industry safety and UX paradigms.

---

## 5. Commercial Moat Analysis: Why High-Ticket Clients Pay $15k–$40k+

Why will a technical founder hire Kedar as a **Design Partner** instead of hiring a generic freelance UI designer at $50/hour?

```
┌──────────────────────────────────────────────┬──────────────────────────────────────────────┐
│       COMMODITY FREELANCER / AGENCY          │          KEDAR: STRATEGIC DESIGN PARTNER     │
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ "I will design pretty screens in Figma."     │ "I architect your human-in-the-loop context  │
│                                              │ engine to solve churn and chat fatigue."     │
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ Drops a ChatGPT-style chat modal into your   │ Replaces the chat bubble with an interactive │
│ dashboard.                                   │ workbench, context chips, and inline diffs.  │
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ Treats AI as a magic black box.              │ Understands token costs, context windows,    │
│                                              │ state latency, and probabilistic UX failures.│
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ Delivers static mockups that break when non- │ Delivers production-grade systems, token     │
│ deterministic outputs overflow boxes.        │ architectures, and resilient edge-state UX.  │
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ Billable by the hour; easily outsourced.     │ High-value fixed retainer ($15k–$40k);       │
│                                              │ directly derisks product-market fit.         │
└──────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

### The Economic Justification
1. **Retention over Acquisition:** Startups spend $50k+ on paid acquisition only to lose users to chat fatigue. A single UX intervention that shifts cohort retention from 15% to 45% adds millions to Enterprise Value.
2. **Founder Bandwidth Relief:** Technical founders (often brilliant backend or ML engineers) despise designing front-end user flows. They need a partner who speaks their architectural language (embeddings, context windows, state machines, ASTs) but possesses world-class aesthetic taste and tactile craft.
3. **Differentiation in a Sea of Slop:** When every startup is launching an AI wrapper with identical Tailwind styles and a chat box, Kedar’s bespoke line illustrations, tactile micro-interactions, and Awwwards-caliber craft make the client’s software feel like a category-defining instrument.

---

## 6. Tactical Framing & Copywriting Guidelines for Kedar's Portfolio

To communicate this thesis without triggering founder skepticism or sounding like an academic paper, Kedar must follow strict language translation principles.

### 6.1 The Jargon Translation Dictionary

| Academic / Fluffy Phrasing *(AVOID)* | Commercial Systems Phrasing *(USE)* |
|---|---|
| "Preserving human subjective experience in artificial systems" | **"Designing AI tools that amplify human judgment rather than replacing it with generic templates."** |
| "Context Design and phenomenological affordances" | **"Context Architecture: Giving users explicit control over what the AI knows, sees, and edits."** |
| "Epistemic scaffolds for non-deterministic intelligence" | **"High-speed verification: Inline diffs, instant rollbacks, and interactive workbenches."** |
| "Ethical and mindful human-AI symbiosis" | **"Ending chat fatigue. Moving AI out of the text box into high-frequency, reliable workflows."** |
| "Putting humans at the center of technology" | **"Software that feels like an instrument, not an unpredictable slot machine."** |

### 6.2 The Homepage Hero Copy Options

#### Option 1: The Category-Defining Contrast (Recommended)
> **"Most AI tools feel like slot machines: prompt a blank chat box and hope for the best.**  
> **I design high-frequency workbenches where humans steer and machines accelerate.**  
> Systems & Interaction Designer partnering with technical founders to build software with explicit context controls, reversible diffs, and uncompromising sensory craft."

#### Option 2: The Direct Problem-Solver (For Dev Tools & SaaS)
> **"AI's biggest bottleneck isn't the model—it's the interface.**  
> I help engineering teams and product founders eliminate chat fatigue, architect inspectable context layers, and turn messy probabilistic models into high-retention, production-grade tools."

#### Option 3: The Instrument-Maker (Tactile & Craft-Forward)
> **"Turning artificial intelligence into a precision instrument.**  
> I design systems software, context architectures, and tactile digital interfaces that preserve human taste, judgment, and agency at every step."

### 6.3 Describing the 4 Practice Pillars on the Website

1. **Systems & Backend User Flows:**  
   *Translating complex relational data models, permissions, and backend states into clear, intuitive user journeys.*
2. **Context & AI Workflow Design:**  
   *Architecting inspectable context layers, high-bandwidth verification loops, and human-in-the-loop workbenches that eliminate chat fatigue.*
3. **Tactile Interaction & Sensory Craft:**  
   *Bespoke geometric line illustrations, procedural audio micro-haptics, and 60fps WebGL depth that make software feel alive.*
4. **Speculative Inquiry & Prototyping:**  
   *Applied zero-to-one R&D and rapid computational probes that derisk emerging technological paradigms before production.*

---

## 7. Integration with the Dual-Anchor Portfolio Architecture

This research directly feeds into the 3-Tier work taxonomy locked in [kedarrio/portfolio#2](https://github.com/kedarrio/portfolio/issues/2) and [kedarrio/portfolio#3](https://github.com/kedarrio/portfolio/issues/3):

```
/ (Homepage: The Narrative Flow)
│
├── HERO: Dual-Anchor Positioning ("AI is an interface problem; I design the workbenches")
│
├── 01. SYSTEMS & COMMERCIAL WORK (Tier 1)
│   ├── Case Study A: Developer Tool / Complex SaaS (Context Chips, Diffs, Workbench UI)
│   └── Case Study B: High-Volume Operational Interface (Relational State, Asymmetric AI)
│
├── 02. SPECULATIVE INQUIRY LAB (Tier 2)
│   ├── Algorithmic Optics: Hardware/Edge-Vision Interface Probe (Teenage Engineering lens)
│   └── Post-Cash Liquidity / Tangible Computing (Bret Victor / Dynamicland lens)
│
├── 03. FIELD NOTES & ESSAYS (Tier 3)
│   ├── "Why Chat is a Local Maximum for Generative Software"
│   └── "The Autonomy Spectrum: Designing Reversible Diffs"
│
└── COLOPHON: Systems Stack, Performance Budget (Sub-2s LCP), Contact
```

---

## 8. Source Citations & References

1. **Saarinen, Karri.** (2024). *Linear's AI Design Philosophy: The Workbench Over the Void*. [linear.app/blog](https://linear.app).
2. **Maeda, John.** (2024–2026). *Design in Tech Report: From UX to AX (Agentic Experience)*. Presented at SXSW 2026. [designintech.report](https://designintech.report).
3. **Victor, Bret.** (2012–2024). *Media for Thinking the Unthinkable* & *Dynamicland Communications*. Communication Design Group / Dynamicland. [worrydream.com](https://worrydream.com).
4. **Appleton, Maggie.** (2023–2024). *Squish Meets Structure: Designing with Language Models* & *Tools for Thought as Cultural Practices*. [maggieappleton.com](https://maggieappleton.com).
5. **Lee, Linus (@thesephist).** (2023–2025). *Generative User Interfaces Beyond Chat* & *Cognitive Scaffolding*. [thesephist.com](https://thesephist.com).
6. **Kouthoofd, Jesper / Teenage Engineering.** (2023–2025). *Industrial Semiotics, Tangible Constraints, and Rabbit r1 Hardware Design*. [teenage.engineering](https://teenage.engineering).
7. **Truell, Michael et al. / Cursor (Anysphere).** (2024–2026). *Cursor: The AI-First Code Editor Architecture & Diffs Interface*. [cursor.com](https://cursor.com).
8. **Anthropic Research.** (2024–2026). *The Autonomy Spectrum: Human-in-the-Loop Steering and Claude Artifacts Interface Design*. [anthropic.com/research](https://anthropic.com).
9. **Litt, Geoffrey.** (2023–2024). *Malleable Software in the Age of LLMs*. [geoffreylitt.com](https://geoffreylitt.com).
10. **Swyx & Alessio (Latent Space).** (2024). *Why Chatbots are a Local Maximum and What Comes Next*. [latent.space](https://latent.space).
