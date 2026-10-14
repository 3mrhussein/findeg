// Project metadata checks append to the ecosystem baseline.
import json from '@eslint/json';
import { local } from '../rules/index.js';
import { severity } from '../standard.js';

export const hygiene = [
  {
    files: ['package.json'],
    language: 'json/json',
    plugins: { json, local },
    rules: { 'local/required-package-scripts': severity('local/required-package-scripts') },
  },
];
