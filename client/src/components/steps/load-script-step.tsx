import { useState, useCallback, useRef } from "react";
import { Upload, FileText, Link, Trash2, GripVertical, Plus, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Question } from "@shared/schema";

interface LoadScriptStepProps {
  onQuestionsExtracted: (questions: Question[], content: string, source: "upload" | "paste" | "googleDrive") => void;
  initialQuestions?: Question[];
  initialContent?: string;
}

type SourceType = "upload" | "paste" | "googleDrive" | null;

function generateQuestionId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function extractQuestions(text: string): Question[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const questions: Question[] = [];

  for (const line of lines) {
    const isQuestion =
      line.endsWith("?") ||
      /^\d+[\.\)]\s/.test(line) ||
      /^[-*]\s/.test(line) ||
      /^#+\s/.test(line);

    if (isQuestion) {
      const cleanedText = line
        .replace(/^[-*]\s/, "")
        .replace(/^\d+[\.\)]\s/, "")
        .replace(/^#+\s/, "")
        .trim();

      if (cleanedText.length > 3) {
        questions.push({
          id: generateQuestionId(),
          text: cleanedText,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  return questions;
}

export function LoadScriptStep({ onQuestionsExtracted, initialQuestions, initialContent }: LoadScriptStepProps) {
  const [sourceType, setSourceType] = useState<SourceType>(null);
  const [pasteContent, setPasteContent] = useState(initialContent || "");
  const [driveLink, setDriveLink] = useState("");
  const [questions, setQuestions] = useState<Question[]>(initialQuestions || []);
  const [showPreview, setShowPreview] = useState(initialQuestions && initialQuestions.length > 0);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const extracted = extractQuestions(content);
      setQuestions(extracted);
      setPasteContent(content);
      setShowPreview(true);
    };
    reader.readAsText(file);
  }, []);

  const handlePaste = useCallback(() => {
    const extracted = extractQuestions(pasteContent);
    setQuestions(extracted);
    setShowPreview(true);
  }, [pasteContent]);

  const handleDriveFallback = useCallback(() => {
    setSourceType("paste");
  }, []);

  const handleAddQuestion = useCallback(() => {
    if (!newQuestionText.trim()) return;
    const newQuestion: Question = {
      id: generateQuestionId(),
      text: newQuestionText.trim(),
      createdAt: new Date().toISOString(),
    };
    setQuestions((prev) => [...prev, newQuestion]);
    setNewQuestionText("");
  }, [newQuestionText]);

  const handleDeleteQuestion = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const handleStartEdit = useCallback((question: Question) => {
    setEditingId(question.id);
    setEditText(question.text);
  }, []);

  const handleSaveEdit = useCallback((id: string) => {
    if (!editText.trim()) return;
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, text: editText.trim() } : q))
    );
    setEditingId(null);
  }, [editText]);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    setQuestions((prev) => {
      const newQuestions = [...prev];
      const [removed] = newQuestions.splice(draggedIndex, 1);
      newQuestions.splice(index, 0, removed);
      setDraggedIndex(index);
      return newQuestions;
    });
  }, [draggedIndex]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const handleContinue = useCallback(() => {
    if (questions.length > 0) {
      onQuestionsExtracted(questions, pasteContent, sourceType || "paste");
    }
  }, [questions, pasteContent, sourceType, onQuestionsExtracted]);

  if (!showPreview) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Load Your Question Script</h2>
          <p className="text-muted-foreground">
            Upload or paste a document containing questions to ask during your MVP discovery session.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className={cn(
              "cursor-pointer hover-elevate transition-all",
              sourceType === "upload" && "ring-2 ring-primary"
            )}
            onClick={() => {
              setSourceType("upload");
              fileInputRef.current?.click();
            }}
            data-testid="card-upload"
          >
            <CardHeader className="text-center pb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Upload File</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Upload a .txt, .md, or text file with your questions
              </CardDescription>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "cursor-pointer hover-elevate transition-all",
              sourceType === "paste" && "ring-2 ring-primary"
            )}
            onClick={() => setSourceType("paste")}
            data-testid="card-paste"
          >
            <CardHeader className="text-center pb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Paste Text</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Paste your question script directly into the editor
              </CardDescription>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "cursor-pointer hover-elevate transition-all",
              sourceType === "googleDrive" && "ring-2 ring-primary"
            )}
            onClick={() => setSourceType("googleDrive")}
            data-testid="card-google-drive"
          >
            <CardHeader className="text-center pb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Link className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Google Drive</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Link a public Google Doc (or paste its contents)
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.markdown"
          onChange={handleFileUpload}
          className="hidden"
          data-testid="input-file-upload"
        />

        {sourceType === "paste" && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Paste Your Script</CardTitle>
              <CardDescription>
                Paste your question script below. Questions are detected as lines ending with "?" or numbered items.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your questions here...

Example:
1. What problem are you trying to solve?
2. Who is your target user?
3. What's the most important feature for your MVP?"
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                data-testid="textarea-paste-content"
              />
              <Button
                onClick={handlePaste}
                disabled={!pasteContent.trim()}
                className="w-full"
                data-testid="button-extract-questions"
              >
                Extract Questions
              </Button>
            </CardContent>
          </Card>
        )}

        {sourceType === "googleDrive" && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Google Drive Link</CardTitle>
              <CardDescription>
                For public docs, paste the link below. Otherwise, copy and paste the document contents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="https://docs.google.com/document/d/..."
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                data-testid="input-drive-link"
              />
              <p className="text-sm text-muted-foreground">
                Note: Direct Google Drive import requires authentication. For now, please copy and paste the contents.
              </p>
              <Button
                variant="secondary"
                onClick={handleDriveFallback}
                className="w-full"
                data-testid="button-paste-fallback"
              >
                Paste Contents Instead
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Review Questions</h2>
          <p className="text-muted-foreground">
            Edit, reorder, or add questions before starting your capture session.
          </p>
        </div>
        <Button onClick={() => setShowPreview(false)} variant="outline" data-testid="button-back">
          Back to Import
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-2">
          {questions.map((question, index) => (
            <div
              key={question.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg bg-muted/50 group",
                draggedIndex === index && "opacity-50"
              )}
              data-testid={`question-item-${question.id}`}
            >
              <div className="cursor-grab text-muted-foreground hover:text-foreground">
                <GripVertical className="w-4 h-4" />
              </div>
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center shrink-0">
                {index + 1}
              </span>
              {editingId === question.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(question.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    data-testid="input-edit-question"
                  />
                  <Button size="sm" onClick={() => handleSaveEdit(question.id)} data-testid="button-save-question">
                    Save
                  </Button>
                </div>
              ) : (
                <>
                  <span
                    className="flex-1 cursor-pointer hover:text-primary"
                    onClick={() => handleStartEdit(question)}
                  >
                    {question.text}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={() => handleDeleteQuestion(question.id)}
                    data-testid={`button-delete-question-${question.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          ))}

          <div className="flex items-center gap-2 pt-2 border-t border-border mt-4">
            <Input
              placeholder="Add a new question..."
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddQuestion();
              }}
              data-testid="input-new-question"
            />
            <Button
              onClick={handleAddQuestion}
              disabled={!newQuestionText.trim()}
              size="icon"
              data-testid="button-add-question"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={questions.length === 0}
          size="lg"
          className="gap-2"
          data-testid="button-continue-to-capture"
        >
          Continue to Capture
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
