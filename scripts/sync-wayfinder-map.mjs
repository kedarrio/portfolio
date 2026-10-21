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
 *   ./scripts/sync-wayfinder-map.mjs --open
 */

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');
const OUTPUT_HTML_PATH = resolve(ROOT_DIR, 'docs', 'wayfinder-map.html');
const RELATIVE_HTML_PATH = relative(process.cwd(), OUTPUT_HTML_PATH) || 'docs/wayfinder-map.html';

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
  console.error('Detecting repository via git remote fallback...');
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

const processedTickets = childTickets.map(ticket => {
  const isClosed = ticket.state === 'CLOSED';
  const typeLabel = ticket.labels.nodes.find(l => l.name.startsWith('wayfinder:'))?.name || 'wayfinder:task';
  const type = typeLabel.replace('wayfinder:', '');

  const openBlockers = ticket.blockedBy.nodes.filter(b => b.state === 'OPEN');
  
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

  let summary = decisionsMap[ticket.number];
  if (!summary) {
    const qMatch = ticket.body?.match(/##\s*Question\s*\n+([^#\n]+)/i) || 
                   ticket.body?.match(/##\s*Task\s*\n+([^#\n]+)/i);
    if (qMatch) {
      summary = qMatch[1].trim();
    } else {
      summary = ticket.title;
    }
  }

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

const totalTickets = processedTickets.length;
const closedTickets = processedTickets.filter(t => t.status === 'closed');
const frontierTickets = processedTickets.filter(t => t.status === 'frontier');
const blockedTickets = processedTickets.filter(t => t.status === 'blocked');
const progressPercent = totalTickets > 0 ? Math.round((closedTickets.length / totalTickets) * 100) : 0;

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

// 6. SVG Flowchart Layout Definition (Light Architectural Mode)
const SVG_LAYOUT = {
  2: { x: 30, y: 45, w: 140, h: 72, short: "BENCHMARKS", sub1: "3-Tier Taxonomy", sub2: "Dual-Anchor Model" },
  3: { x: 220, y: 45, w: 140, h: 72, short: "POSITIONING", sub1: "Systems & Interaction", sub2: "Design Partner" },
  9: { x: 220, y: 180, w: 140, h: 72, short: "AI MARKET", sub1: "Context Design", sub2: "Workbenches vs Chat" },
  5: { x: 410, y: 45, w: 140, h: 72, short: "ARCHIVE AUDIT", sub1: "Unified Showcase", sub2: "2-Layer Tags & Flow" },
  10: { x: 410, y: 180, w: 140, h: 72, short: "RAW DUMP", sub1: "Drop PDFs & Media", sub2: "HITL Task Ticket" },
  4: { x: 610, y: 20, w: 140, h: 64, short: "TRANSLATION", sub1: "Academic Reframe", sub2: "Applied R&D Stance" },
  6: { x: 610, y: 98, w: 140, h: 64, short: "CONTENT SCHEMA", sub1: "Universal 4-Part", sub2: "Content data model" },
  7: { x: 610, y: 176, w: 140, h: 64, short: "HOMEPAGE FLOW", sub1: "Scroll Narrative", sub2: "Section architecture" },
  8: { x: 800, y: 164, w: 125, h: 84, short: "DESIGN TOKENS", sub1: "DESIGN.md", sub2: "Visual tokens, lines,", sub3: "WebGL & Audio" },
};

function renderSvgNode(ticket) {
  const cfg = SVG_LAYOUT[ticket.number];
  if (!cfg) return '';

  let rectFill = '#ffffff';
  let rectStroke = '#e2e8f0';
  let strokeWidth = '1';
  let strokeDash = '';
  let badgeColor = '#64748b';
  let badgeBg = '#f1f5f9';

  if (ticket.status === 'closed') {
    rectFill = '#ffffff';
    rectStroke = '#16a34a';
    strokeWidth = '1.5';
    badgeColor = '#15803d';
    badgeBg = '#f0fdf4';
  } else if (ticket.status === 'frontier') {
    rectFill = '#ffffff';
    rectStroke = '#2563eb';
    strokeWidth = '2';
    badgeColor = '#1d4ed8';
    badgeBg = '#eff6ff';
  } else if (ticket.status === 'blocked') {
    rectFill = '#fafafa';
    rectStroke = '#cbd5e1';
    strokeWidth = '1';
    strokeDash = 'stroke-dasharray="4 3"';
    badgeColor = '#64748b';
    badgeBg = '#f1f5f9';
  }

  const sub3Text = cfg.sub3 ? `<text x="12" y="70" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="9">${cfg.sub3}</text>` : '';

  return `
        <!-- #${ticket.number} ${ticket.status.toUpperCase()} -->
        <g transform="translate(${cfg.x}, ${cfg.y})">
          <rect width="${cfg.w}" height="${cfg.h}" rx="6" fill="${rectFill}" stroke="${rectStroke}" stroke-width="${strokeWidth}" ${strokeDash}/>
          <rect x="1" y="1" width="${cfg.w - 2}" height="20" rx="5" fill="${badgeBg}"/>
          <text x="10" y="14" fill="${badgeColor}" font-family="ui-monospace, monospace" font-size="10" font-weight="700" letter-spacing="0.04em">#${ticket.number} // ${cfg.short}</text>
          <text x="12" y="38" fill="#0f172a" font-family="-apple-system, sans-serif" font-size="11" font-weight="600">${cfg.sub1}</text>
          <text x="12" y="52" fill="#64748b" font-family="-apple-system, sans-serif" font-size="10">${cfg.sub2}</text>
          ${sub3Text}
        </g>`;
}

function getLineStyle(sourceTicketNumber) {
  const source = processedTickets.find(t => t.number === sourceTicketNumber);
  if (!source) return { color: '#cbd5e1', marker: 'url(#arrow)' };
  if (source.status === 'closed') return { color: '#16a34a', marker: 'url(#arrow-closed)' };
  if (source.status === 'frontier') return { color: '#2563eb', marker: 'url(#arrow-active)' };
  return { color: '#cbd5e1', marker: 'url(#arrow)' };
}

const line2to3 = getLineStyle(2);
const line3to9 = getLineStyle(3);
const line3to5 = getLineStyle(3);
const line5to10 = getLineStyle(5);
const line5to4 = getLineStyle(5);
const line5to6 = getLineStyle(5);
const line5to7 = getLineStyle(5);
const line7to8 = getLineStyle(7);

function renderTicketCard(ticket) {
  let badgeClass = 'badge-frontier';
  let badgeText = 'FRONTIER';
  let unlockedTag = '';

  if (ticket.status === 'closed') {
    badgeClass = 'badge-closed';
    badgeText = 'DECIDED';
  } else if (ticket.status === 'blocked') {
    badgeClass = 'badge-blocked';
    const blockerNums = ticket.openBlockers.map(b => `#${b.number}`).join(', ');
    badgeText = `BLOCKED`;
    unlockedTag = `<div class="unlocked-tag">↳ Unlocks when ${blockerNums} resolves</div>`;
  }

  return `
        <a href="${ticket.url}" target="_blank" class="card status-${ticket.status}">
          <div class="card-meta-row">
            <span class="ticket-id">#${String(ticket.number).padStart(2, '0')} // ${ticket.type.toUpperCase()}</span>
            <span class="ticket-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="ticket-title">${escapeHtml(ticket.cleanTitle)}</div>
          <div class="ticket-summary">${formatInlineHtml(ticket.summary)}</div>
          ${unlockedTag}
        </a>`;
}

// 7. Light Mode High-Craft HTML Template
const generatedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wayfinder Map — ${escapeHtml(mapIssue.title)}</title>
  <style>
    :root {
      --bg: #f8fafc;
      --surface: #ffffff;
      --surface-border: #e2e8f0;
      --surface-border-subtle: #edf2f7;
      --text: #0f172a;
      --text-muted: #475569;
      --text-dim: #94a3b8;
      
      --accent: #0f172a;
      --accent-blue: #2563eb;
      
      --success: #15803d;
      --success-bg: #f0fdf4;
      --success-border: #bbf7d0;

      --frontier: #1d4ed8;
      --frontier-bg: #eff6ff;
      --frontier-border: #bfdbfe;

      --blocked: #64748b;
      --blocked-bg: #f8fafc;
      --blocked-border: #e2e8f0;

      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
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
      padding: 48px 24px;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 1120px;
      margin: 0 auto;
    }

    /* Masthead */
    header {
      margin-bottom: 32px;
      border-bottom: 1px solid var(--surface-border);
      padding-bottom: 24px;
    }

    .subhead {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      color: var(--text-dim);
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: #09090b;
      margin-bottom: 16px;
    }

    .destination-panel {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-left: 3px solid #0f172a;
      border-radius: 6px;
      padding: 16px 20px;
      margin-top: 16px;
    }

    .destination-label {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      margin-bottom: 4px;
    }

    .destination-body {
      font-size: 14px;
      color: var(--text-muted);
      line-height: 1.6;
    }

    /* Minimalist Progress Meter */
    .progress-section {
      margin: 28px 0 36px 0;
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 6px;
      padding: 14px 18px;
    }

    .progress-meta {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 8px;
    }

    .progress-meta strong {
      color: var(--text);
    }

    .progress-track {
      height: 6px;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-fill {
      width: ${progressPercent}%;
      height: 100%;
      background: #0f172a;
      border-radius: 9999px;
      transition: width 0.3s ease;
    }

    /* Flowchart Canvas */
    .section-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .flowchart-wrapper {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 36px;
      overflow-x: auto;
    }

    svg.chart {
      width: 100%;
      min-width: 860px;
      height: auto;
      display: block;
    }

    /* 3-Column Ticket Matrix */
    .tickets-columns {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .column {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--surface-border);
    }

    .column-title {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
    }

    .column-count {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      background: #f1f5f9;
      color: #475569;
    }

    /* Cards */
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 14px 16px;
      text-decoration: none;
      color: inherit;
      display: block;
      transition: all 0.15s ease-in-out;
    }

    .card:hover {
      border-color: #0f172a;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      transform: translateY(-1px);
    }

    .card.status-closed {
      border-left: 3px solid var(--success);
    }

    .card.status-frontier {
      border-left: 3px solid var(--frontier);
      background: #fafcff;
    }

    .card.status-blocked {
      border-left: 3px solid #cbd5e1;
      opacity: 0.85;
    }

    .card-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 6px;
    }

    .ticket-id {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      color: var(--text-dim);
    }

    .ticket-badge {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
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
      color: var(--blocked);
      border: 1px solid var(--blocked-border);
    }

    .ticket-title {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
      line-height: 1.4;
      margin-bottom: 6px;
    }

    .ticket-summary {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .ticket-summary code {
      font-family: var(--font-mono);
      font-size: 11px;
      background: #f1f5f9;
      padding: 1px 4px;
      border-radius: 3px;
      border: 1px solid #e2e8f0;
    }

    .unlocked-tag {
      margin-top: 8px;
      font-family: var(--font-mono);
      font-size: 11px;
      color: #6366f1;
    }

    /* Fog and Out of Scope Ledger */
    .ledger-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 20px;
    }

    .ledger-panel {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      padding: 18px 20px;
    }

    .ledger-panel h3 {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 12px;
    }

    .ledger-panel.fog h3 { color: #d97706; }
    .ledger-panel.out h3 { color: #dc2626; }

    .ledger-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .ledger-list li {
      font-size: 13px;
      color: var(--text-muted);
      position: relative;
      padding-left: 16px;
      line-height: 1.5;
    }

    .ledger-list li::before {
      content: "—";
      position: absolute;
      left: 0;
      color: var(--text-dim);
    }

    .ledger-list strong {
      color: var(--text);
    }

    footer {
      margin-top: 48px;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--text-dim);
      border-top: 1px solid var(--surface-border);
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="subhead">WAYFINDER SPECIFICATION MAP // ${escapeHtml(repoOwner)}/${escapeHtml(repoName)}#${mapIssue.number}</div>
      <h1>Portfolio Redesign — Decision Map</h1>
      
      <div class="destination-panel">
        <div class="destination-label">Target Destination</div>
        <div class="destination-body">
          ${escapeHtml(destinationText)}
        </div>
      </div>
    </header>

    <!-- Progress Meter -->
    <div class="progress-section">
      <div class="progress-meta">
        <span><strong>STATUS:</strong> ${closedTickets.length} of ${totalTickets} Decisions Locked</span>
        <span><strong>${progressPercent}%</strong> COMPLETE</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill"></div>
      </div>
    </div>

    <!-- Visual Circuit / Dependency Graph -->
    <div class="section-title">
      <span>Pipeline &amp; Frontier Graph</span>
    </div>
    
    <div class="flowchart-wrapper">
      <svg class="chart" viewBox="0 0 940 380" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#94a3b8" />
          </marker>
          <marker id="arrow-closed" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#16a34a" />
          </marker>
          <marker id="arrow-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#2563eb" />
          </marker>
        </defs>

        <!-- Connecting Lines -->
        <path d="M 170 81 L 220 81" stroke="${line2to3.color}" stroke-width="1.5" marker-end="${line2to3.marker}" />
        <path d="M 290 117 L 290 180" stroke="${line3to9.color}" stroke-width="1.5" marker-end="${line3to9.marker}" />
        <path d="M 360 81 L 410 81" stroke="${line3to5.color}" stroke-width="1.5" marker-end="${line3to5.marker}" />
        <path d="M 480 117 L 480 180" stroke="${line5to10.color}" stroke-width="1.5" marker-end="${line5to10.marker}" />
        <path d="M 550 65 L 610 52" stroke="${line5to4.color}" stroke-width="1.5" marker-end="${line5to4.marker}" />
        <path d="M 550 81 L 610 120" stroke="${line5to6.color}" stroke-width="1.5" marker-end="${line5to6.marker}" />
        <path d="M 550 97 L 610 185" stroke="${line5to7.color}" stroke-width="1.5" marker-end="${line5to7.marker}" />
        <path d="M 680 162 L 680 176" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="3 3" />
        <path d="M 750 205 L 800 205" stroke="${line7to8.color}" stroke-width="1.5" marker-end="${line7to8.marker}" />

        <!-- Nodes -->
        ${processedTickets.map(renderSvgNode).join('')}

        <!-- Final Destination Target -->
        <g transform="translate(800, 45)">
          <rect width="125" height="72" rx="6" fill="#ffffff" stroke="#7e22ce" stroke-width="1.5"/>
          <rect x="1" y="1" width="123" height="20" rx="5" fill="#faf5ff"/>
          <text x="10" y="14" fill="#7e22ce" font-family="ui-monospace, monospace" font-size="10" font-weight="700">SPEC // DESTINATION</text>
          <text x="12" y="38" fill="#0f172a" font-family="-apple-system, sans-serif" font-size="11" font-weight="600">Locked Blueprint</text>
          <text x="12" y="52" fill="#7e22ce" font-family="-apple-system, sans-serif" font-size="10">Ready to Build</text>
        </g>
      </svg>
    </div>

    <!-- 3-Column Ticket Matrix -->
    <div class="tickets-columns">
      
      <!-- Closed Column -->
      <div class="column col-closed">
        <div class="column-header">
          <span class="column-title">Decisions Locked</span>
          <span class="column-count">${closedTickets.length}</span>
        </div>
        ${closedTickets.map(renderTicketCard).join('')}
      </div>

      <!-- Frontier Column -->
      <div class="column col-frontier">
        <div class="column-header">
          <span class="column-title">Active Frontier</span>
          <span class="column-count">${frontierTickets.length}</span>
        </div>
        ${frontierTickets.map(renderTicketCard).join('')}
      </div>

      <!-- Blocked Column -->
      <div class="column col-blocked">
        <div class="column-header">
          <span class="column-title">Blocked / Dependent</span>
          <span class="column-count">${blockedTickets.length}</span>
        </div>
        ${blockedTickets.map(renderTicketCard).join('')}
      </div>

    </div>

    <!-- Fog of War and Out of Scope Ledger -->
    <div class="ledger-grid">
      <div class="ledger-panel fog">
        <h3>Not Yet Specified (In-Scope Fog)</h3>
        <ul class="ledger-list">
          ${fogItems.map(item => `<li>${formatInlineHtml(item)}</li>`).join('\n          ')}
        </ul>
      </div>

      <div class="ledger-panel out">
        <h3>Out of Scope (Ruled Out)</h3>
        <ul class="ledger-list">
          ${outOfScopeItems.map(item => `<li>${formatInlineHtml(item)}</li>`).join('\n          ')}
        </ul>
      </div>
    </div>

    <footer>
      WAYFINDER MAP // REPO: ${escapeHtml(repoOwner)}/${escapeHtml(repoName)} // SYNCED: ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC
    </footer>
  </div>
</body>
</html>
`;

// 8. Write to file
writeFileSync(OUTPUT_HTML_PATH, generatedHtml, 'utf8');

console.log(`✅ Successfully updated ${RELATIVE_HTML_PATH}`);
console.log(`📊 Stats: ${closedTickets.length} closed, ${frontierTickets.length} frontier, ${blockedTickets.length} blocked (${progressPercent}%)`);

// 9. Interactive Prompt to open in browser
async function handleBrowserOpen() {
  if (process.argv.includes('--open')) {
    try {
      execSync(`open "${OUTPUT_HTML_PATH}"`);
      console.log(`🌐 Opened ${RELATIVE_HTML_PATH} in browser.`);
    } catch (_) {}
    return;
  }

  if (process.stdout.isTTY && !process.argv.includes('--no-open')) {
    const readline = await import('node:readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`\n👉 Open ${RELATIVE_HTML_PATH} in browser? (Y/n): `, (answer) => {
      rl.close();
      const trimmed = answer.trim().toLowerCase();
      if (trimmed === '' || trimmed === 'y' || trimmed === 'yes') {
        try {
          execSync(`open "${OUTPUT_HTML_PATH}"`);
          console.log(`🌐 Opened ${RELATIVE_HTML_PATH} in browser.`);
        } catch (err) {
          console.error(`Could not open browser: ${err.message}`);
        }
      }
    });
  }
}

await handleBrowserOpen();
