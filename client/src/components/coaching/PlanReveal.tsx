import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Dumbbell,
  Apple,
  CheckCircle,
  ArrowRight,
  Calendar,
  ClipboardCheck,
  MessageCircle,
} from "lucide-react";

interface PlanRevealProps {
  client: {
    id: string;
    startDate: string | null;
    coachingType: string | null;
    planNarrative?: { summary?: string } | null;
    planDurationWeeks?: number;
  };
  userName: string;
  workoutPlan?: Array<{
    weekNumber: number;
    dayNumber: number;
    dayType: string;
    title: string;
    description?: string;
  }>;
  nutritionPlan?: Array<{
    mealType: string;
    options: unknown;
  }>;
  onComplete: () => void;
}

const GETTING_STARTED = [
  {
    icon: Calendar,
    title: "Set your schedule",
    description: "Block out workout times in your calendar for the week",
  },
  {
    icon: Dumbbell,
    title: "Check your equipment",
    description: "Make sure you have the equipment listed in your workouts",
  },
  {
    icon: ClipboardCheck,
    title: "Daily check-ins",
    description: "Submit a quick check-in each day to track mood, energy, and meals",
  },
  {
    icon: MessageCircle,
    title: "Message Zoe anytime",
    description: "Have questions? Your coach is just a message away",
  },
];

export function PlanReveal({
  client,
  userName,
  workoutPlan = [],
  nutritionPlan = [],
  onComplete,
}: PlanRevealProps) {
  const [step, setStep] = useState(0);
  const totalSteps = 3;

  // Gather week 1 workout summary
  const week1Workouts = workoutPlan.filter((w) => w.weekNumber === 1);
  const workoutDays = week1Workouts.length;
  const dayTypes = Array.from(new Set(week1Workouts.map((w) => w.dayType)));
  const mealTypes = Array.from(new Set(nutritionPlan.map((n) => n.mealType)));

  const narrative =
    client.planNarrative?.summary ||
    `I've designed a ${client.planDurationWeeks || 4}-week progressive program tailored to your goals and fitness level. Each week builds on the last, helping you get stronger while staying safe and supported.`;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-pink-50 to-white overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= step ? "w-8 bg-pink-500" : "w-4 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step 0: Celebration */}
        {step === 0 && (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-24 h-24 mx-auto bg-pink-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-pink-500 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Your Plan is Ready!
              </h1>
              <p className="text-gray-500">Welcome, {userName}</p>
            </div>

            <Card className="border-0 shadow-sm rounded-2xl text-left">
              <CardContent className="p-5">
                <p className="text-gray-700 leading-relaxed">{narrative}</p>
              </CardContent>
            </Card>

            <Button
              onClick={() => setStep(1)}
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-6 text-lg rounded-2xl"
            >
              See Your Week 1 Preview
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 1: Week 1 Preview */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Week 1 Preview</h2>
              <p className="text-gray-500">Here's what your first week looks like</p>
            </div>

            {/* Workouts summary */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Dumbbell className="w-5 h-5 text-pink-500" />
                  <h3 className="font-semibold text-gray-900">Workouts</h3>
                  <Badge className="ml-auto bg-pink-100 text-pink-700 border-0">
                    {workoutDays} day{workoutDays !== 1 ? "s" : ""}
                  </Badge>
                </div>
                {week1Workouts.length > 0 ? (
                  <div className="space-y-2">
                    {week1Workouts.slice(0, 5).map((workout) => (
                      <div
                        key={`${workout.weekNumber}-${workout.dayNumber}`}
                        className="flex items-center gap-3 p-2 rounded-xl bg-gray-50"
                      >
                        <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-xs font-bold text-pink-600">
                          D{workout.dayNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {workout.title}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {workout.dayType.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Your workout schedule will appear here once finalized.</p>
                )}

                {dayTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {dayTypes.map((type) => (
                      <Badge
                        key={type}
                        variant="outline"
                        className="text-xs capitalize rounded-full"
                      >
                        {type.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Nutrition summary */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Apple className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-gray-900">Nutrition Plan</h3>
                </div>
                {mealTypes.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {mealTypes.map((type) => (
                      <Badge
                        key={type}
                        className="bg-green-50 text-green-700 border-green-200 capitalize rounded-full"
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Your nutrition plan will be available in the Nutrition tab.</p>
                )}
                <p className="text-sm text-gray-600 mt-3">
                  Protein-first meals designed around your preferences and goals. No calorie counting required.
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(0)}
                className="flex-1 rounded-2xl"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(2)}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl"
              >
                Getting Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Getting Started Checklist */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Getting Started</h2>
              <p className="text-gray-500">Here's how to make the most of your program</p>
            </div>

            <div className="space-y-3">
              {GETTING_STARTED.map((item, i) => (
                <Card key={i} className="border-0 shadow-sm rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-pink-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 rounded-2xl"
              >
                Back
              </Button>
              <Button
                onClick={onComplete}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-6 text-lg rounded-2xl"
              >
                Let's Begin!
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
