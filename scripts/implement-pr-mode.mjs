#!/usr/bin/env node
// Per-user, untracked flag read by the `implement` skill after committing.
//   node scripts/implement-pr-mode.mjs          -> prints `auto` or `ask`
//   node scripts/implement-pr-mode.mjs auto|ask -> saves the mode
// A missing or invalid value reads as `ask`.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const FILE = join(homedir(), ".config", "findeg", "implement-pr-mode");
const MODES = ["auto", "ask"];
const arg = process.argv[2];

if (arg === undefined) {
  let mode = "ask";
  try {
    const saved = readFileSync(FILE, "utf8").trim();
    if (MODES.includes(saved)) mode = saved;
  } catch {}
  console.log(mode);
} else if (MODES.includes(arg)) {
  mkdirSync(dirname(FILE), { recursive: true });
  writeFileSync(FILE, `${arg}\n`);
  console.log(arg);
} else {
  console.error("usage: implement-pr-mode.mjs [auto|ask]");
  process.exit(1);
}
