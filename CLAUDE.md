# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Management

- `pnpm install` - Install dependencies
- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production (includes type checking)
- `pnpm preview` - Preview production build

### Testing

- `pnpm test:unit` - Run unit tests with Vitest
- `pnpm test:e2e` - Run end-to-end tests with Playwright
- `npx playwright install` - Install Playwright browsers (first time setup)

### Code Quality

- `pnpm lint` - Run all linters (oxlint and eslint)
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checking

### Individual Tools

- `pnpm lint:oxlint` - Run oxlint only (fast correctness checks)
- `pnpm lint:eslint` - Run ESLint only

## Project Architecture

### Tech Stack

- **Framework**: Vue 3 with Composition API and `<script setup>` syntax
- **Build Tool**: Vite with rolldown-vite
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Testing**: Vitest (unit) + Playwright (e2e)
- **Linting**: oxlint (primary) + ESLint (secondary)
- **Formatting**: Prettier with OXC plugin
- **TypeScript**: Full TS support with vue-tsc

### Key Configuration Files

- `vite.config.ts` - Vite configuration with path aliases (`@` → `./src`)
- `eslint.config.ts` - ESLint config with Vue, TypeScript, Vitest, Playwright, and oxlint plugins
- `tsconfig.json` - Project references for modular TypeScript configuration

### Source Structure

- `src/main.ts` - Application entry point with Pinia and Router setup
- `src/App.vue` - Root component
- `src/router/` - Vue Router configuration (currently empty routes)
- `src/stores/` - Pinia store definitions (example: counter store)
- `src/__tests__/` - Unit test files

### Testing Setup

- **Unit Tests**: Located in `src/__tests__/` using Vitest with jsdom environment
- **E2E Tests**: Located in `e2e/` using Playwright
- Test files follow naming pattern `*.spec.ts` or `*.test.ts`

### Code Quality Tools

- **oxlint**: Fast linter for correctness checks (runs before ESLint)
- **ESLint**: Comprehensive linting with Vue, TypeScript, and test-specific rules
- **Prettier**: Code formatting with OXC plugin for consistent style
- **TypeScript**: Strict type checking with vue-tsc for `.vue` files

### Development Requirements

- Node.js ^20.19.0 or >=22.12.0
- pnpm package manager (lock file present)
- VSCode with Volar extension recommended for Vue development
