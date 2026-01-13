import { useState, useEffect } from "react";
import { Settings, Key, Globe, Cpu } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { LLMSettings, LLMProvider } from "@shared/schema";
import { defaultLLMSettings } from "@shared/schema";

const STORAGE_KEY = "vibe-refactor-llm-settings";

const providerModels: Record<LLMProvider, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  anthropic: ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-haiku-20240307"],
  custom: [],
};

export function loadLLMSettings(): LLMSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultLLMSettings, ...JSON.parse(stored) };
    }
  } catch {
    // ignore
  }
  return defaultLLMSettings;
}

export function saveLLMSettings(settings: LLMSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<LLMSettings>(defaultLLMSettings);
  const { toast } = useToast();

  useEffect(() => {
    setSettings(loadLLMSettings());
  }, []);

  const handleProviderChange = (provider: LLMProvider) => {
    const models = providerModels[provider];
    setSettings({
      ...settings,
      provider,
      model: models.length > 0 ? models[0] : settings.model,
      useReplitIntegration: provider === "openai" ? settings.useReplitIntegration : false,
    });
  };

  const handleSave = () => {
    saveLLMSettings(settings);
    toast({
      title: "Settings saved",
      description: "Your LLM settings have been updated.",
    });
    setOpen(false);
  };

  const showApiKeyField = !settings.useReplitIntegration || settings.provider !== "openai";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-settings">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            LLM Settings
          </DialogTitle>
          <DialogDescription>
            Configure which AI provider to use for generating summaries and prompts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select
              value={settings.provider}
              onValueChange={(v) => handleProviderChange(v as LLMProvider)}
            >
              <SelectTrigger id="provider" data-testid="select-provider">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="custom">Custom (OpenAI-compatible)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.provider === "openai" && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="use-replit">Use Replit Integration</Label>
                <p className="text-xs text-muted-foreground">
                  Use Replit's built-in OpenAI integration
                </p>
              </div>
              <Switch
                id="use-replit"
                checked={settings.useReplitIntegration}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, useReplitIntegration: checked })
                }
                data-testid="switch-replit-integration"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            {providerModels[settings.provider].length > 0 ? (
              <Select
                value={settings.model}
                onValueChange={(v) => setSettings({ ...settings, model: v })}
              >
                <SelectTrigger id="model" data-testid="select-model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {providerModels[settings.provider].map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="model"
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                placeholder="e.g., gpt-4o or custom model name"
                data-testid="input-model"
              />
            )}
          </div>

          {showApiKeyField && (
            <div className="space-y-2">
              <Label htmlFor="api-key" className="flex items-center gap-2">
                <Key className="h-3 w-3" />
                API Key
              </Label>
              <Input
                id="api-key"
                type="password"
                value={settings.apiKey || ""}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                placeholder="sk-..."
                data-testid="input-api-key"
              />
              <p className="text-xs text-muted-foreground">
                Your API key is stored locally and never sent to our servers.
              </p>
            </div>
          )}

          {settings.provider === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="base-url" className="flex items-center gap-2">
                <Globe className="h-3 w-3" />
                Base URL
              </Label>
              <Input
                id="base-url"
                value={settings.baseUrl || ""}
                onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                placeholder="https://api.example.com/v1"
                data-testid="input-base-url"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-save-settings">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
