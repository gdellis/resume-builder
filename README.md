# Resume Builder with AI

A modern, AI-powered resume builder built with Next.js, React, and Tailwind CSS.
Create professional resumes with the help of AI assistants from multiple
providers including Ollama, OpenAI, Mistral, and Anthropic.

## Features

- **AI-Powered Resume Writing**: Get help from AI to write professional
  summaries, generate achievement bullet points, suggest skills, and improve
  your job descriptions
- **Multiple AI Providers**: Choose from Ollama (local/cloud), OpenAI, Mistral AI, or Anthropic
- **Real-time Streaming**: See AI responses as they generate with streaming support
- **Multiple Resume Templates**: Modern, classic, and creative templates
- **Live Preview**: See changes instantly as you edit
- **PDF Export**: Generate and download your resume as a PDF
- **Persistent Storage**: Your resumes are saved in localStorage
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **UI**: React 19, Tailwind CSS, [Base UI](https://base-ui.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) with persistence
- **AI Integration**: Multi-provider support (Ollama, OpenAI, Mistral, Anthropic)
- **PDF Generation**: [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/)

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: Node.js 22 LTS)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd resume-builder
```

1. Install dependencies:
```bash
npm install
```

1. Set up environment variables:
```bash
cp .env.example .env.local
```

1. Configure your AI provider (see [AI Configuration](#ai-configuration) below)

1. Run the development server:
```bash
npm run dev
```

1. Open [http://localhost:3000](http://localhost:3000) in your browser

## AI Configuration

The resume builder supports multiple AI providers. Configure your preferred provider in `.env.local`:

### Ollama (Default)

**Local Mode** (no API key required):
```bash
AI_PROVIDER=ollama
AI_MODEL=llama3.2
```

**Cloud Mode** (requires Ollama Cloud account):
```bash
AI_PROVIDER=ollama
AI_MODEL=gpt-oss:120b-cloud
OLLAMA_API_KEY=your_ollama_api_key
AI_BASE_URL=https://ollama.com
```

### OpenAI
```bash
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
OPENAI_API_KEY=your_openai_api_key
```

### Mistral AI
```bash
AI_PROVIDER=mistral
AI_MODEL=mistral-small-latest
MISTRAL_API_KEY=your_mistral_api_key
```

### Anthropic
```bash
AI_PROVIDER=anthropic
AI_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `AI_PROVIDER` | AI provider: `ollama`, `openai`, `mistral`, `anthropic` | Yes (default: `ollama`) |
| `AI_MODEL` | Model name | Yes (uses provider default) |
| `AI_API_KEY` | Generic API key fallback | No |
| `AI_BASE_URL` | Custom API endpoint | No |
| `OLLAMA_API_KEY` | Ollama Cloud API key | Only for Ollama Cloud |
| `OPENAI_API_KEY` | OpenAI API key | Only for OpenAI |
| `MISTRAL_API_KEY` | Mistral API key | Only for Mistral |
| `ANTHROPIC_API_KEY` | Anthropic API key | Only for Anthropic |

## Building for Production

```bash
npm run build
```

This generates a static export in the `dist` folder.

## Docker Deployment

A Docker Compose configuration is included for easy deployment:

```bash
docker-compose up -d
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── api/ai/chat/     # AI chat API endpoint
│   ├── AIAssistant.tsx  # AI assistant sidebar component
│   └── page.tsx         # Main resume builder page
├── components/
│   ├── ui/             # Base UI components (Button, Input, etc.)
│   ├── editor/         # Editor components (Sidebar, StylePanel)
│   └── templates/      # Resume template components
├── lib/
│   ├── ai/             # AI provider implementations
│   │   ├── types.ts    # AI type definitions
│   │   ├── factory.ts  # Provider factory
│   │   └── providers/  # Provider implementations
│   ├── store.ts        # Zustand state management
│   └── utils.ts        # Utility functions
└── types/
    └── resume.ts       # Resume type definitions
```

### AI Provider Architecture

The AI system is designed with a provider pattern:

1. **Types** (`lib/ai/types.ts`): Unified interfaces for all providers
2. **Factory** (`lib/ai/factory.ts`): Creates provider instances based on config
3. **Providers** (`lib/ai/providers/`): Individual provider implementations
4. **API Route** (`app/api/ai/chat/route.ts`): Handles streaming/non-streaming requests

This architecture makes it easy to add new AI providers - just implement the `AIProviderInterface`.

## Customization

### Adding a New Resume Template

1. Create a new component in `src/components/templates/`
2. Export it from `src/components/templates/index.tsx`
3. Add the template to the style options in the store

### Adding a New AI Provider

1. Create a new provider class in `src/lib/ai/providers/`
2. Implement the `AIProviderInterface`
3. Register the provider in `src/lib/ai/factory.ts`
4. Update types and exports

## Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run linting: `npm run lint`
4. Commit your changes
5. Push to your branch
6. Open a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Base UI](https://base-ui.com/)
- Icons from [Lucide](https://lucide.dev/)
- Fonts from [Vercel](https://vercel.com/font)
