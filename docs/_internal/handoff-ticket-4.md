# Handoff: Wayfinder Ticket #4 (Portfolio Redesign)

## Context & Objectives
We are running the `/wayfinder` workflow to redesign Kedar Mulay's portfolio website (`kedarrio/portfolio`). The destination is a locked design, architecture, and content specification ready for implementation.

The canonical tracker is GitHub Issues on `kedarrio/portfolio`. The root map issue is [#1 Map: Redesign Portfolio Website](https://github.com/kedarrio/portfolio/issues/1).

## Decisions Locked So Far
Do not re-litigate settled decisions. Read their issue comments and linked docs for context:
1. **[#2 Benchmark: Academic-Turned-Commercial Portfolios](https://github.com/kedarrio/portfolio/issues/2)** (Closed): Established 3-tier work taxonomy, Dual-Anchor positioning formula, single-canvas WebGL + procedural Web Audio envelope (sub-2s mobile LCP). Deliverable: `docs/research/benchmark-academic-commercial-portfolios.md`.
2. **[#3 Positioning & Audience](https://github.com/kedarrio/portfolio/issues/3)** (Closed): Locked title as `Systems & Interaction Designer` and posture as `Design Partner`. Primary target: Technical founders & high-ticket international clients. Codified in `GLOSSARY.md`.
3. **[#9 Benchmark: Human Experience in AI & Context Design](https://github.com/kedarrio/portfolio/issues/9)** (Closed): Validated Context Design as an acute market moat (solving chat fatigue and state obscurity with structured workbenches and reversible diffs). Deliverable: `docs/research/market-viability-human-experience-ai.md`.
4. **[#5 Project Archive Audit & Launch Lineup](https://github.com/kedarrio/portfolio/issues/5)** (Closed): 
   - Unified **Selected Work** layout (rejected rigid separate sections).
   - Adopted **Two-Layer Context Metadata Tags**: `[origin: academic | client | research | speculative] / [project-type] / [project-name]`.
   - Locked **Universal 4-Part Case Study Flow**: `Problem / Idea` → `Plan & Scope` → `Design & Implementation` → `Outcome`.
   - Verified 10-project candidate roster.
   - Initialized raw asset ingestion directory: `docs/raw-projects-dump/` and created follow-up **#10 Task Ticket**.
   - Codified in `GLOSSARY.md`.

## Core Stance & Writing Rules
- **Radical Simplicity ("Make It Click")**: Zero academic jargon, zero buzzwords, zero pretentious agency poetry. Everything must be explained in plain, neutral, intuitive English so anyone immediately gets it.
- **Unified Narrative Flow**: Every project, whether commercial client work or academic research, follows the same 4-part structure: `Problem/Idea` → `Scope` → `Design/Impl` → `Outcome`.

## Next Session Focus: Ticket #4
The next agent must immediately drive:
👉 **[#4 Academic-to-Commercial Translation: Reframing speculative and academic work for commercial buyers](https://github.com/kedarrio/portfolio/issues/4)** (`wayfinder:grilling`, HITL).

### Immediate Steps for the Incoming Agent:
1. **Claim the ticket**:
   ```bash
   gh issue edit 4 --add-assignee @me
   ```
2. **Conduct HITL Grilling**:
   - Reframe the key academic / research projects so commercial buyers, technical founders, and product teams instantly recognize the systems-thinking and commercial relevance:
     - **The Melting Rupee**: Reframe from conceptual currency sculpture to an applied study on *friction and cognitive intuition in digital transactions* (why losing physical feedback causes overspending and how tangible digital states solve it).
     - **NFHS (National Family Health Survey)**: Frame as *large-scale operational data collection and information architecture*—turning complex field survey pipelines into error-resilient workflows.
     - **BHIM Usability Testing & Redesign**: Frame as *high-stakes fintech usability engineering*—identifying failure modes in high-volume UPI transactions.
     - **Upside Down**: Frame as *behavioral interaction design and screen time mechanics*.
   - Ensure all reframing uses plain, simple language that clicks in 10 seconds.
3. **Resolution**:
   - Post the translation guide as a resolution comment on issue #4.
   - Close issue #4.
   - Append context pointer to `## Decisions so far` on [#1 Map: Redesign Portfolio Website](https://github.com/kedarrio/portfolio/issues/1).
   - This unblocks [#6 Content Schema](https://github.com/kedarrio/portfolio/issues/6) and feeds into [#7 Homepage Narrative](https://github.com/kedarrio/portfolio/issues/7).

## Key Files & Artifacts
- **Map Issue**: [#1 Map: Redesign Portfolio Website](https://github.com/kedarrio/portfolio/issues/1)
- **Interactive Map Dashboard**: [`docs/wayfinder-map.html`](docs/wayfinder-map.html)
- **Domain Glossary**: [`GLOSSARY.md`](GLOSSARY.md)
- **Raw Projects Dump**: `docs/raw-projects-dump/`
