import fs from 'node:fs';

const ua = '/Users/amr/projects/findeg/db/.ua';
const graph = JSON.parse(fs.readFileSync(`${ua}/intermediate/assembled-graph.json`, 'utf8'));
const fileTypes = new Set(['file', 'config', 'document', 'service', 'pipeline', 'table', 'schema', 'resource', 'endpoint']);
const fileNodes = graph.nodes.filter(node => fileTypes.has(node.type));
const ids = new Set(fileNodes.map(node => node.id));
const allEdges = graph.edges.filter(edge => ids.has(edge.source) && ids.has(edge.target));
const input = { fileNodes, importEdges: allEdges.filter(edge => edge.type === 'imports'), allEdges };
fs.writeFileSync(`${ua}/tmp/ua-arch-input.json`, `${JSON.stringify(input, null, 2)}\n`);
