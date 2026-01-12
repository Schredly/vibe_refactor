import { useState } from "react";
import { RefreshCw, Check, Edit3, X, AlertTriangle, ArrowRight, Loader2, Plus, Trash2, Monitor, Workflow, Database, Shield, Code, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { DetailedSummary, Question, ScreenDefinition } from "@shared/schema";

interface ReviewSummarizeStepProps {
  questions: Question[];
  projectName: string;
  detailedSummary: DetailedSummary | undefined;
  onSaveDetailedSummary: (summary: DetailedSummary) => void;
  onContinue: () => void;
}

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  testId: string;
}

function EditableText({ value, onSave, placeholder, multiline, testId }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        {multiline ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[100px]"
            placeholder={placeholder}
            data-testid={`textarea-${testId}`}
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            data-testid={`input-${testId}`}
          />
        )}
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleSave} data-testid={`button-save-${testId}`}>
            <Check className="w-3 h-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            <X className="w-3 h-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group flex items-start gap-2 cursor-pointer hover-elevate p-2 -m-2 rounded-md"
      onClick={() => setIsEditing(true)}
      data-testid={`editable-${testId}`}
    >
      <div className="flex-1 whitespace-pre-wrap">
        {value || <span className="text-muted-foreground italic">{placeholder || "Click to edit"}</span>}
      </div>
      <Edit3 className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 mt-0.5" />
    </div>
  );
}

interface EditableListProps {
  items: string[];
  onSave: (items: string[]) => void;
  testId: string;
  icon?: "check" | "x" | "dot";
}

function EditableList({ items, onSave, testId, icon = "dot" }: EditableListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState<string[]>(items);

  const handleSave = () => {
    onSave(editItems.filter(item => item.trim()));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditItems(items);
    setIsEditing(false);
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...editItems];
    newItems[index] = value;
    setEditItems(newItems);
  };

  const handleAddItem = () => {
    setEditItems([...editItems, ""]);
  };

  const handleRemoveItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  const IconComponent = icon === "check" ? Check : icon === "x" ? X : null;
  const iconClass = icon === "check" ? "text-green-600" : icon === "x" ? "text-muted-foreground" : "";

  if (isEditing) {
    return (
      <div className="space-y-2">
        {editItems.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={item}
              onChange={(e) => handleItemChange(i, e.target.value)}
              placeholder="Enter item..."
              data-testid={`input-${testId}-${i}`}
            />
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => handleRemoveItem(i)}
              className="shrink-0"
            >
              <Trash2 className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={handleAddItem} className="gap-1">
          <Plus className="w-3 h-3" />
          Add Item
        </Button>
        <div className="flex items-center gap-2 pt-2">
          <Button size="sm" onClick={handleSave} data-testid={`button-save-${testId}`}>
            <Check className="w-3 h-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            <X className="w-3 h-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group cursor-pointer hover-elevate p-2 -m-2 rounded-md"
      onClick={() => setIsEditing(true)}
      data-testid={`editable-list-${testId}`}
    >
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            {IconComponent ? (
              <IconComponent className={cn("w-4 h-4 mt-0.5 shrink-0", iconClass)} />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            )}
            <span className={icon === "x" ? "text-muted-foreground" : ""}>{item}</span>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-muted-foreground italic">Click to add items</li>
        )}
      </ul>
      <Edit3 className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 absolute top-2 right-2" />
    </div>
  );
}

interface ScreenEditorProps {
  screens: ScreenDefinition[];
  onSave: (screens: ScreenDefinition[]) => void;
}

