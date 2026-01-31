import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Dumbbell, 
  Calendar, 
  Users, 
  MessageCircle, 
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Heart
} from "lucide-react";

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  tip: string;
}

const steps: OnboardingStep[] = [
  {
    icon: <Sparkles className="w-12 h-12 text-pink-500" />,
    title: "Welcome to Your Recovery Journey!",
    description: "This 6-week program is designed specifically for mamas like you. Let me show you around so you can get the most out of your experience.",
    tip: "You're taking an amazing step for yourself!"
  },
  {
    icon: <Dumbbell className="w-12 h-12 text-pink-500" />,
    title: "Today's Workout",
    description: "Your dashboard shows today's workout right at the top. Each week has 4 core workouts plus cardio and rest days. Tap the play button to start!",
    tip: "You can switch weeks using the dropdown if you need to preview or catch up."
  },
  {
    icon: <Calendar className="w-12 h-12 text-pink-500" />,
    title: "Track Your Progress",
    description: "After each workout, check in to log how you're feeling. Track your water intake, breathing practice, and more. Watch your streak grow!",
    tip: "Share your weekly progress with the community to celebrate together!"
  },
  {
    icon: <MessageCircle className="w-12 h-12 text-pink-500" />,
    title: "AI Coach Zoe",
    description: "Have questions about exercises or need alternatives? Tap 'AI Zoe' on your dashboard. I can suggest modifications and keep you motivated!",
    tip: "I'm here to help with anything related to your postpartum fitness journey."
  },
  {
    icon: <Users className="w-12 h-12 text-pink-500" />,
    title: "Join Our Community",
    description: "Connect with other mamas in the Community tab. Share your journey, celebrate wins, and support each other through the program.",
    tip: "Don't be shy - everyone here understands what you're going through!"
  },
  {
    icon: <Heart className="w-12 h-12 text-pink-500" />,
    title: "You're All Set!",
    description: "Remember, this is YOUR journey at YOUR pace. Listen to your body, celebrate small wins, and don't forget - you're already doing amazing just by being here.",
    tip: "Let's get started! Your first workout is waiting for you."
  }
];

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  userName?: string;
}

export function OnboardingModal({ isOpen, onComplete, userName }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSkip = () => {
    onComplete();
  };
  
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden" onPointerDownOutside={(e) => e.preventDefault()}>
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center mb-4">
              {step.icon}
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {isFirstStep && userName ? `Hi ${userName}! ${step.title}` : step.title}
            </h2>
            
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              {step.description}
            </p>
            
            <div className="bg-pink-100 rounded-lg p-3 w-full mb-6">
              <p className="text-pink-700 text-xs font-medium">
                💡 {step.tip}
              </p>
            </div>
            
            <div className="flex items-center gap-1 mb-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-pink-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex items-center justify-between w-full gap-3">
              {!isFirstStep ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  className="text-gray-500"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-gray-400"
                >
                  Skip Tour
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6"
              >
                {isLastStep ? "Let's Go!" : "Next"}
                {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
