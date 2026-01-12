import { useState } from "react";
import { RefreshCw, Copy, Check, ChevronDown, Edit3, ArrowRight, Loader2, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { PromptBundle, Summary, Question } from "@shared/schema";

interface GenerateBuildPackStepProps {
  projectName: string;
  summary: Summary | undefined;
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

  return (
    <Card className="bg-muted/30">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{prompt.title}</CardTitle>
          <div className="flex items-center gap-1">
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
      <CardContent className="px-4 pb-4">
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
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
          <pre className="text-sm font-mono whitespace-pre-wrap bg-background rounded-lg p-4 max-h-[300px] overflow-auto">
            {prompt.content}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}

export function GenerateBuildPackStep({
  projectName,
  summary,
  questions,
  prompts,
  onSavePrompts,
  onContinue,
}: GenerateBuildPackStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const { toast } = useToast();

  const answeredQuestions = questions.filter((q) => !!q.answerText);

  const categories = prompts
    ? [...new Set(prompts.map((p) => p.category))]
    : [];

  const handleGenerate = async () => {
    if (!summary) return;

    setIsGenerating(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch("/api/generatePrompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          summary,
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
        description: `Created ${data.prompts.length} prompt bundles across ${[...new Set(data.prompts.map((p: PromptBundle) => p.category))].length} categories.`,
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
    const masterPrompt = prompts
      .map((p) => `## ${p.category}: ${p.title}\n\n${p.content}`)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(masterPrompt);
    toast({
      title: "Master Prompt Copied",
      description: "All prompts combined and copied to clipboard.",
    });
  };

  const masterPromptBundle = prompts?.find((p) => p.title.toLowerCase().includes("master"));

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
          disabled={isGenerating || !summary}
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
        {!summary && (
          <span className="text-sm text-muted-foreground">
            Please complete the summary step first.
          </span>
        )}
      </div>

      {prompts && prompts.length > 0 && (
        <>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Copy className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Copy Master Prompt</p>
                    <p className="text-sm text-muted-foreground">
                      All prompts combined into a single document
                    </p>
                  </div>
                </div>
                <Button onClick={handleCopyMasterPrompt} data-testid="button-copy-master">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Master Prompt
                </Button>
              </div>
            </CardContent>
          </Card>

          <Accordion type="multiple" defaultValue={categories.slice(0, 2)} className="space-y-4">
            {categories.map((category) => {
              const categoryPrompts = prompts.filter((p) => p.category === category);
              return (
                <AccordionItem
                  key={category}
                  value={category}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="py-4 hover:no-underline" data-testid={`accordion-${category}`}>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{category}</span>
                      <Badge variant="secondary" className="text-xs">
                        {categoryPrompts.length} prompts
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 space-y-4">
                    {categoryPrompts.map((prompt) => (
                      <PromptCard
                        key={prompt.id}
                        prompt={prompt}
                        onEdit={(content) => handleEditPrompt(prompt.id, content)}
                        onCopy={() => handleCopyPrompt(prompt.content)}
                        onRegenerate={() => {}}
                        isRegenerating={regeneratingId === prompt.id}
                      />
                    ))}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
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
