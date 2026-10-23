#!/usr/bin/env bun
// Usage: bun scripts/build-dossier.ts <dossier-data.json> [output.html] [--title 'Title']
//
// Generates the "Inside pstack" editorial SPA from a structured JSON dossier.
// Required sections: orientation, pipeline, anatomy, explorer, principles, table.
//
import * as fs from 'node:fs';
import * as path from 'node:path';

// ============================================================================
// CLI
// ============================================================================
const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(
    "Usage: bun scripts/build-dossier.ts <dossier-data.json> [output.html] [--title 'Title']",
  );
  process.exit(0);
}

const inputPath = path.resolve(args[0]);
const outputPath =
  args[1] && !args[1].startsWith('--') ? path.resolve(args[1]) : path.resolve('dossier.html');

let customTitle = '';
const titleIdx = args.indexOf('--title');
if (titleIdx !== -1 && args[titleIdx + 1]) {
  customTitle = args[titleIdx + 1];
}

if (!fs.existsSync(inputPath)) {
  console.error(`Error: Input file does not exist: ${inputPath}`);
  process.exit(1);
}

if (!inputPath.endsWith('.json')) {
  console.error(
    'Error: build-dossier.ts now requires a structured JSON dossier. See code-dossier skill for the required schema.',
  );
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
if (customTitle) data.title = customTitle;

// ============================================================================
// 1. DETERMINISTIC SCHEMA GATE
// ============================================================================
const errors: string[] = [];
if (!data.meta || !data.title || !data.thesisQuote || !data.summary) {
  errors.push("Top-level 'meta', 'title', 'thesisQuote', and 'summary' are required.");
}
if (!Array.isArray(data.stats) || data.stats.length < 4) {
  errors.push("'stats' must be an array of at least 4 quantitative metrics ({ value, label }).");
}
if (!Array.isArray(data.sections) || data.sections.length < 5) {
  errors.push("'sections' must contain at least 5 structured visual blocks.");
} else {
  const types = new Set(data.sections.map((s: any) => s.type));
  for (const req of ['orientation', 'pipeline', 'anatomy', 'explorer', 'principles', 'table']) {
    if (!types.has(req)) {
      errors.push(
        `Missing required block type '${req}' in sections[]. Every dossier must include: orientation, pipeline, anatomy, explorer, principles, and table.`,
      );
    }
  }
  for (const sec of data.sections) {
    if (sec.type === 'explorer') {
      if (!Array.isArray(sec.items) || sec.items.length < 4) {
        errors.push(`Explorer section '${sec.title}' must contain at least 4 detailed items.`);
      }
      for (const item of sec.items || []) {
        if (!item.tryIt || !item.howItWorks?.length || !item.quotes?.length || !item.designLesson) {
          errors.push(
            `Explorer item '${item.name}' is missing required deep-dive fields (tryIt, howItWorks[], quotes[], designLesson).`,
          );
        }
      }
    }
  }
}

if (errors.length > 0) {
  console.error(
    '❌ DOSSIER SCHEMA VALIDATION FAILED — DO NOT WRITE FLAT MARKDOWN:\n' +
      errors.map((e) => '  - ' + e).join('\n'),
  );
  process.exit(1);
}

// ============================================================================
// 2. RENDERERS
// ============================================================================
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const badgeCode = (s = '') => esc(s).replace(/\[([0-9A-Z]+)\]/g, '<span class="code-badge">$1</span>');
const inlineCode = (s = '') => esc(s).replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

const explorersData: Record<number, any[]> = {};
const principlesData: Record<number, any[]> = {};

function renderSection(sec: any, idx: number): string {
  const secId = sec.id || `sec-${idx}`;
  const head = `
    <section id="${esc(secId)}" class="doc-section">
      <div class="kicker">${esc(sec.kicker)}</div>
      <h2>${esc(sec.title)}</h2>
      ${sec.intro ? `<p class="sec-intro">${inlineCode(sec.intro)}</p>` : ''}
  `;

  let body = '';
  switch (sec.type) {
    case 'orientation':
    case 'cards':
      body = `<div class="cards-grid cols-${sec.columns || 3}">
        ${(sec.items || [])
          .map(
            (c: any, i: number) => `
          <div class="surface-card">
            <div class="card-top">
              <span class="card-kicker">${esc(c.tag || `0${i + 1}`)}</span>
              ${c.badge ? `<span class="meta-pill">${esc(c.badge)}</span>` : ''}
            </div>
            <h3>${esc(c.title)}</h3>
            <p>${inlineCode(c.body)}</p>
            ${c.corollary ? `<div class="corollary">"${esc(c.corollary)}"</div>` : ''}
          </div>
        `,
          )
          .join('')}
      </div>`;
      break;

    case 'pipeline':
      body = `<div class="pipeline-track">
        ${(sec.stages || [])
          .map(
            (st: any, i: number) => `
          <div class="pipeline-stage">
            <div class="stage-header">
              <span class="stage-index">${i + 1}</span>
              <span class="stage-name">${esc(st.name)}</span>
            </div>
            <div class="stage-subtitle">${esc(st.subtitle || '')}</div>
            <div class="stage-chips">
              ${(st.nodes || [])
                .map(
                  (n: any) => `
                <div class="stage-chip ${esc(n.relation || 'direct')}">
                  <div class="chip-title">
                    <code>${esc(n.label)}</code>
                    ${n.relation ? `<span class="chip-rel">${esc(n.relation)}</span>` : ''}
                  </div>
                  <div class="chip-desc">${inlineCode(n.detail)}</div>
                </div>
              `,
                )
                .join('')}
            </div>
          </div>
          ${i < (sec.stages?.length || 0) - 1 ? `<div class="pipeline-arrow">→</div>` : ''}
        `,
          )
          .join('')}
      </div>`;
      break;

    case 'anatomy':
      body = `<div class="anatomy-grid">
        <div class="anatomy-code-wrap">
          ${sec.filename ? `<div class="code-header"><span>${esc(sec.filename)}</span><span>${esc(sec.lang || 'TS / MD')}</span></div>` : ''}
          <pre class="code-block"><code>${badgeCode(sec.code)}</code></pre>
        </div>
        <div class="anatomy-notes">
          ${(sec.annotations || [])
            .map(
              (a: any) => `
            <div class="callout-card">
              <span class="code-badge">${esc(a.id)}</span>
              <div class="callout-body">
                <strong>${esc(a.title)}</strong>
                <p>${inlineCode(a.body)}</p>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>`;
      break;

    case 'explorer':
      explorersData[idx] = sec.items || [];
      body = `
        <div class="explorer-toolbar">
          <input type="text" class="search-input" placeholder="Search ${(sec.items || []).length} ${esc((sec.kicker || 'items').toLowerCase())}..." oninput="filterExplorer(${idx}, this.value, null)" />
          <div class="filter-pills" id="exp-tabs-${idx}"></div>
        </div>
        <div class="explorer-split">
          <div class="explorer-list" id="exp-list-${idx}"></div>
          <div class="explorer-detail" id="exp-detail-${idx}"></div>
        </div>
      `;
      break;

    case 'principles':
      principlesData[idx] = sec.items || [];
      body = `
        <div class="filter-pills" id="prin-tabs-${idx}" style="margin-bottom:1.25rem"></div>
        <div class="cards-grid cols-2" id="prin-grid-${idx}"></div>
      `;
      break;

    case 'table':
      body = `<div class="table-wrap">
        <table>
          <thead><tr>${(sec.columns || []).map((c: string) => `<th>${esc(c)}</th>`).join('')}</tr></thead>
          <tbody>
            ${(sec.rows || [])
              .map(
                (r: string[]) => `
              <tr>${r.map((cell, ci) => `<td>${ci === 0 ? `<code class="inline-code">${esc(cell)}</code>` : inlineCode(cell)}</td>`).join('')}</tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      </div>`;
      break;
  }

  return `${head}${body}</section>`;
}

// ============================================================================
// 3. HTML TEMPLATE
// ============================================================================
export function generateHtmlSpa(data: any): string {
  const sectionHtml = (data.sections || [])
    .map((sec: any, idx: number) => renderSection(sec, idx))
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(data.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root, :root[data-theme="dark"] {
    --bg: #0c0c0f;
    --bg-sidebar: #09090b;
    --surface: #131318;
    --surface-2: #1a1a22;
    --border: #262630;
    --border-subtle: #1d1d26;
    --text: #ececef;
    --text-muted: #8e8ea0;
    --accent: #f472b6;
    --accent-soft: rgba(244, 114, 182, 0.12);
    --amber: #f59e0b;
    --cyan: #38bdf8;
    --green: #34d399;
    --serif: 'Instrument Serif', Georgia, 'Times New Roman', serif;
    --sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
  }
  :root[data-theme="light"] {
    --bg: #faf9f6;
    --bg-sidebar: #f3f1ec;
    --surface: #ffffff;
    --surface-2: #f4f2ed;
    --border: #e2dfd7;
    --border-subtle: #ebe8e0;
    --text: #16161a;
    --text-muted: #646470;
    --accent: #db2777;
    --accent-soft: rgba(219, 39, 119, 0.1);
    --amber: #d97706;
    --cyan: #0284c7;
    --green: #059669;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: var(--sans);
    font-size: 15px;
    line-height: 1.65;
    display: grid;
    grid-template-columns: 230px 1fr;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }
  @media (max-width: 960px) {
    body { grid-template-columns: 1fr; }
    aside.sidebar { display: none; }
  }

  /* SIDEBAR */
  aside.sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border-subtle);
    padding: 2rem 1.1rem 1.5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow-y: auto;
  }
  .brand-label {
    font-family: var(--mono);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-muted);
    padding: 0 0.6rem;
    margin-bottom: 1rem;
  }
  .nav-links { display: flex; flex-direction: column; gap: 2px; }
  .nav-links a {
    color: var(--text-muted);
    text-decoration: none;
    font-size: 0.82rem;
    padding: 0.36rem 0.65rem;
    border-left: 2px solid transparent;
    border-radius: 0 4px 4px 0;
    transition: all 0.15s ease;
  }
  .nav-links a:hover { color: var(--text); background: var(--surface); }
  .nav-links a.active {
    color: var(--text);
    font-weight: 500;
    border-left-color: var(--amber);
    background: rgba(245, 158, 11, 0.07);
  }
  .theme-switch {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 2px;
    margin-top: 1.5rem;
  }
  .theme-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 0.68rem;
    padding: 0.32rem 0;
    border-radius: 4px;
    cursor: pointer;
  }
  .theme-btn.active { background: var(--surface-2); color: var(--text); font-weight: 600; }

  /* MAIN */
  main {
    max-width: 1020px;
    width: 100%;
    margin: 0 auto;
    padding: 3.5rem 3rem 7rem;
  }
  @media (max-width: 680px) { main { padding: 2rem 1.25rem 5rem; } }

  /* HERO */
  .meta-line {
    font-family: var(--mono);
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 0.6rem;
  }
  h1.hero-title {
    font-family: var(--serif);
    font-weight: 400;
    font-size: clamp(3rem, 5vw, 4.4rem);
    line-height: 1.04;
    color: var(--accent);
    margin: 0 0 1rem;
    letter-spacing: -0.01em;
  }
  .hero-quote {
    font-family: var(--serif);
    font-style: italic;
    font-size: clamp(1.35rem, 2.2vw, 1.75rem);
    color: var(--text);
    margin: 0 0 1.35rem;
    line-height: 1.35;
  }
  .hero-summary { color: var(--text-muted); font-size: 1rem; max-width: 780px; margin-bottom: 2.25rem; }

  /* STAT BAR */
  .stat-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
    gap: 1.25rem;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 1.4rem 0;
    margin: 2.25rem 0 3rem;
  }
  .stat-val { font-family: var(--serif); font-size: 2.3rem; line-height: 1; color: var(--text); margin-bottom: 0.35rem; }
  .stat-lbl { font-size: 0.76rem; color: var(--text-muted); line-height: 1.35; }

  /* SECTIONS */
  .doc-section { padding-top: 3.5rem; margin-top: 3.5rem; border-top: 1px solid var(--border-subtle); }
  .kicker {
    font-family: var(--mono);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 0.45rem;
  }
  h2 {
    font-family: var(--serif);
    font-weight: 400;
    font-size: clamp(1.85rem, 3vw, 2.4rem);
    line-height: 1.15;
    margin: 0 0 0.75rem;
    color: var(--text);
  }
  .sec-intro { color: var(--text-muted); max-width: 760px; margin: 0 0 1.75rem; }
  .inline-code {
    font-family: var(--mono);
    font-size: 0.83em;
    background: var(--surface-2);
    border: 1px solid var(--border);
    padding: 0.12rem 0.4rem;
    border-radius: 4px;
    color: var(--text);
  }

  /* CARDS */
  .cards-grid { display: grid; gap: 1rem; }
  .cards-grid.cols-3 { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
  .cards-grid.cols-2 { grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); }
  .surface-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.3rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.45rem; }
  .card-kicker { font-family: var(--mono); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--amber); }
  .meta-pill {
    font-family: var(--mono);
    font-size: 0.68rem;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text-muted);
  }
  .surface-card h3 { font-size: 1rem; font-weight: 600; margin: 0 0 0.45rem; }
  .surface-card p { margin: 0; color: var(--text-muted); font-size: 0.9rem; }
  .corollary {
    font-family: var(--serif);
    font-style: italic;
    font-size: 1.02rem;
    color: var(--text);
    margin-top: 0.9rem;
    padding-top: 0.65rem;
    border-top: 1px dashed var(--border);
  }

  /* PIPELINE */
  .pipeline-track { display: flex; align-items: stretch; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem; }
  .pipeline-stage {
    flex: 1;
    min-width: 175px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
  }
  .pipeline-arrow { display: flex; align-items: center; color: var(--text-muted); font-family: var(--mono); font-size: 1.1rem; padding: 0 0.15rem; }
  .stage-header { display: flex; align-items: center; gap: 0.45rem; font-family: var(--mono); font-size: 0.75rem; font-weight: 600; color: var(--accent); text-transform: uppercase; }
  .stage-index { background: var(--accent-soft); color: var(--accent); border: 1px solid var(--accent); border-radius: 4px; padding: 0.05rem 0.38rem; font-size: 0.7rem; }
  .stage-subtitle { font-size: 0.76rem; color: var(--text-muted); margin: 0.3rem 0 0.75rem; }
  .stage-chip { background: var(--surface-2); border: 1px solid var(--border); border-left: 3px solid var(--cyan); border-radius: 5px; padding: 0.55rem 0.65rem; margin-top: 0.5rem; }
  .stage-chip.indirect { border-left-color: var(--amber); border-left-style: dashed; }
  .chip-title { display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 600; margin-bottom: 0.2rem; }
  .chip-rel { font-family: var(--mono); font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; }
  .chip-desc { font-size: 0.76rem; color: var(--text-muted); line-height: 1.4; }

  /* ANATOMY */
  .anatomy-grid { display: grid; grid-template-columns: 1.15fr 1fr; gap: 1.25rem; align-items: start; }
  @media (max-width: 820px) { .anatomy-grid { grid-template-columns: 1fr; } }
  .anatomy-code-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
  .code-header {
    display: flex;
    justify-content: space-between;
    padding: 0.55rem 1rem;
    background: var(--surface-2);
    border-bottom: 1px solid var(--border);
    font-family: var(--mono);
    font-size: 0.73rem;
    color: var(--text-muted);
  }
  .code-block { margin: 0; padding: 1.15rem; overflow-x: auto; font-family: var(--mono); font-size: 0.8rem; line-height: 1.65; }
  .code-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.35rem;
    height: 1.35rem;
    padding: 0 0.35rem;
    border-radius: 999px;
    background: var(--accent);
    color: #09090b;
    font-family: var(--mono);
    font-size: 0.72rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .anatomy-notes { display: flex; flex-direction: column; gap: 0.7rem; }
  .callout-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 0.9rem 1rem; display: flex; gap: 0.75rem; align-items: flex-start; }
  .callout-body strong { display: block; font-size: 0.88rem; margin-bottom: 0.2rem; }
  .callout-body p { margin: 0; font-size: 0.84rem; color: var(--text-muted); }

  /* EXPLORER */
  .explorer-toolbar { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
  .search-input { background: var(--surface); border: 1px solid var(--border); color: var(--text); font-family: var(--sans); font-size: 0.85rem; padding: 0.5rem 0.85rem; border-radius: 6px; min-width: 240px; }
  .filter-pills { display: flex; flex-wrap: wrap; gap: 0.35rem; }
  .pill-btn { background: var(--surface); border: 1px solid var(--border); color: var(--text-muted); font-family: var(--mono); font-size: 0.73rem; padding: 0.3rem 0.65rem; border-radius: 999px; cursor: pointer; }
  .pill-btn.active { background: var(--text); color: var(--bg); border-color: var(--text); font-weight: 600; }
  .explorer-split { display: grid; grid-template-columns: 290px 1fr; gap: 1.25rem; align-items: start; }
  @media (max-width: 820px) { .explorer-split { grid-template-columns: 1fr; } }
  .explorer-list { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 0.65rem; max-height: 600px; overflow-y: auto; }
  .group-label { font-family: var(--mono); font-size: 0.65rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); padding: 0.6rem 0.5rem 0.25rem; }
  .master-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: transparent;
    border: none;
    border-left: 2px solid transparent;
    color: var(--text);
    font-family: var(--mono);
    font-size: 0.8rem;
    padding: 0.42rem 0.6rem;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    text-align: left;
  }
  .master-row:hover { background: var(--surface-2); }
  .master-row.active { background: var(--accent-soft); border-left-color: var(--accent); color: var(--accent); font-weight: 600; }
  .row-metric { font-size: 0.72rem; color: var(--text-muted); font-weight: 400; }
  .explorer-detail { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1.6rem; position: sticky; top: 1.5rem; }
  .detail-title-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 0.6rem; }
  .detail-title { font-family: var(--mono); font-size: 1.3rem; font-weight: 600; margin: 0; color: var(--text); }
  .detail-subhead { font-family: var(--mono); font-size: 0.68rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-muted); margin: 1.35rem 0 0.45rem; }
  .detail-quote { margin: 0.45rem 0; padding: 0.55rem 0.9rem; border-left: 2px solid var(--accent); background: var(--surface-2); font-family: var(--serif); font-style: italic; font-size: 1.05rem; color: var(--text); }
  .lesson-box { background: var(--surface-2); border: 1px solid var(--border); border-left: 3px solid var(--amber); border-radius: 6px; padding: 0.85rem 1rem; font-size: 0.88rem; }

  /* TABLES */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 0.86rem; }
  th, td { border: 1px solid var(--border); padding: 0.75rem 0.9rem; text-align: left; vertical-align: top; }
  th { background: var(--surface); font-family: var(--mono); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); }
  td { background: var(--surface); color: var(--text-muted); }
