import fs from 'node:fs';

try {
  const input = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const outputPath = process.argv[3];
  const byId = new Map(input.fileNodes.map(node => [node.id, node]));
  const groupOf = node => {
    const parts = node.filePath.split('/');
    if (parts[0] === 'src' && parts.length > 2) return `src/${parts[1]}`;
    return parts.length > 1 ? parts[0] : 'root';
  };
  const directoryGroups = {}, nodeTypeGroups = {}, fileFanIn = {}, fileFanOut = {};
  for (const node of input.fileNodes) {
    (directoryGroups[groupOf(node)] ||= []).push(node.id);
    (nodeTypeGroups[node.type] ||= []).push(node.id);
    fileFanIn[node.id] = 0; fileFanOut[node.id] = 0;
  }
  const pairCounts = new Map(), internal = {}, involving = {}, cross = new Map();
  for (const edge of input.importEdges) {
    if (!byId.has(edge.source) || !byId.has(edge.target)) continue;
    fileFanOut[edge.source]++; fileFanIn[edge.target]++;
    const from = groupOf(byId.get(edge.source)), to = groupOf(byId.get(edge.target));
    involving[from] = (involving[from] || 0) + 1;
    if (to !== from) involving[to] = (involving[to] || 0) + 1;
    else internal[from] = (internal[from] || 0) + 1;
    pairCounts.set(`${from}\0${to}`, (pairCounts.get(`${from}\0${to}`) || 0) + 1);
  }
  for (const edge of input.allEdges) {
    const a = byId.get(edge.source), b = byId.get(edge.target); if (!a || !b) continue;
    const key = `${a.type}\0${b.type}\0${edge.type}`;
    cross.set(key, (cross.get(key) || 0) + 1);
  }
  const interGroupImports = [...pairCounts].map(([key, count]) => { const [from, to] = key.split('\0'); return { from, to, count }; });
  const patternMatches = {};
  for (const group of Object.keys(directoryGroups)) {
    patternMatches[group] = group === 'docs' ? 'documentation' : group === 'seeds' ? 'data' : group === 'src/schema' ? 'data' : group === 'src/types' ? 'types' : group.includes('__tests__') ? 'test' : group === 'root' ? 'config' : group === 'src/queries' ? 'data' : 'service';
  }
  const intraGroupDensity = Object.fromEntries(Object.keys(directoryGroups).map(group => [group, { internalEdges: internal[group] || 0, totalEdges: involving[group] || 0, density: involving[group] ? (internal[group] || 0) / involving[group] : 0 }]));
  const directions = [];
  const seen = new Set();
  for (const {from, to, count} of interGroupImports) {
    if (from === to) continue;
    const key = [from, to].sort().join('\0'); if (seen.has(key)) continue; seen.add(key);
    const reverse = pairCounts.get(`${to}\0${from}`) || 0;
    directions.push(count >= reverse ? {dependent: from, dependsOn: to} : {dependent: to, dependsOn: from});
  }
  const groups = Object.keys(directoryGroups);
  const docGroups = new Set(input.fileNodes.filter(n => n.type === 'document').map(groupOf));
  const result = {
    scriptCompleted: true,
    directoryGroups,
    nodeTypeGroups,
    crossCategoryEdges: [...cross].map(([key, count]) => { const [fromType, toType, edgeType] = key.split('\0'); return {fromType, toType, edgeType, count}; }),
    interGroupImports,
    intraGroupDensity,
    patternMatches,
    deploymentTopology: {hasDockerfile: false, hasCompose: false, hasK8s: false, hasTerraform: false, hasCI: false, infraFiles: []},
    dataPipeline: {schemaFiles: input.fileNodes.filter(n => n.filePath.startsWith('src/schema/') || n.filePath.endsWith('.sql')).map(n => n.filePath), migrationFiles: [], dataModelFiles: input.fileNodes.filter(n => n.filePath.startsWith('src/schema/')).map(n => n.filePath), apiHandlerFiles: []},
    docCoverage: {groupsWithDocs: docGroups.size, totalGroups: groups.length, coverageRatio: groups.length ? docGroups.size / groups.length : 0, undocumentedGroups: groups.filter(g => !docGroups.has(g))},
    dependencyDirection: directions,
    fileStats: {totalFileNodes: input.fileNodes.length, filesPerGroup: Object.fromEntries(Object.entries(directoryGroups).map(([k,v]) => [k,v.length])), nodeTypeCounts: Object.fromEntries(Object.entries(nodeTypeGroups).map(([k,v]) => [k,v.length]))},
    fileFanIn,
    fileFanOut,
  };
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  process.exit(0);
} catch (error) {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
}
