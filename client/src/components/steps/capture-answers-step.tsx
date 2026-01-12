import { useState, useEffect, useCallback, useRef } from "react";
import { Mic, Square, Pause, Play, RotateCcw, Edit3, Check, ChevronDown, ChevronUp, ArrowRight, Keyboard } from "lucide-react";
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
  const [heights, setHeights] = useState([4, 4, 4, 4, 4]);

  useEffect(() => {
    if (!isActive) {
      setHeights([4, 4, 4, 4, 4]);
      return;
    }
    
    const interval = setInterval(() => {
      setHeights(prev => prev.map(() => Math.random() * 16 + 8));
    }, 150);
    
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="flex items-center gap-1 h-6">
      {heights.map((height, i) => (
        <div
          key={i}
          className={cn(
            "w-1 bg-destructive rounded-full transition-all duration-150",
          )}
          style={{ height: isActive ? `${height}px` : "4px" }}
        />
      ))}
    </div>
  );
}

export function CaptureAnswersStep({ questions, onUpdateQuestion, onContinue }: CaptureAnswersStepProps) {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const questionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const activeQuestion = questions[activeQuestionIndex];
  
  const {
    isRecording,
    isPaused,
    transcript,
    interimTranscript,
    fullTranscript,
    error,
    isSupported,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetTranscript,
    setInitialTranscript,
  } = useSpeechTranscription({
    onTranscriptChange: (text) => {
      if (activeQuestion) {
        onUpdateQuestion(activeQuestion.id, { answerText: text });
      }
    },
  });

  const answeredCount = questions.filter((q) => !!q.answerText).length;
  const progress = (answeredCount / questions.length) * 100;

  const handleStartRecording = useCallback((questionIndex: number, append = false) => {
    setActiveQuestionIndex(questionIndex);
    const question = questions[questionIndex];
    
    setExpandedQuestions(prev => new Set(prev).add(question.id));
    
    if (append && question.answerText) {
      setInitialTranscript(question.answerText + " ");
      startRecording(true);
    } else {
      startRecording(false);
    }
  }, [questions, startRecording, setInitialTranscript]);

  const handlePauseRecording = useCallback(() => {
    pauseRecording();
    if (activeQuestion && transcript) {
      onUpdateQuestion(activeQuestion.id, { answerText: transcript });
    }
  }, [pauseRecording, activeQuestion, transcript, onUpdateQuestion]);

  const handleResumeRecording = useCallback(() => {
    resumeRecording();
  }, [resumeRecording]);

  const handleStopRecording = useCallback(() => {
    stopRecording();
    if (activeQuestion && transcript) {
      onUpdateQuestion(activeQuestion.id, { answerText: transcript });
    }
  }, [stopRecording, activeQuestion, transcript, onUpdateQuestion]);

  const toggleExpanded = useCallback((questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }, []);

  const goToNextUnanswered = useCallback(() => {
    if (isRecording) {
      handleStopRecording();
    }
    
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
  }, [questions, activeQuestionIndex, isRecording, handleStopRecording]);

  const handleSaveEdit = useCallback((questionId: string) => {
    onUpdateQuestion(questionId, { answerText: editText });
    setIsEditing(null);
    setEditText("");
  }, [editText, onUpdateQuestion]);

  const handleStartEdit = useCallback((question: Question) => {
    if (isRecording) {
      handleStopRecording();
    }
    setIsEditing(question.id);
    setEditText(question.answerText || "");
    setExpandedQuestions(prev => new Set(prev).add(question.id));
  }, [isRecording, handleStopRecording]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return;
      }

      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        if (isRecording) {
          handleStopRecording();
        } else if (isPaused) {
          handleResumeRecording();
        } else {
          handleStartRecording(activeQuestionIndex, false);
        }
      }

      if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        if (isRecording) {
          handlePauseRecording();
        } else if (isPaused) {
          handleResumeRecording();
        }
      }

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        goToNextUnanswered();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeQuestionIndex, isRecording, isPaused, handleStartRecording, handleStopRecording, handlePauseRecording, handleResumeRecording, goToNextUnanswered]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold">Capture Answers</h2>
          <p className="text-muted-foreground">
            Record voice answers for each question. Use keyboard shortcuts for faster capture.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2">
          <Keyboard className="w-4 h-4" />
          <span>R: Record/Stop</span>
          <span className="text-muted-foreground/50">|</span>
          <span>P: Pause/Resume</span>
          <span className="text-muted-foreground/50">|</span>
          <span>N: Next</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          {error}
        </div>
      )}

      {!isSupported && (
        <div className="p-4 rounded-lg bg-muted border text-muted-foreground">
          Speech recognition is not supported in this browser. Please use Chrome or Edge, or use the text editing option.
        </div>
      )}

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
        {questions.map((question, index) => {
          const isActiveQuestion = activeQuestionIndex === index;
          const isQuestionRecording = isRecording && isActiveQuestion;
          const isQuestionPaused = isPaused && isActiveQuestion;
          const hasAnswer = !!question.answerText;
          const isQuestionEditing = isEditing === question.id;
          const isExpanded = expandedQuestions.has(question.id);

          return (
            <div
              key={question.id}
              ref={(el) => {
                if (el) questionRefs.current.set(question.id, el);
              }}
            >
              <Card
                className={cn(
                  "transition-all",
                  isActiveQuestion && !isQuestionRecording && "ring-2 ring-primary",
                  isQuestionRecording && "ring-2 ring-destructive",
                  isQuestionPaused && "ring-2 ring-yellow-500"
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
                          {hasAnswer && !isQuestionRecording && !isQuestionPaused && (
                            <Badge variant="secondary" className="text-xs">
                              Answered
                            </Badge>
                          )}
                          {isQuestionRecording && (
                            <Badge variant="destructive" className="text-xs animate-pulse">
                              Recording
                            </Badge>
                          )}
                          {isQuestionPaused && (
                            <Badge className="text-xs bg-yellow-500 text-yellow-950">
                              Paused
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {!isQuestionRecording && !isQuestionPaused ? (
                          <>
                            <Button
                              onClick={() => {
                                setActiveQuestionIndex(index);
                                handleStartRecording(index, false);
                              }}
                              disabled={!isSupported || isRecording}
                              variant={hasAnswer ? "outline" : "default"}
                              size="sm"
                              className="gap-2"
                              data-testid={`button-record-${question.id}`}
                            >
                              <Mic className="w-4 h-4" />
                              {hasAnswer ? "Re-record" : "Record"}
                            </Button>
                            {hasAnswer && (
                              <Button
                                onClick={() => {
                                  setActiveQuestionIndex(index);
                                  handleStartRecording(index, true);
                                }}
                                disabled={!isSupported || isRecording}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                data-testid={`button-append-${question.id}`}
                              >
                                <Play className="w-4 h-4" />
                                Continue Recording
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() => handleStartEdit(question)}
                              data-testid={`button-edit-${question.id}`}
                            >
                              <Edit3 className="w-4 h-4" />
                              Edit Text
                            </Button>
                          </>
                        ) : isQuestionRecording ? (
                          <>
                            <Button
                              onClick={handlePauseRecording}
                              variant="outline"
                              size="sm"
                              className="gap-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500/10"
                              data-testid={`button-pause-${question.id}`}
                            >
                              <Pause className="w-4 h-4" />
                              Pause
                            </Button>
                            <Button
                              onClick={handleStopRecording}
                              variant="destructive"
                              size="sm"
                              className="gap-2"
                              data-testid={`button-stop-${question.id}`}
                            >
                              <Square className="w-4 h-4" />
                              Stop
                            </Button>
                            <RecordingWaveform isActive />
                          </>
                        ) : isQuestionPaused ? (
                          <>
                            <Button
                              onClick={handleResumeRecording}
                              variant="default"
                              size="sm"
                              className="gap-2"
                              data-testid={`button-resume-${question.id}`}
                            >
                              <Play className="w-4 h-4" />
                              Resume
                            </Button>
                            <Button
                              onClick={handleStopRecording}
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              data-testid={`button-finish-${question.id}`}
                            >
                              <Check className="w-4 h-4" />
                              Done
                            </Button>
                          </>
                        ) : null}
                      </div>

                      <Collapsible open={isExpanded || isQuestionRecording || isQuestionPaused} onOpenChange={() => toggleExpanded(question.id)}>
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
                            {isQuestionEditing ? (
                              <div className="space-y-3">
                                <Textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="min-h-[100px] bg-background"
                                  placeholder="Type your answer here..."
                                  data-testid={`textarea-answer-${question.id}`}
                                />
                                <div className="flex items-center gap-2">
                                  <Button size="sm" onClick={() => handleSaveEdit(question.id)} data-testid={`button-save-answer-${question.id}`}>
                                    <Check className="w-4 h-4 mr-2" />
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setIsEditing(null);
                                      setEditText("");
                                    }}
                                    data-testid={`button-cancel-edit-${question.id}`}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (isQuestionRecording || isQuestionPaused) ? (
                              <div className="space-y-2">
                                <p className="font-mono text-sm whitespace-pre-wrap">
                                  {fullTranscript || (
                                    <span className="text-muted-foreground italic">
                                      {isQuestionRecording ? "Listening... Speak now." : "Paused. Click Resume to continue."}
                                    </span>
                                  )}
                                </p>
                                {interimTranscript && (
                                  <p className="font-mono text-sm text-muted-foreground italic">
                                    {interimTranscript}
                                  </p>
                                )}
                              </div>
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
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 gap-4 flex-wrap">
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
