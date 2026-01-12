import { useState, useCallback, useRef, useEffect } from "react";

interface UseSpeechTranscriptionOptions {
  onTranscriptChange?: (transcript: string) => void;
  lang?: string;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInterface;
    webkitSpeechRecognition: new () => SpeechRecognitionInterface;
  }
}

export function useSpeechTranscription(options: UseSpeechTranscriptionOptions = {}) {
  const { onTranscriptChange, lang = "en-US" } = options;
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);
  const shouldRestartRef = useRef(false);
  const transcriptRef = useRef("");
  const onTranscriptChangeRef = useRef(onTranscriptChange);

  useEffect(() => {
    onTranscriptChangeRef.current = onTranscriptChange;
  }, [onTranscriptChange]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalText) {
        transcriptRef.current += finalText;
        setTranscript(transcriptRef.current);
        onTranscriptChangeRef.current?.(transcriptRef.current);
      }

      setInterimTranscript(interimText);
    };

    recognition.onerror = (event: { error: string }) => {
      console.log("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setError("Microphone permission denied. Please allow microphone access in your browser settings.");
      } else if (event.error === "no-speech") {
        // Don't show error for no-speech, just continue
      } else if (event.error === "aborted") {
        // Ignore abort errors
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition ended, shouldRestart:", shouldRestartRef.current);
      if (shouldRestartRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.log("Failed to restart recognition:", e);
        }
      } else {
        setIsRecording(false);
      }
    };

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setIsRecording(true);
      setIsPaused(false);
      setError(null);
    };

    recognitionRef.current = recognition;

    return () => {
      shouldRestartRef.current = false;
      recognition.abort();
    };
  }, [lang]);

  const startRecording = useCallback((preserveTranscript = false) => {
    if (!recognitionRef.current) {
      setError("Speech recognition not supported in this browser. Try using Chrome.");
      return;
    }

    if (!preserveTranscript) {
      transcriptRef.current = "";
      setTranscript("");
    }
    setInterimTranscript("");
    setError(null);
    shouldRestartRef.current = true;
    setIsPaused(false);

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.log("Failed to start recognition:", e);
    }
  }, []);

  const pauseRecording = useCallback(() => {
    shouldRestartRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsPaused(true);
    setIsRecording(false);
    setInterimTranscript("");
  }, []);

  const resumeRecording = useCallback(() => {
    if (!recognitionRef.current) {
      setError("Speech recognition not supported in this browser. Try using Chrome.");
      return;
    }

    setError(null);
    shouldRestartRef.current = true;
    setIsPaused(false);

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.log("Failed to resume recognition:", e);
    }
  }, []);

  const stopRecording = useCallback(() => {
    shouldRestartRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    setInterimTranscript("");
  }, []);

  const resetTranscript = useCallback(() => {
    transcriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
  }, []);

  const setInitialTranscript = useCallback((text: string) => {
    transcriptRef.current = text;
    setTranscript(text);
  }, []);

  return {
    isRecording,
    isPaused,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetTranscript,
    setInitialTranscript,
    fullTranscript: transcript + (interimTranscript ? " " + interimTranscript : ""),
  };
}
