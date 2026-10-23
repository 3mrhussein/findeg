# Sandcastle: mattpocock/sandcastle Dossier

## Overview

**Sandcastle** (`@ai-hero/sandcastle`) is an open-source TypeScript library created by **Matt Pocock** as part of his **AI Hero** platform. It provides a unified orchestration layer for running AI coding agents (such as Claude Code) fully AFK (Away From Keyboard) inside isolated, secure sandbox environments.

The core premise: developers should be able to queue up real engineering tasks, walk away, and return to merged pull requests, without granting AI agents unbounded access to their machine, codebase, or secrets.

- **GitHub:** `github.com/mattpocock/sandcastle`
- **npm Package:** `@ai-hero/sandcastle`
- **Platform Hub:** `aihero.dev`
- **Author:** Matt Pocock (`@mattpocock`)
- **License:** Open Source (MIT)

## The Problem Sandcastle Solves

Running autonomous coding agents locally creates three fundamental friction points:

1. **Safety and Blast Radius**: Giving an AI agent write access to your primary codebase or host machine means a single hallucinated command can delete files, leak credentials, or corrupt your local state. Without sandboxing, there is no boundary between the agent and your entire filesystem.
2. **The Interruption Problem**: Agents constantly ask for human approval: "Can I run this terminal command?", "Can I edit this file?". This defeats the purpose of autonomous AFK execution and forces the developer to babysit every session.
3. **The Parallelization Problem**: Running two AI agents on the same local repository simultaneously causes Git conflicts, race conditions, and corrupted `node_modules`. There is no native mechanism for concurrent safe isolation without extra infrastructure.

Sandcastle solves all three by combining **strict sandbox isolation** with **Git worktree orchestration** behind a clean TypeScript API (`run()`).

## Core Architecture

Sandcastle's architecture is composed of three interlocking layers:

### Layer 1: Sandbox Providers (Isolation Boundary)

Every agent run executes inside a sandbox that completely seals off the agent from your host machine. Sandcastle defines a clean abstraction (the `SandboxProvider` interface) that decouples the agent runtime from any specific container or VM technology.

Sandcastle ships with three built-in providers and an extension seam for custom ones:

- **Docker Provider**: Uses Docker Desktop or Docker Engine. Mounts the active Git worktree directory as a bind-mount volume inside a container. Most common choice for local development.
- **Podman Provider**: A rootless alternative to Docker using Podman with `--userns=keep-id`. Identical API surface to the Docker provider. Preferred on systems where Docker Desktop is unavailable or rootless operation is required.
- **Vercel Sandbox Provider**: Cloud-based execution using Firecracker microVMs via `@vercel/sandbox`. Unlike Docker and Podman, this is an isolated provider: the repository is bundled and synced into the remote VM, and changes are extracted back via format-patch. Zero local infrastructure required.
- **Custom Providers via Factory Functions**:
  - `createBindMountSandboxProvider`: For environments that mount a shared host directory (e.g., custom container managers, WSL distros, remote shells with shared FS).
  - `createIsolatedSandboxProvider`: For environments with fully isolated filesystems that require bundle sync-in and format-patch sync-out.

The custom provider contract includes: `exec(command, options)`, `copyFileIn`, `copyFileOut`, `close()`, and workspace path handling.

### Layer 2: Git Worktree Strategy (Concurrent Isolation)

Sandcastle uses **Git worktrees** to allow multiple agents to operate on the same repository without stepping on each other. Each task gets its own branch and worktree directory, provisioned automatically.

Three branch strategies are available:
- **`head`**: Agent works directly off `main` HEAD. Fast, no branching overhead. Risky if tasks overlap.
- **`merge-to-head`**: Agent branches off, executes, then auto-merges back when tests and checks pass. Default for parallel workflows.
- **`branch`**: Produces an isolated branch for explicit human review before integration. Best for high-stakes tasks.

### Layer 3: Agent Abstraction

Sandcastle wraps the agent invocation behind an `agent` parameter. Currently ships with `claudeCode()` as the primary built-in agent. The agent abstraction handles prompt delivery, credential injection, and result capture.

```ts
import { claudeCode } from "@ai-hero/sandcastle";

const agent = claudeCode("claude-opus-4-8"); // Optional model override
```

## API Reference

### `run(options)`

The primary orchestration entry point. Accepts a configuration object and returns a Promise that resolves when all tasks complete.

