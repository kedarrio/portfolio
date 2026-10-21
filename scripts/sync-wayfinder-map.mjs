#!/usr/bin/env node

/**
 * sync-wayfinder-map.mjs
 *
 * Automatically syncs and regenerates `docs/wayfinder-map.html`
 * directly from GitHub Issues (the single source of truth).
 *
 * Usage:
 *   node scripts/sync-wayfinder-map.mjs
 *   ./scripts/sync-wayfinder-map.mjs
 */

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');
const OUTPUT_HTML_PATH = resolve(ROOT_DIR, 'docs', 'wayfinder-map.html');

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    const msg = err.stderr ? err.stderr.toString() : err.message;
    throw new Error(`Command failed: ${cmd}\n${msg}`);
  }
}

// 1. Detect repository owner and name
let repoOwner = '';
let repoName = '';
try {
  const repoJson = JSON.parse(run('gh repo view --json owner,name'));
  repoOwner = repoJson.owner?.login || repoJson.owner?.id;
  repoName = repoJson.name;
} catch (err) {
  console.error('Error detecting GitHub repository via `gh repo view`. Falling back to git remote.');
  const remoteUrl = run('git remote get-url origin');
  const match = remoteUrl.match(/[:/]([^/]+)\/([^/.]+)(?:\.git)?$/);
  if (match) {
    repoOwner = match[1];
    repoName = match[2];
  } else {
    throw new Error('Could not determine repository owner and name.');
  }
}

console.log(`📡 Fetching issues for ${repoOwner}/${repoName}...`);

// 2. Query GitHub Issues & Dependencies via GraphQL
const graphqlQuery = `
query {
  repository(owner: "${repoOwner}", name: "${repoName}") {
    nameWithOwner
    issues(first: 50, states: [OPEN, CLOSED]) {
      nodes {
        number
        title
        state
        body
        url
        labels(first: 10) {
          nodes {
            name
          }
        }
        assignees(first: 5) {
          nodes {
            login
          }
        }
        blockedBy(first: 10) {
          nodes {
            number
            title
            state
          }
        }
        blocking(first: 10) {
          nodes {
            number
            title
            state
          }
        }
      }
    }
  }
}
`;

let issuesData;
try {
  const rawResponse = run(`gh api graphql -f query='${graphqlQuery.replace(/'/g, "\\'")}'`);
  issuesData = JSON.parse(rawResponse).data.repository.issues.nodes;
} catch (err) {
  console.error('Failed to query GraphQL API. Ensure `gh auth status` is valid.');
  throw err;
}

// 3. Locate Map issue (labelled `wayfinder:map` or issue #1)
const mapIssue = issuesData.find(i => 
  i.labels.nodes.some(l => l.name === 'wayfinder:map')
) || issuesData.find(i => i.number === 1);

if (!mapIssue) {
  throw new Error('Could not find wayfinder map issue (labelled wayfinder:map or #1).');
}

// 4. Parse Map markdown body
function parseMarkdownSections(md) {
  const sections = {};
  let currentHeader = '';
  for (const line of md.split('\n')) {
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      currentHeader = match[1].trim();
      sections[currentHeader] = [];
    } else if (currentHeader) {
      sections[currentHeader].push(line);
    }
  }
  for (const [k, v] of Object.entries(sections)) {
    sections[k] = v.join('\n').trim();
  }
  return sections;
}

const mapSections = parseMarkdownSections(mapIssue.body || '');
const destinationText = mapSections['Destination'] || 'No destination specified.';
const decisionsRaw = mapSections['Decisions so far'] || '';
const fogRaw = mapSections['Not yet specified'] || '';
const outOfScopeRaw = mapSections['Out of scope'] || '';

