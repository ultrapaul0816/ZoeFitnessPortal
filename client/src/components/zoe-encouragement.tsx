import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Star, RefreshCw, X } from "lucide-react";
import type { User } from "@shared/schema";

interface ZoeEncouragementProps {
  user?: User | null;
  context?: "dashboard" | "workout" | "progress" | "community" | "profile";
  variant?: "card" | "inline" | "banner";
  dismissible?: boolean;
  className?: string;
}

const greetings = [
  "Hey mama! 💕",
  "Hello beautiful! ✨",
  "Hi there, superstar! ⭐",
  "Hey gorgeous! 💪",
  "Welcome back, mama! 🌸",
];

const morningMessages = [
  "Starting your day with movement is such a gift to yourself. I'm proud of you! 🌅",
  "Good morning, mama! Today is a fresh start. What will you accomplish? ☀️",
  "Rise and shine! Your body is ready to get stronger today. 💪",
  "Morning workouts hit different! Let's make today count. 🌟",
];

const afternoonMessages = [
  "Taking time for yourself in the afternoon - that's self-care gold! ⭐",
  "Midday movement is perfect for resetting your energy. Let's go! 💫",
  "You're showing up for yourself today. That takes real strength. 💪",
  "Afternoon check-in! Remember: progress over perfection, always. 🌸",
];

const eveningMessages = [
  "Winding down with some gentle movement? Perfect way to end the day. 🌙",
  "Evening mama time! You deserve this moment for yourself. ✨",
  "Finishing the day strong - I love that energy! 💕",
  "Take a breath. You did great today, no matter what. You showed up. 🌟",
];

const motivationalTips = [
  { tip: "Remember: Your core is more than abs. It's your foundation for everything!", icon: Star },
  { tip: "Breathe with intention. Your breath is your most powerful tool.", icon: Sparkles },
  { tip: "Progress isn't linear. Some days feel hard, and that's completely normal.", icon: Heart },
  { tip: "Rest days are growth days. Your body heals and strengthens while resting.", icon: Star },
  { tip: "Consistency beats intensity. Show up, even for 5 minutes.", icon: Sparkles },
  { tip: "Listen to your body. It knows what it needs today.", icon: Heart },
  { tip: "You're not starting over - you're starting from experience.", icon: Star },
  { tip: "Comparison is the thief of joy. Your journey is uniquely yours.", icon: Sparkles },
  { tip: "Small steps lead to big transformations. Keep going, mama!", icon: Heart },
  { tip: "Your postpartum body created life. Honor it with patience and love.", icon: Star },
];

const workoutEncouragement = [
  "You've got this! Every rep is building a stronger you. 💪",
  "Focus on form over speed. Quality movements = quality results.",
  "Feeling the burn? That's your body getting stronger!",
  "Take modifications if needed - that's not weakness, it's wisdom.",
  "Breathe through it. You're doing amazing, mama!",
];

const progressCelebrations = [
  "Look how far you've come! Every workout counts. 🎉",
  "Your dedication is inspiring. Keep crushing it! ⭐",
  "Progress happens one day at a time. You're proof of that! 💕",
  "Celebrate every win - big or small. You earned this!",
];

function getTimeOfDay(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getPersonalizedMessage(user?: User | null, context?: string): string {
  const timeOfDay = getTimeOfDay();
  
  let messagePool: string[];
  switch (timeOfDay) {
    case "morning":
      messagePool = morningMessages;
      break;
    case "afternoon":
      messagePool = afternoonMessages;
      break;
    default:
      messagePool = eveningMessages;
  }
  
  if (context === "workout") {
    messagePool = workoutEncouragement;
  } else if (context === "progress") {
    messagePool = progressCelebrations;
  }
  
  return getRandomItem(messagePool);
}

export default function ZoeEncouragement({ 
  user, 
  context = "dashboard", 
  variant = "card",
  dismissible = true,
  className = ""
}: ZoeEncouragementProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentTip, setCurrentTip] = useState(() => getRandomItem(motivationalTips));
  const [greeting] = useState(() => getRandomItem(greetings));
  const [message, setMessage] = useState(() => getPersonalizedMessage(user, context));

  // Auto-retract the daily tip after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);
    
    return () => clearTimeout(timer);
  }, []);

  const refreshTip = () => {
    setCurrentTip(getRandomItem(motivationalTips));
    setMessage(getPersonalizedMessage(user, context));
  };

  if (!isVisible) return null;

  const TipIcon = currentTip.icon;

  if (variant === "inline") {
    return (
      <div className={`flex items-start gap-3 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100 ${className}`}>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center flex-shrink-0">
          <TipIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-pink-700">{greeting}</p>
          <p className="text-sm text-gray-700 mt-1">{currentTip.tip}</p>
        </div>
        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            onClick={() => setIsVisible(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white px-4 py-3 rounded-xl ${className}`}>
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium">{message}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
              onClick={refreshTip}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            {dismissible && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setIsVisible(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`overflow-hidden border-pink-100 ${className}`}>
      <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 p-1">
        <CardContent className="bg-white rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-200">
                <span className="text-lg">👩‍🏫</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  Coach Zoe
                  <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">
                    Daily Tip
                  </span>
                </h3>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-pink-500"
                    onClick={refreshTip}
                    title="Get new tip"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  {dismissible && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                      onClick={() => setIsVisible(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <p className="text-gray-700 mt-2 leading-relaxed">
                <span className="text-pink-600 font-medium">{greeting}</span>{" "}
                {currentTip.tip}
              </p>
              
              <p className="text-sm text-gray-500 mt-3 italic">
                {message}
              </p>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

export function ZoeQuickTip({ className = "" }: { className?: string }) {
  const [tip] = useState(() => getRandomItem(motivationalTips));
  const TipIcon = tip.icon;
  
  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
        <TipIcon className="w-3 h-3 text-pink-500" />
      </div>
      <p className="text-gray-600 italic">"{tip.tip}"</p>
      <span className="text-pink-500">- Zoe</span>
    </div>
  );
}

export function ZoeCelebration({ 
  message = "Amazing work, mama! 🎉",
  subMessage = "You're building strength one day at a time.",
  onDismiss
}: { 
  message?: string;
  subMessage?: string;
  onDismiss?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
          <span className="text-4xl">🎉</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{message}</h2>
        <p className="text-gray-600 mb-6">{subMessage}</p>
        <Button 
          className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8"
          onClick={onDismiss}
        >
          Thanks, Zoe! 💕
        </Button>
      </div>
    </div>
  );
}
