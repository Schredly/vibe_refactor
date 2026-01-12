import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { summarizeRequestSchema, generatePromptsRequestSchema, generateContextRequestSchema, agentAssistRequestSchema, cleanTextRequestSchema } from "@shared/schema";
import { z } from "zod";

let openai: OpenAI | null = null;

const hasOpenAIConfig = !!(process.env.AI_INTEGRATIONS_OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL);
console.log("OpenAI configuration available:", hasOpenAIConfig);

if (hasOpenAIConfig) {
  try {
    openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
    console.log("OpenAI client initialized successfully");
  } catch (error) {
    console.warn("Failed to initialize OpenAI client:", error);
  }
}

function generateMockSummary(projectName: string, questions: { text: string; answerText?: string }[]) {
  const answered = questions.filter((q) => q.answerText);
  return {
    mvpSummary: `This is a demo summary for "${projectName}". The user provided ${answered.length} answers describing their MVP requirements. Connect to OpenAI to generate real AI-powered summaries.`,
    assumptions: [
      "The user has a clear problem to solve",
      "Target users have been identified",
      "Core features have been prioritized",
    ],
    openQuestions: [
      "What is the primary user persona?",
      "What differentiates this from existing solutions?",
    ],
    recommendedMvpScope: {
      include: ["Core user authentication", "Main feature workflow", "Basic dashboard"],
      defer: ["Advanced analytics", "Social features", "Mobile app"],
    },
    risks: [
      "Scope creep from adding too many features",
      "Technical complexity in core features",
    ],
  };
}

