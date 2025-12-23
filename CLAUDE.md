# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sparklings is a collection of mini apps built as a monorepo. Each app is independently deployed and client-only (no backend initially, with plans to add backend later).

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Architecture**: Client-only apps, independently deployed

## Common Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev                    # Run all apps in dev mode
pnpm dev --filter=<app>     # Run specific app

# Build
pnpm build                  # Build all apps
pnpm build --filter=<app>   # Build specific app

# Lint
pnpm lint                   # Lint all packages
pnpm lint --filter=<app>    # Lint specific app

# Type checking
pnpm typecheck              # Type check all packages
pnpm typecheck --filter=<app>  # Type check specific app

# Test
pnpm test                   # Run all tests
pnpm test --filter=<app>    # Run tests for specific app
```

## Architecture

### Monorepo Structure

```
sparklings/
├── apps/                   # Individual mini apps
│   └── <app-name>/        # Each app is self-contained
│       ├── src/
│       ├── package.json
│       └── vite.config.ts
├── packages/              # Shared packages
│   ├── ui/               # Shared UI components
│   ├── config/           # Shared configs (TypeScript, ESLint, Tailwind)
│   └── utils/            # Shared utilities
├── package.json          # Root package.json with workspace config
├── pnpm-workspace.yaml   # pnpm workspace configuration
└── turbo.json            # Turborepo pipeline configuration
```

### App Structure

Each app in `apps/` follows a standard Vite + React structure:
- Self-contained with its own `package.json`
- Uses shared packages from `packages/` for common functionality
- Independently deployable
- Client-only (no SSR/SSG initially)

### Shared Packages

Packages in `packages/` are internal workspace dependencies:
- **ui**: Reusable React components styled with Tailwind CSS
- **config**: Shared configuration files (tsconfig, eslint, tailwind presets)
- **utils**: Common utility functions and hooks

### Dependency Management

- Use `pnpm add <package>` to add dependencies to a specific workspace
- Use `pnpm add <package> -w` to add to root workspace
- Internal packages are referenced via workspace protocol: `"@sparklings/ui": "workspace:*"`

### Build System

Turborepo orchestrates builds across the monorepo:
- Caches build outputs for fast incremental builds
- Runs tasks in dependency order
- Parallelizes independent tasks
- Pipeline defined in `turbo.json`

## Development Workflow

### Adding a New App

1. Create new directory in `apps/<app-name>`
2. Initialize with Vite + React + TypeScript template
3. Add to pnpm workspace (automatically detected)
4. Configure Tailwind CSS using shared config
5. Import shared packages as needed

### Adding Shared Code

- Place reusable components in `packages/ui`
- Place utilities/hooks in `packages/utils`
- Place configuration presets in `packages/config`
- Ensure proper exports in package.json

### Future Backend Integration

When adding backend functionality:
- Keep apps client-only by default
- Add backend packages in `packages/` or separate `services/` directory
- Use environment variables for API endpoints
- Consider adding a separate deployment pipeline for backend services