</style>
</head>
<body>
  <aside class="sidebar">
    <div>
      <div class="brand-label">${esc(data.title)}</div>
      <nav class="nav-links" id="sidebar-nav">
        <a href="#overview" class="active">Overview</a>
        ${(data.sections || []).map((s: any, i: number) => `<a href="#${esc(s.id || `sec-${i}`)}">${esc(s.navLabel || s.kicker || s.title)}</a>`).join('')}
      </nav>
    </div>
    <div class="theme-switch">
      <button class="theme-btn active" id="t-dark" onclick="setTheme('dark')">Dark</button>
      <button class="theme-btn" id="t-light" onclick="setTheme('light')">Light</button>
      <button class="theme-btn" id="t-sys" onclick="setTheme('system')">System</button>
    </div>
  </aside>

  <main>
    <header id="overview">
      <div class="meta-line">${esc(data.meta)}</div>
      <h1 class="hero-title">${esc(data.title)}</h1>
      <div class="hero-quote">"${esc(data.thesisQuote)}"</div>
      <p class="hero-summary">${inlineCode(data.summary)}</p>
      <div class="stat-bar">
        ${(data.stats || []).map((s: any) => `<div><div class="stat-val">${esc(s.value)}</div><div class="stat-lbl">${esc(s.label)}</div></div>`).join('')}
      </div>
    </header>
    ${sectionHtml}
  </main>