function generateMockPrompts(projectName: string) {
  return {
    prompts: [
      {
        id: "1",
        category: "Product Overview",
        title: "MVP Summary",
        content: `# ${projectName} MVP\n\nThis is a demo Build Pack. Connect to OpenAI to generate real AI-powered prompts tailored to your requirements.\n\n## Core Features\n- User authentication\n- Main workflow\n- Dashboard`,
        collapsedByDefault: false,
      },
      {
        id: "2",
        category: "Primary User Flows",
        title: "Main User Journey",
        content: `# User Flow\n\n1. User signs up/logs in\n2. User accesses main feature\n3. User completes primary action\n4. User views results on dashboard`,
        collapsedByDefault: true,
      },
      {
        id: "3",
        category: "UI Spec",
        title: "Screen Layouts",
        content: `# UI Screens\n\n## Landing Page\n- Hero section with value proposition\n- CTA button\n\n## Dashboard\n- Navigation sidebar\n- Main content area\n- Action buttons`,
        collapsedByDefault: true,
      },
      {
        id: "4",
        category: "Backend/API Spec",
        title: "API Endpoints",
        content: `# API Endpoints\n\n- POST /api/auth/login\n- POST /api/auth/register\n- GET /api/user/profile\n- POST /api/actions/create`,
        collapsedByDefault: true,
      },
      {
        id: "5",
        category: "Storage",
        title: "Data Requirements",
        content: `# Storage Requirements\n\n- User profiles (name, email, preferences)\n- User actions/data\n- Session management`,
        collapsedByDefault: true,
      },
      {
        id: "6",
        category: "Edge Cases & Validation",
        title: "Error Handling",
        content: `# Edge Cases\n\n- Invalid form inputs\n- Network errors\n- Unauthorized access\n- Empty states`,
        collapsedByDefault: true,
      },
      {
        id: "7",
        category: "Acceptance Criteria",
        title: "Success Metrics",
        content: `# Acceptance Criteria\n\n- User can complete full workflow\n- All forms validate correctly\n- Error messages are helpful\n- Loading states are shown`,
        collapsedByDefault: true,
      },
      {
        id: "8",
        category: "V1 Cut List",
        title: "Out of Scope",
        content: `# Deferred Features\n\n- Advanced analytics\n- Social sharing\n- Mobile app\n- Third-party integrations`,
        collapsedByDefault: true,
      },
      {
        id: "9",
        category: "Replit Master Prompt",
        title: "Complete Build Prompt",
        content: `Build a web application called "${projectName}" with user authentication, a main dashboard, and core workflow features. Use React + Express + PostgreSQL. Focus on clean UI and good UX.`,
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
      const { projectName, questions } = validatedData;

      const answeredQuestions = questions.filter((q) => q.answerText);
      
      if (answeredQuestions.length === 0) {
        return res.status(400).json({ error: "No answered questions provided" });
      }

      if (!openai) {
        console.log("OpenAI not configured, returning mock summary");
        return res.json(generateMockSummary(projectName, questions));
      }

      const qaText = answeredQuestions
        .map((q, i) => `Q${i + 1}: ${q.text}\nA${i + 1}: ${q.answerText}`)
        .join("\n\n");

      const systemPrompt = `You are an expert product manager and MVP analyst. Your task is to analyze a requirements capture session and produce a structured summary of the MVP understanding.

Be concise, clear, and actionable. Do not make up details - only include information directly supported by the answers. Flag any missing or unclear information.

Output your response as a valid JSON object with exactly this structure:
{
  "mvpSummary": "A 2-3 paragraph summary of what the MVP is, who it's for, and the core problem it solves",
  "assumptions": ["List of assumptions made based on the answers"],
  "openQuestions": ["List of questions that still need answers or clarification"],
  "recommendedMvpScope": {
    "include": ["Features/capabilities that should be in the MVP"],
    "defer": ["Features/capabilities that should be deferred to later versions"]
  },
  "risks": ["List of potential risks or challenges for this MVP"]
}`;

      const userPrompt = `Project: ${projectName}

Here are the questions and answers from the requirements capture session:

${qaText}

Please analyze this and provide a structured MVP summary.`;

      try {
        console.log("Calling OpenAI for summary generation...");
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("OpenAI timeout")), 45000)
        );
        
        const openaiPromise = openai.chat.completions.create({
          model: "gpt-5.1",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          max_completion_tokens: 2048,
        });

        const response = await Promise.race([openaiPromise, timeoutPromise]) as Awaited<typeof openaiPromise>;

        const content = response.choices[0]?.message?.content;
        console.log("OpenAI summary response received, content length:", content?.length || 0);
        
        if (!content) {
          console.log("Empty OpenAI response, using fallback");
          return res.json(generateMockSummary(projectName, questions));
        }

        const summary = JSON.parse(content);
        return res.json(summary);
      } catch (aiError) {
        console.error("OpenAI API error:", aiError);
        console.log("Falling back to mock summary");
        return res.json(generateMockSummary(projectName, questions));
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
      const { projectName, summary, questions } = validatedData;

      if (!openai) {
        console.log("OpenAI not configured, returning mock prompts");
        return res.json(generateMockPrompts(projectName));
      }

      const answeredQuestions = questions.filter((q) => q.answerText);
      
      const qaText = answeredQuestions
        .map((q, i) => `Q${i + 1}: ${q.text}\nA${i + 1}: ${q.answerText}`)
        .join("\n\n");

      const systemPrompt = `You are an expert software architect and technical writer. Your task is to generate a comprehensive "Build Pack" - a set of structured prompts that can be used to guide an AI assistant in building an MVP.

IMPORTANT RULES:
1. Do NOT produce detailed database schemas or ERD diagrams
2. Keep storage requirements high-level (e.g., "store user profile with name, email, preferences")
3. Focus on user flows, screens, actions, and acceptance criteria
4. Be specific about UI elements and interactions
5. Include edge cases and validation requirements

Output your response as a valid JSON object with this structure:
{
  "prompts": [
    {
      "id": "unique-id",
      "category": "Category Name",
      "title": "Prompt Title",
      "content": "Detailed prompt content in markdown",
      "collapsedByDefault": true
    }
  ]
}

The categories MUST include:
1. Product Overview - One-page summary of the MVP
2. Primary User Flows - Step-by-step user journeys
3. UI Spec - Screens, components, layouts
4. Backend/API Spec - Endpoints and their responsibilities (high-level)
5. Storage - High-level data requirements (NOT detailed schemas)
6. Edge Cases & Validation - Error handling, input validation
7. Acceptance Criteria - Testable success criteria
8. V1 Cut List - What is explicitly out of scope
9. Replit Master Prompt - A single consolidated prompt for Replit Agent`;

      const userPrompt = `Project: ${projectName}

MVP Summary:
${summary.mvpSummary}

Features to Include:
${summary.recommendedMvpScope.include.map((f) => `- ${f}`).join("\n")}

Features to Defer:
${summary.recommendedMvpScope.defer.map((f) => `- ${f}`).join("\n")}

Original Q&A:
${qaText}

Please generate a comprehensive Build Pack with prompts for each category.`;

      try {
        console.log("Calling OpenAI for prompt generation...");
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("OpenAI timeout")), 45000)
        );
        
        const openaiPromise = openai.chat.completions.create({
          model: "gpt-5.1",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          max_completion_tokens: 4096,
        });

        const response = await Promise.race([openaiPromise, timeoutPromise]) as Awaited<typeof openaiPromise>;

        const content = response.choices[0]?.message?.content;
        console.log("OpenAI response received, content length:", content?.length || 0);
        
        if (!content) {
          console.log("Empty OpenAI response, using fallback");
          return res.json(generateMockPrompts(projectName));
        }

        const result = JSON.parse(content);
        console.log("Parsed prompts count:", result.prompts?.length || 0);
        return res.json(result);
      } catch (aiError) {
        console.error("OpenAI API error:", aiError);
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
          model: "gpt-5.1",
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
        console.error("OpenAI API error for context:", aiError);
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
      if (!openai) {
        console.log("OpenAI not configured, returning mock suggestions");
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
          model: "gpt-5.1",
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
        console.error("OpenAI API error for agent assist:", aiError);
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

      // Return original text if OpenAI is not available
      if (!openai) {
        console.log("OpenAI not configured, returning original text");
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
          model: "gpt-5.1",
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
        console.error("OpenAI API error for clean text:", aiError);
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

  return httpServer;
}
