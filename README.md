<h1 align="center">ArkansasIo Agent Lumos Aris</h1>

<p align="center"><strong>Terminal-native AI development agent for autonomous software engineering</strong></p>
<p align="center">Build • Plan • Compose • Remember • Verify • Automate</p>

<p align="center">
  <a href="https://github.com/ArkansasIo/Lumos-Aris-Code">GitHub</a> |
  <a href="https://github.com/ArkansasIo/Lumos-Aris-Code/issues">Issues</a> |
  <a href="https://github.com/ArkansasIo/Lumos-Aris-Code/blob/main/LICENSE">License</a>
</p>

---

## Overview

**ArkansasIo Agent Lumos Aris** is an AI-powered terminal development environment built for serious software engineering workflows.

Lumos Aris can inspect and modify source code, execute development commands, work with Git repositories, coordinate subagents, maintain persistent project memory, and drive structured development workflows from planning through verification.

The project supports **local AI inference** and compatible remote model providers. Local inference can run through Ollama, allowing developers to use the agent without requiring a paid cloud API.

### Design goals

- **Developer-first** — operate directly inside real software projects.
- **Agentic** — execute multi-step development tasks instead of only generating text.
- **Persistent** — retain useful project knowledge across sessions.
- **Composable** — combine agents, skills, commands, MCP servers, and tools.
- **Local-first** — support local models and privacy-conscious workflows.
- **Verifiable** — encourage testing, type checking, review, and validation.
- **Extensible** — support plugins, custom providers, automation, and integrations.

---

## Quick Start

### Requirements

Recommended:

- Windows 10/11, macOS, or Linux
- Bun
- Ollama for local inference
- Git
- A supported AI model

### Install dependencies

~~~bash
git clone https://github.com/ArkansasIo/Lumos-Aris-Code.git
cd Lumos-Aris-Code
bun install
~~~

### Run Lumos Aris

~~~bash
bun run dev
~~~

The application can also be started through the platform-specific launcher and setup scripts in the scripts/ directory.

### Windows automatic setup

From PowerShell:

~~~powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\auto_setup_lumos_aris.ps1
~~~

From Command Prompt:

~~~bat
scripts\auto_setup_lumos_aris.bat
~~~

For manual local-model setup:

~~~powershell
.\scripts\setup_free_lumos_aris_llm.ps1
~~~

Then start the agent:

~~~powershell
.\scripts\start_free_lumos_aris.ps1
~~~

---

## Local AI — Ollama

Lumos Aris supports local inference through Ollama.

A typical local endpoint is:

~~~text
http://127.0.0.1:11434/v1
~~~

Example model:

~~~bash
ollama pull qwen2.5-coder:7b
~~~

Choose a model size appropriate for available CPU, GPU, RAM, and VRAM.

See the Ollama model library for available models.

> **No paid-token requirement:** local inference does not require a paid cloud API key. Models still have normal context and output-token limits because those are properties of the model.

### Privacy

When configured for local inference, model requests are sent to the local Ollama service on 127.0.0.1.

Lumos Aris can also support optional network features such as MCP servers, web tools, remote providers, and integrations. Disable those features when a fully isolated/offline workflow is required.

---

# Core Features

## Multi-Agent Development

Lumos Aris provides multiple primary operating modes:

| Agent | Purpose |
|---|---|
| **build** | Full development workflow with tools for implementing changes |
| **plan** | Read-oriented analysis, architecture, investigation, and planning |
| **compose** | Structured orchestration for specification-driven development |

Press Tab where supported to switch between primary agents.

Subagents can be created by the primary agent when additional analysis, implementation, testing, or review work is useful.

---

## Persistent Project Memory

Lumos Aris maintains project context across development sessions.

The memory architecture can include:

- **Project memory** — durable architecture decisions, project rules, and important knowledge.
- **Session checkpoints** — structured snapshots of active work.
- **Scratch notes** — temporary working information.
- **Task progress** — per-task execution state and progress records.

This allows long-running engineering tasks to resume without rebuilding the entire project context from scratch.

---

## Intelligent Context Management

Long-running AI sessions can exceed model context limits. Lumos Aris provides mechanisms for managing that state.

Capabilities include:

- Automatic checkpoint creation
- Context reconstruction
- Project-memory retrieval
- Task-progress restoration
- Budgeted context injection
- Importance-based memory selection
- Session continuity

---

## Task Tracking

Development tasks can be represented as hierarchical work trees:

~~~text
T1
├── T1.1
├── T1.2
│   ├── T1.2.1
│   └── T1.2.2
└── T1.3
~~~

Task state can be connected with checkpoints and persistent project memory so complex implementation work remains traceable.

---

## Subagent Orchestration

The primary agent can delegate work to specialized subagents.

Typical responsibilities include:

- Repository investigation
- Architecture analysis
- Implementation
- Testing
- Debugging
- Code review
- Documentation
- Verification
- Research
- Release preparation

---

## Goal and Stop Conditions

The /goal command can define an explicit completion condition for an autonomous session.

This is useful for long-running tasks such as:

- Fixing a build
- Completing a feature
- Migrating a codebase
- Repairing tests
- Performing repository cleanup
- Preparing a release

---

## Compose Mode

Compose Mode provides a structured software-engineering workflow:

