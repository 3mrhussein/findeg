#!/usr/bin/env bun
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface DossierSection {
  id: string;
  title: string;
  level: number;
  contentHtml: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function markdownToSections(markdown: string): { title: string; sections: DossierSection[] } {
  const lines = markdown.split('\n');
  const sections: DossierSection[] = [];
  let currentSection: DossierSection | null = null;
  let docTitle = 'Code Dossier';
  let sectionCounter = 0;
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';
  let bodyBuffer: string[] = [];

  function flushBuffer(): void {
    if (!currentSection) return;
    if (bodyBuffer.length > 0) {
      currentSection.contentHtml += bodyBuffer.join('\n') + '\n';
      bodyBuffer = [];
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        flushBuffer();
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        const codeText = escapeHtml(codeBuffer.join('\n'));
        const blockHtml = `
<div class="code-container">
  <div class="code-header">
    <span class="code-lang">${escapeHtml(codeLang || 'text')}</span>
    <button class="copy-btn" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.innerText); this.innerText='Copied!'; setTimeout(() => this.innerText='Copy', 2000);">Copy</button>
  </div>
  <pre><code>${codeText}</code></pre>
</div>`;
        if (currentSection) {
          currentSection.contentHtml += blockHtml;
        } else {
          bodyBuffer.push(blockHtml);
        }
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headerMatch) {
      flushBuffer();
      const level = headerMatch[1].length;
      const title = headerMatch[2].trim();
      if (level === 1 && docTitle === 'Code Dossier') {
        docTitle = title;
      }

      sectionCounter++;
      const id = 'sec-' + sectionCounter + '-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      currentSection = {
        id,
        title,
        level,
        contentHtml: '',
      };
      sections.push(currentSection);
      continue;
    }

    // Format basic markdown elements
    let formatted = escapeHtml(line);
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      bodyBuffer.push(`<li>${formatted.replace(/^[-*]\s+/, '')}</li>`);
    } else if (line.trim().length === 0) {
      bodyBuffer.push('<br/>');
    } else {
      bodyBuffer.push(`<p>${formatted}</p>`);
    }
  }

  flushBuffer();

  if (sections.length === 0) {
    sections.push({
      id: 'sec-main',
      title: docTitle,
      level: 1,
      contentHtml: bodyBuffer.join('\n'),
    });
  }

  return { title: docTitle, sections };
}

function jsonToSections(
  jsonData: unknown,
  titleStr: string,
): { title: string; sections: DossierSection[] } {
  const sections: DossierSection[] = [];
  const title = titleStr || 'System Dossier Report';

  if (typeof jsonData === 'object' && jsonData !== null) {
    const entries = Object.entries(jsonData);
    let counter = 0;
    for (const [key, value] of entries) {
      counter++;
      const id = 'sec-' + counter + '-' + key.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const codeHtml = `
<div class="code-container">
  <div class="code-header">
    <span class="code-lang">json</span>
    <button class="copy-btn" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.innerText); this.innerText='Copied!'; setTimeout(() => this.innerText='Copy', 2000);">Copy</button>
  </div>
  <pre><code>${escapeHtml(JSON.stringify(value, null, 2))}</code></pre>
</div>`;

      sections.push({
        id,
        title: key.toUpperCase(),
        level: 2,
        contentHtml: codeHtml,
      });
    }
  }

  return { title, sections };
}

