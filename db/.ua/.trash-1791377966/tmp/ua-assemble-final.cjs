#!/usr/bin/env node
const fs = require('fs');

const root = '/Users/amr/projects/findeg/db/.ua/intermediate';
const graphPath = `${root}/assembled-graph.json`;
const scan = JSON.parse(fs.readFileSync(`${root}/scan-result.json`, 'utf8'));
const base = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
const rawLayers = JSON.parse(fs.readFileSync(`${root}/layers.json`, 'utf8'));
const rawTour = JSON.parse(fs.readFileSync(`${root}/tour.json`, 'utf8'));
const gitCommitHash = process.argv[2];
const nodeIds = new Set(base.nodes.map((node) => node.id));
const prefixes = ['file:', 'config:', 'document:', 'service:', 'pipeline:', 'table:', 'schema:', 'resource:', 'endpoint:'];
const normalizeId = (value) => {
  if (typeof value !== 'string') return null;
  return prefixes.some((prefix) => value.startsWith(prefix)) ? value : `file:${value}`;
};
const kebab = (value) => String(value || 'unnamed').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const layerArray = Array.isArray(rawLayers) ? rawLayers : rawLayers.layers || [];
const layers = layerArray.map((layer) => {
  const sourceIds = layer.nodeIds || layer.nodes || [];
  const nodeIdsForLayer = sourceIds
    .map((entry) => typeof entry === 'string' ? entry : entry && entry.id)
    .map(normalizeId)
    .filter((id) => id && nodeIds.has(id));
  return {
    id: layer.id || `layer:${kebab(layer.name)}`,
    name: layer.name || 'Unnamed Layer',
    description: layer.description || 'No description available',
    nodeIds: [...new Set(nodeIdsForLayer)],
  };
}).filter((layer) => layer.nodeIds.length > 0);

const tourArray = Array.isArray(rawTour) ? rawTour : rawTour.steps || [];
const tour = tourArray.map((step, index) => {
  const sourceIds = step.nodeIds || step.nodesToInspect || [];
  const normalized = {
    order: Number.isInteger(step.order) ? step.order : index + 1,
    title: step.title || `Step ${index + 1}`,
    description: step.description || step.whyItMatters || 'No description available',
    nodeIds: [...new Set(sourceIds.map(normalizeId).filter((id) => id && nodeIds.has(id)))],
  };
  if (typeof step.languageLesson === 'string') normalized.languageLesson = step.languageLesson;
  return normalized;
}).filter((step) => step.nodeIds.length > 0).sort((a, b) => a.order - b.order);
tour.forEach((step, index) => { step.order = index + 1; });

const graph = {
  version: '1.0.0',
  project: {
    name: scan.name,
    languages: scan.languages,
    frameworks: scan.frameworks,
    description: scan.description,
    analyzedAt: new Date().toISOString(),
    gitCommitHash,
  },
  nodes: base.nodes,
  edges: base.edges,
  layers,
  tour,
};
fs.writeFileSync(graphPath, `${JSON.stringify(graph, null, 2)}\n`);
console.log(JSON.stringify({nodes: graph.nodes.length, edges: graph.edges.length, layers: layers.length, tour: tour.length}));
