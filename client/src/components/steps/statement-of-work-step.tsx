import { useState, useCallback } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { loadLLMSettings } from "@/components/settings-dialog";
import { 
  FileText, 
  Sparkles, 
  ChevronRight, 
  ChevronDown,
  Loader2, 
  Download, 
  Plus, 
  Check, 
  Clock, 
  DollarSign,
  Gauge,
  Shield,
  Settings,
  Layers,
  FileCheck,
  Briefcase
} from "lucide-react";
import type { 
  DetailedSummary, 
  StatementOfWork, 
  MVPSOW, 
  ExtensionSOW, 
  MSATerms,
  LegalTerms,
  ComplexityTier,
  extensionTemplates,
  defaultPricingTiers,
  SOWLineItem
} from "@shared/schema";
import { defaultLegalTerms } from "@shared/schema";

interface StatementOfWorkStepProps {
  projectName: string;
  detailedSummary?: DetailedSummary;
  statementOfWork?: StatementOfWork;
  onSaveSOW: (sow: StatementOfWork) => void;
  onContinue: () => void;
}

const COMPLEXITY_COLORS: Record<ComplexityTier, string> = {
  simple: "bg-green-500/10 text-green-600 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  complex: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  enterprise: "bg-red-500/10 text-red-600 border-red-500/20",
};

