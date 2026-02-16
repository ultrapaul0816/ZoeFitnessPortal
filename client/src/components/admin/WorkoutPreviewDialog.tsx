import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, CheckCircle, Dumbbell } from "lucide-react";
import type { WeekOverview } from "./PlanBuilderWizard";

interface Exercise {
  name: string;
  sets?: string;
  reps?: string;
  durationSeconds?: number;
  restSeconds?: number;
  notes?: string;
}

interface WorkoutSection {
  title: string;
  exercises: Exercise[];
}

interface WorkoutDay {
  dayNumber: number;
  title: string;
  description: string;
  sections: WorkoutSection[];
}

interface WorkoutPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  weekNumber: 1 | 2 | 3 | 4;
  overview: WeekOverview;
  onApprove: (workout: WorkoutDay[]) => Promise<void>;
  onRegenerate: () => void;
  isGenerating: boolean;
  workout: WorkoutDay[] | null;
}

export function WorkoutPreviewDialog({
  open,
  onClose,
  weekNumber,
  overview,
  onApprove,
  onRegenerate,
  isGenerating,
  workout,
}: WorkoutPreviewDialogProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleApprove = async () => {
    if (!workout) return;
    setIsSaving(true);
    try {
      await onApprove(workout);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    return `${seconds}s`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-3">
            <Dumbbell className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-semibold">Week {weekNumber} Workout Plan - Preview</h2>
              <p className="text-sm text-gray-600 font-normal mt-1">
                Review the AI-generated workout before saving. You can regenerate if needed.
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Overview Reminder */}
        <div className="border-b pb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Strategic Overview:</h3>
          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 space-y-2">
            <p className="line-clamp-2">{overview.philosophy}</p>
            <details className="text-xs">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                Show full overview
              </summary>
              <div className="mt-2 space-y-2">
                <div>
                  <span className="font-semibold">Philosophy:</span>
                  <p className="mt-1">{overview.philosophy}</p>
                </div>
                <div>
                  <span className="font-semibold">Focus Areas:</span>
                  <p className="mt-1 whitespace-pre-line">{overview.focusAreas}</p>
                </div>
                <div>
                  <span className="font-semibold">Safety:</span>
                  <p className="mt-1">{overview.safety}</p>
                </div>
                {overview.progression && (
                  <div>
                    <span className="font-semibold">Progression:</span>
                    <p className="mt-1">{overview.progression}</p>
                  </div>
                )}
              </div>
            </details>
          </div>
        </div>

        {/* Workout Preview */}
        <div className="flex-1 overflow-y-auto py-4">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-lg font-medium text-gray-700">Generating workout plan...</p>
              <p className="text-sm text-gray-500">This may take 30-60 seconds</p>
            </div>
          ) : workout ? (
            <div className="space-y-6">
              {workout.map((day) => (
                <div key={day.dayNumber} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 border-b px-4 py-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Day {day.dayNumber}: {day.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{day.description}</p>
                  </div>

                  <div className="p-4 space-y-4">
                    {day.sections.map((section, sectionIdx) => (
                      <div key={sectionIdx}>
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                          {section.title}
                        </h4>
                        <div className="space-y-2">
                          {section.exercises.map((exercise, exIdx) => (
                            <div key={exIdx} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900">{exercise.name}</span>
                                {exercise.notes && (
                                  <p className="text-xs text-gray-500 mt-1">{exercise.notes}</p>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 text-right ml-4">
                                {exercise.sets && exercise.reps && (
                                  <div>
                                    {exercise.sets} × {exercise.reps}
                                  </div>
                                )}
                                {exercise.durationSeconds && (
                                  <div>{formatDuration(exercise.durationSeconds)}</div>
                                )}
                                {exercise.restSeconds && (
                                  <div className="text-xs text-gray-500">
                                    Rest: {exercise.restSeconds}s
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                Click "Generate Workout from Overview" to create the workout plan using AI.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="border-t pt-4 flex items-center justify-between">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {workout && (
              <Button
                variant="outline"
                onClick={onRegenerate}
                disabled={isGenerating || isSaving}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            )}
            <Button
              onClick={handleApprove}
              disabled={!workout || isGenerating || isSaving}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Approve & Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