function ScreenEditor({ screens, onSave }: ScreenEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editScreens, setEditScreens] = useState<ScreenDefinition[]>(screens);

  const handleSave = () => {
    onSave(editScreens);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditScreens(screens);
    setIsEditing(false);
  };

  const updateScreen = (index: number, field: keyof ScreenDefinition, value: string | string[]) => {
    const newScreens = [...editScreens];
    newScreens[index] = { ...newScreens[index], [field]: value };
    setEditScreens(newScreens);
  };

  const addScreen = () => {
    setEditScreens([...editScreens, { name: "", purpose: "", uiElements: [] }]);
  };

  const removeScreen = (index: number) => {
    setEditScreens(editScreens.filter((_, i) => i !== index));
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        {editScreens.map((screen, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Input
                  value={screen.name}
                  onChange={(e) => updateScreen(i, "name", e.target.value)}
                  placeholder="Screen name..."
                  className="font-medium"
                  data-testid={`input-screen-name-${i}`}
                />
                <Button size="icon" variant="ghost" onClick={() => removeScreen(i)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
              <Textarea
                value={screen.purpose}
                onChange={(e) => updateScreen(i, "purpose", e.target.value)}
                placeholder="Purpose of this screen..."
                className="min-h-[60px]"
                data-testid={`textarea-screen-purpose-${i}`}
              />
              <div>
                <label className="text-xs text-muted-foreground">UI Elements (one per line)</label>
                <Textarea
                  value={screen.uiElements.join("\n")}
                  onChange={(e) => updateScreen(i, "uiElements", e.target.value.split("\n").filter(Boolean))}
                  placeholder="Hero section&#10;Login button&#10;Navigation menu"
                  className="min-h-[80px] font-mono text-sm"
                  data-testid={`textarea-screen-elements-${i}`}
                />
              </div>
              <Input
                value={screen.whyItWorks || ""}
                onChange={(e) => updateScreen(i, "whyItWorks", e.target.value)}
                placeholder="Why this design works..."
                data-testid={`input-screen-why-${i}`}
              />
            </div>
          </Card>
        ))}
        <Button variant="outline" onClick={addScreen} className="gap-1">
          <Plus className="w-4 h-4" />
          Add Screen
        </Button>
        <div className="flex items-center gap-2 pt-2">
          <Button size="sm" onClick={handleSave} data-testid="button-save-screens">
            <Check className="w-3 h-3 mr-1" />
            Save Screens
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            <X className="w-3 h-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group cursor-pointer"
      onClick={() => setIsEditing(true)}
      data-testid="editable-screens"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {screens.map((screen, i) => (
          <Card key={i} className="hover-elevate">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Monitor className="w-4 h-4 text-primary" />
                {screen.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">{screen.purpose}</p>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">UI Elements:</p>
                <ul className="space-y-0.5">
                  {screen.uiElements.slice(0, 4).map((el, j) => (
                    <li key={j} className="text-xs flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      {el}
                    </li>
                  ))}
                  {screen.uiElements.length > 4 && (
                    <li className="text-xs text-muted-foreground">+{screen.uiElements.length - 4} more</li>
                  )}
                </ul>
              </div>
              {screen.whyItWorks && (
                <p className="text-xs text-primary/80 italic">{screen.whyItWorks}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {screens.length === 0 && (
        <p className="text-muted-foreground italic">Click to add screens</p>
      )}
    </div>
  );
}

export function ReviewSummarizeStep({
  questions,
  projectName,
  detailedSummary,
  onSaveDetailedSummary,
  onContinue,
}: ReviewSummarizeStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["definition", "scope", "screens", "flow", "prompt"]));

  const answeredQuestions = questions.filter((q) => !!q.answerText);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

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
      onSaveDetailedSummary({ ...data, agreed: false });
      setExpandedSections(new Set(["definition", "scope", "screens", "flow", "prompt"]));
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
    if (detailedSummary) {
      onSaveDetailedSummary({ ...detailedSummary, agreed: true });
    }
  };

  const updateField = <K extends keyof DetailedSummary>(field: K, value: DetailedSummary[K]) => {
    if (detailedSummary) {
      onSaveDetailedSummary({ ...detailedSummary, [field]: value, agreed: false });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold">Review & Summarize</h2>
          <p className="text-muted-foreground">
            Generate a comprehensive MVP plan and edit each section before proceeding.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {detailedSummary?.agreed ? (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
              <Check className="w-3 h-3 mr-1" />
              Agreed
            </Badge>
          ) : detailedSummary ? (
            <Badge variant="secondary">Draft - Edit sections below</Badge>
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

      <div className="flex items-center gap-3 flex-wrap">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || answeredQuestions.length === 0}
          className="gap-2"
          data-testid="button-generate-summary"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating detailed plan...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {detailedSummary ? "Regenerate Plan" : "Generate MVP Plan"}
            </>
          )}
        </Button>
        {answeredQuestions.length === 0 && (
          <span className="text-sm text-muted-foreground">
            Please answer at least one question first.
          </span>
        )}
        {detailedSummary?.lastGeneratedAt && (
          <span className="text-xs text-muted-foreground">
            Generated: {new Date(detailedSummary.lastGeneratedAt).toLocaleString()}
          </span>
        )}
      </div>

      {detailedSummary && (
        <div className="space-y-4">
          {/* One-Sentence Definition */}
          <Collapsible open={expandedSections.has("definition")} onOpenChange={() => toggleSection("definition")}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover-elevate">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    MVP Definition
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <EditableText
                    value={detailedSummary.oneSentenceDefinition}
                    onSave={(v) => updateField("oneSentenceDefinition", v)}
                    placeholder="A single sentence defining your MVP..."
                    testId="definition"
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* MVP Scope */}
          <Collapsible open={expandedSections.has("scope")} onOpenChange={() => toggleSection("scope")}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover-elevate">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    MVP Scope
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        Include in MVP
                      </h4>
                      <EditableList
                        items={detailedSummary.mvpScope.includes}
                        onSave={(items) => updateField("mvpScope", { ...detailedSummary.mvpScope, includes: items })}
                        testId="scope-includes"
                        icon="check"
                      />
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <X className="w-4 h-4 text-muted-foreground" />
                        Defer to Later
                      </h4>
                      <EditableList
                        items={detailedSummary.mvpScope.excludes}
                        onSave={(items) => updateField("mvpScope", { ...detailedSummary.mvpScope, excludes: items })}
                        testId="scope-excludes"
                        icon="x"
                      />
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Screens */}
          <Collapsible open={expandedSections.has("screens")} onOpenChange={() => toggleSection("screens")}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover-elevate">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-primary" />
                    MVP Screens ({detailedSummary.screens.length})
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <ScreenEditor
                    screens={detailedSummary.screens}
                    onSave={(screens) => updateField("screens", screens)}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* User Flow */}
          <Collapsible open={expandedSections.has("flow")} onOpenChange={() => toggleSection("flow")}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover-elevate">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-primary" />
                    User Flow
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <EditableList
                    items={detailedSummary.userFlow}
                    onSave={(items) => updateField("userFlow", items)}
                    testId="user-flow"
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* AI Architecture (if present) */}
          {detailedSummary.aiArchitecture && (
            <Collapsible open={expandedSections.has("ai")} onOpenChange={() => toggleSection("ai")}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover-elevate">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      AI / Agent Architecture
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    {detailedSummary.aiArchitecture.roles.map((role, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50">
                        <p className="font-medium">{role.name}</p>
                        <ul className="mt-1 text-sm text-muted-foreground">
                          {role.responsibilities.map((r, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {detailedSummary.aiArchitecture.notes && (
                      <p className="text-sm text-muted-foreground italic">{detailedSummary.aiArchitecture.notes}</p>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Data Sources */}
          <Collapsible open={expandedSections.has("data")} onOpenChange={() => toggleSection("data")}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover-elevate">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    Data Sources
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">MVP Sources</h4>
                      <EditableList
                        items={detailedSummary.dataSources.mvpSources}
                        onSave={(items) => updateField("dataSources", { ...detailedSummary.dataSources, mvpSources: items })}
                        testId="data-mvp"
                      />
                    </div>
                    {detailedSummary.dataSources.futureSources && detailedSummary.dataSources.futureSources.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Future Sources</h4>
                        <EditableList
                          items={detailedSummary.dataSources.futureSources || []}
                          onSave={(items) => updateField("dataSources", { ...detailedSummary.dataSources, futureSources: items })}
                          testId="data-future"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Legal Guardrails */}
          <Collapsible open={expandedSections.has("legal")} onOpenChange={() => toggleSection("legal")}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover-elevate">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Legal & Safety Guardrails
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <EditableList
                    items={detailedSummary.legalGuardrails}
                    onSave={(items) => updateField("legalGuardrails", items)}
                    testId="legal-guardrails"
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Build Prompt */}
          <Collapsible open={expandedSections.has("prompt")} onOpenChange={() => toggleSection("prompt")}>
            <Card className="border-primary/30">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover-elevate">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="w-5 h-5 text-primary" />
                    Replit-Ready Build Prompt
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <EditableText
                    value={detailedSummary.buildPrompt}
                    onSave={(v) => updateField("buildPrompt", v)}
                    placeholder="The comprehensive prompt to build this MVP..."
                    multiline
                    testId="build-prompt"
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      )}

      {detailedSummary && !detailedSummary.agreed && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Review Your Plan</AlertTitle>
          <AlertDescription>
            Click on any section to edit it. When you're satisfied, mark as "Agreed" to continue.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between pt-4 gap-4 flex-wrap">
        {detailedSummary && !detailedSummary.agreed ? (
          <Button onClick={handleAgree} variant="default" className="gap-2" data-testid="button-agree-summary">
            <Check className="w-4 h-4" />
            Mark as Agreed
          </Button>
        ) : (
          <div />
        )}
        <Button
          onClick={onContinue}
          disabled={!detailedSummary}
          size="lg"
          className={cn("gap-2", !detailedSummary?.agreed && "opacity-75")}
          data-testid="button-continue-to-prompts"
        >
          {!detailedSummary?.agreed && detailedSummary && (
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          )}
          Continue to Build Pack
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
