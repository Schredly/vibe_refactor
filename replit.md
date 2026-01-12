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
- Keyboard shortcuts: R = Record/Stop, P = Pause/Resume, N = Next question
- Pause and resume recording mid-sentence
- Continue Recording to append to existing answers (supports cursor-position insertion)
- Real-time transcript display
- Manual text editing fallback
- Clean Text: AI-powered text cleanup for grammar and flow
- **Agent Assist**: AI-powered suggestions to improve answer specificity
- **Research & Examples**: Provides concrete examples, industry practices, and insights

### 3. Review & Summarize (Step 3) - Detailed MVP Plan
AI generates a comprehensive 8-section MVP plan with sectional editing:
- **One-Sentence Definition**: Clear MVP purpose statement
- **MVP Scope**: Includes/Excludes lists (editable)
- **Screens**: Detailed screen definitions with UI elements (editable)
- **User Flow**: Step-by-step user journey (editable)
- **AI Architecture**: Agent roles and responsibilities (if applicable)
- **Data Sources**: MVP and future data sources
- **Legal Guardrails**: Safety and compliance considerations
- **Build Prompt**: Replit-ready comprehensive build prompt (editable)

Each section is collapsible and editable before proceeding to Build Pack.

### 4. Generate Build Pack (Step 4)
- Creates categorized prompt bundles from detailed summary
- Categories: Product Overview, User Flows, UI Spec, API Spec, etc.
- Copy individual prompts or Master Prompt

### 5. Create App (Step 5)
- One-click copy of Master Prompt
- Quality check based on detailed summary completeness
- Step-by-step Replit Agent instructions
- Export as Markdown or JSON

## API Endpoints

### POST /api/summarize
Generates detailed AI MVP plan from Q&A pairs.
```typescript
Request: { projectName: string, questions: { text: string, answerText?: string }[] }
Response: DetailedSummary {
  oneSentenceDefinition: string,
  mvpScope: { includes: string[], excludes: string[] },
  screens: ScreenDefinition[],
  userFlow: string[],
  aiArchitecture?: { roles: AgentRole[], notes: string },
  dataSources: { mvpSources: string[], futureSources?: string[] },
  legalGuardrails: string[],
  buildPrompt: string,
  lastGeneratedAt: string
}
```

### POST /api/generatePrompts
Generates Build Pack prompts from detailed summary.
```typescript
Request: { projectName: string, detailedSummary: DetailedSummary, questions: Question[] }
Response: { prompts: PromptBundle[] }
```

### POST /api/generateContext
Generates context summary when questions are loaded (used by Agent Assist).
```typescript
Request: { projectName: string, questions: { text: string }[] }
Response: { systemPrompt: string, generatedAt: string }
```

### POST /api/agentAssist
Evaluates answer specificity and provides suggestions.
```typescript
Request: { projectName: string, contextSummary: string, currentQuestion: string, userAnswer: string }
Response: { isSpecificEnough: boolean, suggestions: string[], improvementAreas?: string[] }
```

### POST /api/researchExamples
Provides research-backed examples and industry insights.
```typescript
Request: { projectName: string, contextSummary: string, currentQuestion: string, userAnswer: string }
Response: { insights: string[], concreteExamples: ConcreteExample[], industryPractices?: string[] }
```

### POST /api/cleanText
Cleans up speech-to-text transcriptions.
```typescript
Request: { text: string }
Response: { cleanedText: string }
```

### Error Handling
- Server-side 45-60s timeout for OpenAI calls (varies by endpoint complexity)
- Automatic fallback to mock data when AI fails or times out
- Client-side 60-90s timeout with error toast notifications

## Running the App
The app runs on port 5000 with `npm run dev`.

## Design System
- Primary font: Inter
- Mono font: JetBrains Mono
- Color scheme: Purple primary (#7C3AED)
- Dark mode support via ThemeProvider
- Clean, minimal UI inspired by Linear/Notion
