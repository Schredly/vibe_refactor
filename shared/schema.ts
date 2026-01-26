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
export const llmProviderSchema = z.enum(["openai", "anthropic", "gemini", "groq", "custom"]);
export type LLMProvider = z.infer<typeof llmProviderSchema>;

export const llmSettingsSchema = z.object({
  provider: llmProviderSchema.default("openai"),
  model: z.string().default("gpt-4o"),
  apiKey: z.string().optional(), // User's own API key (stored locally, never persisted on server)
  baseUrl: z.string().optional(), // Custom base URL for API
});

export type LLMSettings = z.infer<typeof llmSettingsSchema>;

// Default LLM settings
export const defaultLLMSettings: LLMSettings = {
  provider: "openai",
  model: "gpt-4o",
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
  {
    id: "cursor",
    name: "Cursor",
    description: "AI-first code editor with built-in coding assistant",
    isDefault: false,
    isBuiltIn: true,
  },
  {
    id: "bolt",
    name: "Bolt.new",
    description: "StackBlitz's AI-powered full-stack web development",
    isDefault: false,
    isBuiltIn: true,
  },
  {
    id: "lovable",
    name: "Lovable",
    description: "AI software engineer for rapid app development",
    isDefault: false,
    isBuiltIn: true,
  },
  {
    id: "v0",
    name: "v0 by Vercel",
    description: "Generative UI development with React components",
    isDefault: false,
    isBuiltIn: true,
  },
  {
    id: "windsurf",
    name: "Windsurf",
    description: "Codeium's agentic IDE for collaborative AI coding",
    isDefault: false,
    isBuiltIn: true,
  },
  {
    id: "claude-code",
    name: "Claude Code",
    description: "Anthropic's agentic coding tool in terminal",
    isDefault: false,
    isBuiltIn: true,
  },
];

export const defaultVibeCodingSettings: VibeCodingSettings = {
  platforms: defaultVibeCodingPlatforms,
  selectedPlatformId: "replit",
};

// Project schema - main data model (statementOfWork uses z.any() for circular reference)
export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  scriptSource: z.enum(["upload", "paste", "googleDrive", "askAI"]).optional(),
  scriptContent: z.string().optional(),
  questions: z.array(questionSchema).optional(),
  agentContext: agentContextSchema.optional(),
  summary: summarySchema.optional(), // Legacy - kept for backward compatibility
  detailedSummary: detailedSummarySchema.optional(), // New detailed summary
  generatedPrompts: z.array(promptBundleSchema).optional(),
  statementOfWork: z.any().optional(), // Statement of Work - typed properly in StatementOfWork schema
  currentStep: z.number().default(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Note: Project type uses any for statementOfWork; use StatementOfWork type for type safety
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
  llmSettings: llmSettingsSchema.optional(),
});

export type CleanTextRequest = z.infer<typeof cleanTextRequestSchema>;

// Research & Examples schemas
export const researchExamplesRequestSchema = z.object({
  projectName: z.string(),
  contextSummary: z.string(),
  currentQuestion: z.string(),
  userAnswer: z.string(),
  llmSettings: llmSettingsSchema.optional(),
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

// Generate questions from app description request schema
export const generateQuestionsRequestSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  llmSettings: llmSettingsSchema.optional(),
});

export type GenerateQuestionsRequest = z.infer<typeof generateQuestionsRequestSchema>;

export const generateQuestionsResponseSchema = z.object({
  questions: z.array(z.object({
    text: z.string(),
  })),
});

export type GenerateQuestionsResponse = z.infer<typeof generateQuestionsResponseSchema>;

// Detailed summarize response type
export const detailedSummarizeResponseSchema = detailedSummarySchema;
export type DetailedSummarizeResponse = DetailedSummary;

// ===========================================
// STATEMENT OF WORK SCHEMAS
// ===========================================

// Complexity scoring - calculated from detailed summary
export const complexityTierSchema = z.enum(["simple", "medium", "complex", "enterprise"]);
export type ComplexityTier = z.infer<typeof complexityTierSchema>;