const COMPLEXITY_LABELS: Record<ComplexityTier, string> = {
  simple: "Simple MVP",
  medium: "Medium MVP",
  complex: "Complex MVP",
  enterprise: "Enterprise MVP",
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function StatementOfWorkStep({
  projectName,
  detailedSummary,
  statementOfWork,
  onSaveSOW,
  onContinue,
}: StatementOfWorkStepProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("mvp");
  const [expandedExtensions, setExpandedExtensions] = useState<Set<string>>(new Set());
  const [hourlyRate, setHourlyRate] = useState<number>(statementOfWork?.hourlyRate || 150);

  const mvpSOW = statementOfWork?.mvpSOW;
  const extensions = statementOfWork?.extensions || [];
  const msaTerms = statementOfWork?.msaTerms;
  const legalTerms = statementOfWork?.legalTerms || defaultLegalTerms;

  const handleGenerateSOW = useCallback(async () => {
    if (!detailedSummary) {
      toast({
        title: "Summary Required",
        description: "Please complete the Review & Summarize step first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const llmSettings = loadLLMSettings();
      
      const response = await apiRequest("POST", "/api/generateSOW", {
        projectName,
        detailedSummary,
        llmSettings,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate SOW");
      }

      const generatedSOW: MVPSOW = await response.json();
      
      const now = new Date().toISOString();
      const fullSOW: StatementOfWork = {
        projectId: generateId(),
        mvpSOW: generatedSOW,
        extensions: [],
        pricingTiers: [],
        hourlyRate,
        legalTerms: defaultLegalTerms,
        createdAt: now,
        updatedAt: now,
        lastGeneratedAt: now,
      };

      onSaveSOW(fullSOW);
      
      toast({
        title: "Statement of Work Generated",
        description: "Your MVP SOW has been created based on the project summary.",
      });
    } catch (error) {
      console.error("Failed to generate SOW:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate Statement of Work",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [projectName, detailedSummary, hourlyRate, onSaveSOW, toast]);

  const toggleExtension = useCallback((extensionId: string) => {
    setExpandedExtensions((prev) => {
      const next = new Set(prev);
      if (next.has(extensionId)) {
        next.delete(extensionId);
      } else {
        next.add(extensionId);
      }
      return next;
    });
  }, []);

  const addExtension = useCallback((template: typeof extensionTemplates[0]) => {
    if (!statementOfWork) return;

    const now = new Date().toISOString();
    const newExtension: ExtensionSOW = {
      id: generateId(),
      ...template,
      status: "pending",
      createdAt: now,
    };

    const updatedSOW: StatementOfWork = {
      ...statementOfWork,
      extensions: [...(statementOfWork.extensions || []), newExtension],
      updatedAt: now,
    };

    onSaveSOW(updatedSOW);
    toast({
      title: "Extension Added",
      description: `${template.title} has been added to your SOW.`,
    });
  }, [statementOfWork, onSaveSOW, toast]);

  const toggleMSA = useCallback((enabled: boolean) => {
    if (!statementOfWork) return;

    const now = new Date().toISOString();
    const updatedSOW: StatementOfWork = {
      ...statementOfWork,
      msaTerms: enabled ? {
        enabled: true,
        retainer: {
          monthlyHours: 10,
          hourlyRate,
          rolloverHours: false,
        },
        sla: {
          criticalResponseHours: 4,
          highResponseHours: 8,
          normalResponseHours: 24,
        },
        changeProcess: {
          requiresWrittenApproval: true,
          minimumHoursForApproval: 4,
        },
        termMonths: 12,
        autoRenew: true,
      } : undefined,
      updatedAt: now,
    };

    onSaveSOW(updatedSOW);
  }, [statementOfWork, hourlyRate, onSaveSOW]);

  const toggleLegalTerms = useCallback((enabled: boolean) => {
    if (!statementOfWork) return;

    const now = new Date().toISOString();
    const updatedSOW: StatementOfWork = {
      ...statementOfWork,
      legalTerms: enabled ? defaultLegalTerms : { ...defaultLegalTerms, enabled: false },
      updatedAt: now,
    };

    onSaveSOW(updatedSOW);
  }, [statementOfWork, onSaveSOW]);

  const updateLegalTerms = useCallback((updates: Partial<LegalTerms>) => {
    if (!statementOfWork) return;

    const now = new Date().toISOString();
    const updatedSOW: StatementOfWork = {
      ...statementOfWork,
      legalTerms: {
        ...(statementOfWork.legalTerms || defaultLegalTerms),
        ...updates,
      },
      updatedAt: now,
    };

    onSaveSOW(updatedSOW);
  }, [statementOfWork, onSaveSOW]);

  const updateHourlyRate = useCallback((rate: number) => {
    setHourlyRate(rate);
    if (statementOfWork) {
      const now = new Date().toISOString();
      const updatedSOW: StatementOfWork = {
        ...statementOfWork,
        hourlyRate: rate,
        updatedAt: now,
      };
      onSaveSOW(updatedSOW);
    }
  }, [statementOfWork, onSaveSOW]);

  const calculateTotal = useCallback((hours: { min: number; max: number }, rate: number) => {
    return {
      min: hours.min * rate,
      max: hours.max * rate,
    };
  }, []);

  const exportToPDF = useCallback(async () => {
    toast({
      title: "Export Started",
      description: "Generating PDF...",
    });

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let y = margin;

      const addText = (text: string, size: number = 10, style: "normal" | "bold" = "normal", color: [number, number, number] = [0, 0, 0]) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", style);
        doc.setTextColor(color[0], color[1], color[2]);
        const lines = doc.splitTextToSize(text, contentWidth);
        const lineHeight = size * 0.4;
        
        lines.forEach((line: string) => {
          if (y + lineHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += lineHeight;
        });
      };

      const addSpacing = (space: number = 5) => {
        y += space;
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      const addHorizontalLine = () => {
        if (y + 5 > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
      };

      const addBullet = (text: string, indent: number = 0) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        const bulletX = margin + indent;
        const textX = bulletX + 5;
        const lines = doc.splitTextToSize(text, contentWidth - indent - 5);
        
        lines.forEach((line: string, i: number) => {
          if (y + 4 > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          if (i === 0) {
            doc.text("\u2022", bulletX, y);
          }
          doc.text(line, textX, y);
          y += 4;
        });
      };

      // Header
      doc.setFillColor(124, 58, 237);
      doc.rect(0, 0, pageWidth, 40, "F");
      
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Statement of Work", margin, 25);
      
      y = 50;
      
      // Project name and date
      addText(projectName, 18, "bold", [60, 60, 60]);
      addSpacing(3);
      addText(`Generated: ${new Date().toLocaleDateString()}`, 10, "normal", [120, 120, 120]);
      addSpacing(10);
      addHorizontalLine();

      if (mvpSOW) {
        // Complexity Score Section
        addText("PROJECT COMPLEXITY", 12, "bold", [124, 58, 237]);
        addSpacing(5);
        
        const tierLabel = COMPLEXITY_LABELS[mvpSOW.complexityScore.tier];
        addText(`Tier: ${tierLabel}  |  Score: ${mvpSOW.complexityScore.score}/100`, 11, "bold");
        addSpacing(3);
        addText(mvpSOW.complexityScore.reasoning, 10, "normal", [80, 80, 80]);
        addSpacing(10);
        
        // Scope Summary
        addText("MVP SCOPE", 12, "bold", [124, 58, 237]);
        addSpacing(5);
        addText(mvpSOW.scopeSummary.definition, 11, "bold");
        addSpacing(8);

        addText("Included:", 10, "bold");
        addSpacing(2);
        mvpSOW.scopeSummary.includes.forEach((item) => addBullet(item));
        addSpacing(5);

        addText("Excluded:", 10, "bold");
        addSpacing(2);
        mvpSOW.scopeSummary.excludes.forEach((item) => addBullet(item));
        addSpacing(10);

        // Deliverables
        addText("DELIVERABLES", 12, "bold", [124, 58, 237]);
        addSpacing(5);
        
        mvpSOW.deliverables.forEach((d, i) => {
          addText(`${i + 1}. ${d.name}`, 11, "bold");
          addSpacing(2);
          addText(d.description, 10, "normal", [60, 60, 60]);
          addSpacing(2);
          addText(`Acceptance: ${d.acceptance}`, 9, "normal", [100, 100, 100]);
          addSpacing(6);
        });

        addSpacing(5);

        // Pricing Box
        doc.setFillColor(249, 250, 251);
        const boxY = y;
        const boxHeight = 35;
        if (boxY + boxHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.roundedRect(margin, y, contentWidth, boxHeight, 3, 3, "F");
        doc.setDrawColor(124, 58, 237);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, y, contentWidth, boxHeight, 3, 3, "S");
        
        y += 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(124, 58, 237);
        doc.text("ESTIMATED INVESTMENT", margin + 10, y);
        
        y += 8;
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Hours: ${mvpSOW.totalEstimatedHours.min} - ${mvpSOW.totalEstimatedHours.max}`, margin + 10, y);
        
        if (hourlyRate) {
          const total = calculateTotal(mvpSOW.totalEstimatedHours, hourlyRate);
          y += 6;
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text(`$${total.min.toLocaleString()} - $${total.max.toLocaleString()}`, margin + 10, y);
        }
        
        y += 15;
        addSpacing(10);

        // Assumptions
        addText("ASSUMPTIONS", 12, "bold", [124, 58, 237]);
        addSpacing(5);
        mvpSOW.assumptions.forEach((a) => addBullet(a));
        addSpacing(8);

        // Exclusions
        addText("EXCLUSIONS", 12, "bold", [124, 58, 237]);
        addSpacing(5);
        mvpSOW.exclusions.forEach((e) => addBullet(e));
      }

      // Extensions
      if (extensions.length > 0) {
        addSpacing(10);
        addHorizontalLine();
        addText("EXTENSION SOWS", 14, "bold", [124, 58, 237]);
        addSpacing(8);

        extensions.forEach((ext) => {
          addText(ext.title, 11, "bold");
          addSpacing(2);
          addText(ext.description, 10, "normal", [60, 60, 60]);
          addSpacing(3);
          let priceText = `Hours: ${ext.estimatedHours.min} - ${ext.estimatedHours.max}`;
          if (hourlyRate) {
            const total = calculateTotal(ext.estimatedHours, hourlyRate);
            priceText += `  |  $${total.min.toLocaleString()} - $${total.max.toLocaleString()}`;
          }
          addText(priceText, 10, "bold", [100, 100, 100]);
          addSpacing(8);
        });
      }

      // MSA Terms
      if (msaTerms?.enabled) {
        addSpacing(10);
        addHorizontalLine();
        addText("MASTER SERVICE AGREEMENT", 14, "bold", [124, 58, 237]);
        addSpacing(8);

        addBullet(`Term: ${msaTerms.termMonths} months`);
        addBullet(`Auto-Renew: ${msaTerms.autoRenew ? "Yes" : "No"}`);
        
        if (msaTerms.retainer) {
          addSpacing(5);
          addText("Retainer:", 10, "bold");
          addBullet(`Monthly Hours: ${msaTerms.retainer.monthlyHours}`);
          addBullet(`Hourly Rate: $${msaTerms.retainer.hourlyRate}`);
          addBullet(`Rollover: ${msaTerms.retainer.rolloverHours ? "Yes" : "No"}`);
        }

        if (msaTerms.sla) {
          addSpacing(5);
          addText("SLA Response Times:", 10, "bold");
          addBullet(`Critical: ${msaTerms.sla.criticalResponseHours} hours`);
          addBullet(`High: ${msaTerms.sla.highResponseHours} hours`);
          addBullet(`Normal: ${msaTerms.sla.normalResponseHours} hours`);
        }
      }

      // Legal Terms Section
      if (legalTerms?.enabled) {
        addSpacing(10);
        addHorizontalLine();
        addText("TERMS AND CONDITIONS", 14, "bold", [124, 58, 237]);
        addSpacing(8);

        // Payment Terms
        addText("1. PAYMENT TERMS", 11, "bold");
        addSpacing(3);
        addBullet(`A deposit of ${legalTerms.paymentTerms.depositPercent}% is required before work commences.`);
        addBullet(`Remaining balance is due within ${legalTerms.paymentTerms.netDays} days of invoice (Net ${legalTerms.paymentTerms.netDays}).`);
        addBullet(`Late payments are subject to a ${legalTerms.paymentTerms.lateFeePercent}% monthly interest charge.`);
        addBullet(`All payments shall be made in ${legalTerms.paymentTerms.currency}.`);
        addSpacing(6);

        // Intellectual Property
        addText("2. INTELLECTUAL PROPERTY", 11, "bold");
        addSpacing(3);
        const ipOwnershipText = {
          client: "All intellectual property rights in the deliverables shall transfer to and become the sole property of the Client",
          developer: "Developer retains all intellectual property rights in the deliverables, granting Client a perpetual license to use",
          joint: "Intellectual property rights shall be jointly owned by both parties",
          license: "Client receives a perpetual, non-exclusive license to use the deliverables",
        };
        addBullet(ipOwnershipText[legalTerms.ipOwnership] + ".");
        if (legalTerms.ipTransferUponPayment) {
          addBullet("Transfer of intellectual property rights is contingent upon receipt of full payment.");
        }
        addBullet("Developer retains the right to use generic, non-proprietary code and methodologies developed during the project.");
        addSpacing(6);

        // Confidentiality
        if (legalTerms.confidentiality.enabled) {
          addText("3. CONFIDENTIALITY", 11, "bold");
          addSpacing(3);
          addBullet("Both parties agree to maintain the confidentiality of all proprietary information exchanged during this engagement.");
          addBullet(`This obligation shall remain in effect for ${legalTerms.confidentiality.durationYears} years following the completion or termination of this agreement.`);
          addBullet("Confidential information does not include information that is publicly available or independently developed.");
          addSpacing(6);
        }

        // Limitation of Liability
        addText("4. LIMITATION OF LIABILITY", 11, "bold");
        addSpacing(3);
        const liabilityText = {
          contract_value: "the total fees paid under this Statement of Work",
          "12_months_fees": "the total fees paid in the twelve (12) months preceding the claim",
          unlimited: "no contractual limitation (subject to applicable law)",
        };
        addBullet(`Developer's total liability shall not exceed ${liabilityText[legalTerms.liabilityLimit]}.`);
        addBullet("In no event shall either party be liable for indirect, incidental, consequential, special, or punitive damages.");
        addBullet("This limitation applies regardless of the form of action, whether in contract, tort, or otherwise.");
        addSpacing(6);

        // Warranties
        addText("5. WARRANTIES", 11, "bold");
        addSpacing(3);
        addBullet(`Developer warrants that deliverables will be free from ${legalTerms.warranties.warrantyScope} for a period of ${legalTerms.warranties.defectPeriodDays} days from delivery.`);
        addBullet("Developer warrants that it has the right to provide the services and deliverables without infringing third-party rights.");
        addBullet("EXCEPT AS EXPRESSLY SET FORTH HEREIN, DEVELOPER DISCLAIMS ALL OTHER WARRANTIES, EXPRESS OR IMPLIED.");
        addSpacing(6);

        // Termination
        addText("6. TERMINATION", 11, "bold");
        addSpacing(3);
        if (legalTerms.termination.forCause) {
          addBullet("Either party may terminate this agreement for cause upon material breach by the other party that remains uncured for 14 days after written notice.");
        }
        if (legalTerms.termination.forConvenience) {
          addBullet(`Either party may terminate this agreement for convenience with ${legalTerms.termination.noticeDays} days written notice.`);
          if (legalTerms.termination.killFeePercent > 0) {
            addBullet(`Upon termination for convenience by Client, a termination fee of ${legalTerms.termination.killFeePercent}% of remaining project value shall be due.`);
          }
        }
        addBullet("Upon termination, Client shall pay for all work completed through the termination date.");
        addSpacing(6);

        // Dispute Resolution
        addText("7. DISPUTE RESOLUTION", 11, "bold");
        addSpacing(3);
        const disputeText = {
          mediation: "The parties agree to attempt resolution through good-faith mediation before pursuing other remedies.",
          arbitration: "Any disputes shall be resolved through binding arbitration in accordance with applicable rules.",
          litigation: "Any disputes shall be resolved through the courts of competent jurisdiction.",
        };
        addBullet(disputeText[legalTerms.disputeResolution]);
        addBullet(`This agreement shall be governed by the laws of ${legalTerms.governingLaw}.`);
        addSpacing(6);

        // Additional Clauses
        addText("8. GENERAL PROVISIONS", 11, "bold");
        addSpacing(3);
        if (legalTerms.independentContractor) {
          addBullet("Developer is an independent contractor and nothing herein shall be construed as creating an employment or agency relationship.");
        }
        if (legalTerms.forceMaileure) {
          addBullet("Neither party shall be liable for delays or failure to perform due to circumstances beyond reasonable control (force majeure).");
        }
        addBullet("This Statement of Work constitutes the entire agreement between the parties with respect to the subject matter hereof.");
        addBullet("Any amendments must be made in writing and signed by both parties.");
        addBullet("If any provision is found unenforceable, the remaining provisions shall continue in full force and effect.");
        addSpacing(10);

        // Signature Block
        addHorizontalLine();
        addSpacing(5);
        addText("ACCEPTANCE", 12, "bold", [124, 58, 237]);
        addSpacing(8);
        addText("By signing below, both parties agree to the terms and conditions set forth in this Statement of Work.", 10, "normal", [80, 80, 80]);
        addSpacing(15);

        // Client signature
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.3);
        doc.line(margin, y, margin + 80, y);
        y += 5;
        addText("Client Signature", 9, "normal", [120, 120, 120]);
        addSpacing(3);
        doc.line(margin, y, margin + 60, y);
        y += 5;
        addText("Date", 9, "normal", [120, 120, 120]);
        addSpacing(10);

        // Developer signature
        doc.line(margin, y, margin + 80, y);
        y += 5;
        addText("Developer Signature", 9, "normal", [120, 120, 120]);
        addSpacing(3);
        doc.line(margin, y, margin + 60, y);
        y += 5;
        addText("Date", 9, "normal", [120, 120, 120]);
      }

      // Footer on last page
      const footerY = pageHeight - 15;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150, 150, 150);
      doc.text("Generated by Vibe Refactor MVP Wizard", margin, footerY);
      doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin - 20, footerY);

      // Save the PDF
      doc.save(`${projectName.replace(/\s+/g, "_")}_SOW.pdf`);

      toast({
        title: "Export Complete",
        description: "Your Statement of Work PDF has been downloaded.",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  }, [projectName, mvpSOW, extensions, msaTerms, legalTerms, hourlyRate, calculateTotal, toast]);

  const generateExportContent = useCallback(() => {
    let content = `# Statement of Work\n## ${projectName}\n\nGenerated: ${new Date().toLocaleDateString()}\n\n`;

    if (mvpSOW) {
      content += `---\n\n## MVP Scope\n\n`;
      content += `**Definition:** ${mvpSOW.scopeSummary.definition}\n\n`;
      
      content += `### Complexity Assessment\n`;
      content += `- **Tier:** ${COMPLEXITY_LABELS[mvpSOW.complexityScore.tier]}\n`;
      content += `- **Score:** ${mvpSOW.complexityScore.score}/100\n`;
      content += `- **Analysis:** ${mvpSOW.complexityScore.reasoning}\n\n`;

      content += `### Included in Scope\n`;
      mvpSOW.scopeSummary.includes.forEach((item) => {
        content += `- ${item}\n`;
      });

      content += `\n### Excluded from Scope\n`;
      mvpSOW.scopeSummary.excludes.forEach((item) => {
        content += `- ${item}\n`;
      });

      content += `\n### Deliverables\n`;
      mvpSOW.deliverables.forEach((d, i) => {
        content += `\n#### ${i + 1}. ${d.name}\n`;
        content += `${d.description}\n\n`;
        content += `**Acceptance Criteria:** ${d.acceptance}\n`;
      });

      content += `\n### Estimated Effort\n`;
      content += `- **Hours:** ${mvpSOW.totalEstimatedHours.min} - ${mvpSOW.totalEstimatedHours.max}\n`;
      if (hourlyRate) {
        const total = calculateTotal(mvpSOW.totalEstimatedHours, hourlyRate);
        content += `- **Investment:** $${total.min.toLocaleString()} - $${total.max.toLocaleString()}\n`;
      }

      content += `\n### Assumptions\n`;
      mvpSOW.assumptions.forEach((a) => {
        content += `- ${a}\n`;
      });

      content += `\n### Exclusions\n`;
      mvpSOW.exclusions.forEach((e) => {
        content += `- ${e}\n`;
      });
    }

    if (extensions.length > 0) {
      content += `\n---\n\n## Extension SOWs\n\n`;
      extensions.forEach((ext) => {
        content += `### ${ext.title}\n`;
        content += `${ext.description}\n\n`;
        content += `**Estimated Hours:** ${ext.estimatedHours.min} - ${ext.estimatedHours.max}\n`;
        if (hourlyRate) {
          const total = calculateTotal(ext.estimatedHours, hourlyRate);
          content += `**Investment:** $${total.min.toLocaleString()} - $${total.max.toLocaleString()}\n`;
        }
        content += `\n`;
      });
    }

    if (msaTerms?.enabled) {
      content += `\n---\n\n## Master Service Agreement\n\n`;
      content += `- **Term:** ${msaTerms.termMonths} months\n`;
      content += `- **Auto-Renew:** ${msaTerms.autoRenew ? "Yes" : "No"}\n`;
      if (msaTerms.retainer) {
        content += `- **Monthly Hours:** ${msaTerms.retainer.monthlyHours}\n`;
        content += `- **Rollover:** ${msaTerms.retainer.rolloverHours ? "Yes" : "No"}\n`;
      }
      if (msaTerms.sla) {
        content += `\n### SLA Response Times\n`;
        content += `- Critical: ${msaTerms.sla.criticalResponseHours} hours\n`;
        content += `- High: ${msaTerms.sla.highResponseHours} hours\n`;
        content += `- Normal: ${msaTerms.sla.normalResponseHours} hours\n`;
      }
    }

    return content;
  }, [projectName, mvpSOW, extensions, msaTerms, hourlyRate, calculateTotal]);

  if (!detailedSummary) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Statement of Work</CardTitle>
            <CardDescription>
              Complete the Review & Summarize step to generate your Statement of Work
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" disabled>
              <FileText className="w-4 h-4 mr-2" />
              Summary Required
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-sow-title">Statement of Work</h1>
          <p className="text-muted-foreground">
            Generate and customize your project scope and pricing
          </p>
        </div>
        <div className="flex items-center gap-2">
          {mvpSOW && (
            <Button variant="outline" onClick={exportToPDF} data-testid="button-export-sow">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
          <Button onClick={onContinue} data-testid="button-continue-to-create">
            Continue
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Pricing Configuration</CardTitle>
                <CardDescription>Set your hourly rate for estimates</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="hourly-rate">Hourly Rate ($)</Label>
            <Input
              id="hourly-rate"
              type="number"
              value={hourlyRate}
              onChange={(e) => updateHourlyRate(Number(e.target.value))}
              className="w-32"
              data-testid="input-hourly-rate"
            />
          </div>
        </CardContent>
      </Card>

      {!mvpSOW ? (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Generate MVP Statement of Work</CardTitle>
            <CardDescription>
              AI will analyze your project summary to create a comprehensive SOW with complexity scoring, deliverables, and estimates
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              size="lg"
              onClick={handleGenerateSOW}
              disabled={isGenerating}
              data-testid="button-generate-sow"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Complexity...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate SOW
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="mvp" data-testid="tab-mvp-sow">
              <FileCheck className="w-4 h-4 mr-2" />
              MVP SOW
            </TabsTrigger>
            <TabsTrigger value="extensions" data-testid="tab-extensions">
              <Layers className="w-4 h-4 mr-2" />
              Extensions ({extensions.length})
            </TabsTrigger>
            <TabsTrigger value="msa" data-testid="tab-msa">
              <Briefcase className="w-4 h-4 mr-2" />
              MSA
            </TabsTrigger>
            <TabsTrigger value="legal" data-testid="tab-legal">
              <Shield className="w-4 h-4 mr-2" />
              Legal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mvp" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Gauge className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Complexity Assessment</CardTitle>
                      <CardDescription>AI-analyzed project complexity</CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={COMPLEXITY_COLORS[mvpSOW.complexityScore.tier]}
                    data-testid="badge-complexity-tier"
                  >
                    {COMPLEXITY_LABELS[mvpSOW.complexityScore.tier]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-muted rounded-full h-3">
                    <div
                      className="bg-primary rounded-full h-3 transition-all"
                      style={{ width: `${mvpSOW.complexityScore.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium" data-testid="text-complexity-score">
                    {mvpSOW.complexityScore.score}/100
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{mvpSOW.complexityScore.reasoning}</p>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{mvpSOW.complexityScore.breakdown.screens}</div>
                    <div className="text-xs text-muted-foreground">Screens</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{mvpSOW.complexityScore.breakdown.dataComplexity}/10</div>
                    <div className="text-xs text-muted-foreground">Data</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{mvpSOW.complexityScore.breakdown.aiComplexity}/10</div>
                    <div className="text-xs text-muted-foreground">AI</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{mvpSOW.complexityScore.breakdown.integrationComplexity}/10</div>
                    <div className="text-xs text-muted-foreground">Integrations</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{mvpSOW.complexityScore.breakdown.complianceComplexity}/10</div>
                    <div className="text-xs text-muted-foreground">Compliance</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Scope</CardTitle>
                <CardDescription>{mvpSOW.scopeSummary.definition}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Included
                  </h4>
                  <ul className="space-y-1">
                    {mvpSOW.scopeSummary.includes.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    Excluded
                  </h4>
                  <ul className="space-y-1">
                    {mvpSOW.scopeSummary.excludes.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-muted-foreground mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deliverables</CardTitle>
                <CardDescription>What will be delivered as part of this MVP</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {mvpSOW.deliverables.map((deliverable, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-1">{deliverable.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{deliverable.description}</p>
                        <div className="text-xs bg-muted/50 p-2 rounded">
                          <span className="font-medium">Acceptance:</span> {deliverable.acceptance}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Estimated Investment
                    </CardTitle>
                    <CardDescription>Based on complexity analysis and hourly rate</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold">
                      {mvpSOW.totalEstimatedHours.min} - {mvpSOW.totalEstimatedHours.max}
                    </div>
                    <div className="text-sm text-muted-foreground">Hours</div>
                  </div>
                  <div className="text-center p-6 bg-primary/10 rounded-lg">
                    <div className="text-3xl font-bold text-primary" data-testid="text-total-price">
                      ${calculateTotal(mvpSOW.totalEstimatedHours, hourlyRate).min.toLocaleString()} - 
                      ${calculateTotal(mvpSOW.totalEstimatedHours, hourlyRate).max.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Investment</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="extensions" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Post-MVP Extensions</CardTitle>
                <CardDescription>
                  Add scope for environment setup, integrations, feature refinement, and more
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { type: "environment_setup", title: "Environment Setup", icon: Settings },
                    { type: "domain_dns", title: "Domain & DNS", icon: Shield },
                    { type: "email_service", title: "Email Service", icon: FileText },
                    { type: "integration", title: "Integration", icon: Layers },
                    { type: "feature_refinement", title: "Feature Refinement", icon: Sparkles },
                  ].map((template) => {
                    const Icon = template.icon;
                    const isAdded = extensions.some((e) => e.type === template.type);
                    return (
                      <Button
                        key={template.type}
                        variant={isAdded ? "secondary" : "outline"}
                        className="justify-start"
                        disabled={isAdded}
                        onClick={() => {
                          const fullTemplate = getExtensionTemplate(template.type as any);
                          if (fullTemplate) addExtension(fullTemplate);
                        }}
                        data-testid={`button-add-${template.type}`}
                      >
                        {isAdded ? (
                          <Check className="w-4 h-4 mr-2" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        <Icon className="w-4 h-4 mr-2" />
                        {template.title}
                      </Button>
                    );
                  })}
                </div>

                {extensions.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      {extensions.map((ext) => (
                        <Collapsible
                          key={ext.id}
                          open={expandedExtensions.has(ext.id)}
                          onOpenChange={() => toggleExtension(ext.id)}
                        >
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover-elevate">
                              <div className="flex items-center gap-3">
                                {expandedExtensions.has(ext.id) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                                <div>
                                  <h4 className="font-medium">{ext.title}</h4>
                                  <p className="text-sm text-muted-foreground">{ext.description}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {ext.estimatedHours.min}-{ext.estimatedHours.max} hrs
                                </div>
                                <div className="text-sm text-primary">
                                  ${calculateTotal(ext.estimatedHours, hourlyRate).min.toLocaleString()} - 
                                  ${calculateTotal(ext.estimatedHours, hourlyRate).max.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="p-4 border-x border-b rounded-b-lg bg-muted/30">
                              <h5 className="text-sm font-medium mb-2">Line Items</h5>
                              <div className="space-y-1">
                                {ext.lineItems.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <span className={!item.included ? "text-muted-foreground line-through" : ""}>
                                      {item.description}
                                    </span>
                                    <span className="text-muted-foreground">
                                      {item.estimatedHours} hrs
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="msa" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Master Service Agreement</CardTitle>
                    <CardDescription>
                      Enable ongoing support and maintenance terms
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="msa-toggle">Enable MSA</Label>
                    <Switch
                      id="msa-toggle"
                      checked={msaTerms?.enabled || false}
                      onCheckedChange={toggleMSA}
                      data-testid="switch-msa-toggle"
                    />
                  </div>
                </div>
              </CardHeader>
              {msaTerms?.enabled && (
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Retainer Structure</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Monthly Hours</span>
                          <span className="font-medium">{msaTerms.retainer?.monthlyHours || 10} hours</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Monthly Investment</span>
                          <span className="font-medium text-primary">
                            ${((msaTerms.retainer?.monthlyHours || 10) * hourlyRate).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Hour Rollover</span>
                          <span className="font-medium">{msaTerms.retainer?.rolloverHours ? "Yes" : "No"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">SLA Response Times</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Badge variant="destructive" className="text-xs">Critical</Badge>
                          </span>
                          <span className="font-medium">{msaTerms.sla?.criticalResponseHours || 4} hours</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">High</Badge>
                          </span>
                          <span className="font-medium">{msaTerms.sla?.highResponseHours || 8} hours</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">Normal</Badge>
                          </span>
                          <span className="font-medium">{msaTerms.sla?.normalResponseHours || 24} hours</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-medium">Agreement Term</h4>
                      <div className="flex items-center justify-between text-sm">
                        <span>Duration</span>
                        <span className="font-medium">{msaTerms.termMonths} months</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Auto-Renew</span>
                        <span className="font-medium">{msaTerms.autoRenew ? "Yes" : "No"}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Change Process</h4>
                      <div className="flex items-center justify-between text-sm">
                        <span>Written Approval Required</span>
                        <span className="font-medium">{msaTerms.changeProcess?.requiresWrittenApproval ? "Yes" : "No"}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Approval Threshold</span>
                        <span className="font-medium">{msaTerms.changeProcess?.minimumHoursForApproval || 4}+ hours</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="legal" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Legal Terms & Conditions</CardTitle>
                    <CardDescription>
                      Include standard legal clauses in your Statement of Work
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="legal-toggle" className="text-sm">Include Legal Terms</Label>
                    <Switch
                      id="legal-toggle"
                      checked={legalTerms?.enabled || false}
                      onCheckedChange={toggleLegalTerms}
                      data-testid="switch-legal-toggle"
                    />
                  </div>
                </div>
              </CardHeader>
              {legalTerms?.enabled && (
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        Payment Terms
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Deposit Required</span>
                          <span className="font-medium">{legalTerms.paymentTerms.depositPercent}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Payment Due</span>
                          <span className="font-medium">Net {legalTerms.paymentTerms.netDays} days</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Late Fee</span>
                          <span className="font-medium">{legalTerms.paymentTerms.lateFeePercent}% monthly</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-primary" />
                        Intellectual Property
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>IP Ownership</span>
                          <Badge variant="outline" className="capitalize">
                            {legalTerms.ipOwnership === "client" ? "Client Owns" : 
                             legalTerms.ipOwnership === "developer" ? "Developer Owns" :
                             legalTerms.ipOwnership === "joint" ? "Joint Ownership" : "License Only"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Transfer Upon Payment</span>
                          <span className="font-medium">{legalTerms.ipTransferUponPayment ? "Yes" : "No"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        Confidentiality
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Enabled</span>
                          <span className="font-medium">{legalTerms.confidentiality.enabled ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Duration</span>
                          <span className="font-medium">{legalTerms.confidentiality.durationYears} years</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-primary" />
                        Liability & Warranties
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Liability Limit</span>
                          <Badge variant="outline" className="text-xs">
                            {legalTerms.liabilityLimit === "contract_value" ? "Contract Value" :
                             legalTerms.liabilityLimit === "12_months_fees" ? "12 Months Fees" : "Unlimited"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Warranty Period</span>
                          <span className="font-medium">{legalTerms.warranties.defectPeriodDays} days</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Settings className="w-4 h-4 text-primary" />
                        Termination
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Notice Period</span>
                          <span className="font-medium">{legalTerms.termination.noticeDays} days</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Termination Fee</span>
                          <span className="font-medium">{legalTerms.termination.killFeePercent}% of remaining</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        Dispute Resolution
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Method</span>
                          <Badge variant="outline" className="capitalize">
                            {legalTerms.disputeResolution}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Governing Law</span>
                          <span className="font-medium text-xs">{legalTerms.governingLaw}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">Additional Clauses</h4>
                    <div className="flex flex-wrap gap-2">
                      {legalTerms.independentContractor && (
                        <Badge variant="secondary">Independent Contractor</Badge>
                      )}
                      {legalTerms.forceMaileure && (
                        <Badge variant="secondary">Force Majeure</Badge>
                      )}
                      {legalTerms.termination.forCause && (
                        <Badge variant="secondary">Termination for Cause</Badge>
                      )}
                      {legalTerms.termination.forConvenience && (
                        <Badge variant="secondary">Termination for Convenience</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function getExtensionTemplate(type: string): Omit<ExtensionSOW, "id" | "createdAt" | "status"> | null {
  const templates: Record<string, Omit<ExtensionSOW, "id" | "createdAt" | "status">> = {
    environment_setup: {
      type: "environment_setup",
      title: "Environment Setup",
      description: "Configure development, staging, and production environments",
      lineItems: [
        { id: "env-1", category: "Infrastructure", description: "Development environment setup", estimatedHours: 4, included: true },
        { id: "env-2", category: "Infrastructure", description: "Staging environment setup", estimatedHours: 4, included: true },
        { id: "env-3", category: "Infrastructure", description: "Production environment setup", estimatedHours: 6, included: true },
        { id: "env-4", category: "DevOps", description: "CI/CD pipeline configuration", estimatedHours: 8, included: true },
      ],
      estimatedHours: { min: 16, max: 24 },
      priority: "high",
    },
    domain_dns: {
      type: "domain_dns",
      title: "Domain & DNS Configuration",
      description: "Set up custom domain, SSL certificates, and DNS records",
      lineItems: [
        { id: "dns-1", category: "Infrastructure", description: "Domain registration assistance", estimatedHours: 1, included: true },
        { id: "dns-2", category: "Infrastructure", description: "DNS configuration", estimatedHours: 2, included: true },
        { id: "dns-3", category: "Security", description: "SSL certificate setup", estimatedHours: 2, included: true },
        { id: "dns-4", category: "Infrastructure", description: "CDN configuration (optional)", estimatedHours: 4, included: false },
      ],
      estimatedHours: { min: 4, max: 8 },
      priority: "medium",
    },
    email_service: {
      type: "email_service",
      title: "Email Service Integration",
      description: "Set up transactional email, templates, and delivery",
      lineItems: [
        { id: "email-1", category: "Integration", description: "Email service provider setup", estimatedHours: 4, included: true },
        { id: "email-2", category: "Development", description: "Email template design", estimatedHours: 6, included: true },
        { id: "email-3", category: "Development", description: "Transactional email integration", estimatedHours: 8, included: true },
        { id: "email-4", category: "Testing", description: "Email deliverability testing", estimatedHours: 2, included: true },
      ],
      estimatedHours: { min: 16, max: 24 },
      priority: "medium",
    },
    integration: {
      type: "integration",
      title: "Third-Party Integration",
      description: "Integrate with external services and APIs",
      lineItems: [
        { id: "int-1", category: "Analysis", description: "API documentation review", estimatedHours: 2, included: true },
        { id: "int-2", category: "Development", description: "Integration implementation", estimatedHours: 12, included: true },
        { id: "int-3", category: "Testing", description: "Integration testing", estimatedHours: 4, included: true },
        { id: "int-4", category: "Documentation", description: "Integration documentation", estimatedHours: 2, included: true },
      ],
      estimatedHours: { min: 16, max: 32 },
      priority: "medium",
    },
    feature_refinement: {
      type: "feature_refinement",
      title: "Feature Refinement",
      description: "Fine-tune and polish existing features based on feedback",
      lineItems: [
        { id: "ref-1", category: "Analysis", description: "Feedback review and prioritization", estimatedHours: 2, included: true },
        { id: "ref-2", category: "Development", description: "UI/UX improvements", estimatedHours: 8, included: true },
        { id: "ref-3", category: "Development", description: "Functionality enhancements", estimatedHours: 8, included: true },
        { id: "ref-4", category: "Testing", description: "Regression testing", estimatedHours: 4, included: true },
      ],
      estimatedHours: { min: 16, max: 32 },
      priority: "high",
    },
  };

  return templates[type] || null;
}
