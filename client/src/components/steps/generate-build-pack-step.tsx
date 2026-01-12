import { useState } from "react";
import { RefreshCw, Copy, Check, Edit3, ArrowRight, Loader2, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { PromptBundle, DetailedSummary, Question } from "@shared/schema";

interface GenerateBuildPackStepProps {
  projectName: string;
  detailedSummary: DetailedSummary | undefined;
  questions: Question[];
  prompts: PromptBundle[] | undefined;
  onSavePrompts: (prompts: PromptBundle[]) => void;
  onContinue: () => void;
}

function PromptCard({
  prompt,
  onEdit,
  onCopy,
  onRegenerate,
  isRegenerating,
}: {
  prompt: PromptBundle;
  onEdit: (content: string) => void;
  onCopy: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(prompt.content);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onEdit(editContent);
    setIsEditing(false);
  };

  const isMaster = prompt.sequence === 99 || prompt.title.toLowerCase().includes("master");

  return (
    <Card className={cn("bg-muted/30", isMaster && "border-primary/30 bg-primary/5")}>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            {!isMaster && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                {prompt.sequence}
              </div>
            )}
            <div className="min-w-0">
              <CardTitle className="text-sm font-medium truncate">
                {isMaster ? "Master Prompt" : prompt.title}
              </CardTitle>
              {prompt.roles && prompt.roles.length > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  {prompt.roles.slice(0, 3).map((role) => (
                    <Badge key={role} variant="secondary" className="text-xs py-0">
                      {role}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCopy}
              data-testid={`button-copy-${prompt.id}`}
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                setEditContent(prompt.content);
                setIsEditing(!isEditing);
              }}
              data-testid={`button-edit-prompt-${prompt.id}`}
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onRegenerate}
              disabled={isRegenerating}
              data-testid={`button-regenerate-${prompt.id}`}
            >
              <RefreshCw className={cn("w-3 h-3", isRegenerating && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              data-testid={`textarea-prompt-${prompt.id}`}
            />
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleSave} data-testid={`button-save-prompt-${prompt.id}`}>
                Save Changes
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-sm whitespace-pre-wrap bg-background rounded-lg p-4 max-h-[400px] overflow-auto prose prose-sm dark:prose-invert max-w-none">
              {prompt.content.split('\n').map((line, i) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <p key={i} className="font-semibold text-foreground mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>;
                }
                if (line.startsWith('* **') || line.startsWith('- **')) {
                  const parts = line.replace(/^\*\s*/, '').replace(/^-\s*/, '');
                  return <p key={i} className="ml-4 text-muted-foreground">{parts.replace(/\*\*/g, '')}</p>;
                }
                if (line.startsWith('* ') || line.startsWith('- ')) {
                  return <p key={i} className="ml-4 text-muted-foreground">{line.substring(2)}</p>;
                }
                if (/^\d+\.\s/.test(line)) {
                  return <p key={i} className="ml-4 text-muted-foreground font-medium">{line}</p>;
                }
                if (line.trim() === '') {
                  return <div key={i} className="h-2" />;
                }
                return <p key={i}>{line}</p>;
              })}
            </div>
            {prompt.deliverable && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">
                  Deliverable
                </p>
                <p className="text-sm text-green-800 dark:text-green-300">
                  {prompt.deliverable}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function GenerateBuildPackStep({
  projectName,
  detailedSummary,
  questions,
  prompts,
  onSavePrompts,
  onContinue,
}: GenerateBuildPackStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const { toast } = useToast();

  const answeredQuestions = questions.filter((q) => !!q.answerText);

  // Sort prompts by sequence number
  const sortedPrompts = prompts 
    ? [...prompts].sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
    : [];
  
  // Separate sequential prompts from master prompt
  const sequentialPrompts = sortedPrompts.filter(p => (p.sequence || 0) < 99);
  const masterPromptBundle = sortedPrompts.find(p => (p.sequence || 0) === 99 || p.title.toLowerCase().includes("master"));

  const handleGenerate = async () => {
    if (!detailedSummary) return;

    setIsGenerating(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 100000);

      const response = await fetch("/api/generatePrompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          detailedSummary,
          questions: answeredQuestions.map((q) => ({
            text: q.text,
            answerText: q.answerText,
          })),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Failed to generate prompts");
      }

      const data = await response.json();
      
      if (!data.prompts || !Array.isArray(data.prompts)) {
        throw new Error("Invalid response format");
      }

      onSavePrompts(data.prompts);

      toast({
        title: "Build Pack Generated",
        description: `Created ${data.prompts.length} prompt bundles across ${Array.from(new Set(data.prompts.map((p: PromptBundle) => p.category))).length} categories.`,
      });
    } catch (error) {
      console.error("Generate prompts error:", error);
      toast({
        title: "Error",
        description: error instanceof Error && error.name === "AbortError" 
          ? "Request timed out. Please try again." 
          : "Failed to generate Build Pack. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Prompt copied to clipboard.",
    });
  };

  const handleEditPrompt = (id: string, content: string) => {
    if (!prompts) return;
    const updated = prompts.map((p) =>
      p.id === id ? { ...p, content } : p
    );
    onSavePrompts(updated);
  };

  const handleCopyMasterPrompt = () => {
    if (!prompts) return;
    // For sequential prompts, use Prompt N format
    const masterPrompt = sortedPrompts
      .filter(p => (p.sequence || 0) < 99)
      .map((p) => `## Prompt ${p.sequence} — ${p.title}\n\n${p.content}\n\n**Deliverable**\n${p.deliverable || "Complete this step successfully."}`)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(masterPrompt);
    toast({
      title: "Master Prompt Copied",
      description: "All sequential prompts copied to clipboard.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Generate Build Pack</h2>
          <p className="text-muted-foreground">
            Create structured prompts for building your MVP with Replit Agent.
          </p>
        </div>
        {prompts && prompts.length > 0 && (
          <Badge variant="secondary">
            {prompts.length} prompts
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !detailedSummary}
          className="gap-2"
          data-testid="button-generate-prompts"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Build Pack...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              {prompts ? "Regenerate Build Pack" : "Generate Build Pack"}
            </>
          )}
        </Button>
        {!detailedSummary && (
          <span className="text-sm text-muted-foreground">
            Please complete the summary step first.
          </span>
        )}
      </div>

      {prompts && prompts.length > 0 && (
        <>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4 px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Copy className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Copy All Sequential Prompts</p>
                    <p className="text-sm text-muted-foreground">
                      {sequentialPrompts.length} prompts ready for Replit Agent
                    </p>
                  </div>
                </div>
                <Button onClick={handleCopyMasterPrompt} data-testid="button-copy-master">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All Prompts
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sequential Build Prompts</h3>
            <p className="text-sm text-muted-foreground">
              Feed these prompts to Replit Agent in order. Each prompt builds on the previous one.
            </p>
            
            {sequentialPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onEdit={(content) => handleEditPrompt(prompt.id, content)}
                onCopy={() => handleCopyPrompt(prompt.content)}
                onRegenerate={() => {}}
                isRegenerating={regeneratingId === prompt.id}
              />
            ))}

            {masterPromptBundle && (
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Master Prompt (Alternative)</h3>
                <PromptCard
                  prompt={masterPromptBundle}
                  onEdit={(content) => handleEditPrompt(masterPromptBundle.id, content)}
                  onCopy={() => handleCopyPrompt(masterPromptBundle.content)}
                  onRegenerate={() => {}}
                  isRegenerating={regeneratingId === masterPromptBundle.id}
                />
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex justify-end pt-4">
        <Button
          onClick={onContinue}
          disabled={!prompts || prompts.length === 0}
          size="lg"
          className="gap-2"
          data-testid="button-continue-to-create"
        >
          Continue to Create App
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
