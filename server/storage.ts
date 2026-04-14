import type { Project, InsertProject, InsertLlmLog, LlmLog } from "@shared/schema";
import { llmLogs } from "@shared/schema";
import { db, hasDatabase } from "./db";
import { desc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getProject(id: string): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  createProject(project: Partial<InsertProject>): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  
  // LLM logging
  createLlmLog(log: InsertLlmLog): Promise<LlmLog>;
  getLlmLogs(limit?: number): Promise<LlmLog[]>;
  getLlmLogsByProject(projectId: string): Promise<LlmLog[]>;
  clearLlmLogs(): Promise<void>;
}

// Projects are kept in memory (localStorage on frontend handles persistence)
// LLM logs are stored in database for persistence, with in-memory fallback
export class HybridStorage implements IStorage {
  private projects: Map<string, Project>;
  private memoryLogs: LlmLog[] = [];
  private nextLogId = 1;

  constructor() {
    this.projects = new Map();
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async createProject(data: Partial<InsertProject>): Promise<Project> {
    const now = new Date().toISOString();
    const project: Project = {
      id: randomUUID(),
      name: data.name || "New Project",
      scriptSource: data.scriptSource,
      scriptContent: data.scriptContent,
      questions: data.questions || [],
      summary: data.summary,
      generatedPrompts: data.generatedPrompts,
      currentStep: data.currentStep || 1,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(project.id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updated: Project = {
      ...project,
      ...updates,
      id: project.id,
      createdAt: project.createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  // LLM Logging methods - PostgreSQL when available, otherwise in-memory
  async createLlmLog(log: InsertLlmLog): Promise<LlmLog> {
    if (hasDatabase && db) {
      const [created] = await db.insert(llmLogs).values(log).returning();
      return created;
    }
    const created: LlmLog = {
      id: this.nextLogId++,
      createdAt: new Date(),
      stepName: log.stepName,
      projectId: log.projectId ?? null,
      provider: log.provider,
      model: log.model,
      inputMessages: log.inputMessages,
      outputContent: log.outputContent ?? null,
      inputTokens: null,
      outputTokens: null,
      durationMs: log.durationMs ?? null,
      status: log.status ?? "success",
      errorMessage: log.errorMessage ?? null,
    };
    this.memoryLogs.unshift(created);
    if (this.memoryLogs.length > 1000) this.memoryLogs.length = 1000;
    return created;
  }

  async getLlmLogs(limit: number = 100): Promise<LlmLog[]> {
    if (hasDatabase && db) {
      return db.select().from(llmLogs).orderBy(desc(llmLogs.createdAt)).limit(limit);
    }
    return this.memoryLogs.slice(0, limit);
  }

  async getLlmLogsByProject(projectId: string): Promise<LlmLog[]> {
    if (hasDatabase && db) {
      return db.select().from(llmLogs)
        .where(eq(llmLogs.projectId, projectId))
        .orderBy(desc(llmLogs.createdAt));
    }
    return this.memoryLogs.filter((l) => l.projectId === projectId);
  }

  async clearLlmLogs(): Promise<void> {
    if (hasDatabase && db) {
      await db.delete(llmLogs);
      return;
    }
    this.memoryLogs = [];
  }
}

export const storage = new HybridStorage();
