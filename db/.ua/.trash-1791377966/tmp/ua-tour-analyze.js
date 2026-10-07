import fs from 'node:fs';

try {
  const input = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const { nodes, edges, layers } = input;
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const fanIn = new Map(nodes.map((node) => [node.id, 0]));
  const fanOut = new Map(nodes.map((node) => [node.id, 0]));
  for (const edge of edges) {
    if (fanIn.has(edge.target)) fanIn.set(edge.target, fanIn.get(edge.target) + 1);
    if (fanOut.has(edge.source)) fanOut.set(edge.source, fanOut.get(edge.source) + 1);
  }
  const ranking = (counts, key) => [...counts.entries()]
    .map(([id, count]) => ({ id, [key]: count, name: byId.get(id)?.name || id }))
    .sort((a, b) => b[key] - a[key] || a.id.localeCompare(b.id))
    .slice(0, 20);
  const fanInRanking = ranking(fanIn, 'fanIn');
  const fanOutRanking = ranking(fanOut, 'fanOut');
  const fileLevel = nodes.filter((node) => ['file', 'config', 'document', 'service', 'pipeline', 'table', 'schema', 'resource', 'endpoint'].includes(node.type));
  const codeFiles = fileLevel.filter((node) => node.type === 'file');
  const sortedOut = [...codeFiles].sort((a, b) => fanOut.get(b.id) - fanOut.get(a.id));
  const topOut = new Set(sortedOut.slice(0, Math.max(1, Math.ceil(codeFiles.length * 0.1))).map((node) => node.id));
  const sortedInValues = codeFiles.map((node) => fanIn.get(node.id)).sort((a, b) => a - b);
  const lowInThreshold = sortedInValues[Math.floor(sortedInValues.length * 0.25)] ?? 0;
  const entryNames = new Set(['index.ts','index.js','main.ts','main.js','app.ts','app.js','server.ts','server.js','mod.rs','main.go','main.py','main.rs','manage.py','app.py','wsgi.py','asgi.py','run.py','__main__.py','Application.java','Main.java','Program.cs','config.ru','index.php','App.swift','Application.kt','main.cpp','main.c']);
  const entryPointCandidates = fileLevel.map((node) => {
    let score = 0;
    const p = node.filePath || '';
    if (node.type === 'file') {
      if (entryNames.has(node.name)) score += 3;
      if (p.split('/').length <= 2) score += 1;
      if (topOut.has(node.id)) score += 1;
      if (fanIn.get(node.id) <= lowInThreshold) score += 1;
    } else if (node.type === 'document') {
      if (p === 'README.md') score += 5;
      else if (!p.includes('/') && p.endsWith('.md')) score += 2;
    }
    return { id: node.id, score, name: node.name, summary: node.summary };
  }).filter((candidate) => candidate.score > 0).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, 5);
  const start = entryPointCandidates.find((candidate) => byId.get(candidate.id)?.type === 'file')?.id || null;
  const adjacency = new Map(nodes.map((node) => [node.id, []]));
  for (const edge of edges) if ((edge.type === 'imports' || edge.type === 'calls') && adjacency.has(edge.source) && byId.has(edge.target)) adjacency.get(edge.source).push(edge.target);
  const order = [], depthMap = {}, byDepth = {};
  if (start) {
    const queue = [[start, 0]], seen = new Set([start]);
    while (queue.length) {
      const [id, depth] = queue.shift(); order.push(id); depthMap[id] = depth; (byDepth[depth] ||= []).push(id);
      for (const target of adjacency.get(id) || []) if (!seen.has(target)) { seen.add(target); queue.push([target, depth + 1]); }
    }
  }
  const pick = (types) => fileLevel.filter((node) => types.includes(node.type)).map(({ id, name, type, summary }) => ({ id, name, type, summary }));
  const nonCodeFiles = {
    documentation: pick(['document']),
    infrastructure: pick(['service','pipeline','resource']),
    data: pick(['table','schema','endpoint']),
    config: pick(['config'])
  };
  const rel = new Map();
  for (const edge of edges.filter((edge) => edge.type === 'imports' || edge.type === 'calls')) rel.set(`${edge.source}\0${edge.target}`, true);
  const clusters = [];
  const clustered = new Set();
  for (const [key] of rel) {
    const [a, b] = key.split('\0');
    if (a === b || !rel.has(`${b}\0${a}`)) continue;
    const pairKey = [a,b].sort().join('\0'); if (clustered.has(pairKey)) continue; clustered.add(pairKey);
    const group = new Set([a,b]);
    for (const candidate of nodes.map((node) => node.id)) {
      if (group.has(candidate)) continue;
      let links = 0; for (const member of group) if (rel.has(`${candidate}\0${member}`) || rel.has(`${member}\0${candidate}`)) links++;
      if (links >= 2 && group.size < 5) group.add(candidate);
    }
    let edgeCount = 0; for (const x of group) for (const y of group) if (x !== y && rel.has(`${x}\0${y}`)) edgeCount++;
    clusters.push({ nodes: [...group], edgeCount });
  }
  clusters.sort((a,b) => b.edgeCount - a.edgeCount || b.nodes.length - a.nodes.length);
  const nodeSummaryIndex = Object.fromEntries(fileLevel.map(({id,name,type,summary}) => [id,{name,type,summary}]));
  const output = { scriptCompleted: true, entryPointCandidates, fanInRanking, fanOutRanking, bfsTraversal: { startNode: start, order, depthMap, byDepth }, nonCodeFiles, clusters: clusters.slice(0,10), layers: { count: layers.length, list: layers }, nodeSummaryIndex, totalNodes: nodes.length, totalEdges: edges.length };
  fs.writeFileSync(process.argv[3], JSON.stringify(output, null, 2));
} catch (error) {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
}
