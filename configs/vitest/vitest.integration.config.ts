import { defineConfig } from 'vitest/config';
import { integrationTest } from './integration';
export default defineConfig({ test: integrationTest });
