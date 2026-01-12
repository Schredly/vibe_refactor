# Vibe Refactor - MVP Wizard

## Overview
Vibe Refactor is a wizard-based application that helps users capture MVP requirements through voice recordings, generates AI-powered summaries, and creates structured build prompts for Replit Agent.

## Tech Stack
- **Frontend**: React + Vite + TypeScript
- **UI Components**: Shadcn/ui with Tailwind CSS
- **Backend**: Express.js
- **AI**: OpenAI via Replit AI Integrations (gpt-5.1)
- **Storage**: In-memory (MemStorage) with localStorage sync on frontend

## Project Structure
```
client/
├── src/
│   ├── components/
│   │   ├── steps/           # Wizard step components
│   │   │   ├── load-script-step.tsx
│   │   │   ├── capture-answers-step.tsx
│   │   │   ├── review-summarize-step.tsx
│   │   │   ├── generate-build-pack-step.tsx
│   │   │   └── create-app-step.tsx
│   │   ├── app-sidebar.tsx   # Project sidebar
│   │   ├── wizard-progress.tsx
│   │   └── theme-toggle.tsx
│   ├── hooks/
│   │   ├── use-projects.ts   # Project state management
│   │   ├── use-speech-transcription.ts  # Web Speech API hook
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── theme-provider.tsx
│   │   └── queryClient.ts
│   └── pages/
│       └── home.tsx          # Main wizard page
server/
├── routes.ts                 # API routes (/api/summarize, /api/generatePrompts)
├── storage.ts                # In-memory storage
└── replit_integrations/      # OpenAI integration
shared/
└── schema.ts                 # TypeScript types and Zod schemas
```

## Key Features

### 1. Load Script (Step 1)
- Upload .txt/.md files or paste text
- Auto-extracts questions from text
- Supports reordering and editing questions

### 2. Capture Answers (Step 2)
- Voice recording via Web Speech API
- Keyboard shortcuts: R = Record/Stop, N = Next question
- Real-time transcript display
- Manual text editing fallback

### 3. Review & Summarize (Step 3)
- AI-generated MVP summary via OpenAI
- Editable sections for refinement
- "Agreed" status for confirmation

### 4. Generate Build Pack (Step 4)
- Creates categorized prompt bundles
- Categories: Product Overview, User Flows, UI Spec, API Spec, etc.
- Copy individual prompts or Master Prompt

### 5. Create App (Step 5)
- One-click copy of Master Prompt
- Step-by-step Replit Agent instructions
- Export as Markdown or JSON

## API Endpoints

### POST /api/summarize
Generates AI summary from Q&A pairs.
```typescript
Request: { projectName: string, questions: { text: string, answerText?: string }[] }
Response: { mvpSummary, assumptions, openQuestions, recommendedMvpScope, risks }
```

### POST /api/generatePrompts
Generates Build Pack prompts.
```typescript
Request: { projectName: string, summary: Summary, questions: Question[] }
Response: { prompts: PromptBundle[] }
```

### Error Handling
- Server-side 45s timeout for OpenAI calls
- Automatic fallback to mock data when AI fails or times out
- Client-side 60s timeout with error toast notifications

## Running the App
The app runs on port 5000 with `npm run dev`.

## Design System
- Primary font: Inter
- Mono font: JetBrains Mono
- Color scheme: Purple primary (#7C3AED)
- Dark mode support via ThemeProvider
- Clean, minimal UI inspired by Linear/Notion
