import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { WeekOverviewForm } from "./WeekOverviewForm";

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
  clientId: number;
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
      // TODO: API call to save overview
      // await fetch(`/api/admin/coaching/clients/${clientId}/week-overview`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(overview),
      // });

      // Update local state
      setWeekOverviews(prev => ({
        ...prev,
        [overview.weekNumber]: overview,
      }));

      // Move to next step
      handleNext();
    } catch (error) {
      console.error('Failed to save overview:', error);
      // TODO: Show error toast
    } finally {
      setIsSavingOverview(false);
    }
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

                {/* Generate Button */}
                <div className="text-center">
                  <Button size="lg" disabled>
                    Generate Workout from Overview (Coming Soon)
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">This will open a preview dialog where you can review and approve the AI-generated workout</p>
                </div>

                {/* Temporary Navigation */}
                <div className="text-center pt-8">
                  <Button onClick={handleNext}>
                    Skip to Nutrition (Temporary)
                  </Button>
                </div>
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
                    </div>
                  ) : (
                    <p className="text-sm text-red-600">No overview found. Please go back and complete the overview step.</p>
                  )}
                </div>

                {/* Generate Button */}
                <div className="text-center">
                  <Button size="lg" disabled>
                    Generate Nutrition for Week {currentStep.weekNumber} (Coming Soon)
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">This will open a preview dialog where you can review and approve the AI-generated nutrition plan</p>
                </div>

                {/* Temporary Navigation */}
                <div className="text-center pt-8">
                  <Button onClick={handleNext}>
                    Skip to Next Step (Temporary)
                  </Button>
                </div>
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
  );
}
