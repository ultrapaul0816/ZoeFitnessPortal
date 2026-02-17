import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, Wand2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { WeekOverview } from "./PlanBuilderWizard";

interface WeekOverviewFormProps {
  weekNumber: 1 | 2 | 3 | 4;
  clientId: number | string;
  initialOverview?: WeekOverview;
  onSave: (overview: WeekOverview) => void;
  isSaving?: boolean;
}

export function WeekOverviewForm({
  weekNumber,
  clientId,
  initialOverview,
  onSave,
  isSaving = false,
}: WeekOverviewFormProps) {
  const [philosophy, setPhilosophy] = useState(initialOverview?.philosophy || '');
  const [focusAreas, setFocusAreas] = useState(initialOverview?.focusAreas || '');
  const [safety, setSafety] = useState(initialOverview?.safety || '');
  const [progression, setProgression] = useState(initialOverview?.progression || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/admin/coaching/clients/${clientId}/generate-plan-outline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekNumber }),
        credentials: 'include',
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to generate overview');
      }

      const data = await response.json();
      const outline = data.outline;

      // Map the AI outline fields to form fields
      if (outline.philosophy) setPhilosophy(outline.philosophy);
      if (outline.focusAreas) {
        // focusAreas can be array or string
        const fa = Array.isArray(outline.focusAreas)
          ? outline.focusAreas.map((f: string) => `- ${f}`).join('\n')
          : outline.focusAreas;
        setFocusAreas(fa);
      }
      if (outline.safetyConsiderations) setSafety(outline.safetyConsiderations);
      if (outline.progressionFromLastWeek && weekNumber > 1) setProgression(outline.progressionFromLastWeek);

      toast({
        title: "Overview generated!",
        description: `Week ${weekNumber} overview has been filled in. Review and edit before saving.`,
      });
    } catch (error: any) {
      console.error('Failed to generate overview:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate overview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = () => {
    const overview: WeekOverview = {
      weekNumber,
      philosophy,
      focusAreas,
      safety,
      ...(weekNumber > 1 && { progression }),
      updatedAt: new Date().toISOString(),
    };
    onSave(overview);
  };

  const isValid = philosophy.trim().length > 0 && focusAreas.trim().length > 0 && safety.trim().length > 0;
  const hasAnyContent = philosophy || focusAreas || safety;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* AI Generate Button - prominent at top */}
      <div className="flex items-center justify-between p-4 bg-violet-50 border border-violet-200 rounded-xl">
        <div className="flex items-start gap-3">
          <Wand2 className="w-5 h-5 text-violet-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-violet-800">Generate with AI</p>
            <p className="text-xs text-violet-600 mt-0.5">
              AI will use the client's intake forms and coach notes to draft Week {weekNumber}'s overview. You can edit before saving.
            </p>
          </div>
        </div>
        <Button
          onClick={handleGenerateWithAI}
          disabled={isGenerating}
          className="bg-violet-600 hover:bg-violet-700 text-white shrink-0 ml-4"
          size="sm"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Generating...
            </>
          ) : hasAnyContent ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Regenerate
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5 mr-1.5" />
              Generate Week {weekNumber} Overview
            </>
          )}
        </Button>
      </div>

      <Alert>
        <Lightbulb className="w-4 h-4" />
        <AlertDescription>
          Write a high-level strategy for this week. The AI will use your overview to generate the 7-day workout plan and nutrition plan.
          Be specific about client constraints, goals, and safety considerations.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {/* Philosophy & Goals */}
        <div>
          <Label htmlFor="philosophy" className="text-base font-semibold">
            Weekly Philosophy & Goals
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <p className="text-sm text-gray-500 mb-2">
            Describe the overall approach and objectives for this week (2-3 paragraphs)
          </p>
          <Textarea
            id="philosophy"
            value={philosophy}
            onChange={(e) => setPhilosophy(e.target.value)}
            placeholder="This week focuses on building foundational strength patterns while respecting lower back sensitivity. Goal is to establish proper squat depth and hip hinge mechanics before adding intensity. We'll emphasize form over weight, using tempo work to build mind-muscle connection.

The nutrition approach will support moderate training volume with a protein-first strategy. Client needs simple meal options that fit their busy schedule, so we'll focus on batch-prep friendly recipes with clear macros."
            rows={6}
            className="font-mono text-sm"
          />
          <div className="text-xs text-gray-500 mt-1">
            {philosophy.length} characters
          </div>
        </div>

        {/* Key Focus Areas */}
        <div>
          <Label htmlFor="focusAreas" className="text-base font-semibold">
            Key Focus Areas
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <p className="text-sm text-gray-500 mb-2">
            List 3-5 specific training focuses for this week (bullet list format)
          </p>
          <Textarea
            id="focusAreas"
            value={focusAreas}
            onChange={(e) => setFocusAreas(e.target.value)}
            placeholder="- Glute activation before all lower body work
- Core stability and bracing mechanics
- Shoulder mobility for overhead movements
- Hip hinge pattern with RDLs and deadlift variations
- Tempo work on main lifts (3-1-1-0)"
            rows={5}
            className="font-mono text-sm"
          />
        </div>

        {/* Safety & Modifications */}
        <div>
          <Label htmlFor="safety" className="text-base font-semibold">
            Safety & Modifications
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <p className="text-sm text-gray-500 mb-2">
            List any injuries, limitations, or necessary modifications
          </p>
          <Textarea
            id="safety"
            value={safety}
            onChange={(e) => setSafety(e.target.value)}
            placeholder="Avoid loaded spinal flexion due to previous back injury. Use box squats if depth is compromised. All pressing movements start with band warm-up for shoulder prep. No overhead pressing with heavy loads - use landmine variations instead. Keep core work to anti-extension and anti-rotation (avoid sit-ups/crunches)."
            rows={4}
            className="font-mono text-sm"
          />
        </div>

        {/* Progression (Week 2-4 only) */}
        {weekNumber > 1 && (
          <div>
            <Label htmlFor="progression" className="text-base font-semibold">
              Progression from Week {weekNumber - 1}
              <span className="text-gray-500 ml-1 text-sm font-normal">(Optional)</span>
            </Label>
            <p className="text-sm text-gray-500 mb-2">
              Describe how this week builds on the previous week
            </p>
            <Textarea
              id="progression"
              value={progression}
              onChange={(e) => setProgression(e.target.value)}
              placeholder="Increase squat volume by 10%. Add tempo work to Romanian deadlifts (3-0-3-0). Introduce more complex core exercises like Pallof presses and dead bugs with resistance. Nutrition will increase protein slightly to support higher training volume."
              rows={3}
              className="font-mono text-sm"
            />
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSaving}
          size="lg"
        >
          {isSaving ? 'Saving...' : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
}
