# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language; Claude generates them interactively using tool calls to manipulate a virtual file system. The preview renders via Babel-transformed JSX inside a sandboxed iframe.

## Commands

```bash
npm run setup        # Initial setup: install deps, generate Prisma client, run migrations
npm run dev          # Dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run all Vitest tests
npm run db:reset     # Reset the SQLite database
```

Run a single test file:
```bash
npx vitest run src/lib/__tests__/file-system.test.ts
```

## Architecture

### State Management
- **FileSystemContext** (`src/lib/contexts/file-system-context.tsx`) — wraps the `VirtualFileSystem` class; all file operations go through this context
- **ChatContext** (`src/lib/contexts/chat-context.tsx`) — manages the AI conversation, streaming state, and tool call lifecycle
- Both contexts are provided in `src/app/[projectId]/page.tsx` and wrap the main layout

### AI Integration
- `/api/chat` route streams responses via Vercel AI SDK's `streamText`
- The LLM is equipped with two tools: `str_replace_editor` (create/update/delete files) and `file_manager` (directory ops), defined in `src/lib/tools/`
- System prompts live in `src/lib/prompts/`
- If `ANTHROPIC_API_KEY` is absent, `MockLanguageModel` in `src/lib/provider.ts` returns hardcoded sample components — useful for offline development

### Virtual File System
- `VirtualFileSystem` (`src/lib/file-system.ts`) is a pure in-memory abstraction; nothing is written to disk
- State serializes to JSON and is stored in the Prisma `Project.data` column (SQLite)
- The preview pipeline: VirtualFileSystem → Babel standalone transforms JSX → import map → `<iframe>` sandbox renders the result (`src/lib/transform/`)

### Persistence & Auth
- Database: Prisma + SQLite (`prisma/dev.db`), schema at `prisma/schema.prisma`
- Auth: JWT in HTTP-only cookies, server-only utilities in `src/lib/auth.ts`
- Server Actions in `src/actions/` handle all data access (projects, user)
- `src/middleware.ts` guards protected routes

### UI Components
- Shadcn/ui components live in `src/components/ui/` (new-york style, neutral base)
- Feature components: `src/components/chat/`, `src/components/editor/`, `src/components/preview/`
- Layout uses `react-resizable-panels` for the chat / preview / code editor split
- Anonymous users can work without signing in; `src/lib/anon-work-tracker.ts` tracks their work in localStorage

## Path Aliases

`@/*` maps to `./src/*` (defined in `tsconfig.json`).

## Code Style

- Use comments sparingly — only for complex or non-obvious logic, not self-explanatory code.

## Testing Conventions

- Tests use Vitest + Testing Library + jsdom
- Test files sit in `__tests__/` directories adjacent to the code they test
- Dependencies (Prisma, AI SDK, auth) are mocked with `vi.mock()`
