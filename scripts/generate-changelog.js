import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const DEFAULT_OUTPUT = path.resolve("CHANGELOG.md");
const SECTION_ORDER = ["Breaking", "Added", "Fixed", "Changed", "Maintenance", "Reverted", "Other"];
const TYPE_TO_SECTION = {
  feat: "Added",
  fix: "Fixed",
  perf: "Changed",
  refactor: "Changed",
  style: "Changed",
  docs: "Maintenance",
  test: "Maintenance",
  build: "Maintenance",
  ci: "Maintenance",
  chore: "Maintenance",
  revert: "Reverted",
};

/**
 *
 */
function parseArgs(argv) {
  const args = {
    output: DEFAULT_OUTPUT,
    stdout: false,
    check: false,
    from: "",
    to: "HEAD",
    max: 0,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--stdout") {
      args.stdout = true;
      continue;
    }

    if (arg === "--check") {
      args.check = true;
      continue;
    }

    if (arg === "--output") {
      args.output = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }

    if (arg === "--from") {
      args.from = argv[index + 1] || "";
      index += 1;
      continue;
    }

    if (arg === "--to") {
      args.to = argv[index + 1] || "HEAD";
      index += 1;
      continue;
    }

    if (arg === "--max") {
      const parsed = Number(argv[index + 1] || "0");
      args.max = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
      index += 1;
    }
  }

  return args;
}

/**
 *
 */
function runGitLog({ from, to, max }) {
  const prettyFormat = "%H%x1f%ad%x1f%s%x1e";
  const range = from ? `${from}..${to}` : to;

  const gitArgs = ["log", range, "--no-merges", "--date=short", `--pretty=format:${prettyFormat}`];

  if (max > 0) {
    gitArgs.splice(1, 0, `-${max}`);
  }

  const result = spawnSync("git", gitArgs, {
    encoding: "utf8",
    env: process.env,
  });

  if (result.error || result.status !== 0) {
    const stderr = result.stderr?.trim();
    const message = stderr || result.error?.message || "Unknown git log error";
    throw new Error(`Failed to read git history: ${message}`);
  }

  return result.stdout || "";
}

/**
 *
 */
function parseCommitRecord(rawRecord) {
  const [hash = "", date = "", subject = ""] = rawRecord.split("\u001f");
  const trimmedSubject = subject.trim();

  if (!hash || !trimmedSubject) {
    return null;
  }

  const conventional = /^(?<type>[a-zA-Z]+)(\([^)]+\))?(?<breaking>!)?:\s*(?<message>.+)$/u.exec(
    trimmedSubject,
  );

  if (!conventional?.groups) {
    return {
      hash,
      shortHash: hash.slice(0, 7),
      date,
      section: "Other",
      message: trimmedSubject,
    };
  }

  const type = conventional.groups.type.toLowerCase();
  const message = conventional.groups.message.trim();
  const section = conventional.groups.breaking ? "Breaking" : TYPE_TO_SECTION[type] || "Other";

  return {
    hash,
    shortHash: hash.slice(0, 7),
    date,
    section,
    message,
  };
}

/**
 *
 */
function parseCommits(logOutput) {
  return logOutput
    .split("\u001e")
    .map((record) => record.trim())
    .filter(Boolean)
    .map(parseCommitRecord)
    .filter(Boolean);
}

/**
 *
 */
function bucketCommits(commits) {
  const buckets = new Map(SECTION_ORDER.map((section) => [section, []]));

  for (const commit of commits) {
    if (!buckets.has(commit.section)) {
      buckets.set(commit.section, []);
    }
    buckets.get(commit.section).push(commit);
  }

  return buckets;
}

/**
 *
 */
function renderChangelog({ commits, from, to }) {
  const scope = from ? `${from}..${to}` : to;
  const latestCommitDate = commits[0]?.date || "n/a";
  const buckets = bucketCommits(commits);
  const lines = [
    "# Changelog",
    "",
    "Auto-generated from git commit history.",
    "",
    `Latest commit date: ${latestCommitDate}`,
    `Range: ${scope}`,
    "",
  ];

  if (commits.length === 0) {
    lines.push("No commits found for the selected range.", "");
    return `${lines.join("\n")}`;
  }

  for (const section of SECTION_ORDER) {
    const items = buckets.get(section) || [];
    if (items.length === 0) {
      continue;
    }

    lines.push(`## ${section}`, "");

    for (const commit of items) {
      lines.push(`- ${commit.message} (\`${commit.shortHash}\`, ${commit.date})`);
    }

    lines.push("");
  }

  return lines.join("\n");
}

/**
 *
 */
function main() {
  const args = parseArgs(process.argv.slice(2));
  const logOutput = runGitLog(args);
  const commits = parseCommits(logOutput);
  const changelog = renderChangelog({ commits, from: args.from, to: args.to });

  if (args.stdout) {
    process.stdout.write(changelog);
    if (!changelog.endsWith("\n")) {
      process.stdout.write("\n");
    }
    return;
  }

  if (args.check) {
    const exists = fs.existsSync(args.output);
    const current = exists ? fs.readFileSync(args.output, "utf8") : "";

    if (current !== changelog) {
      console.error(`CHANGELOG is out of date: ${path.relative(process.cwd(), args.output)}`);
      process.exit(1);
    }

    console.log("CHANGELOG is up to date.");
    return;
  }

  fs.writeFileSync(args.output, changelog, "utf8");
  console.log(`Updated ${path.relative(process.cwd(), args.output)}`);
}

main();
