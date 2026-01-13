import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { summarizeRequestSchema, generatePromptsRequestSchema, generateContextRequestSchema, agentAssistRequestSchema, cleanTextRequestSchema, researchExamplesRequestSchema, type LLMSettings } from "@shared/schema";
import { z } from "zod";

// Types for unified LLM interface
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionOptions {
  messages: ChatMessage[];
  maxTokens: number;
  jsonMode?: boolean;
}

interface LLMClient {
  provider: "openai" | "anthropic";
  model: string;
  chat: (options: ChatCompletionOptions) => Promise<string | null>;
}

// Default OpenAI client using Replit integration
let defaultOpenai: OpenAI | null = null;

const hasOpenAIConfig = !!(process.env.AI_INTEGRATIONS_OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL);
console.log("OpenAI configuration available:", hasOpenAIConfig);

if (hasOpenAIConfig) {
  try {
    defaultOpenai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
    console.log("OpenAI client initialized successfully");
  } catch (error) {
    console.warn("Failed to initialize OpenAI client:", error);
  }
}

// Create unified LLM client based on settings
function getLLMClient(settings?: LLMSettings): LLMClient | null {
  // If no settings or using Replit integration with OpenAI
  if (!settings || (settings.provider === "openai" && settings.useReplitIntegration)) {
    if (!defaultOpenai) return null;
    
    return {
      provider: "openai",
      model: "gpt-5.1",
      chat: async (options: ChatCompletionOptions) => {
        const response = await defaultOpenai!.chat.completions.create({
          model: "gpt-5.1",
          messages: options.messages,
          max_completion_tokens: options.maxTokens,
          ...(options.jsonMode && { response_format: { type: "json_object" } }),
        });
        return response.choices[0]?.message?.content ?? null;
      }
    };
  }

  // Anthropic provider
  if (settings.provider === "anthropic" && settings.apiKey) {
    try {
      const anthropic = new Anthropic({ apiKey: settings.apiKey });
      const model = settings.model || "claude-sonnet-4-20250514";
      
      // Anthropic has lower max token limits than OpenAI
      const ANTHROPIC_MAX_TOKENS = 8192;
      
      return {
        provider: "anthropic",
        model,
        chat: async (options: ChatCompletionOptions) => {
          // Separate system message from conversation
          const systemMessage = options.messages.find(m => m.role === "system")?.content || "";
          const userMessages = options.messages.filter(m => m.role !== "system");
          
          // Clamp maxTokens to Anthropic's limits
          const clampedTokens = Math.min(options.maxTokens, ANTHROPIC_MAX_TOKENS);
          
          const response = await anthropic.messages.create({
            model,
            max_tokens: clampedTokens,
            system: systemMessage,
            messages: userMessages.map(m => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
          });
          
          const textBlock = response.content.find(c => c.type === "text");
          return textBlock?.type === "text" ? textBlock.text : null;
        }
      };
    } catch (error) {
      console.warn("Failed to create Anthropic client:", error);
      return null;
    }
  }

  // OpenAI or Custom (OpenAI-compatible) provider
  if (settings.apiKey) {
    try {
      const baseUrl = settings.provider === "custom" && settings.baseUrl 
        ? settings.baseUrl 
        : settings.provider === "openai"
          ? "https://api.openai.com/v1"
          : undefined;

      const client = new OpenAI({
        apiKey: settings.apiKey,
        baseURL: baseUrl,
      });
      
      const model = settings.model || "gpt-4o";
      
      return {
        provider: "openai",
        model,
        chat: async (options: ChatCompletionOptions) => {
          const response = await client.chat.completions.create({
            model,
            messages: options.messages,
            max_completion_tokens: options.maxTokens,
            ...(options.jsonMode && { response_format: { type: "json_object" } }),
          });
          return response.choices[0]?.message?.content ?? null;
        }
      };
    } catch (error) {
      console.warn("Failed to create custom OpenAI client:", error);
      return null;
    }
  }

  // Fallback to default Replit integration
  if (defaultOpenai) {
    return {
      provider: "openai",
      model: "gpt-5.1",
      chat: async (options: ChatCompletionOptions) => {
        const response = await defaultOpenai!.chat.completions.create({
          model: "gpt-5.1",
          messages: options.messages,
          max_completion_tokens: options.maxTokens,
          ...(options.jsonMode && { response_format: { type: "json_object" } }),
        });
        return response.choices[0]?.message?.content ?? null;
      }
    };
  }

  return null;
}

// Legacy function for backward compatibility - kept for routes that haven't been migrated yet
function getOpenAIClient(settings?: LLMSettings): { client: OpenAI | null; model: string } {
  // If no settings or using Replit integration with OpenAI
  if (!settings || (settings.provider === "openai" && settings.useReplitIntegration)) {
    return { 
      client: defaultOpenai, 
      model: "gpt-5.1"
    };
  }

  // For non-Anthropic providers with custom API key
  if (settings.apiKey && settings.provider !== "anthropic") {
    try {
      const baseUrl = settings.provider === "custom" && settings.baseUrl 
        ? settings.baseUrl 
        : "https://api.openai.com/v1";

      const client = new OpenAI({
        apiKey: settings.apiKey,
        baseURL: baseUrl,
      });
      
      return { client, model: settings.model || "gpt-4o" };
    } catch (error) {
      console.warn("Failed to create custom OpenAI client:", error);
      return { client: null, model: settings.model || "gpt-4o" };
    }
  }

  // Fallback to default
  return { client: defaultOpenai, model: "gpt-5.1" };
}

function generateMockDetailedSummary(projectName: string, questions: { text: string; answerText?: string }[]) {
  const answered = questions.filter((q) => q.answerText);
  return {
    oneSentenceDefinition: `${projectName} is a demo MVP application that demonstrates the core workflow for ${answered.length} captured requirements.`,
    mvpScope: {
      includes: [
        "Core user authentication",
        "Main feature workflow", 
        "Basic dashboard",
        "Essential data storage",
      ],
      excludes: [
        "Advanced analytics",
        "Social features",
        "Mobile app",
        "Third-party integrations",
      ],
    },
    screens: [
      {
        name: "Landing / Login",
        purpose: "Introduce the app and allow users to sign up or log in",
        uiElements: ["Hero section with value proposition", "Sign up / Login forms", "CTA button"],
        whyItWorks: "Provides immediate context and zero-friction entry point",
      },
      {
        name: "Main Dashboard",
        purpose: "Central hub for accessing core features",
        uiElements: ["Navigation sidebar", "Main content area", "Action buttons", "Status indicators"],
        whyItWorks: "Gives users a clear overview and quick access to key actions",
      },
      {
        name: "Feature Workflow",
        purpose: "Guide users through the primary action",
        uiElements: ["Step indicators", "Input forms", "Submit button", "Success/error feedback"],
        whyItWorks: "Structured flow reduces confusion and improves completion rates",
      },
    ],
    userFlow: [
      "User arrives at landing page",
      "User signs up or logs in",
      "User sees main dashboard",
      "User initiates primary action",
      "User completes workflow",
      "User views results/confirmation",
    ],
    aiArchitecture: {
      roles: [
        {
          name: "Data Agent",
          responsibilities: ["Fetch and validate user inputs", "Query external data sources"],
        },
        {
          name: "Processing Agent", 
          responsibilities: ["Apply business logic", "Transform data for display"],
        },
      ],
      notes: "Connect to OpenAI to generate AI architecture specific to your use case.",
    },
    dataSources: {
      mvpSources: ["User-provided inputs", "Local/session storage", "Basic database"],
      futureSources: ["Third-party APIs", "Analytics services", "External databases"],
    },
    legalGuardrails: [
      "Display clear disclaimers about limitations",
      "Do not store sensitive data without encryption",
      "Include terms of service and privacy policy",
      "Clearly label any AI-generated content as estimates",
    ],
    buildPrompt: `Build a web application called "${projectName}" with:
- User authentication (sign up/login)
- Main dashboard showing key information
- Primary workflow for the core feature
- Clean, modern UI with responsive design

Tech stack: React + Express + PostgreSQL
Focus on clean code, good UX, and mobile-friendly design.
Include proper error handling and loading states.`,
    lastGeneratedAt: new Date().toISOString(),
  };
}

function generateMockPrompts(projectName: string) {
  return {
    prompts: [
      {
        id: "1",
        sequence: 1,
        category: "Project Setup",
        title: "Project Setup + Core UX Skeleton",
        roles: ["User"],
        content: `Build a browser-based MVP web app called "${projectName}".

**Core roles**
* **User (authenticated)**: full access to core features

**MVP screens (3-4)**
1. **Landing / Login**
2. **Main Dashboard**
3. **Primary Feature Page**
4. **Settings/Profile** (optional)

**Global UI requirements**
* Responsive, mobile-friendly layout
* Clear navigation (sidebar or top nav)
* Consistent components for tables, forms, status chips, and empty states
* Top-right user menu with "Logout"

**Auth**
* Implement user login + session
* Block all routes unless logged in`,
        deliverable: "App runs end-to-end with routing, placeholder pages for each screen, and working login/logout.",
        collapsedByDefault: false,
      },
      {
        id: "2",
        sequence: 2,
        category: "Dashboard",
        title: "Dashboard + Core Metrics",
        roles: ["User"],
        content: `Implement the **Main Dashboard** with:

* Summary cards showing key metrics
* Filter bar with relevant options
* Recent activity or items table
* Primary CTA button for main action

**Deliverable**
Filters work and update counts + table. Main action opens relevant workflow.`,
        deliverable: "Dashboard shows real-time data with working filters and navigation to main features.",
        collapsedByDefault: true,
      },
      {
        id: "3",
        sequence: 3,
        category: "Data Management",
        title: "Foundational Data (CRUD)",
        roles: ["User"],
        content: `Create data management screens with tabs or sections for core entities.

Each section:
* Table with key fields + actions (View/Edit/Delete)
* "New" button to add record
* Simple validation and friendly errors

**Deliverable**
Full CRUD for each core entity type.`,
        deliverable: "Full CRUD operations work for all core data entities with validation.",
        collapsedByDefault: true,
      },
      {
        id: "4",
        sequence: 4,
        category: "Core Feature",
        title: "Primary Feature Workflow",
        roles: ["User"],
        content: `Implement the primary feature workflow:

* List view with search + filters
* Create/edit form with required fields
* Status flow and transitions
* Activity timeline showing changes

**Deliverable**
End-to-end workflow works with full auditability.`,
        deliverable: "Primary workflow is complete with status management and history tracking.",
        collapsedByDefault: true,
      },
      {
        id: "5",
        sequence: 5,
        category: "Integrations",
        title: "External Integrations (if applicable)",
        roles: ["User"],
        content: `Add any required integrations:

* Email notifications for key events
* External API connections
* File uploads/attachments

**Deliverable**
Integrations work in development environment.`,
        deliverable: "All integrations are functional with proper error handling.",
        collapsedByDefault: true,
      },
      {
        id: "6",
        sequence: 6,
        category: "Reporting",
        title: "Basic Reporting + Analytics",
        roles: ["User"],
        content: `Add basic reporting:

* Key metrics by category/status
* Date range filtering
* Export capability (optional)

**Deliverable**
Reports update based on filters and remain fast.`,
        deliverable: "Reports show accurate data with working filters.",
        collapsedByDefault: true,
      },
      {
        id: "7",
        sequence: 7,
        category: "Security",
        title: "Guardrails + Access Control",
        roles: ["User", "Admin"],
        content: `Implement security guardrails:

**Access control**
* Users can only see their own data
* Proper permission checks

**Data protection**
* Store only necessary info
* Log key changes for auditability

**Legal/disclaimer**
* Add terms/disclaimer visible in app`,
        deliverable: "Clear permission checks in code paths + UI. Basic terms visible.",
        collapsedByDefault: true,
      },
      {
        id: "8",
        sequence: 8,
        category: "Polish",
        title: "Polish + QA Checklist",
        roles: ["User"],
        content: `Finalize usability and ensure full flow works:

**UX polish**
* Confirm dialogs for delete
* Clear empty states + "create first X" nudges
* Inline validation messages
* Consistent formatting for dates/currency
* Status badges are visually distinct

**Required end-to-end flow**
1. User logs in
2. User creates/manages data
3. User completes primary workflow
4. Dashboard shows updated metrics`,
        deliverable: "README section describing how to run and demo the full flow.",
        collapsedByDefault: true,
      },
      {
        id: "master",
        sequence: 99,
        category: "Master Prompt",
        title: "Complete Build Prompt",
        roles: ["All"],
        content: `Build a web application called "${projectName}" with:
- User authentication (sign up/login)
- Main dashboard showing key information
- Primary workflow for the core feature
- Clean, modern UI with responsive design

This is a demo Build Pack. Connect to OpenAI to generate detailed prompts tailored to your specific requirements.`,
        deliverable: "Complete MVP application ready for user testing.",
        collapsedByDefault: false,
      },
    ],
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const project = await storage.createProject(req.body);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.updateProject(req.params.id, req.body);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const success = await storage.deleteProject(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  app.post("/api/summarize", async (req, res) => {
    try {
      const validatedData = summarizeRequestSchema.parse(req.body);
      const { projectName, questions, llmSettings } = validatedData;

      const answeredQuestions = questions.filter((q) => q.answerText);
      
      if (answeredQuestions.length === 0) {
        return res.status(400).json({ error: "No answered questions provided" });
      }

      const llmClient = getLLMClient(llmSettings);
      
      if (!llmClient) {
        console.log("LLM not configured, returning mock detailed summary");
        return res.json(generateMockDetailedSummary(projectName, questions));
      }

      const qaText = answeredQuestions
        .map((q, i) => `Q${i + 1}: ${q.text}\nA${i + 1}: ${q.answerText}`)
        .join("\n\n");

      const systemPrompt = `You are an expert product manager and MVP architect. Your task is to analyze a requirements capture session and produce a comprehensive, buildable MVP plan.

Be specific, actionable, and grounded in the user's answers. Do not make up details - only include information directly supported by the answers. Be thorough but realistic for a 1-2 week MVP build.

Output your response as a valid JSON object with EXACTLY this structure:
{
  "oneSentenceDefinition": "A single, clear sentence defining what the MVP is and does",
  "mvpScope": {
    "includes": ["List of 4-8 features/capabilities that MUST be in the MVP"],
    "excludes": ["List of 4-8 features explicitly deferred to later versions"]
  },
  "screens": [
    {
      "name": "Screen Name",
      "purpose": "What this screen does for the user",
      "uiElements": ["List of 3-6 specific UI elements on this screen"],
      "whyItWorks": "Brief explanation of why this design works"
    }
  ],
  "userFlow": ["Step 1: User does X", "Step 2: User sees Y", "...up to 8 steps"],
  "aiArchitecture": {
    "roles": [
      {
        "name": "Agent/Service Name",
        "responsibilities": ["What this component does"]
      }
    ],
    "notes": "Brief notes on the AI/backend architecture"
  },
  "dataSources": {
    "mvpSources": ["List of data sources needed for MVP"],
    "futureSources": ["Optional data sources for later phases"]
  },
  "legalGuardrails": ["List of 3-5 legal/safety considerations"],
  "buildPrompt": "A comprehensive Replit-ready prompt that could be copy/pasted to build this MVP. Include tech stack, core features, UI requirements, and constraints. Make it 150-300 words."
}

IMPORTANT:
- Include 3-5 screens that cover the core user journey
- Make the buildPrompt detailed enough to actually build the app
- Be specific about UI elements (buttons, forms, displays)
- Include realistic data sources based on what the user described
- Only include aiArchitecture if the app involves AI/ML features`;

      const userPrompt = `Project: ${projectName}

Here are the questions and answers from the requirements capture session:

${qaText}

Please analyze this and produce a comprehensive MVP plan with all sections filled in based on the user's answers.`;

      try {
        console.log(`Calling ${llmClient.provider} (${llmClient.model}) for detailed summary generation...`);
        
        const timeoutPromise = new Promise<string | null>((_, reject) => 
          setTimeout(() => reject(new Error("LLM timeout")), 60000)
        );
        
        const llmPromise = llmClient.chat({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          maxTokens: 4096,
          jsonMode: llmClient.provider === "openai", // Only OpenAI supports json_object mode
        });

        const content = await Promise.race([llmPromise, timeoutPromise]);
        console.log("LLM detailed summary response received, content length:", content?.length || 0);
        
        if (!content) {
          console.log("Empty LLM response, using fallback");
          return res.json(generateMockDetailedSummary(projectName, questions));
        }

        // Parse JSON, handling possible markdown code blocks from Anthropic
        let jsonContent = content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1].trim();
        }

        const summary = JSON.parse(jsonContent);
        summary.lastGeneratedAt = new Date().toISOString();
        return res.json(summary);
      } catch (aiError) {
        console.error("LLM API error:", aiError);
        console.log("Falling back to mock detailed summary");
        return res.json(generateMockDetailedSummary(projectName, questions));
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to generate summary" });
    }
  });

  app.post("/api/generatePrompts", async (req, res) => {
    try {
      const validatedData = generatePromptsRequestSchema.parse(req.body);
      const { projectName, detailedSummary, questions, llmSettings } = validatedData;

      const llmClient = getLLMClient(llmSettings);
      
      if (!llmClient) {
        console.log("LLM not configured, returning mock prompts");
        return res.json(generateMockPrompts(projectName));
      }

      const answeredQuestions = questions.filter((q) => q.answerText);
      
      const qaText = answeredQuestions
        .map((q, i) => `Q${i + 1}: ${q.text}\nA${i + 1}: ${q.answerText}`)
        .join("\n\n");

      // Build screen specs from detailed summary
      const screenSpecs = detailedSummary.screens
        .map((s) => `## ${s.name}\nPurpose: ${s.purpose}\nUI Elements: ${s.uiElements.join(", ")}`)
        .join("\n\n");

      // Build AI architecture info if present
      const aiArchInfo = detailedSummary.aiArchitecture 
        ? `\nAI/Agent Architecture:\n${detailedSummary.aiArchitecture.roles.map((r: { name: string; responsibilities: string[] }) => `- ${r.name}: ${r.responsibilities.join(", ")}`).join("\n")}`
        : "";

      const systemPrompt = `You are an expert software architect generating a "Build Pack" for vibe coding solutions like Replit Agent. 

Your task is to transform the user's detailed MVP summary into 8-10 HIGHLY DETAILED, SEQUENTIAL prompts that an AI coding agent can execute step-by-step to build a complete, working MVP.

CRITICAL: Each prompt must be EXHAUSTIVELY DETAILED. Vibe coding agents need:
- EXACT screen names and their specific purposes
- COMPLETE lists of UI elements (every button, input, dropdown, table column)
- SPECIFIC field names with data types, validation rules, required/optional status
- PRECISE user flows with step-by-step interactions
- CONCRETE examples of data and edge cases
- EXPLICIT styling requirements (colors, spacing, responsive breakpoints)

PROMPT STRUCTURE FOR EACH:
1. **Overview** - What this prompt builds and why it matters
2. **User Roles** - Who can access this feature and their permissions
3. **Screens/Components** - Detailed breakdown of each UI element
4. **Data Model** - Fields, relationships, and validation rules
5. **User Interactions** - Step-by-step flow of what happens when user clicks/types
6. **Edge Cases** - Empty states, error handling, loading states
7. **Acceptance Criteria** - Specific testable outcomes

SEQUENCE (adapt to the actual MVP):
1. **Foundation**: Project setup, auth system, navigation shell, global layout
2. **Dashboard/Home**: Primary landing page with metrics, quick actions, overview
3. **Core Entity CRUD**: Main data management (create/read/update/delete)
4. **Primary Workflow**: The main user journey from start to finish
5. **Secondary Features**: Additional screens, supporting workflows
6. **Data Display**: Lists, tables, filters, search, sorting, pagination
7. **Integrations**: External APIs, notifications, file uploads
8. **Reports/Analytics**: Charts, exports, summaries
9. **Polish**: Error handling, loading states, empty states, responsive design
10. **Master Prompt**: Complete consolidated prompt for single-shot builds

EXAMPLE LEVEL OF DETAIL:
Instead of: "Add a form to create users"
Write: "**Create User Form** at /admin/users/new with fields:
- Full Name (text, required, 2-100 chars, placeholder: 'Enter full name')
- Email (email, required, must be unique, validate format)
- Role (dropdown: 'Admin', 'Manager', 'User', default: 'User')
- Status (toggle: Active/Inactive, default: Active)
- Phone (tel, optional, format: (XXX) XXX-XXXX)
Buttons: 'Save User' (primary, validates then saves, shows success toast), 'Cancel' (ghost, returns to user list)
On save success: redirect to /admin/users with toast 'User created successfully'
On validation error: highlight invalid fields with red border and error message below each"

Output as JSON:
{
  "prompts": [
    {
      "id": "1",
      "sequence": 1,
      "category": "Foundation",
      "title": "Project Foundation + Auth System",
      "roles": ["User", "Admin"],
      "content": "Extremely detailed prompt with **bold section headers**, specific field names, exact button labels, complete validation rules, error messages, success states...",
      "deliverable": "Specific testable outcome - what the user can do when this is complete",
      "collapsedByDefault": false
    }
  ]
}`;

      const userPrompt = `# PROJECT: ${projectName}

## ONE-SENTENCE MVP DEFINITION
${detailedSummary.oneSentenceDefinition}

## MVP SCOPE

### MUST INCLUDE (Build These):
${detailedSummary.mvpScope.includes.map((f: string) => `- ${f}`).join("\n")}

### EXPLICITLY EXCLUDED (Do NOT Build):
${detailedSummary.mvpScope.excludes.map((f: string) => `- ${f}`).join("\n")}

## SCREENS (User has defined these - include ALL details)

${detailedSummary.screens.map((s) => `### ${s.name}
**Purpose:** ${s.purpose}
**UI Elements:** ${s.uiElements.join(", ")}`).join("\n\n")}

## USER FLOW (Step-by-step journey)
${detailedSummary.userFlow.map((step: string, i: number) => `${i + 1}. ${step}`).join("\n")}
${aiArchInfo}

## DATA SOURCES
**MVP Sources:** ${detailedSummary.dataSources.mvpSources.join(", ")}
${detailedSummary.dataSources.futureSources ? `**Future Sources (do not implement):** ${detailedSummary.dataSources.futureSources.join(", ")}` : ""}

## LEGAL GUARDRAILS & SAFETY
${detailedSummary.legalGuardrails.map((g: string) => `- ${g}`).join("\n")}

## USER'S BUILD PROMPT (Their vision - use as primary reference)
${detailedSummary.buildPrompt}

## ORIGINAL Q&A (Additional context from discovery)
${qaText}

---

INSTRUCTIONS: Use ALL the information above to generate 8-10 HIGHLY DETAILED sequential prompts for Replit Agent. 

Each prompt should be so detailed that:
1. A vibe coding agent can build it WITHOUT asking follow-up questions
2. Field names, button labels, validation rules are EXPLICIT
3. User interactions are STEP-BY-STEP with expected outcomes
4. Error states, empty states, and edge cases are DEFINED
5. The user can test the deliverable immediately after each prompt

Generate prompts that would result in a PRODUCTION-QUALITY MVP, not a prototype.`;

      try {
        console.log(`Calling ${llmClient.provider} (${llmClient.model}) for detailed prompt generation...`);
        
        const timeoutPromise = new Promise<string | null>((_, reject) => 
          setTimeout(() => reject(new Error("LLM timeout")), 90000)
        );
        
        const llmPromise = llmClient.chat({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          maxTokens: 16384,
          jsonMode: llmClient.provider === "openai",
        });

        const content = await Promise.race([llmPromise, timeoutPromise]);
        console.log("LLM response received, content length:", content?.length || 0);
        
        if (!content) {
          console.log("Empty LLM response, using fallback");
          return res.json(generateMockPrompts(projectName));
        }

        // Parse JSON, handling possible markdown code blocks from Anthropic
        let jsonContent = content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1].trim();
        }

        const result = JSON.parse(jsonContent);
        console.log("Parsed prompts count:", result.prompts?.length || 0);
        return res.json(result);
      } catch (aiError) {
        console.error("LLM API error:", aiError);
        console.log("Falling back to mock prompts");
        return res.json(generateMockPrompts(projectName));
      }
    } catch (error) {
      console.error("Error generating prompts:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to generate prompts" });
    }
  });

  // Generate context summary for Agent Assist - called when questions are loaded
  app.post("/api/generateContext", async (req, res) => {
    try {
      const validatedData = generateContextRequestSchema.parse(req.body);
      const { projectName, questions } = validatedData;

      if (questions.length === 0) {
        return res.status(400).json({ error: "No questions provided" });
      }

      // Generate a mock context if OpenAI is not available
      const { client: openai, model } = getOpenAIClient();
      
      if (!openai) {
        console.log("OpenAI not configured, returning mock context");
        return res.json({
          systemPrompt: `You are helping capture requirements for an MVP called "${projectName}". The user is answering questions about their project to help define the build scope. There are ${questions.length} questions covering various aspects of the application.`,
          generatedAt: new Date().toISOString(),
        });
      }

      const questionsList = questions.map((q, i) => `${i + 1}. ${q.text}`).join("\n");

      const systemPrompt = `You are an expert product strategist. Analyze these MVP discovery questions and create a brief context summary that captures the purpose and scope of the application being built. This context will be used to help an AI assistant provide better suggestions during the requirements capture process.

Output a single paragraph (2-3 sentences) that summarizes what kind of application is being defined and what the questions are trying to uncover. Be concise and focus on the application's purpose.`;

      const userPrompt = `Project: ${projectName}

Discovery Questions:
${questionsList}

Create a brief context summary for this project.`;

      try {
        console.log("Calling OpenAI for context generation...");
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("OpenAI timeout")), 30000)
        );
        
        const openaiPromise = openai.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_completion_tokens: 300,
        });

        const response = await Promise.race([openaiPromise, timeoutPromise]) as Awaited<typeof openaiPromise>;

        const content = response.choices[0]?.message?.content;
        
        if (!content) {
          return res.json({
            systemPrompt: `You are helping capture requirements for an MVP called "${projectName}". The user is answering questions about their project.`,
            generatedAt: new Date().toISOString(),
          });
        }

        return res.json({
          systemPrompt: content.trim(),
          generatedAt: new Date().toISOString(),
        });
      } catch (aiError) {
        console.error("LLM API error for context:", aiError);
        return res.json({
          systemPrompt: `You are helping capture requirements for an MVP called "${projectName}". The user is answering questions about their project.`,
          generatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error generating context:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to generate context" });
    }
  });

  // Agent Assist - evaluate answer specificity and provide suggestions
  app.post("/api/agentAssist", async (req, res) => {
    try {
      const validatedData = agentAssistRequestSchema.parse(req.body);
      const { projectName, contextSummary, currentQuestionIndex, currentQuestion, userAnswer, allQuestions } = validatedData;

      if (!userAnswer.trim()) {
        return res.json({
          isSpecificEnough: false,
          suggestions: ["Start by recording your thoughts on this question."],
          improvementAreas: ["No answer provided yet"],
        });
      }

      // Return mock suggestions if OpenAI is not available
      const { client: openai, model } = getOpenAIClient();
      
      if (!openai) {
        console.log("LLM not configured, returning mock suggestions");
        return res.json({
          isSpecificEnough: userAnswer.length > 50,
          suggestions: [
            "Consider adding specific examples",
            "Mention target users or personas",
            "Include any technical constraints",
          ],
          improvementAreas: ["Add more detail about implementation"],
        });
      }

      // Build a numbered list of all questions with status
      const questionsList = allQuestions.map((q, i) => {
        const status = i === currentQuestionIndex ? "[CURRENT]" : (q.hasAnswer ? "[answered]" : "[pending]");
        return `${i + 1}. ${status} ${q.text}`;
      }).join("\n");

      // Identify questions that come later (the user will answer these next)
      const laterQuestions = allQuestions
        .slice(currentQuestionIndex + 1)
        .map((q, i) => `Q${currentQuestionIndex + 2 + i}: ${q.text}`)
        .join(", ");

      const systemPrompt = `You are an expert requirements analyst helping capture MVP specifications. The user is building an application using a "vibe coding" AI assistant like Replit Agent - they describe what they want and the AI builds it.

PROJECT CONTEXT:
${contextSummary}

FULL QUESTION SET (the user will answer all of these):
${questionsList}

CRITICAL RULES:
1. The user is currently answering question #${currentQuestionIndex + 1}
2. DO NOT suggest adding information that is covered by later questions (${laterQuestions ? laterQuestions : "none"})
3. Only suggest improvements SPECIFIC to the current question's scope
4. Provide SHORT, actionable suggestions (10-15 words max each)
5. Focus on what's MISSING from THIS answer, not general MVP advice
6. Maximum 3 suggestions
7. Consider what details Replit Agent would need to implement this specific aspect

Output your response as valid JSON with this structure:
{
  "isSpecificEnough": true/false,
  "suggestions": ["short suggestion 1", "short suggestion 2"],
  "improvementAreas": ["brief area needing more detail"]
}`;

      const userPrompt = `CURRENT QUESTION (#${currentQuestionIndex + 1}): ${currentQuestion}

USER'S ANSWER: ${userAnswer}

Evaluate if this answer provides enough specific detail for THIS question only. Do not ask for information that will be covered in later questions.`;

      try {
        console.log("Calling OpenAI for agent assist...");
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("OpenAI timeout")), 20000)
        );
        
        const openaiPromise = openai.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          max_completion_tokens: 300,
        });

        const response = await Promise.race([openaiPromise, timeoutPromise]) as Awaited<typeof openaiPromise>;

        const content = response.choices[0]?.message?.content;
        
        if (!content) {
          return res.json({
            isSpecificEnough: false,
            suggestions: ["Try adding more specific details to your answer."],
          });
        }

        const result = JSON.parse(content);
        return res.json(result);
      } catch (aiError) {
        console.error("LLM API error for agent assist:", aiError);
        return res.json({
          isSpecificEnough: false,
          suggestions: ["Try adding more specific details to your answer."],
        });
      }
    } catch (error) {
      console.error("Error in agent assist:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to get agent assist" });
    }
  });

  // Clean text endpoint - fixes grammar, spelling, and sentence flow
  app.post("/api/cleanText", async (req, res) => {
    try {
      const validatedData = cleanTextRequestSchema.parse(req.body);
      const { text } = validatedData;

      if (!text.trim()) {
        return res.json({ cleanedText: "" });
      }

      // Return original text if LLM is not available
      const { client: openai, model } = getOpenAIClient();
      
      if (!openai) {
        console.log("LLM not configured, returning original text");
        return res.json({ cleanedText: text });
      }

      const systemPrompt = `You are a text editor. Clean up the following text by:
1. Fixing grammar and spelling errors
2. Improving sentence flow and readability
3. Making sentences complete and coherent
4. Removing filler words and redundancies

IMPORTANT RULES:
- Preserve the original meaning and all information
- Keep the same tone and voice
- Do not add new information
- Do not remove any substantive content
- Return ONLY the cleaned text, nothing else`;

      try {
        console.log("Calling OpenAI to clean text...");
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("OpenAI timeout")), 15000)
        );
        
        const openaiPromise = openai.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
          max_completion_tokens: 1000,
        });

        const response = await Promise.race([openaiPromise, timeoutPromise]) as Awaited<typeof openaiPromise>;

        const cleanedText = response.choices[0]?.message?.content?.trim();
        
        if (!cleanedText) {
          return res.json({ cleanedText: text });
        }

        return res.json({ cleanedText });
      } catch (aiError) {
        console.error("LLM API error for clean text:", aiError);
        return res.json({ cleanedText: text });
      }
    } catch (error) {
      console.error("Error in clean text:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to clean text" });
    }
  });

  // Research & Examples endpoint - provides concrete examples based on question context
  app.post("/api/researchExamples", async (req, res) => {
    try {
      const validatedData = researchExamplesRequestSchema.parse(req.body);
      const { projectName, contextSummary, currentQuestion, userAnswer } = validatedData;

      // Return mock data if LLM is not available
      const { client: openai, model } = getOpenAIClient();
      
      if (!openai) {
        console.log("LLM not configured, returning mock research examples");
        return res.json({
          insights: [
            "Consider how similar solutions in the market approach this problem",
            "Think about edge cases and how users might work around limitations",
          ],
          concreteExamples: [
            {
              title: "Example Implementation",
              description: "A common approach is to use a modular architecture that allows for flexibility.",
              relevance: "Applicable to your MVP scope",
            },
          ],
          industryPractices: [
            "Most successful products in this space start with a focused feature set",
          ],
        });
      }

      const systemPrompt = `You are a product research assistant helping to refine MVP requirements. Based on the project context and the user's answer to a specific question, provide:

1. INSIGHTS: 2-3 key insights or thoughts that could help clarify or strengthen the answer
2. CONCRETE EXAMPLES: 2-4 real-world examples of how others have solved similar problems. Include:
   - Title: A short name for the example
   - Description: What they did and how it worked
   - Relevance: Why this is relevant to the user's situation
3. INDUSTRY PRACTICES: 2-3 common practices or patterns used in this space

Project: ${projectName}
Context: ${contextSummary}

Respond in JSON format:
{
  "insights": ["insight1", "insight2"],
  "concreteExamples": [
    {"title": "Example Name", "description": "What they did", "relevance": "Why it matters"}
  ],
  "industryPractices": ["practice1", "practice2"]
}`;

      try {
        console.log("Calling OpenAI for research examples...");
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("OpenAI timeout")), 30000)
        );
        
        const openaiPromise = openai.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Question: ${currentQuestion}\n\nUser's Answer: ${userAnswer}\n\nProvide research and examples to help make this answer more concrete and well-informed.` },
          ],
          max_completion_tokens: 2000,
        });

        const response = await Promise.race([openaiPromise, timeoutPromise]) as Awaited<typeof openaiPromise>;

        const content = response.choices[0]?.message?.content?.trim();
        
        if (!content) {
          throw new Error("Empty response from LLM");
        }

        // Parse JSON response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("Could not parse JSON from response");
        }

        const parsed = JSON.parse(jsonMatch[0]);
        
        return res.json({
          insights: parsed.insights || [],
          concreteExamples: parsed.concreteExamples || [],
          industryPractices: parsed.industryPractices || [],
        });
      } catch (aiError) {
        console.error("OpenAI API error for research examples:", aiError);
        return res.json({
          insights: ["Research temporarily unavailable. Try again in a moment."],
          concreteExamples: [],
          industryPractices: [],
        });
      }
    } catch (error) {
      console.error("Error in research examples:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to get research examples" });
    }
  });

  return httpServer;
}
