import { useState } from "react";
import { FileText, RefreshCw, Trash2, ChevronDown, ChevronUp, Clock, Cpu, AlertCircle, CheckCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { LlmLog } from "@shared/schema";

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString();
}

function formatDuration(ms: number | null): string {
  if (!ms) return "-";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function truncateText(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

function LogEntry({ log }: { log: LlmLog }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const statusColor = log.status === "success" 
    ? "bg-green-500/10 text-green-600" 
    : log.status === "timeout"
    ? "bg-yellow-500/10 text-yellow-600"
    : "bg-red-500/10 text-red-600";
  
  const StatusIcon = log.status === "success" ? CheckCircle : AlertCircle;

  const inputMessages = log.inputMessages as { role: string; content: string }[];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="p-3 mb-2">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <StatusIcon className={`h-4 w-4 flex-shrink-0 ${log.status === "success" ? "text-green-500" : log.status === "timeout" ? "text-yellow-500" : "text-red-500"}`} />
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {log.stepName}
              </Badge>
              <span className="text-xs text-muted-foreground truncate">
                {log.provider}/{log.model}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className={statusColor}>{log.status}</Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(log.durationMs)}
              </span>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-left mt-1">
            {formatDate(log.createdAt)}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-3 space-y-3">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Input Messages</h4>
            {inputMessages.map((msg, i) => (
              <div key={i} className="bg-muted/50 rounded p-2 text-xs">
                <Badge variant="secondary" className="mb-1">{msg.role}</Badge>
                <pre className="whitespace-pre-wrap font-mono text-xs mt-1 max-h-[300px] overflow-auto">
                  {msg.content}
                </pre>
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Output</h4>
            <div className="bg-muted/50 rounded p-2">
              {log.outputContent ? (
                <pre className="whitespace-pre-wrap font-mono text-xs max-h-[300px] overflow-auto">
                  {log.outputContent}
                </pre>
              ) : (
                <span className="text-xs text-muted-foreground italic">No output</span>
              )}
            </div>
          </div>
          
          {log.errorMessage && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-500">Error</h4>
              <div className="bg-red-500/10 rounded p-2 text-xs text-red-600">
                {log.errorMessage}
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function LogsDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: logs, isLoading, refetch, isRefetching } = useQuery<LlmLog[]>({
    queryKey: ["/api/logs"],
    enabled: open,
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/logs");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      toast({
        title: "Logs cleared",
        description: "All LLM logs have been deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear logs.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-logs">
          <FileText className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            LLM Call Logs
          </DialogTitle>
          <DialogDescription>
            View all AI model requests and responses, including the inputs sent and outputs received.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center gap-2 py-2">
          <span className="text-sm text-muted-foreground">
            {logs?.length || 0} log entries
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              data-testid="button-refresh-logs"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending || !logs?.length}
              data-testid="button-clear-logs"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="space-y-2">
              {logs.map((log) => (
                <LogEntry key={log.id} log={log} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <FileText className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No logs yet</p>
              <p className="text-xs">LLM calls will appear here as you use the app</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
