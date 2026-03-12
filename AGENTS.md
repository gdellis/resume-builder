<!-- markdownlint-disable -->
# AGENTS.md - Resume Builder

## Build/Lint Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Run linter (ESLint)
npm run lint

# No test framework configured - ask before adding tests
```

## Code Style

### TypeScript
- **Strict mode enabled** - must handle null/undefined properly
- Target ES2017, module ESNext
- Path alias: `@/*` maps to `./src/*`
- Import type separately: `import type { SomeType } from '...'`

### React/Next.js
- Use React 19, Next.js 15
- App Router (`src/app/`)
- Components can be server or client - use `"use client"` directive when needed
- Client components needed for: DOM events, browser APIs, React hooks

### Styling (Tailwind CSS)
- Use `cn()` utility from `@/lib/utils` for class merging
- `cn()` combines `clsx()` (conditional classes) + `tailwind-merge()` (deduplication)
- Use `class-variance-authority` (cva) for component variants
- Follow existing patterns in `src/components/ui/`

### Import Order
```typescript
// 1. React/Next
import { useState } from 'react';
import Link from 'next/link';

// 2. Third-party
import { create } from 'zustand';

// 3. Absolute project imports (@/)
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// 4. Relative imports (siblings only)
import { SomeLocal } from './local';
```

### Naming Conventions
- PascalCase: Components, Types, Interfaces (`ResumeData`, `Button`)
- camelCase: Functions, variables, hooks (`useResumeStore`, `handleClick`)
- UPPER_SNAKE_CASE: Constants
- Use descriptive names over abbreviations

### Component Structure
```typescript
"use client" // if needed

import { ... } from "..." // imports

// Types
interface Props { ... }

// Constants/variants
const buttonVariants = cva(...)

// Component
function ComponentName({ prop }: Props) {
  return (...)
}

export { ComponentName, buttonVariants }
```

### State Management
- Use Zustand for global state (see `src/lib/store.ts`)
- Use React hooks (`useState`, `useEffect`) for local state
- Store pattern: `useStoreName` for hook name

### Error Handling
- Always handle Promise rejections
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Validate data with TypeScript strict mode

### File Organization
```
src/
  app/           # Next.js app router
  components/
    ui/          # Base UI components (Button, Input, etc.)
    templates/   # Resume templates
    editor/      # Editor-specific components
  lib/           # Utilities, store, helpers
  types/         # TypeScript types/interfaces
```

### Key Dependencies
- `@base-ui/react` - Headless UI primitives
- `zustand` - State management
- `class-variance-authority` - Component variants
- `html2pdf.js` - PDF generation
- `lucide-react` - Icons

## Ollama Integration

### JavaScript Library Usage
```typescript
import { Ollama } from "ollama";

// Local Ollama instance
const ollama = new Ollama();

// Cloud API (requires OLLAMA_API_KEY env var)
const ollamaCloud = new Ollama({
  host: "https://ollama.com",
  headers: {
    Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
  },
});

// Chat with streaming
const response = await ollama.chat({
  model: "gpt-oss:120b-cloud",
  messages: [{ role: "user", content: "Explain quantum computing" }],
  stream: true,
});

for await (const part of response) {
  process.stdout.write(part.message.content);
}
```

### Cloud Models
- Cloud models run on Ollama's cloud service (no local GPU needed)
- Requires `ollama signin` and API key from ollama.com/settings/keys
- Set `OLLAMA_API_KEY` environment variable for API access
- See available models at https://ollama.com/search?c=cloud

### API Endpoints
- Local: `http://localhost:11434/api/chat`
- Cloud: `https://ollama.com/api/chat`

## Notes
- LocalStorage used for data persistence
- No test framework - discuss before adding
- Docker Compose available for deployment
