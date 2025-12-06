import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Zap, 
  Shield, 
  Sparkles, 
  Target,
  Check,
  ChevronRight
} from "lucide-react";
import zoeImagePath from "@assets/zoe_1_1764958643553.png";

interface GoalsOnboardingProps {
  selectedGoals: string[];
  onGoalsChange: (goals: string[]) => void;
  variant?: "card" | "inline";
  showHeader?: boolean;
  className?: string;
}

const FITNESS_GOALS = [
  {
    id: "core-strength",
    label: "Rebuild Core Strength",
    description: "Strengthen your deep core muscles and heal diastasis recti",
    icon: Shield,
    color: "from-pink-500 to-rose-500"
  },
  {
    id: "energy",
    label: "Boost My Energy",
    description: "Combat fatigue and feel more energized throughout the day",
    icon: Zap,
    color: "from-amber-400 to-orange-500"
  },
  {
    id: "pain-relief",
    label: "Reduce Back Pain",
    description: "Ease lower back and pelvic discomfort through targeted exercises",
    icon: Heart,
    color: "from-red-400 to-pink-500"
  },
  {
    id: "confidence",
    label: "Feel Confident Again",
    description: "Reconnect with your body and build self-confidence",
    icon: Sparkles,
    color: "from-purple-400 to-pink-500"
  },
  {
    id: "flexibility",
    label: "Improve Flexibility",
    description: "Increase mobility and reduce muscle tightness",
    icon: Target,
    color: "from-teal-400 to-cyan-500"
  }
];

export default function GoalsOnboarding({
  selectedGoals,
  onGoalsChange,
  variant = "card",
  showHeader = true,
  className = ""
}: GoalsOnboardingProps) {
  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      onGoalsChange(selectedGoals.filter(g => g !== goalId));
    } else {
      onGoalsChange([...selectedGoals, goalId]);
    }
  };

  const content = (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-start gap-4 mb-6">
          <img 
            src={zoeImagePath} 
            alt="Coach Zoe" 
            className="w-16 h-16 rounded-full border-2 border-pink-200 object-cover flex-shrink-0"
          />
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">What are your recovery goals?</h3>
            <p className="text-gray-600 text-sm">
              Select all that apply - I'll personalize your experience based on what matters most to you, mama! 💕
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {FITNESS_GOALS.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          const Icon = goal.icon;
          
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center gap-4
                ${isSelected 
                  ? 'border-pink-500 bg-pink-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-sm'
                }`}
              data-testid={`goal-${goal.id}`}
            >
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${goal.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">{goal.label}</div>
                <p className="text-sm text-gray-500 line-clamp-1">{goal.description}</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                ${isSelected 
                  ? 'border-pink-500 bg-pink-500' 
                  : 'border-gray-300'
                }`}
              >
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {selectedGoals.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="font-medium text-pink-700">Your goals:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedGoals.map(goalId => {
              const goal = FITNESS_GOALS.find(g => g.id === goalId);
              return goal ? (
                <Badge 
                  key={goalId}
                  className="bg-pink-500 text-white hover:bg-pink-600"
                >
                  {goal.label}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );

  if (variant === "inline") {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={`border-pink-200 shadow-lg ${className}`}>
      <CardContent className="pt-6">
        {content}
      </CardContent>
    </Card>
  );
}

export { FITNESS_GOALS };
