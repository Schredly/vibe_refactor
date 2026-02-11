import PDFDocument from "pdfkit";
import * as fs from "fs";
import * as path from "path";

const COLORS = {
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
};

function generateDoc() {
  const doc = new PDFDocument({
    size: "letter",
    bufferPages: true,
    margins: { top: 60, bottom: 60, left: 60, right: 60 },
    info: {
      Title: "Vibe Refactor - System Overview & Value Proposition",
      Author: "Vibe Refactor",
      Subject: "MVP Wizard System Documentation",
    },
  });

  const outputPath = path.join(process.cwd(), "Vibe_Refactor_System_Overview.pdf");
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  function drawDivider(y: number) {
    doc
      .moveTo(doc.page.margins.left, y)
      .lineTo(doc.page.width - doc.page.margins.right, y)
      .strokeColor(COLORS.divider)
      .lineWidth(1)
      .stroke();
  }

  function heading(text: string, size: number, color: string, spacing = 8) {
    checkPageBreak(size + spacing + 10);
    doc.fontSize(size).fillColor(color).text(text, { lineGap: 2 });
    doc.moveDown(spacing / size);
  }

  function body(text: string, indent = 0) {
    checkPageBreak(30);
    doc
      .fontSize(10.5)
      .fillColor(COLORS.text)
      .text(text, doc.page.margins.left + indent, undefined, {
        width: pageWidth - indent,
        lineGap: 3,
        align: "left",
      });
  }

  function bullet(text: string, indent = 20) {
    checkPageBreak(28);
    const bulletX = doc.page.margins.left + indent - 12;
    const textX = doc.page.margins.left + indent;
    const y = doc.y;
    doc.fontSize(10.5).fillColor(COLORS.primary).text("\u2022", bulletX, y);
    doc
      .fontSize(10.5)
      .fillColor(COLORS.text)
      .text(text, textX, y, { width: pageWidth - indent, lineGap: 3 });
  }

  function numberedItem(num: number, title: string, description: string, indent = 20) {
    checkPageBreak(45);
    const numX = doc.page.margins.left + indent - 16;
    const textX = doc.page.margins.left + indent;
    const y = doc.y;
    doc.fontSize(10.5).fillColor(COLORS.primary).font("Helvetica-Bold").text(`${num}.`, numX, y);
    doc
      .font("Helvetica-Bold")
      .fontSize(10.5)
      .fillColor(COLORS.dark)
      .text(title, textX, y, { width: pageWidth - indent, continued: false });
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(COLORS.textLight)
      .text(description, textX, undefined, { width: pageWidth - indent, lineGap: 2 });
    doc.moveDown(0.3);
  }

  function checkPageBreak(requiredSpace: number) {
    if (doc.y + requiredSpace > doc.page.height - doc.page.margins.bottom - 40) {
      doc.addPage();
      doc.y = doc.page.margins.top;
    }
  }

  function addFooter() {
    const totalPages = doc.bufferedPageRange();
    for (let i = 0; i < totalPages.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .fillColor(COLORS.textLight)
        .text(
          `Vibe Refactor  |  System Overview  |  Page ${i + 1}`,
          doc.page.margins.left,
          doc.page.height - 35,
          { width: pageWidth, align: "center" }
        );
    }
  }

  // ===== COVER PAGE =====
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(COLORS.dark);

  doc
    .fontSize(14)
    .fillColor(COLORS.primary)
    .font("Helvetica-Bold")
    .text("VIBE REFACTOR", doc.page.margins.left, 180, { width: pageWidth, align: "center", characterSpacing: 6 });

  doc.moveDown(1.5);
  doc
    .fontSize(32)
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .text("System Overview &\nValue Proposition", { width: pageWidth, align: "center", lineGap: 6 });

  doc.moveDown(1.2);
  drawDivider(doc.y);
  doc.moveDown(1.2);

  doc
    .fontSize(13)
    .fillColor("#A5B4FC")
    .font("Helvetica")
    .text(
      "How Vibe Refactor empowers non-technical Replit users\nto build complete, production-ready applications\nthrough guided voice-driven requirements capture.",
      { width: pageWidth, align: "center", lineGap: 4 }
    );

  doc.moveDown(4);
  doc
    .fontSize(10)
    .fillColor(COLORS.textLight)
    .text("Prepared for Replit Users & Stakeholders", { width: pageWidth, align: "center" });

  doc.moveDown(0.5);
  doc.fontSize(10).fillColor(COLORS.textLight).text(`${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, { width: pageWidth, align: "center" });

  // ===== TABLE OF CONTENTS =====
  doc.addPage();
  heading("Table of Contents", 22, COLORS.dark);
  doc.moveDown(1);
  const tocItems = [
    "1.  The Problem: Bridging the Gap Between Ideas and Code",
    "2.  What is Vibe Refactor?",
    "3.  Who Benefits Most?",
    "4.  The Wizard Workflow (Step by Step)",
    "5.  Feature Deep Dive",
    "6.  Statement of Work System",
    "7.  AI-Powered Intelligence",
    "8.  Configurable Settings",
    "9.  Technical Architecture",
    "10. Value Proposition Summary",
  ];
  tocItems.forEach((item) => {
    doc.fontSize(12).fillColor(COLORS.text).font("Helvetica").text(item, doc.page.margins.left + 20, undefined, { lineGap: 10 });
  });

  // ===== SECTION 1: THE PROBLEM =====
  doc.addPage();
  heading("1. The Problem", 22, COLORS.dark);
  heading("Bridging the Gap Between Ideas and Code", 14, COLORS.primary, 4);
  doc.moveDown(0.5);

  body(
    "Millions of people have great ideas for applications but lack the technical skills to build them. Even with powerful AI-powered platforms like Replit Agent, users face a critical challenge: they don't know how to clearly communicate what they want to build."
  );
  doc.moveDown(0.8);

  body("The typical experience for a non-technical user looks like this:");
  doc.moveDown(0.4);

  bullet("They have a vague idea: \"I want an app that helps people find dog walkers.\"");
  bullet("They type a short, incomplete prompt into Replit Agent.");
  bullet("The AI builds something, but it's missing key features, has wrong user flows, or doesn't match their vision.");
  bullet("They spend hours going back and forth, trying to fix things they can't articulate.");
  bullet("They get frustrated and either give up or settle for something far below their original vision.");

  doc.moveDown(0.8);
  body(
    "The core problem isn't Replit Agent's capability -- it's the quality of the input it receives. Vibe Refactor solves this by transforming how users think about, capture, and communicate their application requirements."
  );

  // ===== SECTION 2: WHAT IS VIBE REFACTOR =====
  doc.addPage();
  heading("2. What is Vibe Refactor?", 22, COLORS.dark);
  doc.moveDown(0.5);

  body(
    "Vibe Refactor is an intelligent wizard that guides non-technical users through a structured process of capturing their MVP (Minimum Viable Product) requirements. Instead of staring at a blank text box, users are walked through a series of targeted questions, can answer by simply talking (voice recording), and receive AI-generated summaries, build prompts, and professional documentation."
  );
  doc.moveDown(0.8);

  body("The system transforms a user's scattered thoughts into:");
  doc.moveDown(0.4);
  bullet("A comprehensive, structured MVP plan with clear scope definition");
  bullet("Detailed screen-by-screen specifications with UI elements");
  bullet("Complete user flow documentation");
  bullet("AI architecture recommendations (when applicable)");
  bullet("A production-ready \"Build Prompt\" optimized for Replit Agent");
  bullet("Categorized prompt bundles for methodical development");
  bullet("Professional Statements of Work with pricing estimates");

  // ===== SECTION 3: WHO BENEFITS =====
  doc.addPage();
  heading("3. Who Benefits Most?", 22, COLORS.dark);
  doc.moveDown(0.5);

  numberedItem(
    1,
    "Non-Technical Entrepreneurs",
    "People with business ideas who want to build MVPs to validate their concepts. Vibe Refactor lets them describe their vision naturally and produces the technical specifications needed to build it."
  );
  numberedItem(
    2,
    "Small Business Owners",
    "Business owners who need custom tools (booking systems, inventory management, customer portals) but can't afford traditional development. The SOW feature gives them professional cost estimates."
  );
  numberedItem(
    3,
    "Product Managers & Designers",
    "PMs who think visually and verbally can capture requirements through voice, getting structured documentation that developers and AI agents can immediately use."
  );
  numberedItem(
    4,
    "Freelance Developers",
    "Developers who need to quickly scope projects and generate professional SOWs for clients. The complexity analysis and pricing tools save hours of estimation work."
  );
  numberedItem(
    5,
    "Students & Learners",
    "People learning to build software who benefit from the structured thinking process. The wizard teaches them how to break down an application into screens, flows, and specifications."
  );
  numberedItem(
    6,
    "Replit Agent Power Users",
    "Experienced Replit users who want better results from Agent. A well-structured prompt dramatically improves the quality of AI-generated code."
  );

  // ===== SECTION 4: THE WIZARD WORKFLOW =====
  doc.addPage();
  heading("4. The Wizard Workflow", 22, COLORS.dark);
  heading("Step-by-Step Guide", 14, COLORS.primary, 4);
  doc.moveDown(0.5);

  body(
    "Vibe Refactor uses a multi-step wizard that progressively builds a complete application specification. Each step builds on the previous one, ensuring nothing is missed."
  );
  doc.moveDown(1);

  // Step 1
  heading("Step 1: Load Script", 14, COLORS.primaryDark, 4);
  body(
    "Users begin by loading a question script -- a set of targeted questions designed to extract the key decisions needed for their application. Scripts can be uploaded as text files or pasted directly."
  );
  doc.moveDown(0.4);
  bullet("Upload .txt or .md files containing structured questions");
  bullet("Paste text directly and auto-extract questions");
  bullet("Reorder, edit, add, or remove questions to customize the interview");
  bullet("Questions are designed to cover scope, users, features, data, and design");
  doc.moveDown(0.8);

  // Step 2
  heading("Step 2: Capture Answers", 14, COLORS.primaryDark, 4);
  body(
    "This is where Vibe Refactor truly shines for non-technical users. Instead of typing detailed specifications, users simply talk through their answers using voice recording."
  );
  doc.moveDown(0.4);
  bullet("Voice recording via Web Speech API -- just press R and start talking");
  bullet("Real-time speech-to-text transcription displayed as you speak");
  bullet("Pause and resume recording mid-sentence (press P)");
  bullet("Navigate between questions with keyboard shortcuts (press N)");
  bullet("Continue Recording to append to existing answers at cursor position");
  bullet("Manual text editing for fine-tuning");
  bullet("AI-powered Clean Text to fix grammar and improve flow in transcribed speech");
  bullet("Agent Assist: AI evaluates your answer and suggests improvements for specificity");
  bullet("Research & Examples: AI provides industry examples and concrete insights");
  doc.moveDown(0.8);

  // Step 3
  checkPageBreak(150);
  heading("Step 3: Review & Summarize -- Detailed MVP Plan", 14, COLORS.primaryDark, 4);
  body(
    "The AI analyzes all your answers and generates a comprehensive 8-section MVP plan. Every section is collapsible and editable, giving you full control over the final specification."
  );
  doc.moveDown(0.4);

  numberedItem(1, "One-Sentence Definition", "A clear, concise statement of what your MVP does and who it's for.");
  numberedItem(2, "MVP Scope", "Explicit lists of what's included and excluded, preventing scope creep.");
  numberedItem(3, "Screens", "Detailed screen definitions with specific UI elements, layouts, and interactions.");
  numberedItem(4, "User Flow", "Step-by-step journey showing how users navigate through the application.");
  numberedItem(5, "AI Architecture", "Agent roles and responsibilities if your app uses AI features.");
  numberedItem(6, "Data Sources", "What data the MVP needs and where it comes from.");
  numberedItem(7, "Legal Guardrails", "Safety, compliance, and privacy considerations.");
  numberedItem(8, "Build Prompt", "A comprehensive, Replit-Agent-ready prompt combining all sections.");

  doc.moveDown(0.8);

  // Step 4
  checkPageBreak(120);
  heading("Step 4: Generate Build Pack", 14, COLORS.primaryDark, 4);
  body(
    "The Build Pack breaks your complete specification into categorized prompt bundles, making it easy to work with Replit Agent methodically rather than dumping everything at once."
  );
  doc.moveDown(0.4);
  bullet("Product Overview prompt for high-level context");
  bullet("User Flows prompt for interaction patterns");
  bullet("UI Specification prompt for design details");
  bullet("API Specification prompt for backend requirements");
  bullet("Master Prompt combining everything for a single-shot build");
  bullet("Copy individual prompts or the complete Master Prompt");
  doc.moveDown(0.8);

  // Step 5 (SOW)
  checkPageBreak(120);
  heading("Step 5: Statement of Work (Optional)", 14, COLORS.primaryDark, 4);
  body(
    "For users who need professional project documentation -- whether for clients, stakeholders, or their own planning -- the SOW step generates comprehensive project documentation with pricing estimates."
  );
  doc.moveDown(0.4);
  bullet("AI-powered complexity analysis (Simple, Medium, Complex, Enterprise tiers)");
  bullet("Detailed MVP SOW with line items, timelines, and pricing");
  bullet("Post-MVP extension SOWs for future phases");
  bullet("Comprehensive legal terms (payment, IP, confidentiality, liability)");
  bullet("Professional PDF export with signature blocks");
  bullet("This step can be toggled on/off in Settings > Features");
  doc.moveDown(0.8);

  // Step 6
  checkPageBreak(100);
  heading("Step 6: Create App", 14, COLORS.primaryDark, 4);
  body(
    "The final step prepares you to build. It provides a quality check, the optimized Master Prompt, and clear instructions for using Replit Agent to bring your application to life."
  );
  doc.moveDown(0.4);
  bullet("Quality check based on summary completeness");
  bullet("One-click copy of the Master Prompt");
  bullet("Step-by-step Replit Agent instructions");
  bullet("Export your entire project specification as Markdown or JSON");

  // ===== SECTION 5: FEATURE DEEP DIVE =====
  doc.addPage();
  heading("5. Feature Deep Dive", 22, COLORS.dark);
  doc.moveDown(0.5);

  heading("Voice-First Input", 14, COLORS.primaryDark, 4);
  body(
    "The voice recording system is the heart of Vibe Refactor. Non-technical users are far more comfortable describing their ideas out loud than writing formal specifications. The system uses the Web Speech API for real-time transcription with keyboard shortcuts for a hands-free experience:"
  );
  doc.moveDown(0.4);
  bullet("R key: Start or stop recording");
  bullet("P key: Pause or resume mid-sentence");
  bullet("N key: Move to the next question");
  bullet("Continue Recording: Append new speech at the cursor position in existing text");
  bullet("Clean Text: AI automatically improves grammar and flow after recording");
  doc.moveDown(1);

  heading("Agent Assist (AI-Powered Coaching)", 14, COLORS.primaryDark, 4);
  body(
    "Agent Assist acts as a virtual product coach. After you answer a question, it evaluates your response for specificity and completeness. If your answer is too vague (\"I want a nice login page\"), it provides targeted suggestions (\"Consider specifying: social login providers, password requirements, forgot password flow, and whether to support MFA\")."
  );
  doc.moveDown(0.4);
  bullet("Real-time specificity evaluation of your answers");
  bullet("Contextual suggestions based on your project type");
  bullet("Improvement areas highlighted to strengthen your specification");
  doc.moveDown(1);

  heading("Research & Examples", 14, COLORS.primaryDark, 4);
  body(
    "When you're unsure how to answer a question, the Research & Examples feature provides real-world context. It delivers industry practices, concrete examples from similar applications, and expert insights to help you make informed decisions about your MVP."
  );
  doc.moveDown(1);

  heading("Multi-Project Management", 14, COLORS.primaryDark, 4);
  body(
    "The sidebar allows you to manage multiple projects simultaneously. Each project maintains its own state -- questions, answers, summaries, and prompts -- so you can work on several application ideas without losing progress. Projects can be created, renamed, and deleted."
  );
  doc.moveDown(1);

  heading("Dark Mode Support", 14, COLORS.primaryDark, 4);
  body(
    "Full dark mode support throughout the application, respecting system preferences and allowing manual toggling. All components, PDF exports, and UI elements adapt seamlessly to the chosen theme."
  );

  // ===== SECTION 6: SOW SYSTEM =====
  doc.addPage();
  heading("6. Statement of Work System", 22, COLORS.dark);
  doc.moveDown(0.5);

  body(
    "The Statement of Work system is a standout feature that transforms Vibe Refactor from a requirements tool into a complete project planning platform. It's designed for freelancers, agencies, and entrepreneurs who need professional documentation."
  );
  doc.moveDown(0.8);

  heading("Complexity Analysis", 14, COLORS.primaryDark, 4);
  body(
    "The AI analyzes your detailed summary and assigns a complexity score from 1-100, broken into four tiers:"
  );
  doc.moveDown(0.4);
  bullet("Simple (1-25): Basic CRUD applications, landing pages, simple tools. Estimated 1-2 weeks.");
  bullet("Medium (26-50): Multi-page apps with authentication, APIs, moderate logic. Estimated 2-4 weeks.");
  bullet("Complex (51-75): Advanced features, third-party integrations, complex data models. Estimated 4-8 weeks.");
  bullet("Enterprise (76-100): Large-scale systems, real-time features, compliance requirements. Estimated 8+ weeks.");
  doc.moveDown(0.8);

  heading("MVP SOW Generation", 14, COLORS.primaryDark, 4);
  body(
    "Generates a detailed SOW with specific line items, each containing scope descriptions, estimated hours, and cost calculations. The SOW includes project milestones, deliverables, timeline, and total pricing based on the complexity tier's hourly rate."
  );
  doc.moveDown(0.8);

  heading("Post-MVP Extensions", 14, COLORS.primaryDark, 4);
  body(
    "Beyond the initial MVP, the system generates extension SOWs for logical next phases. These help clients understand the full product roadmap and associated costs, making it easier to plan budgets and prioritize features."
  );
  doc.moveDown(0.8);

  heading("Legal Terms", 14, COLORS.primaryDark, 4);
  body(
    "The SOW includes comprehensive legal terms covering 8 major areas, all with sensible defaults that can be customized:"
  );
  doc.moveDown(0.4);
  bullet("Payment Terms: Deposit requirements (default 50%), payment schedule (Net 30), late fees");
  bullet("Intellectual Property: Clear ownership transfer to client upon final payment");
  bullet("Confidentiality: Non-disclosure provisions with configurable duration (default 2 years)");
  bullet("Limitation of Liability: Liability caps tied to total project amount");
  bullet("Warranties: Workmanship guarantees with defined warranty periods");
  bullet("Termination: Clear exit procedures with notice periods and kill-fee provisions");
  bullet("Dispute Resolution: Mediation and arbitration procedures");
  bullet("General Provisions: Force majeure, amendments, governing law");
  doc.moveDown(0.8);

  heading("Professional PDF Export", 14, COLORS.primaryDark, 4);
  body(
    "The entire SOW -- including complexity analysis, line items, extensions, legal terms, and signature blocks -- can be exported as a professionally formatted PDF suitable for client presentation and contract signing."
  );

  // ===== SECTION 7: AI INTELLIGENCE =====
  doc.addPage();
  heading("7. AI-Powered Intelligence", 22, COLORS.dark);
  doc.moveDown(0.5);

  body(
    "Vibe Refactor uses large language models throughout the workflow to transform raw, conversational input into structured, actionable specifications. Here's how AI is integrated at each step:"
  );
  doc.moveDown(0.8);

  numberedItem(
    1,
    "Context Generation",
    "When questions are loaded, the AI generates a system-level context understanding of the project type and domain. This context informs all subsequent AI interactions."
  );
  numberedItem(
    2,
    "Clean Text",
    "Speech-to-text transcriptions are often rough -- filled with filler words, incomplete sentences, and grammatical errors. The Clean Text feature transforms raw speech into clear, professional prose while preserving the user's intent."
  );
  numberedItem(
    3,
    "Agent Assist",
    "Acts as an AI product coach that evaluates answer specificity and provides actionable suggestions. It understands the project context and tailors its feedback to the specific question being answered."
  );
  numberedItem(
    4,
    "Research & Examples",
    "Provides industry-specific insights, concrete implementation examples, and best practices relevant to the user's project. Helps users make informed decisions even without domain expertise."
  );
  numberedItem(
    5,
    "MVP Plan Generation",
    "The most complex AI task -- analyzing all Q&A pairs to produce a comprehensive 8-section MVP plan. The AI structures screens, user flows, data requirements, and generates a complete build prompt."
  );
  numberedItem(
    6,
    "Build Pack Generation",
    "Takes the detailed summary and creates categorized prompt bundles optimized for different aspects of development (UI, API, data model, etc.)."
  );
  numberedItem(
    7,
    "SOW Generation",
    "Analyzes the project complexity, generates line items with hour estimates, and produces pricing based on the complexity tier. Also generates extension SOWs for future phases."
  );

  doc.moveDown(0.8);

  heading("LLM Logging & Auditability", 14, COLORS.primaryDark, 4);
  body(
    "Every AI call is logged to a PostgreSQL database with full request/response data, timing information, and status. Users can view all logs through the Logs dialog, filter by project, and troubleshoot any AI-related issues. This transparency builds trust and supports debugging."
  );

  // ===== SECTION 8: CONFIGURABLE SETTINGS =====
  doc.addPage();
  heading("8. Configurable Settings", 22, COLORS.dark);
  doc.moveDown(0.5);

  heading("LLM Provider Settings", 14, COLORS.primaryDark, 4);
  body("Users can choose their preferred AI provider and model:");
  doc.moveDown(0.4);
  bullet("OpenAI (default): Uses Replit's built-in integration. Models include gpt-4.1, gpt-4.5-preview, and more.");
  bullet("Anthropic: Bring your own API key. Supports Claude models.");
  bullet("Custom: Any OpenAI-compatible API endpoint with custom base URL and API key.");
  doc.moveDown(0.4);
  body(
    "By default, Vibe Refactor uses Replit's integrated OpenAI connection, so users can start immediately without any API key configuration."
  );
  doc.moveDown(0.8);

  heading("Feature Toggles", 14, COLORS.primaryDark, 4);
  body(
    "The Features tab in Settings allows users to customize their wizard experience. Currently available toggles:"
  );
  doc.moveDown(0.4);
  bullet(
    "Statement of Work: Enable or disable the SOW step. When disabled, the wizard goes directly from Build Pack to Create App (5 steps instead of 6). Changes take effect immediately without a page refresh."
  );
  doc.moveDown(0.4);
  body(
    "Feature settings are stored in the browser and propagated in real-time using custom events, so changes are reflected instantly across all wizard components."
  );

  // ===== SECTION 9: TECHNICAL ARCHITECTURE =====
  doc.addPage();
  heading("9. Technical Architecture", 22, COLORS.dark);
  doc.moveDown(0.5);

  body("Vibe Refactor is built on a modern, production-ready stack optimized for the Replit platform:");
  doc.moveDown(0.8);

  heading("Frontend", 14, COLORS.primaryDark, 4);
  bullet("React with TypeScript for type-safe component development");
  bullet("Vite for fast development and optimized production builds");
  bullet("Shadcn/ui component library with Tailwind CSS for consistent, accessible design");
  bullet("TanStack React Query for efficient data fetching and cache management");
  bullet("Web Speech API for browser-native voice recording");
  doc.moveDown(0.8);

  heading("Backend", 14, COLORS.primaryDark, 4);
  bullet("Express.js server handling all API routes");
  bullet("Configurable LLM client supporting OpenAI, Anthropic, and custom endpoints");
  bullet("PostgreSQL (Neon-backed) for LLM call logging");
  bullet("In-memory storage for project state (fast, session-based)");
  bullet("Zod schema validation for all API requests and responses");
  doc.moveDown(0.8);

  heading("Design System", 14, COLORS.primaryDark, 4);
  bullet("Purple primary theme (#7C3AED) with dark mode support");
  bullet("Inter font for UI, JetBrains Mono for code/technical content");
  bullet("Clean, minimal aesthetic inspired by Linear and Notion");
  bullet("Responsive layout with sidebar project management");

  // ===== SECTION 10: VALUE PROPOSITION =====
  doc.addPage();
  heading("10. Value Proposition Summary", 22, COLORS.dark);
  doc.moveDown(0.5);

  body(
    "Vibe Refactor fundamentally changes the equation for non-technical builders on Replit. Here's the value it delivers:"
  );
  doc.moveDown(1);

  heading("For Non-Technical Users", 14, COLORS.green, 4);
  bullet("Speak your ideas instead of writing specifications -- voice-first design removes the biggest barrier");
  bullet("AI coaching ensures your answers are specific enough to produce great results");
  bullet("Structured wizard prevents missing critical requirements");
  bullet("The output (Build Prompt) is optimized specifically for Replit Agent");
  bullet("No technical knowledge required -- the system translates your vision into technical specs");
  doc.moveDown(0.8);

  heading("For Freelancers & Agencies", 14, COLORS.green, 4);
  bullet("Generate professional SOWs in minutes instead of hours");
  bullet("Complexity analysis provides data-backed estimates, reducing pricing guesswork");
  bullet("Legal terms template saves legal consultation costs");
  bullet("PDF exports are client-ready and professional");
  bullet("Extension SOWs help plan and sell future development phases");
  doc.moveDown(0.8);

  heading("For the Replit Ecosystem", 14, COLORS.green, 4);
  bullet("Higher quality prompts mean better Replit Agent output, leading to happier users");
  bullet("Structured requirements reduce the back-and-forth cycles that frustrate new users");
  bullet("Lowers the barrier to entry for non-technical users, expanding Replit's addressable market");
  bullet("The SOW system adds professional tooling that keeps advanced users on the platform");
  bullet("LLM logging provides transparency and builds trust in AI-powered features");

  doc.moveDown(1.5);
  drawDivider(doc.y);
  doc.moveDown(1);

  doc
    .fontSize(12)
    .fillColor(COLORS.primary)
    .font("Helvetica-Bold")
    .text("Vibe Refactor: From scattered ideas to production-ready applications.", {
      width: pageWidth,
      align: "center",
    });
  doc.moveDown(0.5);
  doc
    .fontSize(10)
    .fillColor(COLORS.textLight)
    .font("Helvetica")
    .text("Built for the Replit community. Powered by AI. Designed for everyone.", {
      width: pageWidth,
      align: "center",
    });

  addFooter();

  doc.end();

  stream.on("finish", () => {
    console.log(`PDF generated successfully: ${outputPath}`);
  });
}

generateDoc();