~~~text
Specification
     ↓
Planning
     ↓
Implementation
     ↓
Testing
     ↓
Code Review
     ↓
Verification
     ↓
Merge / Release
~~~

Compose workflows can combine skills, agents, commands, testing, debugging, and verification into repeatable development processes.

---

## Dream & Distill

### /dream

Analyzes recent development activity and extracts useful long-term knowledge into project memory.

Examples include architecture decisions, important conventions, repeated project rules, lessons learned, and stable implementation patterns.

### /distill

Identifies repeated development workflows and can turn high-confidence patterns into reusable skills, subagents, commands, and development procedures.

---

## Voice Input

Lumos Aris can support streaming voice-driven development workflows where the configured voice/ASR provider is available.

Voice input can be useful for describing implementation tasks, navigating development workflows, giving high-level commands, and capturing ideas without typing.

Audio tooling may require platform-specific dependencies such as sox.

### WSLg example

~~~bash
sudo apt install -y sox pulseaudio libasound2-plugins
export PULSE_SERVER=unix:/mnt/wslg/PulseServer
~~~

---

# Provider Support

Lumos Aris is designed to work with compatible AI model providers.

Supported configurations can include:

- Local Ollama models
- OpenAI-compatible APIs
- Self-hosted model gateways
- MCP-connected services
- Other providers supported by the project configuration

External model names and provider identifiers should remain unchanged when they are required for API compatibility.

---

# Configuration

The Lumos Aris configuration convention is:

~~~text
.lumos-aris/
~~~

and:

~~~text
~/.config/lumos-aris/
~~~

Configuration can control:

- Providers
- Models
- Agents
- Permissions
- Checkpoints
- Memory
- MCP servers
- Commands
- Keybindings
- Themes
- Experimental features

Existing installations containing legacy configuration directories should be migrated carefully rather than deleted automatically.

---

# Development

~~~bash
bun install
bun run dev
bun run typecheck
~~~

Run package-specific tests from the appropriate workspace/package directory.

The repository is a Bun workspace containing the core application, SDK, UI, plugins, scripts, console, desktop application, and supporting packages.

---

# Repository Architecture

~~~text
packages/
├── app/          # Web application
├── console/      # Console services and application
├── desktop/      # Desktop application
├── enterprise/   # Enterprise functionality
├── opencode/     # Core terminal agent
├── plugin/       # Plugin system
├── script/       # Development and release scripts
├── sdk/          # SDK packages
├── shared/       # Shared utilities
├── slack/        # Slack integration
├── storybook/    # Component development
└── ui/           # Shared UI components
~~~

The primary command-line product is **Lumos Aris**.

CLI command:

~~~bash
lumos-aris
~~~

---

# Security and Responsible Use

Lumos Aris is an autonomous development tool capable of reading files, modifying code, executing commands, and interacting with external services.

Recommended practices:

- Review generated changes before production deployment.
- Keep credentials in environment variables or secure secret stores.
- Avoid unnecessary filesystem permissions.
- Review MCP servers before connecting them.
- Use isolated development environments for untrusted repositories.
- Run security scanners and tests before releasing software.
- Keep dependencies updated.
- Do not expose local development services publicly without authentication.

---

# Windows Tools

The repository includes Windows-oriented setup, repair, and launcher scripts.

Documentation:

- [Windows Setup](./docs/WINDOWS_SETUP.md)
- [Project Setup](./docs/PROJECT_SETUP.md)
- [Automatic Setup](./AUTO_SETUP.md)

The scripts/ directory contains setup, repair, local-model, and launch automation.

---

# Relationship to OpenCode

ArkansasIo Agent Lumos Aris is based on the OpenCode development-agent architecture and extends that foundation with:

- Persistent memory
- Context reconstruction
- Task tracking
- Subagent orchestration
- Goal-driven workflows
- Compose workflows
- Local inference
- Development automation
- Dream/Distill workflows
- ArkansasIo-specific tooling and packaging

Lumos Aris is intended to be a distinct ArkansasIo product identity while retaining compatible upstream concepts and open-source development practices.

---

# Project Identity

**Product:** ArkansasIo Agent Lumos Aris

**Short name:** Lumos Aris

**CLI:** lumos-aris

**Organization:** ArkansasIo

**Current repository:** ArkansasIo/Lumos-Aris-Code

**License:** MIT

The GitHub repository currently retains its historical repository path for compatibility while the application is being migrated to the ArkansasIo Agent Lumos Aris identity.

---

# Community and Contributions

Issues, feature requests, documentation improvements, bug reports, and pull requests are welcome.

When submitting an issue, include:

1. Operating system
2. Bun version
3. Node.js version if relevant
4. Model/provider configuration
5. Reproduction steps
6. Error output
7. Relevant logs
8. Expected behavior
9. Actual behavior

For security-sensitive issues, do not publish credentials, API keys, tokens, private source code, or other sensitive information in public issues.

---

# License

Source code is licensed under the [MIT License](./LICENSE).

See [USE_RESTRICTIONS.md](./USE_RESTRICTIONS.md) for project-specific use restrictions.

---

<p align="center">
  <strong>ArkansasIo Agent Lumos Aris</strong><br>
  AI-assisted software engineering for developers, projects, and autonomous workflows.
</p>