export const complexityScoreSchema = z.object({
  tier: complexityTierSchema,
  score: z.number().min(1).max(100), // Numeric score for granularity
  breakdown: z.object({
    screens: z.number(), // Number of screens
    dataComplexity: z.number(), // 1-10 based on data sources
    aiComplexity: z.number(), // 1-10 based on AI architecture
    integrationComplexity: z.number(), // 1-10 based on integrations needed
    complianceComplexity: z.number(), // 1-10 based on legal/compliance
  }),
  reasoning: z.string(), // Explanation of the score
});

export type ComplexityScore = z.infer<typeof complexityScoreSchema>;

// Pricing tier configuration
export const pricingTierSchema = z.object({
  tier: complexityTierSchema,
  label: z.string(),
  basePrice: z.number().optional(), // Optional - user can configure
  estimatedHours: z.object({
    min: z.number(),
    max: z.number(),
  }),
  description: z.string(),
});

export type PricingTier = z.infer<typeof pricingTierSchema>;

// Default pricing tiers (configurable by user)
export const defaultPricingTiers: PricingTier[] = [
  {
    tier: "simple",
    label: "Simple MVP",
    estimatedHours: { min: 20, max: 40 },
    description: "Basic app with 2-3 screens, minimal integrations, standard CRUD operations",
  },
  {
    tier: "medium",
    label: "Medium MVP",
    estimatedHours: { min: 40, max: 80 },
    description: "4-6 screens, 1-2 integrations, basic AI features, moderate business logic",
  },
  {
    tier: "complex",
    label: "Complex MVP",
    estimatedHours: { min: 80, max: 160 },
    description: "7+ screens, multiple integrations, advanced AI/ML features, complex workflows",
  },
  {
    tier: "enterprise",
    label: "Enterprise MVP",
    estimatedHours: { min: 160, max: 320 },
    description: "Full-scale application, extensive integrations, compliance requirements, multi-tenant",
  },
];

// Line item in an SOW
export const sowLineItemSchema = z.object({
  id: z.string(),
  category: z.string(),
  description: z.string(),
  estimatedHours: z.number().optional(),
  price: z.number().optional(),
  included: z.boolean().default(true),
  notes: z.string().optional(),
});

export type SOWLineItem = z.infer<typeof sowLineItemSchema>;

// MVP SOW - generated from detailed summary
export const mvpSOWSchema = z.object({
  id: z.string(),
  projectName: z.string(),
  generatedAt: z.string(),
  
  // Complexity assessment
  complexityScore: complexityScoreSchema,
  
  // Scope summary (derived from detailedSummary)
  scopeSummary: z.object({
    definition: z.string(),
    includes: z.array(z.string()),
    excludes: z.array(z.string()),
  }),
  
  // Deliverables (derived from screens)
  deliverables: z.array(z.object({
    name: z.string(),
    description: z.string(),
    acceptance: z.string(), // Acceptance criteria
  })),
  
  // Line items for pricing
  lineItems: z.array(sowLineItemSchema),
  
  // Totals
  totalEstimatedHours: z.object({
    min: z.number(),
    max: z.number(),
  }),
  totalPrice: z.number().optional(),
  
  // Terms
  assumptions: z.array(z.string()),
  exclusions: z.array(z.string()),
  
  // Status
  status: z.enum(["draft", "sent", "accepted", "declined"]).default("draft"),
});

export type MVPSOW = z.infer<typeof mvpSOWSchema>;

// Extension SOW types - for post-MVP work
export const extensionTypeSchema = z.enum([
  "environment_setup",
  "domain_dns",
  "email_service",
  "integration",
  "feature_refinement",
  "security_audit",
  "performance_optimization",
  "training_documentation",
  "custom",
]);

export type ExtensionType = z.infer<typeof extensionTypeSchema>;

// Extension SOW - for additional work beyond MVP
export const extensionSOWSchema = z.object({
  id: z.string(),
  type: extensionTypeSchema,
  title: z.string(),
  description: z.string(),
  lineItems: z.array(sowLineItemSchema),
  estimatedHours: z.object({
    min: z.number(),
    max: z.number(),
  }),
  price: z.number().optional(),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  status: z.enum(["pending", "approved", "in_progress", "completed", "cancelled"]).default("pending"),
  createdAt: z.string(),
});

export type ExtensionSOW = z.infer<typeof extensionSOWSchema>;

