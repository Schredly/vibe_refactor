import { useState, useEffect, useCallback } from "react";
import type { Project, InsertProject, Question, Summary, PromptBundle } from "@shared/schema";

const STORAGE_KEY = "vibe-refactor-projects";

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getStoredProjects(): Project[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredProjects();
    setProjects(stored);
    if (stored.length > 0 && !activeProjectId) {
      setActiveProjectId(stored[0].id);
    }
    setIsLoading(false);
  }, [activeProjectId]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  const createProject = useCallback((data: Partial<InsertProject> = {}): Project => {
    const now = new Date().toISOString();
    const newProject: Project = {
      id: generateId(),
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

    setProjects((prev) => {
      const updated = [newProject, ...prev];
      saveProjects(updated);
      return updated;
    });
    setActiveProjectId(newProject.id);
    return newProject;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>): void => {
    setProjects((prev) => {
      const updated = prev.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      );
      saveProjects(updated);
      return updated;
    });
  }, []);

  const deleteProject = useCallback((id: string): void => {
    setProjects((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveProjects(updated);
      return updated;
    });
    if (activeProjectId === id) {
      const remaining = projects.filter((p) => p.id !== id);
      setActiveProjectId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [activeProjectId, projects]);

  const renameProject = useCallback((id: string, name: string): void => {
    updateProject(id, { name });
  }, [updateProject]);

  const setCurrentStep = useCallback((step: number): void => {
    if (activeProjectId) {
      updateProject(activeProjectId, { currentStep: step });
    }
  }, [activeProjectId, updateProject]);

  const setQuestions = useCallback((questions: Question[]): void => {
    if (activeProjectId) {
      updateProject(activeProjectId, { questions });
    }
  }, [activeProjectId, updateProject]);

  const updateQuestion = useCallback((questionId: string, updates: Partial<Question>): void => {
    if (activeProject) {
      const updatedQuestions = (activeProject.questions || []).map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      );
      updateProject(activeProjectId!, { questions: updatedQuestions });
    }
  }, [activeProject, activeProjectId, updateProject]);

  const setSummary = useCallback((summary: Summary): void => {
    if (activeProjectId) {
      updateProject(activeProjectId, { summary });
    }
  }, [activeProjectId, updateProject]);

  const setGeneratedPrompts = useCallback((prompts: PromptBundle[]): void => {
    if (activeProjectId) {
      updateProject(activeProjectId, { generatedPrompts: prompts });
    }
  }, [activeProjectId, updateProject]);

  const setScriptContent = useCallback((content: string, source: "upload" | "paste" | "googleDrive"): void => {
    if (activeProjectId) {
      updateProject(activeProjectId, { scriptContent: content, scriptSource: source });
    }
  }, [activeProjectId, updateProject]);

  return {
    projects,
    activeProject,
    activeProjectId,
    isLoading,
    setActiveProjectId,
    createProject,
    updateProject,
    deleteProject,
    renameProject,
    setCurrentStep,
    setQuestions,
    updateQuestion,
    setSummary,
    setGeneratedPrompts,
    setScriptContent,
  };
}
