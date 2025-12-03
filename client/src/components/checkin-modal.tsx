import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { UserCheckin } from "@shared/schema";

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  userId: string;
  existingDeliveryDate?: string | null;
}

const MOOD_OPTIONS = [
  { value: "great", emoji: "😊", label: "Great", color: "from-green-400 to-emerald-500" },
  { value: "good", emoji: "🙂", label: "Good", color: "from-blue-400 to-cyan-500" },
  { value: "okay", emoji: "😐", label: "Okay", color: "from-yellow-400 to-amber-500" },
  { value: "tired", emoji: "😴", label: "Tired", color: "from-purple-400 to-violet-500" },
  { value: "struggling", emoji: "😔", label: "Struggling", color: "from-pink-400 to-rose-500" },
];

const ENERGY_OPTIONS = [
  { value: 5, label: "High Energy", emoji: "⚡", color: "from-green-400 to-emerald-500" },
  { value: 4, label: "Good Energy", emoji: "💪", color: "from-blue-400 to-cyan-500" },
  { value: 3, label: "Moderate", emoji: "🌟", color: "from-yellow-400 to-amber-500" },
  { value: 2, label: "Low Energy", emoji: "🌙", color: "from-purple-400 to-violet-500" },
  { value: 1, label: "Exhausted", emoji: "😴", color: "from-gray-400 to-slate-500" },
];


function calculatePostpartumWeeks(deliveryDate: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - deliveryDate.getTime();
  const weeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
  return Math.max(0, weeks);
}