// Extension templates - predefined extensions
export const extensionTemplates: Omit<ExtensionSOW, "id" | "createdAt" | "status">[] = [
  {
    type: "environment_setup",
    title: "Environment Setup",
    description: "Configure development, staging, and production environments",
    lineItems: [
      { id: "env-1", category: "Infrastructure", description: "Development environment setup", estimatedHours: 4, included: true },
      { id: "env-2", category: "Infrastructure", description: "Staging environment setup", estimatedHours: 4, included: true },
      { id: "env-3", category: "Infrastructure", description: "Production environment setup", estimatedHours: 6, included: true },
      { id: "env-4", category: "DevOps", description: "CI/CD pipeline configuration", estimatedHours: 8, included: true },
    ],
    estimatedHours: { min: 16, max: 24 },
    priority: "high",
  },
  {
    type: "domain_dns",
    title: "Domain & DNS Configuration",
    description: "Set up custom domain, SSL certificates, and DNS records",
    lineItems: [
      { id: "dns-1", category: "Infrastructure", description: "Domain registration assistance", estimatedHours: 1, included: true },
      { id: "dns-2", category: "Infrastructure", description: "DNS configuration", estimatedHours: 2, included: true },
      { id: "dns-3", category: "Security", description: "SSL certificate setup", estimatedHours: 2, included: true },
      { id: "dns-4", category: "Infrastructure", description: "CDN configuration (optional)", estimatedHours: 4, included: false },
    ],
    estimatedHours: { min: 4, max: 8 },
    priority: "medium",
  },
  {
    type: "email_service",
    title: "Email Service Integration",
    description: "Set up transactional email, templates, and delivery",
    lineItems: [
      { id: "email-1", category: "Integration", description: "Email service provider setup", estimatedHours: 4, included: true },
      { id: "email-2", category: "Development", description: "Email template design", estimatedHours: 6, included: true },
      { id: "email-3", category: "Development", description: "Transactional email integration", estimatedHours: 8, included: true },
      { id: "email-4", category: "Testing", description: "Email deliverability testing", estimatedHours: 2, included: true },
    ],
    estimatedHours: { min: 16, max: 24 },
    priority: "medium",
  },
  {
    type: "integration",
    title: "Third-Party Integration",
    description: "Integrate with external services and APIs",
    lineItems: [
      { id: "int-1", category: "Analysis", description: "API documentation review", estimatedHours: 2, included: true },
      { id: "int-2", category: "Development", description: "Integration implementation", estimatedHours: 12, included: true },
      { id: "int-3", category: "Testing", description: "Integration testing", estimatedHours: 4, included: true },
      { id: "int-4", category: "Documentation", description: "Integration documentation", estimatedHours: 2, included: true },
    ],
    estimatedHours: { min: 16, max: 32 },
    priority: "medium",
  },
  {
    type: "feature_refinement",
    title: "Feature Refinement",
    description: "Fine-tune and polish existing features based on feedback",
    lineItems: [
      { id: "ref-1", category: "Analysis", description: "Feedback review and prioritization", estimatedHours: 2, included: true },
      { id: "ref-2", category: "Development", description: "UI/UX improvements", estimatedHours: 8, included: true },
      { id: "ref-3", category: "Development", description: "Functionality enhancements", estimatedHours: 8, included: true },
      { id: "ref-4", category: "Testing", description: "Regression testing", estimatedHours: 4, included: true },
    ],
    estimatedHours: { min: 16, max: 32 },
    priority: "high",
  },
];

// MSA (Master Service Agreement) terms
export const msaTermsSchema = z.object({
  enabled: z.boolean().default(false),
  
  // Retainer structure
  retainer: z.object({
    monthlyHours: z.number().default(10),
    hourlyRate: z.number().optional(),
    rolloverHours: z.boolean().default(false),
    maxRollover: z.number().optional(),
  }).optional(),
  
  // Response times
  sla: z.object({
    criticalResponseHours: z.number().default(4),
    highResponseHours: z.number().default(8),
    normalResponseHours: z.number().default(24),
  }).optional(),
  
  // Change request process
  changeProcess: z.object({
    requiresWrittenApproval: z.boolean().default(true),
    minimumHoursForApproval: z.number().default(4),
  }).optional(),
  
  // Term
  termMonths: z.number().default(12),
  autoRenew: z.boolean().default(true),
  
  notes: z.string().optional(),
});

export type MSATerms = z.infer<typeof msaTermsSchema>;

