import PDFDocument from "pdfkit";
import * as fs from "fs";
import * as path from "path";

const C = {
  primary: "#7C3AED",
  primaryDark: "#5B21B6",
  dark: "#1E1B4B",
  text: "#334155",
  textLight: "#64748B",
  accent: "#F5F3FF",
  white: "#FFFFFF",
  divider: "#E2E8F0",
  green: "#059669",
  blue: "#2563EB",
  orange: "#D97706",
  red: "#DC2626",
  codeBg: "#F1F5F9",
};

function generate() {
  const doc = new PDFDocument({
    size: "letter",
    bufferPages: true,
    margins: { top: 56, bottom: 56, left: 56, right: 56 },
    info: {
      Title: "Vibe Refactor - Complete Application Documentation",
      Author: "Vibe Refactor",
      Subject: "Full Technical & Module Documentation",
    },
  });

  const out = path.join(process.cwd(), "Vibe_Refactor_Application_Documentation.pdf");
  const stream = fs.createWriteStream(out);
  doc.pipe(stream);

  const W = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const ML = doc.page.margins.left;

  function pb(space: number) {
    if (doc.y + space > doc.page.height - doc.page.margins.bottom - 30) {
      doc.addPage();
    }
  }

  function hr(y?: number) {
    const yy = y ?? doc.y;
    doc.moveTo(ML, yy).lineTo(doc.page.width - doc.page.margins.right, yy)
      .strokeColor(C.divider).lineWidth(0.75).stroke();
  }

  function h1(text: string) {
    pb(40);
    doc.fontSize(22).font("Helvetica-Bold").fillColor(C.dark).text(text, { lineGap: 2 });
    doc.moveDown(0.3);
  }

  function h2(text: string) {
    pb(30);
    doc.fontSize(15).font("Helvetica-Bold").fillColor(C.primary).text(text, { lineGap: 2 });
    doc.moveDown(0.25);
  }

  function h3(text: string) {
    pb(24);
    doc.fontSize(12).font("Helvetica-Bold").fillColor(C.primaryDark).text(text, { lineGap: 1 });
    doc.moveDown(0.15);
  }

  function p(text: string, indent = 0) {
    pb(20);
    doc.fontSize(10).font("Helvetica").fillColor(C.text)
      .text(text, ML + indent, undefined, { width: W - indent, lineGap: 2.5 });
  }

  function b(text: string, indent = 18) {
    pb(18);
    const bx = ML + indent - 10;
    const tx = ML + indent;
    const y = doc.y;
    doc.fontSize(10).font("Helvetica").fillColor(C.primary).text("\u2022", bx, y);
    doc.fontSize(10).font("Helvetica").fillColor(C.text).text(text, tx, y, { width: W - indent, lineGap: 2.5 });
  }

  function bold(label: string, rest: string, indent = 18) {
    pb(18);
    const tx = ML + indent;
    const bx = ML + indent - 10;
    const y = doc.y;
    doc.fontSize(10).font("Helvetica").fillColor(C.primary).text("\u2022", bx, y);
    doc.fontSize(10).font("Helvetica-Bold").fillColor(C.dark).text(label, tx, y, { continued: true, width: W - indent });
    doc.font("Helvetica").fillColor(C.text).text(" " + rest);
  }

  function code(text: string) {
    pb(30);
    const pad = 8;
    doc.fontSize(8.5).font("Courier");
    const h = doc.heightOfString(text, { width: W - pad * 2 }) + pad * 2;
    pb(h + 6);
    doc.rect(ML, doc.y, W, h).fill(C.codeBg);
    doc.fillColor(C.text).text(text, ML + pad, doc.y - h + pad, { width: W - pad * 2, lineGap: 2 });
    doc.font("Helvetica");
    doc.moveDown(0.5);
  }

  function tableRow(col1: string, col2: string, col3: string, isHeader = false) {
    pb(20);
    const y = doc.y;
    const font = isHeader ? "Helvetica-Bold" : "Helvetica";
    const color = isHeader ? C.dark : C.text;
    const c1w = 120, c2w = 230, c3w = W - c1w - c2w;
    doc.fontSize(9).font(font).fillColor(color);
    doc.text(col1, ML, y, { width: c1w });
    doc.text(col2, ML + c1w, y, { width: c2w });
    doc.text(col3, ML + c1w + c2w, y, { width: c3w });
    doc.y = Math.max(doc.y, y + 14);
  }

  function sp(n = 0.5) { doc.moveDown(n); }

  // ========== COVER ==========
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.dark);
  doc.fontSize(13).fillColor(C.primary).font("Helvetica-Bold")
    .text("VIBE REFACTOR", ML, 160, { width: W, align: "center", characterSpacing: 6 });
  sp(1.5);
  doc.fontSize(30).fillColor(C.white).font("Helvetica-Bold")
    .text("Complete Application\nDocumentation", { width: W, align: "center", lineGap: 6 });
  sp(1);
  hr(doc.y);
  sp(1);
  doc.fontSize(12).fillColor("#A5B4FC").font("Helvetica")
    .text("Architecture, Module Breakdown & Data Flow\nfor the MVP Wizard System", { width: W, align: "center", lineGap: 4 });
  sp(3);
  doc.fontSize(10).fillColor(C.textLight)
    .text("9,183 lines of source code  |  17 core modules  |  7 AI endpoints", { width: W, align: "center" });
  sp(0.5);
  doc.fontSize(10).fillColor(C.textLight).text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), { width: W, align: "center" });

  // ========== TOC ==========
  doc.addPage();
  h1("Table of Contents");
  sp(0.6);
  const toc = [
    "Part I: Overall Thinking",
    "  1. System Philosophy & Design Rationale",
    "  2. Architecture Overview",
    "  3. Data Flow & State Management",
    "  4. AI Integration Strategy",
    "",
    "Part II: Module Breakdown",
    "  5. Shared Schema (shared/schema.ts)",
    "  6. Server: Storage Layer (server/storage.ts)",
    "  7. Server: API Routes (server/routes.ts)",
    "  8. Client: Project State (use-projects.ts)",
    "  9. Client: Speech Transcription (use-speech-transcription.ts)",
    "  10. Client: Home Page Orchestrator (home.tsx)",
    "  11. Client: Wizard Progress (wizard-progress.tsx)",
    "  12. Step Module: Load Script",
    "  13. Step Module: Capture Answers",
    "  14. Step Module: Review & Summarize",
    "  15. Step Module: Generate Build Pack",
    "  16. Step Module: Statement of Work",
    "  17. Step Module: Create App",
    "  18. Settings System (settings-dialog.tsx)",
    "  19. LLM Logs Viewer (logs-dialog.tsx)",
    "  20. Sidebar & Navigation (app-sidebar.tsx)",
    "",
    "Part III: Cross-Cutting Concerns",
    "  21. Error Handling & Timeouts",
    "  22. Feature Toggles & Real-Time Reactivity",
    "  23. PDF Export Pipeline",
  ];
  toc.forEach(line => {
    if (line === "") { sp(0.3); return; }
    const isBold = line.startsWith("Part");
    doc.fontSize(isBold ? 11 : 10.5).font(isBold ? "Helvetica-Bold" : "Helvetica")
      .fillColor(isBold ? C.dark : C.text).text(line, ML + (isBold ? 0 : 10), undefined, { lineGap: 6 });
  });

  // ========== PART I ==========
  doc.addPage();
  doc.fontSize(16).font("Helvetica-Bold").fillColor(C.primary).text("Part I: Overall Thinking", { width: W, align: "center" });
  sp(1.5);

  h1("1. System Philosophy & Design Rationale");
  sp(0.3);

  h2("The Core Insight");
  p("Vibe Refactor exists because of one observation: the quality of AI-generated code is directly proportional to the quality of the prompt that created it. Most non-technical users fail not because AI tools are weak, but because they cannot articulate what they want with enough precision.");
  sp(0.5);
  p("The system's philosophy rests on three pillars:");
  sp(0.3);
  bold("Voice-First Capture:", "People express ideas more completely when speaking than writing. The system captures natural speech, then structures it.");
  bold("Progressive Refinement:", "Rather than demanding a perfect prompt upfront, the wizard builds understanding incrementally across 5-6 steps, each adding specificity.");
  bold("AI as Collaborator:", "At every step, AI augments the user -- cleaning speech, coaching better answers, generating structured plans, and producing optimized prompts.");
  sp(0.8);

  h2("Design Decisions");
  bold("Client-Side State:", "Project data lives in localStorage, not the database. This keeps the app fast and avoids complex authentication for casual users. Only LLM logs persist to PostgreSQL for auditability.");
  bold("Hybrid Storage Pattern:", "In-memory project storage on the server (for API consistency) combined with PostgreSQL for logs creates a lightweight yet auditable system.");
  bold("Wizard Over Forms:", "A step-by-step wizard enforces logical ordering and prevents users from skipping critical decisions. Each step unlocks only after the previous one has meaningful data.");
  bold("Schema-First Development:", "All data structures are defined in shared/schema.ts with Zod validation, ensuring type safety flows from database to API to UI.");

  // ========== SECTION 2 ==========
  doc.addPage();
  h1("2. Architecture Overview");
  sp(0.3);

  h2("Three-Layer Architecture");
  p("The application follows a standard three-layer architecture optimized for rapid iteration:");
  sp(0.3);

  h3("Shared Layer (shared/)");
  p("A single file (schema.ts, 770 lines) defines every data type, validation schema, and constant used across the application. This is the source of truth for:");
  b("Database table definitions (Drizzle ORM)");
  b("API request/response validation (Zod schemas)");
  b("TypeScript types shared between client and server");
  b("Business constants (pricing tiers, wizard steps, legal defaults)");
  sp(0.5);

  h3("Server Layer (server/)");
  p("An Express.js server (2,078 lines in routes.ts) handles 10+ API endpoints. The server's responsibilities are narrow:");
  b("Accept validated requests from the client");
  b("Route requests to the appropriate LLM provider (OpenAI, Anthropic, Gemini, Groq, or custom)");
  b("Log all LLM calls to PostgreSQL");
  b("Return structured AI responses to the client");
  sp(0.3);
  p("The server does not manage project state -- that responsibility belongs entirely to the client.");
  sp(0.5);

  h3("Client Layer (client/)");
  p("A React + TypeScript frontend (6,300+ lines across components, hooks, and pages) provides the wizard UI. Key patterns:");
  b("State management via a custom useProjects hook backed by localStorage");
  b("Component-per-step architecture with a central orchestrator (home.tsx)");
  b("TanStack React Query for server communication");
  b("Shadcn/ui for consistent, accessible component design");

  sp(0.8);
  h2("Technology Stack Summary");
  sp(0.3);
  tableRow("Layer", "Technology", "Purpose", true);
  hr(); sp(0.2);
  tableRow("UI Framework", "React 18 + TypeScript", "Type-safe components");
  tableRow("Build Tool", "Vite", "Fast dev server & builds");
  tableRow("UI Library", "Shadcn/ui + Tailwind", "Accessible design system");
  tableRow("Data Fetching", "TanStack React Query v5", "Cache & mutations");
  tableRow("Server", "Express.js", "API routing");
  tableRow("Database", "PostgreSQL (Neon)", "LLM log persistence");
  tableRow("ORM", "Drizzle", "Type-safe SQL");
  tableRow("Validation", "Zod", "Runtime type checking");
  tableRow("AI Clients", "OpenAI, Anthropic SDKs", "Multi-provider LLM");
  tableRow("Speech", "Web Speech API", "Browser-native STT");
  tableRow("PDF", "jsPDF / PDFKit", "Document generation");

  // ========== SECTION 3 ==========
  doc.addPage();
  h1("3. Data Flow & State Management");
  sp(0.3);

  h2("Project Lifecycle");
  p("A project moves through a well-defined lifecycle. Understanding this flow is essential to understanding the codebase:");
  sp(0.4);

  bold("Creation:", "User creates a project via sidebar. A Project object is created with a generated ID and stored in localStorage.");
  bold("Script Loading (Step 1):", "User uploads or pastes text. Questions are extracted and stored on the project. Agent context is generated via /api/generateContext.");
  bold("Answer Capture (Step 2):", "For each question, the user records voice or types text. Answers are stored as answerText on each Question object. AI features (Clean Text, Agent Assist, Research) make separate API calls.");
  bold("Summarization (Step 3):", "All Q&A pairs are sent to /api/summarize. The AI returns a DetailedSummary (8 sections). User can edit any section inline.");
  bold("Build Pack (Step 4):", "The DetailedSummary is sent to /api/generatePrompts. The AI returns categorized PromptBundle objects.");
  bold("SOW (Step 5, optional):", "The DetailedSummary is sent to /api/generateSOW. Returns complexity analysis, line items, and pricing.");
  bold("Create App (Step 6):", "The Master Prompt is assembled. User copies it and takes it to Replit Agent.");

  sp(0.8);
  h2("State Architecture");
  p("The application uses a deliberate split between client-side and server-side state:");
  sp(0.3);
  h3("Client-Side (localStorage)");
  b("All project data: questions, answers, summaries, prompts, SOW");
  b("LLM settings (provider, model, API key)");
  b("Feature settings (SOW toggle)");
  b("Vibe coding platform preferences");
  b("Theme preference (light/dark)");
  sp(0.3);
  h3("Server-Side (PostgreSQL)");
  b("LLM call logs only -- every API call is recorded with full request/response data, timing, and status");
  sp(0.3);
  p("This split means the application works offline for existing projects and doesn't require authentication. The tradeoff is that project data doesn't persist across devices.");

  // ========== SECTION 4 ==========
  doc.addPage();
  h1("4. AI Integration Strategy");
  sp(0.3);

  h2("Unified LLM Client");
  p("The server implements a provider-agnostic LLM interface (LLMClient) that normalizes 5 different providers into a single API:");
  sp(0.3);
  code("interface LLMClient {\n  provider: \"openai\" | \"anthropic\" | \"gemini\" | \"groq\";\n  model: string;\n  chat: (options: ChatCompletionOptions) => Promise<string | null>;\n}");
  p("The getLLMClient() factory function creates the appropriate client based on user settings:");
  sp(0.3);
  bold("No settings provided:", "Falls back to Replit's integrated OpenAI connection (gpt-4.1). Zero configuration needed.");
  bold("OpenAI with custom key:", "Direct OpenAI API (user's own quota).");
  bold("Anthropic:", "Uses the Anthropic SDK with special handling for system messages and token limits (16K max).");
  bold("Gemini:", "Routes through Google's OpenAI-compatible endpoint.");
  bold("Groq:", "Routes through Groq's OpenAI-compatible endpoint with 8K token cap.");
  bold("Custom:", "Any OpenAI-compatible API with user-specified base URL.");

  sp(0.8);
  h2("LLM Call Logging");
  p("Every LLM call is wrapped in a logging function that records to PostgreSQL:");
  sp(0.3);
  b("stepName: Which endpoint triggered the call (summarize, agentAssist, cleanText, etc.)");
  b("provider & model: Which LLM was used");
  b("inputMessages: Full prompt sent to the LLM");
  b("outputContent: Complete response received");
  b("durationMs: How long the call took");
  b("status: success, error, or timeout");
  b("errorMessage: Details if the call failed");

  sp(0.5);
  p("This creates a complete audit trail. Users can review all AI interactions through the Logs dialog in the UI, filter by project, and debug any issues with AI outputs.");

  // ========== PART II ==========
  doc.addPage();
  doc.fontSize(16).font("Helvetica-Bold").fillColor(C.primary).text("Part II: Module Breakdown", { width: W, align: "center" });
  sp(1.5);

  h1("5. Shared Schema Module");
  p("File: shared/schema.ts  |  770 lines  |  The single source of truth for all data structures.");
  sp(0.5);

  h2("Database Tables");
  p("One table: llmLogs. Defined with Drizzle ORM, it stores all LLM API call records. Fields include id, projectId, stepName, provider, model, inputMessages (JSONB), outputContent, inputTokens, outputTokens, durationMs, status, errorMessage, and createdAt.");
  sp(0.5);

  h2("Core Data Types");
  bold("Question:", "id, text, answerText, answerTranscriptChunks, isRecording, createdAt. Represents a single interview question with its recorded answer.");
  bold("DetailedSummary:", "The 8-section MVP plan -- oneSentenceDefinition, mvpScope (includes/excludes), screens (ScreenDefinition[]), userFlow, aiArchitecture, dataSources, legalGuardrails, buildPrompt. Each screen has name, purpose, uiElements array, and optional whyItWorks.");
  bold("PromptBundle:", "id, sequence, category, title, content, deliverable, roles. A single prompt in the Build Pack.");
  bold("Project:", "The root data model. Contains id, name, scriptSource, scriptContent, questions, agentContext, summary (legacy), detailedSummary, generatedPrompts, statementOfWork, currentStep, timestamps.");
  sp(0.5);

  h2("Statement of Work Types");
  bold("ComplexityScore:", "tier (simple/medium/complex/enterprise), score (1-100), breakdown (screens, dataComplexity, aiComplexity, integrationComplexity, complianceComplexity, each 1-10), reasoning string.");
  bold("PricingTier:", "Configurable hour ranges per complexity tier. Simple: 20-40hrs, Medium: 40-80hrs, Complex: 80-160hrs, Enterprise: 160-320hrs.");
  bold("SOWLineItem:", "id, category, description, estimatedHours, price, included boolean, notes.");
  bold("MVPSOW:", "Complete MVP SOW with complexityScore, scopeSummary, deliverables (with acceptance criteria), lineItems, totalEstimatedHours, totalPrice, assumptions, exclusions, status (draft/sent/accepted/declined).");
  bold("ExtensionSOW:", "Post-MVP work items. Types: environment_setup, domain_dns, email_service, integration, feature_refinement, security_audit, performance_optimization, training_documentation, custom.");
  bold("LegalTerms:", "Payment terms (deposit%, netDays, lateFee), IP ownership, confidentiality duration, liability limits, warranty scope, termination terms, dispute resolution, governing law.");
  bold("StatementOfWork:", "Container for mvpSOW, extensions array, msaTerms, legalTerms, pricingTiers, hourlyRate.");
  sp(0.5);

  h2("API Request Schemas");
  p("Every API endpoint has a corresponding Zod request schema that validates input before processing. This includes summarizeRequestSchema, generatePromptsRequestSchema, agentAssistRequestSchema, cleanTextRequestSchema, researchExamplesRequestSchema, generateQuestionsRequestSchema, and generateSOWRequestSchema. All accept optional llmSettings for provider configuration.");

  // ========== SECTION 6 ==========
  doc.addPage();
  h1("6. Server: Storage Layer");
  p("File: server/storage.ts  |  98 lines  |  Hybrid in-memory + PostgreSQL storage.");
  sp(0.5);

  h2("IStorage Interface");
  p("Defines the contract for all storage operations:");
  sp(0.3);
  code("interface IStorage {\n  getProject(id: string): Promise<Project | undefined>;\n  getAllProjects(): Promise<Project[]>;\n  createProject(project: Partial<InsertProject>): Promise<Project>;\n  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;\n  deleteProject(id: string): Promise<boolean>;\n  createLlmLog(log: InsertLlmLog): Promise<LlmLog>;\n  getLlmLogs(limit?: number): Promise<LlmLog[]>;\n  getLlmLogsByProject(projectId: string): Promise<LlmLog[]>;\n  clearLlmLogs(): Promise<void>;\n}");

  h2("HybridStorage Implementation");
  p("The implementation uses a Map<string, Project> for in-memory project storage and Drizzle ORM for database log operations. Projects are stored in-memory because the frontend manages persistence through localStorage -- the server only needs temporary state for API calls. LLM logs use PostgreSQL for permanent, queryable storage.");
  sp(0.3);
  p("Key behaviors:");
  b("Projects sorted by updatedAt descending when retrieved");
  b("UUIDs generated via crypto.randomUUID()");
  b("Log queries ordered by createdAt descending with configurable limits");

  // ========== SECTION 7 ==========
  sp(1);
  h1("7. Server: API Routes");
  p("File: server/routes.ts  |  2,078 lines  |  All API endpoints and LLM orchestration.");
  sp(0.5);

  h2("LLM Provider Factory (getLLMClient)");
  p("Lines 77-258. Factory function that creates provider-specific clients. Handles 5 providers (OpenAI, Anthropic, Gemini, Groq, Custom) with provider-specific adaptations:");
  b("Anthropic: Separates system messages, clamps tokens to 16,384 max");
  b("Gemini: Routes to Google's OpenAI-compatible API endpoint");
  b("Groq: Caps tokens at 8,192 for context window limits");
  b("Custom: Accepts arbitrary OpenAI-compatible base URLs");
  sp(0.5);

  h2("API Endpoints");
  sp(0.2);
  bold("POST /api/summarize:", "Takes project name + Q&A pairs. Sends a detailed system prompt instructing the AI to produce an 8-section MVP plan as JSON. 45-second server timeout. 16K max tokens.");
  sp(0.2);
  bold("POST /api/generatePrompts:", "Takes a DetailedSummary and produces categorized PromptBundle objects. Creates sequenced prompts for Product Overview, User Flows, UI Spec, API Spec, Data Model, and a Master Prompt.");
  sp(0.2);
  bold("POST /api/generateContext:", "Called when questions are loaded. Generates a system-level context prompt that informs all subsequent AI interactions (Agent Assist, Research).");
  sp(0.2);
  bold("POST /api/agentAssist:", "Evaluates a user's answer for specificity. Returns isSpecificEnough boolean, suggestions array, and improvementAreas. Context-aware -- considers the project type and all questions.");
  sp(0.2);
  bold("POST /api/researchExamples:", "Provides industry insights, concrete examples with titles/descriptions/relevance, and industry practices relevant to the current question.");
  sp(0.2);
  bold("POST /api/cleanText:", "Takes raw speech-to-text output and returns cleaned, grammatically correct prose while preserving intent.");
  sp(0.2);
  bold("POST /api/generateQuestions:", "Takes a free-text app description and generates structured interview questions.");
  sp(0.2);
  bold("POST /api/generateSOW:", "Takes a DetailedSummary and generates a complete MVPSOW with complexity scoring, line items, deliverables, and pricing.");
  sp(0.2);
  bold("GET /api/logs:", "Returns recent LLM logs with configurable limit.");
  sp(0.2);
  bold("DELETE /api/logs:", "Clears all LLM logs from the database.");

  // ========== SECTION 8 ==========
  doc.addPage();
  h1("8. Client: Project State Hook");
  p("File: client/src/hooks/use-projects.ts  |  172 lines  |  Central state management for all projects.");
  sp(0.5);

  h2("How It Works");
  p("The useProjects hook manages an array of Project objects entirely in localStorage. It provides:");
  sp(0.3);
  b("projects: Full array of all projects");
  b("activeProject: Currently selected project");
  b("activeProjectId / setActiveProjectId: Selection control");
  b("createProject: Creates with generated ID and timestamps");
  b("deleteProject: Removes and selects the next available project");
  b("renameProject: Updates name field");
  b("setCurrentStep: Controls wizard navigation");
  b("setQuestions / updateQuestion: Manage question arrays");
  b("setSummary / setDetailedSummary: Store AI-generated plans");
  b("setGeneratedPrompts: Store Build Pack prompts");
  b("setScriptContent: Store raw uploaded text");
  b("setAgentContext: Store AI context for Agent Assist");
  b("setStatementOfWork: Store complete SOW data");
  sp(0.5);
  p("Every mutation calls saveProjects() which serializes the entire project array to localStorage. The hook initializes by reading from localStorage on mount and auto-selects the first project if none is active.");

  // ========== SECTION 9 ==========
  sp(1);
  h1("9. Client: Speech Transcription Hook");
  p("File: client/src/hooks/use-speech-transcription.ts  |  257 lines  |  Web Speech API integration.");
  sp(0.5);

  h2("Core Capabilities");
  p("Wraps the browser's SpeechRecognition API (with webkit prefix fallback) into a React hook with:");
  sp(0.3);
  bold("Recording Control:", "startRecording(), stopRecording(), toggleRecording() with state tracking.");
  bold("Pause/Resume:", "pauseRecording() and resumeRecording() allow mid-sentence pauses without losing context.");
  bold("Transcript Management:", "Maintains both final transcript and interim (in-progress) transcript. Accumulates results across pause/resume cycles.");
  bold("Continue Mode:", "appendToExisting(existingText, cursorPosition) allows inserting new speech at a specific cursor position in existing text.");
  bold("Error Handling:", "Detects unsupported browsers, handles recognition errors, and provides isSupported flag.");
  bold("Cleanup:", "Properly aborts recognition on unmount to prevent memory leaks.");
  sp(0.3);
  p("The hook fires onTranscriptChange callbacks as speech is recognized, allowing real-time UI updates. It manages the complex state machine of the SpeechRecognition API (start, result, end events) behind a simple interface.");

  // ========== SECTION 10 ==========
  doc.addPage();
  h1("10. Client: Home Page Orchestrator");
  p("File: client/src/pages/home.tsx  |  255 lines  |  The central coordinator for the wizard.");
  sp(0.5);

  h2("Responsibilities");
  p("Home.tsx serves as the \"glue\" between all wizard step components. It:");
  sp(0.3);
  b("Pulls all state and actions from useProjects hook");
  b("Renders the correct step component based on currentStep");
  b("Passes callbacks for step navigation (onNext/onBack)");
  b("Manages API calls for context generation (generateContext)");
  b("Scrolls to top on step changes via useEffect + mainRef");
  b("Handles loading states with skeleton UI");
  b("Auto-creates a default project if none exist");
  b("Listens for feature settings changes (SOW toggle) via custom events");
  sp(0.5);

  h2("Step Rendering Logic");
  p("The renderStep function uses a switch statement on currentStep. When SOW is enabled, step 5 renders the StatementOfWorkStep and step 6 renders CreateAppStep. When SOW is disabled, step 5 renders CreateAppStep directly. The mapping adapts in real-time when the user toggles the SOW setting.");
  sp(0.5);

  h2("Layout Structure");
  p("The page uses a SidebarProvider with the AppSidebar on the left, and a main content area containing the wizard progress bar, a header with settings/logs/theme controls, and the active step component in a scrollable area.");

  // ========== SECTION 11 ==========
  sp(1);
  h1("11. Client: Wizard Progress");
  p("File: client/src/components/wizard-progress.tsx  |  86 lines  |  Visual step indicator.");
  sp(0.5);
  p("A horizontal progress bar showing all wizard steps with completed/active/upcoming states. Adapts between 5 and 6 steps based on the SOW feature toggle. Listens for featureSettingsChanged custom events to update in real-time without page refresh.");
  sp(0.3);
  p("Each step shows a numbered circle (or checkmark when completed) with the step name below. Completed steps are clickable for navigation. Active step is highlighted with the primary purple color.");

  // ========== SECTION 12 ==========
  doc.addPage();
  h1("12. Step Module: Load Script");
  p("File: client/src/components/steps/load-script-step.tsx  |  741 lines");
  sp(0.5);

  h2("Purpose");
  p("The entry point to the wizard. Users load a set of structured questions that will guide their MVP requirements capture. The step provides four input methods:");
  sp(0.3);
  bold("Upload File:", "Accepts .txt and .md files. Parses the file content and extracts questions (lines starting with numbers, bullets, or question marks).");
  bold("Paste Text:", "A text area where users paste their question script. Same extraction logic as file upload.");
  bold("Ask AI:", "Users describe their app idea in free text, and the system calls /api/generateQuestions to produce tailored interview questions.");
  bold("Demo Data:", "Pre-loaded example questions for users who want to explore the system without preparing their own script.");
  sp(0.5);

  h2("Question Management");
  p("Once questions are extracted, users can:");
  b("Reorder questions via drag handles");
  b("Edit question text inline");
  b("Delete individual questions");
  b("Add new custom questions");
  sp(0.3);
  p("When the user proceeds to the next step, the system automatically calls /api/generateContext to create an AI context summary that informs Agent Assist and Research features in Step 2.");

  // ========== SECTION 13 ==========
  sp(1);
  h1("13. Step Module: Capture Answers");
  p("File: client/src/components/steps/capture-answers-step.tsx  |  874 lines  |  The largest step component.");
  sp(0.5);

  h2("Purpose");
  p("This is the heart of Vibe Refactor -- where users answer each question from their script, primarily using voice recording. The component manages a complex interaction model combining speech recognition, text editing, and AI assistance.");
  sp(0.5);

  h2("Voice Recording System");
  b("Uses the useSpeechTranscription hook for Web Speech API integration");
  b("Keyboard shortcuts: R (record/stop), P (pause/resume), N (next question)");
  b("Real-time transcript display showing finalized and interim text");
  b("Continue Recording mode: appends new speech at the cursor position in existing text");
  b("Recording state persisted per-question (each question tracks its own answer)");
  sp(0.5);

  h2("AI Features (per-question)");
  bold("Clean Text:", "Sends the raw transcript to /api/cleanText. Returns grammatically corrected prose. Replaces the answer text in-place.");
  bold("Agent Assist:", "Sends the current answer + project context to /api/agentAssist. Returns specificity evaluation, targeted suggestions, and improvement areas. Displayed in an expandable panel below the answer.");
  bold("Research & Examples:", "Sends the current question + answer + context to /api/researchExamples. Returns industry insights, concrete examples with descriptions, and best practices. Displayed in a separate panel.");
  sp(0.3);
  p("The component tracks which questions have been answered and shows a progress indicator. Users can navigate freely between questions while maintaining all recorded answers.");

  // ========== SECTION 14 ==========
  doc.addPage();
  h1("14. Step Module: Review & Summarize");
  p("File: client/src/components/steps/review-summarize-step.tsx  |  749 lines");
  sp(0.5);

  h2("Purpose");
  p("Transforms all Q&A pairs into a comprehensive, structured MVP plan. This is the most AI-intensive step -- a single call to /api/summarize produces an 8-section DetailedSummary.");
  sp(0.5);

  h2("The 8 Sections");
  bold("One-Sentence Definition:", "A clear statement of what the MVP does and for whom. Editable inline.");
  bold("MVP Scope:", "Two lists -- Includes (what will be built) and Excludes (what's deferred). Each item is individually editable.");
  bold("Screens:", "Detailed screen definitions. Each screen has a name, purpose, and array of UI elements. Fully editable with add/remove for individual elements.");
  bold("User Flow:", "Ordered steps describing how users navigate the application. Each step is editable.");
  bold("AI Architecture:", "Only shown if the MVP involves AI features. Lists agent roles with their responsibilities.");
  bold("Data Sources:", "MVP data sources and optional future data sources.");
  bold("Legal Guardrails:", "Privacy, compliance, and safety considerations.");
  bold("Build Prompt:", "A comprehensive, ready-to-use prompt combining all sections. This is the text that gets pasted into Replit Agent.");
  sp(0.5);

  h2("Editing Model");
  p("Every section is collapsible (using Collapsible components) and editable. Users can modify any field, add or remove list items, and regenerate the entire summary if needed. The component tracks whether the summary has been modified since generation.");

  // ========== SECTION 15 ==========
  sp(1);
  h1("15. Step Module: Generate Build Pack");
  p("File: client/src/components/steps/generate-build-pack-step.tsx  |  413 lines");
  sp(0.5);

  h2("Purpose");
  p("Takes the DetailedSummary and breaks it into categorized prompt bundles. While the Build Prompt from Step 3 is a single monolithic prompt, the Build Pack provides focused, sequenced prompts for methodical development.");
  sp(0.5);

  h2("Prompt Categories");
  b("Product Overview: High-level context about the application");
  b("User Flows: Interaction patterns and navigation");
  b("UI Specification: Screen layouts, components, and visual design");
  b("API Specification: Endpoints, data models, and backend logic");
  b("Data Model: Database schema and relationships");
  b("Master Prompt: Everything combined into a single comprehensive prompt");
  sp(0.5);

  h2("Features");
  b("Each prompt is displayed in a collapsible card with a copy button");
  b("Master Prompt has a prominent one-click copy action");
  b("Prompts are sequenced with numbered ordering for methodical development");
  b("Each prompt includes a \"deliverable\" field describing the expected outcome");

  // ========== SECTION 16 ==========
  doc.addPage();
  h1("16. Step Module: Statement of Work");
  p("File: client/src/components/steps/statement-of-work-step.tsx  |  1,462 lines  |  The most complex module.");
  sp(0.5);

  h2("Purpose");
  p("Generates professional project documentation with complexity analysis, pricing, and legal terms. Designed for freelancers, agencies, and entrepreneurs who need formal project scoping.");
  sp(0.5);

  h2("Sub-Components & Tabs");
  p("The SOW step uses a tabbed interface with four sections:");
  sp(0.3);
  bold("MVP SOW Tab:", "Displays complexity analysis (tier badge, score, breakdown radar), scope summary, deliverables with acceptance criteria, line items table with hours/pricing, totals, assumptions, and exclusions.");
  bold("Extensions Tab:", "Shows post-MVP extension SOWs. Uses predefined templates (environment setup, DNS, email, integrations, feature refinement). Each extension has its own line items and can be added/removed.");
  bold("Legal Terms Tab:", "Comprehensive legal configuration. Payment terms (deposit %, Net days, late fees), IP ownership (client/developer/joint/license), confidentiality (toggle + duration), liability limits, warranty periods, termination (notice days, kill fee %), dispute resolution method, governing law.");
  bold("PDF Export:", "Generates a professionally formatted PDF with all SOW sections, legal language, and signature blocks for client and developer.");
  sp(0.5);

  h2("Complexity Analysis");
  p("The AI scores complexity across 5 dimensions (each 1-10):");
  b("Screens: Number and complexity of UI screens");
  b("Data Complexity: Data sources, relationships, and volume");
  b("AI Complexity: AI/ML features and agent architecture");
  b("Integration Complexity: Third-party APIs and services");
  b("Compliance Complexity: Legal, regulatory, and privacy requirements");
  sp(0.3);
  p("These combine into an overall score (1-100) mapped to tiers: Simple (1-25), Medium (26-50), Complex (51-75), Enterprise (76-100). Each tier has default hour ranges and can have configurable hourly rates.");

  sp(0.8);
  h2("PDF Generation");
  p("Uses jsPDF (client-side) to produce a multi-page PDF including:");
  b("Cover section with project name and generation date");
  b("Complexity analysis with tier badge and dimension scores");
  b("Scope summary with includes/excludes lists");
  b("Deliverables table with acceptance criteria");
  b("Line items table with categories, hours, and pricing");
  b("Extension SOWs with their own line items");
  b("Full legal terms section with 8 clauses");
  b("Signature blocks for client and developer with date lines");

  // ========== SECTION 17 ==========
  doc.addPage();
  h1("17. Step Module: Create App");
  p("File: client/src/components/steps/create-app-step.tsx  |  274 lines");
  sp(0.5);

  h2("Purpose");
  p("The final step that prepares the user to build their application. It provides the completed Master Prompt and guides them through the process of using it with Replit Agent (or their configured vibe coding platform).");
  sp(0.5);

  h2("Features");
  bold("Quality Check:", "Evaluates the completeness of the DetailedSummary. Checks whether screens are defined, user flows exist, scope is clear, and the build prompt is present.");
  bold("Master Prompt Display:", "Shows the full build prompt in a scrollable text area with a prominent copy button.");
  bold("Platform-Specific Instructions:", "Step-by-step instructions for using the Master Prompt with the user's selected vibe coding platform (Replit Agent, Cursor, Bolt, Lovable, v0, Windsurf, Claude Code).");
  bold("Export Options:", "Export the complete project specification as Markdown (.md) or JSON (.json) files for archival or sharing.");

  // ========== SECTION 18 ==========
  sp(1);
  h1("18. Settings System");
  p("File: client/src/components/settings-dialog.tsx  |  479 lines");
  sp(0.5);

  h2("Three Settings Categories");
  sp(0.3);
  h3("LLM Settings Tab");
  b("Provider selection: OpenAI, Anthropic, Gemini, Groq, Custom");
  b("Model selection: Provider-specific model lists");
  b("API key input (stored in localStorage, never sent to server for storage)");
  b("Custom base URL for OpenAI-compatible endpoints");
  b("Default: Uses Replit's built-in OpenAI integration (no key needed)");
  sp(0.3);

  h3("Platform Settings Tab");
  b("Select target vibe coding platform (Replit Agent, Cursor, Bolt, Lovable, v0, Windsurf, Claude Code)");
  b("Add custom platforms with name and description");
  b("Platform selection affects instructions shown in Create App step");
  sp(0.3);

  h3("Features Tab");
  b("Statement of Work toggle: Enable/disable the SOW step in the wizard");
  b("Changes take effect immediately via custom event dispatch (featureSettingsChanged)");
  b("Settings stored in localStorage under separate keys per category");
  sp(0.3);
  p("Settings functions (loadLLMSettings, saveLLMSettings, loadFeatureSettings, saveFeatureSettings, isSOWEnabled) are exported for use by other components.");

  // ========== SECTION 19 ==========
  sp(1);
  h1("19. LLM Logs Viewer");
  p("File: client/src/components/logs-dialog.tsx  |  219 lines");
  sp(0.5);
  p("A dialog that displays all recorded LLM API calls. Fetches logs from GET /api/logs and displays them in a scrollable list. Each log entry shows:");
  b("Step name and timestamp");
  b("Provider and model used");
  b("Duration in milliseconds");
  b("Status badge (success/error/timeout)");
  b("Expandable sections showing full input messages and output content");
  b("Error messages for failed calls");
  sp(0.3);
  p("Includes a \"Clear All Logs\" button that calls DELETE /api/logs. The viewer is accessible from the header toolbar via a button.");

  // ========== SECTION 20 ==========
  doc.addPage();
  h1("20. Sidebar & Navigation");
  p("File: client/src/components/app-sidebar.tsx  |  259 lines");
  sp(0.5);
  p("Uses Shadcn's Sidebar component primitives for a collapsible project navigation sidebar. Features:");
  sp(0.3);
  b("Project list with active project highlighting");
  b("\"New Project\" button to create additional projects");
  b("Inline project renaming via editable text fields");
  b("Delete project with confirmation");
  b("Sidebar header with application branding");
  b("Collapsible via the SidebarTrigger in the main header");
  b("Projects sorted by most recently updated");

  // ========== PART III ==========
  sp(2);
  doc.fontSize(16).font("Helvetica-Bold").fillColor(C.primary).text("Part III: Cross-Cutting Concerns", { width: W, align: "center" });
  sp(1.5);

  h1("21. Error Handling & Timeouts");
  sp(0.3);

  h2("Server-Side");
  b("45-90 second timeouts for LLM calls (varies by endpoint complexity)");
  b("All LLM calls wrapped in try/catch with error logging to database");
  b("Automatic fallback to mock/default data when AI fails or times out");
  b("Structured error responses with descriptive messages");
  b("Zod validation on all request bodies before processing");
  sp(0.5);

  h2("Client-Side");
  b("60-100 second fetch timeouts with AbortController");
  b("Error toast notifications via Shadcn's useToast hook");
  b("Loading states shown via .isPending on mutations and .isLoading on queries");
  b("Graceful degradation: if AI features fail, users can still type manually");

  // ========== SECTION 22 ==========
  sp(1);
  h1("22. Feature Toggles & Real-Time Reactivity");
  sp(0.3);
  p("The feature toggle system (currently the SOW toggle) uses a reactive architecture:");
  sp(0.3);
  bold("Storage:", "Feature settings are stored in localStorage under a dedicated key.");
  bold("Saving:", "When saveFeatureSettings() is called, it writes to localStorage AND dispatches a custom DOM event: window.dispatchEvent(new CustomEvent('featureSettingsChanged', { detail: settings })).");
  bold("Listening:", "Components that depend on feature state (WizardProgress, Home) register event listeners on mount via useEffect. When the event fires, they update their local React state, triggering a re-render.");
  bold("Effect:", "The wizard seamlessly transitions between 5 and 6 steps without a page refresh. All step numbering, progress indicators, and content areas update simultaneously.");

  // ========== SECTION 23 ==========
  sp(1);
  h1("23. PDF Export Pipeline");
  sp(0.3);
  p("The application has two PDF generation systems:");
  sp(0.5);
  h3("Client-Side (jsPDF) -- SOW Export");
  p("Used in the Statement of Work step. Generates a professionally formatted PDF from the SOW data structure. Runs entirely in the browser. Includes complexity analysis, line items tables, extension SOWs, legal terms with 8 clauses, and dual signature blocks.");
  sp(0.5);
  h3("Server-Side (PDFKit) -- System Documentation");
  p("Used for generating system overview and application documentation PDFs. Runs as Node.js scripts. Produces multi-page documents with cover pages, table of contents, styled headings, and page footers.");
  sp(0.3);
  p("Both pipelines produce downloadable PDF files. The client-side pipeline triggers an automatic browser download. The server-side pipeline writes to the project filesystem.");

  // ========== CLOSING ==========
  sp(2);
  hr();
  sp(0.8);
  doc.fontSize(12).font("Helvetica-Bold").fillColor(C.primary)
    .text("Vibe Refactor: 9,183 lines of purpose-built code.", { width: W, align: "center" });
  sp(0.3);
  doc.fontSize(10).font("Helvetica").fillColor(C.textLight)
    .text("17 modules working together to transform ideas into applications.", { width: W, align: "center" });

  // Footers
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor(C.textLight)
      .text(`Vibe Refactor  |  Application Documentation  |  Page ${i + 1} of ${range.count}`, ML, doc.page.height - 32, { width: W, align: "center" });
  }

  doc.end();
  stream.on("finish", () => console.log(`PDF generated: ${out}`));
}

generate();
