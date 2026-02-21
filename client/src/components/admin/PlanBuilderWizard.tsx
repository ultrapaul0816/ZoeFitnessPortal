import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Save, CheckCircle, RefreshCw } from "lucide-react";
import { WeekOverviewForm } from "./WeekOverviewForm";
import { WorkoutPreviewDialog } from "./WorkoutPreviewDialog";
import { NutritionPreviewDialog } from "./NutritionPreviewDialog";
import type { WorkoutDay } from "./WorkoutPreviewDialog";
import type { NutritionPreview } from "./NutritionPreviewDialog";
import { useToast } from "@/hooks/use-toast";

// Step types for the 13-step wizard
type Step =
  | { type: 'overview'; weekNumber: 1 | 2 | 3 | 4 }
  | { type: 'workout'; weekNumber: 1 | 2 | 3 | 4 }
  | { type: 'nutrition'; weekNumber: 1 | 2 | 3 | 4 }
  | { type: 'review' };

// Week overview structure
export interface WeekOverview {
  weekNumber: number;
  philosophy: string;
  focusAreas: string;
  safety: string;
  progression?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PlanBuilderWizardProps {
  clientId: string;
  clientName: string;
  open: boolean;
  onClose: () => void;
  initialStep?: number;
  existingOverviews?: Record<number, WeekOverview>;
}

export function PlanBuilderWizard({
  clientId,
  clientName,
  open,
  onClose,
  initialStep = 0,
  existingOverviews = {},
}: PlanBuilderWizardProps) {
  // Generate all 13 steps: (Overview + Workout + Nutrition) × 4 weeks + Final Review
  const allSteps: Step[] = [
    { type: 'overview', weekNumber: 1 },
    { type: 'workout', weekNumber: 1 },
    { type: 'nutrition', weekNumber: 1 },
    { type: 'overview', weekNumber: 2 },
    { type: 'workout', weekNumber: 2 },
    { type: 'nutrition', weekNumber: 2 },
    { type: 'overview', weekNumber: 3 },
    { type: 'workout', weekNumber: 3 },
    { type: 'nutrition', weekNumber: 3 },
    { type: 'overview', weekNumber: 4 },
    { type: 'workout', weekNumber: 4 },
    { type: 'nutrition', weekNumber: 4 },
    { type: 'review' },
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const [weekOverviews, setWeekOverviews] = useState<Record<number, WeekOverview>>(existingOverviews);
  const [isSavingOverview, setIsSavingOverview] = useState(false);

  // Workout state
  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState(false);
  const [workoutPreview, setWorkoutPreview] = useState<WorkoutDay[] | null>(null);
  const [savedWorkouts, setSavedWorkouts] = useState<Record<number, boolean>>({});

  // Nutrition state
  const [nutritionDialogOpen, setNutritionDialogOpen] = useState(false);
  const [isGeneratingNutrition, setIsGeneratingNutrition] = useState(false);
  const [nutritionPreview, setNutritionPreview] = useState<NutritionPreview | null>(null);
  const [savedNutrition, setSavedNutrition] = useState<Record<number, boolean>>({});

  const { toast } = useToast();

  const currentStep = allSteps[currentStepIndex];
  const progressPercent = ((currentStepIndex + 1) / allSteps.length) * 100;

  const handleNext = () => {
    if (currentStepIndex < allSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSaveAndExit = () => {
    // TODO: Save current progress to database
    onClose();
  };

  const handleSaveOverview = async (overview: WeekOverview) => {
    setIsSavingOverview(true);
    try {
      const response = await fetch(`/api/admin/coaching/clients/${clientId}/week-overview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overview),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to save overview');
      }

      // Update local state
      setWeekOverviews(prev => ({
        ...prev,
        [overview.weekNumber]: overview,
      }));

      toast({
        title: "Overview saved",
        description: `Week ${overview.weekNumber} strategic overview has been saved.`,
      });

      // Move to next step
      handleNext();
    } catch (error) {
      console.error('Failed to save overview:', error);
      toast({
        title: "Error",
        description: "Failed to save overview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingOverview(false);
    }
  };

  // Generate workout from overview
  const handleGenerateWorkout = async (weekNumber: number) => {
    const overview = weekOverviews[weekNumber];
    if (!overview) {
      toast({
        title: "Error",
        description: "Please complete the overview first.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingWorkout(true);
    setWorkoutDialogOpen(true);
    setWorkoutPreview(null);

    try {
      const response = await fetch(`/api/admin/coaching/clients/${clientId}/generate-workout-from-overview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekNumber, overview }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to generate workout');
      }

      const data = await response.json();
      setWorkoutPreview(data.workoutPlan.days);
    } catch (error) {
      console.error('Failed to generate workout:', error);
      toast({
        title: "Error",
        description: "Failed to generate workout. Please try again.",
        variant: "destructive",
      });
      setWorkoutDialogOpen(false);
    } finally {
      setIsGeneratingWorkout(false);
    }
  };

  // Approve and save workout
  const handleApproveWorkout = async (workout: WorkoutDay[], weekNumber: number) => {
    try {
      // TODO: Implement save workout API endpoint
      // For now, just mark as saved and close dialog
      setSavedWorkouts(prev => ({ ...prev, [weekNumber]: true }));
      setWorkoutDialogOpen(false);
      setWorkoutPreview(null);

      toast({
        title: "Workout saved",
        description: `Week ${weekNumber} workout has been saved successfully.`,
      });

      // Move to next step
      handleNext();
    } catch (error) {
      console.error('Failed to save workout:', error);
      toast({
        title: "Error",
        description: "Failed to save workout. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Regenerate workout
  const handleRegenerateWorkout = (weekNumber: number) => {
    handleGenerateWorkout(weekNumber);
  };

  // Generate nutrition
  const handleGenerateNutrition = async (weekNumber: number) => {
    const overview = weekOverviews[weekNumber];
    if (!overview) {
      toast({
        title: "Error",
        description: "Please complete the overview first.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingNutrition(true);
    setNutritionDialogOpen(true);
    setNutritionPreview(null);

    try {
      const response = await fetch(`/api/admin/coaching/clients/${clientId}/generate-weekly-nutrition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekNumber,
          overview,
          workoutIntensity: weekNumber === 1 ? "moderate" : weekNumber === 4 ? "high" : "moderate",
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to generate nutrition');
      }

      const data = await response.json();
      setNutritionPreview(data.nutritionPlan);
    } catch (error) {
      console.error('Failed to generate nutrition:', error);
      toast({
        title: "Error",
        description: "Failed to generate nutrition. Please try again.",
        variant: "destructive",
      });
      setNutritionDialogOpen(false);
    } finally {
      setIsGeneratingNutrition(false);
    }
  };

  // Approve and save nutrition
  const handleApproveNutrition = async (nutrition: NutritionPreview) => {
    try {
      // TODO: Implement save nutrition API endpoint
      // For now, just mark as saved and close dialog
      setSavedNutrition(prev => ({ ...prev, [nutrition.weekNumber]: true }));
      setNutritionDialogOpen(false);
      setNutritionPreview(null);

      toast({
        title: "Nutrition saved",
        description: `Week ${nutrition.weekNumber} nutrition has been saved successfully.`,
      });

      // Move to next step
      handleNext();
    } catch (error) {
      console.error('Failed to save nutrition:', error);
      toast({
        title: "Error",
        description: "Failed to save nutrition. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Regenerate nutrition
  const handleRegenerateNutrition = (weekNumber: number) => {
    handleGenerateNutrition(weekNumber);
  };

  // Regenerate individual meal
  const handleRegenerateMeal = (mealType: string) => {
    toast({
      title: "Regenerating meal",
      description: `Regenerating ${mealType}...`,
    });
    // TODO: Implement regenerate individual meal
  };

  const getStepTitle = (step: Step): string => {
    if (step.type === 'review') return 'Final Review';
    const weekNum = 'weekNumber' in step ? step.weekNumber : 0;

    switch (step.type) {
      case 'overview':
        return `Week ${weekNum} - Strategic Overview`;
      case 'workout':
        return `Week ${weekNum} - Workout Plan`;
      case 'nutrition':
        return `Week ${weekNum} - Nutrition Plan`;
      default:
        return '';
    }
  };

  const getStepDescription = (step: Step): string => {
    if (step.type === 'review') return 'Review and activate the complete 4-week program';
    const weekNum = 'weekNumber' in step ? step.weekNumber : 0;

    switch (step.type) {
      case 'overview':
        return `Write the high-level strategy for Week ${weekNum}`;
      case 'workout':
        return `Generate and review the 7-day workout plan`;
      case 'nutrition':
        return `Generate and review the weekly nutrition plan`;
      default:
        return '';
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Build Program: {clientName}</h2>
              <p className="text-sm text-gray-500 font-normal mt-1">
                Step {currentStepIndex + 1} of {allSteps.length}: {getStepTitle(currentStep)}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSaveAndExit}>
              <Save className="w-4 h-4 mr-2" />
              Save & Exit
            </Button>
          </DialogTitle>

          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
              <span>Review</span>
            </div>
          </div>
        </DialogHeader>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto py-6 px-2">
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold mb-2">{getStepTitle(currentStep)}</h3>
              <p className="text-sm text-gray-600">{getStepDescription(currentStep)}</p>
            </div>

            {/* Render different content based on step type */}
            {currentStep.type === 'overview' && (
              <WeekOverviewForm
                weekNumber={currentStep.weekNumber}
                clientId={clientId}
                initialOverview={weekOverviews[currentStep.weekNumber]}
                onSave={handleSaveOverview}
                isSaving={isSavingOverview}
              />
            )}

            {currentStep.type === 'workout' && (
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Overview Summary */}
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Week {currentStep.weekNumber} Overview (Your Strategy)</h4>
                  {weekOverviews[currentStep.weekNumber] ? (
                    <div className="text-sm text-gray-600 space-y-2">
                      <p className="line-clamp-3">{weekOverviews[currentStep.weekNumber].philosophy}</p>
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                          Show full overview
                        </summary>
                        <div className="mt-2 space-y-2">
                          <div>
                            <span className="font-semibold">Philosophy:</span>
                            <p className="mt-1">{weekOverviews[currentStep.weekNumber].philosophy}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Focus Areas:</span>
                            <p className="mt-1 whitespace-pre-line">{weekOverviews[currentStep.weekNumber].focusAreas}</p>
                          </div>
                        </div>
                      </details>
                    </div>
                  ) : (
                    <p className="text-sm text-red-600">No overview found. Please go back and complete the overview step.</p>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="text-center">
                  {savedWorkouts[currentStep.weekNumber] ? (
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Week {currentStep.weekNumber} workout saved</span>
                      </div>
                      <div>
                        <Button
                          variant="outline"
                          onClick={() => handleGenerateWorkout(currentStep.weekNumber)}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate Workout
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="lg"
                      onClick={() => handleGenerateWorkout(currentStep.weekNumber)}
                      disabled={!weekOverviews[currentStep.weekNumber]}
                    >
                      Generate Workout from Overview
                    </Button>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    AI will create a 7-day workout plan based on your strategic overview
                  </p>
                </div>

                {/* Skip Navigation (for testing) */}
                {savedWorkouts[currentStep.weekNumber] && (
                  <div className="text-center pt-8">
                    <Button onClick={handleNext} variant="outline">
                      Continue to Nutrition →
                    </Button>
                  </div>
                )}
              </div>
            )}

            {currentStep.type === 'nutrition' && (
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Overview Summary */}
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Week {currentStep.weekNumber} Context</h4>
                  {weekOverviews[currentStep.weekNumber] ? (
                    <div className="text-sm text-gray-600">
                      <p className="line-clamp-2">{weekOverviews[currentStep.weekNumber].philosophy}</p>
                      {savedWorkouts[currentStep.weekNumber] && (
                        <p className="text-xs text-green-600 mt-2">✓ Workout plan for this week is complete</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-red-600">No overview found. Please go back and complete the overview step.</p>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="text-center">
                  {savedNutrition[currentStep.weekNumber] ? (
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Week {currentStep.weekNumber} nutrition saved</span>
                      </div>
                      <div>
                        <Button
                          variant="outline"
                          onClick={() => handleGenerateNutrition(currentStep.weekNumber)}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate Nutrition
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="lg"
                      onClick={() => handleGenerateNutrition(currentStep.weekNumber)}
                      disabled={!weekOverviews[currentStep.weekNumber]}
                    >
                      Generate Nutrition for Week {currentStep.weekNumber}
                    </Button>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    AI will create a nutrition plan aligned with this week's training intensity
                  </p>
                </div>

                {/* Skip Navigation (for testing) */}
                {savedNutrition[currentStep.weekNumber] && (
                  <div className="text-center pt-8">
                    <Button onClick={handleNext} variant="outline">
                      Continue to {currentStep.weekNumber < 4 ? `Week ${currentStep.weekNumber + 1}` : 'Final Review'} →
                    </Button>
                  </div>
                )}
              </div>
            )}

            {currentStep.type === 'review' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <h3 className="text-2xl font-bold text-center mb-8">Program Complete - Final Review</h3>

                {/* Summary Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((week) => (
                    <div key={week} className="border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold mb-4">Week {week}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          {weekOverviews[week] ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-gray-300">○</span>
                          )}
                          <span>Overview written</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300">○</span>
                          <span>7-day workout (Coming soon)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300">○</span>
                          <span>Nutrition plan (Coming soon)</span>
                        </div>
                      </div>
                      {weekOverviews[week] && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => {
                            // Jump to week overview step
                            setCurrentStepIndex((week - 1) * 3);
                          }}
                        >
                          Edit Week {week}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Activation Section */}
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-6 text-center">
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">Ready to Activate?</h4>
                  <p className="text-sm text-blue-700 mb-4">
                    Once activated, the client will receive an email and can access their full program.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={handleSaveAndExit}>
                      Save & Exit (Don't Activate Yet)
                    </Button>
                    <Button disabled>
                      Approve Program & Activate Client (Coming Soon)
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="border-t pt-4 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-sm text-gray-500">
            {currentStepIndex + 1} / {allSteps.length}
          </div>

          <Button
            onClick={handleNext}
            disabled={currentStepIndex === allSteps.length - 1}
          >
            Continue
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Workout Preview Dialog */}
    {currentStep.type === 'workout' && (
      <WorkoutPreviewDialog
        open={workoutDialogOpen}
        onClose={() => {
          setWorkoutDialogOpen(false);
          setWorkoutPreview(null);
        }}
        weekNumber={currentStep.weekNumber}
        overview={weekOverviews[currentStep.weekNumber] || {} as WeekOverview}
        onApprove={(workout) => handleApproveWorkout(workout, currentStep.weekNumber)}
        onRegenerate={() => handleRegenerateWorkout(currentStep.weekNumber)}
        isGenerating={isGeneratingWorkout}
        workout={workoutPreview}
      />
    )}

    {/* Nutrition Preview Dialog */}
    {currentStep.type === 'nutrition' && (
      <NutritionPreviewDialog
        open={nutritionDialogOpen}
        onClose={() => {
          setNutritionDialogOpen(false);
          setNutritionPreview(null);
        }}
        weekNumber={currentStep.weekNumber}
        overview={weekOverviews[currentStep.weekNumber] || {} as WeekOverview}
        workoutIntensity={currentStep.weekNumber === 1 ? "moderate" : currentStep.weekNumber === 4 ? "high" : "moderate"}
        onApprove={handleApproveNutrition}
        onRegenerate={() => handleRegenerateNutrition(currentStep.weekNumber)}
        onRegenerateMeal={handleRegenerateMeal}
        isGenerating={isGeneratingNutrition}
        nutrition={nutritionPreview}
      />
    )}
  </>
  );
}
