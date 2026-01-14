import { useEffect, useCallback } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { WizardProgress } from "@/components/wizard-progress";
import { ThemeToggle } from "@/components/theme-toggle";
import { SettingsDialog } from "@/components/settings-dialog";
import { LogsDialog } from "@/components/logs-dialog";
import { LoadScriptStep } from "@/components/steps/load-script-step";
import { CaptureAnswersStep } from "@/components/steps/capture-answers-step";
import { ReviewSummarizeStep } from "@/components/steps/review-summarize-step";
import { GenerateBuildPackStep } from "@/components/steps/generate-build-pack-step";
import { CreateAppStep } from "@/components/steps/create-app-step";
import { useProjects } from "@/hooks/use-projects";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import type { Question, AgentContext, DetailedSummary } from "@shared/schema";

export default function Home() {
  const {
    projects,
    activeProject,
    activeProjectId,
    isLoading,
    setActiveProjectId,
    createProject,
    deleteProject,
    renameProject,
    setCurrentStep,
    setQuestions,
    updateQuestion,
    setSummary,
    setDetailedSummary,
    setGeneratedPrompts,
    setScriptContent,
    setAgentContext,
  } = useProjects();

  useEffect(() => {
    if (!isLoading && projects.length === 0) {
      createProject({ name: "My First Project" });
    }
  }, [isLoading, projects.length, createProject]);

  const currentStep = activeProject?.currentStep || 1;

  const generateContext = useCallback(async (projectName: string, questions: Question[]) => {
    try {
      const response = await apiRequest("POST", "/api/generateContext", {
        projectName,
        questions: questions.map(q => ({ text: q.text })),
      });
      const context: AgentContext = await response.json();
      setAgentContext(context);
    } catch (error) {
      console.error("Failed to generate context:", error);
      setAgentContext({
        systemPrompt: `You are helping capture requirements for an MVP called "${projectName}".`,
        generatedAt: new Date().toISOString(),
      });
    }
  }, [setAgentContext]);

  const handleQuestionsExtracted = useCallback(async (questions: Question[], content: string, source: "upload" | "paste" | "googleDrive") => {
    setQuestions(questions);
    setScriptContent(content, source);
    setCurrentStep(2);
    
    if (activeProject) {
      generateContext(activeProject.name, questions);
    }
  }, [setQuestions, setScriptContent, setCurrentStep, activeProject, generateContext]);

  const handleStepClick = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  const sidebarStyle = {
    "--sidebar-width": "280px",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const renderStep = () => {
    if (!activeProject) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No project selected</p>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <LoadScriptStep
            onQuestionsExtracted={handleQuestionsExtracted}
            initialQuestions={activeProject.questions}
            initialContent={activeProject.scriptContent}
          />
        );
      case 2:
        return (
          <CaptureAnswersStep
            questions={activeProject.questions || []}
            projectName={activeProject.name}
            agentContext={activeProject.agentContext}
            onUpdateQuestion={updateQuestion}
            onContinue={() => setCurrentStep(3)}
          />
        );
      case 3:
        return (
          <ReviewSummarizeStep
            questions={activeProject.questions || []}
            projectName={activeProject.name}
            detailedSummary={activeProject.detailedSummary}
            onSaveDetailedSummary={setDetailedSummary}
            onContinue={() => setCurrentStep(4)}
          />
        );
      case 4:
        return (
          <GenerateBuildPackStep
            projectName={activeProject.name}
            detailedSummary={activeProject.detailedSummary}
            questions={activeProject.questions || []}
            prompts={activeProject.generatedPrompts}
            onSavePrompts={setGeneratedPrompts}
            onContinue={() => setCurrentStep(5)}
          />
        );
      case 5:
        return (
          <CreateAppStep
            projectName={activeProject.name}
            prompts={activeProject.generatedPrompts}
            detailedSummary={activeProject.detailedSummary}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full">
        <AppSidebar
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={setActiveProjectId}
          onCreateProject={createProject}
          onDeleteProject={deleteProject}
          onRenameProject={renameProject}
        />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              {activeProject && (
                <h2 className="text-sm font-medium text-muted-foreground">
                  {activeProject.name}
                </h2>
              )}
            </div>
            <div className="flex items-center gap-1">
              <LogsDialog />
              <SettingsDialog />
              <ThemeToggle />
            </div>
          </header>
          
          {activeProject && (
            <WizardProgress
              currentStep={currentStep}
              onStepClick={handleStepClick}
            />
          )}
          
          <main className="flex-1 overflow-auto px-8 py-6">
            {renderStep()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
