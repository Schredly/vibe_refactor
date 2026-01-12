import { z } from "zod";

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

// Summary schema - MVP understanding after LLM analysis
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
  category: z.string(),
  title: z.string(),
  content: z.string(),
  collapsedByDefault: z.boolean().optional(),
});

export type PromptBundle = z.infer<typeof promptBundleSchema>;

// Project schema - main data model
export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  scriptSource: z.enum(["upload", "paste", "googleDrive"]).optional(),
  scriptContent: z.string().optional(),
  questions: z.array(questionSchema).optional(),
  summary: summarySchema.optional(),
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

// API request/response types
export const summarizeRequestSchema = z.object({
  projectName: z.string(),
  questions: z.array(
    z.object({
      text: z.string(),
      answerText: z.string().optional(),
    })
  ),
});

export type SummarizeRequest = z.infer<typeof summarizeRequestSchema>;

export const generatePromptsRequestSchema = z.object({
  projectName: z.string(),
  summary: summarySchema,
  questions: z.array(
    z.object({
      text: z.string(),
      answerText: z.string().optional(),
    })
  ),
});

export type GeneratePromptsRequest = z.infer<typeof generatePromptsRequestSchema>;

// Wizard steps
export const WIZARD_STEPS = [
  { id: 1, name: "Load Script", description: "Upload or paste your question script" },
  { id: 2, name: "Capture Answers", description: "Record voice answers to each question" },
  { id: 3, name: "Review & Summarize", description: "Review and approve the MVP summary" },
  { id: 4, name: "Generate Build Pack", description: "Create prompts for building the MVP" },
  { id: 5, name: "Create App", description: "Hand off to Replit for app generation" },
] as const;
