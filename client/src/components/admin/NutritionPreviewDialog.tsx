import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, CheckCircle, Apple } from "lucide-react";
import type { WeekOverview } from "./PlanBuilderWizard";

export interface MealOption {
  name: string;
  description: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  ingredients?: string[];
  instructions?: string;
}

export interface NutritionMeal {
  mealType: string; // "breakfast", "lunch", "snack", "dinner"
  options: MealOption[];
}

export interface NutritionPreview {
  weekNumber: number;
  meals: NutritionMeal[];
  dailyMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  weeklyPrepTips?: string[];
  notes?: string;
}

interface NutritionPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  weekNumber: 1 | 2 | 3 | 4;
  overview: WeekOverview;
  workoutIntensity: "low" | "moderate" | "high";
  onApprove: (nutrition: NutritionPreview) => Promise<void>;
  onRegenerate: () => void;
  onRegenerateMeal: (mealType: string) => void;
  isGenerating: boolean;
  nutrition: NutritionPreview | null;
}

export function NutritionPreviewDialog({
  open,
  onClose,
  weekNumber,
  overview,
  workoutIntensity,
  onApprove,
  onRegenerate,
  onRegenerateMeal,
  isGenerating,
  nutrition,
}: NutritionPreviewDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  const handleApprove = async () => {
    if (!nutrition) return;
    setIsSaving(true);
    try {
      await onApprove(nutrition);
    } finally {
      setIsSaving(false);
    }
  };

  const mealTypeLabels: Record<string, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    snack: "Snack",
    dinner: "Dinner",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-3">
            <Apple className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-2xl font-semibold">Week {weekNumber} Nutrition Plan - Preview</h2>
              <p className="text-sm text-gray-600 font-normal mt-1">
                Review the AI-generated nutrition plan before saving. You can regenerate individual meals or the entire plan.
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Context Summary */}
        <div className="border-b pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Week Context:</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Workout Intensity:</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                workoutIntensity === "high" ? "bg-red-100 text-red-700" :
                workoutIntensity === "moderate" ? "bg-yellow-100 text-yellow-700" :
                "bg-green-100 text-green-700"
              }`}>
                {workoutIntensity.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <p className="line-clamp-2">{overview.philosophy}</p>
          </div>
        </div>

        {/* Daily Macro Targets */}
        {nutrition && (
          <div className="border-b pb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Daily Macro Targets</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-900">{nutrition.dailyMacros.calories}</div>
                <div className="text-xs text-blue-600 uppercase tracking-wide">Calories</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-900">{nutrition.dailyMacros.protein}g</div>
                <div className="text-xs text-green-600 uppercase tracking-wide">Protein</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-900">{nutrition.dailyMacros.carbs}g</div>
                <div className="text-xs text-yellow-600 uppercase tracking-wide">Carbs</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-900">{nutrition.dailyMacros.fat}g</div>
                <div className="text-xs text-purple-600 uppercase tracking-wide">Fat</div>
              </div>
            </div>
          </div>
        )}

        {/* Nutrition Preview */}
        <div className="flex-1 overflow-y-auto py-4">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <RefreshCw className="w-12 h-12 text-green-600 animate-spin" />
              <p className="text-lg font-medium text-gray-700">Generating nutrition plan...</p>
              <p className="text-sm text-gray-500">This may take 30-60 seconds</p>
            </div>
          ) : nutrition ? (
            <div className="space-y-4">
              {nutrition.meals.map((meal) => (
                <div key={meal.mealType} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {mealTypeLabels[meal.mealType]}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRegenerateMeal(meal.mealType)}
                      disabled={isGenerating || isSaving}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Regenerate
                    </Button>
                  </div>

                  <div className="p-4 space-y-3">
                    {meal.options.map((option, optIdx) => (
                      <div key={optIdx} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900">{option.name}</h4>
                            <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                          </div>
                          <div className="text-xs text-gray-600 text-right ml-4">
                            <div className="font-semibold text-gray-900">{option.macros.calories} cal</div>
                            <div>P: {option.macros.protein}g</div>
                            <div>C: {option.macros.carbs}g</div>
                            <div>F: {option.macros.fat}g</div>
                          </div>
                        </div>

                        {option.ingredients && option.ingredients.length > 0 && (
                          <details className="text-xs mt-2">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                              Show ingredients & instructions
                            </summary>
                            <div className="mt-2 space-y-2">
                              <div>
                                <span className="font-semibold">Ingredients:</span>
                                <ul className="list-disc list-inside mt-1">
                                  {option.ingredients.map((ingredient, i) => (
                                    <li key={i}>{ingredient}</li>
                                  ))}
                                </ul>
                              </div>
                              {option.instructions && (
                                <div>
                                  <span className="font-semibold">Instructions:</span>
                                  <p className="mt-1 whitespace-pre-line">{option.instructions}</p>
                                </div>
                              )}
                            </div>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Weekly Prep Tips */}
              {nutrition.weeklyPrepTips && nutrition.weeklyPrepTips.length > 0 && (
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Weekly Prep Tips</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {nutrition.weeklyPrepTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Additional Notes */}
              {nutrition.notes && (
                <Alert>
                  <AlertDescription>{nutrition.notes}</AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                Click "Generate Nutrition for Week {weekNumber}" to create the nutrition plan using AI.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="border-t pt-4 flex items-center justify-between">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {nutrition && (
              <Button
                variant="outline"
                onClick={onRegenerate}
                disabled={isGenerating || isSaving}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate All
              </Button>
            )}
            <Button
              onClick={handleApprove}
              disabled={!nutrition || isGenerating || isSaving}
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