// Legal Terms for SOW
export const legalTermsSchema = z.object({
  enabled: z.boolean().default(true),
  
  // Payment Terms
  paymentTerms: z.object({
    depositPercent: z.number().default(50),
    netDays: z.number().default(30),
    lateFeePercent: z.number().default(1.5),
    currency: z.string().default("USD"),
  }),
  
  // Intellectual Property
  ipOwnership: z.enum(["client", "developer", "joint", "license"]).default("client"),
  ipTransferUponPayment: z.boolean().default(true),
  
  // Confidentiality
  confidentiality: z.object({
    enabled: z.boolean().default(true),
    durationYears: z.number().default(2),
  }),
  
  // Limitation of Liability
  liabilityLimit: z.enum(["contract_value", "12_months_fees", "unlimited"]).default("contract_value"),
  
  // Warranties
  warranties: z.object({
    defectPeriodDays: z.number().default(30),
    warrantyScope: z.string().default("material defects"),
  }),
  
  // Termination
  termination: z.object({
    noticeDays: z.number().default(14),
    forCause: z.boolean().default(true),
    forConvenience: z.boolean().default(true),
    killFeePercent: z.number().default(25),
  }),
  
  // Dispute Resolution
  disputeResolution: z.enum(["arbitration", "mediation", "litigation"]).default("mediation"),
  governingLaw: z.string().default("State of Delaware"),
  
  // Additional clauses
  independentContractor: z.boolean().default(true),
  forceMaileure: z.boolean().default(true),
});

export type LegalTerms = z.infer<typeof legalTermsSchema>;

// Default legal terms
export const defaultLegalTerms: LegalTerms = {
  enabled: true,
  paymentTerms: {
    depositPercent: 50,
    netDays: 30,
    lateFeePercent: 1.5,
    currency: "USD",
  },
  ipOwnership: "client",
  ipTransferUponPayment: true,
  confidentiality: {
    enabled: true,
    durationYears: 2,
  },
  liabilityLimit: "contract_value",
  warranties: {
    defectPeriodDays: 30,
    warrantyScope: "material defects",
  },
  termination: {
    noticeDays: 14,
    forCause: true,
    forConvenience: true,
    killFeePercent: 25,
  },
  disputeResolution: "mediation",
  governingLaw: "State of Delaware",
  independentContractor: true,
  forceMaileure: true,
};

// Complete Statement of Work for a project
export const statementOfWorkSchema = z.object({
  projectId: z.string(),
  
  // MVP SOW
  mvpSOW: mvpSOWSchema.optional(),
  
  // Extension SOWs
  extensions: z.array(extensionSOWSchema).default([]),
  
  // MSA option
  msaTerms: msaTermsSchema.optional(),
  
  // Legal Terms
  legalTerms: legalTermsSchema.optional(),
  
  // Pricing configuration
  pricingTiers: z.array(pricingTierSchema).default([]),
  hourlyRate: z.number().optional(),
  
  // Metadata
  createdAt: z.string(),
  updatedAt: z.string(),
  lastGeneratedAt: z.string().optional(),
});

export type StatementOfWork = z.infer<typeof statementOfWorkSchema>;

// Extend project schema with statementOfWork (defined after SOW schemas)
export const projectWithSOWSchema = projectSchema.extend({
  statementOfWork: statementOfWorkSchema.optional(),
});

export type ProjectWithSOW = z.infer<typeof projectWithSOWSchema>;

// API request for generating SOW
export const generateSOWRequestSchema = z.object({
  projectName: z.string(),
  detailedSummary: detailedSummarySchema,
  llmSettings: llmSettingsSchema.optional(),
});

export type GenerateSOWRequest = z.infer<typeof generateSOWRequestSchema>;

// Wizard steps
export const WIZARD_STEPS = [
  { id: 1, name: "Load Script", description: "Upload or paste your question script" },
  { id: 2, name: "Capture Answers", description: "Record voice answers to each question" },
  { id: 3, name: "Review & Summarize", description: "Review and approve the MVP summary" },
  { id: 4, name: "Generate Build Pack", description: "Create prompts for building the MVP" },
  { id: 5, name: "Statement of Work", description: "Generate scope and pricing documents" },
  { id: 6, name: "Create App", description: "Hand off to Replit for app generation" },
] as const;
