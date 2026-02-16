import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";

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
              <div>
                <p className="text-gray-500 text-center">Overview form placeholder (Week {currentStep.weekNumber})</p>
                {/* Will be replaced with WeekOverviewForm component */}
              </div>
            )}

            {currentStep.type === 'workout' && (
              <div>
                <p className="text-gray-500 text-center">Workout generation placeholder (Week {currentStep.weekNumber})</p>
                {/* Will show overview summary + generate button + preview dialog */}
              </div>
            )}

            {currentStep.type === 'nutrition' && (
              <div>
                <p className="text-gray-500 text-center">Nutrition generation placeholder (Week {currentStep.weekNumber})</p>
                {/* Will show overview/workout summary + generate button + preview dialog */}
              </div>
            )}

            {currentStep.type === 'review' && (
              <div>
                <p className="text-gray-500 text-center">Final review placeholder</p>
                {/* Will show summary cards for all 4 weeks + activate button */}
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
