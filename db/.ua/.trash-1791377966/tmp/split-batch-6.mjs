import fs from 'node:fs';

const ua = '/Users/amr/projects/findeg/db/.ua';
const fragment = JSON.parse(fs.readFileSync(`${ua}/intermediate/batch-6.json`, 'utf8'));
const files = [...new Set(fragment.nodes.map(node => node.filePath).filter(Boolean))].sort();
const groups = [files.slice(0, Math.ceil(files.length / 2)), files.slice(Math.ceil(files.length / 2))];

groups.forEach((group, index) => {
  const paths = new Set(group);
  const nodes = fragment.nodes.filter(node => paths.has(node.filePath));
  const sources = new Set(nodes.map(node => node.id));
  const edges = fragment.edges.filter(edge => sources.has(edge.source));
  fs.writeFileSync(`${ua}/intermediate/batch-6-part-${index + 1}.json`, `${JSON.stringify({ nodes, edges }, null, 2)}\n`);
});
