import { z } from "zod";
import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// ===========================================
// DATABASE TABLES (Drizzle ORM)
// ===========================================

// LLM Logs table - tracks all LLM API calls
export const llmLogs = pgTable("llm_logs", {
  id: serial("id").primaryKey(),
  projectId: text("project_id"),
  stepName: text("step_name").notNull(), // e.g., "summarize", "generatePrompts", "agentAssist", "cleanText"
  provider: text("provider").notNull(), // "openai", "anthropic", "custom"
  model: text("model").notNull(),
  inputMessages: jsonb("input_messages").notNull(), // The messages sent to the LLM
  outputContent: text("output_content"), // The response from the LLM
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  durationMs: integer("duration_ms"),
  status: text("status").notNull().default("success"), // "success", "error", "timeout"
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLlmLogSchema = createInsertSchema(llmLogs).omit({ id: true, createdAt: true });
export type InsertLlmLog = z.infer<typeof insertLlmLogSchema>;
export type LlmLog = typeof llmLogs.$inferSelect;

// Question schema - individual questions extracted from a script
export const questionSchema = z.object({
  id: z.string(),
  text: z.string(),
  answerText: z.string().optional(),
  answerTranscriptChunks: z.array(z.string()).optional(),
  isRecording: z.boolean().optional(),
  createdAt: z.string().optional(),
});

export type Question = z.infer<typeof questionSchema>;
export type InsertQuestion = Omit<Question, "id">;

// Screen definition for detailed summary
export const screenDefinitionSchema = z.object({
  name: z.string(),
  purpose: z.string(),
  uiElements: z.array(z.string()),
  whyItWorks: z.string().optional(),
});

export type ScreenDefinition = z.infer<typeof screenDefinitionSchema>;

// AI/Agent architecture definition
export const agentArchitectureSchema = z.object({
  roles: z.array(z.object({
    name: z.string(),
    responsibilities: z.array(z.string()),
  })),
  notes: z.string().optional(),
});

export type AgentArchitecture = z.infer<typeof agentArchitectureSchema>;

// Data sources definition
export const dataSourcesSchema = z.object({
  mvpSources: z.array(z.string()),
  futureSources: z.array(z.string()).optional(),
});

export type DataSources = z.infer<typeof dataSourcesSchema>;

// Detailed summary schema - comprehensive MVP plan
export const detailedSummarySchema = z.object({
  oneSentenceDefinition: z.string(),
  mvpScope: z.object({
    includes: z.array(z.string()),
    excludes: z.array(z.string()),
  }),
  screens: z.array(screenDefinitionSchema),
  userFlow: z.array(z.string()),
  aiArchitecture: agentArchitectureSchema.optional(),
  dataSources: dataSourcesSchema,
  legalGuardrails: z.array(z.string()),
  buildPrompt: z.string(),
  agreed: z.boolean().optional(),
  lastGeneratedAt: z.string().optional(),
});

export type DetailedSummary = z.infer<typeof detailedSummarySchema>;

// Legacy summary schema - kept for backward compatibility
export const summarySchema = z.object({
  mvpSummary: z.string(),
  assumptions: z.array(z.string()),
  openQuestions: z.array(z.string()),
  recommendedMvpScope: z.object({
    include: z.array(z.string()),
    defer: z.array(z.string()),
  }),
  risks: z.array(z.string()),
  agreed: z.boolean().optional(),
});

export type Summary = z.infer<typeof summarySchema>;

// Prompt bundle schema - generated build prompts
export const promptBundleSchema = z.object({
  id: z.string(),
  sequence: z.number(), // Order in the build sequence (1, 2, 3...)
  category: z.string(),
  title: z.string(),
  content: z.string(),
  deliverable: z.string().optional(), // Expected outcome of this prompt
  roles: z.array(z.string()).optional(), // Affected user roles
  collapsedByDefault: z.boolean().optional(),
});

export type PromptBundle = z.infer<typeof promptBundleSchema>;

// Agent Assist context schema - generated when questions are loaded
export const agentContextSchema = z.object({
  systemPrompt: z.string(),
  generatedAt: z.string(),
});

export type AgentContext = z.infer<typeof agentContextSchema>;

// LLM Settings schema - configurable AI provider
export const llmProviderSchema = z.enum(["openai", "anthropic", "custom"]);
export type LLMProvider = z.infer<typeof llmProviderSchema>;

export const llmSettingsSchema = z.object({
  provider: llmProviderSchema.default("openai"),
  model: z.string().default("gpt-4o"),
  apiKey: z.string().optional(), // User's own API key (optional - uses Replit integration if not set)
  baseUrl: z.string().optional(), // Custom base URL for API
  useReplitIntegration: z.boolean().default(true), // Whether to use Replit's built-in OpenAI integration
});

export type LLMSettings = z.infer<typeof llmSettingsSchema>;

// Default LLM settings
export const defaultLLMSettings: LLMSettings = {
  provider: "openai",
  model: "gpt-4o",
  useReplitIntegration: true,
};

// Vibe Coding Platform schema - target platforms for generated prompts
export const vibeCodingPlatformSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  isBuiltIn: z.boolean().default(false), // Built-in platforms can't be deleted
});

