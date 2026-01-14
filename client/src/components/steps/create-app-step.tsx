import { useState } from "react";
import { Rocket, Copy, Check, Download, FileText, ExternalLink, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { PromptBundle, DetailedSummary } from "@shared/schema";

interface CreateAppStepProps {
  projectName: string;
  prompts: PromptBundle[] | undefined;
  detailedSummary: DetailedSummary | undefined;
}

function QualityCheck({ detailedSummary, prompts }: { detailedSummary: DetailedSummary | undefined; prompts: PromptBundle[] | undefined }) {
  const checks = [
    {
      label: "Summary agreed",
      passed: detailedSummary?.agreed === true,
    },
    {
      label: "MVP scope defined",
      passed: detailedSummary?.mvpScope?.includes && detailedSummary.mvpScope.includes.length > 0,
    },
    {
      label: "Screens defined",
      passed: detailedSummary?.screens && detailedSummary.screens.length > 0,
    },
    {
      label: "User flow documented",
      passed: detailedSummary?.userFlow && detailedSummary.userFlow.length > 0,
    },
    {
      label: "Build prompts generated",
      passed: prompts && prompts.length > 0,
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const allPassed = passedCount === checks.length;

  return (
    <Card className={allPassed ? "border-green-500/30 bg-green-500/5" : "border-yellow-500/30 bg-yellow-500/5"}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Quality Check</CardTitle>
          <Badge variant={allPassed ? "default" : "secondary"} className={allPassed ? "bg-green-600" : ""}>
            {passedCount}/{checks.length} passed
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {checks.map((check, i) => (
            <li key={i} className="flex items-center gap-2">
              {check.passed ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
              )}
              <span className={check.passed ? "text-foreground" : "text-muted-foreground"}>
                {check.label}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function CreateAppStep({ projectName, prompts, detailedSummary }: CreateAppStepProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const getMasterPrompt = () => {
    if (!prompts) return "";
    return `# ${projectName} - MVP Build Specification

${prompts.map((p) => `## ${p.category}: ${p.title}

${p.content}`).join("\n\n---\n\n")}`;
  };

  const handleLaunchBuild = () => {
    const masterPrompt = getMasterPrompt();
    navigator.clipboard.writeText(masterPrompt);
    setCopied(true);
    setShowModal(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadMarkdown = () => {
    const content = getMasterPrompt();
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}-build-spec.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Build specification saved as Markdown file.",
    });
  };

  const handleDownloadJSON = () => {
    const data = {
      projectName,
      detailedSummary,
      prompts,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}-build-pack.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Build Pack saved as JSON file.",
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Create Your App</h2>
        <p className="text-muted-foreground">
          Launch your MVP build by pasting the generated prompts into Replit Agent.
        </p>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
        <CardContent className="py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Ready to Build</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Your Build Pack is complete and available for download at the bottom of this screen. If you want to go build at this point click the Vibe Code It! button to start building.
          </p>
          <Button
            size="lg"
            onClick={handleLaunchBuild}
            disabled={!prompts || prompts.length === 0}
            className="gap-2 text-lg px-8 py-6"
            data-testid="button-launch-build"
          >
            <Rocket className="w-5 h-5" />
            Vibe Code It!
          </Button>
        </CardContent>
      </Card>

      <QualityCheck detailedSummary={detailedSummary} prompts={prompts} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Export Options</CardTitle>
          <CardDescription>
            Download your Build Pack for backup or to use in other tools.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Button variant="outline" onClick={handleDownloadMarkdown} className="gap-2" data-testid="button-download-md">
            <FileText className="w-4 h-4" />
            Download Markdown
          </Button>
          <Button variant="outline" onClick={handleDownloadJSON} className="gap-2" data-testid="button-download-json">
            <Download className="w-4 h-4" />
            Download JSON
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {copied ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
              Master Prompt Copied!
            </DialogTitle>
            <DialogDescription>
              Follow these steps to start building your MVP.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-semibold">
                1
              </div>
              <div>
                <p className="font-medium">Open Replit Agent</p>
                <p className="text-sm text-muted-foreground">
                  Go to Replit and create a new Repl or open an existing one.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-semibold">
                2
              </div>
              <div>
                <p className="font-medium">Paste the Prompt</p>
                <p className="text-sm text-muted-foreground">
                  Paste the Master Prompt into the Agent chat and let it analyze your requirements.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-semibold">
                3
              </div>
              <div>
                <p className="font-medium">Iterate & Refine</p>
                <p className="text-sm text-muted-foreground">
                  Work with the Agent to implement each feature, reviewing and adjusting as needed.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button asChild>
              <a href="https://replit.com/~" target="_blank" rel="noopener noreferrer" className="gap-2">
                Open Replit
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