```ts
import { run, claudeCode } from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";

await run({
  sandbox: docker(),
  agent: claudeCode(),
  strategy: "merge-to-head",
  tasks: [
    { name: "Fix pagination bug on deals page", issue: 102 },
    { name: "Add export button to brands index", issue: 103 },
  ],
});
```

**Options:**
- `sandbox`: A sandbox provider instance (docker, podman, vercel, or custom).
- `agent`: An agent factory instance (`claudeCode()`).
- `promptFile`: Path to a Markdown prompt file (relative to `.sandcastle/`).
- `strategy`: Branch strategy: `"head"`, `"merge-to-head"`, or `"branch"`.
- `tasks`: Array of task descriptors with `name` and optional `issue` (GitHub issue number).

### `claudeCode(model?)`

Creates a Claude Code agent configuration. Optionally accepts a model string to override the default.

### Sandbox Factory Functions

```ts
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";
import { podman } from "@ai-hero/sandcastle/sandboxes/podman";
import { vercel } from "@ai-hero/sandcastle/sandboxes/vercel";
```

All factory functions accept optional configuration objects to override defaults such as image name, CPU/memory limits, or network isolation flags.

## Multi-Agent Pipeline Patterns

Sandcastle's architecture enables several high-leverage pipeline patterns:

### 1. AFK Software Factory
Queue multiple independent bug fixes or features before logging off. Sandcastle runs them in parallel containers overnight and produces branches or merged commits ready for review the next morning.

### 2. Automated Review Loop
Spin up a reviewer agent that checks code changes against project coding standards before human review. Reviewer operates in an isolated read-only context on the PR branch.

### 3. Planner + Implementer + Reviewer Triad
Three-stage pipeline:
1. **Planner Agent**: Reads issues, maps dependencies via a DAG, and batches non-conflicting tasks.
2. **Implementation Agent (Claude Code)**: Executes each task inside its own sandbox and worktree.
3. **Reviewer Agent**: Reviews the resulting changes automatically against project standards.
4. **Merger Agent**: Handles merging passing branches and closing tracked issues.

### 4. CI Integration
Because `run()` is just a TypeScript function, it can be wired into any CI/CD system (GitHub Actions, etc.) to trigger agent runs on schedule or on specific events (e.g., issues labeled `ready-for-agent`).

## Security Model

Sandcastle's security model rests on four principles:

1. **Blast Radius Containment**: Even if an agent executes a destructive command (`rm -rf`, secret exfiltration, malicious package), the blast radius is strictly limited to the disposable container or microVM instance. The host machine and primary codebase are never directly exposed.
2. **Credential Scoping**: Credentials are injected into the sandbox at runtime via environment variables. The sandbox has no access to the host's broader credential store (AWS profiles, SSH keys, GCP ADC, etc.) unless explicitly mounted.
3. **Ephemeral Execution**: Each run gets a fresh container or VM. State does not persist between runs unless explicitly committed to Git. Abandoned runs leave no orphaned processes or filesystem debris on the host.
4. **Git as the Trust Boundary**: Code only exits the sandbox via Git commits. All changes are inspectable before merge. The `branch` strategy requires explicit human approval before any code reaches `main`.

## Relationship to AI Hero Platform

Sandcastle is the AFK execution layer within Matt Pocock's broader **AI Hero** platform (`aihero.dev`). AI Hero also provides interactive terminal-based agent workflows via slash commands (e.g., `/implement-spec` for supervised task execution). Sandcastle is specifically designed for the opposite end of the supervision spectrum: fully autonomous, unattended execution inside deterministic loops.

As Matt Pocock describes it:
*"For work that is truly AFK, a deterministic loop (Sandcastle, a shell script, a CI job) is faster, cheaper, and more reliable, because no agent makes the orchestration decisions."*

## Technical Internals

The repository is structured around the following key source components:
- `src/SandboxProvider.ts`: Defines the core `SandboxProvider` interface and the `createBindMountSandboxProvider` / `createIsolatedSandboxProvider` factory functions.
- `src/sandboxes/docker.ts`: Docker bind-mount provider implementation. Handles container lifecycle, volume mounts, and exec routing.
- `src/sandboxes/podman.ts`: Podman rootless provider implementation.
- `src/sandboxes/vercel.ts`: Vercel Firecracker microVM provider. Handles bundle sync-in and format-patch sync-out.
- `src/run.ts`: Core `run()` orchestration function. Handles worktree provisioning, task scheduling, agent invocation, and branch strategy execution.

The `exec(command, options)` primitive inside each provider supports streaming output via `onLine` callbacks, custom `cwd`, and environment variable injection.