export type VibeCodingPlatform = z.infer<typeof vibeCodingPlatformSchema>;

export const vibeCodingSettingsSchema = z.object({
  platforms: z.array(vibeCodingPlatformSchema),
  selectedPlatformId: z.string(),
});

export type VibeCodingSettings = z.infer<typeof vibeCodingSettingsSchema>;

// Default vibe coding platforms
export const defaultVibeCodingPlatforms: VibeCodingPlatform[] = [
  {
    id: "replit",
    name: "Replit Agent",
    description: "AI-powered development on Replit",
    isDefault: true,
    isBuiltIn: true,
  },
];

export const defaultVibeCodingSettings: VibeCodingSettings = {
  platforms: defaultVibeCodingPlatforms,
  selectedPlatformId: "replit",
};

// Project schema - main data model
export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  scriptSource: z.enum(["upload", "paste", "googleDrive"]).optional(),
  scriptContent: z.string().optional(),
  questions: z.array(questionSchema).optional(),
  agentContext: agentContextSchema.optional(),
  summary: summarySchema.optional(), // Legacy - kept for backward compatibility
  detailedSummary: detailedSummarySchema.optional(), // New detailed summary
  generatedPrompts: z.array(promptBundleSchema).optional(),
  currentStep: z.number().default(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Project = z.infer<typeof projectSchema>;
export type InsertProject = Omit<Project, "id" | "createdAt" | "updatedAt">;

// Insert schemas for API requests
export const insertProjectSchema = projectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProjectSchema = projectSchema.partial().omit({
  id: true,
  createdAt: true,
});

// Agent Assist response schema
export const agentAssistResponseSchema = z.object({
  isSpecificEnough: z.boolean(),
  suggestions: z.array(z.string()),
  improvementAreas: z.array(z.string()).optional(),
});

export type AgentAssistResponse = z.infer<typeof agentAssistResponseSchema>;

// API request/response types
export const summarizeRequestSchema = z.object({
  projectName: z.string(),
  questions: z.array(
    z.object({
      text: z.string(),
      answerText: z.string().optional(),
    })
  ),
  llmSettings: llmSettingsSchema.optional(),
});

export type SummarizeRequest = z.infer<typeof summarizeRequestSchema>;

// Agent Assist request schemas
export const generateContextRequestSchema = z.object({
  projectName: z.string(),
  questions: z.array(z.object({ text: z.string() })),
});

export type GenerateContextRequest = z.infer<typeof generateContextRequestSchema>;

export const agentAssistRequestSchema = z.object({
  projectName: z.string(),
  contextSummary: z.string(),
  currentQuestionIndex: z.number(),
  currentQuestion: z.string(),
  userAnswer: z.string(),
  allQuestions: z.array(z.object({
    text: z.string(),
    hasAnswer: z.boolean(),
  })),
});

export type AgentAssistRequest = z.infer<typeof agentAssistRequestSchema>;

export const cleanTextRequestSchema = z.object({
  text: z.string(),
});

export type CleanTextRequest = z.infer<typeof cleanTextRequestSchema>;

// Research & Examples schemas
export const researchExamplesRequestSchema = z.object({
  projectName: z.string(),
  contextSummary: z.string(),
  currentQuestion: z.string(),
  userAnswer: z.string(),
});

export type ResearchExamplesRequest = z.infer<typeof researchExamplesRequestSchema>;

export const researchExamplesResponseSchema = z.object({
  insights: z.array(z.string()),
  concreteExamples: z.array(z.object({
    title: z.string(),
    description: z.string(),
    relevance: z.string(),
  })),
  industryPractices: z.array(z.string()).optional(),
});

export type ResearchExamplesResponse = z.infer<typeof researchExamplesResponseSchema>;

export const generatePromptsRequestSchema = z.object({
  projectName: z.string(),
  detailedSummary: detailedSummarySchema,
  questions: z.array(
    z.object({
      text: z.string(),
      answerText: z.string().optional(),
    })
  ),
  llmSettings: llmSettingsSchema.optional(),
});

export type GeneratePromptsRequest = z.infer<typeof generatePromptsRequestSchema>;

// Detailed summarize response type
export const detailedSummarizeResponseSchema = detailedSummarySchema;
export type DetailedSummarizeResponse = DetailedSummary;

// Wizard steps
export const WIZARD_STEPS = [
  { id: 1, name: "Load Script", description: "Upload or paste your question script" },
  { id: 2, name: "Capture Answers", description: "Record voice answers to each question" },
  { id: 3, name: "Review & Summarize", description: "Review and approve the MVP summary" },
  { id: 4, name: "Generate Build Pack", description: "Create prompts for building the MVP" },
  { id: 5, name: "Create App", description: "Hand off to Replit for app generation" },
] as const;