// Parse Decisions so far: maps issue number -> one-line summary
const decisionsMap = {};
for (const line of decisionsRaw.split('\n')) {
  // Matches: - [[#2] Title](url): summary or - [#2 Title](url): summary or - #2: summary
  const match = line.match(/\[#(\d+)\][^:]*:\s*(.+)$/) || line.match(/#(\d+)[^:]*:\s*(.+)$/);
  if (match) {
    decisionsMap[parseInt(match[1], 10)] = match[2].trim();
  }
}

// 5. Parse Child Tickets
const childTickets = issuesData
  .filter(i => i.number !== mapIssue.number && (
    i.labels.nodes.some(l => l.name.startsWith('wayfinder:')) ||
    i.body?.includes(`Part of #${mapIssue.number}`) ||
    i.number > 1
  ))
  .sort((a, b) => a.number - b.number);

// Process each ticket's type, status, blockers, and summary
const processedTickets = childTickets.map(ticket => {
  const isClosed = ticket.state === 'CLOSED';
  const typeLabel = ticket.labels.nodes.find(l => l.name.startsWith('wayfinder:'))?.name || 'wayfinder:task';
  const type = typeLabel.replace('wayfinder:', '');

  // Check blockers from GitHub native dependencies
  const openBlockers = ticket.blockedBy.nodes.filter(b => b.state === 'OPEN');
  
  // Also check body fallback: "Blocked by: #6, #7"
  const bodyBlockersMatch = ticket.body?.match(/Blocked by:\s*([^\n]+)/i);
  if (bodyBlockersMatch) {
    const nums = bodyBlockersMatch[1].match(/#(\d+)/g) || [];
    for (const numStr of nums) {
      const bNum = parseInt(numStr.replace('#', ''), 10);
      const bIssue = issuesData.find(i => i.number === bNum);
      if (bIssue && bIssue.state === 'OPEN' && !openBlockers.some(ob => ob.number === bNum)) {
        openBlockers.push({ number: bNum, title: bIssue.title, state: bIssue.state });
      }
    }
  }

  let status = 'frontier';
  if (isClosed) {
    status = 'closed';
  } else if (openBlockers.length > 0) {
    status = 'blocked';
  }

  // Determine summary
  let summary = decisionsMap[ticket.number];
  if (!summary) {
    // Extract question or first sentence of body
    const qMatch = ticket.body?.match(/##\s*Question\s*\n+([^#\n]+)/i) || 
                   ticket.body?.match(/##\s*Task\s*\n+([^#\n]+)/i);
    if (qMatch) {
      summary = qMatch[1].trim();
    } else {
      summary = ticket.title;
    }
  }

  // Clean title for display
  let cleanTitle = ticket.title
    .replace(/^(Task|Benchmark|Design Direction & Tokens|Homepage Narrative & Scroll Architecture|Academic-to-Commercial Translation|Content Schema|Project Archive Audit & Launch Lineup|Positioning & Audience):\s*/i, '')
    .trim();

  return {
    ...ticket,
    type,
    status,
    openBlockers,
    summary,
    cleanTitle
  };
});

// Calculate statistics
const totalTickets = processedTickets.length;
const closedTickets = processedTickets.filter(t => t.status === 'closed');
const frontierTickets = processedTickets.filter(t => t.status === 'frontier');
const blockedTickets = processedTickets.filter(t => t.status === 'blocked');
const progressPercent = totalTickets > 0 ? Math.round((closedTickets.length / totalTickets) * 100) : 0;

// Helper to escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatInlineHtml(mdText) {
  if (!mdText) return '';
  return escapeHtml(mdText)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function parseMarkdownListItems(rawListMd) {
  const items = [];
  for (const line of rawListMd.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const text = trimmed.replace(/^[-*]\s*/, '').trim();
      if (text) items.push(text);
    }
  }
  return items;
}

const fogItems = parseMarkdownListItems(fogRaw);
const outOfScopeItems = parseMarkdownListItems(outOfScopeRaw);

// 6. SVG Flowchart Layout Definition
const SVG_LAYOUT = {
  2: { x: 30, y: 45, w: 140, h: 70, short: "BENCHMARKS", sub1: "3-Tier Taxonomy", sub2: "Dual-Anchor Model" },
  3: { x: 220, y: 45, w: 140, h: 70, short: "POSITIONING", sub1: "Systems & Interaction", sub2: "Design Partner" },
  9: { x: 220, y: 180, w: 140, h: 70, short: "AI MARKET", sub1: "Context Design", sub2: "Workbenches vs Chat" },
  5: { x: 410, y: 45, w: 140, h: 70, short: "ARCHIVE AUDIT", sub1: "Unified Showcase", sub2: "2-Layer Tags & Flow" },
  10: { x: 410, y: 180, w: 140, h: 70, short: "RAW DUMP", sub1: "Drop PDFs & Media", sub2: "HITL Task Ticket" },
  4: { x: 610, y: 20, w: 140, h: 60, short: "TRANSLATION", sub1: "Academic Reframe", sub2: "Commercial buyers" },
  6: { x: 610, y: 95, w: 140, h: 60, short: "CONTENT SCHEMA", sub1: "Universal 4-Part", sub2: "Case study schema" },
  7: { x: 610, y: 170, w: 140, h: 60, short: "HOMEPAGE FLOW", sub1: "Scroll Narrative", sub2: "Story beats & sections" },
  8: { x: 800, y: 160, w: 125, h: 80, short: "DESIGN TOKENS", sub1: "DESIGN.md", sub2: "Visual tokens, lines,", sub3: "WebGL & Audio" },
};

function renderSvgNode(ticket) {
  const cfg = SVG_LAYOUT[ticket.number];
  if (!cfg) return '';

  let rectFill = '#13151f';
  let rectStroke = '#64748b';
  let strokeWidth = '1.5';
  let strokeDash = '';
  let titleColor = '#94a3b8';

  if (ticket.status === 'closed') {
    rectFill = '#13231a';
    rectStroke = '#22c55e';
    strokeWidth = '1.5';
    titleColor = '#22c55e';
  } else if (ticket.status === 'frontier') {
    rectFill = '#0d1c28';
    rectStroke = '#38bdf8';
    strokeWidth = '2';
    titleColor = '#38bdf8';
  } else if (ticket.status === 'blocked') {
    rectFill = '#13151f';
    rectStroke = '#64748b';
    strokeWidth = '1.5';
    strokeDash = 'stroke-dasharray="4 2"';
    titleColor = '#94a3b8';
  }

  const sub3Text = cfg.sub3 ? `<text x="10" y="68" fill="#64748b" font-family="-apple-system, sans-serif" font-size="9">${cfg.sub3}</text>` : '';

  return `
        <!-- #${ticket.number} ${ticket.status.toUpperCase()} -->
        <g transform="translate(${cfg.x}, ${cfg.y})">
          <rect width="${cfg.w}" height="${cfg.h}" rx="8" fill="${rectFill}" stroke="${rectStroke}" stroke-width="${strokeWidth}" ${strokeDash}/>
          <text x="12" y="22" fill="${titleColor}" font-family="ui-monospace, monospace" font-size="11" font-weight="bold">#${ticket.number} ${cfg.short}</text>
          <text x="12" y="40" fill="#e2e8f0" font-family="-apple-system, sans-serif" font-size="11" font-weight="bold">${cfg.sub1}</text>
          <text x="12" y="52" fill="#8492a6" font-family="-apple-system, sans-serif" font-size="9">${cfg.sub2}</text>
          ${sub3Text}
        </g>`;
}

// Compute SVG Connecting Lines dynamically based on source node status
function getLineColor(sourceTicketNumber) {
  const source = processedTickets.find(t => t.number === sourceTicketNumber);
  if (!source) return { color: '#4e5971', marker: 'url(#arrow)' };
  if (source.status === 'closed') return { color: '#22c55e', marker: 'url(#arrow)' };
  if (source.status === 'frontier') return { color: '#38bdf8', marker: 'url(#arrow-active)' };
  return { color: '#4e5971', marker: 'url(#arrow)' };
}

const line2to3 = getLineColor(2);
const line3to9 = getLineColor(3);
const line3to5 = getLineColor(3);
const line5to10 = getLineColor(5);
const line5to4 = getLineColor(5);
const line5to6 = getLineColor(5);
const line5to7 = getLineColor(5);
const line7to8 = getLineColor(7);

// Render card
function renderTicketCard(ticket) {
  let badgeClass = 'badge-frontier';
  let badgeLabel = 'Unblocked';
  let unlockedTag = '';

  if (ticket.status === 'closed') {
    badgeClass = 'badge-closed';
    badgeLabel = 'Closed';
  } else if (ticket.status === 'blocked') {
    badgeClass = 'badge-blocked';
    const blockerNums = ticket.openBlockers.map(b => `#${b.number}`).join(', ');
    badgeLabel = `Blocked by ${blockerNums}`;
    unlockedTag = `<div class="unlocked-tag">↳ Unlocks once ${blockerNums} resolves</div>`;
  }

  return `
        <a href="${ticket.url}" target="_blank" class="card status-${ticket.status}">
          <div class="card-top">
            <span class="ticket-id">#${ticket.number} • ${ticket.type.toUpperCase()}</span>
            <span class="ticket-badge ${badgeClass}">${badgeLabel}</span>
          </div>
          <div class="ticket-title">${escapeHtml(ticket.cleanTitle)}</div>
          <div class="ticket-summary">${formatInlineHtml(ticket.summary)}</div>
          ${unlockedTag}
        </a>`;
}

// 7. Assemble Full HTML
const generatedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wayfinder Map — ${escapeHtml(mapIssue.title)}</title>
  <style>
    :root {
      --bg: #090a0f;
      --surface: #11131c;
      --surface-border: #1e2235;
      --surface-hover: #171a28;
      --text: #e2e8f0;
      --text-muted: #8492a6;
      --text-dim: #4e5971;
      --accent: #38bdf8;
      --accent-glow: rgba(56, 189, 248, 0.15);
      --success: #22c55e;
      --success-bg: rgba(34, 197, 94, 0.12);
      --success-border: rgba(34, 197, 94, 0.3);
      --frontier: #38bdf8;
      --frontier-bg: rgba(56, 189, 248, 0.1);
      --frontier-border: rgba(56, 189, 248, 0.35);
      --blocked: #64748b;
      --blocked-bg: rgba(100, 116, 139, 0.08);
      --blocked-border: rgba(100, 116, 139, 0.25);
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      line-height: 1.5;
      padding: 40px 24px;
      min-height: 100vh;
    }

    .container {
      max-width: 1100px;
      margin: 0 auto;
    }

    /* Header */
    header {
      margin-bottom: 40px;
      border-bottom: 1px solid var(--surface-border);
      padding-bottom: 28px;
    }

    .badge-map {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(99, 102, 241, 0.12);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.3);
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 9999px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    h1 {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
      color: #ffffff;
    }

    .destination-box {
      background: linear-gradient(180deg, #131726 0%, #0d101a 100%);
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: 12px;
      padding: 20px 24px;
      margin-top: 20px;
    }

    .destination-label {
      font-family: var(--font-mono);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #818cf8;
      margin-bottom: 6px;
    }

    .destination-text {
      font-size: 16px;
      color: #cbd5e1;
      font-weight: 400;
    }

    /* Progress bar */
    .progress-section {
      margin: 32px 0 40px 0;
    }

    .progress-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 10px;
    }

    .progress-track {
      height: 8px;
      background: var(--surface-border);
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-fill {
      width: ${progressPercent}%;
      height: 100%;
      background: linear-gradient(90deg, #22c55e 0%, #38bdf8 100%);
      border-radius: 9999px;
      transition: width 0.3s ease;
    }

    /* Flow Chart / Visual Pipeline */
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #f8fafc;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .flowchart-wrapper {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 14px;
      padding: 28px;
      margin-bottom: 40px;
      overflow-x: auto;
    }

    svg.chart {
      width: 100%;
      min-width: 800px;
      height: auto;
      display: block;
    }

    /* Grid of tickets */
    .tickets-columns {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }

    .column {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--surface-border);
    }

    .column-title {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .column-count {
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
    }

    .col-closed .column-title { color: var(--success); }
    .col-frontier .column-title { color: var(--frontier); }
    .col-blocked .column-title { color: var(--blocked); }

    /* Card */
    .card {
      background: #0d0f17;
      border: 1px solid var(--surface-border);
      border-radius: 10px;
      padding: 16px;
      transition: all 0.2s ease;
      text-decoration: none;
      color: inherit;
      display: block;
    }

    .card:hover {
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    }

    .card.status-closed {
      border-left: 3px solid var(--success);
    }

    .card.status-frontier {
      border-left: 3px solid var(--frontier);
      background: linear-gradient(180deg, rgba(56, 189, 248, 0.04) 0%, #0d0f17 100%);
    }

    .card.status-blocked {
      border-left: 3px solid var(--blocked);
      opacity: 0.75;
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 8px;
    }

    .ticket-id {
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 600;
      color: var(--text-dim);
    }

    .card:hover .ticket-id {
      color: var(--accent);
    }

    .ticket-badge {
      font-family: var(--font-mono);
      font-size: 10px;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 4px;
      letter-spacing: 0.04em;
    }

    .badge-closed {
      background: var(--success-bg);
      color: var(--success);
      border: 1px solid var(--success-border);
    }

    .badge-frontier {
      background: var(--frontier-bg);
      color: var(--frontier);
      border: 1px solid var(--frontier-border);
    }

    .badge-blocked {
      background: var(--blocked-bg);
      color: #94a3b8;
      border: 1px solid var(--blocked-border);
    }

    .ticket-title {
      font-size: 14px;
      font-weight: 600;
      color: #f1f5f9;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .ticket-summary {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .unlocked-tag {
      margin-top: 10px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-family: var(--font-mono);
      font-size: 11px;
      color: #a5b4fc;
    }

    /* Fog and Out of scope */
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .meta-box {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 12px;
      padding: 20px 24px;
    }

    .meta-box h3 {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .meta-box.fog h3 { color: #f59e0b; }
    .meta-box.out h3 { color: #ef4444; }

    .meta-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .meta-list li {
      font-size: 13px;
      color: var(--text-muted);
      position: relative;
      padding-left: 18px;
    }

    .meta-list li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: var(--text-dim);
    }

    .meta-list strong {
      color: #e2e8f0;
    }

    footer {
      margin-top: 60px;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--text-dim);
      border-top: 1px solid var(--surface-border);
      padding-top: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="badge-map">🗺️ Wayfinder Map • ${repoOwner}/${repoName}#${mapIssue.number}</div>
      <h1>Portfolio Redesign — Decision Map</h1>
      
      <div class="destination-box">
        <div class="destination-label">Destination</div>
        <div class="destination-text">
          ${escapeHtml(destinationText)}
        </div>
      </div>
    </header>

    <!-- Progress Tracker -->
    <div class="progress-section">
      <div class="progress-meta">
        <span>Map Progress (Decisions Settled)</span>
        <span>${closedTickets.length} of ${totalTickets} Tickets Closed (${progressPercent}%)</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill"></div>
      </div>
    </div>

    <!-- Visual Dependency Pipeline -->
    <div class="section-title">
      <span>Pipeline & Dependency Graph</span>
    </div>
    
    <div class="flowchart-wrapper">
      <svg class="chart" viewBox="0 0 940 380" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#4e5971" />
          </marker>
          <marker id="arrow-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#38bdf8" />
          </marker>
        </defs>

        <!-- Connecting Lines -->
        <!-- #2 -> #3 -->
        <path d="M 170 80 L 220 80" stroke="${line2to3.color}" stroke-width="2" marker-end="${line2to3.marker}" />
        <!-- #3 -> #9 -->
        <path d="M 290 120 L 290 180" stroke="${line3to9.color}" stroke-width="2" marker-end="${line3to9.marker}" />
        <!-- #3 -> #5 -->
        <path d="M 360 80 L 410 80" stroke="${line3to5.color}" stroke-width="2" marker-end="${line3to5.marker}" />
        <!-- #5 -> #10 -->
        <path d="M 480 120 L 480 180" stroke="${line5to10.color}" stroke-width="2" marker-end="${line5to10.marker}" />
        <!-- #5 -> #4 -->
        <path d="M 550 65 L 610 50" stroke="${line5to4.color}" stroke-width="2" marker-end="${line5to4.marker}" />
        <!-- #5 -> #6 -->
        <path d="M 550 80 L 610 110" stroke="${line5to6.color}" stroke-width="2" marker-end="${line5to6.marker}" />
        <!-- #5 -> #7 -->
        <path d="M 550 95 L 610 170" stroke="${line5to7.color}" stroke-width="2" marker-end="${line5to7.marker}" />
        <!-- #6 -> #7 -->
        <path d="M 680 140 L 680 150" stroke="#4e5971" stroke-width="1.5" stroke-dasharray="3 3" />
        <!-- #7 -> #8 -->
        <path d="M 750 190 L 800 190" stroke="${line7to8.color}" stroke-width="2" marker-end="${line7to8.marker}" />

        <!-- Nodes -->
        ${processedTickets.map(renderSvgNode).join('')}

        <!-- Final Spec Target -->
        <g transform="translate(800, 45)">
          <rect width="125" height="70" rx="8" fill="#1e1838" stroke="#a855f7" stroke-width="1.5"/>
          <text x="10" y="22" fill="#c084fc" font-family="ui-monospace, monospace" font-size="10" font-weight="bold">DESTINATION</text>
          <text x="10" y="42" fill="#f3e8ff" font-family="-apple-system, sans-serif" font-size="11" font-weight="bold">Locked Spec</text>
          <text x="10" y="58" fill="#c084fc" font-family="-apple-system, sans-serif" font-size="9">Ready to Build</text>
        </g>
      </svg>
    </div>

    <!-- Ticket Cards by State -->
    <div class="tickets-columns">
      
      <!-- Closed Column -->
      <div class="column col-closed">
        <div class="column-header">
          <span class="column-title">✅ Decisions Locked</span>
          <span class="column-count">${closedTickets.length}</span>
        </div>
        ${closedTickets.map(renderTicketCard).join('')}
      </div>

      <!-- Frontier Column -->
      <div class="column col-frontier">
        <div class="column-header">
          <span class="column-title">⚡ Active Frontier</span>
          <span class="column-count">${frontierTickets.length}</span>
        </div>
        ${frontierTickets.map(renderTicketCard).join('')}
      </div>

      <!-- Blocked Column -->
      <div class="column col-blocked">
        <div class="column-header">
          <span class="column-title">⏳ Blocked / Downstream</span>
          <span class="column-count">${blockedTickets.length}</span>
        </div>
        ${blockedTickets.map(renderTicketCard).join('')}
      </div>

    </div>

    <!-- Fog of War and Out of Scope -->
    <div class="meta-grid">
      <div class="meta-box fog">
        <h3>🌫️ Not Yet Specified (Fog of War)</h3>
        <ul class="meta-list">
          ${fogItems.map(item => `<li>${formatInlineHtml(item)}</li>`).join('\n          ')}
        </ul>
      </div>

      <div class="meta-box out">
        <h3>🚫 Out of Scope</h3>
        <ul class="meta-list">
          ${outOfScopeItems.map(item => `<li>${formatInlineHtml(item)}</li>`).join('\n          ')}
        </ul>
      </div>
    </div>

    <footer>
      Wayfinder Map • Project: ${escapeHtml(repoOwner)}/${escapeHtml(repoName)} • Synced automatically on ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC
    </footer>
  </div>
</body>
</html>
`;

// 8. Write to file
writeFileSync(OUTPUT_HTML_PATH, generatedHtml, 'utf8');

console.log(`✅ Successfully generated ${OUTPUT_HTML_PATH}`);
console.log(`📊 Stats: ${closedTickets.length} closed, ${frontierTickets.length} frontier, ${blockedTickets.length} blocked (${progressPercent}%)`);