<script>
  const explorers = ${JSON.stringify(explorersData)};
  const principles = ${JSON.stringify(principlesData)};
  const expState = {};
  const prinState = {};

  function setTheme(mode) {
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    if (mode === 'system') {
      document.getElementById('t-sys').classList.add('active');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
    } else {
      document.getElementById(mode === 'dark' ? 't-dark' : 't-light').classList.add('active');
      document.documentElement.dataset.theme = mode;
    }
    localStorage.setItem('dossier_theme', mode);
  }

  const savedTheme = localStorage.getItem('dossier_theme');
  if (savedTheme && savedTheme !== 'system') {
    document.documentElement.dataset.theme = savedTheme;
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(savedTheme === 'dark' ? 't-dark' : 't-light').classList.add('active');
  }

  function filterExplorer(idx, query, cat) {
    if (query !== null) expState[idx].query = query;
    if (cat !== null) expState[idx].cat = cat;
    renderExplorer(idx);
  }

  function selectExplorerItem(idx, name) {
    expState[idx].openId = name;
    renderExplorer(idx);
  }

  function renderExplorer(idx) {
    const items = explorers[idx] || [];
    const { query, cat, openId } = expState[idx];
    const cats = ['All', ...new Set(items.map(i => i.category || 'Core'))];

    document.getElementById('exp-tabs-' + idx).innerHTML = cats
      .map(c => \`<button class="pill-btn \${c === cat ? 'active' : ''}" onclick="filterExplorer(\${idx}, null, '\${c.replace(/'/g, "\\\\'")}')">\${c}</button>\`)
      .join('');

    const filtered = items.filter(i =>
      (cat === 'All' || (i.category || 'Core') === cat) &&
      (i.name.toLowerCase().includes(query.toLowerCase()) || (i.summary || '').toLowerCase().includes(query.toLowerCase()))
    );

    const grouped = {};
    for (const item of filtered) (grouped[item.category || 'Core'] ??= []).push(item);

    document.getElementById('exp-list-' + idx).innerHTML = Object.entries(grouped)
      .map(([g, list]) => \`
        <div class="group-label">\${g}</div>
        \${list.map(m => \`
          <button class="master-row \${m.name === openId ? 'active' : ''}" onclick="selectExplorerItem(\${idx}, '\${m.name.replace(/'/g, "\\\\'")}')">
            <span>\${m.name}</span>
            <span class="row-metric">\${m.metric || (m.words ? m.words + ' w' : '')}</span>
          </button>
        \`).join('')}
      \`).join('');

    const active = items.find(x => x.name === openId) || filtered[0];
    const pane = document.getElementById('exp-detail-' + idx);
    if (!active) { pane.innerHTML = '<em>No matching items.</em>'; return; }

    pane.innerHTML = \`
      <div class="detail-title-row">
        <h3 class="detail-title">\${active.name}</h3>
        <div class="filter-pills">
          <span class="meta-pill">\${active.category || 'Core'}</span>
          \${active.badge ? \`<span class="meta-pill">\${active.badge}</span>\` : ''}
          <span class="meta-pill">\${active.metric || (active.words ? active.words + ' words' : '')}</span>
        </div>
      </div>
      <p style="color:var(--text-muted);margin-top:0.4rem">\${active.summary || ''}</p>
      <div class="detail-subhead">TRY IT / USAGE</div>
      <div class="anatomy-code-wrap"><pre class="code-block"><code>\${active.tryIt || ''}</code></pre></div>
      <div class="detail-subhead">HOW IT WORKS</div>
      <ol style="padding-left:1.2rem;color:var(--text-muted);font-size:0.9rem">
        \${(active.howItWorks || []).map(s => \`<li style="margin-bottom:0.35rem">\${s}</li>\`).join('')}
      </ol>
      <div class="detail-subhead">IN ITS OWN WORDS</div>
      \${(active.quotes || []).map(q => \`<blockquote class="detail-quote">"\${q}"</blockquote>\`).join('')}
      \${active.files?.length ? \`
        <div class="detail-subhead">FILES</div>
        <div class="filter-pills">\${active.files.map(f => \`<code class="inline-code">\${f}</code>\`).join('')}</div>
      \` : ''}
      <div class="detail-subhead">DESIGN LESSON</div>
      <div class="lesson-box">\${active.designLesson || ''}</div>
    \`;
  }

  function renderPrinciples(idx, cat = 'All') {
    prinState[idx] = cat;
    const items = principles[idx] || [];
    const cats = ['All', ...new Set(items.map(i => i.category || 'Core'))];
    document.getElementById('prin-tabs-' + idx).innerHTML = cats
      .map(c => \`<button class="pill-btn \${c === cat ? 'active' : ''}" onclick="renderPrinciples(\${idx}, '\${c.replace(/'/g, "\\\\'")}')">\${c} \${c === 'All' ? items.length : ''}</button>\`)
      .join('');

    const filtered = items.filter(i => cat === 'All' || (i.category || 'Core') === cat);
    document.getElementById('prin-grid-' + idx).innerHTML = filtered.map(p => \`
      <div class="surface-card">
        <div class="card-top">
          <h3 style="margin:0">\${p.title}</h3>
          <span class="meta-pill">\${p.category || 'Core'}</span>
        </div>
        <p style="margin-top:0.5rem">\${p.body}</p>
        <div class="corollary">"\${p.corollary}"</div>
      </div>
    \`).join('');
  }

  for (const idx of Object.keys(explorers)) {
    expState[idx] = { query: '', cat: 'All', openId: (explorers[idx][0] || {}).name };
    renderExplorer(idx);
  }
  for (const idx of Object.keys(principles)) {
    renderPrinciples(idx, 'All');
  }

  // Scrollspy
  const sections = document.querySelectorAll('header[id], section[id]');
  const navLinks = document.querySelectorAll('#sidebar-nav a');
  window.addEventListener('scroll', () => {
    let current = 'overview';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 160) current = sec.getAttribute('id');
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  });
<\/script>
</body>
</html>`;
}

// ============================================================================
// 4. WRITE OUTPUT
// ============================================================================
const finalHtml = generateHtmlSpa(data);
fs.writeFileSync(outputPath, finalHtml, 'utf-8');
console.log(`Dossier SPA successfully generated at: ${outputPath}`);