export function generateHtmlSpa(docTitle: string, sections: DossierSection[]): string {
  const navItems = sections
    .map(
      (sec) =>
        `<a href="#${sec.id}" class="nav-link level-${sec.level}" data-section="${sec.id}">${escapeHtml(
          sec.title,
        )}</a>`,
    )
    .join('\n');

  const sectionArticles = sections
    .map(
      (sec) => `
<article id="${sec.id}" class="dossier-section">
  <h${sec.level} class="section-title">${escapeHtml(sec.title)}</h${sec.level}>
  <div class="section-body">
    ${sec.contentHtml}
  </div>
</article>`,
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(docTitle)}</title>
  <style>
    :root {
      --bg-primary: #0d1117;
      --bg-secondary: #161b22;
      --bg-tertiary: #21262d;
      --border-color: #30363d;
      --text-primary: #f0f6fc;
      --text-muted: #8b949e;
      --accent: #58a6ff;
      --accent-hover: #79c0ff;
      --code-bg: #090d13;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
    }

    [data-theme="light"] {
      --bg-primary: #ffffff;
      --bg-secondary: #f6f8fa;
      --bg-tertiary: #eaeef2;
      --border-color: #d0d7de;
      --text-primary: #1f2328;
      --text-muted: #656d76;
      --accent: #0969da;
      --accent-hover: #218bff;
      --code-bg: #f6f8fa;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-sans);
      background: var(--bg-primary);
      color: var(--text-primary);
      display: flex;
      min-height: 100vh;
      line-height: 1.6;
    }

    /* Sticky Sidebar Navigation */
    .sidebar {
      width: 320px;
      height: 100vh;
      position: sticky;
      top: 0;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }

    .sidebar-header {
      padding: 1.25rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .sidebar-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .theme-toggle {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .theme-toggle:hover { background: var(--border-color); }

    .search-box {
      padding: 0.75rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
    }
    .search-input {
      width: 100%;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.85rem;
      outline: none;
    }
    .search-input:focus { border-color: var(--accent); }

    .nav-list {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0;
    }
    .nav-link {
      display: block;
      padding: 6px 1.25rem;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.85rem;
      border-left: 3px solid transparent;
      transition: all 0.15s ease;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .nav-link:hover {
      color: var(--text-primary);
      background: var(--bg-tertiary);
    }
    .nav-link.active {
      color: var(--accent);
      background: var(--bg-tertiary);
      border-left-color: var(--accent);
      font-weight: 600;
    }
    .nav-link.level-2 { padding-left: 2rem; }
    .nav-link.level-3 { padding-left: 2.75rem; font-size: 0.8rem; }

    /* Main Content */
    .content {
      flex: 1;
      padding: 2.5rem 3.5rem;
      max-width: 960px;
      overflow-y: auto;
    }

    .dossier-section {
      margin-bottom: 3.5rem;
      scroll-margin-top: 2rem;
    }

    .section-title {
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5rem;
      margin-bottom: 1.25rem;
    }

    p { margin-bottom: 1rem; color: var(--text-primary); }
    li { margin-left: 1.5rem; margin-bottom: 0.4rem; color: var(--text-primary); }
    code {
      font-family: var(--font-mono);
      font-size: 0.85em;
      background: var(--bg-tertiary);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .code-container {
      background: var(--code-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      margin: 1.25rem 0;
      overflow: hidden;
    }
    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 12px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .copy-btn {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.75rem;
    }
    .copy-btn:hover { background: var(--border-color); }
    pre {
      padding: 1rem;
      overflow-x: auto;
      font-family: var(--font-mono);
      font-size: 0.85rem;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-title">${escapeHtml(docTitle)}</div>
      <button class="theme-toggle" id="theme-btn" onclick="toggleTheme()">Theme</button>
    </div>
    <div class="search-box">
      <input type="text" id="filter-input" class="search-input" placeholder="Filter sections..." oninput="filterNav(this.value)">
    </div>
    <nav class="nav-list" id="nav-container">
      ${navItems}
    </nav>
  </aside>

  <main class="content">
    ${sectionArticles}
  </main>

  <script>
    function toggleTheme() {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('dossier_theme', next);
    }

    const savedTheme = localStorage.getItem('dossier_theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    function filterNav(query) {
      const q = query.toLowerCase();
      const links = document.querySelectorAll('.nav-link');
      links.forEach(link => {
        const text = link.innerText.toLowerCase();
        link.style.display = text.includes(q) ? 'block' : 'none';
      });
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-section') === id);
          });
        }
      });
    }, { rootMargin: '0px 0px -70% 0px' });

    document.querySelectorAll('.dossier-section').forEach(section => {
      observer.observe(section);
    });
  </script>
</body>
</html>`;
}

// Execution entry point
const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(
    "Usage: bun scripts/build-dossier.ts <input.md | input.json | dir> [output.html] [--title 'Title']",
  );
  process.exit(0);
}

const inputPath = path.resolve(args[0]);
let outputPath =
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

let docTitle = customTitle || path.basename(inputPath, path.extname(inputPath));
let sections: DossierSection[] = [];

const stat = fs.statSync(inputPath);
if (stat.isDirectory()) {
  const mdFiles = fs.readdirSync(inputPath).filter((f) => f.endsWith('.md'));
  let idx = 0;
  for (const f of mdFiles) {
    idx++;
    const full = path.join(inputPath, f);
    const content = fs.readFileSync(full, 'utf-8');
    const parsed = markdownToSections(content);
    sections.push({
      id: 'file-' + idx,
      title: parsed.title || f,
      level: 1,
      contentHtml: parsed.sections.map((s) => s.contentHtml).join('\n'),
    });
  }
} else if (inputPath.endsWith('.json')) {
  try {
    const raw = fs.readFileSync(inputPath, 'utf-8');
    const json = JSON.parse(raw);
    const res = jsonToSections(json, docTitle);
    docTitle = res.title;
    sections = res.sections;
  } catch (err) {
    console.error('Failed to parse JSON input:', err);
    process.exit(1);
  }
} else {
  const content = fs.readFileSync(inputPath, 'utf-8');
  const parsed = markdownToSections(content);
  docTitle = customTitle || parsed.title;
  sections = parsed.sections;
}

const finalHtml = generateHtmlSpa(docTitle, sections);
fs.writeFileSync(outputPath, finalHtml, 'utf-8');

console.log(`Dossier SPA successfully generated at: ${outputPath}`);
