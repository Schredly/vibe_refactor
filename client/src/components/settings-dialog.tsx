import { useState, useEffect } from "react";
import { Settings, Key, Globe, Cpu, Plus, Trash2, Code2, Star, ToggleRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { LLMSettings, LLMProvider, VibeCodingSettings, VibeCodingPlatform } from "@shared/schema";
import { defaultLLMSettings, defaultVibeCodingSettings, defaultVibeCodingPlatforms } from "@shared/schema";

const LLM_STORAGE_KEY = "vibe-refactor-llm-settings";
const PLATFORM_STORAGE_KEY = "vibe-refactor-platform-settings";
const FEATURE_STORAGE_KEY = "vibe-refactor-feature-settings";

export interface FeatureSettings {
  showStatementOfWork: boolean;
}

export const defaultFeatureSettings: FeatureSettings = {
  showStatementOfWork: true,
};

export function loadFeatureSettings(): FeatureSettings {
  try {
    const stored = localStorage.getItem(FEATURE_STORAGE_KEY);
    if (stored) {
      return { ...defaultFeatureSettings, ...JSON.parse(stored) };
    }
  } catch {
    // ignore
  }
  return defaultFeatureSettings;
}

export function saveFeatureSettings(settings: FeatureSettings): void {
  localStorage.setItem(FEATURE_STORAGE_KEY, JSON.stringify(settings));
  // Dispatch custom event to notify listeners of the change
  window.dispatchEvent(new CustomEvent('featureSettingsChanged', { detail: settings }));
}

export function isSOWEnabled(): boolean {
  return loadFeatureSettings().showStatementOfWork;
}

const providerModels: Record<LLMProvider, string[]> = {
  openai: ["gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano", "gpt-4o", "gpt-4o-mini", "o3", "o4-mini"],
  anthropic: ["claude-sonnet-4-20250514", "claude-opus-4-20250514", "claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"],
  gemini: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"],
  groq: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"],
  custom: [],
};

export function loadLLMSettings(): LLMSettings {
  try {
    const stored = localStorage.getItem(LLM_STORAGE_KEY);
    if (stored) {
      const merged = { ...defaultLLMSettings, ...JSON.parse(stored) } as LLMSettings;
      const validModels = providerModels[merged.provider] || [];
      if (merged.provider !== "custom" && !validModels.includes(merged.model)) {
        merged.model = validModels[0] || defaultLLMSettings.model;
        localStorage.setItem(LLM_STORAGE_KEY, JSON.stringify(merged));
      }
      return merged;
    }
  } catch {
    // ignore
  }
  return defaultLLMSettings;
}

export function saveLLMSettings(settings: LLMSettings): void {
  localStorage.setItem(LLM_STORAGE_KEY, JSON.stringify(settings));
}

export function loadVibeCodingSettings(): VibeCodingSettings {
  try {
    const stored = localStorage.getItem(PLATFORM_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const mergedPlatforms = [...defaultVibeCodingPlatforms];
      if (parsed.platforms) {
        parsed.platforms.forEach((p: VibeCodingPlatform) => {
          if (!p.isBuiltIn && !mergedPlatforms.find((mp) => mp.id === p.id)) {
            mergedPlatforms.push(p);
          }
        });
      }
      return {
        platforms: mergedPlatforms,
        selectedPlatformId: parsed.selectedPlatformId || "replit",
      };
    }
  } catch {
    // ignore
  }
  return defaultVibeCodingSettings;
}

export function saveVibeCodingSettings(settings: VibeCodingSettings): void {
  localStorage.setItem(PLATFORM_STORAGE_KEY, JSON.stringify(settings));
}

export function getSelectedPlatform(): VibeCodingPlatform {
  const settings = loadVibeCodingSettings();
  return settings.platforms.find((p) => p.id === settings.selectedPlatformId) || settings.platforms[0];
}

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [llmSettings, setLlmSettings] = useState<LLMSettings>(defaultLLMSettings);
  const [platformSettings, setPlatformSettings] = useState<VibeCodingSettings>(defaultVibeCodingSettings);
  const [featureSettings, setFeatureSettings] = useState<FeatureSettings>(defaultFeatureSettings);
  const [newPlatformName, setNewPlatformName] = useState("");
  const [newPlatformDescription, setNewPlatformDescription] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setLlmSettings(loadLLMSettings());
    setPlatformSettings(loadVibeCodingSettings());
    setFeatureSettings(loadFeatureSettings());
  }, []);

  const handleProviderChange = (provider: LLMProvider) => {
    const models = providerModels[provider];
    setLlmSettings({
      ...llmSettings,
      provider,
      model: models.length > 0 ? models[0] : llmSettings.model,
    });
  };

  const handleAddPlatform = () => {
    if (!newPlatformName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a platform name.",
        variant: "destructive",
      });
      return;
    }

    const newPlatform: VibeCodingPlatform = {
      id: `custom-${Date.now()}`,
      name: newPlatformName.trim(),
      description: newPlatformDescription.trim() || undefined,
      isDefault: false,
      isBuiltIn: false,
    };

    setPlatformSettings({
      ...platformSettings,
      platforms: [...platformSettings.platforms, newPlatform],
    });
    setNewPlatformName("");
    setNewPlatformDescription("");

    toast({
      title: "Platform added",
      description: `${newPlatform.name} has been added to your platforms.`,
    });
  };

  const handleDeletePlatform = (platformId: string) => {
    const platform = platformSettings.platforms.find((p) => p.id === platformId);
    if (platform?.isBuiltIn) {
      toast({
        title: "Cannot delete",
        description: "Built-in platforms cannot be deleted.",
        variant: "destructive",
      });
      return;
    }

    const newPlatforms = platformSettings.platforms.filter((p) => p.id !== platformId);
    const newSelectedId =
      platformSettings.selectedPlatformId === platformId ? "replit" : platformSettings.selectedPlatformId;

    setPlatformSettings({
      platforms: newPlatforms,
      selectedPlatformId: newSelectedId,
    });

    toast({
      title: "Platform removed",
      description: `${platform?.name} has been removed.`,
    });
  };

  const handleSelectPlatform = (platformId: string) => {
    setPlatformSettings({
      ...platformSettings,
      selectedPlatformId: platformId,
    });
  };

  const handleSave = () => {
    saveLLMSettings(llmSettings);
    saveVibeCodingSettings(platformSettings);
    saveFeatureSettings(featureSettings);
    toast({
      title: "Settings saved",
      description: "Your settings have been updated.",
    });
    setOpen(false);
  };

  // Always show API key field - users must provide their own key
  const showApiKeyField = true;
  const selectedPlatform = platformSettings.platforms.find((p) => p.id === platformSettings.selectedPlatformId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-settings">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>Configure AI providers and target vibe coding platforms.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="llm" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="llm" className="flex items-center gap-2" data-testid="tab-llm">
              <Cpu className="h-4 w-4" />
              AI Provider
            </TabsTrigger>
            <TabsTrigger value="platforms" className="flex items-center gap-2" data-testid="tab-platforms">
              <Code2 className="h-4 w-4" />
              Platforms
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2" data-testid="tab-features">
              <ToggleRight className="h-4 w-4" />
              Features
            </TabsTrigger>
          </TabsList>

          <TabsContent value="llm" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={llmSettings.provider}
                onValueChange={(v) => handleProviderChange(v as LLMProvider)}
              >
                <SelectTrigger id="provider" data-testid="select-provider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                  <SelectItem value="custom">Custom (OpenAI-compatible)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              {providerModels[llmSettings.provider].length > 0 ? (
                <Select
                  value={llmSettings.model}
                  onValueChange={(v) => setLlmSettings({ ...llmSettings, model: v })}
                >
                  <SelectTrigger id="model" data-testid="select-model">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {providerModels[llmSettings.provider].map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="model"
                  value={llmSettings.model}
                  onChange={(e) => setLlmSettings({ ...llmSettings, model: e.target.value })}
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
                  value={llmSettings.apiKey || ""}
                  onChange={(e) => setLlmSettings({ ...llmSettings, apiKey: e.target.value })}
                  placeholder="sk-..."
                  data-testid="input-api-key"
                />
                <p className="text-xs text-muted-foreground">
                  Your API key is stored locally and never sent to our servers.
                </p>
              </div>
            )}

            {llmSettings.provider === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="base-url" className="flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  Base URL
                </Label>
                <Input
                  id="base-url"
                  value={llmSettings.baseUrl || ""}
                  onChange={(e) => setLlmSettings({ ...llmSettings, baseUrl: e.target.value })}
                  placeholder="https://api.example.com/v1"
                  data-testid="input-base-url"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="platforms" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Target Platform</Label>
              <p className="text-xs text-muted-foreground">
                Select the vibe coding platform you're generating prompts for.
              </p>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {platformSettings.platforms.map((platform) => (
                <Card
                  key={platform.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    platformSettings.selectedPlatformId === platform.id
                      ? "border-primary bg-primary/5"
                      : "hover-elevate"
                  }`}
                  onClick={() => handleSelectPlatform(platform.id)}
                  data-testid={`platform-card-${platform.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full border-2 ${
                          platformSettings.selectedPlatformId === platform.id
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{platform.name}</span>
                          {platform.isBuiltIn && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              Built-in
                            </Badge>
                          )}
                          {platform.isDefault && (
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        {platform.description && (
                          <p className="text-xs text-muted-foreground">{platform.description}</p>
                        )}
                      </div>
                    </div>
                    {!platform.isBuiltIn && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlatform(platform.id);
                        }}
                        data-testid={`button-delete-platform-${platform.id}`}
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <Label className="text-sm font-medium">Add Custom Platform</Label>
              <div className="space-y-2">
                <Input
                  value={newPlatformName}
                  onChange={(e) => setNewPlatformName(e.target.value)}
                  placeholder="Platform name (e.g., Claude Desktop)"
                  data-testid="input-new-platform-name"
                />
                <Input
                  value={newPlatformDescription}
                  onChange={(e) => setNewPlatformDescription(e.target.value)}
                  placeholder="Description (optional)"
                  data-testid="input-new-platform-description"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleAddPlatform}
                  data-testid="button-add-platform"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Platform
                </Button>
              </div>
            </div>

            {selectedPlatform && (
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  Prompts will be optimized for <span className="font-medium">{selectedPlatform.name}</span>
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="features" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="sow-toggle" className="font-medium">Statement of Work</Label>
                  <p className="text-sm text-muted-foreground">
                    Generate scope documents, pricing estimates, and legal terms
                  </p>
                </div>
                <Switch
                  id="sow-toggle"
                  checked={featureSettings.showStatementOfWork}
                  onCheckedChange={(checked) =>
                    setFeatureSettings({ ...featureSettings, showStatementOfWork: checked })
                  }
                  data-testid="switch-sow-feature"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                When disabled, the wizard will skip the Statement of Work step and go directly from Build Pack to Create App.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
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
