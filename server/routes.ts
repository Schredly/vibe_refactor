import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { summarizeRequestSchema, generatePromptsRequestSchema, generateContextRequestSchema, agentAssistRequestSchema, cleanTextRequestSchema, researchExamplesRequestSchema } from "@shared/schema";
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
        console.log("OpenAI not configured, returning mock detailed summary");
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
        console.log("Calling OpenAI for detailed summary generation...");
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("OpenAI timeout")), 60000)
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
        console.log("OpenAI detailed summary response received, content length:", content?.length || 0);
        
        if (!content) {
          console.log("Empty OpenAI response, using fallback");
          return res.json(generateMockDetailedSummary(projectName, questions));
        }

        const summary = JSON.parse(content);
        summary.lastGeneratedAt = new Date().toISOString();
        return res.json(summary);
      } catch (aiError) {
        console.error("OpenAI API error:", aiError);
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
      const { projectName, detailedSummary, questions } = validatedData;

      if (!openai) {
        console.log("OpenAI not configured, returning mock prompts");
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

      const systemPrompt = `You are an expert software architect and technical writer. Your task is to generate a comprehensive "Build Pack" - a set of structured prompts that can be used to guide an AI assistant in building an MVP.

IMPORTANT RULES:
1. Do NOT produce detailed database schemas or ERD diagrams
2. Keep storage requirements high-level (e.g., "store user profile with name, email, preferences")
3. Focus on user flows, screens, actions, and acceptance criteria
4. Be specific about UI elements and interactions
5. Include edge cases and validation requirements
6. The user has already reviewed and edited the MVP plan, so respect their decisions

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

MVP Definition:
${detailedSummary.oneSentenceDefinition}

Features to Include:
${detailedSummary.mvpScope.includes.map((f: string) => `- ${f}`).join("\n")}

Features to Defer:
${detailedSummary.mvpScope.excludes.map((f: string) => `- ${f}`).join("\n")}

Screens:
${screenSpecs}

User Flow:
${detailedSummary.userFlow.map((step: string, i: number) => `${i + 1}. ${step}`).join("\n")}

Data Sources (MVP): ${detailedSummary.dataSources.mvpSources.join(", ")}

Legal Guardrails:
${detailedSummary.legalGuardrails.map((g: string) => `- ${g}`).join("\n")}

User's Build Prompt:
${detailedSummary.buildPrompt}

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

  // Research & Examples endpoint - provides concrete examples based on question context
  app.post("/api/researchExamples", async (req, res) => {
    try {
      const validatedData = researchExamplesRequestSchema.parse(req.body);
      const { projectName, contextSummary, currentQuestion, userAnswer } = validatedData;

      // Return mock data if OpenAI is not available
      if (!openai) {
        console.log("OpenAI not configured, returning mock research examples");
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
          model: "gpt-5.1",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Question: ${currentQuestion}\n\nUser's Answer: ${userAnswer}\n\nProvide research and examples to help make this answer more concrete and well-informed.` },
          ],
          max_completion_tokens: 2000,
        });

        const response = await Promise.race([openaiPromise, timeoutPromise]) as Awaited<typeof openaiPromise>;

        const content = response.choices[0]?.message?.content?.trim();
        
        if (!content) {
          throw new Error("Empty response from OpenAI");
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
