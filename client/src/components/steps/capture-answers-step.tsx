import { useState, useEffect, useCallback, useRef } from "react";
import { Mic, Square, RotateCcw, Edit3, Check, ChevronDown, ChevronUp, ArrowRight, Keyboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useSpeechTranscription } from "@/hooks/use-speech-transcription";
import type { Question } from "@shared/schema";

interface CaptureAnswersStepProps {
  questions: Question[];
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
  onContinue: () => void;
}

function RecordingWaveform({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex items-center gap-1 h-6">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 bg-destructive rounded-full transition-all",
            isActive ? "animate-pulse" : "h-1"
          )}
          style={{
            height: isActive ? `${Math.random() * 16 + 8}px` : "4px",
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

function QuestionCard({
  question,
  index,
  isRecording,
  onStartRecording,
  onStopRecording,
  onUpdateAnswer,
  isActive,
}: {
  question: Question;
  index: number;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onUpdateAnswer: (text: string) => void;
  isActive: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(!question.answerText);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(question.answerText || "");
  const [interimText, setInterimText] = useState("");

  const { isRecording: localIsRecording, fullTranscript, error, isSupported, startRecording, stopRecording } =
    useSpeechTranscription({
      onFinal: (transcript) => {
        onUpdateAnswer(transcript);
        setIsExpanded(true);
      },
      onInterim: (transcript) => {
        setInterimText(transcript);
      },
    });

  useEffect(() => {
    if (isRecording && !localIsRecording) {
      startRecording();
      setIsExpanded(true);
    } else if (!isRecording && localIsRecording) {
      stopRecording();
    }
  }, [isRecording, localIsRecording, startRecording, stopRecording]);

  const handleSaveEdit = () => {
    onUpdateAnswer(editText);
    setIsEditing(false);
  };

  const hasAnswer = !!question.answerText;

  return (
    <Card
      className={cn(
        "transition-all",
        isActive && "ring-2 ring-primary",
        isRecording && "ring-2 ring-destructive"
      )}
      data-testid={`question-card-${question.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center shrink-0">
            {index + 1}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-4">
              <p className="text-base font-medium">{question.text}</p>
              <div className="flex items-center gap-2 shrink-0">
                {hasAnswer && (
                  <Badge variant="secondary" className="text-xs">
                    Answered
                  </Badge>
                )}
                {isRecording && (
                  <Badge variant="destructive" className="text-xs animate-pulse">
                    Recording
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              {!isRecording ? (
                <>
                  <Button
                    onClick={onStartRecording}
                    disabled={!isSupported}
                    variant={hasAnswer ? "outline" : "default"}
                    size="sm"
                    className="gap-2"
                    data-testid={`button-record-${question.id}`}
                  >
                    <Mic className="w-4 h-4" />
                    {hasAnswer ? "Re-record" : "Record"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setIsEditing(true);
                      setEditText(question.answerText || "");
                      setIsExpanded(true);
                    }}
                    data-testid={`button-edit-${question.id}`}
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Text
                  </Button>
                </>
              ) : (
                <Button
                  onClick={onStopRecording}
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  data-testid={`button-stop-${question.id}`}
                >
                  <Square className="w-4 h-4" />
                  Stop Recording
                </Button>
              )}

              {isRecording && <RecordingWaveform isActive />}
            </div>

            {error && (
              <p className="text-sm text-destructive mb-4">{error}</p>
            )}

            {!isSupported && (
              <p className="text-sm text-muted-foreground mb-4">
                Speech recognition is not supported in this browser. Please use text editing.
              </p>
            )}

            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 w-full justify-between">
                  <span className="text-muted-foreground">
                    {hasAnswer ? "View Answer" : "Answer"}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="p-4 rounded-lg bg-muted/50 min-h-[100px]">
                  {isEditing ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-[100px] bg-background"
                        placeholder="Type your answer here..."
                        data-testid={`textarea-answer-${question.id}`}
                      />
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={handleSaveEdit} data-testid={`button-save-answer-${question.id}`}>
                          <Check className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditing(false)}
                          data-testid={`button-cancel-edit-${question.id}`}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : isRecording ? (
                    <p className="font-mono text-sm whitespace-pre-wrap">
                      {interimText || fullTranscript || (
                        <span className="text-muted-foreground italic">Listening...</span>
                      )}
                    </p>
                  ) : (
                    <p className="font-mono text-sm whitespace-pre-wrap">
                      {question.answerText || (
                        <span className="text-muted-foreground italic">No answer recorded yet.</span>
                      )}
                    </p>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CaptureAnswersStep({ questions, onUpdateQuestion, onContinue }: CaptureAnswersStepProps) {
  const [recordingQuestionId, setRecordingQuestionId] = useState<string | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const questionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const answeredCount = questions.filter((q) => !!q.answerText).length;
  const progress = (answeredCount / questions.length) * 100;

  const handleStartRecording = useCallback((questionId: string) => {
    if (recordingQuestionId && recordingQuestionId !== questionId) {
      setRecordingQuestionId(null);
      setTimeout(() => setRecordingQuestionId(questionId), 100);
    } else {
      setRecordingQuestionId(questionId);
    }
  }, [recordingQuestionId]);

  const handleStopRecording = useCallback(() => {
    setRecordingQuestionId(null);
  }, []);

  const goToNextUnanswered = useCallback(() => {
    const nextIndex = questions.findIndex((q, i) => i > activeQuestionIndex && !q.answerText);
    if (nextIndex !== -1) {
      setActiveQuestionIndex(nextIndex);
      const ref = questionRefs.current.get(questions[nextIndex].id);
      ref?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      const firstUnanswered = questions.findIndex((q) => !q.answerText);
      if (firstUnanswered !== -1) {
        setActiveQuestionIndex(firstUnanswered);
        const ref = questionRefs.current.get(questions[firstUnanswered].id);
        ref?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [questions, activeQuestionIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return;
      }

      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        if (recordingQuestionId) {
          handleStopRecording();
        } else {
          handleStartRecording(questions[activeQuestionIndex].id);
        }
      }

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        goToNextUnanswered();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [questions, activeQuestionIndex, recordingQuestionId, handleStartRecording, handleStopRecording, goToNextUnanswered]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Capture Answers</h2>
          <p className="text-muted-foreground">
            Record voice answers for each question. Use keyboard shortcuts for faster capture.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2">
          <Keyboard className="w-4 h-4" />
          <span>R: Record</span>
          <span className="text-muted-foreground/50">|</span>
          <span>N: Next</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {answeredCount} / {questions.length} answered
        </span>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div
            key={question.id}
            ref={(el) => {
              if (el) questionRefs.current.set(question.id, el);
            }}
          >
            <QuestionCard
              question={question}
              index={index}
              isRecording={recordingQuestionId === question.id}
              onStartRecording={() => {
                setActiveQuestionIndex(index);
                handleStartRecording(question.id);
              }}
              onStopRecording={handleStopRecording}
              onUpdateAnswer={(text) => onUpdateQuestion(question.id, { answerText: text })}
              isActive={activeQuestionIndex === index}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={goToNextUnanswered} className="gap-2" data-testid="button-next-unanswered">
          <RotateCcw className="w-4 h-4" />
          Next Unanswered
        </Button>
        <Button
          onClick={onContinue}
          disabled={answeredCount === 0}
          size="lg"
          className="gap-2"
          data-testid="button-continue-to-review"
        >
          Continue to Review
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
