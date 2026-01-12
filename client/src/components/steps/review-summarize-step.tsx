import { useState } from "react";
import { RefreshCw, Check, Edit3, X, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { Summary, Question } from "@shared/schema";

interface ReviewSummarizeStepProps {
  questions: Question[];
  projectName: string;
  summary: Summary | undefined;
  onSaveSummary: (summary: Summary) => void;
  onContinue: () => void;
}

interface EditableSectionProps {
  title: string;
  content: string | string[];
  onSave: (value: string | string[]) => void;
  isArray?: boolean;
}

function EditableSection({ title, content, onSave, isArray = false }: EditableSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(
    isArray ? (content as string[]).join("\n") : (content as string)
  );

  const handleSave = () => {
    if (isArray) {
      onSave(editValue.split("\n").filter((line) => line.trim()));
    } else {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">{title}</h4>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-7"
            data-testid={`button-edit-${title.toLowerCase().replace(/\s/g, "-")}`}
          >
            <Edit3 className="w-3 h-3 mr-1" />
            Edit
          </Button>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[100px]"
            data-testid={`textarea-edit-${title.toLowerCase().replace(/\s/g, "-")}`}
          />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSave} data-testid={`button-save-${title.toLowerCase().replace(/\s/g, "-")}`}>
              <Check className="w-3 h-3 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              <X className="w-3 h-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : isArray ? (
        <ul className="space-y-1">
          {(content as string[]).map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
          {(content as string[]).length === 0 && (
            <li className="text-muted-foreground italic">No items</li>
          )}
        </ul>
      ) : (
        <p className="whitespace-pre-wrap">{content || <span className="text-muted-foreground italic">Not generated yet</span>}</p>
      )}
    </div>
  );
}

export function ReviewSummarizeStep({
  questions,
  projectName,
  summary,
  onSaveSummary,
  onContinue,
}: ReviewSummarizeStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answeredQuestions = questions.filter((q) => !!q.answerText);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          questions: answeredQuestions.map((q) => ({
            text: q.text,
            answerText: q.answerText,
          })),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await response.json();
      onSaveSummary({ ...data, agreed: false });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAgree = () => {
    if (summary) {
      onSaveSummary({ ...summary, agreed: true });
    }
  };

  const handleUpdateField = (field: keyof Summary, value: unknown) => {
    if (summary) {
      onSaveSummary({ ...summary, [field]: value, agreed: false });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Review & Summarize</h2>
          <p className="text-muted-foreground">
            Generate an AI-powered summary of your MVP requirements and confirm accuracy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {summary?.agreed ? (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
              <Check className="w-3 h-3 mr-1" />
              Agreed
            </Badge>
          ) : summary ? (
            <Badge variant="secondary">Draft</Badge>
          ) : null}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || answeredQuestions.length === 0}
          className="gap-2"
          data-testid="button-generate-summary"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              {summary ? "Regenerate Summary" : "Generate MVP Summary"}
            </>
          )}
        </Button>
        {answeredQuestions.length === 0 && (
          <span className="text-sm text-muted-foreground">
            Please answer at least one question first.
          </span>
        )}
      </div>

      {summary && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">MVP Understanding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <EditableSection
              title="Summary"
              content={summary.mvpSummary}
              onSave={(value) => handleUpdateField("mvpSummary", value)}
            />

            <EditableSection
              title="Assumptions"
              content={summary.assumptions}
              onSave={(value) => handleUpdateField("assumptions", value)}
              isArray
            />

            <EditableSection
              title="Open Questions"
              content={summary.openQuestions}
              onSave={(value) => handleUpdateField("openQuestions", value)}
              isArray
            />

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Include in MVP
                </h4>
                <ul className="space-y-1">
                  {summary.recommendedMvpScope.include.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Defer to Later
                </h4>
                <ul className="space-y-1">
                  {summary.recommendedMvpScope.defer.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <X className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <EditableSection
              title="Risks"
              content={summary.risks}
              onSave={(value) => handleUpdateField("risks", value)}
              isArray
            />
          </CardContent>
        </Card>
      )}

      {summary && !summary.agreed && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Review Required</AlertTitle>
          <AlertDescription>
            Please review the summary above and mark it as "Agreed" to continue to the Build Pack generation.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between pt-4">
        {summary && !summary.agreed ? (
          <Button onClick={handleAgree} variant="default" className="gap-2" data-testid="button-agree-summary">
            <Check className="w-4 h-4" />
            Mark as Agreed
          </Button>
        ) : (
          <div />
        )}
        <Button
          onClick={onContinue}
          disabled={!summary}
          size="lg"
          className={cn("gap-2", !summary?.agreed && "opacity-75")}
          data-testid="button-continue-to-prompts"
        >
          {!summary?.agreed && summary && (
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          )}
          Continue to Build Pack
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
