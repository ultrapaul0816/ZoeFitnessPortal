import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Heart,
  Sun,
  Cloud,
  CloudRain,
  Zap,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  ChevronRight,
  X,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface DailyMoodPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userName?: string;
}

const moodOptions = [
  { value: "great", emoji: "😊", label: "Great!", color: "from-green-400 to-emerald-500", bgColor: "bg-green-50 hover:bg-green-100 border-green-200" },
  { value: "good", emoji: "🙂", label: "Good", color: "from-blue-400 to-cyan-500", bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
  { value: "okay", emoji: "😐", label: "Okay", color: "from-yellow-400 to-amber-500", bgColor: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200" },
  { value: "tired", emoji: "😴", label: "Tired", color: "from-purple-400 to-violet-500", bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200" },
  { value: "struggling", emoji: "😔", label: "Struggling", color: "from-pink-400 to-rose-500", bgColor: "bg-pink-50 hover:bg-pink-100 border-pink-200" },
];

const energyOptions = [
  { value: 1, emoji: "🪫", label: "Very Low", description: "Running on empty", color: "from-red-400 to-rose-500", bgColor: "bg-red-50 hover:bg-red-100 border-red-200" },
  { value: 2, emoji: "🔋", label: "Low", description: "Could use a rest", color: "from-orange-400 to-amber-500", bgColor: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
  { value: 3, emoji: "⚡", label: "Moderate", description: "Doing alright", color: "from-yellow-400 to-lime-500", bgColor: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200" },
  { value: 4, emoji: "✨", label: "Good", description: "Feeling energized", color: "from-green-400 to-emerald-500", bgColor: "bg-green-50 hover:bg-green-100 border-green-200" },
  { value: 5, emoji: "🚀", label: "High", description: "Ready to conquer!", color: "from-blue-400 to-cyan-500", bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
];

export default function DailyMoodPopup({
  isOpen,
  onClose,
  userId: propUserId,
  userName = "mama",
}: DailyMoodPopupProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const userId = propUserId || (() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        return JSON.parse(userData).id;
      }
    } catch {}
    return null;
  })();

  const saveMutation = useMutation({
    mutationFn: async (data: { mood: string; energyLevel: number }) => {
      if (!userId) throw new Error("User not found");
      const response = await apiRequest("POST", `/api/daily-checkins/${userId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-checkins", userId] });
      localStorage.setItem("lastMoodCheckinDate", new Date().toDateString());
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to save mood check-in",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (selectedMood && step === 1) {
      setCountdown(1);
    }
  }, [selectedMood]);

  useEffect(() => {
    if (selectedEnergy && step === 2) {
      setCountdown(1);
    }
  }, [selectedEnergy]);

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown === 0) {
      if (step === 1 && selectedMood) {
        setStep(2);
        setCountdown(null);
      } else if (step === 2 && selectedMood && selectedEnergy) {
        saveMutation.mutate({ mood: selectedMood, energyLevel: selectedEnergy });
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, step, selectedMood, selectedEnergy]);

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
  };

  const handleEnergySelect = (energy: number) => {
    setSelectedEnergy(energy);
  };

  const handleSkip = () => {
    localStorage.setItem("lastMoodCheckinDate", new Date().toDateString());
    onClose();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedMood(null);
    setSelectedEnergy(null);
    setCountdown(null);
    onClose();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-2xl">
        {step === 1 ? (
          <div className="relative">
            <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 p-6 text-white">
              <button 
                onClick={handleSkip}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                data-testid="button-skip-mood"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-6 h-6" />
                <span className="text-sm font-medium opacity-90">{getGreeting()}</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">
                Hey {userName}! 💗
              </h2>
              <p className="text-white/90 text-sm">
                How are you feeling today?
              </p>
            </div>
            
            <div className="p-6 bg-white">
              <div className="grid grid-cols-1 gap-3">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleMoodSelect(option.value)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedMood === option.value
                        ? `bg-gradient-to-r ${option.color} text-white border-transparent shadow-lg scale-[1.02]`
                        : `${option.bgColor} border-gray-100`
                    }`}
                    data-testid={`button-mood-${option.value}`}
                  >
                    <span className="text-3xl">{option.emoji}</span>
                    <span className={`font-semibold text-lg ${
                      selectedMood === option.value ? 'text-white' : 'text-gray-700'
                    }`}>
                      {option.label}
                    </span>
                    {selectedMood === option.value && countdown !== null && (
                      <div className="ml-auto flex items-center gap-2 text-white/90">
                        <span className="text-sm">Next in {countdown}s</span>
                        <ChevronRight className="w-4 h-4 animate-pulse" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              <p className="text-center text-xs text-gray-400 mt-4">
                This helps us understand how you're doing and personalize your experience
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 p-6 text-white">
              <button 
                onClick={handleSkip}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                data-testid="button-skip-energy"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-6 h-6" />
                <span className="text-sm font-medium opacity-90">Step 2 of 2</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">
                Energy Check ⚡
              </h2>
              <p className="text-white/90 text-sm">
                How's your energy level right now?
              </p>
            </div>
            
            <div className="p-6 bg-white">
              <div className="grid grid-cols-1 gap-3">
                {energyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleEnergySelect(option.value)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedEnergy === option.value
                        ? `bg-gradient-to-r ${option.color} text-white border-transparent shadow-lg scale-[1.02]`
                        : `${option.bgColor} border-gray-100`
                    }`}
                    data-testid={`button-energy-${option.value}`}
                  >
                    <span className="text-3xl">{option.emoji}</span>
                    <div className="text-left">
                      <span className={`font-semibold text-base block ${
                        selectedEnergy === option.value ? 'text-white' : 'text-gray-700'
                      }`}>
                        {option.label}
                      </span>
                      <span className={`text-sm ${
                        selectedEnergy === option.value ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {option.description}
                      </span>
                    </div>
                    {selectedEnergy === option.value && countdown !== null && (
                      <div className="ml-auto flex items-center gap-2 text-white/90">
                        <span className="text-sm">Saving...</span>
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                <div className="w-2 h-2 rounded-full bg-violet-500"></div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