export default function CheckinModal({
  isOpen,
  onClose,
  onSkip,
  userId,
  existingDeliveryDate,
}: CheckinModalProps) {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<string>("");
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [checkinId, setCheckinId] = useState<string | null>(null);
  const [wantsToUpdate, setWantsToUpdate] = useState(false);
  
  const { toast } = useToast();

  const totalSteps = 2;

  const { data: todayCheckin, isLoading: isLoadingTodayCheckin } = useQuery<UserCheckin | null>({
    queryKey: ["/api/checkins/today"],
    enabled: isOpen,
  });

  const hasCompletedToday = todayCheckin && !wantsToUpdate;

  const saveCheckinMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/checkins", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.id) {
        setCheckinId(data.id);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/checkins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/checkins/today"] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your check-in. Please try again.",
      });
    },
  });

  const updateCheckinMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PATCH", `/api/checkins/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checkins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/checkins/today"] });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/checkins/dismiss", {});
    },
    onSuccess: () => {
      onSkip();
    },
  });

  const saveProgressively = useCallback(async (stepData: any, isPartial: boolean = true) => {
    const postpartumWeeks = existingDeliveryDate 
      ? calculatePostpartumWeeks(new Date(existingDeliveryDate)) 
      : null;

    if (!checkinId) {
      saveCheckinMutation.mutate({
        ...stepData,
        postpartumWeeksAtCheckin: postpartumWeeks,
        isPartial,
      });
    } else {
      updateCheckinMutation.mutate({
        id: checkinId,
        data: { ...stepData, postpartumWeeksAtCheckin: postpartumWeeks, isPartial },
      });
    }
  }, [checkinId, existingDeliveryDate, saveCheckinMutation, updateCheckinMutation]);

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown <= 0) {
      setCountdown(null);
      advanceStep();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleMoodSelect = (value: string) => {
    setMood(value);
    saveProgressively({ mood: value }, true);
    setCountdown(1);
  };

  const handleEnergySelect = async (value: number) => {
    setEnergyLevel(value);
    
    const postpartumWeeks = existingDeliveryDate 
      ? calculatePostpartumWeeks(new Date(existingDeliveryDate)) 
      : null;

    const finalData = {
      mood: mood || null,
      energyLevel: value,
      postpartumWeeksAtCheckin: postpartumWeeks,
      isPartial: false,
    };

    if (checkinId) {
      await updateCheckinMutation.mutateAsync({ id: checkinId, data: finalData });
    } else {
      await saveCheckinMutation.mutateAsync(finalData);
    }

    toast({
      title: "Check-in Complete! 🌟",
      description: "Thank you for sharing how you're feeling today.",
    });
    onClose();
  };

  const cancelCountdown = () => {
    setCountdown(null);
  };

  const advanceStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    dismissMutation.mutate();
  };


  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">How are you feeling today?</h3>
            <p className="text-sm text-gray-500">Your wellbeing matters to us</p>
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleMoodSelect(option.value)}
                className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
                  mood === option.value
                    ? `bg-gradient-to-r ${option.color} text-white shadow-lg scale-105`
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
                data-testid={`button-mood-${option.value}`}
              >
                <span className="text-2xl mb-1">{option.emoji}</span>
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            ))}
          </div>

          {countdown !== null && mood && (
            <div className="text-center">
              <button 
                onClick={cancelCountdown}
                className="text-sm text-gray-500 hover:text-pink-500 transition-colors"
              >
                Moving in {countdown}s... <span className="underline">tap to stay</span>
              </button>
            </div>
          )}
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">How's your energy level?</h3>
            <p className="text-sm text-gray-500">This helps us understand your recovery</p>
          </div>
          
          <div className="space-y-2">
            {ENERGY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleEnergySelect(option.value)}
                className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 ${
                  energyLevel === option.value
                    ? `bg-gradient-to-r ${option.color} text-white shadow-lg`
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
                data-testid={`button-energy-${option.value}`}
              >
                <span className="text-xl mr-3">{option.emoji}</span>
                <span className="font-medium">{option.label}</span>
                {energyLevel === option.value && (
                  <Check className="w-5 h-5 ml-auto" />
                )}
              </button>
            ))}
          </div>

          {countdown !== null && energyLevel !== null && (
            <div className="text-center">
              <button 
                onClick={cancelCountdown}
                className="text-sm text-gray-500 hover:text-pink-500 transition-colors"
              >
                Moving in {countdown}s... <span className="underline">tap to stay</span>
              </button>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const getMoodEmoji = (moodValue: string | null | undefined) => {
    const option = MOOD_OPTIONS.find(m => m.value === moodValue);
    return option ? option.emoji : "";
  };

  const getEnergyEmoji = (energyValue: number | null | undefined) => {
    const option = ENERGY_OPTIONS.find(e => e.value === energyValue);
    return option ? option.emoji : "";
  };

  const renderCompletedTodayView = () => {
    if (!todayCheckin) return null;
    
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">You've Already Checked In Today!</h3>
          <p className="text-sm text-gray-500">Here's what you shared earlier:</p>
        </div>
        
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4 space-y-3 text-left">
          {todayCheckin.mood && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getMoodEmoji(todayCheckin.mood)}</span>
              <span className="text-gray-700 capitalize font-medium">{todayCheckin.mood}</span>
            </div>
          )}
          {todayCheckin.energyLevel && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getEnergyEmoji(todayCheckin.energyLevel)}</span>
              <span className="text-gray-700">
                {ENERGY_OPTIONS.find(e => e.value === todayCheckin.energyLevel)?.label || "Energy level " + todayCheckin.energyLevel}
              </span>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400">
          Want to update your check-in? You can do that below.
        </p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent 
        className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-hidden p-0 bg-white border border-gray-200/50 shadow-2xl"
        hideCloseButton
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Daily Check-in</DialogTitle>
          <DialogDescription>Share how you're feeling today</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            aria-label="Close check-in"
            data-testid="button-skip-checkin"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          {isLoadingTodayCheckin ? (
            <div className="px-6 py-12 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-gray-500 mt-4">Loading...</p>
            </div>
          ) : hasCompletedToday ? (
            <>
              <div className="px-6 pt-6 pb-6">
                {renderCompletedTodayView()}
              </div>
              <div className="px-6 pb-6 flex items-center justify-between gap-3 border-t border-gray-100 pt-4 bg-gray-50/50">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                  data-testid="button-close-checkin"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setWantsToUpdate(true);
                    setCheckinId(todayCheckin.id);
                    if (todayCheckin.mood) setMood(todayCheckin.mood);
                    if (todayCheckin.energyLevel) setEnergyLevel(todayCheckin.energyLevel);
                  }}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex items-center gap-2"
                  data-testid="button-update-checkin"
                >
                  <RefreshCw className="w-4 h-4" />
                  Update Check-in
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i + 1 === step
                          ? "w-8 bg-gradient-to-r from-pink-500 to-rose-500"
                          : i + 1 < step
                          ? "w-4 bg-pink-300"
                          : "w-4 bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-center text-xs text-gray-400">
                  Step {step} of {totalSteps}
                </p>
              </div>

              <div className="px-6 pb-6 overflow-y-auto max-h-[60vh]">
                {renderStep()}
              </div>

              <div className="px-6 pb-6 flex items-center justify-between gap-3 border-t border-gray-100 pt-4 bg-gray-50/50">
                {step > 1 ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      cancelCountdown();
                      setStep(step - 1);
                    }}
                    className="flex items-center gap-1"
                    data-testid="button-prev-step"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-gray-500 hover:text-gray-700"
                    disabled={dismissMutation.isPending}
                    data-testid="button-skip-later"
                  >
                    Maybe later
                  </Button>
                )}

                {step === 1 && (
                  <Button
                    onClick={() => {
                      cancelCountdown();
                      advanceStep();
                    }}
                    disabled={!mood}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex items-center gap-1"
                    data-testid="button-next-step"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
