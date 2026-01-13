import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Sun,
  Zap,
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
      <DialogContent className="max-w-sm p-0 overflow-hidden border-0 shadow-2xl rounded-3xl [&>button]:hidden">
        {step === 1 ? (
          <div className="relative">
            {/* Header - matching expiry notification style */}
            <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 px-5 py-5 text-white relative overflow-hidden rounded-t-3xl">
              {/* Decorative circles */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
              
              {/* Close button - matching expiry notification style */}
              <button 
                onClick={handleSkip}
                className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all duration-200 backdrop-blur-sm"
                data-testid="button-skip-mood"
                aria-label="Skip"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Sun className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">{getGreeting()}</span>
                </div>
                <h2 className="text-xl font-bold">
                  Hey {userName}! 💗
                </h2>
                <p className="text-white/90 text-sm mt-1">
                  How are you feeling today?
                </p>
              </div>
            </div>
            
            {/* Content - more compact */}
            <div className="p-4 bg-white max-h-[50vh] overflow-y-auto rounded-b-3xl">
              <div className="grid grid-cols-1 gap-2">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleMoodSelect(option.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${
                      selectedMood === option.value
                        ? `bg-gradient-to-r ${option.color} text-white border-transparent shadow-lg scale-[1.02]`
                        : `${option.bgColor} border-gray-100`
                    }`}
                    data-testid={`button-mood-${option.value}`}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className={`font-semibold text-base ${
                      selectedMood === option.value ? 'text-white' : 'text-gray-700'
                    }`}>
                      {option.label}
                    </span>
                    {selectedMood === option.value && countdown !== null && (
                      <div className="ml-auto flex items-center gap-1 text-white/90">
                        <span className="text-xs">Next</span>
                        <ChevronRight className="w-4 h-4 animate-pulse" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              <p className="text-center text-xs text-gray-400 mt-3">
                This helps personalize your experience
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Header - step 2 */}
            <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 px-5 py-5 text-white relative overflow-hidden rounded-t-3xl">
              {/* Decorative circles */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
              
              {/* Close button */}
              <button 
                onClick={handleSkip}
                className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all duration-200 backdrop-blur-sm"
                data-testid="button-skip-energy"
                aria-label="Skip"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Step 2 of 2</span>
                </div>
                <h2 className="text-xl font-bold">
                  Energy Check ⚡
                </h2>
                <p className="text-white/90 text-sm mt-1">
                  How's your energy level?
                </p>
              </div>
            </div>
            
            {/* Content - more compact */}
            <div className="p-4 bg-white max-h-[50vh] overflow-y-auto rounded-b-3xl">
              <div className="grid grid-cols-1 gap-2">
                {energyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleEnergySelect(option.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${
                      selectedEnergy === option.value
                        ? `bg-gradient-to-r ${option.color} text-white border-transparent shadow-lg scale-[1.02]`
                        : `${option.bgColor} border-gray-100`
                    }`}
                    data-testid={`button-energy-${option.value}`}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <div className="text-left">
                      <span className={`font-semibold text-sm block ${
                        selectedEnergy === option.value ? 'text-white' : 'text-gray-700'
                      }`}>
                        {option.label}
                      </span>
                      <span className={`text-xs ${
                        selectedEnergy === option.value ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {option.description}
                      </span>
                    </div>
                    {selectedEnergy === option.value && countdown !== null && (
                      <div className="ml-auto flex items-center gap-1 text-white/90">
                        <span className="text-xs">Saving</span>
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center justify-center gap-2 mt-3">
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
